import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
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
import { LottieIcon } from '../common/LottieIcon';

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
  { dayKey: 'mon', completed: true, xp: 60 },
  { dayKey: 'tue', completed: true, xp: 55 },
  { dayKey: 'wed', completed: true, xp: 70 },
  { dayKey: 'thu', completed: true, xp: 50 },
  { dayKey: 'fri', completed: true, xp: 45, isToday: true },
  { dayKey: 'sat', completed: false, xp: 0 },
  { dayKey: 'sun', completed: false, xp: 0 },
];

const BADGES = [
  { id: 'b1', icon: '🔥', unlocked: true },
  { id: 'b2', icon: '⚡', unlocked: true },
  { id: 'b3', icon: '🏆', unlocked: true },
  { id: 'b4', icon: '👑', unlocked: false, progress: '14/30' },
  { id: 'b5', icon: '🧪', unlocked: true },
  { id: 'b6', icon: '🧠', unlocked: true },
];

export const StudentGamificationHub: React.FC = () => {
  const { t, i18n } = useTranslation(['student', 'common']);
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
          className="group relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-2xs hover:shadow-xs hover:scale-102 transition-all cursor-pointer"
          title={t('student:gamification.streakTooltip')}
        >
          <div className="relative flex items-center">
            <LottieIcon
              kind="nav"
              name="flame"
              colorHex="#64748B"
              sizeClass="w-4 h-4"
              playMode="always"
              fallback={<Flame className="w-4 h-4 fill-slate-500 text-slate-500" />}
            />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-black tracking-tight text-slate-800 dark:text-white">
              {state.streakDays}
            </span>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 hidden md:inline">
              {t('student:gamification.daysUnit')}
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
          title={t('student:gamification.xpTooltip')}
        >
          <LottieIcon
            kind="nav"
            name="zap"
            colorHex="#6366F1"
            sizeClass="w-4 h-4"
            playMode="always"
            fallback={<Zap className="w-4 h-4 fill-indigo-500 text-indigo-500" />}
          />
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-black tracking-tight text-indigo-700 dark:text-indigo-200">
              {state.xpPoints.toLocaleString(i18n.language || 'en-US')}
            </span>
            <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 hidden xl:inline">
              {t('student:gamification.xpUnit')}
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
          INTERACTIVE DUOLINGO-STYLE GAMIFICATION MODAL (Portaled to document.body)
          ========================================================================= */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
          >
            <div
              className="font-lollipop-regular relative w-full max-w-xl my-auto bg-white dark:bg-[#0E1A2D] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header banner with playful flame & XP gradient */}
            <div className="relative p-6 bg-gradient-to-br from-[#0D1B3E] via-[#162746] to-[#0A1526] text-white border-b border-slate-800 overflow-hidden">
              {/* Decorative background glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-700 border border-slate-600 flex items-center justify-center shadow-xs text-white">
                    <Flame className="w-7 h-7 fill-white animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-normal tracking-tight">
                        {t('student:gamification.streakHeaderTitle', { days: state.streakDays })}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-normal uppercase tracking-wide bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {state.league === 'Emerald League (Top 3%)' ? t('student:gamification.emeraldLeague') : state.league}
                      </span>
                    </div>
                    <p className="text-xs font-normal text-slate-300 mt-0.5">
                      {t('student:gamification.streakHeaderSub')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label={t('common:actions.close')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Tab Switcher inside Modal */}
              <div className="flex items-center gap-2 mt-5">
                <button
                  onClick={() => setActiveTab('streak')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-normal transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'streak'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{t('student:gamification.tabStreak')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('xp')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-normal transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'xp'
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{t('student:gamification.tabXp')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('badges')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-normal transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'badges'
                      ? 'bg-[#00A896] text-white shadow-md shadow-teal-500/30'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{t('student:gamification.tabBadges')}</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-white font-normal">
              {/* TAB 1: STREAK & CALENDAR */}
              {activeTab === 'streak' && (
                <div className="space-y-5">
                  {/* 7-Day Visual Calendar Streak */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-normal uppercase tracking-wider text-slate-700 dark:text-white">
                          {t('student:gamification.weekTrackerTitle')}
                        </span>
                      </div>
                      <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('student:gamification.daysActiveCount', { done: 5, total: 7 })}
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
                          <span className="text-[11px] font-normal text-slate-500 dark:text-white">
                            {t(`student:gamification.weekDays.${w.dayKey}`)}
                          </span>
                          <div className="my-1.5 flex items-center justify-center">
                            {w.completed ? (
                              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 flex items-center justify-center text-slate-700 dark:text-white shadow-xs">
                                <Flame className="w-4 h-4 fill-slate-600 dark:fill-white" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-white text-xs font-normal">
                                {idx + 1}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-normal text-slate-600 dark:text-white tabular-nums">
                            {w.completed ? `+${w.xp} ${t('student:gamification.xpUnit')}` : `0 ${t('student:gamification.xpUnit')}`}
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
                          <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                            {t('student:gamification.streakFreezeTitle')}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-normal ${
                              state.streakFreezeEquipped
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-white'
                            }`}
                          >
                            {state.streakFreezeEquipped ? t('student:gamification.shieldActive') : t('student:gamification.standby')}
                          </span>
                        </div>
                        <p className="text-[11px] font-normal text-slate-500 dark:text-white mt-0.5">
                          {t('student:gamification.streakFreezeDesc', { count: state.streakFreezeCount })}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleToggleFreeze}
                      className={`px-3 py-1.5 rounded-xl text-xs font-normal cursor-pointer transition-all whitespace-nowrap ${
                        state.streakFreezeEquipped
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-300'
                      }`}
                    >
                      {state.streakFreezeEquipped ? t('student:gamification.equipped') : t('student:gamification.equipShield')}
                    </button>
                  </div>

                  {/* Daily Goal & Claim Bonus */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                          {t('student:gamification.dailyBonusTitle')}
                        </h4>
                        <p className="text-[11px] font-normal text-slate-500 dark:text-white mt-0.5">
                          {state.claimedBonusToday
                            ? t('student:gamification.bonusCollectedDesc')
                            : t('student:gamification.bonusPendingDesc')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleClaimBonus}
                      disabled={state.claimedBonusToday}
                      className={`px-4 py-2 rounded-xl text-xs font-normal flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                        state.claimedBonusToday
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-white/60 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                          : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 shadow-xs'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{state.claimedBonusToday ? t('student:gamification.claimedToday') : t('student:gamification.claimXpBtn')}</span>
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
                      <span className="text-xs font-normal text-slate-700 dark:text-white">
                        {t('student:gamification.todaysXpTarget')}
                      </span>
                      <span className="text-xs font-normal text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {state.dailyXpCurrent} / {state.dailyXpGoal} {t('student:gamification.xpUnit')}
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-[#00A896] transition-all duration-700"
                        style={{ width: `${Math.min(100, (state.dailyXpCurrent / state.dailyXpGoal) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] font-normal text-slate-500 dark:text-white mt-2">
                      {t('student:gamification.xpTargetHint')}
                    </p>
                  </div>

                  {/* Active Daily Quests */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-normal uppercase tracking-wider text-slate-500 dark:text-white">
                      {t('student:gamification.todaysQuestsHeading')}
                    </h5>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-xs font-normal text-slate-900 dark:text-white">
                            {t('student:gamification.q1Title')}
                          </p>
                          <p className="text-[10px] font-normal text-slate-500 dark:text-white">{t('student:gamification.earned25Xp')}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-normal">
                        {t('common:statuses.Completed')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-xs font-normal text-slate-900 dark:text-white">
                            {t('student:gamification.q2Title')}
                          </p>
                          <p className="text-[10px] font-normal text-slate-500 dark:text-white">{t('student:gamification.earned20Xp')}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-normal">
                        {t('common:statuses.Completed')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                        <div>
                          <p className="text-xs font-normal text-slate-900 dark:text-white">
                            {t('student:gamification.q3Title')}
                          </p>
                          <p className="text-[10px] font-normal text-slate-500 dark:text-white">{t('student:gamification.reward30Xp')}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-white text-[10px] font-normal">
                        {t('common:statuses.In Progress')}
                      </span>
                    </div>
                  </div>

                  {/* Level & Rank status */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-[#00A896]/10 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-normal uppercase tracking-wider text-indigo-500">
                        {t('student:gamification.academicStanding')}
                      </span>
                      <h4 className="text-sm font-normal text-slate-900 dark:text-white">
                        {t('student:gamification.levelMasterScholar', { level: state.level })}
                      </h4>
                      <p className="text-[11px] font-normal text-slate-500 dark:text-white">
                        {t('student:gamification.nextLevelHint')}
                      </p>
                    </div>
                    <Trophy className="w-8 h-8 text-amber-500" />
                  </div>
                </div>
              )}

              {/* TAB 3: MILESTONES & BADGES */}
              {activeTab === 'badges' && (
                <div className="space-y-3">
                  <p className="text-xs font-normal text-slate-500 dark:text-white">
                    {t('student:gamification.badgesIntro')}
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
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-white'
                          }`}
                        >
                          {b.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-normal text-slate-900 dark:text-white truncate">
                              {t(`student:gamification.streakBadges.${b.id}Name`)}
                            </h5>
                            {b.unlocked ? (
                              <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                                {t('student:gamification.unlocked')}
                              </span>
                            ) : (
                              <span className="text-[10px] font-normal text-slate-400 dark:text-white">
                                {b.progress}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-normal text-slate-500 dark:text-white truncate">
                            {t(`student:gamification.streakBadges.${b.id}Desc`)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-normal text-slate-500 dark:text-white">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-500" />
                {t('student:gamification.footerNote')}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-normal transition-colors cursor-pointer"
              >
                {t('common:actions.close')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confetti celebration banner when bonus claimed */}
      {confettiActive &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="font-lollipop-regular fixed top-5 left-1/2 -translate-x-1/2 z-[110] bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white px-6 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-normal tracking-wide">
              {t('student:gamification.confettiToast')}
            </span>
          </div>,
          document.body
        )}
    </>
  );
};
