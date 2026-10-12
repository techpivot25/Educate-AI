import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  X,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  Check,
  ChevronRight,
  Layers,
  Award,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';

export const CurriculumExplorerModal: React.FC = () => {
  const {
    isCurriculumModalOpen,
    setIsCurriculumModalOpen,
    curriculumList,
    activeGrades,
    setTeacherSubjectContext,
    sendTutorMessage,
    currentRole,
  } = useApp();

  const [selectedGradeTab, setSelectedGradeTab] = useState<number | 'all'>('all');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<any | null>(null);

  if (!isCurriculumModalOpen) return null;

  // Filter list
  const filteredCurriculum = curriculumList.filter((item) => {
    if (selectedGradeTab !== 'all' && item.grade !== selectedGradeTab) return false;
    if (selectedCategoryTab !== 'all' && item.category !== selectedCategoryTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.subjectName.toLowerCase().includes(q);
      const matchCode = item.code.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTopics = item.sampleTopics.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchCode && !matchDesc && !matchTopics) return false;
    }
    return true;
  });

  const grades = [6, 7, 8, 9, 10, 11, 12];
  const categories = ['STEM', 'Language Arts', 'Humanities', 'Arts & Electives'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 transition-colors flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Grades 6–12 Curriculum Repository</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">
                  Global Subject Database
                </span>
              </div>
              <p className="text-xs text-white/80">
                Explore standardized academic frameworks, core competencies, and topic benchmarks across secondary education.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCurriculumModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, subject title, course code (e.g., Photosynthesis, PHY-1001, Calculus)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Grade Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Grade Level:
            </span>
            <button
              onClick={() => setSelectedGradeTab('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedGradeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              All Grades (6–12)
            </button>
            {grades.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGradeTab(g)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedGradeTab === g
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                Grade {g}
              </button>
            ))}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Subject Category:
            </span>
            <button
              onClick={() => setSelectedCategoryTab('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedCategoryTab === 'all'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              All Domains
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategoryTab(c)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedCategoryTab === c
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Modal List Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCurriculum.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
              No curriculum entries matched your criteria. Try adjusting the search query or grade filter.
            </div>
          ) : (
            filteredCurriculum.map((item) => {
              const isStem = item.category === 'STEM';
              const isEla = item.category === 'Language Arts';
              const isHis = item.category === 'Humanities';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {item.gradeLabel}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">
                          {item.code}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isStem
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : isEla
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : isHis
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {item.subjectName}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Sample topics badges */}
                    <div className="pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Core Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.sampleTopics.map((topic, tidx) => (
                          <span
                            key={tidx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            &bull; {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setTeacherSubjectContext(`${item.gradeLabel} ${item.subjectName.split(':')[0]}`);
                        setIsCurriculumModalOpen(false);
                      }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Set as Context</span>
                    </button>

                    <button
                      onClick={async () => {
                        setIsCurriculumModalOpen(false);
                        await sendTutorMessage(
                          `Please explain the foundational concepts of ${item.subjectName} (${item.gradeLabel}) and give me a high-yield study question.`
                        );
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Ask AI Tutor</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Showing {filteredCurriculum.length} of {curriculumList.length} course frameworks
          </span>
          <button
            onClick={() => setIsCurriculumModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
