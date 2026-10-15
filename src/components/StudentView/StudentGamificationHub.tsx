import React, { useState, useEffect } from 'react';
import {
  Flame,
  Zap,
  Award,
  Shield,
  CheckCircle2,
  Trophy,
  Sparkles,
  Calendar,
  X,
  ChevronRight,
  TrendingUp,
  Info,
} from 'lucide-react';

interface GamificationState {
  streakDays: number;
  xpPoints: number;
  dailyXpCurrent: number;
  dailyXpGoal: number;
  streakFreezeCount: number;
  streakFreezeEquipped: boolean;
  claimedBonusToday: boolean;
  level: number;
  league: string;
}

const DEFAULT_STATE: GamificationState = {
  streakDays: 14,
  xpPoints: 1420,
  dailyXpCurrent: 45,
  dailyXpGoal: 50,
  streakFreezeCount: 2,
  streakFreezeEquipped: true,
  claimedBonusToday: false,
  level: 4,
  league: 'Emerald League (Top 3%)',
};

const WEEK_DAYS = [
  { day: 'Mon', completed: true, xp: 60 },
  { day: 'Tue', completed: true, xp: 55 },
  { day: 'Wed', completed: true, xp: 70 },
  { day: 'Thu', completed: true, xp: 50 },
  { day: 'Fri', completed: true, xp: 45, isToday: true },
  { day: 'Sat', completed: false, xp: 0 },
  { day: 'Sun', completed: false, xp: 0 },
];

const BADGES = [
  { id: 'b1', name: '3-Day Spark', desc: 'First study momentum', icon: '🔥', unlocked: true },
  { id: 'b2', name: '7-Day Scholar', desc: 'Full week consistency', icon: '⚡', unlocked: true },
  { id: 'b3', name: '14-Day Sprint Master', desc: 'Two weeks uninterrupted', icon: '🏆', unlocked: true },
  { id: 'b4', name: '30-Day Legend', desc: 'Monthly study discipline', icon: '👑', unlocked: false, progress: '14/30' },
  { id: 'b5', name: 'Formula Alchemist', desc: '10 master formulas solved', icon: '🧪', unlocked: true },
  { id: 'b6', name: 'Socratic Thinker', desc: '5 AI tutor deep dives', icon: '🧠', unlocked: true },
];

export const StudentGamificationHub: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'streak' | 'xp' | 'badges'>('streak');
  const [confettiActive, setConfettiActive] = useState(false);

  const [state, setState] = useState<GamificationState>(() => {
    try {
      const saved = localStorage.getItem('educate_ai_gamification_state');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem('educate_ai_gamification_state', JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const handleClaimBonus = () => {
    if (state.claimedBonusToday) return;
    setConfettiActive(true);
    setState((prev) => ({
      ...prev,
      xpPoints: prev.xpPoints + 25,
      dailyXpCurrent: Math.min(prev.dailyXpGoal, prev.dailyXpCurrent + 25),
      claimedBonusToday: true,
    }));
    setTimeout(() => setConfettiActive(false), 3000);
  };

  const handleToggleFreeze = () => {
    setState((prev) => ({
      ...prev,
      streakFreezeEquipped: !prev.streakFreezeEquipped,
    }));
  };

  return (
    <>
      {/* =========================================================================
          TOP BAR WIDGETS (Duolingo Style: Flame Streak & XP Pills)
          ========================================================================= */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* 1. Daily Streak Widget */}
        <button
          onClick={() => {
            setActiveTab('streak');
            setIsOpen(true);
          }}
          className="group relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-amber-500/15 border border-amber-400/40 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 hover:border-amber-500 shadow-2xs hover:shadow-xs hover:scale-102 transition-all cursor-pointer"
          title="Daily Learning Streak - Click to view Streak Calendar & Shields"
        >
          <div className="relative">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-black tracking-tight text-amber-700 dark:text-amber-300">
              {state.streakDays}
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hidden md:inline">
              Days
            </span>
          </div>
        </button>

        {/* 2. XP Points Widget */}
        <button
          onClick={() => {
            setActiveTab('xp');
            setIsOpen(true);
          }}
          className="group relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-teal-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-teal-500/15 border border-indigo-400/40 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 hover:border-indigo-500 shadow-2xs hover:shadow-xs hover:scale-102 transition-all cursor-pointer"
          title="Total XP Points & Learning Level - Click for Quest Details"
        >
          <Zap className="w-4 h-4 fill-indigo-500 text-indigo-500" />
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-black tracking-tight text-indigo-700 dark:text-indigo-200">
              {state.xpPoints.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 hidden xl:inline">
              XP
            </span>
          </div>

          {/* Mini daily progress indicator */}
          <div className="hidden sm:flex items-center w-8 h-1.5 bg-indigo-200 dark:bg-indigo-950/60 rounded-full overflow-hidden ml-1">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (state.dailyXpCurrent / state.dailyXpGoal) * 100)}%` }}
            />
          </div>
        </button>
      </div>

      {/* =========================================================================
          INTERACTIVE DUOLINGO-STYLE GAMIFICATION MODAL
          ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-xl bg-white dark:bg-[#0E1A2D] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header banner with playful flame & XP gradient */}
            <div className="relative p-6 bg-gradient-to-br from-[#0D1B3E] via-[#162746] to-[#0A1526] text-white border-b border-slate-800 overflow-hidden">
              {/* Decorative background glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 text-white">
                    <Flame className="w-7 h-7 fill-white animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold tracking-tight">
                        {state.streakDays}-Day Learning Streak!
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {state.league}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      You are studying consistently every day. Keep the fire burning!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Tab Switcher inside Modal */}
              <div className="flex items-center gap-2 mt-5">
                <button
                  onClick={() => setActiveTab('streak')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'streak'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Streak & Safeguards</span>
                </button>
                <button
                  onClick={() => setActiveTab('xp')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'xp'
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Daily XP Quests</span>
                </button>
                <button
                  onClick={() => setActiveTab('badges')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'badges'
                      ? 'bg-[#00A896] text-white shadow-md shadow-teal-500/30'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Milestones & Badges</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200">
              {/* TAB 1: STREAK & CALENDAR */}
              {activeTab === 'streak' && (
                <div className="space-y-5">
                  {/* 7-Day Visual Calendar Streak */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Current Week Streak Tracker
                        </span>
                      </div>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        5 of 7 Days Active
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {WEEK_DAYS.map((w, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all ${
                            w.isToday
                              ? 'bg-amber-500/15 dark:bg-amber-500/25 border-amber-500 ring-2 ring-amber-500/30'
                              : w.completed
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                          }`}
                        >
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            {w.day}
                          </span>
                          <div className="my-1.5 flex items-center justify-center">
                            {w.completed ? (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-xs">
                                <Flame className="w-4 h-4 fill-white" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold">
                                {idx + 1}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {w.completed ? `+${w.xp} XP` : '0 XP'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Streak Freeze Shield Safeguard */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 fill-blue-500/30" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Streak Freeze Protection
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              state.streakFreezeEquipped
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {state.streakFreezeEquipped ? 'Shield Active' : 'Standby'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Protects your streak if you miss study time due to illness or holidays. (
                          {state.streakFreezeCount} freezes remaining)
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleToggleFreeze}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        state.streakFreezeEquipped
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {state.streakFreezeEquipped ? 'Equipped' : 'Equip Shield'}
                    </button>
                  </div>

                  {/* Daily Goal & Claim Bonus */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Daily Study Streak Bonus (+25 XP)
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {state.claimedBonusToday
                            ? 'Bonus collected for today! Check back tomorrow.'
                            : 'Solve 1 more practice question to claim bonus XP today.'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleClaimBonus}
                      disabled={state.claimedBonusToday}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        state.claimedBonusToday
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/30'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{state.claimedBonusToday ? 'Claimed Today' : 'Claim +25 XP'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: DAILY XP QUESTS & LEAGUES */}
              {activeTab === 'xp' && (
                <div className="space-y-4">
                  {/* Today's XP Progress */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Today's XP Target
                      </span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {state.dailyXpCurrent} / {state.dailyXpGoal} XP
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-[#00A896] transition-all duration-700"
                        style={{ width: `${Math.min(100, (state.dailyXpCurrent / state.dailyXpGoal) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      Reach 50 XP daily to unlock streak multipliers and rise up in the Emerald League.
                    </p>
                  </div>

                  {/* Active Daily Quests */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Today's Learning Quests
                    </h5>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Complete Core Algebra Task (1.5 hrs)
                          </p>
                          <p className="text-[10px] text-slate-500">Earned +25 XP</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                        Completed
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Ask Socratic AI 1 Concept Clarification
                          </p>
                          <p className="text-[10px] text-slate-500">Earned +20 XP</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                        Completed
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Score 85%+ on Rapid Practice Quiz
                          </p>
                          <p className="text-[10px] text-slate-500">Reward: +30 XP</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold">
                        In Progress
                      </span>
                    </div>
                  </div>

                  {/* Level & Rank status */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-[#00A896]/10 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                        Academic Standing
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Level {state.level}: Master Scholar
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        80 XP remaining to unlock Level 5: Senior Polymath.
                      </p>
                    </div>
                    <Trophy className="w-8 h-8 text-amber-500" />
                  </div>
                </div>
              )}

              {/* TAB 3: MILESTONES & BADGES */}
              {activeTab === 'badges' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Earn achievement badges by keeping your daily learning streak alive, mastering formulas, and solving doubt questions.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BADGES.map((b) => (
                      <div
                        key={b.id}
                        className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                          b.unlocked
                            ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 shadow-2xs'
                            : 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs shrink-0 ${
                            b.unlocked
                              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {b.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {b.name}
                            </h5>
                            {b.unlocked ? (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                Unlocked
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">
                                {b.progress}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {b.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-500" />
                Streak updates automatically after completing daily sprint tasks.
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confetti celebration banner when bonus claimed */}
      {confettiActive && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-6 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-sm font-black tracking-wide">
            +25 XP Streak Bonus Claimed! Momentum Unstoppable! 🔥
          </span>
        </div>
      )}
    </>
  );
};
