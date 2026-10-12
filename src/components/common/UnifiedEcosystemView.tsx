import React from 'react';
import { useApp } from '../../context/AppContext';
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
    setCurrentRole,
    setAdminNav,
    doubts,
    resolveDoubt,
  } = useApp();

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Title matching uploaded image */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Synchronized Cross-Panel Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
          Educate AI Agent: Unified Ecosystem
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Comprehensive Grades 6–12 subject context and real-time event pipeline linking Student, Teacher, and Administrator interfaces.
        </p>
      </div>

      {/* The Three Panels Grid matching the uploaded image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* ======================================================== */}
        {/* 1. STUDENT PORTAL (LEFT CARD) */}
        {/* ======================================================== */}
        <div className="bg-[#0f172a] text-slate-100 rounded-3xl p-5 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="space-y-4">
            {/* Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white">Educate AI Agent</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentRole('student')}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 cursor-pointer"
                >
                  Enter Portal &rarr;
                </button>
              </div>
            </div>

            {/* Sub-Header Label */}
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-indigo-400 block">
              STUDENT PORTAL
            </span>

            {/* Student Profile Card */}
            {(() => {
              const studentUser = usersList.find((u) => u.role === 'student');
              const studentName = currentUser?.role === 'student' ? currentUser.name : (studentUser?.name || 'Sarah Connor');
              const studentAvatar = currentUser?.role === 'student' ? currentUser.avatar : studentUser?.avatar;

              return (
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden shrink-0 border border-indigo-500/40">
                    {studentAvatar ? (
                      <img
                        src={studentAvatar}
                        alt={studentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(studentName)}`}
                        alt={studentName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {studentName}
                    </h4>
                    <p className="text-xs text-indigo-400 font-medium">8th Grade - STEM</p>
                    <p className="text-[10px] text-slate-400">Enrolled: Sep 2025</p>
                  </div>
                </div>
              );
            })()}

            {/* Academic Growth Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  ACADEMIC GROWTH
                </h5>
                <span className="text-slate-500 text-xs">&bull;&bull;&bull;</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[11px] font-bold text-indigo-300 block">
                  My Subjects (Grades 6-12 Context)
                </span>
              </div>

              {/* Scalable list-based view */}
              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-[11px]">Grade 9: </span>
                    <span className="text-[11px] text-slate-300">Algebra I, Biology, World History</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/60 border border-indigo-500/40">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-indigo-400 text-[11px]">Grade 10:</span>
                    <span className="text-[10px] font-bold text-indigo-400">Active</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Physics</span>
                      <span className="text-blue-400 font-bold">75%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>English II</span>
                      <span className="text-purple-400 font-bold">60%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chemistry</span>
                      <span className="text-emerald-400 font-bold">Completed</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-[11px]">Grade 11: </span>
                    <span className="text-[11px] text-slate-300">Calculus, US History</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400">🔒 Enrolled</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-[11px]">Grade 12: </span>
                    <span className="text-[11px] text-slate-300">Literature, Advanced Physics</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">⚙️ Upcoming</span>
                </div>
              </div>

              {/* Browse Full Grades 6-12 Curriculum link */}
              <button
                onClick={() => setIsCurriculumModalOpen(true)}
                className="w-full text-center text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline pt-1 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Browse Full Grades 6-12 Curriculum</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Ask AI Tutor Pill (matching image bottom) */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              ASK AI TUTOR
            </span>
            <button
              onClick={async () => {
                setCurrentRole('student');
                await sendTutorMessage("Help with Newton's 2nd Law of Motion and force acceleration calculations.");
              }}
              className="w-full p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-between shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
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
        <div className="bg-[#faf7f2] text-slate-900 rounded-3xl p-5 border border-amber-200/80 shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="space-y-4">
            {/* Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-xs">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-900">Educate AI Agent</span>
              </div>
              <button
                onClick={() => setCurrentRole('teacher')}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
              >
                Enter Desktop &rarr;
              </button>
            </div>

            {/* Sub-Header Label */}
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-800 block">
              TEACHER DASHBOARD
            </span>

            {/* Teacher Profile Card */}
            <div className="p-3.5 rounded-2xl bg-white border border-amber-200/70 flex items-center gap-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden shrink-0 border border-amber-300">
                <img
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=ProfEliza"
                  alt="Prof. Eliza G."
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">PROF. ELIZA G., Ph.D.</h4>
                <p className="text-[11px] text-amber-800 font-bold uppercase">
                  DEPARTMENT: ALL STEM SUBJECTS (Grades 6-12)
                </p>
              </div>
            </div>

            {/* Current Subject/Grade Context Dropdown Section */}
            <div className="p-4 rounded-2xl bg-white border border-amber-200/70 space-y-3 shadow-xs">
              <div>
                <span className="text-[11px] font-extrabold text-amber-900 uppercase block mb-1">
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
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 text-xs font-bold text-amber-900 focus:outline-none cursor-pointer"
                >
                  <option value="10th Grade Physics">[10th Grade Physics]</option>
                  <option value="6th Grade Math">[6th Grade Math]</option>
                  <option value="12th Grade Calculus">[12th Grade Calculus]</option>
                  <option value="8th Grade Science">[8th Grade Science]</option>
                  <option value="9th Grade Biology">[9th Grade Biology]</option>
                  <option value="full-list">[Full Grades 6-12 List...]</option>
                </select>
              </div>

              {/* Assisted Lesson Plans & Live Video Preview Box */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-amber-900">
                    ASSISTED LESSON PLANS
                  </span>
                  <span className="text-[10px] text-amber-700">Aligned to Context</span>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-amber-200">
                  <img
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80"
                    alt="Live Video"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>LIVE</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    ✔ Clear
                  </div>
                </div>

                {/* Example Task Action Buttons in Chosen Context */}
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => setCurrentRole('teacher')}
                    className="w-full py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] truncate cursor-pointer"
                  >
                    DRAFTING LESSON: {teacherSubjectContext.includes('Biology') ? 'PHOTOSYNTHESIS (Grade 9)' : teacherSubjectContext.includes('Physics') ? "NEWTON'S 2ND LAW (Grade 10)" : 'LINEAR EQUATIONS (Grade 8)'}
                  </button>
                  <button
                    onClick={() => setCurrentRole('teacher')}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-[11px] truncate cursor-pointer hover:bg-amber-50"
                  >
                    NEW QUIZ: {teacherSubjectContext.includes('Biology') ? 'CELL ENERGY (Grade 9)' : teacherSubjectContext.includes('Physics') ? 'VECTOR DYNAMICS (Grade 10)' : 'LINEAR EQUATIONS (Grade 8)'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Class Insights Flagged Doubt Card (matching image bottom) */}
          <div className="p-3.5 rounded-2xl bg-amber-100/80 border border-amber-300 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-amber-900 block">
              CLASS INSIGHTS
            </span>
            <div className="p-2 rounded-xl bg-white border border-amber-200 flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-red-600">⚠️ FLAGGED DOUBT: </span>
                <span className="text-xs font-semibold text-slate-800">Alex R. (Newton's 2nd Law)</span>
                <span className="text-[10px] text-amber-700 italic block">*Review Needed*</span>
              </div>
              <button
                onClick={() => {
                  const d = doubts[0];
                  if (d) resolveDoubt(d.id);
                }}
                className="px-2 py-1 bg-amber-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
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
            {/* Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white">Educate AI Agent</span>
              </div>
              <button
                onClick={() => setCurrentRole('admin')}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 cursor-pointer"
              >
                Enter Admin Hub &rarr;
              </button>
            </div>

            {/* Sub-Header Label */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-cyan-400">
                USER MANAGEMENT
              </span>
              <div className="flex gap-1 text-[10px] font-bold">
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">[STUDENTS]</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">[TEACHERS]</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">[ADMINS]</span>
              </div>
            </div>

            {/* Central Curriculum and Grade Range Control (matching user request & uploaded image) */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div>
                <h5 className="font-bold text-xs text-white">
                  Curriculum and Grade Range Control
                </h5>
                <span className="text-[10px] text-slate-400 block">
                  Global Curriculum and Subject Context Filter
                </span>
              </div>

              {/* Active Grades Filter */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-300 block">
                  Active Grades: [{activeGrades.join(', ')}]
                </span>
                <div className="flex flex-wrap gap-1">
                  {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <button
                      key={g}
                      onClick={() => toggleGradeFilter(g)}
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold cursor-pointer ${
                        activeGrades.includes(g)
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Subjects Filter */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-300 block">
                  Active Subjects: [{activeCategories.join(', ')}]
                </span>
                <div className="flex flex-wrap gap-1">
                  {['STEM', 'Language Arts', 'Humanities', 'Arts & Electives'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategoryFilter(cat)}
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold cursor-pointer ${
                        activeCategories.includes(cat)
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400'
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
                <span className="text-[10px] font-bold text-cyan-400">CREATE NEW USER</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                {usersList.slice(0, 4).map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-slate-300 py-1">
                    <span className="font-semibold text-white truncate max-w-[90px]">{u.name}</span>
                    <span className="text-slate-400 uppercase text-[10px]">{u.role}</span>
                    <span className="text-emerald-400 text-[10px] font-bold">{u.status}</span>
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
                <span className="text-[10px] font-bold uppercase text-cyan-400 block">
                  LIVE MONITORING
                </span>
                <span className="text-[10px] text-slate-400">Connects into live WebRTC camera grid</span>
              </div>
              <button
                onClick={() => {
                  setCurrentRole('admin');
                  setAdminNav('dashboard');
                }}
                className="px-2 py-1 bg-cyan-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
              >
                Feeds &rarr;
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 block">
                  CERTIFICATES
                </span>
                <span className="text-[10px] text-slate-400">Cryptographic verified certificate ledger</span>
              </div>
              <button
                onClick={() => {
                  setCurrentRole('admin');
                  setAdminNav('certificates');
                }}
                className="px-2 py-1 bg-amber-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
              >
                Ledger &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
