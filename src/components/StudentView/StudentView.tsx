import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { FormulasAndGraphsTab } from './FormulasAndGraphsTab';
import { AgileStudyRoadmap } from './AgileStudyRoadmap';
import { PivotIQLogo } from '../common/PivotIQLogo';
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  BarChart3,
  Award,
  Send,
  Sparkles,
  Lightbulb,
  UploadCloud,
  FileQuestion,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Clock,
  Play,
  Check,
  Download,
  Share2,
  Camera,
  Edit3,
  Upload,
  X,
  Flame,
  Target,
  Mic,
  MicOff,
  Image as ImageIcon,
  Compass,
  Languages,
  Sliders,
  Globe,
  LayoutDashboard,
  Calendar,
  Layers,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Video,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Search,
  Filter,
  Plus,
  Zap,
  Binary,
  Menu,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Bell,
  User as UserIcon,
  CheckCheck,
} from 'lucide-react';
import { EducationBoard, LanguageMedium, StudentNavTab, Quiz, DigitalCertificate } from '../../types';

const SUPPORTED_BOARDS: { value: EducationBoard; label: string }[] = [
  { value: 'CBSE', label: 'CBSE (National NCERT)' },
  { value: 'ICSE', label: 'ICSE / CISCE' },
  { value: 'IB', label: 'IB (International)' },
  { value: 'IGCSE', label: 'Cambridge IGCSE' },
  { value: 'PSEB', label: 'PSEB (Punjab)' },
  { value: 'GSEB', label: 'GSEB (Gujarat)' },
  { value: 'MSBSHSE', label: 'MSBSHSE (Maharashtra)' },
  { value: 'KSEEB', label: 'KSEEB (Karnataka)' },
  { value: 'BSEAP/TOSS', label: 'BSEAP / TOSS (AP/Telangana)' },
  { value: 'WBBSE', label: 'WBBSE (West Bengal)' },
  { value: 'Tamil Nadu State Board', label: 'Tamil Nadu State Board' },
];

const SUPPORTED_LANGUAGES: { value: LanguageMedium; label: string; native: string }[] = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'hi', label: 'Hindi', native: 'हिंदी' },
  { value: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { value: 'mr', label: 'Marathi', native: 'मराठी' },
  { value: 'bn', label: 'Bengali', native: 'বাংলা' },
  { value: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { value: 'te', label: 'Telugu', native: 'తెలుగు' },
  { value: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { value: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { value: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

export const StudentView: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    studentNav,
    setStudentNav,
    chatMessages,
    isAiTyping,
    sendTutorMessage,
    doubts,
    addDoubt,
    quizzes,
    certificates,
    currentUser,
    setCurrentRole,
    logout,
    setIsProfileOpen,
    setIsCurriculumModalOpen,
    subjectsDB,
    topicsDB,
    currentBoard,
    setCurrentBoard,
    globalLanguage,
    setGlobalLanguage,
    dailyTasks,
    weeklySprints,
    masterChapters,
    exportStudyPlanSpreadsheet,
    activeStudentMeeting,
    dismissStudentMeetingAlert,
    communityPosts,
    upvoteCommunityPost,
    subscriptionState,
    notifications,
    activeBroadcastQuiz,
    setActiveBroadcastQuiz,
    setEcosystemOverviewMode,
  } = useApp();

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Student Profile Grade Context
  const studentGradeLevel = typeof currentUser?.grade_level === 'number'
    ? currentUser.grade_level
    : parseInt(String(currentUser?.grade || '10').replace(/\D/g, '')) || 10;

  const [gradeOverride, setGradeOverride] = useState(false);
  const [activeGradeFilter, setActiveGradeFilter] = useState<number>(studentGradeLevel);

  useEffect(() => {
    if (!gradeOverride) {
      setActiveGradeFilter(studentGradeLevel);
    }
  }, [studentGradeLevel, gradeOverride]);

  // Interactive Quick Doubts Input State
  const [sidebarDoubtText, setSidebarDoubtText] = useState('');
  const [isSidebarSubmitting, setIsSidebarSubmitting] = useState(false);

  // AI Tutor & Floating Widget States
  const [inputMessage, setInputMessage] = useState('');
  const [quickDoubtText, setQuickDoubtText] = useState('');
  const [quickDoubtSubject, setQuickDoubtSubject] = useState('Physics');
  const [isSubmittingDoubt, setIsSubmittingDoubt] = useState(false);
  const [isQuickDoubtsOpen, setIsQuickDoubtsOpen] = useState(false);

  // Practice Quizzes Interactive States
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Ask AI Tutor Voice Input & Homework Photo States
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [attachedImagePreview, setAttachedImagePreview] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  // Dynamic Grade-Filtered Subjects
  const filteredSubjects = subjectsDB.filter((s) => {
    if (s.status !== 'ACTIVE') return false;
    const targetGrade = gradeOverride ? activeGradeFilter : studentGradeLevel;
    return s.grade_level === targetGrade;
  });

  const displaySubjects = filteredSubjects.length > 0
    ? filteredSubjects
    : subjectsDB.filter((s) => s.status === 'ACTIVE');

  const handleSidebarDoubtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sidebarDoubtText.trim() || isSidebarSubmitting) return;
    setIsSidebarSubmitting(true);
    await addDoubt(sidebarDoubtText, 'General', 'Dashboard Quick Query');
    setSidebarDoubtText('');
    setIsSidebarSubmitting(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && !attachedImagePreview) || isAiTyping) return;
    let fullPrompt = inputMessage;
    if (attachedImagePreview) {
      fullPrompt = `[Uploaded Homework Photo Problem]: ${fullPrompt || 'Please guide me through solving this homework problem step-by-step using the Socratic method.'}`;
    }
    setInputMessage('');
    setAttachedImagePreview(null);
    await sendTutorMessage(fullPrompt);
  };

  const toggleVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setInputMessage((prev) => (prev ? `${prev} [Voice: What is Newton's 2nd Law?]` : "What is Newton's 2nd Law?"));
      return;
    }

    if (isVoiceRecording) {
      recognitionRef.current?.stop();
      setIsVoiceRecording(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsVoiceRecording(true);
        };
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsVoiceRecording(false);
        };
        recognition.onerror = () => {
          setIsVoiceRecording(false);
        };
        recognition.onend = () => {
          setIsVoiceRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('Speech recognition error:', err);
        setIsVoiceRecording(false);
      }
    }
  };

  const handleHomeworkPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickDoubtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDoubtText.trim()) return;
    setIsSubmittingDoubt(true);
    await addDoubt(quickDoubtText, quickDoubtSubject, 'Quick Popup Question');
    setQuickDoubtText('');
    setIsSubmittingDoubt(false);
  };

  // Nav Items matching the theme in the image
  const navTabs: { id: StudentNavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'formulas-graphs', label: 'Formulas & Graphs', icon: <Binary className="w-4 h-4" />, badge: 'New' },
    { id: 'my-courses', label: 'Skills Passport', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'grades', label: 'Grades & Mastery', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'practice', label: 'Practice Quizzes', icon: <FileQuestion className="w-4 h-4" /> },
    { id: 'ai-tutor', label: 'Ask Doubts AI', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
    { id: 'community', label: 'Community Q&A', icon: <Users className="w-4 h-4" /> },
  ];

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId) || quizzes[0];

  return (
    <div className="min-h-screen flex bg-[#F4F7FB] dark:bg-[#070D18] text-[#1E293B] dark:text-[#F1F5F9] font-sans antialiased transition-colors">
      {/* =========================================================================
          1. LEFT SIDEBAR NAVIGATION - Dark Navy Blue Theme (#0B1E38) + Orange Accent
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
        {/* Top Section: Brand + Student Profile Card */}
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
                  <span>Student Hub</span>
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

          {/* Student Profile Card Pill - Distinctive visual component */}
          <div
            onClick={() => setIsProfileOpen(true)}
            className="group relative p-3 rounded-2xl bg-[#132A4C]/90 hover:bg-[#16335C] border border-[#1E3E6B]/80 transition-all cursor-pointer shadow-sm flex items-center gap-3"
            title="Manage Student Profile"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[#0D1B3E] border-2 border-[#00A896] flex items-center justify-center text-white font-normal text-sm shadow-inner">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(currentUser?.name || 'S').charAt(0)}</span>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00A896] ring-2 ring-[#0D1B3E]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-normal text-white truncate group-hover:text-[#00A896] transition-colors">
                  {currentUser?.name || 'Sarah Connor'}
                </p>
                <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <p className="text-[11px] text-slate-300 font-light truncate mt-0.5">
                Grade {studentGradeLevel} &bull; {currentBoard}
              </p>
            </div>
          </div>

          {/* Navigation Links Menu */}
          <div className="space-y-1 pt-1">
            <span className="px-3 text-[10px] font-normal uppercase tracking-wider text-slate-400">
              Platform Menu
            </span>
            <nav className="space-y-1 mt-2">
              {navTabs.map((tab) => {
                const isActive = studentNav === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStudentNav(tab.id);
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

        {/* Bottom Section: Trial Status, Quick Actions & Exit */}
        <div className="p-4 sm:p-5 border-t border-[#152B4D] dark:border-slate-800/80 space-y-3 bg-[#08182E]/60">
          {/* 7-Day Free Trial Card */}
          <div className="p-3 rounded-xl bg-[#132A4C]/80 border border-[#1E3E6B]/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-normal text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00A896] animate-pulse" />
                <span>{subscriptionState.tier}</span>
              </span>
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-md bg-[#00A896] text-white">
                {subscriptionState.trialDaysLeft}d left
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#0D1B3E] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#00A896] h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(15, (7 - subscriptionState.trialDaysLeft) * 14.2))}%` }}
              />
            </div>
          </div>

          {/* Quick Footer Links: Profile, Theme, Role Switch */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer font-normal"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#00A896]" />
              <span>My Account</span>
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
                  <span>
                    {studentNav === 'dashboard' && 'Agile Study Roadmap & Daily Planner'}
                    {studentNav === 'formulas-graphs' && 'Master Formulas & Board Diagrams'}
                    {studentNav === 'my-courses' && 'Skills Passport & Enrolled Curriculum'}
                    {studentNav === 'grades' && 'Academic Performance & Mastery KPIs'}
                    {studentNav === 'practice' && 'Interactive Practice Quizzes'}
                    {studentNav === 'ai-tutor' && 'Socratic 24/7 AI Tutor'}
                    {studentNav === 'certificates' && 'Verified Digital Credentials'}
                    {studentNav === 'community' && 'Community Doubt & Q&A Forum'}
                    {studentNav === 'settings' && 'Student Account Preferences'}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  CBSE/ICSE/State Board Compliant &bull; Grade {studentGradeLevel} &bull; Socratic Mastery
                </p>
              </div>
            </div>

            {/* Right: Quick Context Controls & Badges */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Quick Board Selector Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-normal text-slate-800 dark:text-slate-200 shadow-2xs">
                <Globe className="w-3.5 h-3.5 text-[#00A896]" />
                <span>{currentBoard}</span>
              </div>

              {/* Quick Grade Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00A896]/15 dark:bg-[#00A896]/20 border border-[#00A896]/30 text-xs font-normal text-[#00A896] dark:text-[#00A896] shadow-2xs">
                <span>Grade {studentGradeLevel}</span>
              </div>

              {/* Date pill */}
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-normal text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentDateStr}</span>
              </div>

              {/* Workflow & Ecosystem Map Button */}
              <button
                onClick={() => setEcosystemOverviewMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-normal text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer"
                title="View 3-Panel Connected Workflow & Data Flow"
              >
                <Layers className="w-3.5 h-3.5 text-[#00A896]" />
                <span className="hidden sm:inline">Workflow Map</span>
              </button>

              {/* Direct Profile trigger avatar */}
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-[#00A896]/60 bg-[#0D1B3E] flex items-center justify-center text-white text-xs font-normal shadow-xs hover:scale-105 transition-all cursor-pointer"
                title="Account Settings"
              >
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{(currentUser?.name || 'S').charAt(0)}</span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* LIVE ASSESSMENT BROADCAST BANNER */}
        {activeBroadcastQuiz && (
          <div className="bg-gradient-to-r from-[#00A896] via-[#0D1B3E] to-[#0B1E38] text-white px-4 py-3 shadow-md flex items-center justify-between z-20 border-b border-[#00A896]/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center animate-pulse shrink-0">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-normal uppercase tracking-wider bg-[#00A896] text-white px-2 py-0.5 rounded-full animate-pulse">
                    LIVE QUIZ BROADCAST
                  </span>
                  <span className="font-normal text-sm">{activeBroadcastQuiz.quiz.title}</span>
                </div>
                <p className="text-xs text-white/80 font-light">
                  Target: {activeBroadcastQuiz.targetClass} &bull; Broadcast at {activeBroadcastQuiz.broadcastAt} &bull; {activeBroadcastQuiz.quiz.questions.length} Questions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveQuizId(activeBroadcastQuiz.quiz.id);
                  setStudentNav('practice');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white font-normal text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Start Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveBroadcastQuiz(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* HIGH PRIORITY GOOGLE MEET LIVE NOTIFICATION BANNER */}
        {activeStudentMeeting && (
          <div className="bg-gradient-to-r from-[#00A896] via-[#0D1B3E] to-[#0B1E38] text-white px-4 py-3 shadow-md flex items-center justify-between z-20 border-b border-[#00A896]/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center animate-pulse shrink-0">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-normal uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                    LIVE SESSION
                  </span>
                  <span className="font-normal text-sm">{activeStudentMeeting.title}</span>
                </div>
                <p className="text-xs text-white/90 font-light">
                  Hosted by {activeStudentMeeting.host_name} &bull; Google Meet Room is ready
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={activeStudentMeeting.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-xl bg-white text-[#0D1B3E] font-normal text-xs hover:bg-white/90 shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span>Join Meeting</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={dismissStudentMeetingAlert}
                className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. MAIN CONTAINER FOR CONDITIONAL STUDENT TABS
            ========================================================================= */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1 space-y-6">
          {/* TAB 1: MAIN DASHBOARD VIEW (Roadmap + Filters + Doubts + Momentum) */}
          {studentNav === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Center / Left: Agile Study Roadmap */}
              <div className="lg:col-span-8 space-y-6">
                <AgileStudyRoadmap />
              </div>

              {/* Right Sidebar: Grade & Board Filters, Quick Doubts AI, Momentum */}
              <div className="lg:col-span-4 space-y-6">
                {/* CARD 1: GRADE & BOARD FILTERS */}
                <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
                  <h3 className="text-xs font-light uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Grade & Board Filters
                  </h3>

                  {/* Grade Selector Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Grade Level
                    </label>
                    <div className="relative">
                      <select
                        value={activeGradeFilter}
                        onChange={(e) => {
                          setGradeOverride(true);
                          setActiveGradeFilter(Number(e.target.value));
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] appearance-none cursor-pointer"
                      >
                        <option value={10}>Grade 10</option>
                        <option value={6}>Grade 6</option>
                        <option value={7}>Grade 7</option>
                        <option value={8}>Grade 8</option>
                        <option value={9}>Grade 9</option>
                        <option value={11}>Grade 11 (Science)</option>
                        <option value={12}>Grade 12 (Advanced)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Education Board Selector Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Governing Board
                    </label>
                    <div className="relative">
                      <select
                        value={currentBoard}
                        onChange={(e) => setCurrentBoard(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] appearance-none cursor-pointer"
                      >
                        {SUPPORTED_BOARDS.map((b) => (
                          <option key={b.value} value={b.value}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Multilingual Medium Selector Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Language Medium</span>
                    </label>
                    <div className="relative">
                      <select
                        value={globalLanguage}
                        onChange={(e) => setGlobalLanguage(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] appearance-none cursor-pointer"
                      >
                        {SUPPORTED_LANGUAGES.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label} ({l.native})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Vector RAG Synced</span>
                    </span>
                    <button
                      onClick={() => setIsCurriculumModalOpen(true)}
                      className="font-bold text-[#FF6B00] hover:underline cursor-pointer"
                    >
                      View Syllabus &rarr;
                    </button>
                  </div>
                </div>

                {/* CARD 2: QUICK DOUBTS AI CHAT PANEL */}
                <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/80 text-[#FF6B00] flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-light text-slate-900 dark:text-white leading-tight">
                          Quick Doubts AI
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Ask questions on the fly
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      24/7 Live
                    </span>
                  </div>

                  {/* Socratic Assistant Greeting Bubble */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2 mb-1 text-[11px] font-bold text-[#FF6B00]">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Tutor Assistant</span>
                    </div>
                    "Hi! Stuck on a concept or formula in your study plan? Type it below and I'll break it down step-by-step!"
                  </div>

                  {/* Interactive Input with Send Arrow Button */}
                  <form onSubmit={handleSidebarDoubtSubmit} className="relative">
                    <input
                      type="text"
                      value={sidebarDoubtText}
                      onChange={(e) => setSidebarDoubtText(e.target.value)}
                      placeholder="Ask a quick doubt..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white pl-3.5 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!sidebarDoubtText.trim() || isSidebarSubmitting}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Recent Resolved Doubts snippet */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500 uppercase tracking-wider">
                        Recent Activity
                      </span>
                      <span className="text-[#FF6B00] font-bold">
                        {doubts.length} Doubts Logged
                      </span>
                    </div>
                    {doubts.slice(0, 2).map((d) => (
                      <div
                        key={d.id}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] space-y-0.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{d.question}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                            {d.status}
                          </span>
                        </div>
                        {d.solution && (
                          <p className="text-slate-500 line-clamp-1 text-[10px]">{d.solution}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CARD 3: STUDY SPRINT GOALS (Student Momentum) */}
                <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-light uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-[#FF6B00]" />
                      <span>Study Momentum</span>
                    </h3>
                    <span className="text-[11px] font-extrabold text-[#FF6B00] bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800/60">
                      5-Day Streak 🔥
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Weekly Core Math:</span>
                      <span className="font-bold text-slate-900 dark:text-white">10.5 / 10.5 hrs</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FFA04D] h-full rounded-full w-4/5" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                      <Target className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Next Milestone: Quadratic Formula Drills</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEDICATED FORMULAS & GRAPHS TAB */}
          {studentNav === 'formulas-graphs' && (
            <FormulasAndGraphsTab
              currentGrade={studentGradeLevel}
              currentBoard={currentBoard}
            />
          )}

          {/* TAB 3: SKILLS PASSPORT / ENROLLED COURSES */}
          {studentNav === 'my-courses' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-light text-slate-900 dark:text-white tracking-wide">Skills Passport & Subject Units</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Auto-aligned to Grade {studentGradeLevel} &bull; {currentBoard} Governing Curriculum
                  </p>
                </div>
                <button
                  onClick={() => setIsCurriculumModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#E56000] transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4" />
                  <span>Browse Full Grades 6-12 Curriculum</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displaySubjects.map((sub) => {
                  const topicsForSub = topicsDB.filter((t) => t.subject_id === sub.id && t.status === 'ACTIVE');
                  return (
                    <div
                      key={sub.id}
                      className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/80 text-[#FF6B00] flex items-center justify-center font-bold text-lg">
                          {sub.name.charAt(0)}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {sub.code || `GR-${sub.grade_level}`}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-light text-base text-slate-900 dark:text-white">{sub.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{sub.description}</p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Active Units ({topicsForSub.length}):
                        </span>
                        <div className="space-y-1">
                          {topicsForSub.slice(0, 3).map((top) => (
                            <div key={top.id} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                              <span className="truncate">{top.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setStudentNav('ai-tutor');
                            sendTutorMessage(`Let's start tutoring on ${sub.name} - ${topicsForSub[0]?.title || 'Core Syllabus'}.`);
                          }}
                          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#FF6B00] hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Launch AI Tutor Drill</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: GRADES & MASTERY */}
          {studentNav === 'grades' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <h2 className="text-2xl font-light text-slate-900 dark:text-white tracking-wide">Academic Performance & Mastery KPIs</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Cumulative GPA: 3.82 / 4.0 &bull; Board Compliance: 98% &bull; Grade {studentGradeLevel}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0E1A2D] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
                  <div className="text-3xl font-black text-[#FF6B00]">88%</div>
                  <div className="text-xs font-bold text-slate-500 mt-1">Overall Mastery</div>
                </div>
                <div className="bg-white dark:bg-[#0E1A2D] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
                  <div className="text-3xl font-black text-[#0B1E38] dark:text-[#7DA0FA]">85%</div>
                  <div className="text-xs font-bold text-slate-500 mt-1">Physics Ch. 2</div>
                </div>
                <div className="bg-white dark:bg-[#0E1A2D] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
                  <div className="text-3xl font-black text-emerald-600">95%</div>
                  <div className="text-xs font-bold text-slate-500 mt-1">Algebra I (Core)</div>
                </div>
                <div className="bg-white dark:bg-[#0E1A2D] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
                  <div className="text-3xl font-black text-amber-500">98%</div>
                  <div className="text-xs font-bold text-slate-500 mt-1">Attendance</div>
                </div>
              </div>

              {/* Remedial drill banner */}
              <div className="p-5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 space-y-2">
                <div className="flex items-center gap-2 text-[#FF6B00] font-extrabold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Targeted Remedial Opportunity</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Review flagged doubt: <strong>Action-Reaction pairs on isolated systems (Newton's 3rd Law)</strong>. Recommend completing 3 rapid practice assessments.
                </p>
                <button
                  onClick={() => {
                    setStudentNav('ai-tutor');
                    sendTutorMessage("Can we practice Newton's 3rd Law action-reaction pairs?");
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#E56000] transition-colors cursor-pointer shadow-sm"
                >
                  Start Targeted Practice
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PRACTICE QUIZZES & ASSESSMENTS */}
          {studentNav === 'practice' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-light text-slate-900 dark:text-white tracking-wide">Interactive Practice Quizzes</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Reinforce concepts with board-compliant MCQs & instant feedback
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] border border-orange-200 dark:border-orange-800/60">
                  {quizzes.length} Quizzes Available
                </span>
              </div>

              {/* Quiz Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    onClick={() => {
                      setActiveQuizId(quiz.id);
                      setSelectedAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      activeQuizId === quiz.id
                        ? 'bg-orange-50/50 dark:bg-orange-950/20 border-[#FF6B00] ring-2 ring-[#FF6B00]/20'
                        : 'bg-white dark:bg-[#0E1A2D] border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {quiz.grade || `Grade ${studentGradeLevel}`}
                      </span>
                      <span className="text-xs font-bold text-[#FF6B00]">
                        {quiz.questions?.length || 3} Questions
                      </span>
                    </div>
                    <h3 className="font-light text-slate-900 dark:text-white text-base">{quiz.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{quiz.topic}</p>
                  </div>
                ))}
              </div>

              {/* Active Quiz Player */}
              {activeQuiz && (
                <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="text-lg font-light text-slate-900 dark:text-white">{activeQuiz.title}</h3>
                    <p className="text-xs text-slate-500">{activeQuiz.topic} &bull; Select the best answer for each question</p>
                  </div>

                  <div className="space-y-6">
                    {activeQuiz.questions.map((q, qIndex) => {
                      const userSelection = selectedAnswers[qIndex];
                      const isCorrect = userSelection === q.answerIndex;
                      return (
                        <div key={q.id || qIndex} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-3">
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            {qIndex + 1}. {q.question}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIndex) => {
                              const isOptionSelected = userSelection === optIndex;
                              return (
                                <button
                                  key={optIndex}
                                  onClick={() => !quizSubmitted && setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }))}
                                  disabled={quizSubmitted}
                                  className={`p-3 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer border ${
                                    isOptionSelected
                                      ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-xs'
                                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIndex)}. {opt}
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div className={`p-2.5 rounded-lg text-xs font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'}`}>
                              <strong>{isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}</strong>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Reset
                    </button>

                    {!quizSubmitted ? (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold shadow-sm shadow-orange-500/25 cursor-pointer"
                      >
                        Submit Answers
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600">
                        Score: {Object.entries(selectedAnswers).filter(([idx, val]) => activeQuiz.questions[Number(idx)]?.answerIndex === val).length} / {activeQuiz.questions.length} Correct
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: AI TUTOR (FULL SCREEN SOCRATIC CONVERSATION) */}
          {studentNav === 'ai-tutor' && (
            <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl shadow-sm border border-slate-200/90 dark:border-slate-800/80 flex flex-col h-[700px] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-light text-slate-900 dark:text-white text-base">
                      Socratic AI Tutor
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                      <span>&bull;</span>
                      <span>{currentBoard} Grade {studentGradeLevel} Alignment</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => sendTutorMessage('Can you summarize our key physics takeaways today?')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Summary
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${
                      msg.sender === 'student' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-xl bg-[#0B1E38] text-white flex items-center justify-center shrink-0">
                        <Lightbulb className="w-4 h-4 text-orange-400" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                        msg.sender === 'student'
                          ? 'bg-[#FF6B00] text-white rounded-br-xs font-medium'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      {msg.mathFormula && (
                        <div className="mt-2 p-2 rounded-lg bg-black/5 dark:bg-black/30 font-mono text-xs text-[#FF6B00] font-bold">
                          {msg.mathFormula}
                        </div>
                      )}
                      <span
                        className={`text-[10px] block mt-1 text-right ${
                          msg.sender === 'student' ? 'text-white/70' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.sender === 'student' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-[#FF6B00] bg-[#FF6B00] flex items-center justify-center text-white font-bold text-xs">
                        {currentUser?.avatar ? (
                          <img src={currentUser.avatar} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                          'S'
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#0B1E38] text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 animate-spin text-orange-400" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl text-xs text-slate-500">
                      Thinking Socratically...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Homework preview if attached */}
              {attachedImagePreview && (
                <div className="px-6 py-2 bg-orange-50 dark:bg-orange-950/40 border-t border-orange-100 dark:border-orange-900 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={attachedImagePreview} alt="Problem" className="w-10 h-10 object-cover rounded-lg border" />
                    <span className="font-bold text-[#FF6B00]">Homework photo ready for step-by-step breakdown</span>
                  </div>
                  <button onClick={() => setAttachedImagePreview(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <label
                  title="Attach photo of homework problem"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                >
                  <ImageIcon className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleHomeworkPhotoUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  title={isVoiceRecording ? 'Stop voice recording' : 'Speak to AI Tutor'}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isVoiceRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask any concept, formula, or problem..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />

                <button
                  type="submit"
                  disabled={(!inputMessage.trim() && !attachedImagePreview) || isAiTyping}
                  className="w-10 h-10 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: DIGITAL CERTIFICATES */}
          {studentNav === 'certificates' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-light text-slate-900 dark:text-white tracking-wide">Digital Certificates & Badges</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Cryptographically verified credentials awarded for curriculum mastery
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#0E1A2D] border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] flex items-center justify-center font-bold">
                        <Award className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {cert.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-light text-lg text-slate-900 dark:text-white">{cert.courseTitle}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Recipient: {cert.studentName} &bull; Score: {cert.score}%</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                      <div>Issued by: {cert.instructorName} on {cert.issueDate}</div>
                      <div className="font-mono text-[10px] text-slate-400 truncate">Hash: {cert.verificationHash}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: COMMUNITY DOUBT FORUM */}
          {studentNav === 'community' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-light text-slate-900 dark:text-white tracking-wide">Community Doubt Forum</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Ask peers & verified teachers &bull; AI moderation active with zero-tolerance policy
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {communityPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{post.author_name}</span>
                          <span>&bull;</span>
                          <span>{post.subject} (Grade {post.grade_level})</span>
                          <span>&bull;</span>
                          <span>{post.created_at}</span>
                        </div>
                        <h3 className="text-base font-light text-slate-900 dark:text-white mt-1">{post.title}</h3>
                      </div>

                      <button
                        onClick={() => upvoteCommunityPost(post.id)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 hover:text-[#FF6B00] text-xs font-bold transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.upvotes}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{post.content}</p>

                    {post.is_verified && post.verified_solution && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-extrabold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Teacher-Verified Solution &bull; {post.verified_solution.teacher_name}</span>
                        </div>
                        <p className="text-emerald-900 dark:text-emerald-200">{post.verified_solution.solution}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS & SUBSCRIPTION */}
          {studentNav === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-light text-slate-900 dark:text-white tracking-wide">Student Account & Preferences</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Manage profile, governing boards, language medium, and active subscription
                  </p>
                </div>
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#E56000] transition-colors cursor-pointer shadow-sm"
                >
                  Edit Personal Info
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-3">
                  <h3 className="font-light text-base text-slate-900 dark:text-white">Active Plan & Free Trial</h3>
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#FF6B00]">{subscriptionState.tier}</span>
                      <span className="text-xs font-bold text-emerald-600">Active</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Full access trial expires on {subscriptionState.trialEndDate} ({subscriptionState.trialDaysLeft} days remaining).
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-3">
                  <h3 className="font-light text-base text-slate-900 dark:text-white">Institutional Mapping</h3>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {currentUser?.school_name || 'D.A.V. Public School, Sector 8'}
                    </div>
                    <p className="text-slate-500">
                      {currentUser?.school_address || 'Sector 8-C, Chandigarh, Punjab & Haryana, India'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          4. FLOATING QUICK DOUBTS WIDGET (Available across all tabs)
          ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {isQuickDoubtsOpen && (
          <div className="mb-3 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/80 text-[#FF6B00] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-light text-sm">Quick Doubts AI</h3>
                  <p className="text-[10px] text-slate-500">Autonomous Step-by-Step Solver</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickDoubtsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickDoubtSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Subject</label>
                <select
                  value={quickDoubtSubject}
                  onChange={(e) => setQuickDoubtSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-bold rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700"
                >
                  {displaySubjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} (Grade {s.grade_level})
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                rows={3}
                value={quickDoubtText}
                onChange={(e) => setQuickDoubtText(e.target.value)}
                placeholder="Type your question or copy-paste math equation..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] resize-none"
              />

              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-dashed text-xs text-slate-500 cursor-pointer hover:border-[#FF6B00]">
                  <UploadCloud className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Diagram</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setQuickDoubtText(`[Diagram Attached: ${e.target.files[0].name}] How do I solve this diagram problem?`);
                      }
                    }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={!quickDoubtText.trim() || isSubmittingDoubt}
                  className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Doubt</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <button
          onClick={() => setIsQuickDoubtsOpen(!isQuickDoubtsOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#FFA04D] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
          title="Open Quick Doubts AI"
        >
          {isQuickDoubtsOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      </div>
    </div>
  );
};
