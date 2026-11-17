import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CreditCard,
  FileText,
  Filter,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Unlock,
  X,
  Zap,
} from 'lucide-react';
import {
  CustomTaskApprovalStatus,
  DailyStudyTask,
  TaskSubmissionStatus,
} from '../../types';

interface AdminOperationsSyncProps {
  section: 'tasks-sync' | 'interactions' | 'billing';
}

const MENTORS = [
  'Dr. David Vance',
  'Ms. Elena Rostova',
  'Dr. Priya Nair',
  'Prof. Marcus Sterling',
];

export const AdminOperationsSync: React.FC<AdminOperationsSyncProps> = ({
  section,
}) => {
  const {
    dailyTasks,
    gradeTaskDeliverable,
    reviewCustomTask,
    doubts,
    quickDoubts,
    quizAttemptLogs,
    assignDoubtToMentor,
    resolveDoubtWithFeedback,
    closeDoubtItem,
    subscriptionState,
    billingLedger,
    toggleStudentModuleAccess,
    simulatePaymentLapse,
  } = useApp();

  // =========================================================================
  // MODULES 2 & 5 STATE: SUBMISSION GRADING & CUSTOM TASK APPROVALS
  // =========================================================================
  const [submissionFilter, setSubmissionFilter] = useState<'ALL' | TaskSubmissionStatus>('ALL');
  const [taskTrackFilter, setTaskTrackFilter] = useState<'ALL' | 'STANDARD' | 'CUSTOM'>('ALL');
  const [gradingTask, setGradingTask] = useState<DailyStudyTask | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeMaxScore, setGradeMaxScore] = useState<number>(100);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [gradeStatus, setGradeStatus] = useState<'Graded' | 'Revision Required' | 'Under Review'>('Graded');

  const [modifyingTask, setModifyingTask] = useState<DailyStudyTask | null>(null);
  const [modifyTopic, setModifyTopic] = useState('');
  const [modifyPoints, setModifyPoints] = useState<number>(25);
  const [modifyNote, setModifyNote] = useState('');

  // =========================================================================
  // MODULE 3 STATE: REAL-TIME DOUBTS & QUICK ASSESSMENTS
  // =========================================================================
  const [doubtFilter, setDoubtFilter] = useState<'ALL' | 'Open' | 'Assigned' | 'Resolved' | 'Closed'>('ALL');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  const taskStats = useMemo(() => {
    const overdue = dailyTasks.filter(
      (t) => t.date < todayIso && t.status !== 'Completed'
    );
    const completedHighPriority = dailyTasks.filter(
      (t) => t.priority === 'High' && t.status === 'Completed'
    );
    const pendingSubmissions = dailyTasks.filter(
      (t) => (t.submissionStatus || 'Pending') === 'Pending'
    ).length;
    const underReviewOrSubmitted = dailyTasks.filter(
      (t) =>
        t.submissionStatus === 'Submitted' ||
        t.submissionStatus === 'Under Review'
    ).length;
    const graded = dailyTasks.filter(
      (t) => t.submissionStatus === 'Graded'
    ).length;
    const customTasks = dailyTasks.filter((t) => Boolean(t.isCustom));
    const pendingCustom = customTasks.filter(
      (t) => (t.approvalStatus || 'Pending Approval') === 'Pending Approval'
    );
    const standardTasks = dailyTasks.filter((t) => !t.isCustom);

    return {
      overdue,
      completedHighPriority,
      pendingSubmissions,
      underReviewOrSubmitted,
      graded,
      customTasks,
      pendingCustom,
      standardTasks,
    };
  }, [dailyTasks, todayIso]);

  const filteredTasks = useMemo(() => {
    return dailyTasks.filter((task) => {
      const subStatus = task.submissionStatus || 'Pending';
      const matchesSubmission =
        submissionFilter === 'ALL' || subStatus === submissionFilter;
      const matchesTrack =
        taskTrackFilter === 'ALL' ||
        (taskTrackFilter === 'CUSTOM' ? Boolean(task.isCustom) : !task.isCustom);
      return matchesSubmission && matchesTrack;
    });
  }, [dailyTasks, submissionFilter, taskTrackFilter]);

  const openGradeModal = (task: DailyStudyTask) => {
    setGradingTask(task);
    setGradeScore(task.score ?? 88);
    setGradeMaxScore(task.maxScore ?? 100);
    setGradeFeedback(
      task.feedback || 'Clear explanation and solid step-by-step methodology.'
    );
    setGradeStatus(
      task.submissionStatus === 'Revision Required'
        ? 'Revision Required'
        : task.submissionStatus === 'Under Review'
        ? 'Under Review'
        : 'Graded'
    );
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingTask) return;
    gradeTaskDeliverable(gradingTask.id, {
      score: Number(gradeScore) || 0,
      maxScore: Math.max(1, Number(gradeMaxScore) || 100),
      feedback: gradeFeedback.trim() || 'Reviewed by instructor.',
      status: gradeStatus,
    });
    setGradingTask(null);
  };

  const openModifyModal = (task: DailyStudyTask) => {
    setModifyingTask(task);
    setModifyTopic(task.topic);
    setModifyPoints(task.points || 25);
    setModifyNote(task.adminReviewNote || 'Adjusted scope and approved for roadmap.');
  };

  const handleModifyApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyingTask) return;
    reviewCustomTask(
      modifyingTask.id,
      'Modified' as CustomTaskApprovalStatus,
      modifyNote.trim() || 'Modified & Approved by Admin',
      {
        topic: modifyTopic.trim() || modifyingTask.topic,
        points: Number(modifyPoints) || 25,
      }
    );
    setModifyingTask(null);
  };

  // =========================================================================
  // MODULE 3 COMPUTED DATA
  // =========================================================================
  const unifiedDoubts = useMemo(() => {
    const qDoubts = quickDoubts.map((qd) => ({
      source: 'quickDoubt' as const,
      id: qd.id,
      studentName: qd.studentName || 'Alex Rivera',
      subject: qd.subject,
      topic: qd.topic || 'General',
      question: qd.question,
      aiSummary: qd.answer,
      timestamp: qd.createdAt,
      status: qd.resolutionStatus || (qd.assignedTo ? 'Assigned' : 'Open'),
      assignedTo: qd.assignedTo,
      responseTimeLabel: qd.responseTimeLabel,
      resolutionNote: qd.adminResolutionNote,
    }));

    const sDoubts = doubts.map((d) => ({
      source: 'doubt' as const,
      id: d.id,
      studentName: d.studentName,
      subject: d.subject,
      topic: 'Concept Query',
      question: d.question,
      aiSummary: d.solution || '',
      timestamp: d.createdAt,
      status:
        d.resolutionStatus ||
        (d.status === 'resolved' ? 'Resolved' : d.assignedTo ? 'Assigned' : 'Open'),
      assignedTo: d.assignedTo,
      responseTimeLabel: d.responseTimeLabel,
      resolutionNote: d.adminNote,
    }));

    return [...qDoubts, ...sDoubts];
  }, [quickDoubts, doubts]);

  const filteredDoubts = useMemo(() => {
    if (doubtFilter === 'ALL') return unifiedDoubts;
    return unifiedDoubts.filter((d) => d.status === doubtFilter);
  }, [unifiedDoubts, doubtFilter]);

  const interactionAnalytics = useMemo(() => {
    const totalQueries = unifiedDoubts.length;
    const resolvedCount = unifiedDoubts.filter(
      (d) => d.status === 'Resolved' || d.status === 'Closed'
    ).length;
    const resolvedRate =
      totalQueries > 0 ? Math.round((resolvedCount / totalQueries) * 100) : 100;

    const subjectCount: Record<string, number> = {};
    unifiedDoubts.forEach((d) => {
      const key = d.subject || 'General';
      subjectCount[key] = (subjectCount[key] || 0) + 1;
    });
    const bottlenecks = Object.entries(subjectCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const maxCount = bottlenecks[0]?.[1] || 1;

    const avgQuizScore =
      quizAttemptLogs.length > 0
        ? Math.round(
            quizAttemptLogs.reduce((acc, q) => acc + q.score, 0) /
              quizAttemptLogs.length
          )
        : 0;

    return {
      totalQueries,
      resolvedCount,
      resolvedRate,
      bottlenecks,
      maxCount,
      avgQuizScore,
    };
  }, [unifiedDoubts, quizAttemptLogs]);

  // =========================================================================
  // MODULE 6 COMPUTED DATA
  // =========================================================================
  const billingStats = useMemo(() => {
    const totalRevenueINR = billingLedger
      .filter((tx) => tx.paymentStatus === 'Success')
      .reduce((sum, tx) => sum + tx.totalAmountINR, 0);
    const successCount = billingLedger.filter((tx) => tx.paymentStatus === 'Success').length;
    const failedCount = billingLedger.filter((tx) => tx.paymentStatus === 'Failed').length;
    const pendingCount = billingLedger.filter((tx) => tx.paymentStatus === 'Pending').length;
    return { totalRevenueINR, successCount, failedCount, pendingCount };
  }, [billingLedger]);

  // =========================================================================
  // RENDER: TASKS, SUBMISSIONS & CUSTOM MILESTONE APPROVALS (MODULES 2 & 5)
  // =========================================================================
  if (section === 'tasks-sync') {
    return (
      <div className="space-y-6">
        {/* Header & KPIs */}
        <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-normal text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#00A896]" />
                <span>Tasks, Submissions &amp; Custom Project Approvals</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Live operational sync between Student Agile Roadmap deliverables, grading feedback, and custom milestone requests.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                Standard Path: {taskStats.standardTasks.length}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                Custom Initiative: {taskStats.customTasks.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400">Pending Upload</div>
              <div className="text-xl text-slate-900 dark:text-white mt-1">{taskStats.pendingSubmissions}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400">Needs Grading</div>
              <div className="text-xl text-cyan-600 dark:text-cyan-400 mt-1">{taskStats.underReviewOrSubmitted}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400">Graded</div>
              <div className="text-xl text-emerald-600 dark:text-emerald-400 mt-1">{taskStats.graded}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400">Deadline Alerts</div>
              <div className="text-xl text-rose-600 dark:text-rose-400 mt-1">{taskStats.overdue.length}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400">Custom Queue</div>
              <div className="text-xl text-amber-600 dark:text-amber-400 mt-1">{taskStats.pendingCustom.length}</div>
            </div>
          </div>
        </div>

        {/* Automated Alerts (Missed Deadlines & High-Priority Completions) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#131d33] rounded-3xl p-5 border border-rose-200/80 dark:border-rose-900/60 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Automated Deadline Alerts ({taskStats.overdue.length})</span>
              </span>
              <span className="text-[11px] text-slate-400">Before {todayIso}</span>
            </div>
            {taskStats.overdue.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No missed deadlines detected across student tasks.
              </p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {taskStats.overdue.slice(0, 6).map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/60 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="text-slate-900 dark:text-white truncate">
                        {t.subject}: {t.topic}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.studentName || 'Alex Rivera'} &bull; Due {t.date} &bull; {t.status}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openGradeModal(t)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-200 cursor-pointer shrink-0"
                    >
                      Inspect
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#131d33] rounded-3xl p-5 border border-emerald-200/80 dark:border-emerald-900/60 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <Zap className="w-4 h-4" />
                <span>High-Priority Task Completions ({taskStats.completedHighPriority.length})</span>
              </span>
              <span className="text-[11px] text-slate-400">Real-Time Sync</span>
            </div>
            {taskStats.completedHighPriority.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No completed high-priority milestones logged yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {taskStats.completedHighPriority.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="text-slate-900 dark:text-white truncate">
                        {t.subject}: {t.topic}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.studentName || 'Alex Rivera'} &bull; {t.submissionStatus || 'Completed'}
                        {typeof t.score === 'number' ? ` • Score: ${t.score}/${t.maxScore || 100}` : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openGradeModal(t)}
                      className="px-2.5 py-1 rounded-lg bg-[#00A896] text-white text-[11px] cursor-pointer shrink-0"
                    >
                      Grade / Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Custom Tasks & Project Modules Approval Queue (Module 5) */}
        <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-normal text-slate-900 dark:text-white">
                Custom Tasks &amp; Project Modules Approval Queue
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Separates student-proposed initiatives (Custom Task, Side Project, Self-Paced Milestone) from the standard curriculum.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 self-start sm:self-auto">
              {taskStats.pendingCustom.length} Pending Review
            </span>
          </div>

          {taskStats.customTasks.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No student-proposed custom tasks or side projects submitted yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taskStats.customTasks.map((ct) => {
                const approval = ct.approvalStatus || 'Pending Approval';
                return (
                  <div
                    key={ct.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700/80 space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                          {ct.customCategory || 'Custom Task'}
                        </span>
                        <h4 className="text-sm text-slate-900 dark:text-white mt-1.5">
                          {ct.subject}: {ct.topic}
                        </h4>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Proposed by {ct.studentName || 'Alex Rivera'} &bull; Target {ct.date} &bull; {ct.duration_hrs} hrs &bull; {ct.points || 25} XP
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full border shrink-0 ${
                          approval === 'Approved' || approval === 'Modified'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : approval === 'Rejected'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {approval}
                      </span>
                    </div>

                    {ct.notes && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-[#131d33] p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
                        {ct.notes}
                      </p>
                    )}

                    {ct.adminReviewNote && (
                      <div className="text-[11px] text-cyan-700 dark:text-cyan-300">
                        Admin Note: {ct.adminReviewNote}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          reviewCustomTask(ct.id, 'Approved', 'Approved for student milestone roadmap.')
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => openModifyModal(ct)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] cursor-pointer"
                      >
                        Modify &amp; Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          reviewCustomTask(ct.id, 'Rejected', 'Outside current term learning objectives.')
                        }
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Centralized Submission Tracking Grid & Grading Portal (Module 2) */}
        <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-normal text-slate-900 dark:text-white">
                Submission Tracking Grid &amp; Grading Portal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track deliverables (Code, Document, Link, Note), assign scores, and return inline revision feedback.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['ALL', 'STANDARD', 'CUSTOM'] as const).map((track) => (
                  <button
                    key={track}
                    type="button"
                    onClick={() => setTaskTrackFilter(track)}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      taskTrackFilter === track
                        ? 'bg-white dark:bg-[#131d33] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {track === 'ALL' ? 'All Paths' : track === 'CUSTOM' ? 'Custom' : 'Standard'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={submissionFilter}
                  onChange={(e) => setSubmissionFilter(e.target.value as 'ALL' | TaskSubmissionStatus)}
                  className="bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Graded">Graded</option>
                  <option value="Revision Required">Revision Required</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#1a2540] text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Student &amp; Task</th>
                  <th className="p-3">Track / Priority</th>
                  <th className="p-3">Deliverable</th>
                  <th className="p-3">Submission Status</th>
                  <th className="p-3">Score &amp; Feedback</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTasks.slice(0, 20).map((task) => {
                  const subStatus = task.submissionStatus || 'Pending';
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="p-3">
                        <div className="text-slate-900 dark:text-white">{task.topic}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {task.studentName || 'Alex Rivera'} &bull; {task.subject} &bull; Due {task.date}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {task.isCustom ? task.customCategory || 'Custom' : 'Curriculum'}
                          </span>
                          {task.priority === 'High' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                              High Priority
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 max-w-xs">
                        {task.submissionTitle ? (
                          <div className="space-y-0.5">
                            <div className="text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-[#00A896] shrink-0" />
                              <span className="truncate">{task.submissionTitle}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {task.submissionType || 'Document'}
                              {task.submissionFileName ? ` • ${task.submissionFileName}` : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">No file submitted</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] border ${
                            subStatus === 'Graded'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : subStatus === 'Submitted' || subStatus === 'Under Review'
                              ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                              : subStatus === 'Revision Required'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {subStatus}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs">
                        {typeof task.score === 'number' ? (
                          <div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-mono">
                              {task.score} / {task.maxScore || 100}
                            </div>
                            {task.feedback && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {task.feedback}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Ungraded</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => openGradeModal(task)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] cursor-pointer"
                        >
                          Grade / Feedback
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grading Modal */}
        {gradingTask && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleGradeSubmit}
              className="bg-white dark:bg-[#131d33] rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="text-base text-slate-900 dark:text-white">
                  Grade Submission: {gradingTask.topic}
                </h4>
                <button
                  type="button"
                  onClick={() => setGradingTask(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {gradingTask.submissionContent && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Deliverable ({gradingTask.submissionType || 'Document'}): {gradingTask.submissionTitle}
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-28 overflow-y-auto">
                    {gradingTask.submissionContent}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-300 block">Score</label>
                  <input
                    type="number"
                    min={0}
                    max={gradeMaxScore}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-300 block">Max Score</label>
                  <input
                    type="number"
                    min={1}
                    value={gradeMaxScore}
                    onChange={(e) => setGradeMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-300 block">Outcome</label>
                  <select
                    value={gradeStatus}
                    onChange={(e) => setGradeStatus(e.target.value as 'Graded' | 'Revision Required' | 'Under Review')}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Graded">Graded (Complete)</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Revision Required">Revision Required</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-300 block">Inline Feedback to Student</label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white cursor-pointer"
                >
                  Save Grade &amp; Sync Student Portal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modify & Approve Custom Task Modal */}
        {modifyingTask && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleModifyApprove}
              className="bg-white dark:bg-[#131d33] rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="text-base text-slate-900 dark:text-white">Modify &amp; Approve Custom Module</h4>
                <button
                  type="button"
                  onClick={() => setModifyingTask(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-300 block">Adjusted Topic / Milestone Title</label>
                <input
                  type="text"
                  value={modifyTopic}
                  onChange={(e) => setModifyTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-300 block">Sprint Story Points (XP)</label>
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={modifyPoints}
                  onChange={(e) => setModifyPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-300 block">Reviewer Note</label>
                <textarea
                  rows={2}
                  value={modifyNote}
                  onChange={(e) => setModifyNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModifyingTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
                >
                  Save Modification &amp; Approve
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // RENDER: REAL-TIME DOUBTS, QUICK ACTIONS & DIAGNOSTIC CHECKS (MODULE 3)
  // =========================================================================
  if (section === 'interactions') {
    return (
      <div className="space-y-6">
        {/* Analytics Snapshot */}
        <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <h2 className="text-xl font-normal text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#00A896]" />
              <span>Real-Time Doubts &amp; Quick Assessments Stream</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live queue of incoming student doubts, quick diagnostic quiz checks, mentor resolution workflow, and bottleneck analytics.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400">Live Student Queries</div>
              <div className="text-xl text-slate-900 dark:text-white mt-1">{interactionAnalytics.totalQueries}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400">Resolution Rate</div>
              <div className="text-xl text-emerald-600 dark:text-emerald-400 mt-1">{interactionAnalytics.resolvedRate}%</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400">Quick Quiz Attempts</div>
              <div className="text-xl text-cyan-600 dark:text-cyan-400 mt-1">{quizAttemptLogs.length}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400">Avg Diagnostic Score</div>
              <div className="text-xl text-purple-600 dark:text-purple-400 mt-1">{interactionAnalytics.avgQuizScore}%</div>
            </div>
          </div>

          {/* Bottleneck Subjects Snapshot */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
            <div className="text-slate-700 dark:text-slate-200">
              Top Student Bottleneck Subjects (Aggregated FAQ Volume)
            </div>
            {interactionAnalytics.bottlenecks.length === 0 ? (
              <div className="text-slate-400">No doubt queries recorded yet.</div>
            ) : (
              <div className="space-y-2">
                {interactionAnalytics.bottlenecks.map(([subj, count]) => (
                  <div key={subj} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-700 dark:text-slate-300">{subj}</span>
                      <span className="text-slate-500 dark:text-slate-400">{count} queries</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-[#00A896] rounded-full"
                        style={{
                          width: `${Math.max(12, Math.round((count / interactionAnalytics.maxCount) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Resolution Workflow Queue */}
          <div className="lg:col-span-7 bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-normal text-slate-900 dark:text-white">
                Doubt Resolution Workflow
              </h3>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {(['ALL', 'Open', 'Assigned', 'Resolved', 'Closed'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setDoubtFilter(st)}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      doubtFilter === st
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {filteredDoubts.map((item) => {
                const draftKey = `${item.source}-${item.id}`;
                return (
                  <div
                    key={draftKey}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {item.source === 'quickDoubt' ? 'Quick Doubt AI' : 'Mentor Doubt'}
                        </span>
                        <span className="text-slate-900 dark:text-white">{item.studentName}</span>
                        <span className="text-[11px] text-slate-400">
                          &bull; {item.subject} ({item.topic})
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] border ${
                          item.status === 'Resolved' || item.status === 'Closed'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : item.status === 'Assigned'
                            ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-slate-800 dark:text-slate-100">{item.question}</p>

                    {item.resolutionNote && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 text-[11px] text-emerald-800 dark:text-emerald-300">
                        Resolution Note: {item.resolutionNote}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <span>Logged: {item.timestamp}</span>
                        {item.responseTimeLabel && (
                          <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                            <Clock className="w-3 h-3" />
                            Response: {item.responseTimeLabel}
                          </span>
                        )}
                      </div>

                      <select
                        value={item.assignedTo || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            assignDoubtToMentor(item.source, item.id, e.target.value);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        <option value="">Assign Mentor...</option>
                        {MENTORS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={replyDrafts[draftKey] || ''}
                        onChange={(e) =>
                          setReplyDrafts((prev) => ({ ...prev, [draftKey]: e.target.value }))
                        }
                        placeholder="Type mentor answer or guidance..."
                        className="flex-1 min-w-[180px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const text =
                            (replyDrafts[draftKey] || '').trim() ||
                            'Reviewed & explained with worked steps.';
                          resolveDoubtWithFeedback(item.source, item.id, text, 'Resolved');
                          setReplyDrafts((prev) => ({ ...prev, [draftKey]: '' }));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-[11px] cursor-pointer"
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => closeDoubtItem(item.source, item.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Quick Quiz Check Activity Stream */}
          <div className="lg:col-span-5 bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-normal text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00A896]" />
                <span>Quick Diagnostic Quiz Stream</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1 text-xs">
              {quizAttemptLogs.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-900 dark:text-white">{attempt.studentName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        attempt.score >= 80
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {attempt.score}% ({attempt.correctCount}/{attempt.totalQuestions})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    {attempt.quizTitle}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{attempt.topic}</span>
                    <span>{attempt.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: SUBSCRIPTIONS, FINANCIAL LEDGER & ACCESS PROVISIONING (MODULE 6)
  // =========================================================================
  const accessActive = subscriptionState.moduleAccessEnabled !== false;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-normal text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#00A896]" />
              <span>Financial Ledger &amp; Access Provisioning</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time subscription tracking, GST invoices, and automated student module access provisioning.
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Raw Card / Financial Credentials Stored</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
            <div className="text-slate-500 dark:text-slate-400">Settled Revenue (incl. GST)</div>
            <div className="text-xl text-emerald-600 dark:text-emerald-400 mt-1">
              &#8377;{billingStats.totalRevenueINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
            <div className="text-slate-500 dark:text-slate-400">Active Plan</div>
            <div className="text-sm text-slate-900 dark:text-white mt-1.5">{subscriptionState.tier}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
            <div className="text-slate-500 dark:text-slate-400">Paid Invoices</div>
            <div className="text-xl text-cyan-600 dark:text-cyan-400 mt-1">{billingStats.successCount}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
            <div className="text-slate-500 dark:text-slate-400">Failed / Past Due</div>
            <div className="text-xl text-rose-600 dark:text-rose-400 mt-1">
              {billingStats.failedCount + billingStats.pendingCount}
            </div>
          </div>
        </div>

        {/* Access Provisioning Control Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-900 dark:text-white">
                Student Platform Module Provisioning
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] border ${
                  accessActive
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}
              >
                {accessActive ? 'Modules Unlocked' : 'Access Suspended'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Billing Status: {subscriptionState.billingStatus || 'Trial'} &bull; Valid Through:{' '}
              {subscriptionState.expiresAt || subscriptionState.trialEndDate} &bull; Payment Method:{' '}
              {subscriptionState.paymentMethod?.type || 'Trial'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleStudentModuleAccess(!accessActive)}
              className={`px-4 py-2 rounded-xl text-xs text-white flex items-center gap-1.5 cursor-pointer transition-colors ${
                accessActive
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {accessActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{accessActive ? 'Suspend Module Access' : 'Restore Module Access'}</span>
            </button>

            <button
              type="button"
              onClick={simulatePaymentLapse}
              className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs cursor-pointer"
            >
              Simulate Payment Lapse (Auto-Suspend)
            </button>
          </div>
        </div>
      </div>

      {/* Financial Ledger Table */}
      <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-normal text-slate-900 dark:text-white">
            Subscription Invoices &amp; Financial Ledger
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {billingLedger.length} Ledger Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#1a2540] text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Student</th>
                <th className="p-3">Plan &amp; Cycle</th>
                <th className="p-3">Base / GST / Total</th>
                <th className="p-3">Method</th>
                <th className="p-3">Expires</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {billingLedger.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                    {tx.invoiceId}
                  </td>
                  <td className="p-3">
                    <div className="text-slate-900 dark:text-white">{tx.studentName}</div>
                    <div className="text-[11px] text-slate-400">{tx.studentEmail}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-800 dark:text-slate-200">{tx.planName}</div>
                    <div className="text-[10px] text-slate-400">
                      {tx.recurringMonthly ? 'Recurring Monthly Auto-Pay' : 'One-Time Cycle'}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[11px]">
                    <div className="text-slate-900 dark:text-white">
                      &#8377;{tx.totalAmountINR.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Base &#8377;{tx.baseAmountINR} + GST &#8377;{tx.gstAmountINR}
                    </div>
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{tx.paymentMethod}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px]">{tx.expiresAt}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${
                        tx.paymentStatus === 'Success'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : tx.paymentStatus === 'Pending'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {tx.paymentStatus === 'Success' && <CheckCircle2 className="w-3 h-3" />}
                      {tx.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
