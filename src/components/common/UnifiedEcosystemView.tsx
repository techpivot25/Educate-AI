import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PivotIQLogo } from './PivotIQLogo';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Radio,
  Sparkles,
  Users,
  Search,
  ExternalLink,
  Check,
  Lock,
  Clock,
  Layers,
  Send,
  HelpCircle,
  Award,
  Video,
  Database,
  ArrowLeftRight,
  RefreshCw,
  Sliders,
  Play,
  X,
  ChevronRight,
  Info,
  Shield,
  Activity,
  Flame,
  CheckCircle,
  FileCheck
} from 'lucide-react';

export const UnifiedEcosystemView: React.FC = () => {
  const {
    currentUser,
    teacherSubjectContext,
    setTeacherSubjectContext,
    activeGrades,
    toggleGradeFilter,
    activeCategories,
    toggleCategoryFilter,
    usersList,
    setIsCurriculumModalOpen,
    sendTutorMessage,
    currentRole,
    setCurrentRole,
    setAdminNav,
    doubts,
    addDoubt,
    resolveDoubt,
    quizzes,
    publishQuiz,
    activeBroadcastQuiz,
    certificates,
    setEcosystemOverviewMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'flows' | 'cards' | 'architecture'>('flows');
  const [selectedPipeline, setSelectedPipeline] = useState<
    'quiz' | 'doubt' | 'webrtc' | 'curriculum' | 'certificate' | 'rbac'
  >('quiz');
  const [simulationLog, setSimulationLog] = useState<string | null>(null);

  // Trigger interactive real-time simulation
  const handleSimulate = async (pipeline: 'quiz' | 'doubt' | 'resolve' | 'grade' | 'webrtc') => {
    if (pipeline === 'quiz') {
      const sampleQuiz = quizzes[0] || {
        id: 'quiz-sim-1',
        title: 'Newtonian Force & Friction Mastery',
        subject: 'Physics',
        topic: 'Mechanics',
        gradeLevel: 10,
        questions: [
          {
            id: 'q1',
            question: "What is Newton's Second Law of Motion?",
            options: ['F = ma', 'E = mc^2', 'V = IR', 'P = IV'],
            correctIndex: 0,
            explanation: 'Force equals mass times acceleration.',
            points: 10,
          },
        ],
        timeLimitMinutes: 15,
        totalPoints: 50,
      };
      publishQuiz(sampleQuiz, 'Class 8A - Physics');
      setSimulationLog(
        `⚡ [Teacher -> Student Event] Broadcasted "${sampleQuiz.title}" to Class 8A. Student panel received active assessment banner!`
      );
    } else if (pipeline === 'doubt') {
      await addDoubt(
        "Why doesn't the normal force cancel gravity if a body is accelerating upwards?",
        'Physics',
        "Newton's Laws"
      );
      setSimulationLog(
        '🙋 [Student -> Teacher Event] Student Alex R. flagged a doubt. Appears in Teacher Class Insights queue!'
      );
    } else if (pipeline === 'resolve') {
      const pendingDoubt = doubts.find((d) => d.status === 'pending') || doubts[0];
      if (pendingDoubt) {
        resolveDoubt(pendingDoubt.id);
        setSimulationLog(
          `✅ [Teacher -> Student Event] Instructor resolved doubt "${pendingDoubt.question.substring(0, 35)}...". Student notified!`
        );
      } else {
        setSimulationLog('ℹ️ No pending student doubts. Click "Simulate Student Doubt" first!');
      }
    } else if (pipeline === 'grade') {
      toggleGradeFilter(10);
      setSimulationLog(
        '⚙️ [Admin -> Teacher/Student Event] Toggled Grade 10 active filter. Aligned curriculum options across Teacher & Student views.'
      );
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-normal bg-[#00A896]/10 text-[#00A896] border border-[#00A896]/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cross-Panel Workflow & Data Flow Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-slate-900 dark:text-white">
            PivotIQ Ecosystem Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
            End-to-end synchronized data pipelines, real-time event buses, and role workflows linking{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-200">Student</strong>,{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-200">Teacher</strong>, and{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-200">Administrator</strong> portals.
          </p>
        </div>

        {/* Quick Portal Switcher & Back Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => {
                setCurrentRole('student');
                setEcosystemOverviewMode(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-normal transition-all cursor-pointer flex items-center gap-1.5 ${
                currentRole === 'student'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
              <span>Student View</span>
            </button>
            <button
              onClick={() => {
                setCurrentRole('teacher');
                setEcosystemOverviewMode(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-normal transition-all cursor-pointer flex items-center gap-1.5 ${
                currentRole === 'teacher'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-500" />
              <span>Teacher View</span>
            </button>
            <button
              onClick={() => {
                setCurrentRole('admin');
                setEcosystemOverviewMode(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-normal transition-all cursor-pointer flex items-center gap-1.5 ${
                currentRole === 'admin'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
              <span>Admin View</span>
            </button>
          </div>

          <button
            onClick={() => setEcosystemOverviewMode(false)}
            className="px-3 py-2 rounded-xl text-xs font-normal bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Return to active dashboard"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Overview</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('flows')}
          className={`pb-3 px-3 text-xs sm:text-sm font-normal border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'flows'
              ? 'border-[#00A896] text-[#00A896]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Interactive Data Flow Pipelines</span>
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          className={`pb-3 px-3 text-xs sm:text-sm font-normal border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'cards'
              ? 'border-[#00A896] text-[#00A896]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3-Panel Synchronized View</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`pb-3 px-3 text-xs sm:text-sm font-normal border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'architecture'
              ? 'border-[#00A896] text-[#00A896]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Technical Event Matrix & Schemas</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: INTERACTIVE DATA FLOW PIPELINES */}
      {/* ======================================================== */}
      {activeTab === 'flows' && (
        <div className="space-y-6">
          {/* Pipeline Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              {
                id: 'quiz',
                name: '1. Quiz Broadcast',
                icon: Send,
                desc: 'Teacher → Student assessment broadcast',
                color: 'text-amber-500',
              },
              {
                id: 'doubt',
                name: '2. Doubt Resolution',
                icon: HelpCircle,
                desc: 'Student doubt → Teacher resolution',
                color: 'text-blue-500',
              },
              {
                id: 'webrtc',
                name: '3. WebRTC Proctoring',
                icon: Video,
                desc: 'Class stream → Admin surveillance grid',
                color: 'text-purple-500',
              },
              {
                id: 'curriculum',
                name: '4. Curriculum Sync',
                icon: BookOpen,
                desc: 'Admin policy → Teacher/Student scope',
                color: 'text-cyan-500',
              },
              {
                id: 'certificate',
                name: '5. Digital Credential',
                icon: Award,
                desc: 'Student completion → Admin verification',
                color: 'text-emerald-500',
              },
              {
                id: 'rbac',
                name: '6. User & RBAC Sync',
                icon: Users,
                desc: 'Admin provisioning → Universal state',
                color: 'text-indigo-500',
              },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = selectedPipeline === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedPipeline(item.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800/90 border-[#00A896] shadow-md ring-1 ring-[#00A896]/20'
                      : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00A896]" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-normal text-slate-900 dark:text-white leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Simulation Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-[#00A896]" />
              <div>
                <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                  Live State Simulator
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Execute actions to observe immediate synchronization across portal stores.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSimulate('quiz')}
                className="px-3 py-1.5 rounded-xl text-xs font-normal bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Simulate Quiz Broadcast</span>
              </button>
              <button
                onClick={() => handleSimulate('doubt')}
                className="px-3 py-1.5 rounded-xl text-xs font-normal bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Simulate Student Doubt</span>
              </button>
              <button
                onClick={() => handleSimulate('resolve')}
                className="px-3 py-1.5 rounded-xl text-xs font-normal bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3 h-3" />
                <span>Resolve Doubt</span>
              </button>
              <button
                onClick={() => handleSimulate('grade')}
                className="px-3 py-1.5 rounded-xl text-xs font-normal bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sliders className="w-3 h-3" />
                <span>Toggle Grade Filter</span>
              </button>
            </div>
          </div>

          {/* Simulation Output Flash */}
          {simulationLog && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-normal text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{simulationLog}</span>
              </div>
              <button
                onClick={() => setSimulationLog(null)}
                className="text-emerald-600 hover:text-emerald-800 text-[10px] cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active Pipeline Visual Diagram & Detailed Step Flow */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Header of selected pipeline */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <h3 className="text-base font-normal text-slate-900 dark:text-white flex items-center gap-2">
                  <span>
                    {selectedPipeline === 'quiz' && 'Pipeline 1: Live Assessment Broadcast & Scoring'}
                    {selectedPipeline === 'doubt' && 'Pipeline 2: Socratic Doubt Flagging & Instructor Resolution'}
                    {selectedPipeline === 'webrtc' && 'Pipeline 3: WebRTC Video Stream & Automated Proctoring'}
                    {selectedPipeline === 'curriculum' && 'Pipeline 4: Grades 6–12 Curriculum & Subject Context Sync'}
                    {selectedPipeline === 'certificate' && 'Pipeline 5: Digital Credentials & Cryptographic Ledger'}
                    {selectedPipeline === 'rbac' && 'Pipeline 6: Central User Provisioning & Dynamic RBAC'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Visual node topology showing step-by-step dispatch across the 3 portals.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Event Bus: AppContext.tsx</span>
              </div>
            </div>

            {/* Interactive Step Nodes for the Selected Pipeline */}
            {selectedPipeline === 'quiz' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-amber-500 text-white">
                      STEP 1 &bull; TEACHER
                    </span>
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Draft & Target Broadcast
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Instructor selects assessment from library or AI-generates questions. Chooses target cohort (e.g. Class 7B - Science) and clicks <em>Broadcast Quiz</em>.
                  </p>
                  <div className="pt-1 text-[10px] text-amber-800 dark:text-amber-400 font-mono">
                    Dispatcher: publishQuiz(quiz, targetClass)
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-[#00A896]/10 dark:bg-[#00A896]/15 border border-[#00A896]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-[#00A896] text-white">
                      STEP 2 &bull; EVENT BUS
                    </span>
                    <Radio className="w-3.5 h-3.5 text-[#00A896]" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Synchronized State Bus
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    AppContext dispatches `setActiveBroadcastQuiz(info)` and fires notifications on both Teacher and Student event streams.
                  </p>
                  <div className="pt-1 text-[10px] text-[#00A896] font-mono">
                    Event: BROADCAST_QUIZ_EVENT
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-blue-500 text-white">
                      STEP 3 &bull; STUDENT
                    </span>
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Live Banner & Exam Attempt
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Student dashboard displays live broadcast alert. Student opens assessment, completes questions under timer, and submits.
                  </p>
                  <div className="pt-1 text-[10px] text-blue-800 dark:text-blue-400 font-mono">
                    Active Quiz ID: {activeBroadcastQuiz ? activeBroadcastQuiz.quiz.id : 'Ready'}
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-cyan-600 text-white">
                      STEP 4 &bull; TEACHER / ADMIN
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Instant Gradebook & KPIs
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Score, XP gain (+50 XP), and mastery level stream back to Teacher's Gradebook and Administrator's aggregate performance analytics.
                  </p>
                  <div className="pt-1 text-[10px] text-cyan-800 dark:text-cyan-400 font-mono">
                    Result: Student Progress + XP Updated
                  </div>
                </div>
              </div>
            )}

            {selectedPipeline === 'doubt' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-blue-500 text-white">
                      STEP 1 &bull; STUDENT
                    </span>
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Doubt Raised in Lesson
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Student gets stuck during Socratic tutor practice or video lesson. Submits query via Doubt Forum with subject & topic tags.
                  </p>
                  <div className="pt-1 text-[10px] text-blue-800 dark:text-blue-400 font-mono">
                    Dispatcher: addDoubt(question, subject)
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-[#00A896]/10 dark:bg-[#00A896]/15 border border-[#00A896]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-[#00A896] text-white">
                      STEP 2 &bull; EVENT BUS
                    </span>
                    <Radio className="w-3.5 h-3.5 text-[#00A896]" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Prioritized Flag Queue
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    AppContext appends doubt to `doubts` list with `status: 'pending'`, student identity, and timestamp.
                  </p>
                  <div className="pt-1 text-[10px] text-[#00A896] font-mono">
                    Pending Doubts: {doubts.filter((d) => d.status === 'pending').length}
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-amber-500 text-white">
                      STEP 3 &bull; TEACHER
                    </span>
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Class Insight Alert & Review
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Teacher sees ⚠️ Flagged Doubt banner in Class Insights. Teacher provides explanation and clicks <em>Resolve</em>.
                  </p>
                  <div className="pt-1 text-[10px] text-amber-800 dark:text-amber-400 font-mono">
                    Dispatcher: resolveDoubt(doubtId)
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-emerald-600 text-white">
                      STEP 4 &bull; STUDENT
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Instant Solution Delivered
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Student receives real-time notification that doubt was resolved. Doubt changes status to `resolved` across both portals.
                  </p>
                  <div className="pt-1 text-[10px] text-emerald-800 dark:text-emerald-400 font-mono">
                    Total Resolved: {doubts.filter((d) => d.status === 'resolved').length}
                  </div>
                </div>
              </div>
            )}

            {selectedPipeline === 'webrtc' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-amber-500 text-white">
                      STEP 1 &bull; TEACHER
                    </span>
                    <Video className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Live Classroom Stream
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Instructor initiates live interactive video classroom with curriculum whiteboard and live student camera roster.
                  </p>
                  <div className="pt-1 text-[10px] text-amber-800 dark:text-amber-400 font-mono">
                    Stream: WebRTC / Video Feeds
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-blue-500 text-white">
                      STEP 2 &bull; STUDENT
                    </span>
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Student Video Participation
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Students connect their camera feed, attend lecture, and participate in live quizzes with face verification.
                  </p>
                  <div className="pt-1 text-[10px] text-blue-800 dark:text-blue-400 font-mono">
                    Telemetry: MediaStream Track active
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-[#00A896]/10 dark:bg-[#00A896]/15 border border-[#00A896]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-[#00A896] text-white">
                      STEP 3 &bull; AI PROCTORING
                    </span>
                    <Shield className="w-3.5 h-3.5 text-[#00A896]" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Automated Anomaly Detection
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Real-time computer vision checks for gaze shift, multiple faces, device usage, or audio anomalies during assessments.
                  </p>
                  <div className="pt-1 text-[10px] text-[#00A896] font-mono">
                    Detection: Gaze, Multi-Face, Device
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-cyan-600 text-white">
                      STEP 4 &bull; ADMIN
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Surveillance Dashboard
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Administrator monitors live grid of video feeds. Receives immediate anomaly defense alerts and audit timestamps.
                  </p>
                  <div className="pt-1 text-[10px] text-cyan-800 dark:text-cyan-400 font-mono">
                    Admin Route: adminNav === 'dashboard'
                  </div>
                </div>
              </div>
            )}

            {selectedPipeline === 'curriculum' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-cyan-600 text-white">
                      STEP 1 &bull; ADMIN
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Global Curriculum Policy
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Administrator toggles active grades (Grades 6–12) and subject categories (STEM, Language Arts, Humanities).
                  </p>
                  <div className="pt-1 text-[10px] text-cyan-800 dark:text-cyan-400 font-mono">
                    Active Grades: [{activeGrades.join(', ')}]
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-[#00A896]/10 dark:bg-[#00A896]/15 border border-[#00A896]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-[#00A896] text-white">
                      STEP 2 &bull; EVENT BUS
                    </span>
                    <Radio className="w-3.5 h-3.5 text-[#00A896]" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Universal Filter Propagation
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    `toggleGradeFilter` and `toggleCategoryFilter` update global state and re-index the Socratic curriculum tree.
                  </p>
                  <div className="pt-1 text-[10px] text-[#00A896] font-mono">
                    Categories: [{activeCategories.join(', ')}]
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-amber-500 text-white">
                      STEP 3 &bull; TEACHER
                    </span>
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Dynamic Subject Dropdown
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Teacher subject selector and AI lesson planner align strictly to active grades (e.g. 10th Grade Physics, 8th Grade Science).
                  </p>
                  <div className="pt-1 text-[10px] text-amber-800 dark:text-amber-400 font-mono">
                    Context: {teacherSubjectContext}
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-blue-500 text-white">
                      STEP 4 &bull; STUDENT
                    </span>
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Constrained Learning Tree
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Student syllabus, Academic Growth tracker, and 24/7 AI Tutor adapt topics according to authorized grade standards.
                  </p>
                  <div className="pt-1 text-[10px] text-blue-800 dark:text-blue-400 font-mono">
                    Curriculum Modal: Aligned
                  </div>
                </div>
              </div>
            )}

            {selectedPipeline === 'certificate' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-blue-500 text-white">
                      STEP 1 &bull; STUDENT
                    </span>
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    100% Course Completion
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Student completes all modules, passes milestone quizzes, and reaches required XP threshold in Physics or Calculus.
                  </p>
                  <div className="pt-1 text-[10px] text-blue-800 dark:text-blue-400 font-mono">
                    Trigger: Progress === 100%
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-[#00A896]/10 dark:bg-[#00A896]/15 border border-[#00A896]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-[#00A896] text-white">
                      STEP 2 &bull; EVENT BUS
                    </span>
                    <Radio className="w-3.5 h-3.5 text-[#00A896]" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Mint Cryptographic Hash
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    System generates unique Certificate ID and SHA-256 cryptographic verification token into digital certificate ledger.
                  </p>
                  <div className="pt-1 text-[10px] text-[#00A896] font-mono">
                    Token: SHA-256 Hash Verified
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-emerald-600 text-white">
                      STEP 3 &bull; STUDENT PORTAL
                    </span>
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Skills Passport Credential
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Digital certificate appears in Student's "Certificates" tab with printable badge, grade transcript, and QR verification.
                  </p>
                  <div className="pt-1 text-[10px] text-emerald-800 dark:text-emerald-400 font-mono">
                    Stored in Student Passport
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-cyan-600 text-white">
                      STEP 4 &bull; ADMIN
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Ledger Audit & Revocation
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Administrators access the central certificate repository, verify authenticity proofs, and export credential transcripts.
                  </p>
                  <div className="pt-1 text-[10px] text-cyan-800 dark:text-cyan-400 font-mono">
                    Total Minted: {certificates.length} Certificates
                  </div>
                </div>
              </div>
            )}

            {selectedPipeline === 'rbac' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-cyan-600 text-white">
                      STEP 1 &bull; ADMIN
                    </span>
                    <Users className="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    User Provisioning & Roles
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Administrator adds or edits user account (Student, Teacher, Admin), assigns permission level and cohort affiliation.
                  </p>
                  <div className="pt-1 text-[10px] text-cyan-800 dark:text-cyan-400 font-mono">
                    Registered Users: {usersList.length}
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-[#00A896]/10 dark:bg-[#00A896]/15 border border-[#00A896]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-[#00A896] text-white">
                      STEP 2 &bull; EVENT BUS
                    </span>
                    <Radio className="w-3.5 h-3.5 text-[#00A896]" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Profile & Permission Bus
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Central identity store updates `usersList` and current session tokens. Permission guards recalculate role access.
                  </p>
                  <div className="pt-1 text-[10px] text-[#00A896] font-mono">
                    State: AppContext.usersList
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-amber-500 text-white">
                      STEP 3 &bull; TEACHER
                    </span>
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Class Roster Synchronization
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    New students automatically reflect in teacher's assigned classroom rosters, gradebooks, and attendance trackers.
                  </p>
                  <div className="pt-1 text-[10px] text-amber-800 dark:text-amber-400 font-mono">
                    Roster Active: Class 7B & 8A
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-blue-500 text-white">
                      STEP 4 &bull; STUDENT
                    </span>
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    Customized Portal Access
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Student logs into unified portal with tailored avatar, assigned courses, board affiliation (CBSE/ICSE), and grade passport.
                  </p>
                  <div className="pt-1 text-[10px] text-blue-800 dark:text-blue-400 font-mono">
                    Active User: {currentUser?.name || 'Sarah Connor'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: 3-PANEL SYNCHRONIZED VIEW (LIVE CARDS) */}
      {/* ======================================================== */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {/* ======================================================== */}
          {/* 1. STUDENT PORTAL (LEFT CARD) */}
          {/* ======================================================== */}
          <div className="bg-[#0f172a] text-slate-100 rounded-3xl p-5 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <PivotIQLogo size={24} />
                  <span className="font-light text-sm text-white">PivotIQ</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentRole('student');
                    setEcosystemOverviewMode(false);
                  }}
                  className="px-2.5 py-1 rounded-full text-[11px] font-normal bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 cursor-pointer"
                >
                  Enter Portal &rarr;
                </button>
              </div>

              <span className="text-[11px] font-normal tracking-wider uppercase text-indigo-400 block">
                STUDENT PORTAL
              </span>

              {/* Student Profile Card */}
              {(() => {
                const studentUser = usersList.find((u) => u.role === 'student');
                const studentName = currentUser?.role === 'student' ? currentUser.name : studentUser?.name || 'Sarah Connor';
                const studentAvatar = currentUser?.role === 'student' ? currentUser.avatar : studentUser?.avatar;

                return (
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden shrink-0 border border-indigo-500/40">
                      <img
                        src={
                          studentAvatar ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(studentName)}`
                        }
                        alt={studentName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-normal text-white text-sm">{studentName}</h4>
                      <p className="text-xs text-indigo-400 font-normal">8th Grade - STEM</p>
                      <p className="text-[10px] text-slate-400">Enrolled: Sep 2025</p>
                    </div>
                  </div>
                );
              })()}

              {/* Academic Growth Card */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-normal text-xs uppercase tracking-wider text-slate-300">
                    ACADEMIC GROWTH
                  </h5>
                  <span className="text-slate-500 text-xs">&bull;&bull;&bull;</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-[11px] font-normal text-indigo-300 block">
                    My Subjects (Grades 6–12 Context)
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-normal text-white text-[11px]">Grade 9: </span>
                      <span className="text-[11px] text-slate-300">Algebra I, Biology, World History</span>
                    </div>
                    <span className="text-[10px] font-normal text-emerald-400 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/60 border border-indigo-500/40">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-normal text-indigo-400 text-[11px]">Grade 10:</span>
                      <span className="text-[10px] font-normal text-indigo-400">Active</span>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Physics</span>
                        <span className="text-blue-400 font-normal">75%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>English II</span>
                        <span className="text-purple-400 font-normal">60%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chemistry</span>
                        <span className="text-emerald-400 font-normal">Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-normal text-white text-[11px]">Grade 11: </span>
                      <span className="text-[11px] text-slate-300">Calculus, US History</span>
                    </div>
                    <span className="text-[10px] font-normal text-amber-400">🔒 Enrolled</span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-normal text-white text-[11px]">Grade 12: </span>
                      <span className="text-[11px] text-slate-300">Literature, Advanced Physics</span>
                    </div>
                    <span className="text-[10px] font-normal text-slate-400">⚙️ Upcoming</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCurriculumModalOpen(true)}
                  className="w-full text-center text-xs font-normal text-indigo-400 hover:text-indigo-300 hover:underline pt-1 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Browse Full Grades 6–12 Curriculum</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Ask AI Tutor Pill */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-normal uppercase tracking-wider text-indigo-400">
                ASK AI TUTOR
              </span>
              <button
                onClick={async () => {
                  setCurrentRole('student');
                  setEcosystemOverviewMode(false);
                  await sendTutorMessage("Help with Newton's 2nd Law of Motion and force acceleration calculations.");
                }}
                className="w-full p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-normal text-xs flex items-center justify-between shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <span>🤖</span>
                  <span>Help with Newton's 2nd Law...</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. TEACHER DASHBOARD (CENTER CARD) */}
          {/* ======================================================== */}
          <div className="bg-[#faf7f2] dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl p-5 border border-amber-200/80 dark:border-amber-900/50 shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <PivotIQLogo size={24} />
                  <span className="font-light text-sm text-slate-900 dark:text-white">PivotIQ</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentRole('teacher');
                    setEcosystemOverviewMode(false);
                  }}
                  className="px-2.5 py-1 rounded-full text-[11px] font-normal bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 cursor-pointer"
                >
                  Enter Desktop &rarr;
                </button>
              </div>

              <span className="text-[11px] font-normal tracking-wider uppercase text-amber-800 dark:text-amber-400 block">
                TEACHER DASHBOARD
              </span>

              {/* Teacher Profile Card */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-amber-200/70 dark:border-slate-700 flex items-center gap-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center overflow-hidden shrink-0 border border-amber-300 dark:border-amber-700">
                  <img
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=ProfEliza"
                    alt="Prof. Eliza G."
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-normal text-slate-900 dark:text-white text-sm">
                    PROF. ELIZA G., Ph.D.
                  </h4>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400 font-normal uppercase">
                    DEPARTMENT: ALL STEM SUBJECTS (Grades 6–12)
                  </p>
                </div>
              </div>

              {/* Current Subject/Grade Context Dropdown Section */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-amber-200/70 dark:border-slate-700 space-y-3 shadow-xs">
                <div>
                  <span className="text-[11px] font-normal text-amber-900 dark:text-amber-300 uppercase block mb-1">
                    CURRENT SUBJECT/GRADE CONTEXT:
                  </span>
                  <select
                    value={teacherSubjectContext}
                    onChange={(e) => {
                      if (e.target.value === 'full-list') {
                        setIsCurriculumModalOpen(true);
                      } else {
                        setTeacherSubjectContext(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-slate-600 bg-amber-50 dark:bg-slate-900 text-xs font-normal text-amber-900 dark:text-amber-200 focus:outline-none cursor-pointer"
                  >
                    <option value="10th Grade Physics">[10th Grade Physics]</option>
                    <option value="6th Grade Math">[6th Grade Math]</option>
                    <option value="12th Grade Calculus">[12th Grade Calculus]</option>
                    <option value="8th Grade Science">[8th Grade Science]</option>
                    <option value="9th Grade Biology">[9th Grade Biology]</option>
                    <option value="full-list">[Full Grades 6–12 List...]</option>
                  </select>
                </div>

                {/* Assisted Lesson Plans & Live Video Preview Box */}
                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-slate-900/80 border border-amber-200/60 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-normal uppercase text-amber-900 dark:text-amber-300">
                      ASSISTED LESSON PLANS
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">Aligned to Context</span>
                  </div>

                  <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-amber-200 dark:border-slate-700">
                    <img
                      src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80"
                      alt="Live Video"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-normal px-1.5 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>LIVE</span>
                    </div>
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-normal px-1.5 py-0.5 rounded-md">
                      ✔ Clear
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => {
                        setCurrentRole('teacher');
                        setEcosystemOverviewMode(false);
                      }}
                      className="w-full py-2 px-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-normal text-[11px] truncate cursor-pointer"
                    >
                      DRAFTING LESSON: {teacherSubjectContext.includes('Biology') ? 'PHOTOSYNTHESIS (Grade 9)' : teacherSubjectContext.includes('Physics') ? "NEWTON'S 2ND LAW (Grade 10)" : 'LINEAR EQUATIONS (Grade 8)'}
                    </button>
                    <button
                      onClick={() => {
                        setCurrentRole('teacher');
                        setEcosystemOverviewMode(false);
                      }}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-600 text-amber-900 dark:text-amber-200 font-normal text-[11px] truncate cursor-pointer hover:bg-amber-50"
                    >
                      NEW QUIZ: {teacherSubjectContext.includes('Biology') ? 'CELL ENERGY (Grade 9)' : teacherSubjectContext.includes('Physics') ? 'VECTOR DYNAMICS (Grade 10)' : 'LINEAR EQUATIONS (Grade 8)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Insights Flagged Doubt Card */}
            <div className="p-3.5 rounded-2xl bg-amber-100/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1">
              <span className="text-[10px] font-normal uppercase text-amber-900 dark:text-amber-300 block">
                CLASS INSIGHTS
              </span>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-normal text-red-600">⚠️ FLAGGED DOUBT: </span>
                  <span className="text-xs font-normal text-slate-800 dark:text-slate-200">Alex R. (Newton's 2nd Law)</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 italic block">*Review Needed*</span>
                </div>
                <button
                  onClick={() => {
                    const d = doubts[0];
                    if (d) resolveDoubt(d.id);
                  }}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-normal rounded-lg cursor-pointer"
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. ADMIN HUB (RIGHT CARD) */}
          {/* ======================================================== */}
          <div className="bg-[#0b1322] text-slate-100 rounded-3xl p-5 border border-cyan-900/50 shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <PivotIQLogo size={24} />
                  <span className="font-light text-sm text-white">PivotIQ</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentRole('admin');
                    setEcosystemOverviewMode(false);
                  }}
                  className="px-2.5 py-1 rounded-full text-[11px] font-normal bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 cursor-pointer"
                >
                  Enter Admin Hub &rarr;
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-normal tracking-wider uppercase text-cyan-400">
                  USER MANAGEMENT
                </span>
                <div className="flex gap-1 text-[10px] font-normal">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">[STUDENTS]</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">[TEACHERS]</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">[ADMINS]</span>
                </div>
              </div>

              {/* Central Curriculum and Grade Range Control */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div>
                  <h5 className="font-normal text-xs text-white">
                    Curriculum and Grade Range Control
                  </h5>
                  <span className="text-[10px] text-slate-400 block">
                    Global Curriculum and Subject Context Filter
                  </span>
                </div>

                {/* Active Grades Filter */}
                <div className="space-y-1">
                  <span className="text-[10px] font-normal text-slate-300 block">
                    Active Grades: [{activeGrades.join(', ')}]
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <button
                        key={g}
                        onClick={() => toggleGradeFilter(g)}
                        className={`px-2 py-0.5 rounded text-[10px] font-normal cursor-pointer transition-colors ${
                          activeGrades.includes(g)
                            ? 'bg-[#00A896] text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Subjects Filter */}
                <div className="space-y-1">
                  <span className="text-[10px] font-normal text-slate-300 block">
                    Active Subjects: [{activeCategories.join(', ')}]
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {['STEM', 'Language Arts', 'Humanities', 'Arts & Electives'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleCategoryFilter(cat)}
                        className={`px-2 py-0.5 rounded text-[10px] font-normal cursor-pointer transition-colors ${
                          activeCategories.includes(cat)
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Directory Table Mini */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                  <span className="text-[10px] text-slate-400">Search student/teacher...</span>
                  <span className="text-[10px] font-normal text-cyan-400">CREATE NEW USER</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {usersList.slice(0, 4).map((u) => (
                    <div key={u.id} className="flex items-center justify-between text-slate-300 py-1">
                      <span className="font-normal text-white truncate max-w-[90px]">{u.name}</span>
                      <span className="text-slate-400 uppercase text-[10px]">{u.role}</span>
                      <span className="text-emerald-400 text-[10px] font-normal">{u.status}</span>
                      <span className="text-cyan-400 text-[10px] cursor-pointer">Edit/View</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Connected Callouts: LIVE MONITORING & CERTIFICATES */}
            <div className="space-y-2 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-normal uppercase text-cyan-400 block">
                    LIVE MONITORING
                  </span>
                  <span className="text-[10px] text-slate-400">Connects into live WebRTC camera grid</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentRole('admin');
                    setAdminNav('dashboard');
                    setEcosystemOverviewMode(false);
                  }}
                  className="px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-normal rounded-lg cursor-pointer"
                >
                  Feeds &rarr;
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-normal uppercase text-amber-400 block">
                    CERTIFICATES
                  </span>
                  <span className="text-[10px] text-slate-400">Cryptographic verified certificate ledger</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentRole('admin');
                    setAdminNav('certificates');
                    setEcosystemOverviewMode(false);
                  }}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-normal rounded-lg cursor-pointer"
                >
                  Ledger &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TECHNICAL EVENT MATRIX & SCHEMAS */}
      {/* ======================================================== */}
      {activeTab === 'architecture' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-normal text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#00A896]" />
              <span>Cross-Panel Data Flow & Event Dispatch Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive technical specification describing state payloads, source origins, event subscribers, and UX outcomes.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-3 font-normal">Pipeline / Feature</th>
                  <th className="py-2.5 px-3 font-normal">Source Panel</th>
                  <th className="py-2.5 px-3 font-normal">State Bus Dispatcher</th>
                  <th className="py-2.5 px-3 font-normal">Event Payload</th>
                  <th className="py-2.5 px-3 font-normal">Target Consumer</th>
                  <th className="py-2.5 px-3 font-normal">Synchronized Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-3 px-3 font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quiz Broadcast</span>
                  </td>
                  <td className="py-3 px-3">Teacher Panel</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#00A896]">publishQuiz(quiz, target)</td>
                  <td className="py-3 px-3 font-mono text-[10px]">activeBroadcastQuiz: &#123; quiz, targetClass, timeLimit &#125;</td>
                  <td className="py-3 px-3">Student Panel</td>
                  <td className="py-3 px-3">Student sees prominent countdown banner & practice test unlocks</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                    <span>Doubt Flagging</span>
                  </td>
                  <td className="py-3 px-3">Student Panel</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#00A896]">addDoubt(q, subject)</td>
                  <td className="py-3 px-3 font-mono text-[10px]">doubts: [..., &#123; id, question, status: 'pending' &#125;]</td>
                  <td className="py-3 px-3">Teacher Panel</td>
                  <td className="py-3 px-3">Teacher receives ⚠️ Flagged Doubt in Class Insights queue</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Doubt Resolution</span>
                  </td>
                  <td className="py-3 px-3">Teacher Panel</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#00A896]">resolveDoubt(id)</td>
                  <td className="py-3 px-3 font-mono text-[10px]">status: 'resolved', resolvedAt: timestamp</td>
                  <td className="py-3 px-3">Student Panel</td>
                  <td className="py-3 px-3">Student doubt forum badge updates; pedagogical solution displayed</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-purple-500" />
                    <span>WebRTC Surveillance</span>
                  </td>
                  <td className="py-3 px-3">Teacher / Student</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#00A896]">triggerAnomaly(id, type)</td>
                  <td className="py-3 px-3 font-mono text-[10px]">proctorFeeds: &#123; anomalies, integrityScore &#125;</td>
                  <td className="py-3 px-3">Admin Panel</td>
                  <td className="py-3 px-3">Live camera feed grid flags violations & triggers quota defense</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Curriculum Policy</span>
                  </td>
                  <td className="py-3 px-3">Admin Panel</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#00A896]">toggleGradeFilter(grade)</td>
                  <td className="py-3 px-3 font-mono text-[10px]">activeGrades: [6..12], activeCategories: []</td>
                  <td className="py-3 px-3">Teacher & Student</td>
                  <td className="py-3 px-3">Filters subject context dropdowns and student learning passport</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Certificate Ledger</span>
                  </td>
                  <td className="py-3 px-3">Student Panel</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#00A896]">Course completion trigger</td>
                  <td className="py-3 px-3 font-mono text-[10px]">certificates: &#123; id, hash, studentName, date &#125;</td>
                  <td className="py-3 px-3">Admin Panel</td>
                  <td className="py-3 px-3">Cryptographic verification token recorded in tamper-proof ledger</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>User RBAC Sync</span>
                  </td>
                  <td className="py-3 px-3">Admin Panel</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#00A896]">addUser / updateUser</td>
                  <td className="py-3 px-3 font-mono text-[10px]">usersList: UserProfile[], currentUser: UserProfile</td>
                  <td className="py-3 px-3">All Panels</td>
                  <td className="py-3 px-3">Instantly synchronizes auth tokens, avatar credentials & view permissions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
