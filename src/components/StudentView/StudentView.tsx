import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  BOARD_LABELS,
  getLocalizedSubjectName,
  formatEnrolledCourseEntry,
  isSubjectEnrolled,
} from '../../data/curriculumData';
import { FormulasAndGraphsTab } from './FormulasAndGraphsTab';
import { AgileStudyRoadmap } from './AgileStudyRoadmap';
import { CourseProgressTracker } from './CourseProgressTracker';
import { StudentGamificationHub } from './StudentGamificationHub';
import { OfflineStudyPackModal } from './OfflineStudyPackModal';
import { ParentWeeklyDigestModal } from './ParentWeeklyDigestModal';
import { CommunityDoubtForum } from './CommunityDoubtForum';
import { PivotIQLogo } from '../common/PivotIQLogo';
import { SubjectIcon } from '../common/SubjectIcon';
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
  Mail,
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
  Copy,
  Trash2,
  Loader2,
  Lock,
  ChevronUp,
  ShieldAlert,
  HeartHandshake,
  Phone,
  CornerDownRight,
} from 'lucide-react';
import { EducationBoard, LanguageMedium, StudentNavTab, Quiz, DigitalCertificate, QuickDoubtItem, QuickDoubtChatTurn, GuardianEscalationReceipt } from '../../types';
import { parseQuickDoubtResponse } from '../../utils/safetyGuard';

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
    quickDoubts,
    askQuickDoubtAI,
    continueQuickDoubtChat,
    deleteQuickDoubt,
    clearQuickDoubts,
    quizzes,
    certificates,
    currentUser,
    updateCurrentUser,
    setCurrentRole,
    logout,
    setIsProfileOpen,
    setIsCurriculumModalOpen,
    subjectsDB,
    topicsDB,
    activeGrades,
    activeCategories,
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
    subscriptionState,
    notifications,
    activeBroadcastQuiz,
    setActiveBroadcastQuiz,
    setEcosystemOverviewMode,
    recordQuizSubmission,
    completeCurriculumUnit,
    addNotification,
  } = useApp();

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Student Profile Grade Context
  const studentGradeLevel = typeof currentUser?.grade_level === 'number'
    ? currentUser.grade_level
    : parseInt(String(currentUser?.grade || '10').replace(/\D/g, '')) || 10;

  const [activeGradeFilter, setActiveGradeFilter] = useState<number>(studentGradeLevel);

  useEffect(() => {
    setActiveGradeFilter(studentGradeLevel);
  }, [studentGradeLevel]);

  // Skills Passport filtering states
  const [coursesScopeFilter, setCoursesScopeFilter] = useState<'ALL' | 'ENROLLED'>('ALL');
  const [coursesCategoryFilter, setCoursesCategoryFilter] = useState<string>('ALL');

  // Interactive Quick Doubts AI Assistant State (Subject + Topic + Real-time LLM)
  const [sidebarDoubtText, setSidebarDoubtText] = useState('');
  const [sidebarDoubtSubject, setSidebarDoubtSubject] = useState('Physics');
  const [sidebarDoubtTopic, setSidebarDoubtTopic] = useState('');
  const [sidebarCustomTopic, setSidebarCustomTopic] = useState('');
  const [sidebarImageData, setSidebarImageData] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [isSidebarSubmitting, setIsSidebarSubmitting] = useState(false);
  const [expandedQuickDoubtId, setExpandedQuickDoubtId] = useState<string | null>(null);
  const [copiedDoubtId, setCopiedDoubtId] = useState<string | null>(null);
  const [threadReplyInputs, setThreadReplyInputs] = useState<Record<string, string>>({});
  const [replyingThreadId, setReplyingThreadId] = useState<string | null>(null);

  // AI Tutor & Floating Widget States
  const [inputMessage, setInputMessage] = useState('');
  const [quickDoubtText, setQuickDoubtText] = useState('');
  const [quickDoubtSubject, setQuickDoubtSubject] = useState('Physics');
  const [quickDoubtTopic, setQuickDoubtTopic] = useState('');
  const [quickCustomTopic, setQuickCustomTopic] = useState('');
  const [quickImageData, setQuickImageData] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [isSubmittingDoubt, setIsSubmittingDoubt] = useState(false);
  const [isQuickDoubtsOpen, setIsQuickDoubtsOpen] = useState(false);

  // New Modals for Offline Pack & Parental Weekly Digest
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isParentDigestOpen, setIsParentDigestOpen] = useState(false);

  // Practice Quizzes Interactive States
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isReviewingAnswers, setIsReviewingAnswers] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    certificateIssued?: DigitalCertificate;
  } | null>(null);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setIsReviewingAnswers(false);
  }, [activeQuizId]);

  // Interactive Grade Review & Certificate Modal State
  const [activeCertModal, setActiveCertModal] = useState<DigitalCertificate | null>(null);
  const [gradeReviewMessage, setGradeReviewMessage] = useState<string | null>(null);

  // Ask AI Tutor Voice Input & Homework Photo States
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [attachedImagePreview, setAttachedImagePreview] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  // Dynamic Grade, Board & Category-Filtered Subjects from Live Admin Curriculum
  const filteredSubjects = useMemo(() => {
    return subjectsDB.filter((s) => {
      if (s.status !== 'ACTIVE') return false;
      if (s.grade_level !== activeGradeFilter) return false;
      if (s.board && s.board !== 'ALL' && s.board !== currentBoard) return false;
      if (activeCategories.length > 0 && s.category && !activeCategories.includes(s.category)) return false;
      return true;
    });
  }, [subjectsDB, activeGradeFilter, currentBoard, activeCategories]);

  const displaySubjects = useMemo(() => {
    if (filteredSubjects.length > 0) return filteredSubjects;
    return subjectsDB.filter(
      (s) => s.status === 'ACTIVE' && (!s.board || s.board === 'ALL' || s.board === currentBoard)
    );
  }, [filteredSubjects, subjectsDB, currentBoard]);

  const gradeOptions = useMemo(() => {
    const set = new Set<number>(activeGrades.length > 0 ? activeGrades : [6, 7, 8, 9, 10, 11, 12]);
    set.add(activeGradeFilter);
    return Array.from(set).sort((a, b) => a - b);
  }, [activeGrades, activeGradeFilter]);

  useEffect(() => {
    if (displaySubjects.length > 0) {
      const names = displaySubjects.map((s) => getLocalizedSubjectName(s.name, currentBoard));
      if (!names.includes(quickDoubtSubject)) setQuickDoubtSubject(names[0]);
      if (!names.includes(sidebarDoubtSubject)) setSidebarDoubtSubject(names[0]);
    }
  }, [displaySubjects, currentBoard, quickDoubtSubject, sidebarDoubtSubject]);

  // Live Curriculum Topics filtered by selected Subject for Quick Doubts AI
  const getTopicsForSubjectName = (subjectName: string) => {
    const matchedSubjects = subjectsDB.filter((s) => {
      if (s.status !== 'ACTIVE') return false;
      const localized = getLocalizedSubjectName(s.name, currentBoard);
      return (
        localized.toLowerCase() === subjectName.toLowerCase() ||
        s.name.toLowerCase() === subjectName.toLowerCase()
      );
    });
    const exactGradeSubject =
      matchedSubjects.find((s) => s.grade_level === activeGradeFilter) || matchedSubjects[0];
    if (!exactGradeSubject) return [];
    return topicsDB.filter((t) => t.subject_id === exactGradeSubject.id && t.status === 'ACTIVE');
  };

  const sidebarTopicsForSubject = useMemo(
    () => getTopicsForSubjectName(sidebarDoubtSubject),
    [subjectsDB, topicsDB, sidebarDoubtSubject, activeGradeFilter, currentBoard]
  );

  const floatingTopicsForSubject = useMemo(
    () => getTopicsForSubjectName(quickDoubtSubject),
    [subjectsDB, topicsDB, quickDoubtSubject, activeGradeFilter, currentBoard]
  );

  useEffect(() => {
    if (sidebarTopicsForSubject.length > 0) {
      const titles = sidebarTopicsForSubject.map((t) => t.title);
      if (sidebarDoubtTopic !== '__custom__' && !titles.includes(sidebarDoubtTopic)) {
        setSidebarDoubtTopic(titles[0]);
      }
    } else if (sidebarDoubtTopic !== '__custom__') {
      setSidebarDoubtTopic('');
    }
  }, [sidebarTopicsForSubject]);

  useEffect(() => {
    if (floatingTopicsForSubject.length > 0) {
      const titles = floatingTopicsForSubject.map((t) => t.title);
      if (quickDoubtTopic !== '__custom__' && !titles.includes(quickDoubtTopic)) {
        setQuickDoubtTopic(titles[0]);
      }
    } else if (quickDoubtTopic !== '__custom__') {
      setQuickDoubtTopic('');
    }
  }, [floatingTopicsForSubject]);

  useEffect(() => {
    if (quickDoubts.length > 0 && !expandedQuickDoubtId) {
      setExpandedQuickDoubtId(quickDoubts[0].id);
    }
  }, [quickDoubts, expandedQuickDoubtId]);

  const handleToggleSubjectEnrollment = (sub: typeof displaySubjects[number]) => {
    const existing = currentUser?.enrolledCourses || [];
    const localized = getLocalizedSubjectName(sub.name, currentBoard);
    const entry = formatEnrolledCourseEntry(localized, sub.code);
    const enrolled = isSubjectEnrolled(sub, existing, currentBoard);

    const updatedCourses = enrolled
      ? existing.filter((item) => !isSubjectEnrolled(sub, [item], currentBoard))
      : existing.includes(entry)
      ? existing
      : [...existing, entry];

    updateCurrentUser({ enrolledCourses: updatedCourses });
  };

  const handleQuickDoubtImageSelect = (
    file: File | undefined,
    setter: React.Dispatch<React.SetStateAction<{ base64: string; mimeType: string; preview: string } | null>>
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        setter({
          base64: result,
          mimeType: file.type || 'image/png',
          preview: result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyDoubtAnswer = (id: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedDoubtId(id);
    setTimeout(() => {
      setCopiedDoubtId((prev) => (prev === id ? null : prev));
    }, 1800);
  };

  // Renders clean formatted LLM markdown paragraphs, headers, bold phrases & bullet lists
  const renderFormattedQuickAnswer = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const renderInline = (lineText: string) => {
      const parts = lineText.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={idx} className="font-bold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={idx}
              className="px-1 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/70 text-[11px] font-mono text-indigo-700 dark:text-teal-300"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      });
    };

    return (
      <div className="space-y-1.5 text-xs leading-relaxed text-slate-700 dark:text-slate-100">
        {lines.map((rawLine, idx) => {
          const line = rawLine.trim();
          if (!line) return <div key={idx} className="h-1" />;
          if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
            return <hr key={idx} className="my-2 border-slate-200/80 dark:border-slate-700/70" />;
          }
          if (/^#{1,6}\s+/.test(line)) {
            const cleanHeading = line.replace(/^#{1,6}\s+/, '');
            return (
              <h4 key={idx} className="text-xs text-[#FF6B00] pt-1">
                {renderInline(cleanHeading)}
              </h4>
            );
          }
          if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#00A896] mt-0.5">&bull;</span>
                <span>{renderInline(line.slice(2))}</span>
              </div>
            );
          }
          return <p key={idx}>{renderInline(line)}</p>;
        })}
      </div>
    );
  };

    const renderGuardianAlertBox = (receipt: GuardianEscalationReceipt) => {
      const imgSrc = receipt.screenshotDataUrl || receipt.screenshotUrl;
      return (
        <div className="mt-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 space-y-2 text-[11px]">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="font-bold text-rose-800 dark:text-rose-200">
                Conduct Guardrail Triggered — Guardian Immediately Notified
              </p>
              <p className="text-rose-700/90 dark:text-rose-300/90 leading-snug">
                The AI Assistant did not reply to or accept abusive/foul language. An automated visual screenshot was captured and alerted to <strong>{receipt.guardianName}</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
            <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-rose-200/70 dark:border-rose-800/50">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold truncate">
                <Phone className="w-3 h-3 shrink-0" />
                WhatsApp Sent: {receipt.guardianPhone}
              </span>
              <a
                href={receipt.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 underline shrink-0"
              >
                Open
              </a>
            </div>
            <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-rose-200/70 dark:border-rose-800/50">
              <span className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 font-semibold truncate">
                <Mail className="w-3 h-3 shrink-0" />
                Email Sent: {receipt.guardianEmail}
              </span>
              <a
                href={receipt.emailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 underline shrink-0"
              >
                Open
              </a>
            </div>
          </div>

          {imgSrc && (
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-rose-700 dark:text-rose-300">
                <span>Captured Screenshot Evidence ({receipt.id})</span>
                <a
                  href={imgSrc}
                  download={`safety-alert-${receipt.id}.png`}
                  className="inline-flex items-center gap-1 font-semibold underline hover:text-rose-900 dark:hover:text-white"
                >
                  <Download className="w-3 h-3" />
                  Download PNG
                </a>
              </div>
              <img
                src={imgSrc}
                alt="Captured incident screenshot sent to guardian"
                className="w-full max-h-36 object-contain rounded-lg border border-rose-200 dark:border-rose-800 bg-slate-900"
              />
            </div>
          )}
        </div>
      );
    };

    const handleSendThreadFollowUp = async (doubtId: string, overrideText?: string, surfaceLabel?: string) => {
      const textToSend = (overrideText ?? threadReplyInputs[doubtId] ?? '').trim();
      if (!textToSend || replyingThreadId === doubtId) return;
      if (!overrideText) {
        setThreadReplyInputs((prev) => ({ ...prev, [doubtId]: '' }));
      }
      setReplyingThreadId(doubtId);
      try {
        await continueQuickDoubtChat(doubtId, textToSend, { surfaceLabel });
      } finally {
        setReplyingThreadId(null);
      }
    };

    const renderInteractiveThreadMessages = (item: QuickDoubtItem, surfaceLabel: string, compact = false) => {
      const turns: QuickDoubtChatTurn[] =
        item.messages && item.messages.length > 0
          ? item.messages
          : [
              {
                id: `legacy-stu-${item.id}`,
                sender: 'student',
                text: item.question,
                timestamp: item.createdAt,
                imagePreview: item.imagePreview,
                isBlockedViolation: item.blockedViolation,
                guardianReport: item.guardianReport,
              },
              ...(item.answer
                ? [
                    {
                      id: `legacy-ai-${item.id}`,
                      sender: 'ai' as const,
                      text: item.answer,
                      timestamp: item.createdAt,
                      isWellnessNotice: item.isWellnessNotice,
                    },
                  ]
                : []),
            ];

      const isStreamingThis = item.status === 'streaming';

      return (
        <div className="space-y-2.5">
          {turns.map((turn, tIdx) => {
            const isLastTurn = tIdx === turns.length - 1;

            if (turn.sender === 'student') {
              return (
                <div key={turn.id} className="space-y-1.5">
                  <div className="flex justify-end">
                    <div
                      className={`max-w-[90%] rounded-2xl rounded-tr-xs px-3 py-2 text-xs ${
                        turn.isBlockedViolation
                          ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700'
                          : 'bg-indigo-600/90 text-white shadow-xs'
                      }`}
                    >
                      {turn.imagePreview && (
                        <img
                          src={turn.imagePreview}
                          alt="Uploaded doubt diagram"
                          className="max-h-32 rounded-lg mb-1.5 border border-white/20 object-contain bg-white"
                        />
                      )}
                      <p className="leading-snug">{turn.text}</p>
                      <span className="block text-[9px] opacity-75 mt-1 text-right">{turn.timestamp}</span>
                    </div>
                  </div>
                  {turn.guardianReport && renderGuardianAlertBox(turn.guardianReport)}
                </div>
              );
            }

            // AI Agent Turn
            if (turn.isWellnessNotice) {
              return (
                <div
                  key={turn.id}
                  className="rounded-2xl rounded-tl-xs p-3.5 bg-amber-50/90 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/70 space-y-2"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                    <HeartHandshake className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Parent &amp; Medical Practitioner Guidance Only</span>
                  </div>
                  <div className="text-xs leading-relaxed text-amber-950 dark:text-amber-100">
                    {renderFormattedQuickAnswer(turn.text)}
                  </div>
                </div>
              );
            }

            const parsed = parseQuickDoubtResponse(turn.text);
            const hasStructured = Boolean(parsed.resolution || parsed.furtherLearning);

            return (
              <div key={turn.id} className="space-y-2">
                {turn.text ? (
                  <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl rounded-tl-xs p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-2xs">
                    {/* Resolution Section */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Resolution
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-300">{turn.timestamp}</span>
                      </div>
                      <div>
                        {renderFormattedQuickAnswer(hasStructured ? parsed.resolution : turn.text)}
                        {isStreamingThis && isLastTurn && !parsed.furtherLearning && (
                          <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#FF6B00] animate-pulse align-middle rounded-xs" />
                        )}
                      </div>
                    </div>

                    {/* Further Learning Section */}
                    {parsed.furtherLearning && (
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <Lightbulb className="w-3 h-3 text-[#FF6B00]" />
                          Further Learning
                        </span>
                        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-700/50">
                          {renderFormattedQuickAnswer(parsed.furtherLearning)}
                          {isStreamingThis && isLastTurn && (
                            <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#FF6B00] animate-pulse align-middle rounded-xs" />
                          )}
                        </div>

                        {/* Interactive Further Learning Quick-Explore Buttons */}
                        {!isStreamingThis && parsed.followUpSuggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {parsed.followUpSuggestions.slice(0, compact ? 2 : 3).map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                disabled={replyingThreadId === item.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendThreadFollowUp(
                                    item.id,
                                    `Let's explore further: ${sug}`,
                                    surfaceLabel
                                  );
                                }}
                                className="text-left text-[10px] px-2.5 py-1 rounded-lg bg-orange-50/70 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/60 text-[#FF6B00] border border-orange-200/70 dark:border-orange-800/60 inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <CornerDownRight className="w-2.5 h-2.5 shrink-0" />
                                <span className="line-clamp-1">{sug}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : isStreamingThis && isLastTurn ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white py-2 px-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B00]" />
                    <span>Preparing interactive resolution &amp; further learning for {item.subject}...</span>
                  </div>
                ) : null}
              </div>
            );
          })}

          {/* Interactive Student <-> AI Reply Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendThreadFollowUp(item.id, undefined, surfaceLabel);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 pt-1.5"
          >
            <input
              type="text"
              value={threadReplyInputs[item.id] || ''}
              onChange={(e) =>
                setThreadReplyInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
              }
              disabled={isStreamingThis || replyingThreadId === item.id}
              placeholder="Reply to AI Agent for follow-up or deeper explanation..."
              className="flex-1 bg-white dark:bg-[#0E1A2D] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
            <button
              type="submit"
              disabled={
                !(threadReplyInputs[item.id] || '').trim() ||
                isStreamingThis ||
                replyingThreadId === item.id
              }
              className="px-3 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-40 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shrink-0"
            >
              {replyingThreadId === item.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Reply</span>
            </button>
          </form>
        </div>
      );
    };

  const handleSidebarDoubtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!sidebarDoubtText.trim() && !sidebarImageData) || isSidebarSubmitting) return;
    const resolvedTopic =
      sidebarDoubtTopic === '__custom__' ? sidebarCustomTopic.trim() : sidebarDoubtTopic.trim();
    const qText =
      sidebarDoubtText.trim() ||
      `Please explain and solve the attached ${sidebarDoubtSubject}${resolvedTopic ? ` (${resolvedTopic})` : ''} diagram/problem.`;

    setIsSidebarSubmitting(true);
    setSidebarDoubtText('');
    const imgPayload = sidebarImageData;
    setSidebarImageData(null);

    try {
      const createdId = await askQuickDoubtAI(qText, sidebarDoubtSubject || 'General', {
        topic: resolvedTopic,
        gradeLevel: activeGradeFilter,
        board: currentBoard,
        medium: globalLanguage,
        imageBase64: imgPayload?.base64,
        imageMimeType: imgPayload?.mimeType,
        imagePreview: imgPayload?.preview,
        surfaceLabel: 'Student Dashboard Quick Doubts Chat',
      });
      if (createdId) setExpandedQuickDoubtId(createdId);
    } finally {
      setIsSidebarSubmitting(false);
    }
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
    if ((!quickDoubtText.trim() && !quickImageData) || isSubmittingDoubt) return;
    const resolvedTopic =
      quickDoubtTopic === '__custom__' ? quickCustomTopic.trim() : quickDoubtTopic.trim();
    const qText =
      quickDoubtText.trim() ||
      `Please solve and explain the attached ${quickDoubtSubject}${resolvedTopic ? ` (${resolvedTopic})` : ''} diagram.`;

    setIsSubmittingDoubt(true);
    setQuickDoubtText('');
    const imgPayload = quickImageData;
    setQuickImageData(null);

    try {
      const createdId = await askQuickDoubtAI(qText, quickDoubtSubject, {
        topic: resolvedTopic,
        gradeLevel: activeGradeFilter,
        board: currentBoard,
        medium: globalLanguage,
        imageBase64: imgPayload?.base64,
        imageMimeType: imgPayload?.mimeType,
        imagePreview: imgPayload?.preview,
        surfaceLabel: 'Floating Quick Doubts AI Pop-up',
      });
      if (createdId) setExpandedQuickDoubtId(createdId);
    } finally {
      setIsSubmittingDoubt(false);
    }
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
                <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <p className="text-[11px] text-white/90 font-light truncate mt-0.5">
                Grade {studentGradeLevel} &bull; {currentBoard}
              </p>
            </div>
          </div>

          {/* Navigation Links Menu */}
          <div className="space-y-1 pt-1">
            <span className="px-3 text-[10px] font-normal uppercase tracking-wider text-white/80">
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
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${isActive ? 'text-white' : 'text-white/80'}`}>
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
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors cursor-pointer font-normal"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#00A896]" />
              <span>My Account</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-[#132A4C] hover:bg-[#1C3A66] text-white/90 hover:text-white transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-white" />}
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
                className="flex items-center gap-1 text-white/80 hover:text-rose-400 transition-colors cursor-pointer"
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
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                <p className="text-[11px] text-slate-500 dark:text-white hidden sm:block">
                  CBSE/ICSE/State Board Compliant &bull; Grade {studentGradeLevel} &bull; Socratic Mastery
                </p>
              </div>
            </div>

            {/* Right: Quick Context Controls & Badges */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Duolingo-style Daily Learning Streak & XP Points Widget */}
              <StudentGamificationHub />

              {/* Offline Study Pack (Low-Bandwidth Mode & Offline Saver) */}
              <button
                onClick={() => setIsOfflineModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-normal text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer"
                title="Save Agile Study Plan & AI Summaries for Offline Viewing / Low-Bandwidth Mode"
              >
                <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="hidden lg:inline">Offline Pack</span>
              </button>

              {/* Parental Weekly Digest (Completed vs Planned Hours Sunday Email) */}
              <button
                onClick={() => setIsParentDigestOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-normal text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer"
                title="Parental Weekly Digest: Completed sprint hours vs planned hours summary"
              >
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden lg:inline">Parent Digest</span>
              </button>

              {/* Quick Board Selector Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-normal text-slate-800 dark:text-white shadow-2xs">
                <Globe className="w-3.5 h-3.5 text-[#00A896]" />
                <span>{currentBoard}</span>
              </div>

              {/* Quick Grade Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00A896]/15 dark:bg-[#00A896]/20 border border-[#00A896]/30 text-xs font-normal text-[#00A896] dark:text-[#00A896] shadow-2xs">
                <span>Grade {studentGradeLevel}</span>
              </div>

              {/* Date pill */}
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-normal text-slate-600 dark:text-white border border-slate-200 dark:border-slate-700/80">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-white" />
                <span>{currentDateStr}</span>
              </div>

              {/* Workflow & Ecosystem Map Button */}
              <button
                onClick={() => setEcosystemOverviewMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-normal text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer"
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
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1680px] mx-auto w-full flex-1 space-y-6">
          {/* TAB 1: MAIN DASHBOARD VIEW (Top Progress & Filters + Full-Width Agile Study Roadmap + Quick Doubts AI) */}
          {studentNav === 'dashboard' && (
            <div className="space-y-6">
              {/* ROW 1: FULL-WIDTH GRADE & BOARD FILTERS (Stretched Left to Right above Course Tracker) */}
              <div className="font-lollipop-regular w-full bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-normal uppercase tracking-wider text-slate-500 dark:text-white">
                    Grade & Board Filters
                  </h3>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Curriculum Live Synced</span>
                    </span>
                    <button
                      onClick={() => setIsCurriculumModalOpen(true)}
                      className="font-normal text-[#FF6B00] hover:underline cursor-pointer"
                    >
                      View Syllabus &rarr;
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  {/* Grade Selector Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-normal text-slate-700 dark:text-white block">
                      Grade Level
                    </label>
                    <div className="relative">
                      <select
                        value={activeGradeFilter}
                        onChange={(e) => {
                          const nextGrade = Number(e.target.value);
                          setActiveGradeFilter(nextGrade);
                          updateCurrentUser({
                            grade: `Grade ${nextGrade}`,
                            grade_level: nextGrade,
                          });
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-normal text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] appearance-none cursor-pointer"
                      >
                        {gradeOptions.map((g) => (
                          <option key={g} value={g}>
                            Grade {g}
                            {g === 11 ? ' (Science)' : g === 12 ? ' (Advanced)' : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Education Board Selector Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-normal text-slate-700 dark:text-white block">
                      Governing Board
                    </label>
                    <div className="relative">
                      <select
                        value={currentBoard}
                        onChange={(e) => {
                          const nextBoard = e.target.value as EducationBoard;
                          setCurrentBoard(nextBoard);
                          updateCurrentUser({ education_board: nextBoard });
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-normal text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] appearance-none cursor-pointer"
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
                    <label className="text-xs font-normal text-slate-700 dark:text-white flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Language Medium</span>
                    </label>
                    <div className="relative">
                      <select
                        value={globalLanguage}
                        onChange={(e) => {
                          const nextLang = e.target.value as LanguageMedium;
                          setGlobalLanguage(nextLang);
                          updateCurrentUser({ preferred_language: nextLang });
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-normal text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] appearance-none cursor-pointer"
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

                  {/* Quick Selected Subjects & Profile Sync */}
                  <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 space-y-0.5 text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-normal text-slate-700 dark:text-white truncate">
                        Selected Subjects ({currentUser?.enrolledCourses?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsProfileOpen(true)}
                        className="text-[#00A896] hover:underline font-normal cursor-pointer shrink-0"
                      >
                        Select in Profile &rarr;
                      </button>
                    </div>
                    <p className="text-[10px] font-normal text-slate-500 dark:text-white/80 truncate">
                      {displaySubjects.length} live Admin subjects for Grade {activeGradeFilter} ({currentBoard}).
                    </p>
                  </div>
                </div>
              </div>

              {/* ROW 2: FULL-WIDTH ENROLLED COURSE COMPLETION TRACKER */}
              <div className="w-full">
                <CourseProgressTracker />
              </div>

              {/* ROW 3: STUDY SPRINT GOALS (Student Momentum Full-Width Strip) */}
              <div className="font-lollipop-regular w-full bg-white dark:bg-[#0E1A2D] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 shrink-0">
                  <h3 className="text-xs font-normal uppercase tracking-wider text-slate-500 dark:text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#FF6B00]" />
                    <span>Study Momentum</span>
                  </h3>
                  <span className="text-[11px] font-normal text-[#FF6B00] bg-orange-50 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800/60">
                    5-Day Streak 🔥
                  </span>
                </div>

                <div className="flex-1 max-w-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-white">
                    <span>Weekly Core Math:</span>
                    <span className="font-normal text-slate-900 dark:text-white">10.5 / 10.5 hrs</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#FF6B00] to-[#FFA04D] h-full rounded-full w-4/5" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-white shrink-0">
                  <Target className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Next Milestone: Quadratic Formula Drills</span>
                </div>
              </div>

              {/* ROW 2: FULL-WIDTH AGILE STUDY ROADMAP & DAILY PLANNER */}
              <div className="w-full">
                <AgileStudyRoadmap />
              </div>

              {/* ROW 3: FULL-WIDTH QUICK DOUBTS AI ASSISTANT (Real-time LLM, Subject & Topic, Private — Not Submitted to Teachers) */}
              <div className="quick-doubts-lollipop bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: Ask Subject + Topic Specific Query */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/80 text-[#FF6B00] flex items-center justify-center font-bold shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                              Quick Doubts AI Assistant
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              Real-Time LLM
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-white/80 mt-0.5 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-[#00A896]" />
                            <span>Private AI tutor &bull; Not submitted to any teacher</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs leading-relaxed text-slate-700 dark:text-white">
                      <div className="flex items-center gap-2 mb-1 text-[11px] font-bold text-[#FF6B00]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Interactive Resolution &amp; Further Learning</span>
                      </div>
                      Select your <strong>Subject</strong> and <strong>Topic</strong> below, ask your question (or attach a diagram), and chat interactively with the AI Agent for step-by-step <strong>Resolution</strong> and <strong>Further Learning</strong>.
                    </div>

                    <form onSubmit={handleSidebarDoubtSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Subject Dropdown */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-white">
                            Subject
                          </label>
                          <select
                            value={sidebarDoubtSubject}
                            onChange={(e) => setSidebarDoubtSubject(e.target.value)}
                            aria-label="Select subject for Quick Doubts AI"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                          >
                            {displaySubjects.map((s) => {
                              const localized = getLocalizedSubjectName(s.name, currentBoard);
                              return (
                                <option key={`sb-doubt-${s.id}`} value={localized}>
                                  {localized} (Grade {s.grade_level})
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Topic Dropdown */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-white">
                            Topic
                          </label>
                          <select
                            value={sidebarDoubtTopic}
                            onChange={(e) => setSidebarDoubtTopic(e.target.value)}
                            aria-label="Select topic for Quick Doubts AI"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                          >
                            {sidebarTopicsForSubject.map((t) => (
                              <option key={`sb-topic-${t.id}`} value={t.title}>
                                {t.title}
                              </option>
                            ))}
                            <option value="">General {sidebarDoubtSubject}</option>
                            <option value="__custom__">+ Enter Custom Topic...</option>
                          </select>
                        </div>
                      </div>

                      {sidebarDoubtTopic === '__custom__' && (
                        <input
                          type="text"
                          value={sidebarCustomTopic}
                          onChange={(e) => setSidebarCustomTopic(e.target.value)}
                          placeholder={`Enter specific ${sidebarDoubtSubject} topic (e.g., Quadratic Equations)...`}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                        />
                      )}

                      {sidebarImageData && (
                        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={sidebarImageData.preview}
                              alt="Attached diagram"
                              className="w-9 h-9 rounded-lg object-cover border border-orange-300"
                            />
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-white truncate">
                              Diagram attached for AI vision
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSidebarImageData(null)}
                            className="p-1 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 text-slate-500 dark:text-white cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={sidebarDoubtText}
                          onChange={(e) => setSidebarDoubtText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSidebarDoubtSubmit(e as unknown as React.FormEvent);
                            }
                          }}
                          placeholder={`Ask your ${sidebarDoubtSubject}${
                            sidebarDoubtTopic && sidebarDoubtTopic !== '__custom__'
                              ? ` • ${sidebarDoubtTopic}`
                              : ''
                          } question...`}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] resize-none transition-all"
                        />

                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-white cursor-pointer hover:border-[#FF6B00] transition-colors">
                            <UploadCloud className="w-3.5 h-3.5 text-[#FF6B00]" />
                            <span>Attach Diagram</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleQuickDoubtImageSelect(e.target.files?.[0], setSidebarImageData)}
                            />
                          </label>

                          <button
                            type="submit"
                            disabled={(!sidebarDoubtText.trim() && !sidebarImageData) || isSidebarSubmitting}
                            className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            {isSidebarSubmitting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Resolving Live...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Ask AI Assistant</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Right: Live Real-Time LLM Answer Feed */}
                  <div className="lg:col-span-7 lg:border-l lg:border-slate-100 dark:lg:border-slate-800 lg:pl-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500 dark:text-white uppercase tracking-wider">
                          Real-Time AI Answers
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-[#00A896] font-semibold border border-teal-200 dark:border-teal-800">
                          {quickDoubts.length} Resolved Privately
                        </span>
                      </div>
                      {quickDoubts.length > 0 && (
                        <button
                          type="button"
                          onClick={clearQuickDoubts}
                          className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          Clear History
                        </button>
                      )}
                    </div>

                    {quickDoubts.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1.5">
                        <Sparkles className="w-5 h-5 text-[#FF6B00] mx-auto" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-white">
                          Ask any Subject &amp; Topic question on the left
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-white/75">
                          Answers stream immediately from the AI Assistant — nothing is sent to teachers.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                        {quickDoubts.map((item: QuickDoubtItem, idx: number) => {
                          const isExpanded =
                            expandedQuickDoubtId === item.id ||
                            (idx === 0 && expandedQuickDoubtId === null) ||
                            item.status === 'streaming';
                          return (
                            <div
                              key={item.id}
                              className={`rounded-2xl border transition-all ${
                                item.status === 'streaming'
                                  ? 'bg-orange-50/40 dark:bg-orange-950/20 border-[#FF6B00]/50 shadow-xs'
                                  : item.status === 'error'
                                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/70'
                                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                              }`}
                            >
                              {/* Question Header */}
                              <div
                                onClick={() =>
                                  setExpandedQuickDoubtId(isExpanded ? '__none__' : item.id)
                                }
                                className="p-3.5 flex items-start justify-between gap-3 cursor-pointer"
                              >
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                      {item.subject}
                                    </span>
                                    {item.topic && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#00A896] border border-teal-200 dark:border-teal-800">
                                        {item.topic}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-slate-400 dark:text-slate-300">
                                      {item.createdAt}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                                    {item.question}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {item.status === 'streaming' ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FF6B00]/15 text-[#FF6B00] flex items-center gap-1">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Streaming
                                    </span>
                                  ) : item.status === 'blocked' ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                                      <ShieldAlert className="w-3 h-3" />
                                      Guardian Notified
                                    </span>
                                  ) : item.status === 'error' ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                      Error
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                                      Interactive Chat
                                    </span>
                                  )}
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>
                              </div>

                              {/* Expanded Interactive Student <-> AI Chat Body */}
                              {isExpanded && (
                                <div className="px-3.5 pb-3.5 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/60 space-y-2.5">
                                  {item.errorMessage && (
                                    <div className="p-2.5 rounded-xl bg-rose-100/70 dark:bg-rose-950/60 text-rose-700 dark:text-rose-200 text-xs">
                                      {item.errorMessage}
                                    </div>
                                  )}

                                  {renderInteractiveThreadMessages(
                                    item,
                                    'Dashboard Quick Doubts AI Assistant',
                                    false
                                  )}

                                  <div className="flex items-center justify-between pt-1">
                                    <span className="text-[10px] text-slate-400 dark:text-slate-300 flex items-center gap-1">
                                      <Lock className="w-2.5 h-2.5 text-[#00A896]" />
                                      <span>Private Student &harr; AI session (not sent to teachers)</span>
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {item.answer && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyDoubtAnswer(item.id, item.answer);
                                          }}
                                          className="px-2 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-700 hover:bg-slate-300/70 dark:hover:bg-slate-600 text-[10px] font-semibold text-slate-700 dark:text-white flex items-center gap-1 cursor-pointer"
                                        >
                                          <Copy className="w-3 h-3" />
                                          <span>{copiedDoubtId === item.id ? 'Copied!' : 'Copy'}</span>
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteQuickDoubt(item.id);
                                        }}
                                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                                        title="Remove entry"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
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
              <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-light text-slate-900 dark:text-white tracking-wide">Skills Passport & Subject Units</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>Live Synced</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-white mt-1">
                      Auto-aligned to Grade {activeGradeFilter} &bull; {BOARD_LABELS[currentBoard as EducationBoard] || currentBoard} &bull; Real-time sync with Student Profile, Teacher & Admin panels
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setIsProfileOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-[#00A896] text-white text-xs font-bold hover:bg-[#009282] transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Manage Profile Subjects ({currentUser?.enrolledCourses?.length || 0})</span>
                    </button>
                    <button
                      onClick={() => setIsCurriculumModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#E56000] transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Browse Full Grades 6-12 Curriculum</span>
                    </button>
                  </div>
                </div>

                {/* Filter Controls: Enrolled vs All Grade Subjects + Domain Filters */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCoursesScopeFilter('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        coursesScopeFilter === 'ALL'
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      All Grade {activeGradeFilter} Subjects ({displaySubjects.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoursesScopeFilter('ENROLLED')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        coursesScopeFilter === 'ENROLLED'
                          ? 'bg-[#00A896] text-white shadow-xs'
                          : 'bg-teal-50 dark:bg-teal-950/40 text-[#00A896] hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800'
                      }`}
                    >
                      My Selected Subjects ({displaySubjects.filter((s) => isSubjectEnrolled(s, currentUser?.enrolledCourses, currentBoard)).length})
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['ALL', ...(activeCategories.length > 0 ? activeCategories : ['STEM', 'Language Arts', 'Humanities', 'Arts & Electives'])]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCoursesCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                          coursesCategoryFilter === cat
                            ? 'bg-[#FF6B00] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cat === 'ALL' ? 'All Domains' : cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Informational banner */}
              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-[#0B2528] border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
                  <Zap className="w-4 h-4 text-[#00A896] shrink-0" />
                  <span>Select or enroll in any subject below to add it to your Profile &amp; Agile Study Roadmap. Completing units immediately updates your progress bars and broadcasts to your Teacher's roster.</span>
                </div>
                <span className="font-bold text-[#00A896] shrink-0">Live Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displaySubjects
                  .filter((sub) => {
                    if (coursesCategoryFilter !== 'ALL' && (sub.category || 'STEM') !== coursesCategoryFilter) return false;
                    if (coursesScopeFilter === 'ENROLLED' && !isSubjectEnrolled(sub, currentUser?.enrolledCourses, currentBoard)) return false;
                    return true;
                  })
                  .map((sub) => {
                  const localizedSubName = getLocalizedSubjectName(sub.name, currentBoard);
                  const isEnrolled = isSubjectEnrolled(sub, currentUser?.enrolledCourses, currentBoard);
                  const topicsForSub = topicsDB.filter((t) => t.subject_id === sub.id && t.status === 'ACTIVE');
                  
                  // Compute live mastery percentage for this subject
                  const normSubName = sub.name.toLowerCase();
                  let subProgress = 75;
                  if (normSubName.includes('math') || normSubName.includes('algeb')) {
                    subProgress = currentUser?.mathProgress ?? 92;
                  } else if (normSubName.includes('phys')) {
                    subProgress = currentUser?.physicsProgress ?? 75;
                  } else if (normSubName.includes('bio')) {
                    subProgress = currentUser?.biologyProgress ?? 88;
                  } else if (normSubName.includes('chem')) {
                    subProgress = 82;
                  } else if (normSubName.includes('hist') || normSubName.includes('civic')) {
                    subProgress = 78;
                  } else if (normSubName.includes('eng') || normSubName.includes('lit')) {
                    subProgress = 85;
                  }

                  const matchingTasks = dailyTasks.filter((t) =>
                    (t.subject || '').toLowerCase().includes(normSubName) ||
                    normSubName.includes((t.subject || '').toLowerCase()) ||
                    (t.subject || '').toLowerCase() === localizedSubName.toLowerCase()
                  );
                  const completedTasksCount = matchingTasks.filter((t) => t.status === 'Completed').length;

                  return (
                    <div
                      key={sub.id}
                      className={`bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between ${
                        isEnrolled
                          ? 'border-[#00A896] ring-1 ring-[#00A896]/25'
                          : 'border-slate-200/90 dark:border-slate-800/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-center shrink-0">
                            <SubjectIcon subject={localizedSubName} size="lg" />
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white">
                              {sub.code || `GR-${sub.grade_level}`}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">
                              {sub.board && sub.board !== 'ALL' ? sub.board : currentBoard}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleSubjectEnrollment(sub)}
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                                isEnrolled
                                  ? 'bg-[#00A896] text-white border-[#00A896]'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-white border-slate-200 dark:border-slate-700 hover:border-[#00A896] hover:text-[#00A896]'
                              }`}
                            >
                              {isEnrolled ? (
                                <>
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  <span>Selected</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Select Subject</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="mt-2">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-light text-base text-slate-900 dark:text-white">{localizedSubName}</h3>
                            <span className="text-[10px] font-bold text-[#00A896] shrink-0">{subProgress}%</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-white mt-0.5 line-clamp-2">{sub.description}</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 dark:text-white">Syllabus Mastery:</span>
                            <span className="font-bold text-[#00A896]">{subProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#00A896] h-full rounded-full transition-all duration-500"
                              style={{ width: `${subProgress}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-white text-right">
                            {completedTasksCount} Agile Tasks Completed
                          </div>
                        </div>

                        {/* Interactive Units List */}
                        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white">
                            Active Curriculum Units ({topicsForSub.length}):
                          </span>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                            {topicsForSub.length === 0 ? (
                              <p className="text-[11px] text-slate-400 italic">No active topics added yet.</p>
                            ) : (
                              topicsForSub.map((top) => (
                                <div
                                  key={top.id}
                                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
                                    <span className="truncate text-slate-700 dark:text-white font-medium">{top.title}</span>
                                  </div>
                                  <button
                                    onClick={() => completeCurriculumUnit(localizedSubName, top.title)}
                                    className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 shrink-0 cursor-pointer transition-colors"
                                    title="Mark unit completed and sync to Teacher/Admin in real time"
                                  >
                                    ✓ Complete
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setStudentNav('practice');
                            const matchedQuiz = quizzes.find((q) =>
                              q.topic.toLowerCase().includes(normSubName) || q.title.toLowerCase().includes(normSubName)
                            );
                            if (matchedQuiz) setActiveQuizId(matchedQuiz.id);
                          }}
                          className="py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-[#00A896] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FileQuestion className="w-3.5 h-3.5" />
                          <span>Practice Quiz</span>
                        </button>
                        <button
                          onClick={() => {
                            setStudentNav('ai-tutor');
                            sendTutorMessage(`Let's start tutoring on ${localizedSubName} - ${topicsForSub[0]?.title || 'Core Syllabus'}.`);
                          }}
                          className="py-2 rounded-xl bg-orange-50 hover:bg-[#FF6B00] hover:text-white dark:bg-orange-950/60 text-[#FF6B00] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Launch AI Drill</span>
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
              <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-light text-slate-900 dark:text-white tracking-wide">Academic Performance & Mastery KPIs</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Real-Time Computed
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-white mt-1">
                    Cumulative GPA: {currentUser?.gpa ?? 3.85} / 4.0 &bull; Board Compliance: 98% &bull; Grade {studentGradeLevel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      addNotification(
                        'Faculty Grade Review Requested 📋',
                        `${currentUser?.name || 'Sarah Connor'} requested faculty grade review on Core STEM modules. Teacher notified in real time!`,
                        'info',
                        'student'
                      );
                      setGradeReviewMessage('Faculty review requested! Your instructor has received this in their Educator Portal.');
                      setTimeout(() => setGradeReviewMessage(null), 4000);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Request Faculty Review</span>
                  </button>
                </div>
              </div>

              {gradeReviewMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-in fade-in flex items-center justify-between">
                  <span>✓ {gradeReviewMessage}</span>
                  <button onClick={() => setGradeReviewMessage(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
                </div>
              )}

              {/* Dynamic KPI Scorecards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0E1A2D] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
                  <div className="text-3xl font-black text-[#FF6B00]">{currentUser?.overallProgress ?? 88}%</div>
                  <div className="text-xs font-bold text-slate-500 dark:text-white mt-1">Overall Mastery</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">Top 5% Cohort</span>
                </div>
                <div className="bg-white dark:bg-[#0E1A2D] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
                  <div className="text-3xl font-black text-[#00A896]">{currentUser?.physicsProgress ?? 75}%</div>
                  <div className="text-xs font-bold text-slate-500 dark:text-white mt-1">Physics Progress</div>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block mt-0.5">Kinematics & Dynamics</span>
                </div>
                <div className="bg-white dark:bg-[#0E1A2D] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{currentUser?.mathProgress ?? 92}%</div>
                  <div className="text-xs font-bold text-slate-500 dark:text-white mt-1">Algebra I (Core)</div>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block mt-0.5">Quadratic Equations</span>
                </div>
                <div className="bg-white dark:bg-[#0E1A2D] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
                  <div className="text-3xl font-black text-amber-500">{currentUser?.attendance ?? 98}%</div>
                  <div className="text-xs font-bold text-slate-500 dark:text-white mt-1">Attendance</div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-0.5">Exam Eligible</span>
                </div>
              </div>

              {/* Comprehensive Grade Book & Continuous Assessment Table */}
              <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-light text-base text-slate-900 dark:text-white">Subject Mastery & Continuous Evaluation Ledger</h3>
                    <p className="text-xs text-slate-500 dark:text-white">Dynamically updated through Agile Sprint story points, daily tasks, and quiz assessments</p>
                  </div>
                  <span className="text-xs font-bold text-[#00A896]">Term 1 (2026–2027)</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-normal">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-white uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">Course / Discipline</th>
                        <th className="p-3">Curriculum Units</th>
                        <th className="p-3">Agile Sprints</th>
                        <th className="p-3">Mastery Level</th>
                        <th className="p-3">Letter Grade</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(displaySubjects.filter((s) => isSubjectEnrolled(s, currentUser?.enrolledCourses, currentBoard)).length > 0
                        ? displaySubjects.filter((s) => isSubjectEnrolled(s, currentUser?.enrolledCourses, currentBoard))
                        : displaySubjects.slice(0, 6)
                      ).map((sub) => {
                        const localized = getLocalizedSubjectName(sub.name, currentBoard);
                        const normSub = sub.name.toLowerCase();
                        const subTopics = topicsDB.filter((t) => t.subject_id === sub.id && t.status === 'ACTIVE');
                        const subTasks = dailyTasks.filter(
                          (t) =>
                            (t.subject || '').toLowerCase().includes(normSub) ||
                            normSub.includes((t.subject || '').toLowerCase()) ||
                            (t.subject || '').toLowerCase() === localized.toLowerCase()
                        );
                        const doneCount = subTasks.filter((t) => t.status === 'Completed').length;
                        let progress = currentUser?.overallProgress ?? 80;
                        if (normSub.includes('math') || normSub.includes('algeb')) progress = currentUser?.mathProgress ?? 92;
                        else if (normSub.includes('phys')) progress = currentUser?.physicsProgress ?? 75;
                        else if (normSub.includes('bio')) progress = currentUser?.biologyProgress ?? 88;
                        else if (normSub.includes('chem')) progress = currentUser?.chemistryProgress ?? 84;
                        else if (normSub.includes('hist') || normSub.includes('civic')) progress = currentUser?.historyProgress ?? 79;

                        const letterGrade = progress >= 92 ? 'A+' : progress >= 85 ? 'A' : progress >= 75 ? 'B+' : 'B';
                        const status = progress >= 90 ? 'Mastered' : progress >= 75 ? 'On Track' : 'Revision Needed';
                        const code = sub.code || `GR-${sub.grade_level}`;

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-bold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-2.5">
                                <SubjectIcon subject={localized} size="sm" />
                                <div>
                                  <div className="font-lollipop-regular">{localized}</div>
                                  <span className="text-[10px] font-normal text-slate-400 dark:text-white/80">
                                    {code} &bull; {sub.board && sub.board !== 'ALL' ? sub.board : currentBoard}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-slate-600 dark:text-white">
                              {subTopics.length} {subTopics.length === 1 ? 'Unit' : 'Units'}
                            </td>
                            <td className="p-3 text-slate-600 dark:text-white">
                              {doneCount} / {Math.max(1, subTasks.length)} Tasks
                            </td>
                            <td className="p-3">
                              <div className="w-28 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-[#00A896] h-full rounded-full"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-[#00A896] mt-0.5 block">{progress}%</span>
                            </td>
                            <td className="p-3 font-black text-slate-900 dark:text-white">{letterGrade}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  status === 'Mastered'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : status === 'On Track'
                                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800'
                                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => {
                                  setStudentNav('ai-tutor');
                                  sendTutorMessage(`Let's launch a practice drill on ${localized} (Grade ${activeGradeFilter}, ${currentBoard}).`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-[#FF6B00] hover:text-white dark:bg-orange-950/60 text-[#FF6B00] text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Launch Drill
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remedial drill banner */}
              <div className="p-5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 space-y-2">
                <div className="flex items-center gap-2 text-[#FF6B00] font-extrabold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Targeted Remedial Opportunity</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-white leading-relaxed">
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
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-lollipop-regular text-slate-900 dark:text-white tracking-wide">
                      Interactive Practice Quizzes
                    </h2>
                    <span className="text-xs font-lollipop-regular text-emerald-700 dark:text-emerald-400">
                      · Real-Time Sync Active
                    </span>
                  </div>
                  <p className="text-sm font-lollipop-regular text-slate-600 dark:text-slate-300 mt-1">
                    30-question board-compliant assessments, one question at a time · Score ≥ 80% earns verified credentials
                  </p>
                </div>
                <div className="text-sm font-lollipop-regular text-[#FF6B00] whitespace-nowrap shrink-0 tabular-nums">
                  {quizzes.length} Quizzes · 30 Questions Each
                </div>
              </div>

              {/* Quiz Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((quiz) => {
                  const isSelected = activeQuiz?.id === quiz.id;
                  return (
                    <button
                      type="button"
                      key={quiz.id}
                      onClick={() => {
                        setActiveQuizId(quiz.id);
                        setCurrentQuestionIndex(0);
                        setSelectedAnswers({});
                        setQuizSubmitted(false);
                        setQuizResult(null);
                        setIsReviewingAnswers(false);
                      }}
                      className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50/60 dark:bg-orange-950/25 border-[#FF6B00] ring-2 ring-[#FF6B00]/20'
                          : 'bg-white dark:bg-[#0E1A2D] border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 text-xs font-lollipop-regular">
                        <span className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                          <SubjectIcon subject={quiz.topic || quiz.title} size="sm" />
                          <span>{quiz.grade || `Grade ${studentGradeLevel}`}</span>
                        </span>
                        <span className="text-[#FF6B00] tabular-nums">
                          {quiz.questions?.length || 30} Questions
                        </span>
                      </div>
                      <h3 className="font-lollipop-regular text-slate-900 dark:text-white text-base leading-snug">
                        {quiz.title}
                      </h3>
                      <p className="text-xs font-lollipop-regular text-slate-500 dark:text-slate-300 mt-1">
                        {quiz.topic}
                      </p>
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-lollipop-regular text-slate-500 dark:text-slate-300 tabular-nums">
                        <span>Attempts: {quiz.attempts || 0}</span>
                        <span>Avg: {quiz.avgScore ? `${quiz.avgScore}%` : 'Pending'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Single-Question Quiz Player / Submission Result */}
              {activeQuiz && activeQuiz.questions.length > 0 && (() => {
                const totalQuestions = activeQuiz.questions.length;
                const safeIndex = Math.min(Math.max(0, currentQuestionIndex), totalQuestions - 1);
                const currentQuestion = activeQuiz.questions[safeIndex];
                const answeredCount = Object.keys(selectedAnswers).length;
                const userSelection = selectedAnswers[safeIndex];
                const isCurrentCorrect = userSelection === currentQuestion.answerIndex;
                const progressPercent = Math.round(((safeIndex + 1) / totalQuestions) * 100);

                const handleRetakeQuiz = () => {
                  setSelectedAnswers({});
                  setQuizSubmitted(false);
                  setQuizResult(null);
                  setIsReviewingAnswers(false);
                  setCurrentQuestionIndex(0);
                };

                const handleSubmitQuiz = () => {
                  const result = recordQuizSubmission(activeQuiz.id, selectedAnswers);
                  setQuizSubmitted(true);
                  setQuizResult(result);
                  setIsReviewingAnswers(false);
                };

                return (
                  <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-6">
                    {/* Quiz Header & Progress */}
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg sm:text-xl font-lollipop-regular text-slate-900 dark:text-white">
                          {activeQuiz.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-lollipop-regular text-slate-500 dark:text-slate-300 mt-0.5">
                          {activeQuiz.topic} · {activeQuiz.author}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-lollipop-regular text-slate-700 dark:text-slate-200 tabular-nums shrink-0">
                        <span>
                          Question {safeIndex + 1} of {totalQuestions}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <span>
                          Answered: {answeredCount} / {totalQuestions}
                        </span>
                      </div>
                    </div>

                    {/* Result Summary View on Submission */}
                    {quizSubmitted && quizResult && !isReviewingAnswers ? (
                      <div className="space-y-6 py-2">
                        <div
                          className={`p-6 sm:p-8 rounded-2xl border space-y-5 ${
                            quizResult.score >= 80
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-sm font-lollipop-regular text-emerald-700 dark:text-emerald-300">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <span>
                                  {quizResult.score >= 80
                                    ? 'Assessment Passed · Verified Certificate Earned'
                                    : 'Assessment Submitted · Review & Retake to Reach 80%'}
                                </span>
                              </div>
                              <h4 className="text-2xl sm:text-3xl font-lollipop-regular text-slate-900 dark:text-white tabular-nums">
                                Final Score: {quizResult.score}% ({quizResult.correctCount} / {quizResult.totalQuestions} Correct)
                              </h4>
                              <p className="text-xs sm:text-sm font-lollipop-regular text-slate-600 dark:text-slate-300">
                                Your score is synchronized with Grades &amp; Mastery and your instructor&apos;s class roster.
                              </p>
                            </div>

                            {quizResult.certificateIssued && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCertModal(quizResult.certificateIssued || null);
                                  setStudentNav('certificates');
                                }}
                                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-lollipop-regular text-sm shadow-xs flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                              >
                                <Award className="w-4 h-4" />
                                <span>View Issued Certificate</span>
                              </button>
                            )}
                          </div>

                          {/* Breakdown Stats */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1526] border border-slate-200/80 dark:border-slate-700/70">
                              <div className="text-xs font-lollipop-regular text-slate-500 dark:text-slate-400">Percentage</div>
                              <div className="text-xl font-lollipop-regular text-slate-900 dark:text-white mt-1 tabular-nums">
                                {quizResult.score}%
                              </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1526] border border-slate-200/80 dark:border-slate-700/70">
                              <div className="text-xs font-lollipop-regular text-slate-500 dark:text-slate-400">Correct Answers</div>
                              <div className="text-xl font-lollipop-regular text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                                {quizResult.correctCount}
                              </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1526] border border-slate-200/80 dark:border-slate-700/70">
                              <div className="text-xs font-lollipop-regular text-slate-500 dark:text-slate-400">Incorrect / Skipped</div>
                              <div className="text-xl font-lollipop-regular text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
                                {quizResult.totalQuestions - quizResult.correctCount}
                              </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1526] border border-slate-200/80 dark:border-slate-700/70">
                              <div className="text-xs font-lollipop-regular text-slate-500 dark:text-slate-400">Total Questions</div>
                              <div className="text-xl font-lollipop-regular text-slate-900 dark:text-white mt-1 tabular-nums">
                                {quizResult.totalQuestions}
                              </div>
                            </div>
                          </div>

                          {/* Result Actions: Retake or Step-by-Step Question Review */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/70 dark:border-slate-700/70">
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentQuestionIndex(0);
                                setIsReviewingAnswers(true);
                              }}
                              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-sm font-lollipop-regular transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Review Questions &amp; Explanations (1–{totalQuestions})
                            </button>

                            <button
                              type="button"
                              onClick={handleRetakeQuiz}
                              className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-lollipop-regular shadow-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>Retake Quiz</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Single Question Display (Active Attempt OR Question-by-Question Review) */
                      <div className="space-y-6">
                        {/* Review Banner if reviewing after submission */}
                        {quizSubmitted && quizResult && isReviewingAnswers && (
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                            <div className="text-sm font-lollipop-regular text-slate-700 dark:text-slate-200 tabular-nums">
                              Review Mode · Final Score: {quizResult.score}% ({quizResult.correctCount} / {quizResult.totalQuestions} Correct)
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setIsReviewingAnswers(false)}
                                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-white text-xs font-lollipop-regular hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap"
                              >
                                Back to Result Summary
                              </button>
                              <button
                                type="button"
                                onClick={handleRetakeQuiz}
                                className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-lollipop-regular flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Retake Quiz</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Progress Bar + Compact Question Navigator (1 to 30) */}
                        <div className="space-y-3">
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-[#FF6B00] transition-all duration-200 rounded-full"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>

                          <div className="flex flex-wrap gap-1.5" aria-label="Question navigator">
                            {activeQuiz.questions.map((qItem, idx) => {
                              const isCurrent = idx === safeIndex;
                              const isAnswered = selectedAnswers[idx] !== undefined;
                              const isCorrectIdx = quizSubmitted && selectedAnswers[idx] === qItem.answerIndex;

                              let stepClass =
                                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700';

                              if (quizSubmitted) {
                                stepClass = isCorrectIdx
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700';
                              } else if (isAnswered) {
                                stepClass =
                                  'bg-orange-50 dark:bg-orange-950/40 text-[#FF6B00] border-orange-300 dark:border-orange-700';
                              }

                              if (isCurrent) {
                                stepClass =
                                  'bg-[#FF6B00] text-white border-[#FF6B00] ring-2 ring-[#FF6B00]/25';
                              }

                              return (
                                <button
                                  type="button"
                                  key={qItem.id || idx}
                                  onClick={() => setCurrentQuestionIndex(idx)}
                                  className={`w-8 h-8 rounded-lg border text-xs font-lollipop-regular tabular-nums transition-colors cursor-pointer flex items-center justify-center ${stepClass}`}
                                  title={`Go to Question ${idx + 1}`}
                                >
                                  {idx + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Single Active Question Card */}
                        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 space-y-5">
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-base sm:text-lg font-lollipop-regular text-slate-900 dark:text-white leading-relaxed">
                              <span className="text-[#FF6B00] mr-2 tabular-nums">Q{safeIndex + 1}.</span>
                              {currentQuestion.question}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {currentQuestion.options.map((opt, optIndex) => {
                              const isOptionSelected = userSelection === optIndex;
                              const isRightAnswer = currentQuestion.answerIndex === optIndex;

                              let optionStyle =
                                'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80';

                              if (quizSubmitted) {
                                if (isRightAnswer) {
                                  optionStyle =
                                    'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-500';
                                } else if (isOptionSelected && !isRightAnswer) {
                                  optionStyle =
                                    'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-500';
                                }
                              } else if (isOptionSelected) {
                                optionStyle =
                                  'bg-[#FF6B00] text-white border-[#FF6B00] shadow-xs';
                              }

                              return (
                                <button
                                  type="button"
                                  key={optIndex}
                                  onClick={() =>
                                    !quizSubmitted &&
                                    setSelectedAnswers((prev) => ({ ...prev, [safeIndex]: optIndex }))
                                  }
                                  disabled={quizSubmitted}
                                  className={`min-h-[48px] px-4 py-3 rounded-xl text-left text-sm font-lollipop-regular transition-all cursor-pointer border flex items-center justify-between gap-3 ${optionStyle}`}
                                >
                                  <span>
                                    <span className="mr-2 opacity-80">{String.fromCharCode(65 + optIndex)}.</span>
                                    {opt}
                                  </span>
                                  {quizSubmitted && isRightAnswer && (
                                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  )}
                                  {quizSubmitted && isOptionSelected && !isRightAnswer && (
                                    <X className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div
                              className={`p-3.5 rounded-xl text-sm font-lollipop-regular border ${
                                isCurrentCorrect
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800/70'
                                  : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800/70'
                              }`}
                            >
                              <span className="mr-1.5">
                                {isCurrentCorrect
                                  ? '✓ Correct Answer:'
                                  : userSelection === undefined
                                  ? '✗ Question Skipped:'
                                  : '✗ Incorrect Answer:'}
                              </span>
                              {currentQuestion.explanation}
                            </div>
                          )}
                        </div>

                        {/* Bottom Navigation Bar: Back, Next, Submit & Retake */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                              disabled={safeIndex === 0}
                              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-white text-sm font-lollipop-regular flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Back</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleRetakeQuiz}
                              className="px-4 py-2.5 rounded-xl text-sm font-lollipop-regular text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>Retake</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
                              }
                              disabled={safeIndex === totalQuestions - 1}
                              className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-lollipop-regular shadow-xs shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            {!quizSubmitted && (safeIndex === totalQuestions - 1 || answeredCount > 0) && (
                              <button
                                type="button"
                                onClick={handleSubmitQuiz}
                                disabled={answeredCount === 0}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-lollipop-regular shadow-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Submit Quiz</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
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
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
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
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-white hover:bg-slate-200 transition-colors cursor-pointer"
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
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-xs'
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
                          msg.sender === 'student' ? 'text-white/70' : 'text-slate-400 dark:text-white'
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
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl text-xs text-slate-500 dark:text-white">
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
                  <button onClick={() => setAttachedImagePreview(null)} className="p-1 text-slate-400 dark:text-white hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <label
                  title="Attach photo of homework problem"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
                >
                  <ImageIcon className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleHomeworkPhotoUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  title={isVoiceRecording ? 'Stop voice recording' : 'Speak to AI Tutor'}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isVoiceRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white'
                  }`}
                >
                  {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask any concept, formula, or problem..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
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
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-white mt-1">
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
                      <p className="text-xs text-slate-500 dark:text-white mt-0.5">Recipient: {cert.studentName} &bull; Score: {cert.score}%</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-white space-y-1">
                      <div>Issued by: {cert.instructorName} on {cert.issueDate}</div>
                      <div className="font-mono text-[10px] text-slate-400 dark:text-white truncate">Hash: {cert.verificationHash}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: COMMUNITY DOUBT FORUM */}
          {studentNav === 'community' && (
            <CommunityDoubtForum onJoinLiveSession={() => setStudentNav('ai-tutor')} />
          )}

          {/* TAB 9: SETTINGS & SUBSCRIPTION */}
          {studentNav === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-light text-slate-900 dark:text-white tracking-wide">Student Account & Preferences</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-white mt-1">
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
                    <p className="text-xs text-slate-600 dark:text-white">
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
                    <p className="text-slate-500 dark:text-white">
                      {currentUser?.school_address || 'Sector 8-C, Chandigarh, Punjab & Haryana, India'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Curriculum & Selected Subjects Card */}
              <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-light text-base text-slate-900 dark:text-white">
                      Curriculum, Board & Selected Subjects
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-white/80">
                      Synced live with Student Profile and Admin Curriculum Catalog
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    Select / Edit Subjects in Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-500 dark:text-white/70 block">Grade Level</span>
                    <span className="font-bold text-slate-900 dark:text-white">Grade {activeGradeFilter}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-500 dark:text-white/70 block">Governing Board</span>
                    <span className="font-bold text-slate-900 dark:text-white">{BOARD_LABELS[currentBoard as EducationBoard] || currentBoard}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-500 dark:text-white/70 block">Language Medium</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {SUPPORTED_LANGUAGES.find((l) => l.value === globalLanguage)?.label || globalLanguage}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-white block">
                    Selected Subjects ({currentUser?.enrolledCourses?.length || 0}):
                  </span>
                  {currentUser?.enrolledCourses && currentUser.enrolledCourses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {currentUser.enrolledCourses.map((course, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl text-xs bg-teal-50 dark:bg-teal-950/50 text-[#00A896] border border-teal-200 dark:border-teal-800 font-medium"
                        >
                          📚 {course}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-white/80 italic">
                      No subjects explicitly selected yet. Click "Select / Edit Subjects in Profile" above or select subjects inside Skills Passport.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          4. FLOATING QUICK DOUBTS AI ASSISTANT WIDGET (Available across all tabs)
          ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {isQuickDoubtsOpen && (
          <div className="quick-doubts-lollipop mb-3 w-[420px] max-w-[calc(100vw-2rem)] max-h-[82vh] flex flex-col bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/80 text-[#FF6B00] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Quick Doubts AI</h3>
                </div>
              </div>
              <button
                onClick={() => setIsQuickDoubtsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickDoubtSubmit} className="space-y-2.5 shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-white">Subject</label>
                  <select
                    value={quickDoubtSubject}
                    onChange={(e) => setQuickDoubtSubject(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-bold rounded-xl px-2.5 py-2 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
                  >
                    {displaySubjects.map((s) => {
                      const localized = getLocalizedSubjectName(s.name, currentBoard);
                      return (
                        <option key={s.id} value={localized}>
                          {localized} (Grade {s.grade_level})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-white">Topic</label>
                  <select
                    value={quickDoubtTopic}
                    onChange={(e) => setQuickDoubtTopic(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-bold rounded-xl px-2.5 py-2 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
                  >
                    {floatingTopicsForSubject.map((t) => (
                      <option key={`flt-top-${t.id}`} value={t.title}>
                        {t.title}
                      </option>
                    ))}
                    <option value="">General {quickDoubtSubject}</option>
                    <option value="__custom__">+ Custom Topic...</option>
                  </select>
                </div>
              </div>

              {quickDoubtTopic === '__custom__' && (
                <input
                  type="text"
                  value={quickCustomTopic}
                  onChange={(e) => setQuickCustomTopic(e.target.value)}
                  placeholder={`Specify ${quickDoubtSubject} topic...`}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              )}

              {quickImageData && (
                <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={quickImageData.preview}
                      alt="Diagram preview"
                      className="w-8 h-8 rounded-lg object-cover border border-orange-300"
                    />
                    <span className="text-[10px] font-semibold truncate">Diagram ready for AI</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuickImageData(null)}
                    className="p-1 text-slate-500 hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <textarea
                rows={2}
                value={quickDoubtText}
                onChange={(e) => setQuickDoubtText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleQuickDoubtSubmit(e as unknown as React.FormEvent);
                  }
                }}
                placeholder="Ask a question on this subject & topic..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] resize-none"
              />

              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-dashed text-xs text-slate-500 dark:text-white cursor-pointer hover:border-[#FF6B00]">
                  <UploadCloud className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Diagram</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleQuickDoubtImageSelect(e.target.files?.[0], setQuickImageData)}
                  />
                </label>

                <button
                  type="submit"
                  disabled={(!quickDoubtText.trim() && !quickImageData) || isSubmittingDoubt}
                  className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isSubmittingDoubt ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Resolving...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Ask AI Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Interactive AI Conversation Thread inside Floating Widget */}
            {quickDoubts.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 overflow-y-auto space-y-2.5 pr-0.5">
                {quickDoubts.slice(0, 1).map((qd) => (
                  <div
                    key={`flt-${qd.id}`}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="font-bold text-[#00A896] truncate">
                        {qd.subject}{qd.topic ? ` • ${qd.topic}` : ''}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                          qd.status === 'streaming'
                            ? 'bg-orange-100 text-[#FF6B00]'
                            : qd.status === 'blocked'
                            ? 'bg-rose-100 text-rose-700'
                            : qd.status === 'error'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {qd.status === 'streaming'
                          ? 'Live...'
                          : qd.status === 'blocked'
                          ? 'Guardian Alerted'
                          : qd.status === 'error'
                          ? 'Error'
                          : 'Interactive Chat'}
                      </span>
                    </div>
                    {qd.errorMessage && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-300">{qd.errorMessage}</p>
                    )}
                    {renderInteractiveThreadMessages(qd, 'Floating Quick Doubts AI Pop-up', true)}
                  </div>
                ))}
              </div>
            )}
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

      {/* Offline Mode & Low-Bandwidth Hub Modal */}
      <OfflineStudyPackModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
      />

      {/* Parental Weekly Digest Modal (Completed vs Planned Hours Sunday Email) */}
      <ParentWeeklyDigestModal
        isOpen={isParentDigestOpen}
        onClose={() => setIsParentDigestOpen(false)}
      />
    </div>
  );
};
