import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Award,
  Sparkles,
  BarChart3,
  Sliders,
  ArrowUpRight,
  Target,
  Clock,
  Layers,
} from 'lucide-react';

interface CourseProgressItem {
  id: string;
  name: string;
  shortName: string;
  code: string;
  completion: number;
  completedUnits: number;
  totalUnits: number;
  grade: string;
  color: string;
  status: 'Completed' | 'On Track' | 'Needs Attention';
}

export const CourseProgressTracker: React.FC = () => {
  const { currentUser, setStudentNav, sendTutorMessage } = useApp();
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Derive courses with realistic completion telemetry based on currentUser progress data
  const coursesData: CourseProgressItem[] = useMemo(() => {
    const rawCourses = currentUser?.enrolledCourses && currentUser.enrolledCourses.length > 0
      ? currentUser.enrolledCourses
      : [
          'Mathematics (MTH-102)',
          'Physics (PHY-101)',
          'Biology (BIO-201)',
          'Chemistry (CHM-101)',
          'Computer Science (CSC-301)',
          'English Literature (ENG-201)',
        ];

    // Colors aligned to PivotIQ theme (#00A896 primary and harmonic teals/cyan)
    const colorPalette = [
      '#00A896', // Primary Brand Teal
      '#028090', // Deep Teal
      '#05668D', // Navy Teal
      '#00C4AF', // Bright Mint Teal
      '#20A39E', // Sea Teal
      '#2EC4B6', // Vibrant Cyan
      '#3A86C8', // Socratic Blue
    ];

    return rawCourses.map((courseStr, index) => {
      let name = courseStr;
      let code = `CRS-10${index + 1}`;
      if (courseStr.includes('(') && courseStr.includes(')')) {
        const parts = courseStr.split('(');
        name = parts[0].trim();
        code = parts[1].replace(')', '').trim();
      }

      // Contextual completion rate
      let completion = 70 + ((index * 13) % 25);
      if (name.toLowerCase().includes('physics')) {
        completion = currentUser?.physicsProgress || 75;
      } else if (name.toLowerCase().includes('math') || name.toLowerCase().includes('algebra')) {
        completion = currentUser?.mathProgress || 92;
      } else if (name.toLowerCase().includes('bio')) {
        completion = currentUser?.biologyProgress || 88;
      } else if (name.toLowerCase().includes('chem')) {
        completion = 68;
      } else if (name.toLowerCase().includes('eng')) {
        completion = 60;
      } else if (name.toLowerCase().includes('comp')) {
        completion = 84;
      }

      // Bound between 10% and 100%
      completion = Math.min(100, Math.max(15, completion));

      const totalUnits = 12 + (index % 5) * 2;
      const completedUnits = Math.round((completion / 100) * totalUnits);
      let status: 'Completed' | 'On Track' | 'Needs Attention' = 'On Track';
      if (completion >= 90) status = 'Completed';
      else if (completion < 65) status = 'Needs Attention';

      let grade = 'B+';
      if (completion >= 90) grade = 'A+';
      else if (completion >= 80) grade = 'A';
      else if (completion >= 70) grade = 'B';
      else grade = 'C+';

      // Truncate name for small screen Y-Axis
      const shortName = name.length > 14 ? `${name.substring(0, 13)}...` : name;

      return {
        id: `course-${index}`,
        name,
        shortName,
        code,
        completion,
        completedUnits,
        totalUnits,
        grade,
        color: colorPalette[index % colorPalette.length],
        status,
      };
    });
  }, [currentUser]);

  // Overall aggregate completion stats
  const averageCompletion = useMemo(() => {
    if (coursesData.length === 0) return 0;
    const total = coursesData.reduce((acc, curr) => acc + curr.completion, 0);
    return Math.round(total / coursesData.length);
  }, [coursesData]);

  const completedCoursesCount = coursesData.filter((c) => c.completion >= 90).length;

  const isDark = theme === 'dark';

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: CourseProgressItem = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#0E1A2D] p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl text-xs space-y-2 max-w-xs transition-colors">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-normal text-slate-900 dark:text-white truncate">
              {data.name}
            </span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#00A896]/15 text-[#00A896] dark:bg-[#00A896]/20 shrink-0">
              {data.code}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-slate-500 dark:text-slate-400">Completion:</span>
            <span className="text-sm font-normal text-[#00A896]">
              {data.completion}%
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#00A896] h-full rounded-full transition-all duration-500"
              style={{ width: `${data.completion}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px]">Units:</span>
              <span>{data.completedUnits} / {data.totalUnits} Done</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Current Mark:</span>
              <span className="font-normal text-slate-900 dark:text-white">{data.grade}</span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Status:</span>
            <span
              className={`px-1.5 py-0.5 rounded ${
                data.status === 'Completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : data.status === 'On Track'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              }`}
            >
              {data.status}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-5 transition-colors">
      {/* Top Header Row with Title, Average Badge, and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00A896]/10 text-[#00A896] flex items-center justify-center font-normal">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-normal text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                <span>Enrolled Course Completion Tracker</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual progress tracking bars powered by Recharts across enrolled subject units
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & View Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-normal ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#00A896]" />
              <span>Chart Bar</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-normal ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#00A896]" />
              <span>Course Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#132A4C]/50 border border-slate-200/80 dark:border-[#1C3A66] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Completion</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#00A896]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-normal text-slate-900 dark:text-white">
              {averageCompletion}%
            </span>
            <span className="text-[11px] text-[#00A896]">On Track</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#00A896] h-full rounded-full transition-all duration-500"
              style={{ width: `${averageCompletion}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#132A4C]/50 border border-slate-200/80 dark:border-[#1C3A66] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Courses</span>
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-normal text-slate-900 dark:text-white">
              {coursesData.length}
            </span>
            <span className="text-[11px] text-slate-500">Subjects</span>
          </div>
          <p className="text-[10px] text-slate-400">CBSE/ICSE Aligned</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#132A4C]/50 border border-slate-200/80 dark:border-[#1C3A66] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Mastery Milestone</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-normal text-slate-900 dark:text-white">
              {completedCoursesCount} of {coursesData.length}
            </span>
            <span className="text-[11px] text-emerald-500">&gt;90%</span>
          </div>
          <p className="text-[10px] text-slate-400">Ready for Certification</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#132A4C]/50 border border-slate-200/80 dark:border-[#1C3A66] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Socratic AI Drills</span>
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-normal text-slate-900 dark:text-white">
              24/7
            </span>
            <span className="text-[11px] text-[#00A896]">Ready</span>
          </div>
          <p className="text-[10px] text-slate-400">Adaptive Practice</p>
        </div>
      </div>

      {/* Main Visual Progress View: Recharts Horizontal Bar Chart */}
      {viewMode === 'chart' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>Course Subject</span>
            <span>Completion Percentage (0–100%)</span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={coursesData}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke={isDark ? '#1E293B' : '#E2E8F0'}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}
                  axisLine={{ stroke: isDark ? '#334155' : '#CBD5E1' }}
                  tickLine={{ stroke: isDark ? '#334155' : '#CBD5E1' }}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={110}
                  tick={{ fill: isDark ? '#E2E8F0' : '#1E293B', fontSize: 11 }}
                  axisLine={{ stroke: isDark ? '#334155' : '#CBD5E1' }}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                />
                <Bar
                  dataKey="completion"
                  radius={[0, 8, 8, 0]}
                  barSize={16}
                  background={{ fill: isDark ? '#132A4C' : '#F1F5F9' }}
                >
                  {coursesData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={entry.color}
                      className="hover:opacity-85 transition-opacity cursor-pointer"
                      onClick={() => setSelectedCourseId(entry.id)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Color Legend & Quick Drill Launch */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              {coursesData.map((c) => (
                <div key={c.id} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-[11px] truncate max-w-[120px]">{c.name}</span>
                  <span className="text-[10px] text-slate-400">({c.completion}%)</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStudentNav('my-courses')}
              className="text-xs font-normal text-[#00A896] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All Modules</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Detailed Course Progress Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {coursesData.map((course) => (
            <div
              key={course.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-[#132A4C]/40 border border-slate-200/80 dark:border-[#1C3A66] space-y-2.5 hover:border-[#00A896]/50 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    {course.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {course.code} &bull; {course.completedUnits} of {course.totalUnits} Units Finished
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-normal text-[#00A896]">
                    {course.completion}%
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded ${
                      course.status === 'Completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400'
                    }`}
                  >
                    {course.grade}
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${course.completion}%`, backgroundColor: course.color }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  {course.status} &bull; Next exam milestone in 4 days
                </span>
                <button
                  onClick={() => {
                    setStudentNav('ai-tutor');
                    sendTutorMessage(`I want to practice more on ${course.name}.`);
                  }}
                  className="text-[11px] font-normal text-[#00A896] hover:text-teal-600 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Practice Drill</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
