import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { processAvatarImage } from '../../utils/imageUtils';
import { FormulasAndGraphsTab } from './FormulasAndGraphsTab';
import { AgileStudyRoadmap } from './AgileStudyRoadmap';
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
} from 'lucide-react';
import { EducationBoard, LanguageMedium, StudentNavTab, DailyStudyTask } from '../../types';

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
  const {
    studentNav,
    setStudentNav,
    chatMessages,
    isAiTyping,
    sendTutorMessage,
    chapterProgress,
    setChapterProgress,
    doubts,
    addDoubt,
    quizzes,
    certificates,
    issueCertificate,
    currentUser,
    updateCurrentUser,
    setIsProfileOpen,
    setIsCurriculumModalOpen,
    subjectsDB,
    topicsDB,
    currentBoard,
    setCurrentBoard,
    globalLanguage,
    setGlobalLanguage,
    // Agile Study Planner
    dailyTasks,
    setDailyTasks,
    weeklySprints,
    masterChapters,
    generateStudyPlan,
    exportStudyPlanSpreadsheet,
    // Google Meet & Meetings
    activeStudentMeeting,
    dismissStudentMeetingAlert,
    meetingInvites,
    // Community Forum
    communityPosts,
    addCommunityPost,
    upvoteCommunityPost,
    // Subscription
    subscriptionState,
  } = useApp();

  // Student Profile Grade Context Auto-Fetch
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
  const [quickDoubtTopic, setQuickDoubtTopic] = useState('');
  const [isSubmittingDoubt, setIsSubmittingDoubt] = useState(false);
  const [isQuickDoubtsOpen, setIsQuickDoubtsOpen] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeCert, setActiveCert] = useState<any | null>(null);

  // Ask AI Tutor Voice Input & Homework Photo States
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
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

  const currentSubjectObj = displaySubjects.find(
    (s) => s.name.toLowerCase() === quickDoubtSubject.toLowerCase()
  ) || displaySubjects[0];

  const availableTopics = currentSubjectObj
    ? topicsDB.filter((t) => t.subject_id === currentSubjectObj.id && t.status === 'ACTIVE')
    : [];

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
      setVoiceSupported(false);
      setInputMessage((prev) => prev ? `${prev} [Voice: What is Newton's 2nd Law?]` : "What is Newton's 2nd Law?");
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
    await addDoubt(quickDoubtText, quickDoubtSubject, quickDoubtTopic);
    setQuickDoubtText('');
    setIsSubmittingDoubt(false);
  };

  // Nav Items exactly matching attachment + Formulas & Graphs tab
  const navTabs: { id: StudentNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'my-courses', label: 'My Courses', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'grades', label: 'Grades', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'formulas-graphs', label: 'Formulas & Graphs', icon: <Binary className="w-4 h-4" /> },
    { id: 'ai-tutor', label: 'AI Tutor', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'resources', label: 'Resources', icon: <Layers className="w-4 h-4" /> },
    { id: 'community', label: 'Community', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  // Calendar Day cell helper
  const getTasksForDay = (dayNum: number) => {
    return dailyTasks.filter((t) => t.day === dayNum);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#1E293B] dark:text-[#F1F5F9] transition-colors">
      {/* HIGH PRIORITY GOOGLE MEET LIVE NOTIFICATION BANNER */}
      {activeStudentMeeting && (
        <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white px-4 py-3 shadow-lg flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center animate-pulse shrink-0">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                  LIVE SESSION
                </span>
                <span className="font-extrabold text-sm">{activeStudentMeeting.title}</span>
              </div>
              <p className="text-xs text-white/90">
                Hosted by {activeStudentMeeting.host_name} &bull; Google Meet Room is ready
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={activeStudentMeeting.meet_link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-xl bg-white text-[#4F46E5] font-black text-xs hover:bg-white/90 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>Join Meeting</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={dismissStudentMeetingAlert}
              className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SUB-HEADER NAVIGATION BAR - Exactly matching the image pill tabs */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200/80 dark:border-slate-800 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5 overflow-x-auto scrollbar-none gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {navTabs.map((tab) => {
                const isActive = studentNav === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStudentNav(tab.id)}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/25 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-[#4F46E5] dark:hover:text-[#818CF8] hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right quick badge: 7-Day Free Trial status */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{subscriptionState.tier}</span>
                <span className="text-[10px] bg-[#4F46E5] text-white px-1.5 py-0.2 rounded-full font-extrabold">
                  {subscriptionState.trialDaysLeft}d left
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* CONDITIONAL TAB 1: MAIN DASHBOARD VIEW (MATCHING THE ATTACHMENT IMAGE) */}
        {studentNav === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT / CENTER CONTENT AREA (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              <AgileStudyRoadmap />
            </div>

            {/* RIGHT SIDEBAR (lg:col-span-4) - Exact match to attachment */}
            <div className="lg:col-span-4 space-y-6">
              {/* CARD 1: GRADE & BOARD FILTERS */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] appearance-none cursor-pointer"
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
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] appearance-none cursor-pointer"
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
                    <Languages className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>Language Medium</span>
                  </label>
                  <div className="relative">
                    <select
                      value={globalLanguage}
                      onChange={(e) => setGlobalLanguage(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] appearance-none cursor-pointer"
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
                    className="font-bold text-[#4F46E5] dark:text-[#818CF8] hover:underline"
                  >
                    View Syllabus &rarr;
                  </button>
                </div>
              </div>

              {/* CARD 2: QUICK DOUBTS AI CHAT PANEL (Exact visual match to image) */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-[#4F46E5] flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
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

                {/* Socratic Assistant Greeting Bubble from Screenshot */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 mb-1 text-[11px] font-bold text-[#4F46E5] dark:text-[#818CF8]">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Tutor Assistant</span>
                  </div>
                  "Hi! I'm your AI tutor. Stuck on a problem in your study roadmap? Type it below and I'll break it down step-by-step!"
                </div>

                {/* Interactive Input with Send Arrow Button */}
                <form onSubmit={handleSidebarDoubtSubmit} className="relative">
                  <input
                    type="text"
                    value={sidebarDoubtText}
                    onChange={(e) => setSidebarDoubtText(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white pl-3.5 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!sidebarDoubtText.trim() || isSidebarSubmitting}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer"
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
                    <span className="text-[#4F46E5] dark:text-[#818CF8] font-bold">
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
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Study Momentum</span>
                  </h3>
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                    5-Day Streak 🔥
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Weekly Core Math:</span>
                    <span className="font-bold text-slate-900 dark:text-white">10.5 / 10.5 hrs</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#4F46E5] to-[#0284C7] h-full rounded-full w-4/5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                    <Target className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>Next Milestone: Quadratic Formula Drills</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONDITIONAL TAB 2: MY COURSES */}
        {studentNav === 'my-courses' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Enrolled Subjects & Modules</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Auto-aligned to Grade {studentGradeLevel} &bull; {currentBoard} Governing Curriculum
                </p>
              </div>
              <button
                onClick={() => setIsCurriculumModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-[#4338CA] transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
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
                    className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-[#4F46E5] flex items-center justify-center font-bold text-lg">
                        {sub.name.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {sub.code || `GR-${sub.grade_level}`}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{sub.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{sub.description}</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Active Units ({topicsForSub.length}):
                      </span>
                      <div className="space-y-1">
                        {topicsForSub.slice(0, 3).map((top) => (
                          <div key={top.id} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
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
                        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#4F46E5] hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
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

        {/* CONDITIONAL TAB 3: GRADES & MASTERY */}
        {studentNav === 'grades' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Academic Performance & Mastery KPIs</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Cumulative Grade Point Average: 3.82 / 4.0 &bull; Board Compliance: 98%
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
                <div className="text-3xl font-black text-[#4F46E5]">88%</div>
                <div className="text-xs font-bold text-slate-500 mt-1">Overall Mastery</div>
              </div>
              <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
                <div className="text-3xl font-black text-[#0284C7]">85%</div>
                <div className="text-xs font-bold text-slate-500 mt-1">Physics Ch. 2</div>
              </div>
              <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
                <div className="text-3xl font-black text-emerald-600">95%</div>
                <div className="text-xs font-bold text-slate-500 mt-1">Algebra I (Core)</div>
              </div>
              <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
                <div className="text-3xl font-black text-amber-600">98%</div>
                <div className="text-xs font-bold text-slate-500 mt-1">Attendance</div>
              </div>
            </div>

            {/* Weak spot remedial recommendations */}
            <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-extrabold text-sm">
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
                className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-[#4338CA] transition-colors cursor-pointer shadow-sm"
              >
                Start Targeted Practice
              </button>
            </div>
          </div>
        )}

        {/* CONDITIONAL TAB: DEDICATED FORMULAS & GRAPHS TAB */}
        {studentNav === 'formulas-graphs' && (
          <FormulasAndGraphsTab
            currentGrade={studentGradeLevel}
            currentBoard={currentBoard}
          />
        )}

        {/* CONDITIONAL TAB 4: AI TUTOR (FULL SCREEN SOCRATIC CONVERSATION) */}
        {studentNav === 'ai-tutor' && (
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col h-[700px] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-bold shadow-md shadow-[#4F46E5]/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Socratic AI Tutor
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                    <span>&bull;</span>
                    <span>{currentBoard} Grade {studentGradeLevel} Alignment</span>
                    <span>&bull;</span>
                    <span className="capitalize">{SUPPORTED_LANGUAGES.find((l) => l.value === globalLanguage)?.label || 'English'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => sendTutorMessage("Can you summarize our key physics takeaways today?")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Summary
                </button>
              </div>
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
                    <div className="w-8 h-8 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                      msg.sender === 'student'
                        ? 'bg-[#4F46E5] text-white rounded-br-xs font-medium'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    {msg.mathFormula && (
                      <div className="mt-2 p-2 rounded-lg bg-black/5 dark:bg-black/30 font-mono text-xs text-[#4F46E5] dark:text-[#818CF8] font-bold">
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
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-[#4F46E5] bg-[#4F46E5] flex items-center justify-center text-white font-bold text-xs">
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
                  <div className="w-8 h-8 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin" />
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
              <div className="px-6 py-2 bg-indigo-50 dark:bg-indigo-950/60 border-t border-indigo-100 dark:border-indigo-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img src={attachedImagePreview} alt="Problem" className="w-10 h-10 object-cover rounded-lg border" />
                  <span className="font-bold text-[#4F46E5]">Homework photo ready for step-by-step breakdown</span>
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
                placeholder="Ask any concept, question, or problem..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />

              <button
                type="submit"
                disabled={(!inputMessage.trim() && !attachedImagePreview) || isAiTyping}
                className="w-10 h-10 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* CONDITIONAL TAB 5: RESOURCES & CURRICULUM */}
        {studentNav === 'resources' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Curriculum Textbooks & Question Banks</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Synced with {currentBoard} National Syllabus Standards &bull; Grade {studentGradeLevel}
                </p>
              </div>
              <button
                onClick={exportStudyPlanSpreadsheet}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export Agile Planner (.CSV)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#4F46E5]" />
                  <span>Interactive Chapter References</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {masterChapters.map((ch) => (
                    <div key={ch.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{ch.chapterName}</div>
                        <div className="text-[11px] text-slate-500">{ch.subject} &bull; {ch.allocatedHours} hrs target</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-[#4F46E5] dark:text-[#818CF8]">
                        {ch.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Weekly Sprint Allocations</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {weeklySprints.map((s) => (
                    <div key={s.week} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{s.weekLabel}</span>
                        <span className="font-bold text-[#4F46E5]">{s.totalHours} hrs</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Guaranteed Core Math: {s.coreSubjectHours} hrs | Rotating: {Object.keys(s.rotatingSubjectHours).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONDITIONAL TAB 6: COMMUNITY DOUBT FORUM */}
        {studentNav === 'community' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Community Doubt Forum</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Ask peers & verified teachers &bull; AI moderation active with zero-tolerance policy
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {communityPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
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
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{post.title}</h3>
                    </div>

                    <button
                      onClick={() => upvoteCommunityPost(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-[#4F46E5] text-xs font-bold transition-colors cursor-pointer"
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

        {/* CONDITIONAL TAB 7: SETTINGS & SUBSCRIPTION */}
        {studentNav === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Student Account & Preferences</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage profile, governing boards, language medium, and active subscription
                </p>
              </div>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-[#4338CA] transition-colors cursor-pointer shadow-sm"
              >
                Edit Personal Info
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subscription Card */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Active Plan & Free Trial</h3>
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#4F46E5] dark:text-[#818CF8]">{subscriptionState.tier}</span>
                    <span className="text-xs font-bold text-emerald-600">Active</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Full access trial expires on {subscriptionState.trialEndDate} ({subscriptionState.trialDaysLeft} days remaining).
                  </p>
                  <div className="text-xs text-slate-500">
                    Payment Method: {subscriptionState.paymentMethod?.type} ({subscriptionState.paymentMethod?.detail})
                  </div>
                </div>
              </div>

              {/* Institution Card */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Institutional Mapping</h3>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {currentUser?.school_name || 'D.A.V. Public School, Sector 8'}
                  </div>
                  <p className="text-slate-500">
                    {currentUser?.school_address || 'Sector 8-C, Chandigarh, Punjab & Haryana, India'}
                  </p>
                  <div className="text-[11px] text-emerald-600 font-bold pt-1">
                    ✓ Google Maps Places Autocomplete Verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING QUICK DOUBTS WIDGET (Present on all sub-tabs) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {isQuickDoubtsOpen && (
          <div className="mb-3 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#111827] text-slate-900 dark:text-white rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">Quick Doubts AI</h3>
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
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
              />

              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-dashed text-xs text-slate-500 cursor-pointer hover:border-[#4F46E5]">
                  <UploadCloud className="w-3.5 h-3.5 text-[#4F46E5]" />
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
                  className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
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
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
          title="Open Quick Doubts AI"
        >
          {isQuickDoubtsOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      </div>
    </div>
  );
};
