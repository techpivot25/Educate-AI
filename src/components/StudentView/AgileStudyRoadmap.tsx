import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyStudyTask, StudyTaskStatus } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Clock,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Plus,
  X,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Target,
  Edit3,
  Trash2,
  Calendar,
  Layers,
  Award,
  Filter,
  Check,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

export const AgileStudyRoadmap: React.FC = () => {
  const {
    dailyTasks,
    setDailyTasks,
    updateStudyTask,
    weeklySprints,
    masterChapters,
    generateStudyPlan,
    exportStudyPlanSpreadsheet,
    setStudentNav,
    sendTutorMessage,
    addNotification,
  } = useApp();

  // Calendar date state (defaults to October 2026)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 9, 1));
  
  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDateStr, setDragOverDateStr] = useState<string | null>(null);

  // View mode switcher: Month (calendar), Week (schedule), Sprint (kanban board)
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week' | 'sprint'>('month');

  // Active status filter: 'ALL' | 'To Do' | 'In Progress' | 'On Hold' | 'Revision' | 'Completed'
  const [activeStatusFilter, setActiveStatusFilter] = useState<'ALL' | StudyTaskStatus>('ALL');

  // Selected task for status and points editor modal
  const [selectedTask, setSelectedTask] = useState<DailyStudyTask | null>(null);

  // New task creation modal state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskDay, setNewTaskDay] = useState<number>(1);
  const [newTaskSubject, setNewTaskSubject] = useState('Algebra I');
  const [newTaskTopic, setNewTaskTopic] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(1.5);
  const [newTaskStatus, setNewTaskStatus] = useState<StudyTaskStatus>('To Do');
  const [newTaskPoints, setNewTaskPoints] = useState(25);
  const [newTaskIsCore, setNewTaskIsCore] = useState(false);

  // Edit task form states
  const [editStatus, setEditStatus] = useState<StudyTaskStatus>('To Do');
  const [editPoints, setEditPoints] = useState<number>(25);
  const [editTopic, setEditTopic] = useState<string>('');
  const [editDuration, setEditDuration] = useState<number>(1.5);
  const [editNotes, setEditNotes] = useState<string>('');

  // Current year & month derivations
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth(); // 0-indexed: 9 = Oct, 10 = Nov
  const currentMonthKey = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
  const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInCurrentMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

  // Navigation handlers for month switcher
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Month-specific tasks: changes whenever the month changes!
  const monthTasks = dailyTasks.filter((t) => {
    if (t.date) {
      return t.date.startsWith(currentMonthKey);
    }
    // Fallback if task lacks full date (matches October if day <= 31)
    return currentMonthIndex === 9 && (t.day || 0) <= 31;
  });

  // Dynamic KPI counts for currently active month
  const todoCount = monthTasks.filter((t) => t.status === 'To Do').length;
  const inProgressCount = monthTasks.filter((t) => t.status === 'In Progress').length;
  const onHoldCount = monthTasks.filter((t) => t.status === 'On Hold').length;
  const revisionCount = monthTasks.filter((t) => t.status === 'Revision').length;
  const completedCount = monthTasks.filter((t) => t.status === 'Completed').length;
  const totalTasks = monthTasks.length;

  // Story Points XP calculations for currently active month
  const totalPoints = monthTasks.reduce((acc, t) => acc + (t.points ?? 20), 0);
  const earnedPoints = monthTasks
    .filter((t) => t.status === 'Completed')
    .reduce((acc, t) => acc + (t.points ?? 20), 0);

  // Drag and drop task reschedule handler
  const handleDropTaskOnDate = (taskId: string, targetDateStr: string, targetDay: number) => {
    const task = dailyTasks.find((t) => t.id === taskId);
    if (!task) return;
    if (task.date === targetDateStr) return; // Dropped on same date

    const updates: Partial<DailyStudyTask> = {
      date: targetDateStr,
      day: targetDay,
    };

    if (updateStudyTask) {
      updateStudyTask(taskId, updates);
    } else {
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      );
    }

    const dateObj = new Date(targetDateStr + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    addNotification(
      'Task Rescheduled 📅',
      `Moved "${task.subject}: ${task.topic}" to ${formattedDate} (${task.points ?? 25} pts).`,
      'success',
      'student'
    );
  };

  // Open task editor
  const handleOpenTask = (task: DailyStudyTask) => {
    setSelectedTask(task);
    setEditStatus(task.status);
    setEditPoints(task.points ?? 20);
    setEditTopic(task.topic);
    setEditDuration(task.duration_hrs);
    setEditNotes(task.notes ?? '');
  };

  // Save task edits
  const handleSaveTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTask) return;

    const previousStatus = selectedTask.status;
    const previousPoints = selectedTask.points ?? 20;

    const updates: Partial<DailyStudyTask> = {
      status: editStatus,
      points: Number(editPoints) || 20,
      topic: editTopic.trim() || selectedTask.topic,
      duration_hrs: Number(editDuration) || selectedTask.duration_hrs,
      notes: editNotes.trim(),
    };

    if (updateStudyTask) {
      updateStudyTask(selectedTask.id, updates);
    } else {
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? { ...t, ...updates } : t))
      );
    }

    if (editStatus === 'Completed' && previousStatus !== 'Completed') {
      addNotification(
        'Task Completed! 🎯',
        `Earned +${editPoints} Study Points for ${selectedTask.subject}: ${selectedTask.topic}!`,
        'success',
        'student'
      );
    } else {
      addNotification(
        'Task Updated',
        `Status set to "${editStatus}" (${editPoints} pts) for ${selectedTask.subject}.`,
        'info',
        'student'
      );
    }

    setSelectedTask(null);
  };

  // Quick inline status change
  const handleQuickStatusChange = (taskId: string, newStatus: StudyTaskStatus) => {
    if (updateStudyTask) {
      updateStudyTask(taskId, { status: newStatus });
    } else {
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    }

    const t = dailyTasks.find((item) => item.id === taskId);
    if (newStatus === 'Completed') {
      addNotification(
        'Task Completed! 🌟',
        `+${t?.points ?? 25} points claimed for ${t?.subject || 'study task'}!`,
        'success',
        'student'
      );
    }
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setDailyTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
    addNotification('Task Removed', 'Study task has been removed from roadmap.', 'info', 'student');
  };

  // Add new task with current month date
  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTopic.trim()) return;

    let color = '#4F46E5';
    if (newTaskSubject === 'Physics') color = '#0284C7';
    else if (newTaskSubject === 'History') color = '#0EA5E9';
    else if (newTaskSubject === 'Chemistry') color = '#10B981';
    else if (newTaskSubject === 'Biology') color = '#059669';

    const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(newTaskDay).padStart(2, '0')}`;

    const newTask: DailyStudyTask = {
      id: `dt-custom-${Date.now()}`,
      day: newTaskDay,
      date: dateStr,
      subject: newTaskSubject,
      topic: newTaskTopic.trim(),
      duration_hrs: Number(newTaskDuration) || 1.5,
      is_core: newTaskIsCore,
      status: newTaskStatus,
      points: Number(newTaskPoints) || 25,
      color,
    };

    setDailyTasks((prev) => [...prev, newTask]);
    setIsNewTaskOpen(false);
    setNewTopicFormDefaults();
    addNotification(
      'Task Added to Roadmap',
      `Scheduled ${newTask.subject} (${newTask.points} pts) on ${currentMonthName} ${newTask.day}.`,
      'success',
      'student'
    );
  };

  const setNewTopicFormDefaults = () => {
    setNewTaskTopic('');
    setNewTaskDuration(1.5);
    setNewTaskStatus('To Do');
    setNewTaskPoints(25);
    setNewTaskIsCore(false);
  };

  // Filter tasks based on activeStatusFilter
  const isTaskVisible = (task: DailyStudyTask) => {
    if (activeStatusFilter === 'ALL') return true;
    return task.status === activeStatusFilter;
  };

  // Helper status color and icon styling
  const getStatusBadge = (status: StudyTaskStatus) => {
    switch (status) {
      case 'Completed':
        return {
          bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
          label: 'Completed',
          chipBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        };
      case 'In Progress':
        return {
          bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
          dot: 'bg-blue-500 animate-pulse',
          icon: <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />,
          label: 'In Progress',
          chipBg: 'bg-[#0284C7] hover:bg-[#0369a1] text-white',
        };
      case 'On Hold':
        return {
          bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          dot: 'bg-amber-500',
          icon: <Pause className="w-3 h-3 text-amber-600 dark:text-amber-400" />,
          label: 'On Hold',
          chipBg: 'bg-amber-600 hover:bg-amber-700 text-white',
        };
      case 'Revision':
        return {
          bg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
          dot: 'bg-purple-500',
          icon: <RotateCcw className="w-3 h-3 text-purple-600 dark:text-purple-400" />,
          label: 'Revision',
          chipBg: 'bg-purple-600 hover:bg-purple-700 text-white',
        };
      case 'To Do':
      default:
        return {
          bg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
          dot: 'bg-slate-400',
          icon: <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />,
          label: 'To Do',
          chipBg: 'bg-[#4F46E5] hover:bg-[#4338ca] text-white',
        };
    }
  };

  // Default day labels when empty
  const getEmptyDayLabel = (day: number) => {
    switch (day) {
      case 2:
        return 'Rest / Prep';
      case 6:
      case 13:
      case 25:
        return 'Self-Study';
      case 7:
      case 14:
      case 21:
      case 28:
        return 'Sprint Review';
      case 9:
        return 'Quiz Prep';
      case 11:
        return 'Sprint Retro';
      case 16:
      case 26:
        return 'Formula Revision';
      case 19:
        return 'Assessment';
      case 20:
        return 'Mock Test';
      case 27:
        return 'Chapter Quiz';
      default:
        return 'Free Study';
    }
  };

  // Dynamic calendar grid calculation for currentMonth and currentYear:
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Mon = 0 ... Sun = 6
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const prevMonthTotalDays = new Date(currentYear, currentMonthIndex, 0).getDate();

  type CalendarCell =
    | { type: 'prev'; day: number; dateStr: string }
    | { type: 'current'; day: number; dateStr: string }
    | { type: 'next'; day: number; dateStr: string };

  const calendarGridCells: CalendarCell[] = [];

  // Previous month leading days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i;
    const prevDate = new Date(currentYear, currentMonthIndex - 1, day);
    const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarGridCells.push({ type: 'prev', day, dateStr });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarGridCells.push({ type: 'current', day: d, dateStr });
  }

  // Next month trailing days to complete 7-day rows (multiples of 7)
  const remainder = calendarGridCells.length % 7;
  const trailingCount = remainder === 0 ? 0 : 7 - remainder;
  for (let n = 1; n <= trailingCount; n++) {
    const nextDate = new Date(currentYear, currentMonthIndex + 1, n);
    const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
    calendarGridCells.push({ type: 'next', day: n, dateStr });
  }

  // Group into weeks
  const calendarWeeks: CalendarCell[][] = [];
  for (let i = 0; i < calendarGridCells.length; i += 7) {
    calendarWeeks.push(calendarGridCells.slice(i, i + 7));
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER: Title, Date navigation & View mode switcher */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Agile Study Roadmap
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
              <Zap className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              Interactive
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            1.5 hrs Daily Core Mathematics + Rotating Electives & Sprint Tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Month Switcher with chevron controls */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[110px] text-center select-none">
              {currentMonthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View switcher: Month | Week | Sprint Kanban */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setCalendarViewMode('month')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                calendarViewMode === 'month'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCalendarViewMode('week')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                calendarViewMode === 'week'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCalendarViewMode('sprint')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                calendarViewMode === 'sprint'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Sprint
            </button>
          </div>

          {/* Add New Task Button */}
          <button
            onClick={() => {
              setNewTaskDay(1);
              setIsNewTaskOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-orange-500/20 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

          {/* Export Spreadsheet button */}
          <button
            onClick={exportStudyPlanSpreadsheet}
            title="Export 3-Sheet Agile Study Plan (.CSV)"
            className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. UNIFIED STATUS FILTER TABS & SPRINT POINTS TRACKER (Clean, Uncluttered, No Repeated Tabs) */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3.5">
        {/* Unified Status Tabs: All, To Do, In Progress, On Hold, Revision, Done */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* ALL TASKS */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStatusFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-2 ring-slate-900/20 dark:ring-white/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>All Tasks</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeStatusFilter === 'ALL'
                  ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {totalTasks}
            </span>
          </button>

          {/* TO DO */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'To Do' ? 'ALL' : 'To Do')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStatusFilter === 'To Do'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs ring-2 ring-slate-400/50'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>To Do</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeStatusFilter === 'To Do'
                  ? 'bg-white/25 dark:bg-slate-900/20 text-white dark:text-slate-900'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {todoCount}
            </span>
          </button>

          {/* IN PROGRESS */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'In Progress' ? 'ALL' : 'In Progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStatusFilter === 'In Progress'
                ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/50'
                : 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>In Progress</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeStatusFilter === 'In Progress'
                  ? 'bg-white/25 text-white'
                  : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
              }`}
            >
              {inProgressCount}
            </span>
          </button>

          {/* ON HOLD */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'On Hold' ? 'ALL' : 'On Hold')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStatusFilter === 'On Hold'
                ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-500/50'
                : 'bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
            }`}
          >
            <Pause className="w-3 h-3 text-amber-500" />
            <span>On Hold</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeStatusFilter === 'On Hold'
                  ? 'bg-white/25 text-white'
                  : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
              }`}
            >
              {onHoldCount}
            </span>
          </button>

          {/* REVISION */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'Revision' ? 'ALL' : 'Revision')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStatusFilter === 'Revision'
                ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-500/50'
                : 'bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50'
            }`}
          >
            <RotateCcw className="w-3 h-3 text-purple-500" />
            <span>Revision</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeStatusFilter === 'Revision'
                  ? 'bg-white/25 text-white'
                  : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
              }`}
            >
              {revisionCount}
            </span>
          </button>

          {/* DONE */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'Completed' ? 'ALL' : 'Completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStatusFilter === 'Completed'
                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/50'
                : 'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Done</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeStatusFilter === 'Completed'
                  ? 'bg-white/25 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {completedCount}
            </span>
          </button>

          {/* Reset filter button if any active status filter is active */}
          {activeStatusFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setActiveStatusFilter('ALL')}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
              title="Show all tasks"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sprint Story Points Progress (Right side, clean & professional) */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0 self-start xl:self-auto">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-[130px] sm:min-w-[150px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-700 dark:text-slate-300">Sprint Points</span>
              <span className="font-black text-amber-600 dark:text-amber-400">
                {earnedPoints} / {totalPoints} pts
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-black text-slate-500 dark:text-slate-400">
            {totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 3. CALENDAR MONTH SPREADSHEET GRID VIEW */}
      {calendarViewMode === 'month' && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Day Header Row (Mon, Tue, Wed, Thu, Fri, Sat, Sun) */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center py-2.5 bg-slate-50/70 dark:bg-slate-800/50 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Dynamic Calendar Grid: Calculated dynamically for current month & year */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {calendarWeeks.map((weekRow, rowIndex) => (
              <div
                key={`cal-week-${rowIndex}`}
                className="grid grid-cols-7 min-h-[110px] divide-x divide-slate-100 dark:divide-slate-800/60"
              >
                {weekRow.map((cell) => {
                  // Non-current month cell (previous or next month)
                  if (cell.type !== 'current') {
                    const isDragTarget = dragOverDateStr === cell.dateStr;
                    return (
                      <div
                        key={`cell-${cell.dateStr}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          if (dragOverDateStr !== cell.dateStr) {
                            setDragOverDateStr(cell.dateStr);
                          }
                        }}
                        onDragLeave={(e) => {
                          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                          if (dragOverDateStr === cell.dateStr) {
                            setDragOverDateStr(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                          if (taskId) {
                            handleDropTaskOnDate(taskId, cell.dateStr, cell.day);
                          }
                          setDraggedTaskId(null);
                          setDragOverDateStr(null);
                        }}
                        className={`p-2 flex flex-col justify-between transition-colors ${
                          isDragTarget
                            ? 'bg-indigo-100/70 dark:bg-indigo-900/50 ring-2 ring-indigo-500 ring-inset'
                            : 'bg-slate-50/40 dark:bg-slate-900/20 text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-600">
                          <span>{cell.day}</span>
                          <span className="text-[9px] uppercase tracking-wider font-semibold">
                            {cell.type === 'prev' ? 'Prev' : 'Next'}
                          </span>
                        </div>
                        {isDragTarget ? (
                          <div className="my-1 py-1 text-center bg-indigo-600 text-white rounded text-[10px] font-bold animate-pulse">
                            Drop to move
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-300 dark:text-slate-700 italic">
                            {cell.type === 'prev' ? 'Prev Month' : 'Next Month'}
                          </span>
                        )}
                      </div>
                    );
                  }

                  // Real Month Day Cell
                  const dayNum = cell.day;
                  const dateStr = cell.dateStr;
                  const isDragTarget = dragOverDateStr === dateStr;

                  // Tasks for this specific day in the selected month
                  const dayTasks = monthTasks.filter((t) => {
                    if (t.date) return t.date === dateStr;
                    return t.day === dayNum;
                  });
                  const visibleTasks = dayTasks.filter(isTaskVisible);
                  const hasTasks = dayTasks.length > 0;
                  const hasMatchingFilterTasks = visibleTasks.length > 0;

                  return (
                    <div
                      key={`cal-day-${dateStr}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverDateStr !== dateStr) {
                          setDragOverDateStr(dateStr);
                        }
                      }}
                      onDragLeave={(e) => {
                        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                        if (dragOverDateStr === dateStr) {
                          setDragOverDateStr(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                        if (taskId) {
                          handleDropTaskOnDate(taskId, dateStr, dayNum);
                        }
                        setDraggedTaskId(null);
                        setDragOverDateStr(null);
                      }}
                      className={`p-2 flex flex-col justify-between transition-all group relative ${
                        isDragTarget
                          ? 'bg-indigo-100/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500 ring-inset shadow-inner'
                          : activeStatusFilter !== 'ALL' && hasMatchingFilterTasks
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/25 ring-1 ring-indigo-500/20'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Day Number Header + Drag drop indicator + Add Task button */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isDragTarget
                              ? 'text-indigo-600 dark:text-indigo-400 font-black'
                              : hasMatchingFilterTasks && activeStatusFilter !== 'ALL'
                              ? 'text-indigo-600 dark:text-indigo-400 font-black'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {dayNum}
                        </span>

                        <div className="flex items-center gap-1">
                          {isDragTarget && (
                            <span className="text-[9px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded shadow-xs animate-pulse">
                              Drop here
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setNewTaskDay(dayNum);
                              setIsNewTaskOpen(true);
                            }}
                            title={`Schedule task on ${currentMonthName} ${dayNum}`}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-opacity cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Day Body Content: Render tasks or empty state */}
                      <div className="my-1 space-y-1.5 flex-1">
                        {visibleTasks.map((task) => {
                          const badge = getStatusBadge(task.status);
                          const isBeingDragged = draggedTaskId === task.id;
                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', task.id);
                                e.dataTransfer.effectAllowed = 'move';
                                setDraggedTaskId(task.id);
                              }}
                              onDragEnd={() => {
                                setDraggedTaskId(null);
                                setDragOverDateStr(null);
                              }}
                              onClick={() => handleOpenTask(task)}
                              title={`Drag to reschedule date, or click to edit status (${task.status}) & points (${task.points || 20} pts)`}
                              className={`p-1.5 rounded-lg text-white text-[10px] font-bold shadow-xs cursor-grab active:cursor-grabbing hover:opacity-90 hover:scale-[1.02] transition-all relative group/card border border-white/10 ${
                                badge.chipBg
                              } ${isBeingDragged ? 'opacity-40 scale-95 ring-2 ring-white' : ''}`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate">{task.subject}</span>
                                <span className="text-[9px] bg-black/25 px-1 rounded font-extrabold flex items-center gap-0.5 shrink-0">
                                  {task.points || 20} pts
                                </span>
                              </div>
                              <div className="text-[9px] text-white/85 font-normal truncate">
                                {task.topic}
                              </div>

                              {/* Task Status Pill Indicator */}
                              <div className="mt-1 flex items-center justify-between text-[8px] text-white/90 font-medium">
                                <span className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                  <span>{task.status}</span>
                                </span>
                                {task.is_core && <span className="text-amber-200">★ Core</span>}
                              </div>
                            </div>
                          );
                        })}

                        {/* If has tasks but none match current filter */}
                        {hasTasks && visibleTasks.length === 0 && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-600 italic py-1 text-center">
                            {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'} (filtered)
                          </div>
                        )}

                        {/* If no scheduled tasks on this day */}
                        {!hasTasks && (
                          <div className="text-[10px] text-slate-300 dark:text-slate-600 italic py-1">
                            {getEmptyDayLabel(dayNum)}
                          </div>
                        )}
                      </div>

                      {/* Day Footer info */}
                      {visibleTasks.length > 0 && (
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold text-right">
                          {visibleTasks.reduce((s, t) => s + (t.duration_hrs || 1.5), 0)}h
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. WEEKLY SPRINT SCHEDULE VIEW */}
      {calendarViewMode === 'week' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Sprint Week Schedule: {currentMonthName} (Days 8 to 14)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Drag tasks between days to rebalance workload. Guaranteed 1.5h core mathematics and electives.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl self-start sm:self-auto border border-indigo-200 dark:border-indigo-800">
                {currentMonthName}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-7 gap-3">
              {[8, 9, 10, 11, 12, 13, 14]
                .filter((d) => d <= daysInCurrentMonth)
                .map((dayNum) => {
                  const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayTasks = monthTasks.filter(
                    (t) => (t.date === dateStr || t.day === dayNum) && isTaskVisible(t)
                  );
                  const isDragTarget = dragOverDateStr === dateStr;

                  return (
                    <div
                      key={`week-day-${dayNum}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverDateStr !== dateStr) setDragOverDateStr(dateStr);
                      }}
                      onDragLeave={(e) => {
                        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                        if (dragOverDateStr === dateStr) setDragOverDateStr(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                        if (taskId) {
                          handleDropTaskOnDate(taskId, dateStr, dayNum);
                        }
                        setDraggedTaskId(null);
                        setDragOverDateStr(null);
                      }}
                      className={`rounded-xl p-3 border transition-all flex flex-col justify-between min-h-[170px] ${
                        isDragTarget
                          ? 'bg-indigo-100/70 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500 ring-inset shadow-inner'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                          <span className={`text-xs font-black ${isDragTarget ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            Day {dayNum}
                          </span>
                          <div className="flex items-center gap-1">
                            {isDragTarget && (
                              <span className="text-[9px] font-black bg-indigo-600 text-white px-1 rounded animate-pulse">
                                Drop
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setNewTaskDay(dayNum);
                                setIsNewTaskOpen(true);
                              }}
                              className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                              title={`Add task for Day ${dayNum}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2.5 space-y-2">
                          {dayTasks.map((task) => {
                            const badge = getStatusBadge(task.status);
                            const isBeingDragged = draggedTaskId === task.id;
                            return (
                              <div
                                key={task.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', task.id);
                                  e.dataTransfer.effectAllowed = 'move';
                                  setDraggedTaskId(task.id);
                                }}
                                onDragEnd={() => {
                                  setDraggedTaskId(null);
                                  setDragOverDateStr(null);
                                }}
                                onClick={() => handleOpenTask(task)}
                                className={`p-2 rounded-lg text-white shadow-xs cursor-grab active:cursor-grabbing hover:opacity-95 transition-all ${
                                  badge.chipBg
                                } ${isBeingDragged ? 'opacity-40 scale-95 ring-2 ring-white' : ''}`}
                              >
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span>{task.subject}</span>
                                  <span className="text-[9px] bg-black/25 px-1 rounded">{task.points || 20} pts</span>
                                </div>
                                <p className="text-[10px] text-white/90 line-clamp-2 mt-0.5">{task.topic}</p>
                                <div className="mt-1.5 pt-1 border-t border-white/20 flex items-center justify-between text-[9px]">
                                  <span className="font-semibold">{task.status}</span>
                                  <span>{task.duration_hrs}h</span>
                                </div>
                              </div>
                            );
                          })}

                          {dayTasks.length === 0 && (
                            <div className="text-xs text-slate-400 dark:text-slate-500 italic py-4 text-center">
                              {getEmptyDayLabel(dayNum)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        Target: 1.5h core practice
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 5. AGILE SPRINT KANBAN BOARD VIEW (To Do, In Progress, On Hold, Revision, Done) */}
      {calendarViewMode === 'sprint' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Agile Sprint Kanban Board ({currentMonthName})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Drag tasks between columns or click to advance through sprint cycles and earn study story points.
                </p>
              </div>

              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                {completedCount} of {totalTasks} Tasks Done ({currentMonthName})
              </div>
            </div>

            {/* 5 Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 mt-5 items-start">
              {(
                [
                  { status: 'To Do', label: 'To Do', color: 'slate', dot: 'bg-slate-400' },
                  { status: 'In Progress', label: 'In Progress', color: 'blue', dot: 'bg-blue-500 animate-pulse' },
                  { status: 'On Hold', label: 'On Hold', color: 'amber', dot: 'bg-amber-500' },
                  { status: 'Revision', label: 'Revision', color: 'purple', dot: 'bg-purple-500' },
                  { status: 'Completed', label: 'Done / Completed', color: 'emerald', dot: 'bg-emerald-500' },
                ] as const
              ).map((column) => {
                const columnTasks = monthTasks.filter((t) => t.status === column.status);
                const colPoints = columnTasks.reduce((s, t) => s + (t.points || 20), 0);

                return (
                  <div
                    key={`col-${column.status}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                      if (taskId) {
                        handleQuickStatusChange(taskId, column.status);
                      }
                      setDraggedTaskId(null);
                    }}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200/70 dark:border-slate-700/60 min-h-[300px] flex flex-col justify-between transition-colors hover:border-indigo-300 dark:hover:border-indigo-700"
                  >
                    <div>
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${column.dot}`} />
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                            {column.label}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-700 dark:text-slate-300 shadow-xs">
                          {columnTasks.length}
                        </span>
                      </div>

                      {/* Column Tasks List */}
                      <div className="mt-3 space-y-2.5">
                        {columnTasks.map((task) => {
                          const badge = getStatusBadge(task.status);
                          const isBeingDragged = draggedTaskId === task.id;
                          return (
                            <div
                              key={`kanban-${task.id}`}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', task.id);
                                e.dataTransfer.effectAllowed = 'move';
                                setDraggedTaskId(task.id);
                              }}
                              onDragEnd={() => setDraggedTaskId(null)}
                              onClick={() => handleOpenTask(task)}
                              className={`bg-white dark:bg-[#111827] rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${
                                isBeingDragged ? 'opacity-40 scale-95 ring-2 ring-indigo-500' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                  {task.subject}
                                </span>
                                <span className="text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/60">
                                  +{task.points || 20} pts
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                                {task.topic}
                              </p>

                              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                                <span>Day {task.day} · {task.duration_hrs}h</span>
                                {task.is_core && (
                                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">Core</span>
                                )}
                              </div>

                              {/* Quick Move Status Buttons */}
                              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1">
                                {column.status !== 'In Progress' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickStatusChange(task.id, 'In Progress');
                                    }}
                                    title="Move to In Progress"
                                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 cursor-pointer"
                                  >
                                    Progress
                                  </button>
                                )}
                                {column.status !== 'Completed' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickStatusChange(task.id, 'Completed');
                                    }}
                                    title="Mark Completed"
                                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer"
                                  >
                                    Done
                                  </button>
                                )}
                                {column.status !== 'Revision' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickStatusChange(task.id, 'Revision');
                                    }}
                                    title="Move to Revision"
                                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 cursor-pointer"
                                  >
                                    Revision
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {columnTasks.length === 0 && (
                          <div className="text-xs text-slate-400 dark:text-slate-500 italic py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                            No tasks in {column.label}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 text-right">
                      Total: {colPoints} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. ACTION FOOTER BAR: Quick links & Recalculate */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Core Math (1.5h)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Physics Lab</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">History Reading</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Completed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">On Hold</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Revision</span>
          </span>
        </div>

        <button
          onClick={() => generateStudyPlan()}
          className="text-xs font-bold text-[#4F46E5] dark:text-[#818CF8] hover:underline cursor-pointer flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalculate AI Sprints</span>
        </button>
      </div>

      {/* 7. INTERACTIVE TASK STATUS & POINTS ("PUBTS") MODAL */}
      {selectedTask && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {selectedTask.subject}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Day {selectedTask.day} · {selectedTask.date}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1.5">
                  Update Task & Status
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              {/* Topic / Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Task Description
                </label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              {/* Status Picker: 5 Choices (In Progress, On Hold, Completed, Revision, To Do) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { status: 'In Progress', icon: <TrendingUp className="w-3.5 h-3.5" />, activeBg: 'bg-blue-600 text-white border-blue-600' },
                      { status: 'On Hold', icon: <Pause className="w-3.5 h-3.5" />, activeBg: 'bg-amber-600 text-white border-amber-600' },
                      { status: 'Completed', icon: <CheckCircle2 className="w-3.5 h-3.5" />, activeBg: 'bg-emerald-600 text-white border-emerald-600' },
                      { status: 'Revision', icon: <RotateCcw className="w-3.5 h-3.5" />, activeBg: 'bg-purple-600 text-white border-purple-600' },
                      { status: 'To Do', icon: <Clock className="w-3.5 h-3.5" />, activeBg: 'bg-slate-700 text-white border-slate-700' },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.status}
                      type="button"
                      onClick={() => setEditStatus(option.status)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        editStatus === option.status
                          ? `${option.activeBg} shadow-xs font-black`
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {option.icon}
                      <span>{option.status}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Points (XP) Stepper & Input */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      Study Points (XP)
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Sprint story points awarded when marked Completed
                    </p>
                  </div>

                  {/* Stepper controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditPoints((prev) => Math.max(5, prev - 5))}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      step={5}
                      value={editPoints}
                      onChange={(e) => setEditPoints(Number(e.target.value) || 20)}
                      className="w-16 text-center py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-black text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setEditPoints((prev) => Math.min(100, prev + 5))}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 text-[11px]">
                  <span className="text-slate-400 font-medium mr-1">Presets:</span>
                  {[10, 15, 20, 25, 30, 50].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setEditPoints(pts)}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        editPoints === pts
                          ? 'bg-amber-500 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-amber-50'
                      }`}
                    >
                      {pts}p
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration (hrs) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    max={6}
                    step={0.5}
                    value={editDuration}
                    onChange={(e) => setEditDuration(Number(e.target.value) || 1.5)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Core Subject
                  </label>
                  <div className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>{selectedTask.is_core ? 'Yes (Daily Core)' : 'Elective'}</span>
                    {selectedTask.is_core && <span className="text-amber-500">★</span>}
                  </div>
                </div>
              </div>

              {/* Study Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Revision Notes / Formula References
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Focus on sign rules when multiplying inequalities..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* AI Doubts Direct Shortcut */}
              <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-xl p-3 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Need guidance on {selectedTask.subject}?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTask(null);
                    setStudentNav('ai-tutor');
                    sendTutorMessage(
                      `I'm currently working on my Agile Roadmap task "${selectedTask.topic}" in ${selectedTask.subject}. Can you give me a key concept overview and 2 practice checkpoints?`
                    );
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Ask AI Tutor →
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs cursor-pointer transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. ADD NEW TASK MODAL */}
      {isNewTaskOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Schedule New Study Task
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Add task to Day {newTaskDay} in October 2026 roadmap.
                </p>
              </div>
              <button
                onClick={() => setIsNewTaskOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Day of Month (1 - 31)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={newTaskDay}
                    onChange={(e) => setNewTaskDay(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Algebra I">Algebra I</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="History">History</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Lesson Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lesson 4: Quadratic Equations & Graphing"
                  value={newTaskTopic}
                  onChange={(e) => setNewTaskTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as StudyTaskStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-medium"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Revision">Revision</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Study Points (XP)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    step={5}
                    value={newTaskPoints}
                    onChange={(e) => setNewTaskPoints(Number(e.target.value) || 25)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newCoreCheckbox"
                  checked={newTaskIsCore}
                  onChange={(e) => setNewTaskIsCore(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="newCoreCheckbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Mark as Core Daily Practice (Guaranteed Daily Sprint block)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs cursor-pointer transition-colors"
                >
                  Add to Roadmap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
