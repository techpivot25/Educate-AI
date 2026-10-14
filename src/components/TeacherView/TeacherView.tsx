import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { PivotIQLogo } from '../common/PivotIQLogo';
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
    subjectsDB,
    topicsDB,
    setEcosystemOverviewMode,
  } = useApp();

  const { theme, toggleTheme } = useTheme();

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

  // Broadcast Quiz State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedBroadcastQuizId, setSelectedBroadcastQuizId] = useState<string>(quizzes[0]?.id || '');
  const [broadcastTargetClass, setBroadcastTargetClass] = useState<string>(selectedClass);
  const [broadcastDuration, setBroadcastDuration] = useState('15 Minutes');
  const [broadcastProctoring, setBroadcastProctoring] = useState(true);
  const [broadcastSuccessMessage, setBroadcastSuccessMessage] = useState<string | null>(null);
  const [isBroadcastedRecently, setIsBroadcastedRecently] = useState(false);

  const handleExecuteBroadcast = (targetQuiz?: any) => {
    const quizToBroadcast = targetQuiz || quizzes.find((q) => q.id === selectedBroadcastQuizId) || quizzes[0];
    if (!quizToBroadcast) return;
    
    publishQuiz(quizToBroadcast, broadcastTargetClass);
    setIsBroadcastedRecently(true);
    setBroadcastSuccessMessage(`Assessment "${quizToBroadcast.title}" is now broadcasting live to ${broadcastTargetClass}! Real-time student proctoring & responses are active.`);
    setIsBroadcastModalOpen(false);
    
    setTimeout(() => {
      setIsBroadcastedRecently(false);
    }, 4500);
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
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
    { id: 'workspace', label: "Teacher's Desktop", icon: <Briefcase className="w-4 h-4" /> },
    { id: 'lesson-plans', label: 'AI Lesson Studio', icon: <FileText className="w-4 h-4" />, badge: `${lessonPlans.length}` },
    { id: 'quizzes', label: 'Assessment Creator', icon: <CheckCircle2 className="w-4 h-4" />, badge: `${quizzes.length}` },
    { id: 'classes', label: 'Class Analytics & KPIs', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'roster', label: 'Student Roster & Proctor', icon: <Users className="w-4 h-4" />, badge: '6 Live' },
    { id: 'curriculum', label: 'Grades 6-12 Curriculum', icon: <BookOpen className="w-4 h-4" /> },
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
                  PivotIQ
                </h1>
                <div className="flex items-center gap-1.5 text-[10px] text-[#00A896] font-normal uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#00A896] animate-pulse" />
                  <span>Educator Portal</span>
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
            title="Manage Teacher Profile"
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
                  alt="Faculty"
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
                {currentUser?.department || 'ALL STEM SUBJECTS'} &bull; Gr 6-12
              </p>
            </div>
          </div>

          {/* Navigation Links Menu - Changes only color upon selection, NO BOLD */}
          <div className="space-y-1 pt-1">
            <span className="px-3 text-[10px] font-normal uppercase tracking-wider text-slate-400">
              Platform Menu
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
                <span className="truncate max-w-[130px]">{selectedClass}</span>
              </span>
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-md bg-[#00A896] text-white">
                Active
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
              <span>Faculty</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-[#132A4C] hover:bg-[#1C3A66] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => setCurrentRole('admin')}
                className="flex items-center gap-1 text-[11px] font-normal text-[#00A896] hover:text-teal-300 transition-colors cursor-pointer"
                title="Return to Admin Panel"
              >
                <span>Admin &rarr;</span>
              </button>
            ) : (
              <button
                onClick={logout}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Sign Out"
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Open Navigation"
              >
                <Menu className="w-5 h-5 stroke-[2.2]" />
              </button>

              <div>
                <h2 className="text-base sm:text-lg font-light text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                  <span>A Teacher's Desktop</span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-light">
                  Academic Year 2026–2027 &bull; {selectedClass} &bull; Socratic Curriculum Alignment
                </p>
              </div>
            </div>

            {/* Right: Quick Context Controls & Badges */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Class Selector Badge */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-[#00A896]" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="text-xs font-normal text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="Class 7B - Science" className="dark:bg-slate-900">Class 7B - Science (28 Students)</option>
                  <option value="Class 8A - Physics" className="dark:bg-slate-900">Class 8A - Physics (32 Students)</option>
                  <option value="Class 8C - Adv Biology" className="dark:bg-slate-900">Class 8C - Adv Biology (24 Students)</option>
                </select>
              </div>

              {/* Broadcast Action Button */}
              <button
                onClick={() => {
                  setSelectedBroadcastQuizId(quizzes[0]?.id || '');
                  setBroadcastTargetClass(selectedClass);
                  setIsBroadcastModalOpen(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-normal shadow-sm transition-all cursor-pointer ${
                  isBroadcastedRecently
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-[#00A896] hover:bg-[#009282] text-white shadow-[#00A896]/20'
                }`}
                title="Broadcast Live Assessment to Student Portal"
              >
                {isBroadcastedRecently ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Broadcasted! ✓</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Quiz</span>
                  </>
                )}
              </button>

              {/* Workflow & Ecosystem Map Button */}
              <button
                onClick={() => setEcosystemOverviewMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-normal text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer"
                title="View 3-Panel Connected Workflow & Data Flow"
              >
                <Layers className="w-3.5 h-3.5 text-[#00A896]" />
                <span className="hidden sm:inline">Workflow Map</span>
              </button>

              {/* Date pill */}
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-normal text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentDateStr}</span>
              </div>

              {/* Direct Profile trigger avatar */}
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-[#00A896]/60 bg-[#0D1B3E] flex items-center justify-center text-white text-xs font-normal shadow-xs hover:scale-105 transition-all cursor-pointer"
                title="Account Settings"
              >
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{(currentUser?.name || 'T').charAt(0)}</span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* LIVE ASSESSMENT BROADCAST BANNER IN TEACHER DESKTOP */}
        {broadcastSuccessMessage && (
          <div className="bg-gradient-to-r from-[#00A896] via-[#0D1B3E] to-[#0B1E38] text-white px-4 py-3 shadow-md flex items-center justify-between z-20 border-b border-[#00A896]/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center animate-pulse shrink-0">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-normal uppercase tracking-wider bg-[#00A896] text-white px-2 py-0.5 rounded-full">
                    LIVE BROADCAST ACTIVE
                  </span>
                  <span className="font-normal text-xs sm:text-sm">{broadcastSuccessMessage}</span>
                </div>
                <p className="text-[11px] text-white/80 font-light mt-0.5">
                  Synchronized with Socratic Practice tab in Student Portal &bull; Anomaly detection ready
                </p>
              </div>
            </div>
            <button
              onClick={() => setBroadcastSuccessMessage(null)}
              className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white cursor-pointer shrink-0"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =========================================================================
            3. MAIN BODY WORKSPACE (with Student Panel dark/light navy aesthetic)
            ========================================================================= */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
          {/* TOP CONTEXT SELECTION & ASSISTED PREVIEW BAR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* FACULTY PROFILE CARD */}
            <div className="md:col-span-4 bg-white dark:bg-[#0E1A2D] rounded-3xl p-5 shadow-xs border border-slate-200/90 dark:border-slate-800/80 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-normal uppercase tracking-wider text-slate-400">
                  Faculty Profile
                </span>
                <span className="text-[10px] text-[#00A896] bg-[#00A896]/10 px-2 py-0.5 rounded-full font-normal">
                  STEM Faculty
                </span>
              </div>
              <div className="flex items-center gap-3.5 pt-3">
                <div className="w-13 h-13 rounded-2xl bg-[#0D1B3E] border-2 border-[#00A896] p-0.5 shadow-sm flex items-center justify-center text-white text-base font-normal overflow-hidden shrink-0">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="Teacher Avatar"
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <img
                      src="https://api.dicebear.com/7.x/bottts/svg?seed=ProfEliza"
                      alt="Teacher Avatar"
                      className="w-full h-full rounded-xl object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-normal text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">
                    {currentUser?.name || 'PROF. ELIZA G., Ph.D.'}
                  </h3>
                  <p className="text-xs text-[#00A896] font-normal uppercase tracking-wide truncate mt-0.5">
                    {currentUser?.department || 'ALL STEM SUBJECTS (Grades 6-12)'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-light mt-0.5">
                    Assigned: 7B Science, 8A Physics, 10th AP
                  </p>
                </div>
              </div>
            </div>

            {/* DEDICATED SUBJECT/GRADE CONTEXT SELECTOR & ACTION CARDS */}
            <div className="md:col-span-8 bg-white dark:bg-[#0E1A2D] rounded-3xl p-5 shadow-xs border border-slate-200/90 dark:border-slate-800/80 transition-colors space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-normal uppercase tracking-wider text-[#00A896]">
                    Current Subject / Grade Context:
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                    Select context to dynamically configure AI lesson plans, quiz prompts, and student monitoring.
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
                        const relatedTopic = topicsDB.find((t) => t.subject_id === matchedSubj.id && t.status === 'ACTIVE');
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
                    <optgroup label="Real-Time Admin Curriculum">
                      {subjectsDB
                        .filter((s) => s.status === 'ACTIVE')
                        .map((subj) => (
                          <option key={subj.id} value={`Grade ${subj.grade_level} ${subj.name}`}>
                            [Grade {subj.grade_level} {subj.name}]
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Syllabus Explorer">
                      <option value="full-list">[Full Grades 6-12 Syllabus Explorer...]</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Context-Driven Assisted Lesson Plans & Live Video Box */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-6 space-y-2">
                  <span className="text-[11px] font-normal uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Assisted Lesson Plans
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                    High-yield curriculum alignment calibrated to <strong className="font-normal text-[#00A896]">{teacherSubjectContext}</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-normal bg-[#00A896]/15 text-[#00A896] border border-[#00A896]/30">
                      Active Context: {teacherSubjectContext}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80"
                      alt="Classroom Studio"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute top-2 left-2 bg-[#00A896] text-white text-[9px] font-normal px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>LIVE STUDIO</span>
                    </div>
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-normal px-2 py-0.5 rounded-md shadow-sm">
                      ✔ Sync Ready
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
                        AI Lesson Plan Generator
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light">Autonomous curriculum alignment</p>
                    </div>
                  </div>

                  <form onSubmit={handleGeneratePlan} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-normal text-slate-700 dark:text-slate-300 mb-1">Topic</label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Photosynthesis"
                        className="w-full bg-slate-50 dark:bg-[#0D1B3E] text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00A896] transition-all font-normal"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-normal text-slate-700 dark:text-slate-300 mb-1">Grade</label>
                        <select
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#0D1B3E] text-slate-900 dark:text-white text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00A896] font-normal cursor-pointer"
                        >
                          <option value="6th">6th</option>
                          <option value="7th">7th</option>
                          <option value="8th">8th</option>
                          <option value="9th">9th</option>
                          <option value="10th">10th</option>
                          <option value="AP/Honors">AP / Honors</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-normal text-slate-700 dark:text-slate-300 mb-1">Style</label>
                        <select
                          value={style}
                          onChange={(e) => setStyle(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#0D1B3E] text-slate-900 dark:text-white text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00A896] font-normal cursor-pointer"
                        >
                          <option value="Interactive">Interactive</option>
                          <option value="Socratic Inquiry">Socratic Inquiry</option>
                          <option value="Project-Based">Project-Based</option>
                          <option value="Remedial Synthesis">Remedial Synthesis</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isDraftingPlan}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#00A896] hover:bg-[#009282] disabled:opacity-50 text-white font-normal text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isDraftingPlan ? 'Drafting Curriculum with AI...' : 'Generate Lesson Plan'}</span>
                    </button>
                  </form>
                </div>

                {/* AI Drafting Progress Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1B3E] border border-slate-200 dark:border-slate-700 space-y-2.5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-normal text-xs">
                      <span className="w-2 h-2 rounded-full bg-[#00A896] animate-ping" />
                      <span>AI Drafting Status</span>
                    </div>
                    <span className="text-[10px] text-[#00A896] font-normal">
                      {isDraftingPlan ? 'Generating...' : 'Ready'}
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
                      <span>Objectives</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#00A896]" />
                      <span>Activities</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#00A896]" />
                      <span>Reading</span>
                    </div>
                  </div>

                  {lessonPlans.length > 0 && (
                    <button
                      onClick={() => setActivePlanModal(lessonPlans[0])}
                      className="w-full mt-2 py-1.5 px-3 rounded-lg bg-white dark:bg-[#12234e] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-[#00A896]/10 text-xs font-normal transition-colors cursor-pointer text-center"
                    >
                      Inspect Plan: "{lessonPlans[0].topic}"
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
                        Quiz Creator
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light">Instant MCQs & detailed explanations</p>
                    </div>
                  </div>

                  <form onSubmit={handleGenerateQuiz} className="space-y-4">
                    <div>
                      <label className="block text-xs font-normal text-slate-700 dark:text-slate-300 mb-1.5">
                        Prompt or Topic Description
                      </label>
                      <textarea
                        rows={5}
                        value={quizPrompt}
                        onChange={(e) => setQuizPrompt(e.target.value)}
                        placeholder="e.g. Draft a 10-question MCQ quiz on Plant Cells"
                        className="w-full bg-slate-50 dark:bg-[#0D1B3E] text-slate-900 dark:text-white text-xs p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00A896] transition-all font-normal resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isDraftingQuiz || !quizPrompt.trim()}
                      className="w-full py-3 px-4 rounded-xl bg-[#00A896] hover:bg-[#009282] disabled:opacity-50 text-white font-normal text-sm shadow-md shadow-[#00A896]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isDraftingQuiz ? 'AI Generating Assessment...' : 'Generate Quiz'}</span>
                    </button>
                  </form>
                </div>

                {/* Recent Quizzes List preview */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1B3E] border border-slate-200 dark:border-slate-700 space-y-2 transition-colors">
                  <div className="flex items-center justify-between text-xs text-slate-900 dark:text-slate-100 font-normal">
                    <span>Class Assessments Pool</span>
                    <span className="text-[10px] text-[#00A896] font-normal">{quizzes.length} Quizzes</span>
                  </div>
                  {quizzes.slice(0, 2).map((q) => (
                    <div
                      key={q.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#12234e] border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="truncate max-w-[160px]">
                        <div className="font-normal text-slate-800 dark:text-white truncate">{q.title}</div>
                        <span className="text-[10px] text-slate-400 font-light">{q.questions.length} questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveQuizModal(q)}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-normal cursor-pointer"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => publishQuiz(q)}
                          className="px-2 py-1 rounded-lg bg-[#00A896] hover:bg-[#009282] text-white text-[11px] font-normal cursor-pointer"
                        >
                          Publish
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
                    <h3 className="font-light text-slate-900 dark:text-white text-base">My Classes</h3>
                    <span className="text-xs font-normal text-[#00A896] bg-[#00A896]/15 px-2 py-0.5 rounded-full border border-[#00A896]/30">
                      {selectedClass}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-light">Weekly Trend</span>
                </div>

                <div>
                  <span className="text-xs font-normal text-slate-700 dark:text-slate-300 block mb-2">Student Progress</span>

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
                        Science Mastery (84%)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                        Retention Velocity (76%)
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
                    AI-Powered Suggestions
                  </h3>
                  <span className="text-[10px] bg-[#00A896]/15 text-[#00A896] px-2 py-0.5 rounded-full font-normal">
                    {aiSuggestions.length} Active
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
                              Resolve
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-light text-slate-900 dark:text-white text-lg">Class Roster & Exam Proctoring Status</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light">Live synchronized tracking across student activity and exam proctoring</p>
              </div>
              <span className="text-xs font-normal text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#0D1B3E] px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                Showing 6 Core Monitored Students
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-normal">
                <thead className="bg-slate-50 dark:bg-[#0D1B3E] text-slate-600 dark:text-slate-300 uppercase font-normal border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Current Grade</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3">Physics Progress</th>
                    <th className="p-3">Exam Proctor State</th>
                    <th className="p-3">Actions</th>
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
                            Clear
                          </span>
                        ) : stu.activeProctorStatus === 'Head Rotation' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Head Rotation Flag
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
                            Multiple Faces Flag
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
                          Send Practice Quiz
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Full Lesson Plan View */}
      {activePlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-6 relative text-slate-900 dark:text-white transition-colors">
            <button
              onClick={() => setActivePlanModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-normal text-[#00A896] bg-[#00A896]/15 px-2.5 py-0.5 rounded-full border border-[#00A896]/30">
                  Lesson Plan &bull; {activePlanModal.grade} Grade
                </span>
                <h2 className="text-xl font-light text-slate-900 dark:text-white mt-1">
                  {activePlanModal.topic} ({activePlanModal.duration})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light">Approach: {activePlanModal.style}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-normal">
              <div>
                <h4 className="font-normal text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00A896]" />
                  Key Learning Objectives
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
                    Warm-Up Activity: {activePlanModal.warmUpActivity.title} ({activePlanModal.warmUpActivity.duration})
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-light">{activePlanModal.warmUpActivity.prompt}</p>
                </div>
              )}

              <div>
                <h4 className="font-normal text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#00A896]" />
                  Core Classroom Activities
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
                          Teacher Note: {act.teacherGuide}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {activePlanModal.readingMaterial && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1B3E] border border-slate-200 dark:border-slate-700">
                  <span className="font-normal text-slate-900 dark:text-white block mb-1">Reading Material Summary:</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-light">{activePlanModal.readingMaterial}</p>
                </div>
              )}

              {activePlanModal.homeworkChallenge && (
                <div className="p-4 rounded-2xl bg-[#00A896]/10 border border-[#00A896]/30">
                  <span className="font-normal text-[#00A896] block mb-1">Homework Challenge:</span>
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
                <span>Export Plan</span>
              </button>
              <button
                onClick={() => setActivePlanModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-normal cursor-pointer"
              >
                Close
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
            >
              ✕
            </button>

            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-normal text-[#00A896] bg-[#00A896]/15 px-2.5 py-0.5 rounded-full border border-[#00A896]/30">
                Assessment Questions &bull; {activeQuizModal.topic}
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
                          <span className="text-[10px] text-[#00A896] font-normal uppercase">Correct Answer</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 font-light">
                    Explanation: {q.explanation}
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
                  setBroadcastSuccessMessage(`Assessment "${activeQuizModal.title}" is now broadcasting live to ${selectedClass}!`);
                  setTimeout(() => setIsBroadcastedRecently(false), 4500);
                }}
                className="px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-xs font-normal flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#00A896]/20"
              >
                <Send className="w-4 h-4" />
                <span>Publish to Student Portal</span>
              </button>
              <button
                onClick={() => setActiveQuizModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-normal cursor-pointer"
              >
                Close
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
                  <h3 className="text-base font-normal tracking-wide text-white">Broadcast Assessment to Students</h3>
                  <p className="text-xs text-white/80 font-light">Push live timed quiz with instant student portal synchronization</p>
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
                  Target Classroom Cohort:
                </label>
                <select
                  value={broadcastTargetClass}
                  onChange={(e) => setBroadcastTargetClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E3E6B] bg-slate-50 dark:bg-[#0D1B3E] text-slate-900 dark:text-white text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                >
                  <option value="Class 7B - Science">Class 7B - Science (28 Students)</option>
                  <option value="Class 8A - Physics">Class 8A - Physics (32 Students)</option>
                  <option value="Class 8C - Adv Biology">Class 8C - Adv Biology (24 Students)</option>
                  <option value="All Enrolled Classes">All Enrolled Classes (84 Students)</option>
                </select>
              </div>

              {/* Assessment Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-normal text-slate-800 dark:text-slate-200">
                    Select Quiz to Broadcast:
                  </label>
                  <span className="text-[10px] text-[#00A896] font-normal">{quizzes.length} Quizzes Available</span>
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
                              {q.topic} &bull; {q.questions.length} Questions &bull; {q.grade}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-normal ${isSelected ? 'bg-[#00A896] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          {isSelected ? 'Selected' : 'Choose'}
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
                    Assessment Duration:
                  </label>
                  <select
                    value={broadcastDuration}
                    onChange={(e) => setBroadcastDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3E6B] bg-slate-50 dark:bg-[#0D1B3E] text-slate-900 dark:text-white text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                  >
                    <option value="10 Minutes">10 Minutes</option>
                    <option value="15 Minutes">15 Minutes (Recommended)</option>
                    <option value="20 Minutes">20 Minutes</option>
                    <option value="30 Minutes">30 Minutes</option>
                    <option value="Unlimited">Untimed Practice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-slate-700 dark:text-slate-300 mb-1">
                    AI Proctoring Shield:
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
                    <span>{broadcastProctoring ? 'Active (Anomaly Detection)' : 'Disabled (Self Paced)'}</span>
                    <span className="text-[10px]">{broadcastProctoring ? 'ON' : 'OFF'}</span>
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
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteBroadcast()}
                  className="px-5 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-xs font-normal flex items-center gap-2 shadow-md shadow-[#00A896]/20 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Send className="w-4 h-4" />
                  <span>Broadcast Now to {broadcastTargetClass}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
