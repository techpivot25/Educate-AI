import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  CheckCircle2,
  Clock,
  Coffee,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { SubjectIcon } from '../common/SubjectIcon';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  autoStartNext: boolean;
  soundEnabled: boolean;
}

interface SessionLogEntry {
  id: string;
  subject: string;
  goal: string;
  minutes: number;
  completedAt: string;
  mode: 'focus';
}

interface PersistedTimerState {
  dateKey: string;
  mode: TimerMode;
  isRunning: boolean;
  endTimestamp: number | null;
  remainingMs: number;
  completedInCycle: number;
  selectedSubject: string;
  focusGoal: string;
  settings: PomodoroSettings;
  todayLogs: SessionLogEntry[];
}

interface PomodoroStudyTimerProps {
  subjects: string[];
}

const STORAGE_KEY = 'pivot_iq_pomodoro_timer_v1';

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  autoStartNext: false,
  soundEnabled: true,
};

const getTodayKey = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDurationMs = (mode: TimerMode, settings: PomodoroSettings): number => {
  if (mode === 'focus') return Math.max(1, settings.focusMinutes) * 60 * 1000;
  if (mode === 'shortBreak') return Math.max(1, settings.shortBreakMinutes) * 60 * 1000;
  return Math.max(1, settings.longBreakMinutes) * 60 * 1000;
};

const formatClock = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const MODE_META: Record<
  TimerMode,
  {
    label: string;
    subtitle: string;
    ringColor: string;
    accentText: string;
  }
> = {
  focus: {
    label: 'Focus Session',
    subtitle: 'Deep concentration block',
    ringColor: '#00A896',
    accentText: 'text-[#00A896] dark:text-teal-400',
  },
  shortBreak: {
    label: 'Short Break',
    subtitle: 'Rest eyes and stretch',
    ringColor: '#0284C7',
    accentText: 'text-sky-600 dark:text-sky-400',
  },
  longBreak: {
    label: 'Long Break',
    subtitle: 'Recharge after 4 sessions',
    ringColor: '#6366F1',
    accentText: 'text-indigo-600 dark:text-indigo-400',
  },
};

const playCompletionChime = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.11, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.48);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1000);
  } catch {
    // Audio playback blocked or unavailable
  }
};

export const PomodoroStudyTimer: React.FC<PomodoroStudyTimerProps> = ({ subjects }) => {
  const uniqueSubjects = useMemo(() => {
    const cleaned = Array.from(new Set(subjects.filter(Boolean)));
    return cleaned.length > 0 ? cleaned : ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
  }, [subjects]);

  const loadInitialState = (): PersistedTimerState => {
    const today = getTodayKey();
    const fallback: PersistedTimerState = {
      dateKey: today,
      mode: 'focus',
      isRunning: false,
      endTimestamp: null,
      remainingMs: DEFAULT_SETTINGS.focusMinutes * 60 * 1000,
      completedInCycle: 0,
      selectedSubject: uniqueSubjects[0],
      focusGoal: '',
      settings: DEFAULT_SETTINGS,
      todayLogs: [],
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as Partial<PersistedTimerState>;
      const settings: PomodoroSettings = {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
      };
      const isSameDay = parsed.dateKey === today;
      const mode: TimerMode =
        parsed.mode === 'shortBreak' || parsed.mode === 'longBreak' ? parsed.mode : 'focus';

      let remainingMs =
        typeof parsed.remainingMs === 'number' && parsed.remainingMs > 0
          ? parsed.remainingMs
          : getDurationMs(mode, settings);
      let isRunning = Boolean(parsed.isRunning);
      let endTimestamp = typeof parsed.endTimestamp === 'number' ? parsed.endTimestamp : null;

      let completedInCycle =
        isSameDay && typeof parsed.completedInCycle === 'number' ? parsed.completedInCycle : 0;
      let todayLogs = isSameDay && Array.isArray(parsed.todayLogs) ? parsed.todayLogs : [];
      let activeMode = mode;

      if (isRunning && endTimestamp) {
        const delta = endTimestamp - Date.now();
        if (delta > 0) {
          remainingMs = delta;
        } else {
          const completedTimestamp = endTimestamp;
          isRunning = false;
          endTimestamp = null;
          if (activeMode === 'focus') {
            const subj =
              parsed.selectedSubject && uniqueSubjects.includes(parsed.selectedSubject)
                ? parsed.selectedSubject
                : uniqueSubjects[0];
            const goal =
              typeof parsed.focusGoal === 'string' && parsed.focusGoal.trim()
                ? parsed.focusGoal.trim()
                : `${subj} Study Block`;
            const entry: SessionLogEntry = {
              id: `pom-${Date.now()}`,
              subject: subj,
              goal,
              minutes: settings.focusMinutes,
              completedAt: new Date(completedTimestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              mode: 'focus',
            };
            todayLogs = [entry, ...todayLogs].slice(0, 12);
            const nextCount = completedInCycle + 1;
            if (nextCount >= 4) {
              completedInCycle = 0;
              activeMode = 'longBreak';
            } else {
              completedInCycle = nextCount;
              activeMode = 'shortBreak';
            }
          } else {
            activeMode = 'focus';
          }
          remainingMs = getDurationMs(activeMode, settings);
        }
      }

      return {
        dateKey: today,
        mode: activeMode,
        isRunning,
        endTimestamp,
        remainingMs,
        completedInCycle,
        selectedSubject:
          parsed.selectedSubject && uniqueSubjects.includes(parsed.selectedSubject)
            ? parsed.selectedSubject
            : uniqueSubjects[0],
        focusGoal: typeof parsed.focusGoal === 'string' ? parsed.focusGoal : '',
        settings,
        todayLogs,
      };
    } catch {
      return fallback;
    }
  };

  const initialRef = useRef<PersistedTimerState | null>(null);
  if (!initialRef.current) {
    initialRef.current = loadInitialState();
  }

  const [mode, setMode] = useState<TimerMode>(initialRef.current.mode);
  const [settings, setSettings] = useState<PomodoroSettings>(initialRef.current.settings);
  const [isRunning, setIsRunning] = useState<boolean>(initialRef.current.isRunning);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(initialRef.current.endTimestamp);
  const [remainingMs, setRemainingMs] = useState<number>(initialRef.current.remainingMs);
  const [completedInCycle, setCompletedInCycle] = useState<number>(initialRef.current.completedInCycle);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialRef.current.selectedSubject);
  const [focusGoal, setFocusGoal] = useState<string>(initialRef.current.focusGoal);
  const [todayLogs, setTodayLogs] = useState<SessionLogEntry[]>(initialRef.current.todayLogs);
  const [showSettings, setShowSettings] = useState(false);
  const [completionNotice, setCompletionNotice] = useState<string | null>(null);

  const baseTitleRef = useRef<string>(typeof document !== 'undefined' ? document.title : 'PivotIQ');

  // Keep selectedSubject valid when grade/board subject list updates
  useEffect(() => {
    if (!uniqueSubjects.includes(selectedSubject)) {
      setSelectedSubject(uniqueSubjects[0]);
    }
  }, [uniqueSubjects, selectedSubject]);

  // Persist timer state to localStorage
  useEffect(() => {
    try {
      const payload: PersistedTimerState = {
        dateKey: getTodayKey(),
        mode,
        isRunning,
        endTimestamp,
        remainingMs,
        completedInCycle,
        selectedSubject,
        focusGoal,
        settings,
        todayLogs,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota issues
    }
  }, [
    mode,
    isRunning,
    endTimestamp,
    remainingMs,
    completedInCycle,
    selectedSubject,
    focusGoal,
    settings,
    todayLogs,
  ]);

  const completePhase = useCallback(
    (triggeredNaturally: boolean) => {
      if (triggeredNaturally && settings.soundEnabled) {
        playCompletionChime();
      }

      if (mode === 'focus') {
        const nextCycleCount = completedInCycle + 1;
        const shouldLongBreak = nextCycleCount >= 4;
        const nextMode: TimerMode = shouldLongBreak ? 'longBreak' : 'shortBreak';
        const nextDuration = getDurationMs(nextMode, settings);

        if (triggeredNaturally) {
          const entry: SessionLogEntry = {
            id: `pom-${Date.now()}`,
            subject: selectedSubject,
            goal: focusGoal.trim() || `${selectedSubject} Study Block`,
            minutes: settings.focusMinutes,
            completedAt: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            mode: 'focus',
          };
          setTodayLogs((prev) => [entry, ...prev].slice(0, 12));
          setCompletionNotice(
            shouldLongBreak
              ? `Completed ${settings.focusMinutes} min of ${selectedSubject}. Take a ${settings.longBreakMinutes} min long break.`
              : `Completed ${settings.focusMinutes} min of ${selectedSubject}. Time for a ${settings.shortBreakMinutes} min break.`
          );
        }

        setCompletedInCycle(shouldLongBreak ? 0 : nextCycleCount);
        setMode(nextMode);
        setRemainingMs(nextDuration);
        if (triggeredNaturally && settings.autoStartNext) {
          setEndTimestamp(Date.now() + nextDuration);
          setIsRunning(true);
        } else {
          setEndTimestamp(null);
          setIsRunning(false);
        }
      } else {
        const nextDuration = getDurationMs('focus', settings);
        if (triggeredNaturally) {
          setCompletionNotice('Break complete. Ready for your next focus session.');
        }
        setMode('focus');
        setRemainingMs(nextDuration);
        if (triggeredNaturally && settings.autoStartNext) {
          setEndTimestamp(Date.now() + nextDuration);
          setIsRunning(true);
        } else {
          setEndTimestamp(null);
          setIsRunning(false);
        }
      }
    },
    [mode, completedInCycle, settings, selectedSubject, focusGoal]
  );

  // Accurate wall-clock tick
  useEffect(() => {
    if (!isRunning || !endTimestamp) return;

    const tick = () => {
      const nextRemaining = endTimestamp - Date.now();
      if (nextRemaining <= 0) {
        completePhase(true);
      } else {
        setRemainingMs(nextRemaining);
      }
    };

    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [isRunning, endTimestamp, completePhase]);

  // Update browser tab title while active, restore on pause/unmount
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isRunning) {
      document.title = `${formatClock(remainingMs)} · ${MODE_META[mode].label} — PivotIQ`;
    } else {
      document.title = baseTitleRef.current;
    }
    return () => {
      document.title = baseTitleRef.current;
    };
  }, [isRunning, remainingMs, mode]);

  // Clear completion notice after 6 seconds
  useEffect(() => {
    if (!completionNotice) return;
    const timer = window.setTimeout(() => setCompletionNotice(null), 6000);
    return () => window.clearTimeout(timer);
  }, [completionNotice]);

  const handleStartPause = () => {
    setCompletionNotice(null);
    if (isRunning) {
      const left = endTimestamp ? Math.max(0, endTimestamp - Date.now()) : remainingMs;
      setRemainingMs(left);
      setEndTimestamp(null);
      setIsRunning(false);
    } else {
      const target = Date.now() + Math.max(1000, remainingMs);
      setEndTimestamp(target);
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setEndTimestamp(null);
    setCompletionNotice(null);
    setRemainingMs(getDurationMs(mode, settings));
  };

  const handleSwitchMode = (nextMode: TimerMode) => {
    setIsRunning(false);
    setEndTimestamp(null);
    setCompletionNotice(null);
    setMode(nextMode);
    setRemainingMs(getDurationMs(nextMode, settings));
  };

  const handleSkip = () => {
    completePhase(false);
  };

  const handleUpdateDuration = (
    key: 'focusMinutes' | 'shortBreakMinutes' | 'longBreakMinutes',
    rawValue: number
  ) => {
    const clamped = Math.min(90, Math.max(1, Number.isFinite(rawValue) ? rawValue : 1));
    const nextSettings = { ...settings, [key]: clamped };
    setSettings(nextSettings);
    if (!isRunning) {
      if (
        (key === 'focusMinutes' && mode === 'focus') ||
        (key === 'shortBreakMinutes' && mode === 'shortBreak') ||
        (key === 'longBreakMinutes' && mode === 'longBreak')
      ) {
        setRemainingMs(clamped * 60 * 1000);
      }
    }
  };

  const applyPreset = (focusMin: number, shortMin: number, longMin: number) => {
    const nextSettings: PomodoroSettings = {
      ...settings,
      focusMinutes: focusMin,
      shortBreakMinutes: shortMin,
      longBreakMinutes: longMin,
    };
    setSettings(nextSettings);
    setIsRunning(false);
    setEndTimestamp(null);
    setRemainingMs(getDurationMs(mode, nextSettings));
  };

  const totalDurationMs = getDurationMs(mode, settings);
  const progressRatio = Math.min(1, Math.max(0, 1 - remainingMs / totalDurationMs));
  const ringRadius = 82;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference * (1 - progressRatio);

  const totalFocusMinutesToday = todayLogs.reduce((acc, item) => acc + item.minutes, 0);
  const activeMeta = MODE_META[mode];

  return (
    <section
      aria-label="Pomodoro Study Timer"
      className="font-lollipop-regular w-full bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs transition-colors space-y-5"
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <SubjectIcon subject={selectedSubject} size="sm" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-normal text-slate-900 dark:text-white tracking-wide truncate">
              Pomodoro Study Timer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-300 flex flex-wrap items-center gap-2">
              <span className="tabular-nums">
                {todayLogs.length} {todayLogs.length === 1 ? 'session' : 'sessions'} today
              </span>
              <span aria-hidden="true">&middot;</span>
              <span className="tabular-nums">{totalFocusMinutesToday} min focused</span>
              <span aria-hidden="true">&middot;</span>
              <span className="tabular-nums">Cycle {completedInCycle}/4</span>
            </p>
          </div>
        </div>

        {/* Mode Switcher Segmented Control */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Timer session mode"
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80"
          >
            {(
              [
                { id: 'focus', label: `Focus · ${settings.focusMinutes}m` },
                { id: 'shortBreak', label: `Short Break · ${settings.shortBreakMinutes}m` },
                { id: 'longBreak', label: `Long Break · ${settings.longBreakMinutes}m` },
              ] as const
            ).map((item) => {
              const active = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleSwitchMode(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
            aria-label={settings.soundEnabled ? 'Mute timer chime' : 'Enable timer chime'}
            title={settings.soundEnabled ? 'Sound On' : 'Sound Muted'}
            className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer shrink-0"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowSettings((prev) => !prev)}
            aria-expanded={showSettings}
            aria-label="Customize timer intervals"
            className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Intervals</span>
          </button>
        </div>
      </div>

      {/* Inline Interval Customization Drawer */}
      {showSettings && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-700 dark:text-white">
              Customize session lengths (minutes)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => applyPreset(25, 5, 15)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                Classic 25 / 5
              </button>
              <button
                type="button"
                onClick={() => applyPreset(50, 10, 20)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                Deep Work 50 / 10
              </button>
              <button
                type="button"
                onClick={() => applyPreset(15, 3, 10)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                Quick Sprint 15 / 3
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <label className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <span>Focus (min)</span>
              <input
                type="number"
                min={1}
                max={90}
                value={settings.focusMinutes}
                onChange={(e) => handleUpdateDuration('focusMinutes', Number(e.target.value))}
                className="w-full tabular-nums bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
              />
            </label>

            <label className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <span>Short Break (min)</span>
              <input
                type="number"
                min={1}
                max={45}
                value={settings.shortBreakMinutes}
                onChange={(e) => handleUpdateDuration('shortBreakMinutes', Number(e.target.value))}
                className="w-full tabular-nums bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
              />
            </label>

            <label className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <span>Long Break (min)</span>
              <input
                type="number"
                min={1}
                max={60}
                value={settings.longBreakMinutes}
                onChange={(e) => handleUpdateDuration('longBreakMinutes', Number(e.target.value))}
                className="w-full tabular-nums bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
              />
            </label>

            <label className="flex items-center gap-2 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.autoStartNext}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, autoStartNext: e.target.checked }))
                }
                className="rounded border-slate-300 text-[#00A896] focus:ring-[#00A896]"
              />
              <span>Auto-start next phase</span>
            </label>
          </div>
        </div>
      )}

      {/* Completion Banner */}
      {completionNotice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-xs text-emerald-800 dark:text-emerald-200"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{completionNotice}</span>
          </span>
          <button
            type="button"
            onClick={() => setCompletionNotice(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Two-Zone Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Zone: Circular Dial + Primary Controls */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center py-2 space-y-4">
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" aria-hidden="true">
              <circle
                cx="100"
                cy="100"
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="100"
                cy="100"
                r={ringRadius}
                fill="none"
                stroke={activeMeta.ringColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-300 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <span className={`text-xs flex items-center gap-1.5 ${activeMeta.accentText}`}>
                {mode === 'focus' ? (
                  <BookOpen className="w-3.5 h-3.5" />
                ) : (
                  <Coffee className="w-3.5 h-3.5" />
                )}
                <span>{activeMeta.label}</span>
              </span>

              <div
                aria-live="polite"
                className="text-4xl sm:text-[42px] tabular-nums tracking-tight text-slate-900 dark:text-white my-1 leading-none"
              >
                {formatClock(remainingMs)}
              </div>

              <span className="text-[11px] text-slate-500 dark:text-slate-300 truncate max-w-[140px]">
                {isRunning ? 'In progress' : activeMeta.subtitle}
              </span>
            </div>
          </div>

          {/* 4-Pomodoro Cycle Indicators */}
          <div className="flex items-center gap-2" aria-label={`Cycle ${completedInCycle} of 4 completed`}>
            {[0, 1, 2, 3].map((idx) => {
              const filled = idx < completedInCycle;
              const current = idx === completedInCycle && mode === 'focus';
              return (
                <span
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    filled
                      ? 'w-6 bg-[#00A896]'
                      : current
                      ? 'w-6 bg-slate-300 dark:bg-slate-600'
                      : 'w-2.5 bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              );
            })}
          </div>

          {/* Playback Controls (Light Grey Palette) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleStartPause}
              className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer shadow-xs"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>
                    {remainingMs < totalDurationMs
                      ? 'Resume'
                      : mode === 'focus'
                      ? 'Start Focus'
                      : 'Start Break'}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset timer"
              title="Reset"
              className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSkip}
              aria-label="Skip to next phase"
              title="Skip phase"
              className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip</span>
            </button>
          </div>
        </div>

        {/* Right Zone: Study Focus Subject, Target Goal, and Today's Completed Log */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="pomodoro-subject-select"
                className="text-xs text-slate-600 dark:text-slate-300 block"
              >
                Study Subject
              </label>
              <select
                id="pomodoro-subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
              >
                {uniqueSubjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="pomodoro-focus-goal"
                className="text-xs text-slate-600 dark:text-slate-300 block"
              >
                Session Goal (optional)
              </label>
              <input
                id="pomodoro-focus-goal"
                type="text"
                value={focusGoal}
                onChange={(e) => setFocusGoal(e.target.value)}
                placeholder="e.g., Solve 10 Quadratic Equations"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
              />
            </div>
          </div>

          {/* Today's Completed Focus Sessions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs text-slate-700 dark:text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00A896]" />
                <span>Today&apos;s Completed Sessions</span>
              </h4>

              {todayLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setTodayLogs([]);
                    setCompletedInCycle(0);
                  }}
                  className="text-[11px] text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Log</span>
                </button>
              )}
            </div>

            {todayLogs.length === 0 ? (
              <div className="py-5 px-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/70 text-center text-xs text-slate-500 dark:text-slate-300">
                Complete a focus block to record your subject progress here. Every 4 sessions unlocks a long break.
              </div>
            ) : (
              <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                {todayLogs.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <SubjectIcon subject={entry.subject} size="xs" />
                      <div className="min-w-0">
                        <p className="text-slate-900 dark:text-white truncate">{entry.goal}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-300 flex items-center gap-1.5">
                          <span>{entry.subject}</span>
                          <span aria-hidden="true">&middot;</span>
                          <span className="tabular-nums">{entry.minutes} min</span>
                          <span aria-hidden="true">&middot;</span>
                          <span className="tabular-nums">{entry.completedAt}</span>
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
