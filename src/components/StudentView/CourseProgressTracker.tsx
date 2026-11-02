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
  LabelList,
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
  ArrowUpRight,
  Target,
  Clock,
  Layers,
  Zap,
  RefreshCw,
  ChevronRight,
  Filter,
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
  agileTotalTasks: number;
  agileCompletedTasks: number;
  agileInProgressTasks: number;
  agileRevisionTasks: number;
  agileTodoTasks: number;
  nextTaskTopic: string;
}

// Subject matching utility connecting enrolled courses with Agile Study Roadmap tasks
const doesTaskMatchCourse = (taskSubject: string, courseName: string, courseCode: string): boolean => {
  const normTask = (taskSubject || '').toLowerCase().trim();
  const normCourse = (courseName || '').toLowerCase().trim();
  const normCode = (courseCode || '').toLowerCase().trim();

  if (normCourse.includes(normTask) || normTask.includes(normCourse)) return true;
  if (normTask.includes('math') || normTask.includes('algebra') || normTask.includes('geom') || normTask.includes('calc')) {
    return normCourse.includes('math') || normCourse.includes('algebra') || normCode.includes('mth');
  }
  if (normTask.includes('physics')) {
    return normCourse.includes('physics') || normCode.includes('phy');
  }
  if (normTask.includes('chem')) {
    return normCourse.includes('chem') || normCode.includes('chm');
  }
  if (normTask.includes('bio')) {
    return normCourse.includes('bio');
  }
  if (normTask.includes('computer') || normTask.includes('code') || normTask.includes('program') || normTask.includes('python')) {
    return normCourse.includes('computer') || normCode.includes('csc');
  }
  if (normTask.includes('history') || normTask.includes('social') || normTask.includes('civic')) {
    return normCourse.includes('history') || normCourse.includes('social') || normCode.includes('his') || normCode.includes('hst');
  }
  if (normTask.includes('english') || normTask.includes('lit')) {
    return normCourse.includes('english') || normCode.includes('eng');
  }
  return false;
};

export const CourseProgressTracker: React.FC = () => {
  const { currentUser, dailyTasks, setStudentNav, sendTutorMessage } = useApp();
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Dynamically compute completion percentages directly from dailyTasks in Agile Study Roadmap
  const coursesData: CourseProgressItem[] = useMemo(() => {
    const rawCourses = currentUser?.enrolledCourses && currentUser.enrolledCourses.length > 0
      ? currentUser.enrolledCourses
      : [
          'Algebra I (MTH-101)',
          'Physics II (PHY-201)',
          'World History (HIS-101)',
          'Chemistry (CHM-101)',
          'English Literature (ENG-201)',
          'Biology (BIO-201)',
        ];

    // Colors aligned to PivotIQ theme (#00A896 primary and harmonic teals/cyan)
    const colorPalette = [
      '#00A896', // Primary Brand Teal
      '#4F46E5', // Indigo Core Math
      '#0284C7', // Sky Blue Physics
      '#10B981', // Emerald Chemistry
      '#F59E0B', // Amber History
      '#059669', // Deep Green Biology
      '#D97706', // Warm Amber English
    ];

    return rawCourses.map((courseStr, index) => {
      let name = courseStr;
      let code = `CRS-10${index + 1}`;
      if (courseStr.includes('(') && courseStr.includes(')')) {
        const parts = courseStr.split('(');
        name = parts[0].trim();
        code = parts[1].replace(')', '').trim();
      }

      // Filter tasks from Agile Study Roadmap that belong to this enrolled course
      const matchingTasks = dailyTasks.filter((t) => doesTaskMatchCourse(t.subject, name, code));

      const agileTotalTasks = matchingTasks.length;
      const agileCompletedTasks = matchingTasks.filter((t) => t.status === 'Completed').length;
      const agileInProgressTasks = matchingTasks.filter((t) => t.status === 'In Progress').length;
      const agileRevisionTasks = matchingTasks.filter((t) => t.status === 'Revision').length;
      const agileTodoTasks = matchingTasks.filter((t) => t.status === 'To Do' || t.status === 'On Hold').length;

      // Find next upcoming task from the Agile Roadmap
      const nextTask = matchingTasks.find((t) => t.status === 'In Progress' || t.status === 'To Do');
      const nextTaskTopic = nextTask ? `${nextTask.topic} (Day ${nextTask.day})` : 'All scheduled roadmap sprint tasks completed!';

      // Baseline syllabus units + sprint tasks
      const totalUnits = Math.max(10, agileTotalTasks + 3);
      const baselineUnits = 3; // Baseline units completed in prior academic terms
      const completedUnits = baselineUnits + agileCompletedTasks;

      // Dynamic reactive percentage calculation:
      // Each status change on the Agile board directly moves the completion score:
      // - Completed: 100% of task weight
      // - Revision: 75% of task weight
      // - In Progress: 45% of task weight
      // - On Hold: 15% of task weight
      // - To Do: 0% of task weight
      let completion = 0;
      if (agileTotalTasks > 0) {
        const totalAgilePoints = matchingTasks.reduce((acc, t) => acc + (t.points || 25), 0);
        const earnedAgilePoints = matchingTasks.reduce((acc, t) => {
          if (t.status === 'Completed') return acc + (t.points || 25);
          if (t.status === 'Revision') return acc + (t.points || 25) * 0.75;
          if (t.status === 'In Progress') return acc + (t.points || 25) * 0.45;
          if (t.status === 'On Hold') return acc + (t.points || 25) * 0.15;
          return acc;
        }, 0);

        // Baseline (25%) + Agile Roadmap contribution (up to 75%)
        const agileRatio = totalAgilePoints > 0 ? earnedAgilePoints / totalAgilePoints : 0;
        const calculatedPct = Math.round(25 + (agileRatio * 75));
        completion = Math.min(100, Math.max(15, calculatedPct));
      } else {
        const normN = name.toLowerCase();
        if (normN.includes('math') || normN.includes('algeb')) completion = currentUser?.mathProgress ?? 85;
        else if (normN.includes('phys')) completion = currentUser?.physicsProgress ?? 75;
        else if (normN.includes('chem')) completion = currentUser?.chemistryProgress ?? 80;
        else if (normN.includes('bio')) completion = currentUser?.biologyProgress ?? 82;
        else if (normN.includes('hist')) completion = currentUser?.historyProgress ?? 78;
        else completion = currentUser?.overallProgress ?? 75;
      }

      let status: 'Completed' | 'On Track' | 'Needs Attention' = 'On Track';
      if (completion >= 90) status = 'Completed';
      else if (completion < 60) status = 'Needs Attention';

      let grade = 'B+';
      if (completion >= 95) grade = 'A+';
      else if (completion >= 85) grade = 'A';
      else if (completion >= 75) grade = 'B+';
      else if (completion >= 65) grade = 'B';
      else grade = 'C+';

      // Truncate name for small screen Y-Axis
      const shortName = name.length > 13 ? `${name.substring(0, 12)}...` : name;

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
        agileTotalTasks,
        agileCompletedTasks,
        agileInProgressTasks,
        agileRevisionTasks,
        agileTodoTasks,
        nextTaskTopic,
      };
    });
  }, [currentUser, dailyTasks]);

  // Overall aggregate completion stats
  const averageCompletion = useMemo(() => {
    if (coursesData.length === 0) return 0;
    const total = coursesData.reduce((acc, curr) => acc + curr.completion, 0);
    return Math.round(total / coursesData.length);
  }, [coursesData]);

  const completedCoursesCount = coursesData.filter((c) => c.completion >= 90).length;

  const totalAgileTasksPlanned = useMemo(() => {
    return coursesData.reduce((sum, c) => sum + c.agileTotalTasks, 0);
  }, [coursesData]);

  const totalAgileTasksCompleted = useMemo(() => {
    return coursesData.reduce((sum, c) => sum + c.agileCompletedTasks, 0);
  }, [coursesData]);

  const isDark = theme === 'dark';

  // Selected course details
  const selectedCourse = useMemo(() => {
    if (!selectedCourseId) return null;
    return coursesData.find((c) => c.id === selectedCourseId) || null;
  }, [coursesData, selectedCourseId]);

  // Smooth scroll helper to Agile Roadmap
  const scrollToAgileRoadmap = () => {
    const el = document.getElementById('agile-roadmap-container') || document.querySelector('.space-y-6');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Custom Recharts Tooltip showing dynamic Agile Roadmap telemetry
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: CourseProgressItem = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#0E1A2D] p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl text-xs space-y-2.5 max-w-xs transition-colors">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-semibold text-slate-900 dark:text-white truncate">
              {data.name}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00A896]/15 text-[#00A896] dark:bg-[#00A896]/20 shrink-0">
              {data.code}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-slate-500 dark:text-white">Current Completion:</span>
            <span className="text-sm font-bold text-[#00A896]">
              {data.completion}%
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#00A896] h-full rounded-full transition-all duration-500"
              style={{ width: `${data.completion}%` }}
            />
          </div>

          {/* Agile Study Roadmap telemetry */}
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#132036] border border-slate-100 dark:border-slate-700/80 space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-700 dark:text-white font-medium">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Agile Tasks:
              </span>
              <span>{data.agileCompletedTasks} of {data.agileTotalTasks} Finished</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-white">
              <span>Sprint in Flight:</span>
              <span>{data.agileInProgressTasks} in progress · {data.agileRevisionTasks} revision</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600 dark:text-white">
            <div>
              <span className="text-slate-400 dark:text-white block text-[10px]">Total Units:</span>
              <span className="dark:text-white font-medium">{data.completedUnits} / {data.totalUnits} Done</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-white block text-[10px]">Academic Mark:</span>
              <span className="font-bold text-slate-900 dark:text-white">{data.grade}</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 dark:text-white">Status:</span>
            <span
              className={`px-1.5 py-0.5 rounded font-bold ${
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
      {/* Top Header Row with Title, Live Agile Sync Badge, and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00A896]/10 text-[#00A896] flex items-center justify-center font-normal">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-normal text-slate-900 dark:text-white tracking-wide">
                  Enrolled Course Completion Tracker
                </h3>
                {/* Live Agile Sync Indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Agile Roadmap Live Sync</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-white mt-0.5">
                Visual progress tracking bars powered by Recharts • Dynamically recalculates as you update task statuses on the Agile Board
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & View Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#00A896]" />
              <span>Chart Bar</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'
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
          <div className="flex items-center justify-between text-slate-500 dark:text-white text-xs">
            <span>Overall Completion</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#00A896]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {averageCompletion}%
            </span>
            <span className="text-[11px] font-bold text-[#00A896]">Live Tracked</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#00A896] h-full rounded-full transition-all duration-500"
              style={{ width: `${averageCompletion}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#132A4C]/50 border border-slate-200/80 dark:border-[#1C3A66] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-white text-xs">
            <span>Agile Roadmap Tasks</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {totalAgileTasksCompleted} / {totalAgileTasksPlanned}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-white">Done</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-white">Real-Time Board Sync</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#132A4C]/50 border border-slate-200/80 dark:border-[#1C3A66] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-white text-xs">
            <span>Mastery Milestone</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {completedCoursesCount} of {coursesData.length}
            </span>
            <span className="text-[11px] font-bold text-emerald-500 dark:text-emerald-400">&gt;90%</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-white">Ready for Certification</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#132A4C]/50 border border-slate-200/80 dark:border-[#1C3A66] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-white text-xs">
            <span>Active Courses</span>
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {coursesData.length}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-white">Subjects</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-white">CBSE/ICSE Aligned</p>
        </div>
      </div>

      {/* Active Selected Course Telemetry Callout */}
      {selectedCourse && (
        <div className="p-3 sm:p-4 rounded-xl bg-teal-50/70 dark:bg-[#0C2A2D] border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedCourse.color }} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">{selectedCourse.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-teal-100 dark:bg-teal-900 text-[#00A896] dark:text-[#4DF0D7]">
                  {selectedCourse.completion}% Completed
                </span>
                <span className="text-[10px] text-slate-500 dark:text-white font-medium">
                  Mark: {selectedCourse.grade}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-white mt-0.5">
                Agile Roadmap: <strong className="text-teal-700 dark:text-teal-300">{selectedCourse.agileCompletedTasks} of {selectedCourse.agileTotalTasks} tasks completed</strong> ({selectedCourse.agileInProgressTasks} in flight, {selectedCourse.agileTodoTasks} to do). Next: {selectedCourse.nextTaskTopic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setStudentNav('ai-tutor');
                sendTutorMessage(`I want to practice more on ${selectedCourse.name}.`);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#00A896] text-white font-bold text-[11px] hover:bg-teal-600 transition-colors cursor-pointer"
            >
              Practice AI Drill
            </button>
            <button
              onClick={() => setSelectedCourseId(null)}
              className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white text-[11px] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Visual Progress View: Recharts Horizontal Bar Chart */}
      {viewMode === 'chart' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white px-1">
            <span className="flex items-center gap-1.5">
              <span>Course Subject</span>
              <span className="text-[10px] text-slate-400 dark:text-white">(Click any bar for Agile breakdown)</span>
            </span>
            <span>Completion Percentage (0–100%)</span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={coursesData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
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
                  tick={{ fill: isDark ? '#FFFFFF' : '#64748B', fontSize: 11 }}
                  axisLine={{ stroke: isDark ? '#334155' : '#CBD5E1' }}
                  tickLine={{ stroke: isDark ? '#334155' : '#CBD5E1' }}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={110}
                  tick={{ fill: isDark ? '#FFFFFF' : '#1E293B', fontSize: 11 }}
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
                  {coursesData.map((entry) => (
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={entry.color}
                      className="hover:opacity-85 transition-opacity cursor-pointer"
                      onClick={() => setSelectedCourseId(entry.id)}
                    />
                  ))}
                  <LabelList
                    dataKey="completion"
                    position="right"
                    fill={isDark ? '#F1F5F9' : '#1E293B'}
                    fontSize={11}
                    fontWeight={700}
                    formatter={(val: any) => `${val}%`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Color Legend & Quick Drill Launch */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              {coursesData.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedCourseId === c.id
                      ? 'bg-slate-100 dark:bg-slate-800 ring-1 ring-[#00A896]'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-white truncate max-w-[120px]">
                    {c.name}
                  </span>
                  <span className="text-[10px] font-bold text-[#00A896]">
                    {c.completion}%
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStudentNav('my-courses')}
              className="text-xs font-bold text-[#00A896] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All Modules</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Detailed Course Progress Cards View with Live Agile Telemetry */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {coursesData.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={`p-4 rounded-xl bg-slate-50 dark:bg-[#132A4C]/40 border space-y-2.5 hover:border-[#00A896]/50 transition-all cursor-pointer ${
                selectedCourseId === course.id
                  ? 'border-[#00A896] ring-1 ring-[#00A896]'
                  : 'border-slate-200/80 dark:border-[#1C3A66]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: course.color }} />
                    <span>{course.name}</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-white block mt-0.5">
                    {course.code} &bull; {course.completedUnits} of {course.totalUnits} Units Finished
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-[#00A896]">
                    {course.completion}%
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
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

              {/* Agile Roadmap Live Telemetry pill */}
              <div className="flex items-center justify-between text-[10px] py-1 px-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-600 dark:text-white font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Agile Roadmap:
                </span>
                <span className="font-bold text-[#00A896]">
                  {course.agileCompletedTasks}/{course.agileTotalTasks} Tasks Done
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 dark:text-white truncate max-w-[200px]" title={course.nextTaskTopic}>
                  Next: {course.nextTaskTopic}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStudentNav('ai-tutor');
                    sendTutorMessage(`I want to practice more on ${course.name}.`);
                  }}
                  className="text-[11px] font-bold text-[#00A896] hover:text-teal-600 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer shrink-0"
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
