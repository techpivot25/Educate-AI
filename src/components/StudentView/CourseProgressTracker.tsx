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
import { useTranslation } from 'react-i18next';
import { translateSubjectLabel, translateBoardLabel, translateStatusLabel } from '../../i18n/helpers';
import { getLocalizedSubjectName, formatEnrolledCourseEntry, resolveSubjectsForBoard } from '../../data/curriculumData';
import { SubjectIcon } from '../common/SubjectIcon';
import { LottieIcon } from '../common/LottieIcon';
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
    return normCourse.includes('computer') || normCode.includes('csc') || normCode.includes('cmp');
  }
  if (normTask.includes('history') || normTask.includes('social') || normTask.includes('civic')) {
    return normCourse.includes('history') || normCourse.includes('social') || normCode.includes('his') || normCode.includes('hst') || normCode.includes('sst');
  }
  if (normTask.includes('geog')) {
    return normCourse.includes('geog') || normCode.includes('geo');
  }
  if (normTask.includes('english') || normTask.includes('lit')) {
    return normCourse.includes('english') || normCode.includes('eng') || normCode.includes('enl');
  }
  if (normTask.includes('hindi') || normTask.includes('sanskrit') || normTask.includes('regional') || normTask.includes('foreign')) {
    return normCourse.includes(normTask.split(' ')[0]);
  }
  return false;
};

export const CourseProgressTracker: React.FC = () => {
  const {
    currentUser,
    dailyTasks,
    setStudentNav,
    sendTutorMessage,
    boardSubjectMappings,
    subjectsDB,
    currentBoard,
    activeCategories,
    setIsProfileOpen,
  } = useApp();
  const { theme } = useTheme();
  const { t } = useTranslation(['student', 'common']);
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('list');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const studentGradeLevel =
    typeof currentUser?.grade_level === 'number'
      ? currentUser.grade_level
      : parseInt(String(currentUser?.grade || '10').replace(/\D/g, '')) || 10;

  // Dynamically compute completion percentages directly from dailyTasks in Agile Study Roadmap
  const coursesData: CourseProgressItem[] = useMemo(() => {
    const liveFallbackCourses = resolveSubjectsForBoard(currentBoard, subjectsDB, boardSubjectMappings)
      .filter((s) => {
        if (s.status !== 'ACTIVE') return false;
        if (s.grade_level !== studentGradeLevel) return false;
        if (activeCategories.length > 0 && s.category && !activeCategories.includes(s.category)) {
          return false;
        }
        return true;
      })
      .slice(0, 6)
      .map((s) => formatEnrolledCourseEntry(getLocalizedSubjectName(s.name, currentBoard), s.code));

    const rawCourses =
      currentUser?.enrolledCourses && currentUser.enrolledCourses.length > 0
        ? currentUser.enrolledCourses
        : liveFallbackCourses;

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
      const matchingTasks = dailyTasks.filter((taskItem) => doesTaskMatchCourse(taskItem.subject, name, code));

      const agileTotalTasks = matchingTasks.length;
      const agileCompletedTasks = matchingTasks.filter((taskItem) => taskItem.status === 'Completed').length;
      const agileInProgressTasks = matchingTasks.filter((taskItem) => taskItem.status === 'In Progress').length;
      const agileRevisionTasks = matchingTasks.filter((taskItem) => taskItem.status === 'Revision').length;
      const agileTodoTasks = matchingTasks.filter((taskItem) => taskItem.status === 'To Do' || taskItem.status === 'On Hold').length;

      // Find next upcoming task from the Agile Roadmap
      const nextTask = matchingTasks.find((taskItem) => taskItem.status === 'In Progress' || taskItem.status === 'To Do');
      const nextTaskTopic = nextTask
        ? t('student:courses.dayLabel', { topic: nextTask.topic, day: nextTask.day })
        : t('student:courses.allSprintDone');

      // Baseline syllabus units + sprint tasks
      const totalUnits = Math.max(10, agileTotalTasks + 3);
      const baselineUnits = 3; // Baseline units completed in prior academic terms
      const completedUnits = baselineUnits + agileCompletedTasks;

      // Dynamic reactive percentage calculation:
      let completion = 0;
      if (agileTotalTasks > 0) {
        const totalAgilePoints = matchingTasks.reduce((acc, taskItem) => acc + (taskItem.points || 25), 0);
        const earnedAgilePoints = matchingTasks.reduce((acc, taskItem) => {
          if (taskItem.status === 'Completed') return acc + (taskItem.points || 25);
          if (taskItem.status === 'Revision') return acc + (taskItem.points || 25) * 0.75;
          if (taskItem.status === 'In Progress') return acc + (taskItem.points || 25) * 0.45;
          if (taskItem.status === 'On Hold') return acc + (taskItem.points || 25) * 0.15;
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

      const displayName = translateSubjectLabel(name, t);
      // Truncate name for small screen Y-Axis
      const shortName = displayName.length > 13 ? `${displayName.substring(0, 12)}...` : displayName;

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
  }, [currentUser, dailyTasks, subjectsDB, boardSubjectMappings, studentGradeLevel, currentBoard, activeCategories, t]);

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
            <span className="font-normal text-slate-900 dark:text-white truncate">
              {translateSubjectLabel(data.name, t)}
            </span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#00A896]/15 text-[#00A896] dark:bg-[#00A896]/20 shrink-0">
              {data.code}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-slate-500 dark:text-white">{t('student:courses.currentCompletion')}</span>
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

          {/* Agile Study Roadmap telemetry */}
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#132036] border border-slate-100 dark:border-slate-700/80 space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-700 dark:text-white font-medium">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                {t('student:courses.agileTasks')}
              </span>
              <span>{t('student:courses.finishedCount', { done: data.agileCompletedTasks, total: data.agileTotalTasks })}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-white">
              <span>{t('student:courses.sprintInFlight')}</span>
              <span>{t('student:courses.inFlightRevision', { inProgress: data.agileInProgressTasks, revision: data.agileRevisionTasks })}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600 dark:text-white">
            <div>
              <span className="text-slate-400 dark:text-white block text-[10px]">{t('student:courses.totalUnitsLabel')}</span>
              <span className="dark:text-white font-normal">{t('student:courses.doneShortRatio', { done: data.completedUnits, total: data.totalUnits })}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-white block text-[10px]">{t('student:courses.academicMarkLabel')}</span>
              <span className="font-normal text-slate-900 dark:text-white">{data.grade}</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 dark:text-white">{t('student:courses.statusLabel')}</span>
            <span
              className={`px-1.5 py-0.5 rounded font-normal ${
                data.status === 'Completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : data.status === 'On Track'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              }`}
            >
              {translateStatusLabel(data.status, t)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="font-lollipop-regular bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-5 transition-colors h-full flex flex-col justify-between">
      {/* Top Header Row with Title, Live Agile Sync Badge, and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00A896]/10 text-[#00A896] flex items-center justify-center font-normal shrink-0">
              <LottieIcon
                kind="nav"
                name="barchart"
                colorHex="#00A896"
                sizeClass="w-4 h-4"
                playMode="always"
                fallback={<BarChart3 className="w-4 h-4" />}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-normal text-slate-900 dark:text-white tracking-wide">
                  {t('student:courses.title')}
                </h3>
                {/* Live Agile Sync Indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-normal text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>{t('student:courses.agileLiveSync')}</span>
                </div>
              </div>
              <p className="text-xs font-normal text-slate-500 dark:text-white mt-0.5">
                {t('student:courses.chartSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & View Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs whitespace-nowrap">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-normal whitespace-nowrap shrink-0 ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#00A896] shrink-0" />
              <span>{t('student:courses.chartBar')}</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-normal whitespace-nowrap shrink-0 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#00A896] shrink-0" />
              <span>{t('student:courses.courseCards')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-200/55 dark:bg-[#132A4C]/70 border border-slate-200/90 dark:border-[#1C3A66] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-white text-xs">
            <span>{t('student:courses.overallCompletion')}</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#00A896]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-normal text-slate-900 dark:text-white">
              {averageCompletion}%
            </span>
            <span className="text-[11px] font-normal text-[#00A896]">{t('student:courses.liveTracked')}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#00A896] h-full rounded-full transition-all duration-500"
              style={{ width: `${averageCompletion}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-200/55 dark:bg-[#132A4C]/70 border border-slate-200/90 dark:border-[#1C3A66] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-white text-xs">
            <span>{t('student:courses.agileRoadmapTasks')}</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-normal text-slate-900 dark:text-white">
              {totalAgileTasksCompleted} / {totalAgileTasksPlanned}
            </span>
            <span className="text-[11px] font-normal text-slate-500 dark:text-white">{t('student:courses.done')}</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-white">{t('student:courses.realTimeBoardSync')}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-200/55 dark:bg-[#132A4C]/70 border border-slate-200/90 dark:border-[#1C3A66] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-white text-xs">
            <span>{t('student:courses.masteryMilestone')}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-normal text-slate-900 dark:text-white">
              {t('student:courses.ofCount', { done: completedCoursesCount, total: coursesData.length })}
            </span>
            <span className="text-[11px] font-normal text-emerald-500 dark:text-emerald-400">&gt;90%</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-white">{t('student:courses.readyForCert')}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-200/55 dark:bg-[#132A4C]/70 border border-slate-200/90 dark:border-[#1C3A66] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-white text-xs">
            <span>{t('student:courses.activeCourses')}</span>
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-normal text-slate-900 dark:text-white">
              {coursesData.length}
            </span>
            <span className="text-[11px] font-normal text-slate-500 dark:text-white">{t('student:courses.subjectsWord')}</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 dark:text-white">{t('student:courses.boardAligned', { board: translateBoardLabel(currentBoard, t) })}</span>
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="text-[#00A896] hover:underline font-normal cursor-pointer"
            >
              {t('student:courses.selectBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* Active Selected Course Telemetry Callout */}
      {selectedCourse && (
        <div className="p-3 sm:p-4 rounded-xl bg-teal-50/70 dark:bg-[#0C2A2D] border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <SubjectIcon subject={selectedCourse.name} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-normal text-slate-900 dark:text-white">{translateSubjectLabel(selectedCourse.name, t)}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-normal bg-teal-100 dark:bg-teal-900 text-[#00A896] dark:text-[#4DF0D7]">
                  {t('student:courses.completedPct', { pct: selectedCourse.completion })}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-white font-normal">
                  {t('student:courses.markLabel', { grade: selectedCourse.grade })}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-white mt-0.5">
                {t('student:courses.agileRoadmapPrefix')} <span className="font-normal text-teal-700 dark:text-teal-300">{t('student:courses.agileBreakdownBanner', { done: selectedCourse.agileCompletedTasks, total: selectedCourse.agileTotalTasks })}</span> {t('student:courses.agileFlightTodo', { inProgress: selectedCourse.agileInProgressTasks, todo: selectedCourse.agileTodoTasks, next: selectedCourse.nextTaskTopic })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setStudentNav('ai-tutor');
                sendTutorMessage(t('student:courses.practiceDrillPrompt', { course: translateSubjectLabel(selectedCourse.name, t) }));
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#00A896] text-white font-normal text-[11px] hover:bg-teal-600 transition-colors cursor-pointer"
            >
              {t('student:courses.practiceAiDrill')}
            </button>
            <button
              onClick={() => setSelectedCourseId(null)}
              className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white text-[11px] cursor-pointer"
            >
              {t('common:actions.dismiss')}
            </button>
          </div>
        </div>
      )}

      {/* Main Visual Progress View: Recharts Horizontal Bar Chart */}
      {viewMode === 'chart' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white px-1">
            <span className="flex items-center gap-1.5">
              <span>{t('student:courses.courseSubject')}</span>
              <span className="text-[10px] text-slate-400 dark:text-white">{t('student:courses.clickBarHint')}</span>
            </span>
            <span>{t('student:courses.completionPctAxis')}</span>
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
                    fontWeight={400}
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
                  <SubjectIcon subject={c.name} size="xs" />
                  <span className="text-[11px] font-normal text-slate-700 dark:text-white truncate max-w-[120px]">
                    {translateSubjectLabel(c.name, t)}
                  </span>
                  <span className="text-[10px] font-normal text-[#00A896]">
                    {c.completion}%
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStudentNav('my-courses')}
              className="text-xs font-normal text-[#00A896] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('student:courses.exploreAllModules')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Detailed Course Progress Cards View with Live Agile Telemetry */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white flex items-center gap-2">
                    <SubjectIcon subject={course.name} size="md" />
                    <span>{translateSubjectLabel(course.name, t)}</span>
                  </h4>
                  <span className="text-[10px] font-normal text-slate-500 dark:text-white block mt-0.5">
                    {t('student:courses.unitsFinishedLine', { code: course.code, done: course.completedUnits, total: course.totalUnits })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-normal text-[#00A896]">
                    {course.completion}%
                  </span>
                  <span
                    className={`text-[9px] font-normal px-1.5 py-0.5 rounded ${
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
                <span className="text-slate-600 dark:text-white font-normal flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  {t('student:courses.agileRoadmapPrefix')}
                </span>
                <span className="font-normal text-[#00A896]">
                  {t('student:courses.tasksDoneCount', { done: course.agileCompletedTasks, total: course.agileTotalTasks })}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-normal text-slate-400 dark:text-white truncate max-w-[200px]" title={course.nextTaskTopic}>
                  {t('student:courses.nextPrefix', { topic: course.nextTaskTopic })}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStudentNav('ai-tutor');
                    sendTutorMessage(t('student:courses.practiceDrillPrompt', { course: translateSubjectLabel(course.name, t) }));
                  }}
                  className="text-[11px] font-normal text-[#00A896] hover:text-teal-600 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>{t('student:courses.practiceDrillBtn')}</span>
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
