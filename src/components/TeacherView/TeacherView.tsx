import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { PivotIQLogo } from '../common/PivotIQLogo';
import { NotificationBell } from '../common/NotificationBell';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { CommunityDoubtForum } from '../StudentView/CommunityDoubtForum';
import { resolveSubjectsForBoard } from '../../data/curriculumData';
import { translateSubjectLabel, translateBoardLabel, translateStatusLabel } from '../../i18n/helpers';
import {
  Briefcase,
  FileText,
  Sparkles,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Plus,
  Send,
  Download,
  Share2,
  ChevronDown,
  Layers,
  Award,
  Users,
  Settings2,
  HelpCircle,
  Clock,
  ArrowUpRight,
  Menu,
  X,
  Calendar,
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
  Video,
  ExternalLink,
  Edit3,
  Search,
  Check,
  MessageSquare,
} from 'lucide-react';

export const TeacherView: React.FC = () => {
  const {
    lessonPlans,
    quizzes,
    aiSuggestions,
    isDraftingPlan,
    isDraftingQuiz,
    draftLessonPlan,
    draftQuiz,
    publishQuiz,
    dismissSuggestion,
    studentsList,
    teacherSubjectContext,
    setTeacherSubjectContext,
    currentUser,
    setCurrentRole,
    logout,
    setIsCurriculumModalOpen,
    setIsProfileOpen,
    doubts,
    resolveDoubt,
    boardSubjectMappings,
    subjectsDB,
    topicsDB,
    currentBoard,
    setEcosystemOverviewMode,
    communityPosts,
  } = useApp();

  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation(['teacher', 'common']);
  const intlLocale = i18n.language === 'en' ? 'en-US' : `${i18n.language}-IN`;

  // Navigation tab state (similar to StudentView)
  const [teacherNav, setTeacherNav] = useState<string>('workspace');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Lesson Plan Generator state
  const [topic, setTopic] = useState('Photosynthesis');
  const [grade, setGrade] = useState('7th');
  const [style, setStyle] = useState('Interactive');
  const [activePlanModal, setActivePlanModal] = useState<any | null>(null);

  // Quiz Creator state
  const [quizPrompt, setQuizPrompt] = useState('Draft a 10-question MCQ quiz on Plant Cells');
  const [activeQuizModal, setActiveQuizModal] = useState<any | null>(null);

  // Class Selection state
  const [selectedClass, setSelectedClass] = useState('Class 7B - Science');

  const getClassLabel = (cls: string) => {
    if (cls === 'Class 7B - Science') return t('teacher:classes.class7BScience');
    if (cls === 'Class 8A - Physics') return t('teacher:classes.class8APhysics');
    if (cls === 'Class 8C - Adv Biology') return t('teacher:classes.class8CBio');
    if (cls === 'All Enrolled Classes') return t('teacher:classes.allEnrolled');
    return cls;
  };

  // Broadcast Quiz State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedBroadcastQuizId, setSelectedBroadcastQuizId] = useState<string>(quizzes[0]?.id || '');
  const [broadcastTargetClass, setBroadcastTargetClass] = useState<string>(selectedClass);
  const [broadcastDuration, setBroadcastDuration] = useState('15 Minutes');
  const [broadcastProctoring, setBroadcastProctoring] = useState(true);
  const [broadcastBannerData, setBroadcastBannerData] = useState<{ title: string; targetClass: string; isFull: boolean } | null>(null);
  const [isBroadcastedRecently, setIsBroadcastedRecently] = useState(false);

  const handleExecuteBroadcast = (targetQuiz?: any) => {
    const quizToBroadcast = targetQuiz || quizzes.find((q) => q.id === selectedBroadcastQuizId) || quizzes[0];
    if (!quizToBroadcast) return;
    
    publishQuiz(quizToBroadcast, broadcastTargetClass);
    setIsBroadcastedRecently(true);
    setBroadcastBannerData({ title: quizToBroadcast.title, targetClass: broadcastTargetClass, isFull: true });
    setIsBroadcastModalOpen(false);
    
    setTimeout(() => {
      setIsBroadcastedRecently(false);
    }, 4500);
  };

  const currentDateStr = new Date().toLocaleDateString(intlLocale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    const plan = await draftLessonPlan(topic, grade, style);
    if (plan) {
      setActivePlanModal(plan);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await draftQuiz(quizPrompt);
    if (result) {
      setActiveQuizModal(result);
    }
  };

  const navTabs = [
    { id: 'workspace', label: t('teacher:nav.workspace'), icon: <Briefcase className="w-4 h-4" /> },
    { id: 'lesson-plans', label: t('teacher:nav.lessonPlans'), icon: <FileText className="w-4 h-4" />, badge: `${lessonPlans.length}` },
    { id: 'quizzes', label: t('teacher:nav.quizzes'), icon: <CheckCircle2 className="w-4 h-4" />, badge: `${quizzes.length}` },
    { id: 'classes', label: t('teacher:nav.classes'), icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'roster', label: t('teacher:nav.roster'), icon: <Users className="w-4 h-4" />, badge: t('teacher:nav.liveBadge') },
    {
      id: 'community',
      label: t('teacher:nav.community'),
      icon: <MessageSquare className="w-4 h-4" />,
      badge: t('teacher:nav.openCount', {
        count: communityPosts.filter((p) => !p.accepted_comment_id && !p.is_verified).length,
      }),
    },
    { id: 'curriculum', label: t('teacher:nav.curriculumNav'), icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex bg-[#F4F7FB] dark:bg-[#070D18] text-[#1E293B] dark:text-[#F1F5F9] font-sans antialiased transition-colors font-normal">
      {/* =========================================================================
          1. LEFT SIDEBAR NAVIGATION - Dark Navy Theme (#0B1E38) + #00A896 Accent
          (Matching the exact UI, structure, and unbolded typography of the Student Panel)
          ========================================================================= */}
      
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 xl:w-72 bg-[#0B1E38] dark:bg-[#071324] text-slate-200 border-r border-[#152B4D] dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Section: Brand + Teacher Profile Card */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PivotIQLogo size={40} />
              <div>
                <h1 className="font-light text-white text-base tracking-wide leading-tight">
                  {t('common:appName')}
                </h1>
                <div className="flex items-center gap-1.5 text-[10px] text-[#00A896] font-normal uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#00A896] animate-pulse" />
                  <span>{t('teacher:portal.educatorPortal')}</span>
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Teacher Profile Card Pill - Distinctive visual component matching Student View */}
          <div
            onClick={() => setIsProfileOpen(true)}
            className="group relative p-3 rounded-2xl bg-[#132A4C]/90 hover:bg-[#16335C] border border-[#1E3E6B]/80 transition-all cursor-pointer shadow-sm flex items-center gap-3"
            title={t('teacher:portal.manageProfile')}
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[#0D1B3E] border-2 border-[#00A896] flex items-center justify-center text-white font-normal text-sm shadow-inner">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=ProfEliza"
                  alt={t('teacher:portal.facultyShort')}
                  className="w-full h-full object-cover"
                />
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00A896] ring-2 ring-[#0D1B3E]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-normal text-white truncate group-hover:text-[#00A896] transition-colors">
                  {currentUser?.name || 'PROF. ELIZA G., Ph.D.'}
                </p>
                <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <p className="text-[11px] text-slate-300 font-light truncate mt-0.5">
                {currentUser?.department || t('teacher:portal.allStemShort')} &bull; {t('teacher:portal.grRange')}
              </p>
            </div>
          </div>

          {/* Navigation Links Menu - Changes only color upon selection, NO BOLD */}
          <div className="space-y-1 pt-1">
            <span className="px-3 text-[10px] font-normal uppercase tracking-wider text-slate-400">
              {t('common:nav.platformMenu')}
            </span>
            <nav className="space-y-1 mt-2">
              {navTabs.map((tab) => {
                const isActive = teacherNav === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'curriculum') {
                        setIsCurriculumModalOpen(true);
                      } else {
                        setTeacherNav(tab.id);
                      }
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-normal transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#00A896] text-white shadow-md shadow-[#00A896]/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {tab.icon}
                      </span>
                      <span className="font-normal">{tab.label}</span>
                    </div>

                    {tab.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-normal uppercase ${
                          isActive
                            ? 'bg-[#0D1B3E] text-[#00A896]'
                            : 'bg-[#00A896] text-white'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section: Active Class Status & Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#152B4D] dark:border-slate-800/80 space-y-3 bg-[#08182E]/60">
          {/* Active Class Mini Card */}
          <div className="p-3 rounded-xl bg-[#132A4C]/80 border border-[#1E3E6B]/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-normal text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00A896] animate-pulse" />
                <span className="truncate max-w-[130px]">{getClassLabel(selectedClass)}</span>
              </span>
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-md bg-[#00A896] text-white">
                {t('teacher:portal.activeBadge')}
              </span>
            </div>
            {/* Progress / Synchronized Sync Bar */}
            <div className="w-full bg-[#0D1B3E] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#00A896] h-full rounded-full transition-all"
                style={{ width: '88%' }}
              />
            </div>
          </div>

          {/* Quick Footer Links: Profile, Theme, Admin Switch, Sign Out */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer font-normal"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#00A896]" />
              <span>{t('teacher:portal.facultyShort')}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-[#132A4C] hover:bg-[#1C3A66] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={t('teacher:portal.switchThemeTitle', {
                mode: theme === 'dark' ? t('common:header.lightShort') : t('common:header.darkShort'),
              })}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => setCurrentRole('admin')}
                className="flex items-center gap-1 text-[11px] font-normal text-[#00A896] hover:text-teal-300 transition-colors cursor-pointer"
                title={t('common:header.exitToAdmin')}
              >
                <span>{t('teacher:portal.returnAdmin')}</span>
              </button>
            ) : (
              <button
                onClick={logout}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title={t('common:nav.signOut')}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN CONTENT AREA (Offset to the right of fixed sidebar on desktop)
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 xl:pl-72">
        {/* TOP HEADER BAR - Clean, uncluttered, synchronized */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0E1A2D]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors shadow-2xs">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile hamburger + Active View Title & Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label={t('common:nav.openNavigation')}
              >
                <Menu className="w-5 h-5 stroke-[2.2]" />
              </button>

              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-light text-slate-900 dark:text-white tracking-wide flex items-center gap-2 truncate">
                  <span className="truncate">{t('teacher:portal.desktopTitle')}</span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-light truncate">
                  {t('teacher:portal.academicYearContext', { className: getClassLabel(selectedClass) })}
                </p>
              </div>
            </div>

            {/* Right: Quick Context Controls, Notifications, Language Switcher & Profile */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Class Selector Badge */}
              <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs shrink-0">
                <Users className="w-3.5 h-3.5 text-[#00A896] shrink-0" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="text-xs font-normal text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="Class 7B - Science" className="dark:bg-slate-900">
                    {t('teacher:classes.studentsCount', { name: t('teacher:classes.class7BScience'), count: 28 })}
                  </option>
                  <option value="Class 8A - Physics" className="dark:bg-slate-900">
                    {t('teacher:classes.studentsCount', { name: t('teacher:classes.class8APhysics'), count: 32 })}
                  </option>
                  <option value="Class 8C - Adv Biology" className="dark:bg-slate-900">
                    {t('teacher:classes.studentsCount', { name: t('teacher:classes.class8CBio'), count: 24 })}
                  </option>
                </select>
              </div>

              {/* Broadcast Action Button */}
              <button
                onClick={() => {
                  setSelectedBroadcastQuizId(quizzes[0]?.id || '');
                  setBroadcastTargetClass(selectedClass);
                  setIsBroadcastModalOpen(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-normal shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isBroadcastedRecently
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-[#00A896] hover:bg-[#009282] text-white shadow-[#00A896]/20'
                }`}
                title={t('teacher:headerBtns.broadcastTooltip')}
              >
                {isBroadcastedRecently ? (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('teacher:headerBtns.broadcasted')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{t('teacher:headerBtns.broadcastQuiz')}</span>
                  </>
                )}
              </button>

              {/* Workflow & Ecosystem Map Button */}
              <button
                onClick={() => setEcosystemOverviewMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-normal text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
                title={t('teacher:headerBtns.workflowTooltip')}
              >
                <Layers className="w-3.5 h-3.5 text-[#00A896] shrink-0" />
                <span className="hidden xl:inline">{t('teacher:headerBtns.workflowMap')}</span>
              </button>

              {/* Date pill */}
              <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-normal text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 whitespace-nowrap shrink-0">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentDateStr}</span>
              </div>

              {/* Notifications Bell */}
              <NotificationBell />

              {/* Persistent Top-Right Language Switcher */}
              <LanguageSwitcher variant="portal" />

              {/* Direct Profile trigger avatar */}
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-[#00A896]/60 bg-[#0D1B3E] flex items-center justify-center text-white text-xs font-normal shadow-xs hover:scale-105 transition-all cursor-pointer shrink-0"
                title={t('teacher:portal.accountSettings')}
              >
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={t('common:header.profile')} className="w-full h-full object-cover" />
                ) : (
                  <span>{(currentUser?.name || 'T').charAt(0)}</span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* LIVE ASSESSMENT BROADCAST BANNER IN TEACHER DESKTOP */}
        {broadcastBannerData && (
          <div className="bg-gradient-to-r from-[#00A896] via-[#0D1B3E] to-[#0B1E38] text-white px-4 py-3 shadow-md flex items-center justify-between z-20 border-b border-[#00A896]/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center animate-pulse shrink-0">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-normal uppercase tracking-wider bg-[#00A896] text-white px-2 py-0.5 rounded-full">
                    {t('teacher:headerBtns.liveBroadcastActive')}
                  </span>
                  <span className="font-normal text-xs sm:text-sm">
                    {broadcastBannerData.isFull
                      ? t('teacher:broadcastModal.successBanner', {
                          title: broadcastBannerData.title,
                          targetClass: getClassLabel(broadcastBannerData.targetClass),
                        })
                      : t('teacher:broadcastModal.successLiveNotice', {
                          title: broadcastBannerData.title,
                          targetClass: getClassLabel(broadcastBannerData.targetClass),
                        })}
                  </span>
                </div>
                <p className="text-[11px] text-white/80 font-light mt-0.5">
                  {t('teacher:headerBtns.liveBroadcastSub')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setBroadcastBannerData(null)}
              className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white cursor-pointer shrink-0"
              title={t('common:actions.dismiss')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =========================================================================
            3. MAIN BODY WORKSPACE (with Student Panel dark/light navy aesthetic)
            ========================================================================= */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
          {teacherNav === 'community' ? (
            <CommunityDoubtForum isModeratorView />
          ) : (
          <>
          {/* TOP CONTEXT SELECTION & ASSISTED PREVIEW BAR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* FACULTY PROFILE CARD */}
            <div className="md:col-span-4 bg-white dark:bg-[#0E1A2D] rounded-3xl p-5 shadow-xs border border-slate-200/90 dark:border-slate-800/80 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-normal uppercase tracking-wider text-slate-400">
                  {t('teacher:facultyCard.headerLabel')}
                </span>
                <span className="text-[10px] text-[#00A896] bg-[#00A896]/10 px-2 py-0.5 rounded-full font-normal">
                  {t('teacher:facultyCard.badge')}
                </span>
              </div>
              <div className="flex items-center gap-3.5 pt-3">
                <div className="w-13 h-13 rounded-2xl bg-[#0D1B3E] border-2 border-[#00A896] p-0.5 shadow-sm flex items-center justify-center text-white text-base font-normal overflow-hidden shrink-0">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={t('teacher:facultyCard.headerLabel')}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <img
                      src="https://api.dicebear.com/7.x/bottts/svg?seed=ProfEliza"
                      alt={t('teacher:facultyCard.headerLabel')}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-normal text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">
                    {currentUser?.name || 'PROF. ELIZA G., Ph.D.'}
                  </h3>
                  <p className="text-xs text-[#00A896] font-normal uppercase tracking-wide truncate mt-0.5">
                    {currentUser?.department || t('teacher:facultyCard.defaultDept')}
                  </p>
                  <p className="text-[10px] text-slate-400 font-light mt-0.5">
                    {t('teacher:facultyCard.assignedSummary')}
                  </p>
                </div>
              </div>
            </div>

            {/* DEDICATED SUBJECT/GRADE CONTEXT SELECTOR & ACTION CARDS */}
            <div className="md:col-span-8 bg-white dark:bg-[#0E1A2D] rounded-3xl p-5 shadow-xs border border-slate-200/90 dark:border-slate-800/80 transition-colors space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-normal uppercase tracking-wider text-[#00A896]">
                    {t('teacher:contextSelector.heading')}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                    {t('teacher:portal.desktopSubtitle')}
                  </p>
                </div>

                {/* DEDICATED DROPDOWN SELECTOR */}
                <div className="flex items-center gap-2">
                  <select
                    value={teacherSubjectContext}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'full-list') {
                        setIsCurriculumModalOpen(true);
                        return;
                      }
                      setTeacherSubjectContext(val);

                      const matchedSubj = subjectsDB.find(
                        (s) => `Grade ${s.grade_level} ${s.name}` === val || s.name === val || val.includes(s.name)
                      );
                      if (matchedSubj) {
                        setGrade(`${matchedSubj.grade_level}th`);
                        const relatedTopic = topicsDB.find((tItem) => tItem.subject_id === matchedSubj.id && tItem.status === 'ACTIVE');
                        if (relatedTopic) {
                          setTopic(relatedTopic.title);
                          setQuizPrompt(`Draft a 10-question MCQ quiz on ${relatedTopic.title} (Grade ${matchedSubj.grade_level} ${matchedSubj.name})`);
                        } else {
                          setTopic(matchedSubj.name);
                          setQuizPrompt(`Draft a 10-question MCQ quiz on ${matchedSubj.name} (Grade ${matchedSubj.grade_level})`);
                        }
                      } else if (val.includes('Biology')) {
                        setTopic('Photosynthesis & Cellular Energy');
                        setGrade('9th');
                        setQuizPrompt('Draft a 10-question MCQ quiz on Plant Cell Photosynthesis (Grade 9)');
                      } else if (val.includes('Physics')) {
                        setTopic("Newton's 2nd Law & Force Dynamics");
                        setGrade('10th');
                        setQuizPrompt("Draft a 10-question quiz on Newton's Laws and Vector Dynamics (Grade 10)");
                      } else if (val.includes('Math')) {
                        setTopic('Linear Equations & Ratio Systems');
                        setGrade('6th');
                        setQuizPrompt('Draft an 8-question quiz on Linear Equations and Slope (Grade 8)');
                      } else if (val.includes('Calculus')) {
                        setTopic('Differential Calculus & Limits');
                        setGrade('12th');
                        setQuizPrompt('Draft a 10-question quiz on Derivatives and the Chain Rule (Grade 12)');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs font-normal text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer shadow-2xs max-w-xs"
                  >
                    <optgroup label={t('teacher:contextSelector.realtimeAdminCurriculum', { board: translateBoardLabel(currentBoard || 'CBSE', t) })}>
                      {resolveSubjectsForBoard(currentBoard || 'CBSE', subjectsDB, boardSubjectMappings)
                        .filter((s) => s.status === 'ACTIVE')
                        .map((subj) => (
                          <option key={subj.id} value={`Grade ${subj.grade_level} ${subj.name}`}>
                            [{t('teacher:lessonStudio.gradePrefix', {
                              grade: subj.grade_level,
                              subject: translateSubjectLabel(subj.name, t),
                            })}
                            {subj.resolvedSubjectType === 'REGIONAL_LANGUAGE' ? t('teacher:contextSelector.regionalSuffix') : ''}]
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label={t('teacher:contextSelector.syllabusExplorerGroup')}>
                      <option value="full-list">{t('teacher:contextSelector.fullSyllabusOption')}</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Context-Driven Assisted Lesson Plans & Live Video Box */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-6 space-y-2">
                  <span className="text-[11px] font-normal uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    {t('teacher:contextSelector.assistedPlansHeading')}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                    {t('teacher:contextSelector.highYieldDesc')}{' '}
                    <strong className="font-normal text-[#00A896]">{teacherSubjectContext}</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-normal bg-[#00A896]/15 text-[#00A896] border border-[#00A896]/30">
                      {t('teacher:contextSelector.activeContextBadge', { ctx: teacherSubjectContext })}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80"
                      alt={t('teacher:contextSelector.liveStudio')}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute top-2 left-2 bg-[#00A896] text-white text-[9px] font-normal px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>{t('teacher:contextSelector.liveStudio')}</span>
                    </div>
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-normal px-2 py-0.5 rounded-md shadow-sm">
                      {t('teacher:contextSelector.syncReady')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN WORKSPACE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT 2 COLUMNS: AI Lesson Plan Generator & Quiz Creator */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CARD 1: AI Lesson Plan Generator */}
              <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl p-6 shadow-xs border border-slate-200/90 dark:border-slate-800/80 flex flex-col justify-between space-y-5 relative transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-[#00A896]/15 text-[#00A896] flex items-center justify-center font-normal">
                      <FileText className="w-5 h-5 text-[#00A896]" />
                    </div>
                    <div>
                      <h3 className="font-light text-slate-900 dark:text-white text-base leading-tight">
                        {t('teacher:lessonStudio.heading')}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light">{t('teacher:lessonStudio.subheadingShort')}</p>
                    </div>
                  </div>

                  <form onSubmit={handleGeneratePlan} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-normal text-slate-700 dark:text-slate-300 mb-1">{t('teacher:lessonStudio.topicLabel')}</label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={t('teacher:lessonStudio.topicPlaceholder')}
                        className="w-full bg-slate-50 dark:bg-[#0D1B3E] text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00A896] transition-all font-normal"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-normal text-slate-700 dark:text-slate-300 mb-1">{t('teacher:lessonStudio.gradeLabel')}</label>
                        <select
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#0D1B3E] text-slate-900 dark:text-white text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00A896] font-normal cursor-pointer"
                        >
                          <option value="6th">{t('teacher:lessonStudio.grades.6th')}</option>
                          <option value="7th">{t('teacher:lessonStudio.grades.7th')}</option>
                          <option value="8th">{t('teacher:lessonStudio.grades.8th')}</option>
                          <option value="9th">{t('teacher:lessonStudio.grades.9th')}</option>
                          <option value="10th">{t('teacher:lessonStudio.grades.10th')}</option>
                          <option value="AP/Honors">{t('teacher:lessonStudio.grades.AP/Honors')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-normal text-slate-700 dark:text-slate-300 mb-1">{t('teacher:lessonStudio.styleLabel')}</label>
                        <select
                          value={style}
                          onChange={(e) => setStyle(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#0D1B3E] text-slate-900 dark:text-white text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00A896] font-normal cursor-pointer"
                        >
                          <option value="Interactive">{t('teacher:lessonStudio.styles.Interactive')}</option>
                          <option value="Socratic Inquiry">{t('teacher:lessonStudio.styles.Socratic Inquiry')}</option>
                          <option value="Project-Based">{t('teacher:lessonStudio.styles.Project-Based')}</option>
                          <option value="Remedial Synthesis">{t('teacher:lessonStudio.styles.Remedial Synthesis')}</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isDraftingPlan}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#00A896] hover:bg-[#009282] disabled:opacity-50 text-white font-normal text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isDraftingPlan ? t('teacher:lessonStudio.draftingStatus') : t('teacher:lessonStudio.generateBtn')}</span>
                    </button>
                  </form>
                </div>

                {/* AI Drafting Progress Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1B3E] border border-slate-200 dark:border-slate-700 space-y-2.5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-normal text-xs">
                      <span className="w-2 h-2 rounded-full bg-[#00A896] animate-ping" />
                      <span>{t('teacher:lessonStudio.aiStatus')}</span>
                    </div>
                    <span className="text-[10px] text-[#00A896] font-normal">
                      {isDraftingPlan ? t('teacher:lessonStudio.generating') : t('teacher:lessonStudio.ready')}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`bg-[#00A896] h-full rounded-full transition-all duration-500 ${
                        isDraftingPlan ? 'w-3/4 animate-pulse' : 'w-full'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] text-slate-600 dark:text-slate-400 font-light">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#00A896]" />
                      <span className="truncate">{t('teacher:lessonStudio.objectives')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#00A896]" />
                      <span className="truncate">{t('teacher:lessonStudio.activities')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#00A896]" />
                      <span className="truncate">{t('teacher:lessonStudio.reading')}</span>
                    </div>
                  </div>

                  {lessonPlans.length > 0 && (
                    <button
                      onClick={() => setActivePlanModal(lessonPlans[0])}
                      className="w-full mt-2 py-1.5 px-3 rounded-lg bg-white dark:bg-[#12234e] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-[#00A896]/10 text-xs font-normal transition-colors cursor-pointer text-center"
                    >
                      {t('teacher:lessonStudio.inspectPlanBtn', { topic: lessonPlans[0].topic })}
                    </button>
                  )}
                </div>
              </div>

              {/* CARD 2: Quiz Creator */}
              <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl p-6 shadow-xs border border-slate-200/90 dark:border-slate-800/80 flex flex-col justify-between space-y-5 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-[#00A896]/15 text-[#00A896] flex items-center justify-center font-normal">
                      <CheckCircle2 className="w-5 h-5 text-[#00A896]" />
                    </div>
                    <div>
                      <h3 className="font-light text-slate-900 dark:text-white text-base leading-tight">
                        {t('teacher:quizCreator.heading')}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light">{t('teacher:quizCreator.subtitle')}</p>
                    </div>
                  </div>

                  <form onSubmit={handleGenerateQuiz} className="space-y-4">
                    <div>
                      <label className="block text-xs font-normal text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('teacher:quizCreator.promptLabel')}
                      </label>
                      <textarea
                        rows={5}
                        value={quizPrompt}
                        onChange={(e) => setQuizPrompt(e.target.value)}
                        placeholder={t('teacher:quizCreator.promptPlaceholder')}
                        className="w-full bg-slate-50 dark:bg-[#0D1B3E] text-slate-900 dark:text-white text-xs p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00A896] transition-all font-normal resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isDraftingQuiz || !quizPrompt.trim()}
                      className="w-full py-3 px-4 rounded-xl bg-[#00A896] hover:bg-[#009282] disabled:opacity-50 text-white font-normal text-sm shadow-md shadow-[#00A896]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isDraftingQuiz ? t('teacher:quizCreator.draftingQuizStatus') : t('teacher:quizCreator.generateQuizBtn')}</span>
                    </button>
                  </form>
                </div>

                {/* Recent Quizzes List preview */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1B3E] border border-slate-200 dark:border-slate-700 space-y-2 transition-colors">
                  <div className="flex items-center justify-between text-xs text-slate-900 dark:text-slate-100 font-normal">
                    <span>{t('teacher:quizCreator.assessmentsPool')}</span>
                    <span className="text-[10px] text-[#00A896] font-normal">{t('teacher:quizCreator.quizzesCount', { count: quizzes.length })}</span>
                  </div>
                  {quizzes.slice(0, 2).map((q) => (
                    <div
                      key={q.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#12234e] border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="truncate max-w-[160px]">
                        <div className="font-normal text-slate-800 dark:text-white truncate">{q.title}</div>
                        <span className="text-[10px] text-slate-400 font-light">{q.questions.length} {t('common:units.questions')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveQuizModal(q)}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-normal cursor-pointer"
                        >
                          {t('teacher:quizCreator.inspectShort')}
                        </button>
                        <button
                          onClick={() => publishQuiz(q)}
                          className="px-2 py-1 rounded-lg bg-[#00A896] hover:bg-[#009282] text-white text-[11px] font-normal cursor-pointer"
                        >
                          {t('teacher:quizCreator.publishShort')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: My Classes & AI-Powered Suggestions */}
            <div className="lg:col-span-4 space-y-6">
              {/* My Classes & Dual Wavy Graph */}
              <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl p-6 shadow-xs border border-slate-200/90 dark:border-slate-800/80 space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-light text-slate-900 dark:text-white text-base">{t('teacher:classesChart.myClasses')}</h3>
                    <span className="text-xs font-normal text-[#00A896] bg-[#00A896]/15 px-2 py-0.5 rounded-full border border-[#00A896]/30">
                      {getClassLabel(selectedClass)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-light">{t('teacher:classesChart.weeklyTrend')}</span>
                </div>

                <div>
                  <span className="text-xs font-normal text-slate-700 dark:text-slate-300 block mb-2">{t('teacher:classesChart.studentProgress')}</span>

                  {/* SVG Curve Graphs with Teal & Indigo Curves matching PivotIQ theme */}
                  <div className="bg-slate-50 dark:bg-[#0D1B3E] p-3 rounded-2xl border border-slate-200 dark:border-slate-700 relative">
                    <svg viewBox="0 0 300 100" className="w-full h-24 overflow-visible">
                      <defs>
                        <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00A896" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#00A896" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="navyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Subtle grid lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="#94a3b8" className="opacity-20" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="#94a3b8" className="opacity-20" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="0" y1="80" x2="300" y2="80" stroke="#94a3b8" className="opacity-20" strokeWidth="1" strokeDasharray="3 3" />

                      {/* Teal trendline: Class Average */}
                      <path
                        d="M 10 70 Q 50 30, 90 60 T 170 20 T 240 50 T 290 30"
                        fill="none"
                        stroke="#00A896"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="290" cy="30" r="3.5" fill="#00A896" />

                      {/* Cyan trendline: Assessment Retention */}
                      <path
                        d="M 10 90 Q 60 85, 100 50 T 180 80 T 240 60 T 290 45"
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="290" cy="45" r="3.5" fill="#38BDF8" />
                    </svg>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-light pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#00A896]" />
                        {t('teacher:classesChart.scienceMasteryPct', { pct: 84 })}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                        {t('teacher:classesChart.retentionVelocityPct', { pct: 76 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI-Powered Suggestions */}
              <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl p-6 shadow-xs border border-slate-200/90 dark:border-slate-800/80 space-y-3 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-light text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00A896]" />
                    {t('teacher:suggestions.heading')}
                  </h3>
                  <span className="text-[10px] bg-[#00A896]/15 text-[#00A896] px-2 py-0.5 rounded-full font-normal">
                    {t('teacher:suggestions.activeCount', { count: aiSuggestions.length })}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {aiSuggestions.map((sug) => (
                    <div
                      key={sug.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0D1B3E] border border-slate-200 dark:border-slate-700 hover:border-[#00A896]/40 transition-colors space-y-1.5"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00A896] mt-1.5 shrink-0" />
                        <div className="flex-1 text-xs">
                          <p className="text-slate-800 dark:text-slate-200 font-normal leading-relaxed">{sug.message}</p>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-[#00A896] font-normal">{sug.recommendedAction}</span>
                            <button
                              onClick={() => dismissSuggestion(sug.id)}
                              className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                            >
                              {t('teacher:suggestions.resolve')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Student Progress & Proctoring Alert Integration */}
          <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl p-6 shadow-xs border border-slate-200/90 dark:border-slate-800/80 space-y-4 transition-colors">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-light text-slate-900 dark:text-white text-lg">{t('teacher:roster.title')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light">{t('teacher:roster.subtitle')}</p>
              </div>
              <span className="text-xs font-normal text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#0D1B3E] px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                {t('teacher:roster.showingCount', { count: studentsList.length })}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-normal">
                <thead className="bg-slate-50 dark:bg-[#0D1B3E] text-slate-600 dark:text-slate-300 uppercase font-normal border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">{t('teacher:roster.colStudent')}</th>
                    <th className="p-3">{t('teacher:roster.colGrade')}</th>
                    <th className="p-3">{t('teacher:roster.colAttendance')}</th>
                    <th className="p-3">{t('teacher:roster.colPhysicsProgress')}</th>
                    <th className="p-3">{t('teacher:roster.colProctorState')}</th>
                    <th className="p-3">{t('teacher:roster.colActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {studentsList.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-normal text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#00A896]/15 text-[#00A896] flex items-center justify-center font-normal text-xs">
                          {stu.name.charAt(0)}
                        </div>
                        <div>
                          <div>{stu.name}</div>
                          <div className="text-[10px] text-slate-400 font-light">{stu.email}</div>
                        </div>
                      </td>
                      <td className="p-3 font-normal text-slate-700 dark:text-slate-300">{stu.grade}</td>
                      <td className="p-3">
                        <span className="font-normal text-[#00A896] bg-[#00A896]/15 px-2 py-0.5 rounded-full border border-[#00A896]/30">
                          {stu.attendance}%
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="w-32 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#00A896] h-full rounded-full"
                            style={{ width: `${stu.physicsProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block font-light">{stu.physicsProgress}%</span>
                      </td>
                      <td className="p-3">
                        {stu.activeProctorStatus === 'Clear' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            {translateStatusLabel('Clear', t)}
                          </span>
                        ) : stu.activeProctorStatus === 'Head Rotation' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            {translateStatusLabel('Head Rotation', t)}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
                            {translateStatusLabel('Multiple Faces', t)}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            const customQuiz = quizzes[0];
                            if (customQuiz) publishQuiz(customQuiz);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#00A896]/10 hover:bg-[#00A896]/20 text-[#00A896] font-normal text-[11px] transition-colors cursor-pointer border border-[#00A896]/30"
                        >
                          {t('teacher:roster.sendPracticeQuiz')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}
        </div>
      </div>

      {/* MODAL: Full Lesson Plan View */}
      {activePlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-6 relative text-slate-900 dark:text-white transition-colors">
            <button
              onClick={() => setActivePlanModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              title={t('teacher:inspectModal.close')}
            >
              ✕
            </button>

            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-normal text-[#00A896] bg-[#00A896]/15 px-2.5 py-0.5 rounded-full border border-[#00A896]/30">
                  {t('teacher:inspectModal.lessonPlanBadge', { grade: activePlanModal.grade })}
                </span>
                <h2 className="text-xl font-light text-slate-900 dark:text-white mt-1">
                  {activePlanModal.topic} ({activePlanModal.duration})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                  {t('teacher:inspectModal.approachLabel', {
                    style: t(`teacher:lessonStudio.styles.${activePlanModal.style}`, { defaultValue: activePlanModal.style }),
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-normal">
              <div>
                <h4 className="font-normal text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00A896]" />
                  {t('teacher:lessonStudio.objectives')}
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300 font-light">
                  {activePlanModal.learningObjectives?.map((obj: string, i: number) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              {activePlanModal.warmUpActivity && (
                <div className="p-4 rounded-2xl bg-[#00A896]/10 border border-[#00A896]/30">
                  <span className="font-normal text-[#00A896] block mb-1">
                    {t('teacher:inspectModal.warmUpActivity', {
                      title: activePlanModal.warmUpActivity.title,
                      duration: activePlanModal.warmUpActivity.duration,
                    })}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-light">{activePlanModal.warmUpActivity.prompt}</p>
                </div>
              )}

              <div>
                <h4 className="font-normal text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#00A896]" />
                  {t('teacher:lessonStudio.activities')}
                </h4>
                <div className="space-y-2">
                  {activePlanModal.coreActivities?.map((act: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1B3E] border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between font-normal text-slate-800 dark:text-slate-200">
                        <span>{act.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-light">{act.duration}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1 font-light">{act.description}</p>
                      {act.teacherGuide && (
                        <p className="text-[11px] text-[#00A896] mt-1 italic font-light">
                          {t('teacher:inspectModal.teacherNote', { note: act.teacherGuide })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {activePlanModal.readingMaterial && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1B3E] border border-slate-200 dark:border-slate-700">
                  <span className="font-normal text-slate-900 dark:text-white block mb-1">{t('teacher:inspectModal.readingSummary')}</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-light">{activePlanModal.readingMaterial}</p>
                </div>
              )}

              {activePlanModal.homeworkChallenge && (
                <div className="p-4 rounded-2xl bg-[#00A896]/10 border border-[#00A896]/30">
                  <span className="font-normal text-[#00A896] block mb-1">{t('teacher:inspectModal.homeworkChallenge')}</span>
                  <p className="text-slate-700 dark:text-slate-300 font-light">{activePlanModal.homeworkChallenge}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-xs font-normal flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t('teacher:lessonStudio.downloadPlan')}</span>
              </button>
              <button
                onClick={() => setActivePlanModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-normal cursor-pointer"
              >
                {t('teacher:inspectModal.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Full Quiz Inspect View */}
      {activeQuizModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-6 relative text-slate-900 dark:text-white transition-colors">
            <button
              onClick={() => setActiveQuizModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              title={t('teacher:inspectModal.close')}
            >
              ✕
            </button>

            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-normal text-[#00A896] bg-[#00A896]/15 px-2.5 py-0.5 rounded-full border border-[#00A896]/30">
                {t('teacher:inspectModal.assessmentBadge', { topic: activeQuizModal.topic })}
              </span>
              <h2 className="text-xl font-light text-slate-900 dark:text-white mt-1">{activeQuizModal.title}</h2>
            </div>

            <div className="space-y-4 font-normal">
              {activeQuizModal.questions?.map((q: any, i: number) => (
                <div key={q.id || i} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1B3E] border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="font-normal text-slate-900 dark:text-white">
                    {i + 1}. {q.question}
                  </div>
                  <div className="space-y-1">
                    {q.options?.map((opt: string, optIdx: number) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-lg border flex items-center justify-between ${
                          optIdx === q.answerIndex
                            ? 'bg-[#00A896]/15 border-[#00A896] text-[#00A896] font-normal'
                            : 'bg-white dark:bg-[#12234e] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{opt}</span>
                        {optIdx === q.answerIndex && (
                          <span className="text-[10px] text-[#00A896] font-normal uppercase">{t('teacher:inspectModal.correctAnswer')}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 font-light">
                    {t('teacher:inspectModal.explanationLabel', { text: q.explanation })}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  publishQuiz(activeQuizModal, selectedClass);
                  setActiveQuizModal(null);
                  setIsBroadcastedRecently(true);
                  setBroadcastBannerData({ title: activeQuizModal.title, targetClass: selectedClass, isFull: false });
                  setTimeout(() => setIsBroadcastedRecently(false), 4500);
                }}
                className="px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-xs font-normal flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#00A896]/20"
              >
                <Send className="w-4 h-4" />
                <span>{t('teacher:inspectModal.publishNow')}</span>
              </button>
              <button
                onClick={() => setActiveQuizModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-normal cursor-pointer"
              >
                {t('teacher:inspectModal.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Interactive Broadcast Quiz Dialog */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#0B1E38] rounded-3xl max-w-xl w-full border border-slate-200 dark:border-[#152B4D] shadow-2xl overflow-hidden my-6 transition-colors">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#0D1B3E] via-[#0B1E38] to-[#00A896] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white font-normal shadow-inner">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-normal tracking-wide text-white">{t('teacher:broadcastModal.title')}</h3>
                  <p className="text-xs text-white/80 font-light">{t('teacher:broadcastModal.subtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-normal text-xs text-slate-700 dark:text-slate-300">
              {/* Target Class Cohort */}
              <div>
                <label className="block text-xs font-normal text-slate-800 dark:text-slate-200 mb-1.5">
                  {t('teacher:broadcastModal.targetClass')}
                </label>
                <select
                  value={broadcastTargetClass}
                  onChange={(e) => setBroadcastTargetClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E3E6B] bg-slate-50 dark:bg-[#0D1B3E] text-slate-900 dark:text-white text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                >
                  <option value="Class 7B - Science">{t('teacher:classes.studentsCount', { name: t('teacher:classes.class7BScience'), count: 28 })}</option>
                  <option value="Class 8A - Physics">{t('teacher:classes.studentsCount', { name: t('teacher:classes.class8APhysics'), count: 32 })}</option>
                  <option value="Class 8C - Adv Biology">{t('teacher:classes.studentsCount', { name: t('teacher:classes.class8CBio'), count: 24 })}</option>
                  <option value="All Enrolled Classes">{t('teacher:classes.studentsCount', { name: t('teacher:classes.allEnrolled'), count: 84 })}</option>
                </select>
              </div>

              {/* Assessment Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-normal text-slate-800 dark:text-slate-200">
                    {t('teacher:broadcastModal.selectAssessment')}
                  </label>
                  <span className="text-[10px] text-[#00A896] font-normal">
                    {t('teacher:broadcastModal.quizzesAvailable', { count: quizzes.length })}
                  </span>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {quizzes.map((q) => {
                    const isSelected = (selectedBroadcastQuizId || quizzes[0]?.id) === q.id;
                    return (
                      <div
                        key={q.id}
                        onClick={() => setSelectedBroadcastQuizId(q.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#00A896]/10 dark:bg-[#00A896]/15 border-[#00A896] text-[#00A896]'
                            : 'bg-white dark:bg-[#12234e] border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-[#00A896] bg-[#00A896]' : 'border-slate-400'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <p className="font-normal text-slate-900 dark:text-white text-xs">{q.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-0.5">
                              {t('teacher:broadcastModal.quizMeta', { topic: q.topic, count: q.questions.length, grade: q.grade })}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-normal ${isSelected ? 'bg-[#00A896] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          {isSelected ? t('teacher:broadcastModal.selected') : t('teacher:broadcastModal.choose')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Broadcast Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-normal text-slate-700 dark:text-slate-300 mb-1">
                    {t('teacher:broadcastModal.durationLabel')}
                  </label>
                  <select
                    value={broadcastDuration}
                    onChange={(e) => setBroadcastDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3E6B] bg-slate-50 dark:bg-[#0D1B3E] text-slate-900 dark:text-white text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                  >
                    <option value="10 Minutes">{t('teacher:broadcastModal.durations.10 Minutes')}</option>
                    <option value="15 Minutes">{t('teacher:broadcastModal.durations.15 Minutes')}</option>
                    <option value="20 Minutes">{t('teacher:broadcastModal.durations.20 Minutes')}</option>
                    <option value="30 Minutes">{t('teacher:broadcastModal.durations.30 Minutes')}</option>
                    <option value="Unlimited">{t('teacher:broadcastModal.durations.Unlimited')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-slate-700 dark:text-slate-300 mb-1">
                    {t('teacher:broadcastModal.proctoringLabel')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setBroadcastProctoring(!broadcastProctoring)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-normal flex items-center justify-between transition-colors cursor-pointer ${
                      broadcastProctoring
                        ? 'bg-[#00A896]/15 border-[#00A896] text-[#00A896]'
                        : 'bg-slate-50 dark:bg-[#0D1B3E] border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <span>{broadcastProctoring ? t('teacher:broadcastModal.proctoringOn') : t('teacher:broadcastModal.proctoringOff')}</span>
                    <span className="text-[10px]">{broadcastProctoring ? t('teacher:broadcastModal.on') : t('teacher:broadcastModal.off')}</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-normal cursor-pointer transition-colors"
                >
                  {t('teacher:broadcastModal.cancel')}
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteBroadcast()}
                  className="px-5 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-xs font-normal flex items-center gap-2 shadow-md shadow-[#00A896]/20 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('teacher:broadcastModal.broadcastNowBtn', { targetClass: getClassLabel(broadcastTargetClass) })}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
