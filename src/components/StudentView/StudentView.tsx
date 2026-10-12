import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { processAvatarImage } from '../../utils/imageUtils';
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
} from 'lucide-react';
import { EducationBoard, LanguageMedium } from '../../types';

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
  } = useApp();

  // Student Profile Grade Context Auto-Fetch
  const studentGradeLevel = typeof currentUser?.grade_level === 'number'
    ? currentUser.grade_level
    : parseInt(String(currentUser?.grade || '8').replace(/\D/g, '')) || 8;

  const [gradeOverride, setGradeOverride] = useState(false);
  const [activeGradeFilter, setActiveGradeFilter] = useState<number>(studentGradeLevel);

  useEffect(() => {
    if (!gradeOverride) {
      setActiveGradeFilter(studentGradeLevel);
    }
  }, [studentGradeLevel, gradeOverride]);

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

  // Dynamic Grade-Filtered Subjects for Quick Doubts AI
  const filteredSubjects = subjectsDB.filter((s) => {
    if (s.status !== 'ACTIVE') return false;
    const targetGrade = gradeOverride ? activeGradeFilter : studentGradeLevel;
    return s.grade_level === targetGrade;
  });

  const displaySubjects = filteredSubjects.length > 0
    ? filteredSubjects
    : subjectsDB.filter((s) => s.status === 'ACTIVE');

  // Available topics for currently selected doubt subject
  const currentSubjectObj = displaySubjects.find(
    (s) => s.name.toLowerCase() === quickDoubtSubject.toLowerCase()
  ) || displaySubjects[0];

  const availableTopics = currentSubjectObj
    ? topicsDB.filter((t) => t.subject_id === currentSubjectObj.id && t.status === 'ACTIVE')
    : [];

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
      setInputMessage((prev) => prev ? `${prev} [Voice test: What is Newton's 2nd Law?]` : "What is Newton's 2nd Law?");
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

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsVoiceRecording(false);
        };

        recognition.onend = () => {
          setIsVoiceRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('Speech recognition init failed:', err);
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

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  // Quick subjects data
  const subjects = [
    { name: 'Physics', code: 'PHY-101', chapter: "Chapter 2: Newton's Laws", progress: 75, color: 'from-[#4B49AC] to-[#7DA0FA]', icon: '⚡' },
    { name: 'Biology', code: 'BIO-201', chapter: 'Chapter 4: Cell Biology & Energy', progress: 88, color: 'from-[#7DA0FA] to-[#98BDFF]', icon: '🌿' },
    { name: 'Mathematics', code: 'MTH-102', chapter: 'Chapter 3: Quadratic Functions', progress: 92, color: 'from-[#7978E9] to-[#98BDFF]', icon: '📐' },
    { name: 'Computer Science', code: 'CSC-301', chapter: 'Chapter 1: Algorithms & Logic', progress: 60, color: 'from-[#4B49AC] to-[#7978E9]', icon: '💻' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F5F7FF] dark:bg-[#12131C] text-[#1F1F24] dark:text-[#F1F1F6] p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDEBAR */}
        <aside className="lg:col-span-3 space-y-4">
          {/* STUDENT PROFILE CARD */}
          <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6C7383] dark:text-[#9CA3AF]">
                Student Profile
              </span>
              <button
                onClick={() => setIsProfileOpen(true)}
                title="Edit profile & manage photo"
                className="text-[11px] font-bold text-[#4B49AC] dark:text-[#98BDFF] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="flex items-center gap-3.5 pt-3">
              <div
                onClick={() => setIsProfileOpen(true)}
                title="Click to view or change student profile photo"
                className="w-14 h-14 rounded-2xl bg-[#4B49AC] p-0.5 shadow-md flex items-center justify-center text-white text-base font-bold overflow-hidden shrink-0 ring-2 ring-[#98BDFF]/50 relative group cursor-pointer"
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser?.name || 'Student Avatar'}
                    className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover"
                  />
                ) : (
                  <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser?.name || 'Sarah Connor')}`}
                    alt="Student Avatar"
                    className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-2xl text-[9px] text-white font-bold">
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span>Change</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-sm sm:text-base text-[#1F1F24] dark:text-white leading-tight truncate">
                  {currentUser?.name || 'Sarah Connor'}
                </h3>
                <p className="text-xs text-[#4B49AC] dark:text-[#98BDFF] font-bold truncate">
                  {currentUser?.grade || '8th Grade - STEM'}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-[#6C7383] dark:text-[#9CA3AF]">
                    Enrolled: {currentUser?.enrollmentDate || 'Sep 2025'}
                  </p>
                  <label
                    title="Upload photo directly"
                    className="text-[10px] text-[#4B49AC] dark:text-[#98BDFF] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <Upload className="w-2.5 h-2.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const optimizedAvatar = await processAvatarImage(file);
                            updateCurrentUser({ avatar: optimizedAvatar });
                          } catch (err) {
                            console.error('Failed to process avatar:', err);
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ACADEMIC GROWTH (Scalable list-based view with Grades 6-12 Context label) */}
          <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800 transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#6C7383] dark:text-[#9CA3AF]">
                Academic Growth
              </h3>
              <span className="text-[#6C7383]">&bull;&bull;&bull;</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F5F7FF] dark:bg-[#12131C] border border-[#98BDFF]/40">
              <span className="text-[11px] font-extrabold text-[#4B49AC] dark:text-[#98BDFF] block">
                My Subjects (Grades 6-12 Context)
              </span>
            </div>

            {/* Scalable list-based view organized by grade */}
            <div className="space-y-2 text-xs">
              {/* Grade 9 */}
              <div className="p-2.5 rounded-xl bg-[#F5F7FF] dark:bg-[#12131C] border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#1F1F24] dark:text-white text-[11px]">Grade 9:</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Completed
                  </span>
                </div>
                <p className="text-[11px] text-[#6C7383] dark:text-slate-300">
                  Algebra I, Biology, World History
                </p>
              </div>

              {/* Grade 10 */}
              <div className="p-2.5 rounded-xl bg-[#F5F7FF] dark:bg-[#12131C] border-2 border-[#4B49AC] dark:border-[#7DA0FA]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#4B49AC] dark:text-[#7DA0FA] text-[11px]">Grade 10:</span>
                  <span className="text-[10px] font-bold text-[#4B49AC] dark:text-[#7DA0FA]">
                    Active Year
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Physics (Newton's Laws)</span>
                    <span className="font-bold text-[#4B49AC] dark:text-[#7DA0FA]">75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>English II (Rhetoric)</span>
                    <span className="font-bold text-[#7978E9]">60%</span>
                  </div>
                  <div className="flex justify-between text-[#6C7383]">
                    <span>Chemistry (Reactivity)</span>
                    <span className="font-semibold text-emerald-600">Completed</span>
                  </div>
                </div>
              </div>

              {/* Grade 11 */}
              <div className="p-2.5 rounded-xl bg-[#F5F7FF] dark:bg-[#12131C] border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#1F1F24] dark:text-white text-[11px]">Grade 11:</span>
                  <span className="text-[10px] font-bold text-[#7978E9] flex items-center gap-1">
                    🔒 Enrolled
                  </span>
                </div>
                <p className="text-[11px] text-[#6C7383] dark:text-slate-300">
                  Calculus, US History
                </p>
              </div>

              {/* Grade 12 */}
              <div className="p-2.5 rounded-xl bg-[#F5F7FF] dark:bg-[#12131C] border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#1F1F24] dark:text-white text-[11px]">Grade 12:</span>
                  <span className="text-[10px] font-bold text-[#6C7383] flex items-center gap-1">
                    ⚙️ Upcoming
                  </span>
                </div>
                <p className="text-[11px] text-[#6C7383] dark:text-slate-300">
                  Literature, Advanced Physics
                </p>
              </div>
            </div>

            {/* Browse Full Grades 6-12 Curriculum link */}
            <button
              onClick={() => setIsCurriculumModalOpen(true)}
              className="w-full pt-1.5 text-center text-xs font-bold text-[#4B49AC] dark:text-[#98BDFF] hover:underline flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Browse Full Grades 6-12 Curriculum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ASK AI TUTOR Floating Action */}
          <div className="p-4 rounded-2xl bg-[#4B49AC] text-white shadow-md shadow-[#4B49AC]/20 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                Ask AI Tutor
              </span>
            </div>
            <button
              onClick={async () => {
                await sendTutorMessage("Help with Newton's 2nd Law of Motion and force acceleration calculations.");
              }}
              className="w-full p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🤖</span>
                <span className="text-[11px] sm:text-xs">Help with Newton's 2nd Law...</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Left Vertical Navigation Card with Skydash Active Pill Highlights */}
          <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl p-3 shadow-sm border border-slate-200/60 dark:border-slate-800 transition-colors">
            <nav className="space-y-1">
              <button
                onClick={() => setStudentNav('subjects')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  studentNav === 'subjects'
                    ? 'bg-[#4B49AC] text-white shadow-sm'
                    : 'text-[#6C7383] dark:text-slate-300 hover:bg-[#F5F7FF] dark:hover:bg-[#12131C] hover:text-[#4B49AC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4" />
                  <span>My Subjects</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${studentNav === 'subjects' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-[#6C7383]'}`}>
                  4
                </span>
              </button>

              <button
                onClick={() => setStudentNav('practice')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  studentNav === 'practice'
                    ? 'bg-[#4B49AC] text-white shadow-sm'
                    : 'text-[#6C7383] dark:text-slate-300 hover:bg-[#F5F7FF] dark:hover:bg-[#12131C] hover:text-[#4B49AC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Practice</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${studentNav === 'practice' ? 'bg-white/20 text-white' : 'bg-[#98BDFF]/20 text-[#4B49AC] dark:text-[#98BDFF]'}`}>
                  {quizzes.length} Quizzes
                </span>
              </button>

              <button
                onClick={() => setStudentNav('progress')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  studentNav === 'progress'
                    ? 'bg-[#4B49AC] text-white shadow-sm'
                    : 'text-[#6C7383] dark:text-slate-300 hover:bg-[#F5F7FF] dark:hover:bg-[#12131C] hover:text-[#4B49AC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>Progress</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${studentNav === 'progress' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-[#6C7383]'}`}>
                  {chapterProgress}%
                </span>
              </button>

              <button
                onClick={() => setStudentNav('certificates')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  studentNav === 'certificates'
                    ? 'bg-[#4B49AC] text-white shadow-sm'
                    : 'text-[#6C7383] dark:text-slate-300 hover:bg-[#F5F7FF] dark:hover:bg-[#12131C] hover:text-[#4B49AC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4" />
                  <span>My Certificates</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${studentNav === 'certificates' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-700'}`}>
                  {certificates.length}
                </span>
              </button>
            </nav>
          </div>
        </aside>

        {/* CENTER MAIN INTERFACE */}
        <main className="lg:col-span-6 space-y-5">
          {/* Top Banner: Progress Bar with #7DA0FA and #4B49AC */}
          <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col gap-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-[#1F1F24] dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4B49AC] animate-pulse"></span>
                Physics Chapter 2: {chapterProgress}% Complete
              </span>
              <span className="text-xs font-bold text-[#4B49AC] dark:text-[#98BDFF] bg-[#98BDFF]/20 px-2.5 py-0.5 rounded-full border border-[#98BDFF]/40">
                Next: Action-Reaction Exam
              </span>
            </div>
            {/* Animated Progress Bar */}
            <div className="w-full bg-[#F5F7FF] dark:bg-[#12131C] rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-[#4B49AC] via-[#7DA0FA] to-[#98BDFF] h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${chapterProgress}%` }}
              />
            </div>
          </div>

          {/* Conditional Sub-View: Default AI Tutor Chat */}
          {studentNav === 'subjects' && (
            <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col h-[620px] overflow-hidden transition-colors">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/60 dark:bg-[#1E1E2F]/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#98BDFF]/20 text-[#4B49AC] dark:text-[#98BDFF] flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#1F1F24] dark:text-white text-base leading-none">
                      AI Tutor: Socratic Assistant
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active &bull; Socratic Guidance
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#98BDFF]/20 text-[#4B49AC] dark:text-[#98BDFF] font-bold border border-[#98BDFF]/30">
                        {currentBoard} &bull; Grade {studentGradeLevel}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                        <Languages className="w-2.5 h-2.5" />
                        <span>{SUPPORTED_LANGUAGES.find((l) => l.value === globalLanguage)?.label || 'English'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sendTutorMessage("Can you summarize our key physics takeaways today?");
                    }}
                    title="Summary"
                    className="p-1.5 text-[#6C7383] hover:text-[#4B49AC] dark:hover:text-white hover:bg-[#F5F7FF] dark:hover:bg-[#12131C] rounded-lg transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setChapterProgress(Math.min(100, chapterProgress + 5));
                    }}
                    title="Boost Chapter Progress"
                    className="p-1.5 text-[#6C7383] hover:text-[#4B49AC] dark:hover:text-white hover:bg-[#F5F7FF] dark:hover:bg-[#12131C] rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${
                      msg.sender === 'student' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* AI Avatar */}
                    {msg.sender === 'ai' && (
                      <div className="w-9 h-9 rounded-xl bg-[#4B49AC] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Lightbulb className="w-5 h-5 text-[#98BDFF]" />
                      </div>
                    )}

                    {/* Chat Bubble */}
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                        msg.sender === 'student'
                          ? 'bg-[#4B49AC] text-white rounded-br-xs font-medium'
                          : 'bg-[#F5F7FF] dark:bg-[#12131C] text-[#1F1F24] dark:text-[#F1F1F6] border border-slate-200/80 dark:border-slate-800 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      {msg.mathFormula && (
                        <div className="mt-2.5 p-2 rounded-lg bg-black/5 dark:bg-black/30 font-mono text-xs text-[#4B49AC] dark:text-[#7DA0FA] font-bold border border-[#98BDFF]/40">
                          Equation: {msg.mathFormula}
                        </div>
                      )}
                      <span
                        className={`text-[10px] block mt-1 text-right ${
                          msg.sender === 'student' ? 'text-white/70' : 'text-[#6C7383] dark:text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Student Avatar */}
                    {msg.sender === 'student' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-[#4B49AC] bg-[#4B49AC] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                        {currentUser?.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt="Student"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser?.name || 'Sarah Connor')}`}
                            alt="Student"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#4B49AC] text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 animate-spin text-[#98BDFF]" />
                    </div>
                    <div className="bg-[#F5F7FF] dark:bg-[#12131C] border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl text-xs text-[#6C7383]">
                      Thinking & solving step-by-step...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick suggestions pills */}
              <div className="px-6 py-2 bg-slate-50/50 dark:bg-[#1E1E2F]/50 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto text-xs">
                <button
                  onClick={() => handleQuickPrompt("Why is force equal to mass times acceleration?")}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-[#12131C] border border-slate-200 dark:border-slate-700 hover:border-[#4B49AC] text-[#1F1F24] dark:text-slate-200 hover:text-[#4B49AC] whitespace-nowrap transition-colors cursor-pointer"
                >
                  "Explain F = m * a"
                </button>
                <button
                  onClick={() => handleQuickPrompt("Give me a real-world sports analogy for Newton's 3rd Law!")}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-[#12131C] border border-slate-200 dark:border-slate-700 hover:border-[#4B49AC] text-[#1F1F24] dark:text-slate-200 hover:text-[#4B49AC] whitespace-nowrap transition-colors cursor-pointer"
                >
                  "Sports analogy"
                </button>
              </div>

              {/* Image Preview if homework problem photo is attached */}
              {attachedImagePreview && (
                <div className="px-6 py-2 bg-indigo-50/70 dark:bg-indigo-950/40 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={attachedImagePreview}
                      alt="Homework Problem"
                      className="w-10 h-10 object-cover rounded-lg border border-indigo-200 dark:border-indigo-800"
                    />
                    <div>
                      <span className="font-bold text-[#4B49AC] dark:text-[#98BDFF] block">Homework Photo Attached</span>
                      <span className="text-[10px] text-[#6C7383] dark:text-slate-400">AI Tutor will break down this problem Socratically</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedImagePreview(null)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Chat Input with Voice Input & Homework Photo Upload */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white dark:bg-[#1E1E2F] border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5"
              >
                {/* Photo Upload Button */}
                <label
                  title="Upload photo of homework problem"
                  className="w-10 h-10 rounded-xl bg-[#F5F7FF] dark:bg-[#12131C] border border-slate-200 dark:border-slate-700 hover:border-[#4B49AC] text-[#6C7383] hover:text-[#4B49AC] flex items-center justify-center cursor-pointer transition-colors shrink-0 shadow-xs"
                >
                  <ImageIcon className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHomeworkPhotoUpload}
                    className="hidden"
                  />
                </label>

                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  title={isVoiceRecording ? 'Stop voice recording' : 'Ask question with voice'}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs ${
                    isVoiceRecording
                      ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                      : 'bg-[#F5F7FF] dark:bg-[#12131C] border border-slate-200 dark:border-slate-700 hover:border-[#4B49AC] text-[#6C7383] hover:text-[#4B49AC]'
                  }`}
                >
                  {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    isVoiceRecording
                      ? 'Listening to your question...'
                      : attachedImagePreview
                      ? 'Add any notes or question about the photo...'
                      : 'Type question, use voice, or upload homework photo...'
                  }
                  className="flex-1 bg-[#F5F7FF] dark:bg-[#12131C] text-[#1F1F24] dark:text-white text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4B49AC]"
                />

                <button
                  type="submit"
                  disabled={(!inputMessage.trim() && !attachedImagePreview) || isAiTyping}
                  className="w-10 h-10 rounded-xl bg-[#4B49AC] hover:bg-[#3f3e91] disabled:opacity-50 text-white flex items-center justify-center shadow-md shadow-[#4B49AC]/20 transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Practice Quizzes Tab */}
          {studentNav === 'practice' && (
            <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-[#1F1F24] dark:text-white">Interactive Practice Assessments</h3>
                  <p className="text-xs text-[#6C7383] dark:text-[#9CA3AF]">Autonomous dynamic tests calibrated to your weak spots</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#98BDFF]/20 text-[#4B49AC] dark:text-[#98BDFF] border border-[#98BDFF]/40">
                  {quizzes.length} Available
                </span>
              </div>

              {!activeQuizId ? (
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#4B49AC] hover:shadow-md transition-all bg-[#F5F7FF] dark:bg-[#12131C] flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#98BDFF]/25 text-[#4B49AC] dark:text-[#98BDFF]">
                            {quiz.topic}
                          </span>
                          <span className="text-xs text-[#6C7383]">Created by {quiz.author}</span>
                        </div>
                        <h4 className="font-extrabold text-[#1F1F24] dark:text-white text-base">{quiz.title}</h4>
                        <p className="text-xs text-[#6C7383] dark:text-[#9CA3AF]">
                          {quiz.questions.length} questions &bull; Estimated time: 8 mins
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveQuizId(quiz.id);
                          setSelectedAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#4B49AC] hover:bg-[#3f3e91] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Practice</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                /* Active Quiz Taking Component */
                <div className="space-y-6">
                  {(() => {
                    const currentQuiz = quizzes.find((q) => q.id === activeQuizId);
                    if (!currentQuiz) return null;

                    const score = quizSubmitted
                      ? currentQuiz.questions.reduce(
                          (acc, q, idx) => acc + (selectedAnswers[idx] === q.answerIndex ? 1 : 0),
                          0
                        )
                      : 0;

                    return (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="text-xs text-[#4B49AC] dark:text-[#7DA0FA] font-bold">{currentQuiz.topic}</span>
                            <h4 className="font-extrabold text-[#1F1F24] dark:text-white text-base">{currentQuiz.title}</h4>
                          </div>
                          <button
                            onClick={() => setActiveQuizId(null)}
                            className="text-xs text-[#6C7383] hover:text-[#1F1F24] dark:hover:text-white underline cursor-pointer"
                          >
                            Exit Quiz
                          </button>
                        </div>

                        {quizSubmitted && (
                          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                            <div>
                              <div className="font-extrabold text-emerald-900 dark:text-emerald-300 text-sm">
                                Assessment Completed! Score: {score} / {currentQuiz.questions.length} (
                                {Math.round((score / currentQuiz.questions.length) * 100)}%)
                              </div>
                              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                Excellent effort! Review the detailed pedagogical explanations below.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                issueCertificate(
                                  currentUser?.name || 'Sarah Connor',
                                  currentQuiz.title,
                                  Math.round((score / currentQuiz.questions.length) * 100)
                                );
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#4B49AC] hover:bg-[#3f3e91] text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Claim Verified Certificate</span>
                            </button>
                          </div>
                        )}

                        <div className="space-y-6">
                          {currentQuiz.questions.map((q, qIndex) => {
                            return (
                              <div key={q.id} className="p-4 rounded-2xl bg-[#F5F7FF] dark:bg-[#12131C] border border-slate-200 dark:border-slate-800 space-y-3">
                                <div className="font-bold text-[#1F1F24] dark:text-white text-sm">
                                  {qIndex + 1}. {q.question}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {q.options.map((opt, optIndex) => {
                                    const isSelected = selectedAnswers[qIndex] === optIndex;
                                    let btnStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E1E2F] hover:bg-slate-100 text-[#1F1F24] dark:text-slate-200';

                                    if (quizSubmitted) {
                                      if (optIndex === q.answerIndex) {
                                        btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold';
                                      } else if (isSelected) {
                                        btnStyle = 'border-[#F3797E] bg-rose-50 dark:bg-rose-950/80 text-[#F3797E] font-bold';
                                      }
                                    } else if (isSelected) {
                                      btnStyle = 'border-[#4B49AC] bg-[#98BDFF]/20 text-[#4B49AC] dark:text-[#98BDFF] font-bold ring-2 ring-[#4B49AC]/30';
                                    }

                                    return (
                                      <button
                                        key={optIndex}
                                        disabled={quizSubmitted}
                                        onClick={() => {
                                          setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
                                        }}
                                        className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                                      >
                                        <span>{opt}</span>
                                        {quizSubmitted && optIndex === q.answerIndex && (
                                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                {quizSubmitted && (
                                  <div className="p-3 rounded-xl bg-white dark:bg-[#1E1E2F] border border-slate-200 dark:border-slate-700 text-xs text-[#6C7383] dark:text-slate-300">
                                    <span className="font-bold text-[#4B49AC] dark:text-[#7DA0FA]">AI Explanation: </span>
                                    {q.explanation}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {!quizSubmitted ? (
                          <button
                            onClick={() => setQuizSubmitted(true)}
                            disabled={Object.keys(selectedAnswers).length < currentQuiz.questions.length}
                            className="w-full py-3 rounded-xl bg-[#4B49AC] hover:bg-[#3f3e91] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                          >
                            Submit Practice Assessment
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveQuizId(null)}
                            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm cursor-pointer"
                          >
                            Return to Practice Catalog
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Progress & Weak Spot Analytics Tab */}
          {studentNav === 'progress' && (
            <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-6 transition-colors">
              <div>
                <h3 className="text-lg font-extrabold text-[#1F1F24] dark:text-white">Learning Mastery & Performance KPIs</h3>
                <p className="text-xs text-[#6C7383] dark:text-[#9CA3AF]">Autonomous adaptive insights based on tutor sessions and quizzes</p>
              </div>

              {/* KPI Metric Cards matching Skydash design */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#F5F7FF] dark:bg-[#12131C] border border-[#98BDFF]/40 text-center">
                  <div className="text-2xl font-black text-[#4B49AC] dark:text-[#98BDFF]">75%</div>
                  <div className="text-xs text-[#6C7383] font-bold mt-1">Physics Ch. 2</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5F7FF] dark:bg-[#12131C] border border-[#7DA0FA]/40 text-center">
                  <div className="text-2xl font-black text-[#7DA0FA]">88%</div>
                  <div className="text-xs text-[#6C7383] font-bold mt-1">Biology Ch. 4</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5F7FF] dark:bg-[#12131C] border border-[#7978E9]/40 text-center">
                  <div className="text-2xl font-black text-[#7978E9]">92%</div>
                  <div className="text-xs text-[#6C7383] font-bold mt-1">Math Functions</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5F7FF] dark:bg-[#12131C] border border-purple-200 dark:border-purple-800 text-center">
                  <div className="text-2xl font-black text-purple-700 dark:text-purple-300">3.85</div>
                  <div className="text-xs text-[#6C7383] font-bold mt-1">Cumulative GPA</div>
                </div>
              </div>

              {/* Weak spots & AI Recommendation */}
              <div className="p-5 rounded-2xl bg-[#F3797E]/10 border border-[#F3797E]/40 space-y-2">
                <div className="flex items-center gap-2 text-[#F3797E] font-extrabold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Learning Diagnostic: Identified Weak Spot</span>
                </div>
                <p className="text-xs text-[#1F1F24] dark:text-slate-200 leading-relaxed">
                  Student shows 92% mastery on kinematics vectors, but experienced 2 doubt stalls on{' '}
                  <strong>Newton's 3rd Law (Action-Reaction pairs on isolated systems)</strong>.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setStudentNav('subjects');
                      sendTutorMessage("Can we do 3 rapid practice drills on action-reaction forces?");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#4B49AC] hover:bg-[#3f3e91] text-white text-xs font-bold cursor-pointer shadow-sm"
                  >
                    Start Targeted Remedial Drill
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Certificates Tab */}
          {studentNav === 'certificates' && (
            <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-[#1F1F24] dark:text-white">Verified Digital Credentials</h3>
                  <p className="text-xs text-[#6C7383] dark:text-[#9CA3AF]">Autonomous, cryptographically validated certificates</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#98BDFF]/20 text-[#4B49AC] dark:text-[#98BDFF] border border-[#98BDFF]/40">
                  {certificates.length} Earned
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F5F7FF] dark:bg-[#12131C] space-y-3 relative overflow-hidden shadow-xs hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#4B49AC] text-white flex items-center justify-center font-bold">
                        <Award className="w-6 h-6" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {cert.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-[#1F1F24] dark:text-white text-base">{cert.courseTitle}</h4>
                      <p className="text-xs text-[#6C7383] dark:text-[#9CA3AF] mt-0.5">Awarded to: {cert.studentName}</p>
                    </div>

                    <div className="text-[11px] text-[#6C7383] dark:text-slate-300 space-y-1 bg-white dark:bg-[#1E1E2F] p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono">
                      <div>Cert #: {cert.certificateNumber}</div>
                      <div>Hash: {cert.verificationHash.slice(0, 18)}...</div>
                      <div>Issued: {cert.issueDate}</div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setActiveCert(cert)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-[#4B49AC] hover:bg-[#3f3e91] text-white text-xs font-bold text-center cursor-pointer shadow-sm"
                      >
                        View Official Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="lg:col-span-3 space-y-5">
          {/* Illustration Card */}
          <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden relative group transition-colors">
            <div className="h-36 rounded-xl bg-[#F5F7FF] dark:bg-[#12131C] p-3 flex items-center justify-center relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80"
                alt="Collaborative Learning"
                className="w-full h-full object-cover rounded-xl opacity-90 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                <span className="text-white text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#98BDFF]" />
                  Collaborative AI Study Group
                </span>
              </div>
            </div>
          </div>

          {/* Study Companion & Quick Doubts Launcher */}
          <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#4B49AC]/10 dark:bg-[#7DA0FA]/20 flex items-center justify-center text-[#4B49AC] dark:text-[#7DA0FA]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#1F1F24] dark:text-white text-sm">
                    Quick Doubts AI
                  </h3>
                  <p className="text-[10px] text-[#6C7383] dark:text-slate-400">
                    Floating 24/7 on your screen
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                Online
              </span>
            </div>

            <p className="text-xs text-[#6C7383] dark:text-slate-300 leading-relaxed">
              Stuck on a tricky problem or diagram? Click the floating icon in the bottom right to get instant step-by-step guidance in any subject.
            </p>

            <button
              type="button"
              onClick={() => setIsQuickDoubtsOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#4B49AC] to-[#7DA0FA] hover:from-[#3f3e91] hover:to-[#6c8ee3] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer active:scale-98"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Open Quick Doubts</span>
            </button>

            {/* Resolved doubts snippet */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-[#6C7383] dark:text-slate-400">
              <span>Recent Activity:</span>
              <span className="font-bold text-[#4B49AC] dark:text-[#7DA0FA]">
                {doubts.length} Doubts Logged
              </span>
            </div>
          </div>

          {/* Daily Study Streak & Goals Card */}
          <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-3.5 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-[#1F1F24] dark:text-white text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Study Momentum
              </h3>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                5-Day Streak 🔥
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#6C7383] dark:text-slate-400">
                <span>Weekly Objective:</span>
                <span className="font-bold text-[#1F1F24] dark:text-white">8 / 10 Modules</span>
              </div>
              <div className="w-full bg-[#F5F7FF] dark:bg-[#12131C] rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-[#7DA0FA] h-full rounded-full w-4/5" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#6C7383] dark:text-slate-400 pt-1">
                <Target className="w-3.5 h-3.5 text-[#4B49AC] dark:text-[#7DA0FA]" />
                <span>Target: Mastery in Physics Chapter 2</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* FLOATING QUICK DOUBTS ICON & EXPANDABLE SCREEN WIDGET */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Floating Quick Doubts Panel */}
        {isQuickDoubtsOpen && (
          <div className="mb-3 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1E1E2F] text-[#1F1F24] dark:text-white rounded-3xl p-5 shadow-2xl border border-slate-200/90 dark:border-slate-800 space-y-3.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#4B49AC]/10 dark:bg-[#7DA0FA]/20 flex items-center justify-center text-[#4B49AC] dark:text-[#7DA0FA]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#1F1F24] dark:text-white text-sm leading-tight">
                    Quick Doubts
                  </h3>
                  <p className="text-[10px] text-[#6C7383] dark:text-slate-400">
                    Instant AI & Teacher Assistance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-[#98BDFF]/20 text-[#4B49AC] dark:text-[#98BDFF] px-2 py-0.5 rounded-full font-bold border border-[#98BDFF]/40">
                  Instant
                </span>
                <button
                  type="button"
                  onClick={() => setIsQuickDoubtsOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Close Quick Doubts"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Configuration Header: Board Selector, Language Medium & Grade Override */}
            <div className="p-3 rounded-2xl bg-[#F5F7FF] dark:bg-[#12131C] border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                {/* Board Selector */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#6C7383] dark:text-[#9CA3AF] mb-1">
                    Education Board
                  </label>
                  <select
                    value={currentBoard}
                    onChange={(e) => setCurrentBoard(e.target.value)}
                    className="w-full bg-white dark:bg-[#1E1E2F] border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-[#1F1F24] dark:text-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#4B49AC] cursor-pointer"
                  >
                    {SUPPORTED_BOARDS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Multilingual Medium Selector */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#6C7383] dark:text-[#9CA3AF] mb-1 flex items-center gap-1">
                    <Languages className="w-3 h-3 text-[#4B49AC]" />
                    <span>Language Medium</span>
                  </label>
                  <select
                    value={globalLanguage}
                    onChange={(e) => setGlobalLanguage(e.target.value)}
                    className="w-full bg-white dark:bg-[#1E1E2F] border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-[#1F1F24] dark:text-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#4B49AC] cursor-pointer"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label} ({l.native})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Automatic Grade Context & Optional Override Toggle */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-[#1F1F24] dark:text-white">
                    {gradeOverride
                      ? `Browsing Grade ${activeGradeFilter} (Override)`
                      : `Auto-Bound: Grade ${studentGradeLevel} Syllabus`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#6C7383] dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={gradeOverride}
                      onChange={(e) => setGradeOverride(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-[#4B49AC] focus:ring-[#4B49AC] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Browse Other Grades</span>
                  </label>

                  {gradeOverride && (
                    <select
                      value={activeGradeFilter}
                      onChange={(e) => setActiveGradeFilter(Number(e.target.value))}
                      className="bg-white dark:bg-[#1E1E2F] border border-[#4B49AC] text-[10px] font-bold text-[#4B49AC] dark:text-[#98BDFF] rounded-md px-1.5 py-0.5 cursor-pointer"
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                        <option key={g} value={g}>
                          Grade {g}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* RAG Context Alignment Badge */}
              <div className="p-1.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[10px] text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                <span>
                  📚 {currentBoard} Textbook Alignment &bull; Grade {gradeOverride ? activeGradeFilter : studentGradeLevel}
                </span>
                <span className="font-bold">
                  {SUPPORTED_LANGUAGES.find((l) => l.value === globalLanguage)?.label || 'English'} Fluent AI
                </span>
              </div>
            </div>

            <form onSubmit={handleQuickDoubtSubmit} className="space-y-3">
              {/* Dynamic Subject Selector from Grade-Filtered Subjects */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-[#6C7383] dark:text-[#9CA3AF]">
                    Select Subject (Grade {gradeOverride ? activeGradeFilter : studentGradeLevel})
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {displaySubjects.length} Active Modules
                  </span>
                </div>
                <select
                  value={quickDoubtSubject}
                  onChange={(e) => {
                    const nextSubj = e.target.value;
                    setQuickDoubtSubject(nextSubj);
                    const subjObj = displaySubjects.find((s) => s.name.toLowerCase() === nextSubj.toLowerCase());
                    const firstTopic = subjObj ? topicsDB.find((t) => t.subject_id === subjObj.id && t.status === 'ACTIVE') : null;
                    setQuickDoubtTopic(firstTopic?.title || '');
                  }}
                  className="w-full bg-[#F5F7FF] dark:bg-[#12131C] border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 font-bold text-[#1F1F24] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B49AC] shadow-xs cursor-pointer"
                >
                  {displaySubjects.map((subj) => (
                    <option key={subj.id} value={subj.name}>
                      {subj.name} (Grade {subj.grade_level}) - {subj.code || 'CORE'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Topic Selection Chips / Dropdown for Selected Subject */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-[#6C7383] dark:text-[#9CA3AF]">
                    Target Topic / Unit Context
                  </label>
                  {availableTopics.length > 0 && (
                    <span className="text-[10px] text-[#4B49AC] dark:text-[#98BDFF] font-semibold">
                      {availableTopics.length} Units Available
                    </span>
                  )}
                </div>

                {availableTopics.length > 0 ? (
                  <div className="space-y-1.5">
                    {/* Topic quick-select chips */}
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-[#F5F7FF] dark:bg-[#12131C] rounded-xl border border-slate-200/80 dark:border-slate-800">
                      {availableTopics.map((top) => (
                        <button
                          key={top.id}
                          type="button"
                          onClick={() => setQuickDoubtTopic(top.title)}
                          className={`text-[10px] font-semibold px-2 py-1 rounded-lg transition-all cursor-pointer ${
                            quickDoubtTopic === top.title
                              ? 'bg-[#4B49AC] text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#4B49AC] border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {top.title}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={quickDoubtTopic}
                      onChange={(e) => setQuickDoubtTopic(e.target.value)}
                      placeholder="Selected topic or custom unit..."
                      className="w-full bg-[#F5F7FF] dark:bg-[#12131C] text-[#1F1F24] dark:text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#4B49AC]"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={quickDoubtTopic}
                    onChange={(e) => setQuickDoubtTopic(e.target.value)}
                    placeholder="Enter specific topic (e.g., Renewable Energy, Newton's Laws)..."
                    className="w-full bg-[#F5F7FF] dark:bg-[#12131C] text-[#1F1F24] dark:text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#4B49AC]"
                  />
                )}
              </div>

              <textarea
                rows={3}
                value={quickDoubtText}
                onChange={(e) => setQuickDoubtText(e.target.value)}
                placeholder="Type or paste your doubt question..."
                className="w-full bg-[#F5F7FF] dark:bg-[#12131C] text-[#1F1F24] dark:text-slate-100 text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4B49AC] transition-all resize-none"
              />

              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#4B49AC] text-[#6C7383] hover:text-[#4B49AC] text-xs font-semibold cursor-pointer transition-colors bg-[#F5F7FF] dark:bg-[#12131C]">
                  <UploadCloud className="w-3.5 h-3.5 text-[#4B49AC]" />
                  <span>Upload diagram</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setQuickDoubtText(`[Uploaded: ${e.target.files[0].name}] How do I solve the diagram problem shown here?`);
                      }
                    }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={!quickDoubtText.trim() || isSubmittingDoubt}
                  className="w-10 h-9 rounded-xl bg-[#4B49AC] hover:bg-[#3f3e91] disabled:opacity-50 text-white flex items-center justify-center shadow-sm cursor-pointer shrink-0 transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Recent Doubts List */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6C7383] uppercase tracking-wider">
                  Recent Resolved Doubts
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {doubts.filter((d) => d.status === 'resolved').length} Resolved
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto pr-1 space-y-2">
                {doubts.slice(0, 3).map((dbt) => (
                  <div
                    key={dbt.id}
                    className="p-2.5 rounded-xl bg-[#F5F7FF] dark:bg-[#12131C] border border-slate-200/80 dark:border-slate-800 text-xs space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#1F1F24] dark:text-white truncate max-w-[180px]">{dbt.question}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                          dbt.status === 'resolved'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-[#F3797E]/15 text-[#F3797E]'
                        }`}
                      >
                        {dbt.status}
                      </span>
                    </div>
                    {dbt.solution && (
                      <p className="text-[11px] text-[#6C7383] dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {dbt.solution.slice(0, 100)}...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating Screen Icon Button */}
        <div className="relative group flex items-center">
          {/* Tooltip on hover when closed */}
          {!isQuickDoubtsOpen && (
            <div className="absolute right-16 px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-white text-white dark:text-slate-900 text-xs font-bold whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5">
              <span>Quick Doubts</span>
              <span className="text-[10px] bg-[#98BDFF]/30 dark:bg-indigo-100 text-[#98BDFF] dark:text-[#4B49AC] px-1.5 py-0.5 rounded-full font-extrabold">24/7</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsQuickDoubtsOpen(!isQuickDoubtsOpen)}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 cursor-pointer border-2 border-white/20 dark:border-slate-700 hover:scale-110 active:scale-95 ${
              isQuickDoubtsOpen
                ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-slate-900/40'
                : 'bg-gradient-to-tr from-[#4B49AC] via-[#5D5BBD] to-[#7DA0FA] shadow-[#4B49AC]/40 hover:shadow-2xl'
            }`}
            aria-label={isQuickDoubtsOpen ? 'Close Quick Doubts' : 'Open Quick Doubts'}
          >
            {isQuickDoubtsOpen ? (
              <X className="w-6 h-6 text-white transition-transform duration-200" />
            ) : (
              <>
                <HelpCircle className="w-6 h-6 text-white transition-transform duration-200" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#1E1E2F] animate-pulse" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Official Certificate Modal */}
      {activeCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E2F] text-[#1F1F24] dark:text-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border-4 border-[#4B49AC] dark:border-[#7DA0FA] relative space-y-6 transition-colors">
            <button
              onClick={() => setActiveCert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="inline-block p-3 rounded-2xl bg-[#98BDFF]/20 text-[#4B49AC] dark:text-[#98BDFF] mb-1">
                <Award className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-serif font-extrabold text-[#1F1F24] dark:text-white tracking-wide">
                CERTIFICATE OF ACADEMIC MASTERY
              </h2>
              <p className="text-xs text-[#6C7383] font-mono tracking-widest uppercase">
                Educate AI Agent Autonomous Educational Ecosystem
              </p>
            </div>

            <div className="text-center space-y-3 py-4 border-y border-slate-100 dark:border-slate-800">
              <p className="text-xs text-[#6C7383] italic">This is proudly presented to</p>
              <h3 className="text-2xl font-extrabold text-[#4B49AC] dark:text-[#98BDFF] underline decoration-[#7DA0FA] decoration-2 underline-offset-8">
                {activeCert.studentName}
              </h3>
              <p className="text-xs text-[#6C7383] dark:text-slate-300 max-w-md mx-auto pt-2">
                For demonstrating autonomous mastery in <strong>{activeCert.courseTitle}</strong> with verified
                performance score of <strong>{activeCert.score}%</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 text-xs text-[#6C7383] dark:text-slate-300 gap-4 pt-2">
              <div>
                <span className="font-bold block text-[#1F1F24] dark:text-white">Verification Hash:</span>
                <span className="font-mono text-[10px] break-all">{activeCert.verificationHash}</span>
              </div>
              <div className="text-right">
                <span className="font-bold block text-[#1F1F24] dark:text-white">Issue Date:</span>
                <span>{activeCert.issueDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#4B49AC] hover:bg-[#3f3e91] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setActiveCert(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[#1F1F24] dark:text-slate-200 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
