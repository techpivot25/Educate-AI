import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DBSubject, DBTopic } from '../../types';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Filter,
  Search,
  Radio,
  FileText,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export const CurriculumTopicManager: React.FC = () => {
  const {
    subjectsDB,
    topicsDB,
    createSubject,
    updateSubject,
    deleteSubject,
    createTopic,
    updateTopic,
    deleteTopic,
    isCurriculumSyncing,
  } = useApp();

  // Selected subject for topics drill-down
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjectsDB[0]?.id || 'subj-1');
  const [gradeFilter, setGradeFilter] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Subject Modal / Form state
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjGrade, setNewSubjGrade] = useState<number>(10);
  const [newSubjCategory, setNewSubjCategory] = useState<'STEM' | 'Language Arts' | 'Humanities' | 'Arts & Electives'>('STEM');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjDesc, setNewSubjDesc] = useState('');
  const [isSubmittingSubject, setIsSubmittingSubject] = useState(false);

  // Add Topic Form state
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);

  // Editing states
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjName, setEditSubjName] = useState('');
  const [editSubjGrade, setEditSubjGrade] = useState<number>(10);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editTopicTitle, setEditTopicTitle] = useState('');

  const selectedSubject = subjectsDB.find((s) => s.id === selectedSubjectId) || subjectsDB[0];
  const activeTopicsForSelected = topicsDB.filter((t) => t.subject_id === selectedSubject?.id);

  // Filtered subjects
  const filteredSubjects = subjectsDB.filter((s) => {
    const matchesGrade = gradeFilter === 'ALL' || s.grade_level === gradeFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGrade && matchesSearch;
  });

  const handleCreateSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    setIsSubmittingSubject(true);
    const created = await createSubject({
      name: newSubjName.trim(),
      grade_level: newSubjGrade,
      category: newSubjCategory,
      code: newSubjCode.trim() || undefined,
      description: newSubjDesc.trim() || undefined,
      status: 'ACTIVE',
    });
    setIsSubmittingSubject(false);
    if (created) {
      setSelectedSubjectId(created.id);
      setIsAddingSubject(false);
      setNewSubjName('');
      setNewSubjCode('');
      setNewSubjDesc('');
    }
  };

  const handleCreateTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !selectedSubject) return;
    setIsSubmittingTopic(true);
    await createTopic({
      subject_id: selectedSubject.id,
      title: newTopicTitle.trim(),
      description: newTopicDesc.trim() || undefined,
      status: 'ACTIVE',
    });
    setIsSubmittingTopic(false);
    setIsAddingTopic(false);
    setNewTopicTitle('');
    setNewTopicDesc('');
  };

  const toggleSubjectStatus = async (subject: DBSubject) => {
    const nextStatus = subject.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateSubject(subject.id, { status: nextStatus });
  };

  const toggleTopicStatus = async (topic: DBTopic) => {
    const nextStatus = topic.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateTopic(topic.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Live Sync Badge & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-cyan-900/10 via-indigo-900/5 to-transparent p-4 rounded-2xl border border-cyan-200 dark:border-cyan-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Curriculum & Topic Manager
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                Live WebSocket Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Any subject or topic added here automatically syncs across the Student Portal (Quick Doubts) and Teacher Studio in real time.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingSubject(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* FILTER BAR: Grade Selection & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Grade:</span>
          </span>
          <button
            onClick={() => setGradeFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              gradeFilter === 'ALL'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-cyan-400'
            }`}
          >
            All (6–12)
          </button>
          {[6, 7, 8, 9, 10, 11, 12].map((g) => (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                gradeFilter === g
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-cyan-400'
              }`}
            >
              Gr. {g}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* 2-COLUMN VIEW: Left = Subjects Master List, Right = Topics & Sub-topics Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Subjects Master List */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131d33] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Course Subjects ({filteredSubjects.length})
              </h4>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Click to manage topics
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[560px] overflow-y-auto">
            {filteredSubjects.map((subj) => {
              const isSelected = selectedSubject?.id === subj.id;
              const topicCount = topicsDB.filter((t) => t.subject_id === subj.id).length;

              return (
                <div
                  key={subj.id}
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-50/80 dark:bg-cyan-950/40 border-l-4 border-cyan-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {subj.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Gr. {subj.grade_level}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSubjectStatus(subj);
                        }}
                        title={subj.status === 'ACTIVE' ? 'Mark Inactive' : 'Mark Active'}
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase transition-colors ${
                          subj.status === 'ACTIVE'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {subj.status}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-mono text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold">
                        {subj.code}
                      </span>
                      <span>&bull;</span>
                      <span>{topicCount} Topics</span>
                      <span>&bull;</span>
                      <span>{subj.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleSubjectStatus(subj)}
                      title={`Toggle ${subj.status === 'ACTIVE' ? 'Inactive' : 'Active'}`}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                    >
                      {subj.status === 'ACTIVE' ? (
                        <ToggleRight className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete subject "${subj.name}" and all associated topics?`)) {
                          deleteSubject(subj.id);
                        }
                      }}
                      title="Delete subject"
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className={`w-4 h-4 text-slate-400 ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Topics & Sub-topics Manager for Selected Subject */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131d33] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4 p-5">
          {selectedSubject ? (
            <>
              {/* Active Subject Details Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
                      Grade {selectedSubject.grade_level} &bull; {selectedSubject.category}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        selectedSubject.status === 'ACTIVE'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400'
                      }`}
                    >
                      {selectedSubject.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mt-1">
                    {selectedSubject.name} — Topics & Units
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedSubject.description}
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingTopic(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Topic</span>
                </button>
              </div>

              {/* Form to add a new topic */}
              {isAddingTopic && (
                <form
                  onSubmit={handleCreateTopicSubmit}
                  className="p-4 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                      New Topic under {selectedSubject.name}
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddingTopic(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Topic Title (e.g., "Renewable Energy", "Electromagnetism")
                    </label>
                    <input
                      type="text"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder="Enter topic title..."
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Description & Scope
                    </label>
                    <input
                      type="text"
                      value={newTopicDesc}
                      onChange={(e) => setNewTopicDesc(e.target.value)}
                      placeholder="Brief summary of sub-concepts..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingTopic(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTopicTitle.trim() || isSubmittingTopic}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      Save & Broadcast Topic
                    </button>
                  </div>
                </form>
              )}

              {/* Topics List */}
              <div className="space-y-2.5">
                {activeTopicsForSelected.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto opacity-60" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      No topics added for this subject yet.
                    </p>
                    <button
                      onClick={() => setIsAddingTopic(true)}
                      className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      + Add the first unit topic
                    </button>
                  </div>
                ) : (
                  activeTopicsForSelected.map((topic, idx) => (
                    <div
                      key={topic.id}
                      className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-400/50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            Unit {idx + 1}
                          </span>
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {topic.title}
                          </h5>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                              topic.status === 'ACTIVE'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400'
                            }`}
                          >
                            {topic.status}
                          </span>
                        </div>
                        {topic.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {topic.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleTopicStatus(topic)}
                          title={`Toggle ${topic.status === 'ACTIVE' ? 'Inactive' : 'Active'}`}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors cursor-pointer"
                        >
                          {topic.status === 'ACTIVE' ? (
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete topic "${topic.title}"?`)) {
                              deleteTopic(topic.id);
                            }
                          }}
                          title="Delete topic"
                          className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select a subject from the left panel to manage its topics.
            </div>
          )}
        </div>
      </div>

      {/* CREATE SUBJECT MODAL */}
      {isAddingSubject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131d33] text-slate-800 dark:text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-600" />
                <h3 className="font-extrabold text-base">Add New Subject</h3>
              </div>
              <button
                onClick={() => setIsAddingSubject(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name * (e.g., Quantum Physics, Environmental Science)
                </label>
                <input
                  type="text"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="e.g., Environmental Science"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grade Level (6–12) *
                  </label>
                  <select
                    value={newSubjGrade}
                    onChange={(e) => setNewSubjGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department Category
                  </label>
                  <select
                    value={newSubjCategory}
                    onChange={(e) => setNewSubjCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option value="STEM">STEM</option>
                    <option value="Language Arts">Language Arts</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Arts & Electives">Arts & Electives</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Course Code (Optional)
                </label>
                <input
                  type="text"
                  value={newSubjCode}
                  onChange={(e) => setNewSubjCode(e.target.value)}
                  placeholder="e.g., ENV-301 (Auto-generated if empty)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Syllabus Focus
                </label>
                <textarea
                  rows={2}
                  value={newSubjDesc}
                  onChange={(e) => setNewSubjDesc(e.target.value)}
                  placeholder="Brief curriculum overview..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSubjName.trim() || isSubmittingSubject}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  Publish Subject & Sync Real-Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
