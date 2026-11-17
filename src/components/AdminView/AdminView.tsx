import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { EducationBoard } from '../../types';
import { resolveSubjectsForBoard } from '../../data/curriculumData';
import { PivotIQLogo } from '../common/PivotIQLogo';
import {
  ShieldCheck,
  Video,
  AlertTriangle,
  CheckCircle,
  Users,
  Settings,
  Award,
  BarChart3,
  Camera,
  RefreshCw,
  Eye,
  Sliders,
  Check,
  X,
  Volume2,
  FileCheck,
  Search,
  Download,
  AlertOctagon,
  Radio,
  Clock,
  ExternalLink,
  UserPlus,
  BookOpen,
  Sparkles,
  ClipboardCheck,
  MessageSquare,
  CreditCard,
  Copy,
  Flag,
  History,
  SlidersHorizontal,
  Layers,
  Cpu,
} from 'lucide-react';
import { AnomalyType } from '../../types';
import { UserManagement } from './UserManagement';
import { CurriculumTopicManager } from './CurriculumTopicManager';
import { AdminOperationsSync } from './AdminOperationsSync';
import { SubscriptionPlansManager } from './SubscriptionPlansManager';
import { AiCostMonitorDashboard } from './AiCostMonitorDashboard';

export const AdminView: React.FC = () => {
  const {
    adminNav,
    setAdminNav,
    usersList,
    proctorFeeds,
    anomalyLogs,
    triggerAnomaly,
    resolveAnomaly,
    studentsList,
    teachersList,
    addUser,
    certificates,
    issueCertificate,
    certAutoTriggerConfig,
    setCertAutoTriggerConfig,
    approveCertificate,
    revokeCertificate,
    certificateDownloadLogs,
    dailyTasks,
    doubts,
    quickDoubts,
    billingLedger,
    subscriptionPlans,
    flagUserAccount,
    sensitivity,
    setSensitivity,
    localWebcamActive,
    setLocalWebcamActive,
    curriculumList,
    boardsConfig,
    boardSubjectMappings,
    subjectsDB,
    topicsDB,
    activeGrades,
    toggleGradeFilter,
    activeCategories,
    toggleCategoryFilter,
    teacherSubjectContext,
    setTeacherSubjectContext,
    setIsCurriculumModalOpen,
  } = useApp();

  const [copiedCertVerifyId, setCopiedCertVerifyId] = useState<string | null>(null);
  const [searchStudent, setSearchStudent] = useState('');
  const [catalogBoardFilter, setCatalogBoardFilter] = useState<EducationBoard | 'ALL'>('ALL');
  const [showAllCatalogRows, setShowAllCatalogRows] = useState(false);
  const [selectedFeedForReview, setSelectedFeedForReview] = useState<any | null>(null);
  const [newCertStudent, setNewCertStudent] = useState('Sarah Connor');
  const [newCertCourse, setNewCertCourse] = useState("Newton's Laws of Motion Mastery");
  const [newCertScore, setNewCertScore] = useState(95);

  // Quick Add Student / Teacher modal state inside individual tabs
  const [quickAddRole, setQuickAddRole] = useState<'student' | 'teacher' | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickGrade, setQuickGrade] = useState('8th Grade');
  const [quickCourses, setQuickCourses] = useState('Physics, Biology, Mathematics');
  const [quickDepartment, setQuickDepartment] = useState('Science & Mathematics');
  const [quickSubjects, setQuickSubjects] = useState('Physics, STEM');
  const [quickCohorts, setQuickCohorts] = useState('Class 8A, Class 8C');

  const openQuickAdd = (role: 'student' | 'teacher') => {
    setQuickAddRole(role);
    setQuickName('');
    setQuickEmail('');
    setQuickGrade('8th Grade');
    setQuickCourses('Physics, Biology, Mathematics');
    setQuickDepartment('Science & Mathematics');
    setQuickSubjects('Physics, STEM');
    setQuickCohorts('Class 8A, Class 8C');
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddRole || !quickName.trim() || !quickEmail.trim()) return;
    if (quickAddRole === 'student') {
      addUser({
        name: quickName.trim(),
        email: quickEmail.trim(),
        role: 'student',
        status: 'Active',
        grade: quickGrade,
        enrolledCourses: quickCourses.split(',').map((s) => s.trim()).filter(Boolean),
        overallProgress: 75,
        physicsProgress: 70,
        biologyProgress: 75,
        mathProgress: 80,
        attendance: 96,
        gpa: 3.6,
        enrollmentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
    } else {
      addUser({
        name: quickName.trim(),
        email: quickEmail.trim(),
        role: 'teacher',
        status: 'Active',
        department: quickDepartment.trim() || 'Science & Mathematics',
        assignedSubjects: quickSubjects.split(',').map((s) => s.trim()).filter(Boolean),
        assignedCohorts: quickCohorts.split(',').map((s) => s.trim()).filter(Boolean),
        createdLessonPlansCount: 0,
        activeStudentsCount: 30,
      });
    }
    setQuickAddRole(null);
  };

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Toggle local webcam for Feed 1
  const toggleLocalWebcam = async () => {
    if (!localWebcamActive) {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setLocalWebcamActive(true);
      } catch (err: any) {
        console.warn('Webcam permission denied or unavailable:', err);
        setCameraError('Camera access unavailable. Using high-fidelity video canvas simulation.');
        setLocalWebcamActive(true); // fall back to simulation
      }
    } else {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }
      setLocalWebcamActive(false);
    }
  };

  return (
    <div className="admin-panel-lolipop min-h-[calc(100vh-3.75rem)] bg-slate-100 dark:bg-[#0c1322] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 font-normal transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDE NAVIGATION */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-[#131d33] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 px-1">
              <PivotIQLogo size={36} />
              <div>
                <h2 className="font-normal text-slate-900 dark:text-white text-base leading-tight">
                  PivotIQ Admin
                </h2>
                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-normal">
                  Admin Dashboard
                </span>
              </div>
            </div>

            <nav className="space-y-1.5 text-xs font-normal">
              <button
                onClick={() => setAdminNav('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer font-normal ${
                  adminNav === 'dashboard'
                    ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border-l-4 border-[#00A896] shadow-inner'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Video className={`w-4 h-4 ${adminNav === 'dashboard' ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-normal">Platform Dashboard</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-normal border ${
                  adminNav === 'dashboard'
                    ? 'bg-[#00A896]/20 text-[#00A896] border-[#00A896]/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}>
                  Live
                </span>
              </button>

              <button
                onClick={() => setAdminNav('users')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer font-normal ${
                  adminNav === 'users'
                    ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border-l-4 border-[#00A896] shadow-inner'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserPlus className={`w-4 h-4 ${adminNav === 'users' ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-normal">User Management (CRUD)</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-normal border ${
                  adminNav === 'users'
                    ? 'bg-[#00A896]/20 text-[#00A896] border-[#00A896]/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}>
                  {usersList.length}
                </span>
              </button>

              <button
                onClick={() => setAdminNav('curriculum')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer font-normal ${
                  adminNav === 'curriculum'
                    ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border-l-4 border-[#00A896] shadow-inner'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className={`w-4 h-4 ${adminNav === 'curriculum' ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-normal">Curriculum</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-normal border whitespace-nowrap ${
                  adminNav === 'curriculum'
                    ? 'bg-[#00A896]/20 text-[#00A896] border-[#00A896]/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}>
                  Grades 6-12
                </span>
              </button>

              <button
                onClick={() => setAdminNav('teachers')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer font-normal ${
                  adminNav === 'teachers'
                    ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border-l-4 border-[#00A896] shadow-inner'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${adminNav === 'teachers' ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-normal">Teacher Management</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{teachersList.length}</span>
              </button>

              <button
                onClick={() => setAdminNav('students')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer font-normal ${
                  adminNav === 'students'
                    ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border-l-4 border-[#00A896] shadow-inner'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${adminNav === 'students' ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-normal">Student Management</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{studentsList.length}</span>
              </button>

              <button
                onClick={() => setAdminNav('tasks-sync')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer font-normal ${
                  adminNav === 'tasks-sync'
                    ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border-l-4 border-[#00A896] shadow-inner'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardCheck className={`w-4 h-4 ${adminNav === 'tasks-sync' ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-normal">Tasks &amp; Submissions</span>
                </div>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">
                  {dailyTasks.filter((t) => t.isCustom && (t.approvalStatus || 'Pending Approval') === 'Pending Approval').length} Queue
                </span>
              </button>

              <button
                onClick={() => setAdminNav('interactions')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer font-normal ${
                  adminNav === 'interactions'
                    ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border-l-4 border-[#00A896] shadow-inner'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className={`w-4 h-4 ${adminNav === 'interactions' ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-normal">Live Doubts &amp; Quizzes</span>
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                  {doubts.filter((d) => d.resolutionStatus !== 'Resolved' && d.resolutionStatus !== 'Closed').length + quickDoubts.filter((q) => q.resolutionStatus !== 'Resolved' && q.resolutionStatus !== 'Closed').length} Open
                </span>
              </button>

              <button
                onClick={() => setAdminNav('billing')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer font-normal ${
                  adminNav === 'billing'
                    ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border-l-4 border-[#00A896] shadow-inner'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className={`w-4 h-4 ${adminNav === 'billing' ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-normal">Billing &amp; Access</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">{billingLedger.length}</span>
              </button>

              <button
                onClick={() => setAdminNav('subscription-plans')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer font-normal ${
                  adminNav === 'subscription-plans'
                    ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border-l-4 border-[#00A896] shadow-inner'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className={`w-4 h-4 ${adminNav === 'subscription-plans' ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-normal">Subscription Plans</span>
                </div>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">
                  {subscriptionPlans.filter((p) => p.status === 'Active').length} Active
                </span>
              </button>

              <button
                onClick={() => setAdminNav('ai-cost-monitor')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer font-normal ${
                  adminNav === 'ai-cost-monitor'
                    ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border-l-4 border-[#00A896] shadow-inner'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Cpu className={`w-4 h-4 ${adminNav === 'ai-cost-monitor' ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-normal">AI Token &amp; Cost Monitor</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">FinOps</span>
              </button>

              <button
                onClick={() => setAdminNav('config')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer font-normal ${
                  adminNav === 'config'
                    ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border-l-4 border-[#00A896] shadow-inner'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className={`w-4 h-4 ${adminNav === 'config' ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-normal">System Configuration</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Rules</span>
              </button>

              <button
                onClick={() => setAdminNav('certificates')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer font-normal ${
                  adminNav === 'certificates'
                    ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border-l-4 border-[#00A896] shadow-inner'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Award className={`w-4 h-4 ${adminNav === 'certificates' ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-normal">Certificates</span>
                </div>
                <span className="text-[10px] text-[#00A896] font-normal">{certificates.length}</span>
              </button>

              <button
                onClick={() => setAdminNav('analytics')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer font-normal ${
                  adminNav === 'analytics'
                    ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border-l-4 border-[#00A896] shadow-inner'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className={`w-4 h-4 ${adminNav === 'analytics' ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-normal">Analytics</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">99.4%</span>
              </button>
            </nav>
          </div>

          {/* Quick Simulation Panel */}
          <div className="bg-white dark:bg-[#131d33] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-3 text-xs transition-colors">
            <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 font-normal">
              <span>Proctoring Live Controls</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Test computer vision detection models & verify real-time cross-client anomaly propagation:
            </p>
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => triggerAnomaly('feed-2', 'Head Rotation')}
                className="w-full py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 flex items-center justify-between transition-colors cursor-pointer font-normal"
              >
                <span>Trigger Head Rotation (Feed 2)</span>
                <span>⚠️</span>
              </button>
              <button
                onClick={() => triggerAnomaly('feed-6', 'Multiple Faces Detected')}
                className="w-full py-2 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center justify-between transition-colors cursor-pointer font-normal"
              >
                <span>Trigger Multiple Faces (Feed 6)</span>
                <span>🚨</span>
              </button>
              <button
                onClick={() => {
                  triggerAnomaly('feed-2', 'Clear');
                  triggerAnomaly('feed-6', 'Clear');
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex items-center justify-between transition-colors cursor-pointer font-normal"
              >
                <span>Reset Feeds to Normal</span>
                <span>✅</span>
              </button>
              <button
                onClick={toggleLocalWebcam}
                className="w-full py-2 px-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 flex items-center justify-between transition-colors cursor-pointer font-normal"
              >
                <span>{localWebcamActive ? 'Disable Real Webcam' : 'Enable Real Webcam on Feed 1'}</span>
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN BODY */}
        <main className="lg:col-span-9 space-y-6">
          {adminNav === 'dashboard' && (
            <>
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-normal text-slate-900 dark:text-white tracking-tight">
                    Proctoring & System Overview
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time WebRTC neural proctor stream with automated multi-modal anomaly classification
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-normal bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    6 Active Feeds &bull; Zero Lag
                  </span>
                </div>
              </div>

              {/* 6-FEED VIDEO MONITORING GRID */}
              <div className="bg-white dark:bg-[#131d33] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <h3 className="font-normal text-slate-900 dark:text-white text-base">Live Student Monitoring</h3>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    FPS: 30 &bull; Resolution: 720p &bull; Latency: 18ms
                  </div>
                </div>

                {cameraError && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                    {cameraError}
                  </div>
                )}

                {/* 2 ROWS X 3 COLS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {proctorFeeds.map((feed, index) => {
                    const isFeed1 = index === 0;
                    const isFeed2 = index === 1;
                    const isFeed3 = index === 2;
                    const isFeed4 = index === 3;
                    const isFeed5 = index === 4;
                    const isFeed6 = index === 5;

                    return (
                      <div
                        key={feed.id}
                        className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#1a2540] border-2 border-slate-200 dark:border-slate-700/80 aspect-video flex items-center justify-center group shadow-xs"
                      >
                        {/* Recording Red Dot in top-left */}
                        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[9px] text-white font-mono uppercase font-normal">REC</span>
                        </div>

                        {/* Top-Right Status Badge */}
                        <div className="absolute top-2.5 right-2.5 z-20">
                          {feed.status === 'Clear' && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-normal bg-emerald-500 text-white shadow-md">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Clear</span>
                            </span>
                          )}

                          {feed.status === 'Head Rotation' && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-normal bg-amber-500 text-slate-950 shadow-md animate-pulse">
                              <span>Head Rotation</span>
                            </span>
                          )}

                          {feed.status === 'Multiple Faces Detected' && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-normal bg-red-600 text-white shadow-md animate-bounce">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Multiple Faces Detected</span>
                            </span>
                          )}
                        </div>

                        {/* Video Content */}
                        {isFeed1 && localWebcamActive ? (
                          <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover mirror"
                          />
                        ) : (
                          <div className="w-full h-full relative flex items-center justify-center bg-slate-200 dark:bg-slate-900">
                            {/* Classroom background elements */}
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 opacity-90" />
                            <div className="absolute top-3 left-4 w-12 h-10 border border-slate-300 dark:border-slate-700/60 rounded-xs" />
                            <div className="absolute top-3 right-4 w-10 h-10 border border-slate-300 dark:border-slate-700/60 rounded-xs" />
                            <div className="absolute bottom-0 inset-x-0 h-6 bg-slate-300/80 dark:bg-slate-800/80 border-t border-slate-300 dark:border-slate-700/60" />

                            {/* Feed 1: Boy in blue shirt */}
                            {isFeed1 && (
                              <div className="relative z-10 flex flex-col items-center">
                                <div className="absolute -top-3 w-16 h-20 border-2 border-emerald-500 dark:border-emerald-400 rounded-md pointer-events-none" />
                                <div className="w-12 h-12 rounded-full bg-amber-700 border-2 border-slate-500 overflow-hidden relative shadow-md">
                                  <div className="w-full h-4 bg-slate-900 rounded-b-md" />
                                  <div className="flex justify-around px-2 pt-2">
                                    <div className="w-1 h-1 bg-slate-950 rounded-full" />
                                    <div className="w-1 h-1 bg-slate-950 rounded-full" />
                                  </div>
                                </div>
                                <div className="w-20 h-14 bg-blue-600 rounded-t-2xl mt-1 shadow-md" />
                              </div>
                            )}

                            {/* Feed 2: Girl in orange shirt with Head Rotation */}
                            {isFeed2 && (
                              <div className="relative z-10 flex flex-col items-center">
                                <div className="absolute -top-4 w-22 h-22 rounded-full border-2 border-dashed border-emerald-500 dark:border-emerald-400 pointer-events-none flex items-center justify-between px-1">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-normal text-xs">↩</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-normal text-xs">↪</span>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-amber-600 border-2 border-slate-500 overflow-hidden relative shadow-md rotate-12">
                                  <div className="w-full h-6 bg-slate-900 rounded-b-lg" />
                                  <div className="flex justify-around px-2 pt-1">
                                    <div className="w-1 h-1 bg-slate-950 rounded-full" />
                                    <div className="w-1 h-1 bg-slate-950 rounded-full" />
                                  </div>
                                </div>
                                <div className="w-20 h-14 bg-orange-500 rounded-t-2xl mt-1 shadow-md" />
                              </div>
                            )}

                            {/* Feed 3: Boy in yellow shirt */}
                            {isFeed3 && (
                              <div className="relative z-10 flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-amber-700 border-2 border-slate-500 overflow-hidden relative shadow-md">
                                  <div className="w-full h-4 bg-slate-900 rounded-b-md" />
                                  <div className="flex justify-around px-2 pt-2">
                                    <div className="w-1 h-1 bg-slate-950 rounded-full" />
                                    <div className="w-1 h-1 bg-slate-950 rounded-full" />
                                  </div>
                                </div>
                                <div className="w-20 h-14 bg-yellow-500 rounded-t-2xl mt-1 shadow-md" />
                              </div>
                            )}

                            {/* Feed 4: Boy in orange/red shirt */}
                            {isFeed4 && (
                              <div className="relative z-10 flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-amber-700 border-2 border-slate-500 overflow-hidden relative shadow-md">
                                  <div className="w-full h-4 bg-slate-900 rounded-b-md" />
                                  <div className="flex justify-around px-2 pt-2">
                                    <div className="w-1 h-1 bg-slate-950 rounded-full" />
                                    <div className="w-1 h-1 bg-slate-950 rounded-full" />
                                  </div>
                                </div>
                                <div className="w-20 h-14 bg-red-600 rounded-t-2xl mt-1 shadow-md" />
                              </div>
                            )}

                            {/* Feed 5: Girl in blue shirt with Head Rotation */}
                            {isFeed5 && (
                              <div className="relative z-10 flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-amber-600 border-2 border-slate-500 overflow-hidden relative shadow-md -rotate-12">
                                  <div className="w-full h-6 bg-slate-900 rounded-b-lg" />
                                  <div className="flex justify-around px-2 pt-1">
                                    <div className="w-1 h-1 bg-slate-950 rounded-full" />
                                    <div className="w-1 h-1 bg-slate-950 rounded-full" />
                                  </div>
                                </div>
                                <div className="w-20 h-14 bg-blue-500 rounded-t-2xl mt-1 shadow-md" />
                              </div>
                            )}

                            {/* Feed 6: Multiple Faces Detected */}
                            {isFeed6 && (
                              <div className="relative z-10 flex items-center justify-center">
                                <div className="absolute -left-6 bottom-2 opacity-75">
                                  <div className="w-8 h-8 rounded-full bg-slate-400 dark:bg-slate-300 border border-red-500" />
                                  <div className="w-12 h-8 bg-emerald-600 rounded-t-lg" />
                                </div>

                                <div className="flex flex-col items-center relative z-10">
                                  <div className="absolute -top-3 w-14 h-18 border-2 border-red-500 rounded-md" />
                                  <div className="w-12 h-12 rounded-full bg-amber-700 border-2 border-slate-500 overflow-hidden relative shadow-md">
                                    <div className="w-full h-4 bg-slate-900 rounded-b-md" />
                                  </div>
                                  <div className="w-20 h-14 bg-orange-600 rounded-t-2xl mt-1 shadow-md" />
                                </div>

                                <div className="absolute -right-6 bottom-2 opacity-75">
                                  <div className="w-8 h-8 rounded-full bg-slate-400 dark:bg-slate-300 border border-red-500" />
                                  <div className="w-12 h-8 bg-blue-700 rounded-t-lg" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Bottom Feed Label Bar */}
                        <div className="absolute bottom-0 inset-x-0 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xs p-2 flex items-center justify-between text-[11px] text-slate-800 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 z-20">
                          <span className="font-normal">{feed.studentName}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedFeedForReview(feed)}
                              className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-400 text-[10px] font-normal cursor-pointer"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => triggerAnomaly(feed.id, feed.status === 'Clear' ? 'Head Rotation' : 'Clear')}
                              className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 text-[10px] font-normal cursor-pointer"
                            >
                              Toggle
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC ANOMALY LOGS TABLE */}
              <div className="bg-white dark:bg-[#131d33] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-normal text-slate-900 dark:text-white text-base">Anomaly Logs</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Timestamped machine learning event registry</p>
                  </div>
                  <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-200 dark:border-cyan-800">
                    {anomalyLogs.length} Events Logged
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 dark:bg-[#1a2540] text-slate-600 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Student</th>
                        <th className="p-3">Detection Type</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {anomalyLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-slate-600 dark:text-slate-300">{log.timestamp}</td>
                          <td className="p-3 font-normal text-slate-900 dark:text-white">{log.studentName}</td>
                          <td className="p-3">
                            {log.detectionType === 'Head Rotation' && (
                              <span className="text-amber-600 dark:text-amber-400 font-normal">{log.detectionType}</span>
                            )}
                            {log.detectionType === 'Multiple Faces Detected' && (
                              <span className="text-red-600 dark:text-red-400 font-normal">{log.detectionType}</span>
                            )}
                            {log.detectionType === 'Clear' && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-normal">{log.detectionType}</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  log.status === 'Active'
                                    ? 'bg-emerald-500'
                                    : log.status === 'Detected'
                                    ? 'bg-amber-500'
                                    : 'bg-slate-400'
                                }`}
                              />
                              <span
                                className={
                                  log.status === 'Active'
                                    ? 'text-emerald-700 dark:text-emerald-400 font-normal'
                                    : log.status === 'Detected'
                                    ? 'text-amber-700 dark:text-amber-400 font-normal'
                                    : 'text-slate-500 dark:text-slate-400'
                                }
                              >
                                {log.status}
                              </span>
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => resolveAnomaly(log.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-normal cursor-pointer"
                            >
                              Resolve
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

          {/* USER MANAGEMENT CRUD TAB */}
          {adminNav === 'users' && <UserManagement />}

          {/* CURRICULUM AND GRADE RANGE CONTROL TAB */}
          {adminNav === 'curriculum' && (
            <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl space-y-6 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-normal uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-100/70 dark:bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-200/50 dark:border-cyan-800/50">
                      Global Institutional Policy
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                      &bull; Grades 6-12 Subject Alignment
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-normal text-slate-900 dark:text-white tracking-tight mt-1">
                    Curriculum
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure global grade parameters, enabled subject departments, and active institutional context across all student and educator workspaces.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCurriculumModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-normal text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Interactive Syllabus Explorer</span>
                  </button>
                </div>
              </div>

              {/* NEW REQUIREMENT: Dedicated Admin Curriculum & Topic Manager Module */}
              <div className="pt-2">
                <CurriculumTopicManager />
              </div>

              {/* Central Filters Grid: Grades 6-12 & Subject Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Multi-Select Filters for Grades 6-12 */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-normal text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span>Authorized Grade Levels</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Toggle to enable or restrict grade content across student portals.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-normal text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800">
                      {activeGrades.length} Active
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {[6, 7, 8, 9, 10, 11, 12].map((g) => {
                      const isActive = activeGrades.includes(g);
                      return (
                        <button
                          key={g}
                          onClick={() => toggleGradeFilter(g)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-normal transition-all cursor-pointer ${
                            isActive
                              ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-500/30'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                          }`}
                        >
                          Grade {g}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-2 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Quick sets:</span>
                    <button
                      onClick={() => [6, 7, 8].forEach((g) => !activeGrades.includes(g) && toggleGradeFilter(g))}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-cyan-600 cursor-pointer font-normal"
                    >
                      Middle School (6-8)
                    </button>
                    <button
                      onClick={() => [9, 10, 11, 12].forEach((g) => !activeGrades.includes(g) && toggleGradeFilter(g))}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-cyan-600 cursor-pointer font-normal"
                    >
                      High School (9-12)
                    </button>
                  </div>
                </div>

                {/* 2. Multi-Select Filters for Subject Categories */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-normal text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span>Subject Disciplines & Categories</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Multi-select categories enabled for autonomous tutoring and curriculum generation.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-normal text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800">
                      {activeCategories.length} Categories
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {['STEM', 'Language Arts', 'Humanities', 'Arts & Electives'].map((cat) => {
                      const isActive = activeCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-normal transition-all cursor-pointer ${
                            isActive
                              ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-500/30'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Global Institutional Context Dropdown */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-normal text-slate-700 dark:text-slate-300 mb-1">
                      Global Primary Subject Context for Educator Studio:
                    </label>
                    <select
                      value={teacherSubjectContext}
                      onChange={(e) => setTeacherSubjectContext(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-cyan-700 dark:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      <option value="10th Grade Physics">[10th Grade Physics - Classical Mechanics & Vectors]</option>
                      <option value="9th Grade Biology">[9th Grade Biology - Cellular Metabolism & Genetics]</option>
                      <option value="8th Grade Science">[8th Grade Science - Integrated Physical Systems]</option>
                      <option value="6th Grade Math">[6th Grade Math - Foundations & Linear Reasoning]</option>
                      <option value="12th Grade Calculus">[12th Grade Calculus - Differential Analysis & Limits]</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Curriculum Modules Table */}
              {(() => {
                const resolvedForCatalog = resolveSubjectsForBoard(
                  catalogBoardFilter,
                  subjectsDB,
                  boardSubjectMappings
                )
                  .filter(
                    (s) =>
                      s.status === 'ACTIVE' &&
                      activeGrades.includes(s.grade_level) &&
                      activeCategories.includes(s.category || 'STEM')
                  )
                  .map((s) => ({
                    id: s.id,
                    grade: s.grade_level,
                    board: s.board || 'ALL',
                    subjectType: s.resolvedSubjectType,
                    category: s.category || 'STEM',
                    subjectName: s.name,
                    code: s.code || `${s.name.slice(0, 3).toUpperCase()}-${s.grade_level}01`,
                    sampleTopics: topicsDB
                      .filter((t) => t.subject_id === s.id && t.status === 'ACTIVE')
                      .map((t) => t.title),
                  }));

                const filteredCatalog = resolvedForCatalog.length > 0 || catalogBoardFilter !== 'ALL'
                  ? resolvedForCatalog
                  : curriculumList.filter(
                      (c) =>
                        activeGrades.includes(c.grade) &&
                        activeCategories.includes(c.category)
                    ).map((c) => ({ ...c, subjectType: c.subject_type || 'CORE' }));

                const visibleCatalog = showAllCatalogRows ? filteredCatalog : filteredCatalog.slice(0, 50);

                return (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-normal text-sm text-slate-900 dark:text-white">
                          Institutional Course Catalog ({filteredCatalog.length} active courses)
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Board: [{catalogBoardFilter === 'ALL' ? `All ${boardsConfig.length} Boards` : catalogBoardFilter}] &bull; Grades [{activeGrades.join(', ')}] &bull; [{activeCategories.join(', ')}]
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Governing Board:</span>
                        <select
                          value={catalogBoardFilter}
                          onChange={(e) => {
                            setCatalogBoardFilter(e.target.value as EducationBoard | 'ALL');
                            setShowAllCatalogRows(false);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                        >
                          <option value="ALL">All Governing Boards ({boardsConfig.length})</option>
                          {boardsConfig.map((b) => (
                            <option key={b.board_id} value={b.board_id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-[#1a2540] text-slate-600 dark:text-slate-400 uppercase font-normal border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-3">Course Code</th>
                            <th className="p-3">Board</th>
                            <th className="p-3">Grade Level</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Subject Name</th>
                            <th className="p-3">Core Syllabus Topics</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {visibleCatalog.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-3 font-mono font-normal text-cyan-600 dark:text-cyan-400">{c.code}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-normal bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800">
                                  {!c.board || c.board === 'ALL' ? 'All Boards' : c.board}
                                </span>
                              </td>
                              <td className="p-3 font-normal text-slate-900 dark:text-white">Grade {c.grade}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-300">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {c.category}
                                </span>
                              </td>
                              <td className="p-3 font-normal text-slate-900 dark:text-white">{c.subjectName}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-300">
                                <div className="flex flex-wrap gap-1 max-w-md">
                                  {c.sampleTopics.slice(0, 3).map((top, idx) => (
                                    <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                                      {top}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400">
                                  Active &bull; Synced
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {!showAllCatalogRows && filteredCatalog.length > 50 && (
                      <div className="text-center pt-1">
                        <button
                          onClick={() => setShowAllCatalogRows(true)}
                          className="text-xs font-normal text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                        >
                          Show all {filteredCatalog.length} active courses
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* STUDENT MANAGEMENT TAB */}
          {adminNav === 'students' && (
            <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl space-y-5 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-normal text-slate-900 dark:text-white">Student Roster & Proctoring Compliance</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total enrolled students: {studentsList.length}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      placeholder="Search students..."
                      className="bg-slate-50 dark:bg-[#1a2540] text-xs text-slate-800 dark:text-slate-200 pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button
                    onClick={() => openQuickAdd('student')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-normal shadow-sm cursor-pointer transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Student</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#1a2540] text-slate-600 dark:text-slate-400 uppercase font-normal border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">GPA</th>
                      <th className="p-3">Attendance</th>
                      <th className="p-3">Physics Progress</th>
                      <th className="p-3">Risk Level</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentsList
                      .filter(
                        (s) =>
                          s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchStudent.toLowerCase()) ||
                          s.grade.toLowerCase().includes(searchStudent.toLowerCase())
                      )
                      .map((stu) => (
                        <tr key={stu.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-normal text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5">
                              <span>{stu.name}</span>
                              {stu.isFlagged && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  Flagged
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{stu.email}</div>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{stu.grade}</td>
                          <td className="p-3 text-cyan-600 dark:text-cyan-400 font-mono font-normal">{stu.gpa}</td>
                          <td className="p-3 text-emerald-600 dark:text-emerald-400 font-normal">{stu.attendance}%</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{stu.physicsProgress}%</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-normal ${
                                stu.riskScore === 'Low'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400'
                                  : stu.riskScore === 'Medium'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400'
                                  : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-400'
                              }`}
                            >
                              {stu.riskScore} Risk
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setNewCertStudent(stu.name);
                                  setAdminNav('certificates');
                                }}
                                className="px-2 py-1 rounded bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-[10px] font-normal cursor-pointer"
                              >
                                Issue Cert
                              </button>
                              <button
                                type="button"
                                onClick={() => setAdminNav('users')}
                                title="Open Directory Controls & Audit Trail"
                                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                <History className="w-3 h-3" />
                                <span>Audit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const match = usersList.find((u) => u.email === stu.email);
                                  if (match) flagUserAccount(match.id, !match.isFlagged, 'Flagged via Student Roster');
                                }}
                                className={`px-2 py-1 rounded border text-[10px] flex items-center gap-1 cursor-pointer ${
                                  stu.isFlagged
                                    ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 text-amber-800 dark:text-amber-300'
                                    : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                <Flag className="w-3 h-3" />
                                <span>{stu.isFlagged ? 'Unflag' : 'Flag'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(adminNav === 'tasks-sync' || adminNav === 'interactions' || adminNav === 'billing') && (
            <AdminOperationsSync section={adminNav} />
          )}

          {adminNav === 'subscription-plans' && <SubscriptionPlansManager />}
          {adminNav === 'ai-cost-monitor' && <AiCostMonitorDashboard />}

          {/* TEACHER MANAGEMENT TAB */}
          {adminNav === 'teachers' && (
            <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl space-y-5 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-normal text-slate-900 dark:text-white">Teacher Faculty & Class Cohorts</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total active educators: {teachersList.length}</p>
                </div>
                <button
                  onClick={() => openQuickAdd('teacher')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-normal shadow-sm cursor-pointer transition-colors self-start sm:self-auto"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Teacher</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {teachersList.map((tch) => (
                  <div key={tch.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-normal shrink-0">
                        {tch.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-normal text-slate-900 dark:text-white text-sm truncate">{tch.name}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">{tch.subject}</span>
                        <span className="text-[11px] text-slate-400 block truncate">{tch.email}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <div>Students Managed: <strong className="text-cyan-600 dark:text-cyan-400">{tch.activeStudentsCount}</strong></div>
                      <div>Curriculum Lesson Plans: <strong className="text-emerald-600 dark:text-emerald-400">{tch.lessonPlansCount}</strong></div>
                      {tch.classes && tch.classes.length > 0 && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                          Cohorts: {tch.classes.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SYSTEM CONFIGURATION TAB */}
          {adminNav === 'config' && (
            <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl space-y-6 transition-colors">
              <div>
                <h2 className="text-xl font-normal text-slate-900 dark:text-white">AI Proctoring & Cheating Detection Calibration</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Adjust computer vision sensitivity thresholds</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between font-normal text-slate-800 dark:text-slate-200">
                    <span>Gaze Tracking Tolerance</span>
                    <span className="text-cyan-600 dark:text-cyan-400">{sensitivity.gazeThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="95"
                    value={sensitivity.gazeThreshold}
                    onChange={(e) => setSensitivity((s) => ({ ...s, gazeThreshold: Number(e.target.value) }))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Flags students looking away from screen center for more than 4 consecutive seconds.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between font-normal text-slate-800 dark:text-slate-200">
                    <span>Head Rotation Angle Tolerance</span>
                    <span className="text-amber-600 dark:text-amber-400">{sensitivity.rotationAngle}&deg;</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    value={sensitivity.rotationAngle}
                    onChange={(e) => setSensitivity((s) => ({ ...s, rotationAngle: Number(e.target.value) }))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Yaw/pitch boundary for triggering "Head Rotation" alert overlay.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CERTIFICATES STUDIO & CREDENTIAL VAULT TAB (Module 4) */}
          {adminNav === 'certificates' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl space-y-6 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-normal text-slate-900 dark:text-white">
                      Credential Vault &amp; Autonomous Certificate Studio
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Master list of issued credentials, auto-trigger rules, manual approve/revoke controls, and student download telemetry.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={newCertStudent}
                      onChange={(e) => setNewCertStudent(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2540] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      {studentsList.map((stu) => (
                        <option key={stu.id} value={stu.name}>
                          {stu.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newCertCourse}
                      onChange={(e) => setNewCertCourse(e.target.value)}
                      placeholder="Milestone / Course Title"
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2540] text-xs text-slate-800 dark:text-slate-200"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newCertScore}
                      onChange={(e) => setNewCertScore(Number(e.target.value))}
                      className="w-20 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2540] text-xs text-slate-800 dark:text-slate-200"
                    />
                    <button
                      onClick={() => issueCertificate(newCertStudent, newCertCourse, newCertScore, 'Manual')}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-normal text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Award className="w-4 h-4" />
                      <span>Issue Credential</span>
                    </button>
                  </div>
                </div>

                {/* Auto-Trigger Policy Controls */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <SlidersHorizontal className="w-4 h-4 text-[#00A896]" />
                    <span>Auto-Trigger Issuance Policy (Syncs with Student Practice Assessments):</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={certAutoTriggerConfig.enabled}
                        onChange={(e) =>
                          setCertAutoTriggerConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                        }
                        className="accent-[#00A896] cursor-pointer"
                      />
                      <span>Enable Auto-Trigger</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span>Min Passing Score %</span>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        value={certAutoTriggerConfig.minScore}
                        onChange={(e) =>
                          setCertAutoTriggerConfig((prev) => ({ ...prev, minScore: Number(e.target.value) || 80 }))
                        }
                        className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={certAutoTriggerConfig.requireAdminApproval}
                        onChange={(e) =>
                          setCertAutoTriggerConfig((prev) => ({
                            ...prev,
                            requireAdminApproval: e.target.checked,
                          }))
                        }
                        className="accent-[#00A896] cursor-pointer"
                      />
                      <span>Hold for Manual Admin Approval</span>
                    </label>
                  </div>
                </div>

                {/* Issued Certificates Vault Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {cert.certificateNumber} &bull; {cert.triggerSource || 'Manual'} Trigger
                          </div>
                          <h4 className="font-normal text-slate-900 dark:text-white text-sm mt-0.5">
                            {cert.courseTitle}
                          </h4>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                            cert.status === 'Verified'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : cert.status === 'Pending Approval'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {cert.status}
                        </span>
                      </div>

                      <div className="text-slate-700 dark:text-slate-300">
                        Recipient: <span className="text-cyan-700 dark:text-cyan-300">{cert.studentName}</span> &bull; Score: {cert.score}% &bull; Downloads: {cert.downloadCount || 0}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 break-all">
                        Hash: {cert.verificationHash}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                        Issued: {cert.issueDate} by {cert.instructorName}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {cert.status !== 'Verified' && (
                          <button
                            type="button"
                            onClick={() => approveCertificate(cert.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] cursor-pointer"
                          >
                            {cert.status === 'Pending Approval' ? 'Approve Credential' : 'Re-Verify'}
                          </button>
                        )}
                        {cert.status !== 'Revoked' && (
                          <button
                            type="button"
                            onClick={() => revokeCertificate(cert.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const link = `${window.location.origin}/verify/${cert.certificateNumber}?hash=${encodeURIComponent(cert.verificationHash)}`;
                            navigator.clipboard?.writeText(link).catch(() => {});
                            setCopiedCertVerifyId(cert.id);
                            setTimeout(() => setCopiedCertVerifyId((p) => (p === cert.id ? null : p)), 2000);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedCertVerifyId === cert.id ? 'Link Copied' : 'Verification Link'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate Download Logs Ledger */}
              <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-normal text-slate-900 dark:text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#00A896]" />
                      <span>Student Certificate Download Logs</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Audit log of every download triggered from the Student Certificates tab.
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {certificateDownloadLogs.length} Download Events
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#1a2540] text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Certificate #</th>
                        <th className="p-3">Student</th>
                        <th className="p-3">Export Format</th>
                        <th className="p-3">Downloaded At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {certificateDownloadLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-mono text-slate-800 dark:text-slate-200">{log.certificateNumber}</td>
                          <td className="p-3 text-slate-900 dark:text-white">{log.studentName}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{log.format}</td>
                          <td className="p-3 text-slate-500 dark:text-slate-400">{log.downloadedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {adminNav === 'analytics' && (
            <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl space-y-6 transition-colors">
              <div>
                <h2 className="text-xl font-normal text-slate-900 dark:text-white">Global Academic Integrity & Proctoring Analytics</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Institutional health and AI autonomous assessment metrics</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-2xl font-normal text-cyan-600 dark:text-cyan-400">142</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active Sessions</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-2xl font-normal text-emerald-600 dark:text-emerald-400">99.4%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Integrity Score</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-2xl font-normal text-amber-600 dark:text-amber-400">3</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Flagged Anomalies</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-2xl font-normal text-purple-600 dark:text-purple-400">18ms</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI Inference Latency</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: Feed Inspection */}
      {selectedFeedForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131d33] rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-normal text-slate-900 dark:text-white text-base">
                Proctor Stream Snapshot: {selectedFeedForReview.studentName}
              </h3>
              <button
                onClick={() => setSelectedFeedForReview(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div>Exam: <strong>{selectedFeedForReview.subject}</strong></div>
              <div>Current AI Status: <strong className="text-cyan-600 dark:text-cyan-400">{selectedFeedForReview.status}</strong></div>
              <div>Anomaly Confidence: <strong className="text-amber-600 dark:text-amber-400">{selectedFeedForReview.anomalyConfidence}%</strong></div>
              <div>Total Timestamped Flags: <strong>{selectedFeedForReview.flagsCount}</strong></div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  triggerAnomaly(selectedFeedForReview.id, 'Clear');
                  setSelectedFeedForReview(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-normal cursor-pointer"
              >
                Clear Stream Flags
              </button>
              <button
                onClick={() => setSelectedFeedForReview(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: Quick Add Student / Teacher */}
      {quickAddRole && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131d33] rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-normal text-slate-900 dark:text-white text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-600" />
                <span>{quickAddRole === 'student' ? 'Add New Student' : 'Add New Teacher'}</span>
              </h3>
              <button
                onClick={() => setQuickAddRole(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder={quickAddRole === 'student' ? 'e.g., Maya Lin' : 'e.g., Prof. Alan Grant'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Institutional Email *</label>
                <input
                  type="email"
                  required
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                  placeholder={quickAddRole === 'student' ? 'e.g., maya.l@educateai.org' : 'e.g., alan.g@educateai.org'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {quickAddRole === 'student' ? (
                <>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Grade Level</label>
                    <select
                      value={quickGrade}
                      onChange={(e) => setQuickGrade(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="6th Grade">6th Grade</option>
                      <option value="7th Grade">7th Grade</option>
                      <option value="8th Grade">8th Grade</option>
                      <option value="9th Grade">9th Grade</option>
                      <option value="10th Grade">10th Grade</option>
                      <option value="11th Grade">11th Grade</option>
                      <option value="12th Grade">12th Grade</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Enrolled Courses</label>
                    <input
                      type="text"
                      value={quickCourses}
                      onChange={(e) => setQuickCourses(e.target.value)}
                      placeholder="Comma separated"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={quickDepartment}
                      onChange={(e) => setQuickDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Assigned Subject(s)</label>
                    <input
                      type="text"
                      value={quickSubjects}
                      onChange={(e) => setQuickSubjects(e.target.value)}
                      placeholder="Comma separated"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Assigned Cohorts</label>
                    <input
                      type="text"
                      value={quickCohorts}
                      onChange={(e) => setQuickCohorts(e.target.value)}
                      placeholder="Comma separated"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickAddRole(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
                >
                  {quickAddRole === 'student' ? 'Add Student' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
