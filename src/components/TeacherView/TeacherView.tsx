import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
    setIsCurriculumModalOpen,
    doubts,
    resolveDoubt,
    subjectsDB,
    topicsDB,
  } = useApp();

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

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await draftLessonPlan(topic, grade, style);
    if (result) {
      setActivePlanModal(result);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await draftQuiz(quizPrompt);
    if (result) {
      setActiveQuizModal(result);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.75rem)] bg-[#fdfbf7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header matching Ref Image 1 ("Educate AI Agent - A Teacher's Desktop") */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-800/50">
                Educator Portal
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">&bull; Academic Year 2026-2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              A Teacher's Desktop
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-200/60 dark:border-slate-800 shadow-xs">
              <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="Class 7B - Science" className="dark:bg-slate-900">Class 7B - Science (28 Students)</option>
                <option value="Class 8A - Physics" className="dark:bg-slate-900">Class 8A - Physics (32 Students)</option>
                <option value="Class 8C - Adv Biology" className="dark:bg-slate-900">Class 8C - Adv Biology (24 Students)</option>
              </select>
            </div>

            <button
              onClick={() => {
                const sampleQuiz = quizzes[0];
                if (sampleQuiz) publishQuiz(sampleQuiz);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast to Students</span>
            </button>
          </div>
        </div>

        {/* TOP TEACHER PROFILE & SUBJECT/GRADE CONTEXT CARDS (matching Ref Image) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* TEACHER PROFILE CARD */}
          <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-amber-100/80 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Teacher Profile
              </span>
              <span className="text-slate-400">&bull;&bull;&bull;</span>
            </div>
            <div className="flex items-center gap-3.5 pt-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-md flex items-center justify-center text-white text-base font-bold overflow-hidden shrink-0">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt="Teacher Avatar"
                    className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 object-cover"
                  />
                ) : (
                  <img
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=ProfEliza"
                    alt="Teacher Avatar"
                    className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">
                  {currentUser?.name || 'PROF. ELIZA G., Ph.D.'}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wide truncate">
                  {currentUser?.department || 'ALL STEM SUBJECTS (Grades 6-12)'}
                </p>
                <p className="text-[10px] text-slate-400">
                  Assigned Classes: 7B Science, 8A Physics, 10th AP
                </p>
              </div>
            </div>
          </div>

          {/* DEDICATED SUBJECT/GRADE CONTEXT SELECTOR & ACTION CARDS */}
          <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-amber-100/80 dark:border-slate-800 transition-colors space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Current Subject / Grade Context:
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select context to dynamically configure AI lesson plans, quiz prompts, and student monitoring.
                </p>
              </div>

              {/* DEDICATED DROPDOWN SELECTOR (dynamically populated from Admin Curriculum DB) */}
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

                    // Find matching subject in DB
                    const matchedSubj = subjectsDB.find(
                      (s) => `Grade ${s.grade_level} ${s.name}` === val || s.name === val || val.includes(s.name)
                    );
                    if (matchedSubj) {
                      setGrade(`${matchedSubj.grade_level}th`);
                      // Find primary topic for this subject
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
                  className="px-3.5 py-2 rounded-xl border border-amber-300 dark:border-slate-700 bg-amber-50/80 dark:bg-slate-800 text-xs font-bold text-amber-900 dark:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs max-w-xs"
                >
                  {/* Dynamic Active Subjects from Curriculum Manager */}
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

            {/* Context-Driven Assisted Lesson Plans & Live Video Box (matching Ref Image) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Assisted Lesson Plans Info */}
              <div className="sm:col-span-5 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Assisted Lesson Plans
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  High-yield curriculum alignment calibrated to <strong>{teacherSubjectContext}</strong>.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Active: {teacherSubjectContext}
                  </span>
                </div>
              </div>

              {/* Live Preview Box with LIVE and Clear badges */}
              <div className="sm:col-span-3 relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-700 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80"
                  alt="Student video thumbnail"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>LIVE</span>
                </div>
                <div className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <span>✔ Clear</span>
                </div>
              </div>

              {/* Dynamic Action Buttons in Chosen Context (e.g., Drafting Lesson: Photosynthesis Grade 9) */}
              <div className="sm:col-span-4 space-y-2">
                <button
                  onClick={async () => {
                    const ctxTopic = teacherSubjectContext.includes('Biology')
                      ? 'Photosynthesis'
                      : teacherSubjectContext.includes('Physics')
                      ? "Newton's 2nd Law"
                      : teacherSubjectContext.includes('Calculus')
                      ? 'Differential Limits'
                      : 'Linear Equations';
                    const ctxGrade = teacherSubjectContext.includes('9th')
                      ? 'Grade 9'
                      : teacherSubjectContext.includes('10th')
                      ? 'Grade 10'
                      : teacherSubjectContext.includes('12th')
                      ? 'Grade 12'
                      : 'Grade 8';
                    const res = await draftLessonPlan(ctxTopic, ctxGrade, 'Interactive');
                    if (res) setActivePlanModal(res);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-extrabold text-[11px] shadow-sm transition-all cursor-pointer text-center truncate"
                >
                  Drafting Lesson: {teacherSubjectContext.includes('Biology') ? 'Photosynthesis (Grade 9)' : teacherSubjectContext.includes('Physics') ? "Newton's 2nd Law (Grade 10)" : 'Linear Equations (Grade 8)'}
                </button>

                <button
                  onClick={async () => {
                    const qPrompt = teacherSubjectContext.includes('Biology')
                      ? '10-question MCQ quiz on Plant Cell Photosynthesis (Grade 9)'
                      : teacherSubjectContext.includes('Physics')
                      ? "10-question quiz on Newton's Laws and Force Dynamics (Grade 10)"
                      : '8-question quiz on Linear Equations and Slope (Grade 8)';
                    const res = await draftQuiz(qPrompt);
                    if (res) setActiveQuizModal(res);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-[11px] shadow-xs transition-all cursor-pointer text-center truncate"
                >
                  New Quiz: {teacherSubjectContext.includes('Biology') ? 'Cell Energy (Grade 9)' : teacherSubjectContext.includes('Physics') ? 'Newton Dynamics (Grade 10)' : 'Linear Equations (Grade 8)'}
                </button>
              </div>
            </div>

            {/* CLASS INSIGHTS: Flagged Doubt Card (matching Ref Image) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shrink-0">
                    ⚠️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                        Flagged Doubt:
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Alex R. (Newton's 2nd Law)
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 italic">
                        *Review Needed*
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Student asked for step-by-step guidance on force acceleration during midterm prep.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const matchedDoubt = doubts[0];
                    if (matchedDoubt) resolveDoubt(matchedDoubt.id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap"
                >
                  Resolve & Review
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN WORKSPACE GRID matching Ref Image 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 2 COLUMNS: AI Lesson Plan Generator & Quiz Creator */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARD 1: AI Lesson Plan Generator matching Ref Image 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-amber-100/80 dark:border-slate-800 flex flex-col justify-between space-y-5 relative transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                      AI Lesson Plan Generator
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Autonomous curriculum alignment</p>
                  </div>
                </div>

                <form onSubmit={handleGeneratePlan} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Topic</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Photosynthesis"
                      className="w-full bg-[#faf8f5] dark:bg-slate-800 hover:bg-[#f6f2ec] dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Grade</label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full bg-[#faf8f5] dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2.5 rounded-xl border border-amber-200/70 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                      >
                        <option value="6th" className="dark:bg-slate-900">6th</option>
                        <option value="7th" className="dark:bg-slate-900">7th</option>
                        <option value="8th" className="dark:bg-slate-900">8th</option>
                        <option value="9th" className="dark:bg-slate-900">9th</option>
                        <option value="10th" className="dark:bg-slate-900">10th</option>
                        <option value="AP/Honors" className="dark:bg-slate-900">AP / Honors</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Style</label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full bg-[#faf8f5] dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2.5 rounded-xl border border-amber-200/70 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                      >
                        <option value="Interactive" className="dark:bg-slate-900">Interactive</option>
                        <option value="Socratic Inquiry" className="dark:bg-slate-900">Socratic Inquiry</option>
                        <option value="Project-Based" className="dark:bg-slate-900">Project-Based</option>
                        <option value="Remedial Synthesis" className="dark:bg-slate-900">Remedial Synthesis</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isDraftingPlan}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isDraftingPlan ? 'Drafting Curriculum with AI...' : 'Generate Lesson Plan'}</span>
                  </button>
                </form>
              </div>

              {/* AI Drafting Progress Card matching Ref Image 1 */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 space-y-2.5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping"></span>
                    <span>AI Drafting Status</span>
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono font-medium">
                    {isDraftingPlan ? 'Generating...' : 'Ready'}
                  </span>
                </div>

                {/* Animated progress bar */}
                <div className="w-full bg-amber-200/60 dark:bg-amber-900/60 rounded-full h-2 overflow-hidden">
                  <div
                    className={`bg-amber-600 h-full rounded-full transition-all duration-500 ${
                      isDraftingPlan ? 'w-3/4 animate-pulse' : 'w-full'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] text-amber-800 dark:text-amber-300">
                  <div className="flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Objectives</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Activities</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Reading Material</span>
                  </div>
                </div>

                {lessonPlans.length > 0 && (
                  <button
                    onClick={() => setActivePlanModal(lessonPlans[0])}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-slate-750 text-xs font-semibold transition-colors cursor-pointer text-center"
                  >
                    Inspect Generated Plan: "{lessonPlans[0].topic}"
                  </button>
                )}
              </div>
            </div>

            {/* CARD 2: Quiz Creator matching Ref Image 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-100/80 dark:border-slate-800 flex flex-col justify-between space-y-5 transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                      Quiz Creator
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant MCQs & detailed explanations</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateQuiz} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Prompt or Topic Description
                    </label>
                    <textarea
                      rows={5}
                      value={quizPrompt}
                      onChange={(e) => setQuizPrompt(e.target.value)}
                      placeholder="e.g. Draft a 10-question MCQ quiz on Plant Cells"
                      className="w-full bg-[#faf8f5] dark:bg-slate-800 hover:bg-[#f6f2ec] dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs p-3.5 rounded-2xl border border-emerald-200/70 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium resize-none leading-relaxed"
                    />
                  </div>

                  {/* Large Orange Generate Button matching Ref Image 1 */}
                  <button
                    type="submit"
                    disabled={isDraftingQuiz || !quizPrompt.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isDraftingQuiz ? 'AI Generating Assessment...' : 'Generate'}</span>
                  </button>
                </form>
              </div>

              {/* Recent Quizzes List preview */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2 transition-colors">
                <div className="flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300 font-bold">
                  <span>Class Assessments Pool</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400">{quizzes.length} Quizzes</span>
                </div>
                {quizzes.slice(0, 2).map((q) => (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[160px]">
                      <div className="font-semibold text-slate-800 dark:text-white truncate">{q.title}</div>
                      <span className="text-[10px] text-slate-400">{q.questions.length} questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActiveQuizModal(q)}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-medium cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => publishQuiz(q)}
                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium cursor-pointer"
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: My Classes, Student Progress & AI-Powered Suggestions matching Ref Image 1 */}
          <div className="lg:col-span-4 space-y-6">
            {/* My Classes & Dual Wavy Graph matching Ref Image 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-100/80 dark:border-slate-800 space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">My Classes</h3>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                    {selectedClass}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Weekly Trend</span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Student Progress</span>

                {/* SVG Curve Graphs with Green & Orange Curves matching Ref Image 1 */}
                <div className="bg-[#faf8f5] dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 relative">
                  <svg viewBox="0 0 300 100" className="w-full h-24 overflow-visible">
                    <defs>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Subtle grid lines */}
                    <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" className="dark:stroke-slate-700" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" className="dark:stroke-slate-700" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="80" x2="300" y2="80" stroke="#f1f5f9" className="dark:stroke-slate-700" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Green trendline: Class Average */}
                    <path
                      d="M 10 70 Q 50 30, 90 60 T 170 20 T 240 50 T 290 30"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="290" cy="30" r="3.5" fill="#10b981" />

                    {/* Orange trendline: Assessment Retention */}
                    <path
                      d="M 10 90 Q 60 85, 100 50 T 180 80 T 240 60 T 290 45"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="290" cy="45" r="3.5" fill="#f97316" />
                  </svg>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Science Mastery (84%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      Retention Velocity (76%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI-Powered Suggestions matching Ref Image 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-amber-100/80 dark:border-slate-800 space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  AI-Powered Suggestions
                </h3>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  {aiSuggestions.length} Active
                </span>
              </div>

              <div className="space-y-2.5">
                {aiSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="p-3 rounded-2xl bg-[#fdfaf5] dark:bg-slate-850 border border-amber-200/50 dark:border-slate-800 hover:bg-amber-50/50 dark:hover:bg-slate-800 transition-colors space-y-1.5"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <div className="flex-1 text-xs">
                        <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{sug.message}</p>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-amber-100 dark:border-slate-700">
                          <span className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold">{sug.recommendedAction}</span>
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Class Roster & Exam Proctoring Status</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live synchronized tracking across student activity and exam proctoring</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              Showing 6 Core Monitored Students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf8f5] dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
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
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {stu.name.charAt(0)}
                      </div>
                      <div>
                        <div>{stu.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{stu.email}</div>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{stu.grade}</td>
                    <td className="p-3">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                        {stu.attendance}%
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="w-32 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${stu.physicsProgress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">{stu.physicsProgress}%</span>
                    </td>
                    <td className="p-3">
                      {stu.activeProctorStatus === 'Clear' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          Clear
                        </span>
                      ) : stu.activeProctorStatus === 'Head Rotation' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          Head Rotation Flag
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
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
                        className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-semibold text-[11px] transition-colors cursor-pointer border border-amber-200/50 dark:border-amber-800/50"
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

      {/* MODAL: Full Lesson Plan View */}
      {activePlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-amber-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-6 relative text-slate-900 dark:text-white transition-colors">
            <button
              onClick={() => setActivePlanModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-start justify-between border-b border-amber-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-800/50">
                  Lesson Plan &bull; {activePlanModal.grade} Grade
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {activePlanModal.topic} ({activePlanModal.duration})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pedagogical Approach: {activePlanModal.style}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Key Learning Objectives
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  {activePlanModal.learningObjectives?.map((obj: string, i: number) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              {activePlanModal.warmUpActivity && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                    Warm-Up Activity: {activePlanModal.warmUpActivity.title} ({activePlanModal.warmUpActivity.duration})
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">{activePlanModal.warmUpActivity.prompt}</p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Core Classroom Activities
                </h4>
                <div className="space-y-2">
                  {activePlanModal.coreActivities?.map((act: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{act.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-normal">{act.duration}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">{act.description}</p>
                      {act.teacherGuide && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 italic">
                          Teacher Note: {act.teacherGuide}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {activePlanModal.readingMaterial && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">Reading Material Summary:</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{activePlanModal.readingMaterial}</p>
                </div>
              )}

              {activePlanModal.homeworkChallenge && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">Homework Challenge:</span>
                  <p className="text-slate-700 dark:text-slate-300">{activePlanModal.homeworkChallenge}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Plan</span>
              </button>
              <button
                onClick={() => setActivePlanModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-6 relative text-slate-900 dark:text-white transition-colors">
            <button
              onClick={() => setActiveQuizModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="border-b border-emerald-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                Assessment Questions &bull; {activeQuizModal.topic}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{activeQuizModal.title}</h2>
            </div>

            <div className="space-y-4">
              {activeQuizModal.questions?.map((q: any, i: number) => (
                <div key={q.id || i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {i + 1}. {q.question}
                  </div>
                  <div className="space-y-1">
                    {q.options?.map((opt: string, optIdx: number) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-lg border flex items-center justify-between ${
                          optIdx === q.answerIndex
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 font-semibold'
                            : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{opt}</span>
                        {optIdx === q.answerIndex && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Correct Answer</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  publishQuiz(activeQuizModal);
                  setActiveQuizModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Publish to Student Portal</span>
              </button>
              <button
                onClick={() => setActiveQuizModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
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
