import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { DailyStudyTask, StudyTaskStatus } from '../../types';
import { getLocalizedSubjectName, isSubjectEnrolled, resolveSubjectsForBoard } from '../../data/curriculumData';
import { translateSubjectLabel, translateBoardLabel, translateStatusLabel } from '../../i18n/helpers';
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
  Download,
  Mail,
  WifiOff,
  Flag,
  Upload,
  FileText,
  Code2,
  Link2,
} from 'lucide-react';
import { OfflineStudyPackModal } from './OfflineStudyPackModal';
import { ParentWeeklyDigestModal } from './ParentWeeklyDigestModal';
import { SubjectIcon } from '../common/SubjectIcon';

export const AgileStudyRoadmap: React.FC = () => {
  const {
    dailyTasks,
    setDailyTasks,
    updateStudyTask,
    addStudyTask,
    deleteStudyTask,
    submitTaskDeliverable,
    weeklySprints,
    masterChapters,
    generateStudyPlan,
    exportStudyPlanSpreadsheet,
    setStudentNav,
    sendTutorMessage,
    addNotification,
    boardSubjectMappings,
    subjectsDB,
    topicsDB,
    currentBoard,
    currentUser,
    activeCategories,
  } = useApp();
  const { t, i18n } = useTranslation(['student', 'common']);
  const intlLocale = i18n.language === 'en' ? 'en-US' : `${i18n.language}-IN`;

  // Selected day state (defaults to today so Day view immediately shows current day's tasks)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  // Calendar date state (defaults to current month)
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  
  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDateStr, setDragOverDateStr] = useState<string | null>(null);

  // View mode switcher: Sprint (kanban board), Month (calendar), Week (schedule), Day (daily tasks)
  const [calendarViewMode, setCalendarViewMode] = useState<'sprint' | 'month' | 'week' | 'day'>('sprint');

  // Active status filter: 'ALL' | 'To Do' | 'In Progress' | 'On Hold' | 'Revision' | 'Completed'
  const [activeStatusFilter, setActiveStatusFilter] = useState<'ALL' | StudyTaskStatus>('ALL');
  // Active subject filter: 'ALL' | subject name
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('ALL');

  // Selected task for status and points editor modal
  const [selectedTask, setSelectedTask] = useState<DailyStudyTask | null>(null);

  // Offline Pack & Parental Digest Modals
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isParentDigestOpen, setIsParentDigestOpen] = useState(false);

  // Derive student's active grade and live curriculum subjects for dropdowns
  const studentGradeLevel =
    typeof currentUser?.grade_level === 'number'
      ? currentUser.grade_level
      : parseInt(String(currentUser?.grade || '10').replace(/\D/g, '')) || 10;

  const gradeBoardSubjects = useMemo(() => {
    const resolved = resolveSubjectsForBoard(currentBoard, subjectsDB, boardSubjectMappings).filter(
      (s) => s.status === 'ACTIVE'
    );
    const filtered = resolved.filter((s) => {
      if (s.grade_level !== studentGradeLevel) return false;
      if (activeCategories.length > 0 && s.category && !activeCategories.includes(s.category)) {
        return false;
      }
      return true;
    });
    return filtered.length > 0 ? filtered : resolved;
  }, [subjectsDB, boardSubjectMappings, studentGradeLevel, currentBoard, activeCategories]);

  const { enrolledSubjectNames, otherSubjectNames, allDropdownSubjectNames } = useMemo(() => {
    const enrolled: string[] = [];
    const others: string[] = [];
    const seen = new Set<string>();

    gradeBoardSubjects.forEach((subj) => {
      const displayName = getLocalizedSubjectName(subj.name, currentBoard);
      if (seen.has(displayName)) return;
      seen.add(displayName);
      if (isSubjectEnrolled(subj, currentUser?.enrolledCourses, currentBoard)) {
        enrolled.push(displayName);
      } else {
        others.push(displayName);
      }
    });

    // Also include any subject names present in current dailyTasks that aren't in the catalog yet
    dailyTasks.forEach((t) => {
      if (t.subject && !seen.has(t.subject)) {
        seen.add(t.subject);
        others.push(t.subject);
      }
    });

    return {
      enrolledSubjectNames: enrolled,
      otherSubjectNames: others,
      allDropdownSubjectNames: [...enrolled, ...others],
    };
  }, [gradeBoardSubjects, currentBoard, currentUser?.enrolledCourses, dailyTasks]);

  // Helper to format 24h HH:MM string into readable 12h AM/PM time
  const formatStudyTime = (timeStr?: string): string => {
    if (!timeStr || !timeStr.includes(':')) return '';
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10) || 0;
    if (Number.isNaN(h)) return '';
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  };

  const formatStudyWindow = (timeStr?: string, durationHrs = 1.5): string => {
    if (!timeStr || !timeStr.includes(':')) return '';
    const [hStr, mStr] = timeStr.split(':');
    const startMins = (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0);
    const endMins = (startMins + Math.round(durationHrs * 60)) % (24 * 60);
    const endH = Math.floor(endMins / 60);
    const endM = endMins % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    return `${formatStudyTime(timeStr)} – ${formatStudyTime(endTimeStr)}`;
  };

  // New task creation modal state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskDay, setNewTaskDay] = useState<number>(() => new Date().getDate());
  const [newTaskDateStr, setNewTaskDateStr] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [pickerCalendarDate, setPickerCalendarDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [newTaskTime, setNewTaskTime] = useState<string>('16:30');
  const [newTaskSubject, setNewTaskSubject] = useState<string>(
    enrolledSubjectNames[0] || allDropdownSubjectNames[0] || 'Mathematics'
  );
  const [newTaskTopic, setNewTaskTopic] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(1.5);
  const [newTaskStatus, setNewTaskStatus] = useState<StudyTaskStatus>('To Do');
  const [newTaskPoints, setNewTaskPoints] = useState(25);
  const [newTaskIsCore, setNewTaskIsCore] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState<'Normal' | 'High'>('Normal');
  const [newTaskIsCustom, setNewTaskIsCustom] = useState(false);
  const [newTaskCustomCategory, setNewTaskCustomCategory] = useState<
    'Custom Task' | 'Side Project' | 'Self-Paced Milestone'
  >('Custom Task');

  // Deliverable submission form states for Selected Task modal (Module 2)
  const [subType, setSubType] = useState<'Code' | 'Document' | 'Link' | 'Note'>('Code');
  const [subTitle, setSubTitle] = useState('');
  const [subContent, setSubContent] = useState('');
  const [subFileName, setSubFileName] = useState('');
  const [subSuccessMsg, setSubSuccessMsg] = useState('');

  // Keep newTaskSubject valid when grade/board/selected subjects change
  useEffect(() => {
    if (allDropdownSubjectNames.length > 0 && !allDropdownSubjectNames.includes(newTaskSubject)) {
      setNewTaskSubject(enrolledSubjectNames[0] || allDropdownSubjectNames[0]);
    }
  }, [allDropdownSubjectNames, enrolledSubjectNames, newTaskSubject]);

  // Matching active topics from Admin topicsDB for currently selected newTaskSubject
  const suggestedTopicsForSelectedSubject = useMemo(() => {
    const normSelected = (newTaskSubject || '').toLowerCase().trim();
    const matchedSubjectIds = gradeBoardSubjects
      .filter((s) => {
        const loc = getLocalizedSubjectName(s.name, currentBoard).toLowerCase().trim();
        return (
          s.name.toLowerCase().trim() === normSelected ||
          loc === normSelected ||
          normSelected.includes(s.name.toLowerCase().trim()) ||
          s.name.toLowerCase().trim().includes(normSelected)
        );
      })
      .map((s) => s.id);

    return topicsDB.filter(
      (t) => t.status === 'ACTIVE' && matchedSubjectIds.includes(t.subject_id)
    );
  }, [newTaskSubject, gradeBoardSubjects, topicsDB, currentBoard]);

  // Edit task form states
  const [editStatus, setEditStatus] = useState<StudyTaskStatus>('To Do');
  const [editPoints, setEditPoints] = useState<number>(25);
  const [editTopic, setEditTopic] = useState<string>('');
  const [editDuration, setEditDuration] = useState<number>(1.5);
  const [editDateStr, setEditDateStr] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [editTime, setEditTime] = useState<string>('16:30');
  const [editNotes, setEditNotes] = useState<string>('');

  // Current year & month derivations
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth(); // 0-indexed: 9 = Oct, 10 = Nov
  const currentMonthKey = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
  const currentMonthName = currentDate.toLocaleDateString(intlLocale, { month: 'long', year: 'numeric' });
  const daysInCurrentMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

  // Helper to open Add Task modal synced to a given day in the current roadmap month
  const openAddTaskModal = (dayNum = 1, customDateStr?: string) => {
    const targetDate =
      customDateStr ||
      `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const [y, m, d] = targetDate.split('-').map(Number);
    setNewTaskDateStr(targetDate);
    setNewTaskDay(d || dayNum);
    if (y && m) {
      setPickerCalendarDate(new Date(y, m - 1, 1));
    } else {
      setPickerCalendarDate(new Date(currentYear, currentMonthIndex, 1));
    }
    if (activeSubjectFilter !== 'ALL') {
      setNewTaskSubject(activeSubjectFilter);
    }
    setIsNewTaskOpen(true);
  };

  // Derived cells for the interactive mini calendar inside Add Task popup
  const pickerYear = pickerCalendarDate.getFullYear();
  const pickerMonthIndex = pickerCalendarDate.getMonth();
  const pickerMonthLabel = pickerCalendarDate.toLocaleDateString(intlLocale, {
    month: 'long',
    year: 'numeric',
  });
  const pickerDaysInMonth = new Date(pickerYear, pickerMonthIndex + 1, 0).getDate();
  const pickerStartOffset = (new Date(pickerYear, pickerMonthIndex, 1).getDay() + 6) % 7; // Mon=0..Sun=6
  const pickerCalendarDays = useMemo(() => {
    const cells: ({ day: number; dateStr: string } | null)[] = [];
    for (let i = 0; i < pickerStartOffset; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= pickerDaysInMonth; d++) {
      const dateStr = `${pickerYear}-${String(pickerMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr });
    }
    return cells;
  }, [pickerYear, pickerMonthIndex, pickerDaysInMonth, pickerStartOffset]);

  const toDateStr = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const todayStr = toDateStr(new Date());
  const selectedDateStr = toDateStr(selectedDate);
  const selectedDayNum = selectedDate.getDate();

  // Compute Monday–Sunday week days around selectedDate
  const weekDays = useMemo(() => {
    const offsetFromMonday = (selectedDate.getDay() + 6) % 7;
    const monday = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() - offsetFromMonday
    );
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + idx);
      return {
        dateObj: d,
        dateStr: toDateStr(d),
        dayNum: d.getDate(),
        weekdayShort: d.toLocaleDateString(intlLocale, { weekday: 'short' }),
        monthShort: d.toLocaleDateString(intlLocale, { month: 'short' }),
        isToday: toDateStr(d) === todayStr,
      };
    });
  }, [selectedDate, todayStr, intlLocale]);

  const weekRangeLabel = useMemo(() => {
    if (weekDays.length < 7) return currentMonthName;
    const first = weekDays[0];
    const last = weekDays[6];
    if (first.dateObj.getMonth() === last.dateObj.getMonth()) {
      return `${first.monthShort} ${first.dayNum}–${last.dayNum}, ${last.dateObj.getFullYear()}`;
    }
    return `${first.monthShort} ${first.dayNum} – ${last.monthShort} ${last.dayNum}`;
  }, [weekDays, currentMonthName]);

  const selectedDayShortLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString(intlLocale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [selectedDate, intlLocale]
  );

  const selectedDayFullLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString(intlLocale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    [selectedDate, intlLocale]
  );

  // Jump straight to today's date & month
  const handleJumpToToday = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setSelectedDate(today);
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Select a specific date (e.g. clicking a day in Month/Week view) and optionally switch to Day view
  const handleSelectDayView = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return;
    setSelectedDate(new Date(y, m - 1, d));
    setCurrentDate(new Date(y, m - 1, 1));
    setCalendarViewMode('day');
  };

  // Context-aware Prev/Next navigation (Month in month/sprint, 7 days in week, 1 day in day)
  const handlePrevPeriod = () => {
    if (calendarViewMode === 'day') {
      const next = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate() - 1
      );
      setSelectedDate(next);
      setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1));
      return;
    }
    if (calendarViewMode === 'week') {
      const next = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate() - 7
      );
      setSelectedDate(next);
      setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1));
      return;
    }
    setCurrentDate((prev) => {
      const nextMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      setSelectedDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1));
      return nextMonth;
    });
  };

  const handleNextPeriod = () => {
    if (calendarViewMode === 'day') {
      const next = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate() + 1
      );
      setSelectedDate(next);
      setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1));
      return;
    }
    if (calendarViewMode === 'week') {
      const next = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate() + 7
      );
      setSelectedDate(next);
      setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1));
      return;
    }
    setCurrentDate((prev) => {
      const nextMonth = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      setSelectedDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1));
      return nextMonth;
    });
  };

  // Month-specific tasks: changes whenever the month changes!
  const monthTasks = dailyTasks.filter((t) => {
    if (t.date) {
      return t.date.startsWith(currentMonthKey);
    }
    // Fallback if task lacks full date (matches October if day <= 31)
    return currentMonthIndex === 9 && (t.day || 0) <= 31;
  });

  // Tasks for the selected day in Day View (sorted chronologically by study_time)
  const selectedDayAllTasks = useMemo(() => {
    const selMonthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
    return dailyTasks
      .filter((t) => {
        if (t.date) return t.date === selectedDateStr;
        return selectedDate.getMonth() === 9 && selMonthKey === currentMonthKey && t.day === selectedDayNum;
      })
      .sort((a, b) => (a.study_time || '99:99').localeCompare(b.study_time || '99:99'));
  }, [dailyTasks, selectedDate, selectedDateStr, selectedDayNum, currentMonthKey]);

  // Determine whether a task is overdue or stalled without moving to the next workflow stage
  const getTaskOverdueInfo = (
    task: DailyStudyTask
  ): { isOverdue: boolean; reason: string } => {
    if (task.status === 'Completed') {
      return { isOverdue: false, reason: '' };
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const notProgressedInWorkflow = task.status === 'To Do' || task.status === 'On Hold';

    if (task.date && task.date < todayStr) {
      const dueMs = new Date(`${task.date}T00:00:00`).getTime();
      const todayMs = new Date(`${todayStr}T00:00:00`).getTime();
      const daysPast = Math.max(1, Math.round((todayMs - dueMs) / (1000 * 60 * 60 * 24)));
      return {
        isOverdue: true,
        reason: notProgressedInWorkflow
          ? `Overdue (${daysPast}d) · Not moved to next workflow level`
          : `Overdue by ${daysPast} day${daysPast > 1 ? 's' : ''}`,
      };
    }

    if (task.date === todayStr && task.study_time && notProgressedInWorkflow) {
      const [hStr, mStr] = task.study_time.split(':');
      const taskMinutes = (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0);
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (nowMinutes > taskMinutes) {
        return {
          isOverdue: true,
          reason: 'Overdue · Scheduled window passed without workflow progress',
        };
      }
    }

    const lastActivityIso = task.status_updated_at || task.created_at;
    if (lastActivityIso && notProgressedInWorkflow) {
      const elapsedMs = now.getTime() - new Date(lastActivityIso).getTime();
      if (elapsedMs > 24 * 60 * 60 * 1000) {
        return {
          isOverdue: true,
          reason: 'Overdue · Pending move to next workflow level',
        };
      }
    }

    return { isOverdue: false, reason: '' };
  };

  const overdueSprintCount = monthTasks.filter((t) => getTaskOverdueInfo(t).isOverdue).length;

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
    const formattedDate = dateObj.toLocaleDateString(intlLocale, { month: 'short', day: 'numeric' });

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
    setEditDateStr(
      task.date ||
        `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(task.day || 1).padStart(2, '0')}`
    );
    setEditTime(task.study_time || '16:30');
    setEditNotes(task.notes ?? '');
    setSubType(task.submissionType || 'Code');
    setSubTitle(task.submissionTitle || '');
    setSubContent(task.submissionContent || '');
    setSubFileName(task.submissionFileName || '');
    setSubSuccessMsg('');
  };

  // Save task edits
  const handleSaveTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTask) return;

    const previousStatus = selectedTask.status;
    const parsedDay = editDateStr ? Number(editDateStr.split('-')[2]) || selectedTask.day : selectedTask.day;

    const updates: Partial<DailyStudyTask> = {
      status: editStatus,
      points: Number(editPoints) || 20,
      topic: editTopic.trim() || selectedTask.topic,
      duration_hrs: Number(editDuration) || selectedTask.duration_hrs,
      date: editDateStr || selectedTask.date,
      day: parsedDay,
      study_time: editTime || selectedTask.study_time,
      notes: editNotes.trim(),
      ...(editStatus !== previousStatus ? { status_updated_at: new Date().toISOString() } : {}),
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
        `Updated "${selectedTask.subject}" (${editStatus}${editTime ? ` · ${formatStudyTime(editTime)}` : ''}).`,
        'info',
        'student'
      );
    }

    setSelectedTask(null);
  };

  // Quick inline status change
  const handleQuickStatusChange = (taskId: string, newStatus: StudyTaskStatus) => {
    const movedAt = new Date().toISOString();
    if (updateStudyTask) {
      updateStudyTask(taskId, { status: newStatus, status_updated_at: movedAt });
    } else {
      setDailyTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: newStatus, status_updated_at: movedAt } : t
        )
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
    if (deleteStudyTask) {
      deleteStudyTask(taskId);
    } else {
      setDailyTasks((prev) => prev.filter((t) => t.id !== taskId));
      addNotification('Task Removed', 'Study task has been removed from roadmap.', 'info', 'student');
    }
    setSelectedTask(null);
  };

  // Add new task with chosen calendar date & study time
  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTopic.trim()) return;

    const normSubj = newTaskSubject.toLowerCase();
    let color = '#4F46E580';
    if (normSubj.includes('phys')) color = '#0284C780';
    else if (normSubj.includes('hist') || normSubj.includes('social') || normSubj.includes('geog')) color = '#0EA5E980';
    else if (normSubj.includes('chem')) color = '#10B98180';
    else if (normSubj.includes('bio')) color = '#05966980';
    else if (normSubj.includes('eng') || normSubj.includes('hindi') || normSubj.includes('sanskrit') || normSubj.includes('lang')) color = '#D9770680';
    else if (normSubj.includes('comp') || normSubj.includes('art')) color = '#7C3AED80';

    const dateStr =
      newTaskDateStr ||
      `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(newTaskDay).padStart(2, '0')}`;
    const [selYear, selMonth, selDay] = dateStr.split('-').map(Number);

    const nowIso = new Date().toISOString();
    const newTask: DailyStudyTask = {
      id: `dt-custom-${Date.now()}`,
      day: selDay || newTaskDay,
      date: dateStr,
      study_time: newTaskTime || '16:30',
      subject: newTaskSubject,
      topic: newTaskTopic.trim(),
      duration_hrs: Number(newTaskDuration) || 1.5,
      is_core: newTaskIsCore,
      status: newTaskStatus,
      points: Number(newTaskPoints) || 25,
      color,
      created_at: nowIso,
      status_updated_at: nowIso,
      priority: newTaskPriority,
      isCustom: newTaskIsCustom,
      ...(newTaskIsCustom
        ? {
            customCategory: newTaskCustomCategory,
            approvalStatus: 'Pending Approval' as const,
          }
        : {}),
      submissionStatus: 'Pending',
    };

    if (addStudyTask) {
      addStudyTask(newTask);
    } else {
      setDailyTasks((prev) => [...prev, newTask]);
      const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString(intlLocale, {
        month: 'short',
        day: 'numeric',
      });
      addNotification(
        'Task Added to Roadmap',
        `Scheduled ${newTask.subject} on ${formattedDate} at ${formatStudyTime(newTask.study_time)} (${newTask.duration_hrs}h).`,
        'success',
        'student'
      );
    }

    // Focus roadmap calendar on the selected month so the newly scheduled task is visible right away
    if (selYear && selMonth && (selYear !== currentYear || selMonth - 1 !== currentMonthIndex)) {
      setCurrentDate(new Date(selYear, selMonth - 1, 1));
    }

    setIsNewTaskOpen(false);
    setNewTopicFormDefaults();
  };

  const setNewTopicFormDefaults = () => {
    setNewTaskTopic('');
    setNewTaskDuration(1.5);
    setNewTaskStatus('To Do');
    setNewTaskPoints(25);
    setNewTaskIsCore(false);
  };

  // Filter tasks based on activeStatusFilter and activeSubjectFilter
  const isTaskVisible = (task: DailyStudyTask) => {
    const statusMatch = activeStatusFilter === 'ALL' || task.status === activeStatusFilter;
    const subjectMatch =
      activeSubjectFilter === 'ALL' ||
      (task.subject || '').toLowerCase() === activeSubjectFilter.toLowerCase();
    return statusMatch && subjectMatch;
  };

  // Helper status color and icon styling (all color opacities reduced by 50%)
  const getStatusBadge = (status: StudyTaskStatus) => {
    switch (status) {
      case 'Completed':
        return {
          bg: 'bg-emerald-500/8 text-emerald-700/75 dark:text-emerald-300/75 border-emerald-500/15',
          dot: 'bg-emerald-500/50',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600/50 dark:text-emerald-400/50" />,
          label: t('student:roadmap.completed'),
          chipBg: 'bg-emerald-600/50 hover:bg-emerald-600/60 text-slate-900 dark:text-white',
        };
      case 'In Progress':
        return {
          bg: 'bg-blue-500/8 text-blue-700/75 dark:text-blue-300/75 border-blue-500/15',
          dot: 'bg-blue-500/50 animate-pulse',
          icon: <TrendingUp className="w-3 h-3 text-blue-600/50 dark:text-blue-400/50" />,
          label: t('student:roadmap.inProgress'),
          chipBg: 'bg-[#0284C7]/50 hover:bg-[#0284C7]/60 text-slate-900 dark:text-white',
        };
      case 'On Hold':
        return {
          bg: 'bg-amber-500/8 text-amber-700/75 dark:text-amber-300/75 border-amber-500/15',
          dot: 'bg-amber-500/50',
          icon: <Pause className="w-3 h-3 text-amber-600/50 dark:text-amber-400/50" />,
          label: t('student:roadmap.onHold'),
          chipBg: 'bg-amber-600/50 hover:bg-amber-600/60 text-slate-900 dark:text-white',
        };
      case 'Revision':
        return {
          bg: 'bg-purple-500/8 text-purple-700/75 dark:text-purple-300/75 border-purple-500/15',
          dot: 'bg-purple-500/50',
          icon: <RotateCcw className="w-3 h-3 text-purple-600/50 dark:text-purple-400/50" />,
          label: t('student:roadmap.revision'),
          chipBg: 'bg-purple-600/50 hover:bg-purple-600/60 text-slate-900 dark:text-white',
        };
      case 'To Do':
      default:
        return {
          bg: 'bg-slate-500/8 text-slate-700/75 dark:text-white/75 border-slate-500/15',
          dot: 'bg-slate-400/50',
          icon: <Clock className="w-3 h-3 text-slate-500/50 dark:text-white/50" />,
          label: t('student:roadmap.todo'),
          chipBg: 'bg-[#4F46E5]/50 hover:bg-[#4F46E5]/60 text-slate-900 dark:text-white',
        };
    }
  };

  // Default day labels when empty
  const getEmptyDayLabel = (day: number) => {
    switch (day) {
      case 2:
        return t('student:roadmap.emptyDay.restPrep');
      case 6:
      case 13:
      case 25:
        return t('student:roadmap.emptyDay.selfStudy');
      case 7:
      case 14:
      case 21:
      case 28:
        return t('student:roadmap.emptyDay.sprintReview');
      case 9:
        return t('student:roadmap.emptyDay.quizPrep');
      case 11:
        return t('student:roadmap.emptyDay.sprintRetro');
      case 16:
      case 26:
        return t('student:roadmap.emptyDay.formulaRevision');
      case 19:
        return t('student:roadmap.emptyDay.assessment');
      case 20:
        return t('student:roadmap.emptyDay.mockTest');
      case 27:
        return t('student:roadmap.emptyDay.chapterQuiz');
      default:
        return t('student:roadmap.emptyDay.freeStudy');
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
    <div id="agile-roadmap-container" className="space-y-6">
      {/* 1. TOP HEADER: Clean, Uncluttered Layout matching design specification */}
      <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* ROW 1: Heading on left, Subheading on right */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-light text-slate-900 dark:text-white tracking-wide">
              {t('student:roadmap.heading')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50/50 dark:bg-indigo-950/35 text-indigo-700/75 dark:text-indigo-300/75 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center gap-1 shadow-2xs">
              <Zap className="w-3 h-3 text-indigo-600/50 dark:text-indigo-400/50" />
              {t('student:roadmap.interactiveBadge')}
            </span>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-white font-normal md:text-right leading-snug">
            <span>{t('student:roadmap.dailyCoreBanner')}</span>
          </div>
        </div>

        {/* ROW 2 & ROW 3: Sprint + Date Switcher, Calendar Modes (Month | Week | Day), and Action Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Left Controls: [Sprint] + < Date > on top, [Month | Week | Day] right below */}
          <div className="flex flex-col items-start gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Standalone Sprint View Toggle */}
              <button
                type="button"
                onClick={() => setCalendarViewMode('sprint')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  calendarViewMode === 'sprint'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-[#132036] text-slate-600 dark:text-white/80 border-slate-200/80 dark:border-slate-700/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('student:roadmap.sprint')}</span>
              </button>

              {/* Context-aware Period Switcher (< Month / Week / Day >) */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#132036] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrevPeriod}
                  className="p-1 text-slate-500 dark:text-white hover:text-slate-900 dark:hover:text-white cursor-pointer rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                  title={t('student:roadmap.prevPeriod')}
                  aria-label={t('student:roadmap.prevPeriod')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white min-w-[125px] text-center select-none">
                  {calendarViewMode === 'day'
                    ? selectedDayShortLabel
                    : calendarViewMode === 'week'
                    ? weekRangeLabel
                    : currentMonthName}
                </span>
                <button
                  type="button"
                  onClick={handleNextPeriod}
                  className="p-1 text-slate-500 dark:text-white hover:text-slate-900 dark:hover:text-white cursor-pointer rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                  title={t('student:roadmap.nextPeriod')}
                  aria-label={t('student:roadmap.nextPeriod')}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {(calendarViewMode === 'day'
                ? selectedDateStr !== todayStr
                : calendarViewMode === 'week'
                ? !weekDays.some((d) => d.isToday)
                : currentMonthKey !== todayStr.slice(0, 7)) && (
                <button
                  type="button"
                  onClick={handleJumpToToday}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-normal cursor-pointer transition-colors"
                  title={t('student:roadmap.today')}
                >
                  {t('student:roadmap.today')}
                </button>
              )}
            </div>

            {/* Calendar Granularity Switcher: Month | Week | Day */}
            <div className="flex items-center bg-slate-100 dark:bg-[#132036] p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => setCalendarViewMode('month')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  calendarViewMode === 'month'
                    ? 'bg-white dark:bg-[#1E3A5F] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('student:roadmap.monthView')}
              </button>
              <button
                type="button"
                onClick={() => setCalendarViewMode('week')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  calendarViewMode === 'week'
                    ? 'bg-white dark:bg-[#1E3A5F] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('student:roadmap.weekView')}
              </button>
              <button
                type="button"
                onClick={() => setCalendarViewMode('day')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  calendarViewMode === 'day'
                    ? 'bg-white dark:bg-[#1E3A5F] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('student:roadmap.dayView')}
              </button>
            </div>
          </div>

          {/* Action Toolbar: Subject Quick Filter, Add Task, Offline Pack, Parent Digest, Spreadsheet */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Subject Filter Dropdown */}
            <div className="relative flex items-center">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={activeSubjectFilter}
                onChange={(e) => setActiveSubjectFilter(e.target.value)}
                aria-label={t('student:roadmap.filterBySubject')}
                className="pl-7 pr-6 py-1.5 rounded-xl bg-slate-50 dark:bg-[#132036] border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer max-w-[230px]"
              >
                <option value="ALL">{t('student:roadmap.allSubjectsCount', { count: allDropdownSubjectNames.length })}</option>
                {enrolledSubjectNames.length > 0 && (
                  <optgroup label={t('student:roadmap.mySelectedSubjects')}>
                    {enrolledSubjectNames.map((subjName) => (
                      <option key={`filter-enr-${subjName}`} value={subjName}>
                        {translateSubjectLabel(subjName, t)}
                      </option>
                    ))}
                  </optgroup>
                )}
                {otherSubjectNames.length > 0 && (
                  <optgroup label={t('student:roadmap.gradeCurriculumGroup', { grade: studentGradeLevel, board: translateBoardLabel(currentBoard, t) })}>
                    {otherSubjectNames.map((subjName) => (
                      <option key={`filter-oth-${subjName}`} value={subjName}>
                        {translateSubjectLabel(subjName, t)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Add New Task Button */}
            <button
              onClick={() => openAddTaskModal(1)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs font-normal flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('student:roadmap.addTask')}</span>
            </button>

            {/* Offline Study Pack button */}
            <button
              onClick={() => setIsOfflineModalOpen(true)}
              title={t('student:banners.offlinePackTooltip')}
              className="px-3 py-1.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/25 hover:bg-teal-100/50 dark:hover:bg-teal-900/25 text-[#00A896]/75 dark:text-[#4DF0D7]/70 border border-teal-200/50 dark:border-teal-800/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('student:roadmap.offlinePackBtn')}</span>
            </button>

            {/* Parental Weekly Digest button */}
            <button
              onClick={() => setIsParentDigestOpen(true)}
              title={t('student:banners.parentDigestTooltip')}
              className="px-3 py-1.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/25 hover:bg-amber-100/50 dark:hover:bg-amber-900/25 text-amber-700/75 dark:text-amber-300/70 border border-amber-200/50 dark:border-amber-800/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{t('student:roadmap.parentDigestBtn')}</span>
            </button>

            {/* Export Spreadsheet button */}
            <button
              onClick={exportStudyPlanSpreadsheet}
              title={t('student:roadmap.exportCsvTitle')}
              className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/25 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 text-emerald-700/75 dark:text-emerald-300/70 border border-emerald-200/50 dark:border-emerald-800/50 cursor-pointer transition-colors"
              aria-label={t('student:roadmap.exportSheet')}
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
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
            className={`px-3 py-1.5 rounded-xl text-xs font-normal transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStatusFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-2 ring-slate-900/20 dark:ring-white/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{t('student:roadmap.allTasks')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-normal ${
                activeStatusFilter === 'ALL'
                  ? 'bg-white/25 dark:bg-slate-900/15 text-white dark:text-slate-900'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white'
              }`}
            >
              {totalTasks}
            </span>
          </button>

          {/* TO DO */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'To Do' ? 'ALL' : 'To Do')}
            className={`px-3 py-1.5 rounded-xl text-xs font-normal transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStatusFilter === 'To Do'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs ring-2 ring-slate-400/40'
                : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Clock
              className={`w-3.5 h-3.5 ${
                activeStatusFilter === 'To Do'
                  ? 'text-slate-200 dark:text-slate-700'
                  : 'text-slate-500 dark:text-slate-300'
              }`}
            />
            <span>{t('student:roadmap.todo')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-normal ${
                activeStatusFilter === 'To Do'
                  ? 'bg-white/25 dark:bg-slate-900/15 text-white dark:text-slate-900'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white'
              }`}
            >
              {todoCount}
            </span>
          </button>

          {/* IN PROGRESS */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'In Progress' ? 'ALL' : 'In Progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-normal transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStatusFilter === 'In Progress'
                ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/35'
                : 'bg-blue-50/85 dark:bg-blue-950/70 text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/75'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                activeStatusFilter === 'In Progress' ? 'bg-white' : 'bg-blue-500'
              }`}
            />
            <span>{t('student:roadmap.inProgress')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-normal ${
                activeStatusFilter === 'In Progress'
                  ? 'bg-white/25 text-white'
                  : 'bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-200'
              }`}
            >
              {inProgressCount}
            </span>
          </button>

          {/* ON HOLD */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'On Hold' ? 'ALL' : 'On Hold')}
            className={`px-3 py-1.5 rounded-xl text-xs font-normal transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStatusFilter === 'On Hold'
                ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-500/35'
                : 'bg-amber-50/85 dark:bg-amber-950/70 text-amber-700 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/75'
            }`}
          >
            <Pause
              className={`w-3 h-3 ${
                activeStatusFilter === 'On Hold' ? 'text-white' : 'text-amber-600 dark:text-amber-300'
              }`}
            />
            <span>{t('student:roadmap.onHold')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-normal ${
                activeStatusFilter === 'On Hold'
                  ? 'bg-white/25 text-white'
                  : 'bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-200'
              }`}
            >
              {onHoldCount}
            </span>
          </button>

          {/* REVISION */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'Revision' ? 'ALL' : 'Revision')}
            className={`px-3 py-1.5 rounded-xl text-xs font-normal transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStatusFilter === 'Revision'
                ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-500/35'
                : 'bg-purple-50/85 dark:bg-purple-950/70 text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/75'
            }`}
          >
            <RotateCcw
              className={`w-3 h-3 ${
                activeStatusFilter === 'Revision' ? 'text-white' : 'text-purple-600 dark:text-purple-300'
              }`}
            />
            <span>{t('student:roadmap.revision')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-normal ${
                activeStatusFilter === 'Revision'
                  ? 'bg-white/25 text-white'
                  : 'bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-200'
              }`}
            >
              {revisionCount}
            </span>
          </button>

          {/* DONE */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'Completed' ? 'ALL' : 'Completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-normal transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStatusFilter === 'Completed'
                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/35'
                : 'bg-emerald-50/85 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/75'
            }`}
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                activeStatusFilter === 'Completed' ? 'text-white' : 'text-emerald-600 dark:text-emerald-300'
              }`}
            />
            <span>{t('student:roadmap.done')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-normal ${
                activeStatusFilter === 'Completed'
                  ? 'bg-white/25 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-200'
              }`}
            >
              {completedCount}
            </span>
          </button>

          {/* Reset filter button if any active status or subject filter is active */}
          {(activeStatusFilter !== 'ALL' || activeSubjectFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setActiveStatusFilter('ALL');
                setActiveSubjectFilter('ALL');
              }}
              className="text-xs font-normal text-slate-500 hover:text-slate-700 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
              title={t('student:filters.resetFilters')}
            >
              <X className="w-3 h-3" />
              <span>{t('common:actions.reset')}</span>
            </button>
          )}
        </div>

        {/* Sprint Story Points Progress (Right side, clean & professional) */}
        <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/40 px-3.5 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shrink-0 self-start xl:self-auto">
          <div className="w-8 h-8 rounded-lg bg-amber-500/5 dark:bg-amber-400/10 flex items-center justify-center text-amber-600/60 dark:text-amber-400/60 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-[130px] sm:min-w-[150px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-normal text-slate-700 dark:text-white">{t('student:roadmap.sprintPoints')}</span>
              <span className="font-normal text-amber-600/70 dark:text-amber-400/70">
                {earnedPoints} / {totalPoints} {t('common:units.pts')}
              </span>
            </div>
            <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-amber-500/50 h-full rounded-full transition-all duration-300"
                style={{ width: `${totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-normal text-slate-500 dark:text-white">
            {totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 3. CALENDAR MONTH SPREADSHEET GRID VIEW */}
      {calendarViewMode === 'month' && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Day Header Row (Mon, Tue, Wed, Thu, Fri, Sat, Sun) */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center py-2.5 bg-slate-50/70 dark:bg-slate-800/50 text-xs font-extrabold text-slate-500 dark:text-white uppercase tracking-wider">
            <div>{t('student:roadmap.weekdaysShort.mon')}</div>
            <div>{t('student:roadmap.weekdaysShort.tue')}</div>
            <div>{t('student:roadmap.weekdaysShort.wed')}</div>
            <div>{t('student:roadmap.weekdaysShort.thu')}</div>
            <div>{t('student:roadmap.weekdaysShort.fri')}</div>
            <div>{t('student:roadmap.weekdaysShort.sat')}</div>
            <div>{t('student:roadmap.weekdaysShort.sun')}</div>
          </div>

          {/* Dynamic Calendar Grid: Calculated dynamically for current month & year */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {calendarWeeks.map((weekRow, rowIndex) => (
              <div
                key={`cal-week-${rowIndex}`}
                className="grid grid-cols-7 min-h-[128px] divide-x divide-slate-100 dark:divide-slate-800/60"
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
                            ? 'bg-indigo-100/35 dark:bg-indigo-900/25 ring-2 ring-indigo-500/50 ring-inset'
                            : 'bg-slate-50/40 dark:bg-slate-900/30 text-slate-500 dark:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-white">
                          <span>{cell.day}</span>
                          <span className="text-[9px] uppercase tracking-wider font-semibold">
                            {cell.type === 'prev' ? t('student:roadmap.prevPeriod') : t('student:roadmap.nextPeriod')}
                          </span>
                        </div>
                        {isDragTarget ? (
                          <div className="my-1 py-1 text-center bg-indigo-600/50 text-slate-900 dark:text-white rounded text-[10px] font-bold animate-pulse">
                            {t('student:roadmap.dropHere')}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-white italic">
                            {cell.type === 'prev' ? t('student:roadmap.prevMonth') : t('student:roadmap.nextMonth')}
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
                  const dayTasks = monthTasks.filter((tItem) => {
                    if (tItem.date) return tItem.date === dateStr;
                    return tItem.day === dayNum;
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
                          ? 'bg-indigo-100/35 dark:bg-indigo-950/30 ring-2 ring-indigo-500/50 ring-inset shadow-inner'
                          : activeStatusFilter !== 'ALL' && hasMatchingFilterTasks
                          ? 'bg-indigo-50/20 dark:bg-indigo-950/15 ring-1 ring-indigo-500/10'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Day Number Header + Drag drop indicator + Add Task button */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleSelectDayView(dateStr)}
                          title={`${currentMonthName} ${dayNum}`}
                          className={`text-xs font-bold inline-flex items-center gap-1 hover:underline cursor-pointer ${
                            dateStr === todayStr
                              ? 'px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                              : isDragTarget || (hasMatchingFilterTasks && activeStatusFilter !== 'ALL')
                              ? 'text-indigo-600/75 dark:text-indigo-400/75 font-black'
                              : 'text-slate-600 dark:text-white'
                          }`}
                        >
                          <span>{dayNum}</span>
                          {dateStr === todayStr && (
                            <span className="text-[9px] font-normal uppercase tracking-wide">{t('student:roadmap.today')}</span>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          {isDragTarget && (
                            <span className="text-[9px] font-black bg-indigo-600/50 text-slate-900 dark:text-white px-1.5 py-0.5 rounded shadow-xs animate-pulse">
                              {t('student:roadmap.dropHere')}
                            </span>
                          )}
                          <button
                            onClick={() => openAddTaskModal(dayNum, dateStr)}
                            title={t('student:roadmap.addTask')}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-indigo-600/75 dark:hover:text-indigo-400/75 transition-opacity cursor-pointer"
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
                          const overdueInfo = getTaskOverdueInfo(task);
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
                              title={overdueInfo.isOverdue ? overdueInfo.reason : undefined}
                              className={`p-2 rounded-lg text-[11px] font-bold shadow-xs cursor-grab active:cursor-grabbing hover:opacity-90 hover:scale-[1.02] transition-all relative group/card border ${
                                overdueInfo.isOverdue
                                  ? 'border-red-500/80 dark:border-red-400/75 ring-1 ring-red-500/35'
                                  : 'border-slate-900/10 dark:border-white/15'
                              } ${badge.chipBg} ${isBeingDragged ? 'opacity-40 scale-95 ring-2 ring-white/50' : ''}`}
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="flex items-center gap-1.5 truncate font-normal">
                                  <SubjectIcon subject={task.subject} size="xs" />
                                  <span className="truncate">{translateSubjectLabel(task.subject, t)}</span>
                                </span>
                                <span className="text-[9px] bg-black/15 dark:bg-black/25 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5 shrink-0">
                                  {task.points || 20} {t('common:units.pts')}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-800/85 dark:text-white/90 font-normal truncate mt-0.5">
                                {task.topic}
                              </div>

                              {overdueInfo.isOverdue && (
                                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[8px] font-normal">
                                  <Flag className="w-2.5 h-2.5 fill-white text-white shrink-0" />
                                  <span>{t('student:roadmap.overdueLabel')}</span>
                                </div>
                              )}

                              {/* Task Status Pill Indicator + Scheduled Time */}
                              <div className="mt-1 flex items-center justify-between text-[8px] text-slate-800/90 dark:text-white/90 font-medium gap-1">
                                <span className="flex items-center gap-1 truncate">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                                  <span className="truncate">{badge.label}</span>
                                </span>
                                {task.study_time ? (
                                  <span className="bg-black/10 dark:bg-black/20 px-1 rounded shrink-0">
                                    {formatStudyTime(task.study_time)}
                                  </span>
                                ) : task.is_core ? (
                                  <span className="text-amber-700/80 dark:text-amber-200/75 shrink-0">★ {t('student:roadmap.coreTag')}</span>
                                ) : null}
                              </div>

                              {/* One-Click Quick Status Bar */}
                              <div
                                className="mt-1.5 pt-1 border-t border-slate-900/10 dark:border-white/15 flex items-center justify-end gap-1 opacity-90 group-hover/card:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {task.status !== 'Completed' && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStatusChange(task.id, 'Completed')}
                                    title={t('student:roadmap.completed')}
                                    className="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/50 hover:bg-emerald-500/70 text-slate-900 dark:text-white shadow-2xs cursor-pointer transition-transform active:scale-95"
                                  >
                                    {t('student:roadmap.doneBtn')}
                                  </button>
                                )}
                                {task.status !== 'In Progress' && task.status !== 'Completed' && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStatusChange(task.id, 'In Progress')}
                                    title={t('student:roadmap.inProgress')}
                                    className="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/50 hover:bg-blue-500/70 text-slate-900 dark:text-white shadow-2xs cursor-pointer transition-transform active:scale-95"
                                  >
                                    ▶ {t('student:roadmap.startBtn')}
                                  </button>
                                )}
                                {task.status !== 'Revision' && task.status === 'Completed' && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStatusChange(task.id, 'Revision')}
                                    title={t('student:roadmap.revision')}
                                    className="px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-500/50 hover:bg-purple-500/70 text-slate-900 dark:text-white shadow-2xs cursor-pointer transition-transform active:scale-95"
                                  >
                                    {t('student:roadmap.reviseBtn')}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* If has tasks but none match current filter */}
                        {hasTasks && visibleTasks.length === 0 && (
                          <div className="text-[10px] text-slate-400 dark:text-white italic py-1 text-center">
                            {t('student:roadmap.hiddenByFilter', { count: dayTasks.length })}
                          </div>
                        )}

                        {/* If no scheduled tasks on this day */}
                        {!hasTasks && (
                          <div className="text-[10px] text-slate-400 dark:text-white italic py-1">
                            {getEmptyDayLabel(dayNum)}
                          </div>
                        )}
                      </div>

                      {/* Day Footer info */}
                      {visibleTasks.length > 0 && (
                        <div className="text-[9px] text-slate-500 dark:text-white font-semibold text-right">
                          {visibleTasks.reduce((s, tItem) => s + (tItem.duration_hrs || 1.5), 0)}h
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
                <h2 className="text-base font-light text-slate-900 dark:text-white flex items-center gap-2 tracking-wide">
                  <Calendar className="w-4 h-4 text-indigo-600/50 dark:text-indigo-400/50" />
                  {t('student:roadmap.weekScheduleHeading', { range: weekRangeLabel })}
                </h2>
                <p className="text-xs text-slate-500 dark:text-white mt-0.5">
                  {t('student:roadmap.weekScheduleSub')}
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600/75 dark:text-indigo-400/75 bg-indigo-50/50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-xl self-start sm:self-auto border border-indigo-200/50 dark:border-indigo-800/50">
                {weekRangeLabel}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekDays.map((wk) => {
                const { dateStr, dayNum, weekdayShort, monthShort, isToday } = wk;
                const dayTasks = dailyTasks.filter((t) => {
                  const matchesDate = t.date
                    ? t.date === dateStr
                    : t.day === dayNum && dateStr.startsWith(currentMonthKey);
                  return matchesDate && isTaskVisible(t);
                });
                const isDragTarget = dragOverDateStr === dateStr;

                return (
                  <div
                    key={`week-day-${dateStr}`}
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
                        ? 'bg-indigo-100/35 dark:bg-indigo-950/30 border-indigo-500/50 ring-2 ring-indigo-500/50 ring-inset shadow-inner'
                        : isToday
                        ? 'bg-slate-100/70 dark:bg-slate-800/70 border-slate-300 dark:border-slate-600 ring-1 ring-slate-300/60 dark:ring-slate-600/60'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-700/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                        <button
                          type="button"
                          onClick={() => handleSelectDayView(dateStr)}
                          className={`text-xs font-black flex items-center gap-1 hover:underline cursor-pointer ${
                            isDragTarget ? 'text-indigo-600/75 dark:text-indigo-400/75' : 'text-slate-800 dark:text-white'
                          }`}
                        >
                          <span>
                            {weekdayShort}, {monthShort} {dayNum}
                          </span>
                          {isToday && (
                            <span className="text-[9px] font-normal px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white">
                              {t('student:roadmap.today')}
                            </span>
                          )}
                        </button>
                        <div className="flex items-center gap-1">
                          {isDragTarget && (
                            <span className="text-[9px] font-black bg-indigo-600/50 text-slate-900 dark:text-white px-1 rounded animate-pulse">
                              {t('student:roadmap.dropHere')}
                            </span>
                          )}
                          <button
                            onClick={() => openAddTaskModal(dayNum, dateStr)}
                            className="text-slate-400 hover:text-indigo-600/75 dark:hover:text-white cursor-pointer"
                            title={t('student:roadmap.addTask')}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2.5 space-y-2">
                        {dayTasks.map((task) => {
                          const badge = getStatusBadge(task.status);
                          const isBeingDragged = draggedTaskId === task.id;
                          const overdueInfo = getTaskOverdueInfo(task);
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
                              title={overdueInfo.isOverdue ? overdueInfo.reason : undefined}
                              className={`p-2 rounded-lg shadow-xs cursor-grab active:cursor-grabbing hover:opacity-95 transition-all border ${
                                overdueInfo.isOverdue
                                  ? 'border-red-500/80 dark:border-red-400/75 ring-1 ring-red-500/35'
                                  : 'border-slate-900/10 dark:border-white/15'
                              } ${badge.chipBg} ${isBeingDragged ? 'opacity-40 scale-95 ring-2 ring-white/50' : ''}`}
                            >
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="flex items-center gap-1.5 font-normal truncate">
                                  <SubjectIcon subject={task.subject} size="xs" />
                                  <span className="truncate">{translateSubjectLabel(task.subject, t)}</span>
                                </span>
                                <span className="text-[9px] bg-black/15 dark:bg-black/25 px-1 rounded">{task.points || 20} {t('common:units.pts')}</span>
                              </div>
                              <p className="text-[10px] text-slate-800/85 dark:text-white/90 line-clamp-2 mt-0.5">{task.topic}</p>
                              {overdueInfo.isOverdue && (
                                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[8px] font-normal">
                                  <Flag className="w-2.5 h-2.5 fill-white text-white shrink-0" />
                                  <span>{t('student:roadmap.overdueLabel')}</span>
                                </div>
                              )}
                              <div className="mt-1.5 pt-1 border-t border-slate-900/10 dark:border-white/15 flex items-center justify-between text-[9px]">
                                <span className="font-semibold">{badge.label}</span>
                                <span>
                                  {task.study_time ? `${formatStudyTime(task.study_time)} · ` : ''}
                                  {task.duration_hrs}h
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {dayTasks.length === 0 && (
                          <div className="text-xs text-slate-400 dark:text-white italic py-4 text-center">
                            {getEmptyDayLabel(dayNum)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 text-[10px] font-semibold text-slate-400 dark:text-white">
                      {t('student:roadmap.targetPractice')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4B. DAILY STUDY SCHEDULE VIEW (Current Day / Selected Day Tasks) */}
      {calendarViewMode === 'day' && (() => {
        const visibleDayTasks = selectedDayAllTasks.filter(isTaskVisible);
        const dayDoneCount = visibleDayTasks.filter((t) => t.status === 'Completed').length;
        const dayHours = visibleDayTasks.reduce((sum, t) => sum + (t.duration_hrs || 1.5), 0);
        const dayTotalPts = visibleDayTasks.reduce((sum, t) => sum + (t.points || 20), 0);
        const dayEarnedPts = visibleDayTasks
          .filter((t) => t.status === 'Completed')
          .reduce((sum, t) => sum + (t.points || 20), 0);

        return (
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <h2 className="text-base font-light text-slate-900 dark:text-white tracking-wide">
                    {selectedDateStr === todayStr ? t('student:roadmap.todaysTasksHeading') : t('student:roadmap.dailyTasksHeading')} &bull;{' '}
                    <span className="font-medium">{selectedDayFullLabel}</span>
                  </h2>
                  {selectedDateStr === todayStr && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600">
                      {t('student:roadmap.today')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  {t('student:roadmap.dayTasksSub')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 tabular-nums">
                  {t('student:roadmap.doneRatio', { done: dayDoneCount, total: visibleDayTasks.length })}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 tabular-nums">
                  {t('student:roadmap.plannedHours', { hrs: dayHours })}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 tabular-nums">
                  {dayEarnedPts} / {dayTotalPts} {t('common:units.pts')}
                </span>
                <button
                  type="button"
                  onClick={() => openAddTaskModal(selectedDayNum, selectedDateStr)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs font-normal inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('student:roadmap.addTask')}</span>
                </button>
              </div>
            </div>

            {visibleDayTasks.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50/70 dark:bg-slate-800/35 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
                <Clock className="w-6 h-6 text-slate-400 dark:text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-normal text-slate-800 dark:text-white">
                    {selectedDayAllTasks.length > 0
                      ? t('student:roadmap.hiddenByFilter', { count: selectedDayAllTasks.length })
                      : t('student:roadmap.noScheduledTasks', {
                          date: selectedDayShortLabel,
                          hint: getEmptyDayLabel(selectedDayNum),
                        })}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    {t('student:roadmap.dayTasksSub')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {selectedDayAllTasks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStatusFilter('ALL');
                        setActiveSubjectFilter('ALL');
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-normal text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      {t('student:filters.resetFilters')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openAddTaskModal(selectedDayNum, selectedDateStr)}
                    className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs font-normal inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('student:roadmap.scheduleDayBtn')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {visibleDayTasks.map((task) => {
                  const badge = getStatusBadge(task.status);
                  const overdueInfo = getTaskOverdueInfo(task);
                  const timeWindow = task.study_time
                    ? formatStudyWindow(task.study_time, task.duration_hrs)
                    : t('student:roadmap.flexibleSlot', { hrs: task.duration_hrs });

                  return (
                    <div
                      key={`day-task-${task.id}`}
                      onClick={() => handleOpenTask(task)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 h-full hover:shadow-sm ${
                        overdueInfo.isOverdue
                          ? 'bg-red-50/40 dark:bg-red-950/20 border-red-400/80 dark:border-red-500/65 border-t-4 border-t-red-600 dark:border-t-red-500'
                          : 'bg-slate-50/70 dark:bg-slate-800/45 border-slate-200/80 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="space-y-2.5 min-w-0">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                            <SubjectIcon subject={task.subject} size="sm" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="text-xs font-medium text-slate-900 dark:text-white truncate" title={task.subject}>
                              {translateSubjectLabel(task.subject, t)}
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              {task.is_core && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  {t('student:roadmap.coreTag')}
                                </span>
                              )}
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border ${badge.bg}`}>
                                {badge.icon}
                                <span>{badge.label}</span>
                              </span>
                              {overdueInfo.isOverdue && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-600/15 dark:bg-red-500/20 border border-red-500/45 text-red-600 dark:text-red-400 text-[10px]">
                                  <Flag className="w-2.5 h-2.5 fill-red-600 text-red-600 dark:fill-red-400 dark:text-red-400 shrink-0" />
                                  <span>{t('student:roadmap.overdueLabel')}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-slate-800 dark:text-white leading-snug line-clamp-2" title={task.topic}>
                          {task.topic}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500 dark:text-slate-300 tabular-nums">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{timeWindow}</span>
                          </span>
                          <span>&bull; {task.duration_hrs}h</span>
                          <span>&bull; +{task.points ?? 20} {t('common:units.pts')}</span>
                        </div>

                        {task.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-300 italic line-clamp-2">
                            {task.notes}
                          </p>
                        )}
                      </div>

                      {/* Inline Quick Status & Edit Actions */}
                      <div
                        className="pt-2.5 border-t border-slate-200/70 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          {task.status !== 'In Progress' && task.status !== 'Completed' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(task.id, 'In Progress')}
                              className="px-2.5 py-1 rounded-lg text-[11px] bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 cursor-pointer transition-colors"
                            >
                              {t('student:roadmap.startBtn')}
                            </button>
                          )}
                          {task.status !== 'Completed' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(task.id, 'Completed')}
                              className="px-2.5 py-1 rounded-lg text-[11px] bg-emerald-50/70 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 cursor-pointer transition-colors"
                            >
                              {t('student:roadmap.doneBtn')}
                            </button>
                          )}
                          {task.status === 'Completed' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(task.id, 'Revision')}
                              className="px-2.5 py-1 rounded-lg text-[11px] bg-purple-50/70 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/60 cursor-pointer transition-colors"
                            >
                              {t('student:roadmap.reviseBtn')}
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenTask(task)}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                          title={t('common:actions.edit')}
                          aria-label={t('common:actions.edit')}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* 5. AGILE SPRINT KANBAN BOARD VIEW (To Do, In Progress, On Hold, Revision, Done) */}
      {calendarViewMode === 'sprint' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-light text-slate-900 dark:text-white flex items-center gap-2 tracking-wide">
                  <Layers className="w-4 h-4 text-indigo-600/50 dark:text-indigo-400/50" />
                  {t('student:roadmap.kanbanHeading', { month: currentMonthName })}
                </h2>
                <p className="text-xs text-slate-500 dark:text-white mt-0.5">
                  {t('student:roadmap.kanbanSub')}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {overdueSprintCount > 0 && (
                  <div className="text-xs font-normal text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-950/40 px-3 py-1.5 rounded-xl border border-red-300/70 dark:border-red-700/60 flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 fill-red-600 text-red-600 dark:fill-red-400 dark:text-red-400 shrink-0" />
                    <span>{t('student:roadmap.overdueCount', { count: overdueSprintCount })}</span>
                  </div>
                )}
                <div className="text-xs font-bold text-indigo-600/75 dark:text-indigo-400/75 bg-indigo-50/50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
                  {t('student:roadmap.tasksDoneOfTotal', { done: completedCount, total: totalTasks, month: currentMonthName })}
                </div>
              </div>
            </div>

            {/* 5 Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 mt-5 items-start">
              {(
                [
                  { status: 'To Do', label: t('student:roadmap.todo'), color: 'slate', dot: 'bg-slate-400/50' },
                  { status: 'In Progress', label: t('student:roadmap.inProgress'), color: 'blue', dot: 'bg-blue-500/50 animate-pulse' },
                  { status: 'On Hold', label: t('student:roadmap.onHold'), color: 'amber', dot: 'bg-amber-500/50' },
                  { status: 'Revision', label: t('student:roadmap.revision'), color: 'purple', dot: 'bg-purple-500/50' },
                  { status: 'Completed', label: t('student:roadmap.completed'), color: 'emerald', dot: 'bg-emerald-500/50' },
                ] as const
              ).map((column) => {
                const columnTasks = monthTasks.filter(
                  (tItem) =>
                    tItem.status === column.status &&
                    (activeSubjectFilter === 'ALL' ||
                      (tItem.subject || '').toLowerCase() === activeSubjectFilter.toLowerCase())
                );
                const colPoints = columnTasks.reduce((s, tItem) => s + (tItem.points || 20), 0);

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
                    className="bg-slate-50/50 dark:bg-slate-800/35 rounded-xl p-3 border border-slate-200/50 dark:border-slate-700/40 min-h-[300px] flex flex-col justify-between transition-colors hover:border-indigo-300/50 dark:hover:border-indigo-700/50"
                  >
                    <div>
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${column.dot}`} />
                          <span className="text-xs font-black text-slate-800 dark:text-white">
                            {column.label}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-700 dark:text-white shadow-xs">
                          {columnTasks.length}
                        </span>
                      </div>

                      {/* Column Tasks List */}
                      <div className="mt-3 space-y-2.5">
                        {columnTasks.map((task) => {
                          const isBeingDragged = draggedTaskId === task.id;
                          const overdueInfo = getTaskOverdueInfo(task);
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
                              title={overdueInfo.isOverdue ? overdueInfo.reason : undefined}
                              className={`rounded-xl p-3 border shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${
                                overdueInfo.isOverdue
                                  ? 'bg-red-50/50 dark:bg-red-950/20 border-red-400/80 dark:border-red-500/65 border-l-4 border-l-red-600 dark:border-l-red-500'
                                  : 'bg-white dark:bg-[#111827] border-slate-200/60 dark:border-slate-700/60'
                              } ${isBeingDragged ? 'opacity-40 scale-95 ring-2 ring-indigo-500/50' : ''}`}
                            >
                              <div className="flex items-center justify-between gap-1.5 text-xs font-bold">
                                <span className="flex items-center gap-1.5 font-normal text-slate-900 dark:text-white group-hover:text-indigo-600/75 transition-colors truncate">
                                  <SubjectIcon subject={task.subject} size="xs" />
                                  <span className="truncate">{translateSubjectLabel(task.subject, t)}</span>
                                </span>
                                <span className="text-[10px] font-extrabold bg-amber-50/50 dark:bg-amber-950/25 text-amber-700/75 dark:text-amber-300/75 px-1.5 py-0.5 rounded border border-amber-200/30 dark:border-amber-800/30 shrink-0">
                                  +{task.points || 20} {t('common:units.pts')}
                                </span>
                              </div>

                              {overdueInfo.isOverdue && (
                                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/15 dark:bg-red-500/20 border border-red-500/45 text-red-600 dark:text-red-400 text-[10px] font-normal">
                                  <Flag className="w-3 h-3 fill-red-600 text-red-600 dark:fill-red-400 dark:text-red-400 shrink-0" />
                                  <span>{t('student:roadmap.overdueLabel')}</span>
                                </div>
                              )}

                              <p className="text-xs text-slate-600 dark:text-white mt-1.5 line-clamp-2">
                                {task.topic}
                              </p>

                              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-200">
                                <span>
                                  {t('common:units.day')} {task.day}
                                  {task.study_time ? ` · ${formatStudyTime(task.study_time)}` : ''} · {task.duration_hrs}h
                                </span>
                                {task.is_core && (
                                  <span className="text-indigo-600/75 dark:text-indigo-400/75 font-bold">{t('student:roadmap.coreTag')}</span>
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
                                    title={t('student:roadmap.inProgress')}
                                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50/50 text-blue-700/75 hover:bg-blue-100/50 dark:bg-blue-950/30 dark:text-blue-300/75 cursor-pointer"
                                  >
                                    {t('student:roadmap.inProgress')}
                                  </button>
                                )}
                                {column.status !== 'Completed' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickStatusChange(task.id, 'Completed');
                                    }}
                                    title={t('student:roadmap.completed')}
                                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50/50 text-emerald-700/75 hover:bg-emerald-100/50 dark:bg-emerald-950/30 dark:text-emerald-300/75 cursor-pointer"
                                  >
                                    {t('student:roadmap.done')}
                                  </button>
                                )}
                                {column.status !== 'Revision' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickStatusChange(task.id, 'Revision');
                                    }}
                                    title={t('student:roadmap.revision')}
                                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50/50 text-purple-700/75 hover:bg-purple-100/50 dark:bg-purple-950/30 dark:text-purple-300/75 cursor-pointer"
                                  >
                                    {t('student:roadmap.revision')}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {columnTasks.length === 0 && (
                          <div className="text-xs text-slate-400 dark:text-white italic py-8 text-center border-2 border-dashed border-slate-200/50 dark:border-slate-700/50 rounded-xl">
                            {t('student:roadmap.noTasksInColumn', { column: column.label })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 text-[10px] font-extrabold text-slate-400 dark:text-white text-right">
                      {t('student:roadmap.totalPts', { pts: colPoints })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. ACTION FOOTER BAR: Quick links & Recalculate */}
      <div className="quick-doubts-lollipop flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-500 dark:text-white">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]/50" />
            <span className="font-normal text-slate-700 dark:text-white">{translateSubjectLabel('Mathematics', t)} (1.5h)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]/50" />
            <span className="font-normal text-slate-700 dark:text-white">{translateSubjectLabel('Physics', t)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]/50" />
            <span className="font-normal text-slate-700 dark:text-white">{translateSubjectLabel('History', t)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
            <span className="font-normal text-slate-700 dark:text-white">{t('student:roadmap.completed')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <span className="font-normal text-slate-700 dark:text-white">{t('student:roadmap.onHold')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500/50" />
            <span className="font-normal text-slate-700 dark:text-white">{t('student:roadmap.revision')}</span>
          </span>
        </div>

        <button
          onClick={() => generateStudyPlan()}
          className="text-xs font-normal text-[#4F46E5]/70 dark:text-[#818CF8]/70 hover:underline cursor-pointer flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('student:roadmap.recalculateAiSprints')}</span>
        </button>
      </div>

      {/* 7. INTERACTIVE TASK STATUS & POINTS ("PUBTS") MODAL */}
      {selectedTask && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="font-lollipop-regular bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-normal bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {translateSubjectLabel(selectedTask.subject, t)}
                  </span>
                  <span className="text-xs font-normal text-slate-400 dark:text-white">
                    {t('common:units.day')} {selectedTask.day} · {selectedTask.date}
                  </span>
                </div>
                <h3 className="text-lg font-normal text-slate-900 dark:text-white mt-1.5 tracking-wide">
                  {t('student:roadmap.editModalTitle')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              {/* Topic / Title */}
              <div>
                <label className="block text-xs font-normal text-slate-700 dark:text-white mb-1">
                  {t('student:roadmap.topic')}
                </label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-normal focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              {/* Status Picker: 5 Choices (In Progress, On Hold, Completed, Revision, To Do) */}
              <div>
                <label className="block text-xs font-normal text-slate-700 dark:text-white mb-2">
                  {t('student:roadmap.status')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { status: 'In Progress', label: t('student:roadmap.inProgress'), icon: <TrendingUp className="w-3.5 h-3.5" />, activeBg: 'bg-blue-600/50 text-slate-900 dark:text-white border-blue-600/50' },
                      { status: 'On Hold', label: t('student:roadmap.onHold'), icon: <Pause className="w-3.5 h-3.5" />, activeBg: 'bg-amber-600/50 text-slate-900 dark:text-white border-amber-600/50' },
                      { status: 'Completed', label: t('student:roadmap.completed'), icon: <CheckCircle2 className="w-3.5 h-3.5" />, activeBg: 'bg-emerald-600/50 text-slate-900 dark:text-white border-emerald-600/50' },
                      { status: 'Revision', label: t('student:roadmap.revision'), icon: <RotateCcw className="w-3.5 h-3.5" />, activeBg: 'bg-purple-600/50 text-slate-900 dark:text-white border-purple-600/50' },
                      { status: 'To Do', label: t('student:roadmap.todo'), icon: <Clock className="w-3.5 h-3.5" />, activeBg: 'bg-slate-700/50 text-slate-900 dark:text-white border-slate-700/50' },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.status}
                      type="button"
                      onClick={() => setEditStatus(option.status)}
                      className={`px-3 py-2 rounded-xl text-xs font-normal flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        editStatus === option.status
                          ? `${option.activeBg} shadow-xs font-normal`
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Points (XP) Stepper & Input */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-normal text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500/50" />
                      {t('student:roadmap.storyPoints')}
                    </label>
                  </div>

                  {/* Stepper controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditPoints((prev) => Math.max(5, prev - 5))}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-normal text-slate-700 dark:text-white hover:bg-slate-100 cursor-pointer"
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
                      className="w-16 text-center py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-normal text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setEditPoints((prev) => Math.min(100, prev + 5))}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-normal text-slate-700 dark:text-white hover:bg-slate-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 text-[11px]">
                  {[10, 15, 20, 25, 30, 50].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setEditPoints(pts)}
                      className={`px-2 py-0.5 rounded-md font-normal transition-colors cursor-pointer ${
                        editPoints === pts
                          ? 'bg-amber-500/50 text-slate-900 dark:text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 hover:bg-amber-50/50'
                      }`}
                    >
                      {pts}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date, Study Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-normal text-slate-700 dark:text-white mb-1">
                    {t('student:roadmap.date')}
                  </label>
                  <input
                    type="date"
                    value={editDateStr}
                    onChange={(e) => setEditDateStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal text-slate-700 dark:text-white mb-1">
                    {t('student:roadmap.studyTime')}
                  </label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal text-slate-700 dark:text-white mb-1">
                    {t('student:roadmap.duration')}
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    max={6}
                    step={0.5}
                    value={editDuration}
                    onChange={(e) => setEditDuration(Number(e.target.value) || 1.5)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-normal"
                  />
                </div>
              </div>

              {/* Study Notes */}
              <div>
                <label className="block text-xs font-normal text-slate-700 dark:text-white mb-1">
                  {t('student:roadmap.notes')}
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-normal focus:ring-2 focus:ring-indigo-500/50 focus:outline-hidden"
                />
              </div>

              {/* Module 2 & 5: Deliverable Submission, Grades/Feedback & Custom Approval Status */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-normal text-slate-900 dark:text-white">
                    <Upload className="w-3.5 h-3.5 text-[#00A896]" />
                    <span>{t('student:roadmap.deliverableFeedbackHeading')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedTask.isCustom && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] border ${
                          selectedTask.approvalStatus === 'Approved' || selectedTask.approvalStatus === 'Modified'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : selectedTask.approvalStatus === 'Rejected'
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {t(`student:roadmap.customCategories.${selectedTask.customCategory || 'Custom Task'}`, {
                          defaultValue: selectedTask.customCategory || 'Custom',
                        })}
                        : {translateStatusLabel(selectedTask.approvalStatus || 'Pending Approval', t)}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      {translateStatusLabel(selectedTask.submissionStatus || 'Pending', t)}
                    </span>
                  </div>
                </div>

                {selectedTask.adminReviewNote && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-200">
                    {selectedTask.adminReviewNote}
                  </div>
                )}

                {selectedTask.score !== undefined && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                      <span>{selectedTask.gradedBy || t('common:header.adminRoleShort')}</span>
                      <span className="tabular-nums">
                        {selectedTask.score} / {selectedTask.maxScore || 100}
                      </span>
                    </div>
                    {selectedTask.feedback && (
                      <p className="text-[11px] text-slate-700 dark:text-slate-200">{selectedTask.feedback}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: 'Code', icon: <Code2 className="w-3 h-3" /> },
                      { id: 'Document', icon: <FileText className="w-3 h-3" /> },
                      { id: 'Link', icon: <Link2 className="w-3 h-3" /> },
                      { id: 'Note', icon: <Edit3 className="w-3 h-3" /> },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSubType(item.id)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] border flex items-center justify-center gap-1 cursor-pointer ${
                        subType === item.id
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-400 dark:border-slate-500'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {item.icon}
                      <span>{t(`student:roadmap.deliverableTypes.${item.id}`)}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    placeholder="Deliverable title (e.g. lab_solution.py)"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  <label className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="truncate">{subFileName || 'Attach file (optional)'}</span>
                    <Upload className="w-3.5 h-3.5 text-[#00A896] shrink-0" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSubFileName(file.name);
                          if (!subTitle) setSubTitle(file.name);
                        }
                      }}
                    />
                  </label>
                </div>

                <textarea
                  rows={2}
                  value={subContent}
                  onChange={(e) => setSubContent(e.target.value)}
                  placeholder="Paste code snippet, Google Doc/GitHub URL, or assignment summary..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />

                <div className="flex items-center justify-between gap-2">
                  {subSuccessMsg ? (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">{subSuccessMsg}</span>
                  ) : (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {t('student:roadmap.deliverableFeedbackHeading')}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const title = subTitle.trim() || `${selectedTask.subject} Deliverable`;
                      submitTaskDeliverable(selectedTask.id, {
                        submissionType: subType,
                        submissionTitle: title,
                        submissionContent: subContent.trim() || 'Submitted via Student Roadmap',
                        submissionFileName: subFileName || undefined,
                      });
                      setSelectedTask((prev) =>
                        prev
                          ? {
                              ...prev,
                              submissionStatus: 'Submitted',
                              submissionType: subType,
                              submissionTitle: title,
                              submissionContent: subContent.trim() || 'Submitted via Student Roadmap',
                              submissionFileName: subFileName || undefined,
                              submittedAt: 'Just now',
                            }
                          : prev
                      );
                      setSubSuccessMsg(t('student:roadmap.deliverableSubmitted'));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-[11px] cursor-pointer transition-colors"
                  >
                    {t('student:roadmap.submitDeliverable')}
                  </button>
                </div>
              </div>

              {/* AI Doubts Direct Shortcut */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl p-3 border border-indigo-200/50 dark:border-indigo-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600/50 dark:text-indigo-400/50" />
                  <span className="text-xs font-normal text-indigo-900/80 dark:text-indigo-200/80">
                    {t('student:roadmap.askTutorShortcut', { subject: translateSubjectLabel(selectedTask.subject, t) })}
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
                  className="text-xs font-normal text-indigo-600/75 dark:text-indigo-400/75 hover:underline cursor-pointer"
                >
                  {t('student:roadmap.askTutorLink')}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="px-3 py-2 rounded-xl text-rose-600/75 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-xs font-normal flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('common:actions.delete')}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-normal text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {t('common:actions.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600/50 hover:bg-indigo-600/65 text-slate-900 dark:text-white text-xs font-normal shadow-xs cursor-pointer transition-colors"
                  >
                    {t('student:roadmap.saveTask')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. ADD NEW TASK MODAL (With Interactive Calendar + Study Time Slot Picker) */}
      {isNewTaskOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="font-lollipop-regular bg-white dark:bg-[#111827] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-normal text-slate-900 dark:text-white tracking-wide">
                  {t('student:roadmap.newModalTitle')}
                </h3>
                <p className="text-xs font-normal text-slate-500 dark:text-white mt-0.5">
                  {t('student:roadmap.newModalSub')}
                </p>
              </div>
              <button
                onClick={() => setIsNewTaskOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTask} className="space-y-4">
              {/* Interactive Calendar Date Picker + Study Time & Duration Panel */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                {/* Mini Calendar Column */}
                <div className="md:col-span-7 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-normal text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{t('student:roadmap.selectStudyDay')}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setPickerCalendarDate(
                            (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                          )
                        }
                        className="p-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-white hover:bg-slate-100 cursor-pointer"
                        aria-label={t('student:roadmap.prevMonth')}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-normal text-slate-800 dark:text-white min-w-[100px] text-center">
                        {pickerMonthLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPickerCalendarDate(
                            (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                          )
                        }
                        className="p-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-white hover:bg-slate-100 cursor-pointer"
                        aria-label={t('student:roadmap.nextMonth')}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Weekday Header */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-normal text-slate-400 dark:text-slate-300">
                    <div>{t('student:roadmap.weekdaysMin.mon')}</div>
                    <div>{t('student:roadmap.weekdaysMin.tue')}</div>
                    <div>{t('student:roadmap.weekdaysMin.wed')}</div>
                    <div>{t('student:roadmap.weekdaysMin.thu')}</div>
                    <div>{t('student:roadmap.weekdaysMin.fri')}</div>
                    <div>{t('student:roadmap.weekdaysMin.sat')}</div>
                    <div>{t('student:roadmap.weekdaysMin.sun')}</div>
                  </div>

                  {/* Calendar Day Cells */}
                  <div className="grid grid-cols-7 gap-1">
                    {pickerCalendarDays.map((cell, idx) => {
                      if (!cell) {
                        return <div key={`empty-${idx}`} className="h-8" />;
                      }
                      const isSelected = newTaskDateStr === cell.dateStr;
                      const dayScheduledCount = dailyTasks.filter(
                        (tItem) =>
                          tItem.date === cell.dateStr ||
                          (!tItem.date &&
                            pickerMonthIndex === 9 &&
                            pickerYear === 2026 &&
                            tItem.day === cell.day)
                      ).length;

                      return (
                        <button
                          key={cell.dateStr}
                          type="button"
                          onClick={() => {
                            setNewTaskDateStr(cell.dateStr);
                            setNewTaskDay(cell.day);
                          }}
                          className={`h-8 rounded-lg text-[11px] font-normal flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/50 text-slate-900 dark:text-white shadow-xs ring-2 ring-indigo-500/20'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20'
                          }`}
                        >
                          <span className="leading-none">{cell.day}</span>
                          {dayScheduledCount > 0 && (
                            <span
                              className={`w-1 h-1 rounded-full mt-0.5 ${
                                isSelected ? 'bg-slate-200 dark:bg-slate-300' : 'bg-slate-400 dark:bg-slate-500'
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 text-[10px] text-slate-500 dark:text-slate-300">
                    <span>
                      <span className="font-normal text-slate-800 dark:text-white">
                        {new Date(newTaskDateStr + 'T00:00:00').toLocaleDateString(intlLocale, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                    <input
                      type="date"
                      value={newTaskDateStr}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const [y, m, d] = val.split('-').map(Number);
                        setNewTaskDateStr(val);
                        if (d) setNewTaskDay(d);
                        if (y && m) setPickerCalendarDate(new Date(y, m - 1, 1));
                      }}
                      aria-label={t('student:roadmap.date')}
                      className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[10px] font-normal text-slate-700 dark:text-white cursor-pointer"
                    />
                  </div>
                </div>

                {/* Study Time & Duration Column */}
                <div className="md:col-span-5 space-y-3 md:border-l md:border-slate-200 dark:md:border-slate-700 md:pl-4">
                  <div>
                    <label className="block text-xs font-normal text-slate-800 dark:text-white mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                      <span>{t('student:roadmap.studyTime')}</span>
                    </label>
                    <input
                      type="time"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-normal cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-300 mb-1">
                      {t('student:roadmap.quickTimeSlots')}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: '7:30 AM', val: '07:30' },
                        { label: '4:00 PM', val: '16:00' },
                        { label: '6:30 PM', val: '18:30' },
                        { label: '8:30 PM', val: '20:30' },
                      ].map((slot) => (
                        <button
                          key={slot.val}
                          type="button"
                          onClick={() => setNewTaskTime(slot.val)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-normal border transition-colors cursor-pointer ${
                            newTaskTime === slot.val
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-400 dark:border-slate-500'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-white border-slate-200 dark:border-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-normal text-slate-800 dark:text-white mb-1">
                      {t('student:roadmap.duration')}
                    </label>
                    <select
                      value={newTaskDuration}
                      onChange={(e) => setNewTaskDuration(Number(e.target.value) || 1.5)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-normal cursor-pointer"
                    >
                      <option value={0.5}>0.5 {t('common:units.hrs')} (30 {t('common:units.min')})</option>
                      <option value={1}>1.0 {t('common:units.hrs')} (60 {t('common:units.min')})</option>
                      <option value={1.5}>1.5 {t('common:units.hrs')} (90 {t('common:units.min')})</option>
                      <option value={2}>2.0 {t('common:units.hrs')}</option>
                      <option value={2.5}>2.5 {t('common:units.hrs')}</option>
                      <option value={3}>3.0 {t('common:units.hrs')}</option>
                    </select>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/25 border border-indigo-200/40 dark:border-indigo-800/40 text-[10px] text-indigo-800/80 dark:text-indigo-200/80">
                    <span className="font-normal block">{t('student:roadmap.scheduledWindow')}</span>
                    <span>
                      {formatStudyWindow(newTaskTime, newTaskDuration)} ({newTaskDuration}h)
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Dropdown */}
              <div>
                <label className="block text-xs font-normal text-slate-700 dark:text-white mb-1">
                  {t('student:roadmap.subject')} ({t('student:dashboard.gradeLabel')} {studentGradeLevel} &bull; {translateBoardLabel(currentBoard, t)})
                </label>
                <select
                  value={newTaskSubject}
                  onChange={(e) => setNewTaskSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-normal cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                >
                  {enrolledSubjectNames.length > 0 && (
                    <optgroup label={t('student:roadmap.mySelectedSubjects')}>
                      {enrolledSubjectNames.map((subjName) => (
                        <option key={`add-enr-${subjName}`} value={subjName}>
                          {translateSubjectLabel(subjName, t)}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {otherSubjectNames.length > 0 && (
                    <optgroup label={t('student:roadmap.gradeCurriculumGroup', { grade: studentGradeLevel, board: translateBoardLabel(currentBoard, t) })}>
                      {otherSubjectNames.map((subjName) => (
                        <option key={`add-oth-${subjName}`} value={subjName}>
                          {translateSubjectLabel(subjName, t)}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {allDropdownSubjectNames.length === 0 && (
                    <>
                      <option value="Mathematics">{translateSubjectLabel('Mathematics', t)}</option>
                      <option value="Physics">{translateSubjectLabel('Physics', t)}</option>
                      <option value="Chemistry">{translateSubjectLabel('Chemistry', t)}</option>
                      <option value="Biology">{translateSubjectLabel('Biology', t)}</option>
                      <option value="Computer Science">{translateSubjectLabel('Computer Science', t)}</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-normal text-slate-700 dark:text-white">
                  {t('student:roadmap.topicTitle')}
                </label>
                <input
                  type="text"
                  list="roadmap-curriculum-topics"
                  placeholder={t('student:roadmap.topicPlaceholder')}
                  value={newTaskTopic}
                  onChange={(e) => setNewTaskTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-normal"
                  required
                />
                <datalist id="roadmap-curriculum-topics">
                  {suggestedTopicsForSelectedSubject.map((topItem) => (
                    <option key={topItem.id} value={topItem.title} />
                  ))}
                </datalist>

                {suggestedTopicsForSelectedSubject.length > 0 && (
                  <div className="pt-1 space-y-1">
                    <span className="text-[10px] font-normal text-slate-500 dark:text-white/80 block">
                      {t('student:roadmap.quickPickTopics', { subject: translateSubjectLabel(newTaskSubject, t) })}
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {suggestedTopicsForSelectedSubject.map((top) => (
                        <button
                          key={top.id}
                          type="button"
                          onClick={() => setNewTaskTopic(top.title)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-normal border transition-colors cursor-pointer ${
                            newTaskTopic === top.title
                              ? 'bg-indigo-600/50 text-slate-900 dark:text-white border-indigo-600/50'
                              : 'bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700/75 dark:text-indigo-300/75 border-indigo-200/50 dark:border-indigo-800/50 hover:bg-indigo-100/50'
                          }`}
                        >
                          + {top.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-normal text-slate-700 dark:text-white mb-1">
                    {t('student:roadmap.initialStatus')}
                  </label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as StudyTaskStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-normal"
                  >
                    <option value="To Do">{t('student:roadmap.todo')}</option>
                    <option value="In Progress">{t('student:roadmap.inProgress')}</option>
                    <option value="On Hold">{t('student:roadmap.onHold')}</option>
                    <option value="Revision">{t('student:roadmap.revision')}</option>
                    <option value="Completed">{t('student:roadmap.completed')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-normal text-slate-700 dark:text-white mb-1">
                    {t('student:roadmap.storyPoints')}
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    step={5}
                    value={newTaskPoints}
                    onChange={(e) => setNewTaskPoints(Number(e.target.value) || 25)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-normal"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs font-normal text-slate-700 dark:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTaskIsCustom}
                      onChange={(e) => setNewTaskIsCustom(e.target.checked)}
                      className="rounded text-[#00A896] focus:ring-[#00A896]"
                    />
                    <span>{t('student:roadmap.proposeCustom')}</span>
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as 'Normal' | 'High')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="Normal">{t('student:roadmap.priorityNormal')}</option>
                    <option value="High">{t('student:roadmap.priorityHigh')}</option>
                  </select>
                </div>

                {newTaskIsCustom && (
                  <div className="grid grid-cols-3 gap-2">
                    {(['Custom Task', 'Side Project', 'Self-Paced Milestone'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewTaskCustomCategory(cat)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] border cursor-pointer transition-colors ${
                          newTaskCustomCategory === cat
                            ? 'bg-[#00A896] text-white border-[#00A896]'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {t(`student:roadmap.customCategories.${cat}`)}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newCoreCheckbox"
                    checked={newTaskIsCore}
                    onChange={(e) => setNewTaskIsCore(e.target.checked)}
                    className="rounded text-indigo-600/50 focus:ring-indigo-500/50"
                  />
                  <label htmlFor="newCoreCheckbox" className="text-xs font-normal text-slate-700 dark:text-white cursor-pointer">
                    {t('student:roadmap.markCoreCheckbox')}
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-normal text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t('common:actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600/50 hover:bg-indigo-600/65 text-slate-900 dark:text-white text-xs font-normal shadow-xs cursor-pointer transition-colors"
                >
                  {t('student:roadmap.addToRoadmap')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offline Mode & Low-Bandwidth Modal */}
      <OfflineStudyPackModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
      />

      {/* Parental Weekly Digest Modal */}
      <ParentWeeklyDigestModal
        isOpen={isParentDigestOpen}
        onClose={() => setIsParentDigestOpen(false)}
      />
    </div>
  );
};
