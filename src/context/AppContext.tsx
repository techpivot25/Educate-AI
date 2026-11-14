import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
export { useTheme } from './ThemeContext';
import {
  UserRole,
  AppUser,
  ChatMessage,
  StudentDoubt,
  QuickDoubtItem,
  LessonPlan,
  Quiz,
  ProctorFeed,
  AnomalyLog,
  StudentProfile,
  TeacherProfile,
  AiSuggestion,
  DigitalCertificate,
  CrossPanelNotification,
  AnomalyType,
  CurriculumItem,
  StudentGradeGrowth,
  DBSubject,
  DBTopic,
  DBSchool,
  StudentNavTab,
  MeetingInvite,
  CommunityPost,
  CommunityComment,
  ForumStudyGroup,
  ForumResourceItem,
  DailyStudyTask,
  WeeklySprintAllocation,
  MasterChapterItem,
  SubscriptionState,
  EducationBoard,
  QuickDoubtChatTurn,
  GuardianEscalationReceipt,
} from '../types';
import {
  DEFAULT_SUBJECTS_DB,
  DEFAULT_TOPICS_DB,
  SAMPLE_STUDENT_ACADEMIC_GROWTH,
} from '../data/curriculumData';
import {
  PLANT_CELLS_QUIZ_QUESTIONS,
  NEWTONS_LAWS_QUIZ_QUESTIONS,
  ALGEBRA_QUADRATICS_QUIZ_QUESTIONS,
} from '../data/practiceQuizQuestions';
import {
  detectFoulLanguage,
  detectStressOrMedicalQuery,
  STRICT_PARENT_DOCTOR_ONLY_RESPONSE,
} from '../utils/safetyGuard';
import { captureQuickDoubtScreenshot } from '../utils/captureScreenshot';

export interface BroadcastedQuizInfo {
  quiz: Quiz;
  targetClass: string;
  broadcastAt: string;
  timeLimit?: string;
  proctoringEnabled?: boolean;
}

interface AppContextType {
  // Theme State
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Curriculum & Grades 6-12 Global Context
  curriculumList: CurriculumItem[];
  activeGrades: number[];
  setActiveGrades: (grades: number[]) => void;
  toggleGradeFilter: (grade: number) => void;
  activeCategories: string[];
  setActiveCategories: (cats: string[]) => void;
  toggleCategoryFilter: (cat: string) => void;
  teacherSubjectContext: string;
  setTeacherSubjectContext: (ctx: string) => void;
  studentAcademicGrowth: StudentGradeGrowth[];
  isCurriculumModalOpen: boolean;
  setIsCurriculumModalOpen: (open: boolean) => void;
  ecosystemOverviewMode: boolean;
  setEcosystemOverviewMode: (val: boolean) => void;

  // Real-Time Dynamic Subjects & Topics DB State
  subjectsDB: DBSubject[];
  topicsDB: DBTopic[];
  isCurriculumSyncing: boolean;
  fetchCurriculum: () => Promise<void>;
  createSubject: (subject: { name: string; grade_level: number; board?: EducationBoard | 'ALL'; category?: any; code?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => Promise<DBSubject | null>;
  updateSubject: (id: string, updates: Partial<DBSubject>) => Promise<DBSubject | null>;
  deleteSubject: (id: string) => Promise<boolean>;
  createTopic: (topic: { subject_id: string; title: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => Promise<DBTopic | null>;
  updateTopic: (id: string, updates: Partial<DBTopic>) => Promise<DBTopic | null>;
  deleteTopic: (id: string) => Promise<boolean>;

  // Authentication & Current User
  isAuthenticated: boolean;
  currentUser: AppUser | null;
  login: (role: UserRole, email?: string, password?: string) => boolean;
  logout: () => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  updateCurrentUser: (updates: Partial<AppUser>) => void;

  // User Management (Admin CRUD)
  usersList: AppUser[];
  addUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;

  // Role & Navigation
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  globalSearch: string;
  setGlobalSearch: (term: string) => void;
  studentNav: StudentNavTab;
  setStudentNav: (nav: StudentNavTab) => void;
  adminNav: 'dashboard' | 'users' | 'curriculum' | 'teachers' | 'students' | 'config' | 'certificates' | 'analytics';
  setAdminNav: (nav: 'dashboard' | 'users' | 'curriculum' | 'teachers' | 'students' | 'config' | 'certificates' | 'analytics') => void;

  // Google Maps & Institutional Schools
  schools: DBSchool[];
  fetchSchools: (q?: string) => Promise<DBSchool[]>;
  registerSchool: (school: { name: string; address?: string; lat?: number; lng?: number }) => Promise<DBSchool>;

  // Live Meetings & Google Meet Integration
  meetingInvites: MeetingInvite[];
  activeStudentMeeting: MeetingInvite | null;
  createMeetingInvite: (data: any) => Promise<MeetingInvite | null>;
  dismissStudentMeetingAlert: () => void;

  // Community Doubt Forum with Automated AI Moderation
  communityPosts: CommunityPost[];
  forumStudyGroups: ForumStudyGroup[];
  forumResources: ForumResourceItem[];
  forumPoints: number;
  peerAnswersThisWeek: number;
  liveSessionRsvp: boolean;
  toggleLiveSessionRsvp: () => void;
  addCommunityPost: (data: any) => Promise<{ success: boolean; error?: string }>;
  addCommunityComment: (postId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  upvoteCommunityPost: (postId: string) => Promise<void>;
  upvoteCommunityComment: (postId: string, commentId: string) => Promise<void>;
  acceptCommunityComment: (postId: string, commentId: string) => Promise<void>;
  flagCommunityPost: (postId: string, reason?: string) => Promise<void>;
  resolveFlaggedCommunityPost: (postId: string, action: 'dismiss' | 'remove') => void;
  verifyCommunityPost: (postId: string, solution: string) => Promise<void>;
  joinOrLeaveStudyGroup: (groupId: string) => void;
  createStudyGroup: (groupData: {
    name: string;
    subject: string;
    chapter_unit: string;
    grade_level: number;
    availability: string;
    focus_goal: string;
  }) => void;
  addStudyGroupMessage: (groupId: string, content: string) => void;
  addForumResource: (resource: {
    title: string;
    resource_type: 'Notes' | 'Previous Paper' | 'Revision Material' | 'Recommended Video';
    subject: string;
    chapter_unit: string;
    grade_level: number;
    description: string;
    url?: string;
  }) => void;
  upvoteForumResource: (resourceId: string) => void;

  // Subscription & 7-Day Free Trial
  subscriptionState: SubscriptionState;
  updateSubscription: (updates: Partial<SubscriptionState>) => void;

  // Agile Study Planner
  dailyTasks: DailyStudyTask[];
  setDailyTasks: React.Dispatch<React.SetStateAction<DailyStudyTask[]>>;
  updateStudyTask: (taskId: string, updates: Partial<DailyStudyTask>) => void;
  addStudyTask: (task: DailyStudyTask) => void;
  deleteStudyTask: (taskId: string) => void;
  weeklySprints: WeeklySprintAllocation[];
  masterChapters: MasterChapterItem[];
  generateStudyPlan: (params?: any) => Promise<void>;
  exportStudyPlanSpreadsheet: () => void;

  // Global Localization & Education Boards
  globalLanguage: string;
  setGlobalLanguage: (lang: string) => void;
  currentBoard: string;
  setCurrentBoard: (board: string) => void;

  // Registration / Onboarding
  signup: (data: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    grade?: string;
    grade_level?: number | string;
    education_board?: string;
    preferred_language?: string;
    school_name?: string;
    school_address?: string;
    school_lat?: number;
    school_lng?: number;
    school_id?: string;
    mobile_number?: string;
    guardian_name?: string;
    guardian_phone?: string;
    guardian_email?: string;
  }) => Promise<boolean>;

  // Student State
  chatMessages: ChatMessage[];
  isAiTyping: boolean;
  sendTutorMessage: (text: string) => Promise<void>;
  chapterProgress: number; // 75% for Physics Ch 2
  setChapterProgress: (val: number) => void;
  doubts: StudentDoubt[];
  addDoubt: (question: string, subject: string, topic?: string) => Promise<void>;
  resolveDoubt: (id: string) => void;
  quickDoubts: QuickDoubtItem[];
  askQuickDoubtAI: (
    question: string,
    subject: string,
    options?: {
      topic?: string;
      gradeLevel?: number | string;
      board?: string;
      medium?: string;
      imageBase64?: string;
      imageMimeType?: string;
      imagePreview?: string;
      surfaceLabel?: string;
    }
  ) => Promise<string | undefined>;
  continueQuickDoubtChat: (
    doubtId: string,
    followUpText: string,
    options?: {
      imageBase64?: string;
      imageMimeType?: string;
      imagePreview?: string;
      surfaceLabel?: string;
    }
  ) => Promise<void>;
  deleteQuickDoubt: (id: string) => void;
  clearQuickDoubts: () => void;

  // Teacher State
  lessonPlans: LessonPlan[];
  quizzes: Quiz[];
  setQuizzes: React.Dispatch<React.SetStateAction<Quiz[]>>;
  aiSuggestions: AiSuggestion[];
  isDraftingPlan: boolean;
  isDraftingQuiz: boolean;
  draftLessonPlan: (topic: string, grade: string, style: string) => Promise<LessonPlan | null>;
  draftQuiz: (prompt: string) => Promise<Quiz | null>;
  recordQuizSubmission: (quizId: string, answers: { [qIndex: number]: number }) => {
    score: number;
    correctCount: number;
    totalQuestions: number;
    certificateIssued?: DigitalCertificate;
  };
  completeCurriculumUnit: (subjectName: string, unitTitle: string) => void;
  syncStudentProgressAcrossPanels: (tasks?: DailyStudyTask[], triggerTask?: DailyStudyTask) => void;
  activeBroadcastQuiz: BroadcastedQuizInfo | null;
  setActiveBroadcastQuiz: (info: BroadcastedQuizInfo | null) => void;
  publishQuiz: (quiz: Quiz, targetClass?: string) => void;
  dismissSuggestion: (id: string) => void;

  // Admin & Proctoring State
  proctorFeeds: ProctorFeed[];
  anomalyLogs: AnomalyLog[];
  localWebcamActive: boolean;
  setLocalWebcamActive: (val: boolean) => void;
  triggerAnomaly: (feedId: string, anomalyType: AnomalyType) => void;
  resolveAnomaly: (logId: string) => void;
  studentsList: StudentProfile[];
  setStudentsList: React.Dispatch<React.SetStateAction<StudentProfile[]>>;
  teachersList: TeacherProfile[];
  certificates: DigitalCertificate[];
  issueCertificate: (studentName: string, courseTitle: string, score: number) => DigitalCertificate;

  // Proctoring Settings
  sensitivity: {
    gazeThreshold: number;
    rotationAngle: number;
    multiFaceDetection: boolean;
    audioThreshold: number;
  };
  setSensitivity: React.Dispatch<React.SetStateAction<{
    gazeThreshold: number;
    rotationAngle: number;
    multiFaceDetection: boolean;
    audioThreshold: number;
  }>>;

  // Cross-panel notifications
  notifications: CrossPanelNotification[];
  removeNotification: (id: string) => void;
  addNotification: (title: string, description: string, type: CrossPanelNotification['type'], source?: UserRole | 'system') => void;
}

const INITIAL_USERS: AppUser[] = [
  {
    id: 'user-stu-2',
    name: 'Alex Rivera',
    email: 'alex.r@educateai.org',
    role: 'student',
    status: 'Active',
    createdAt: '2024-08-15',
    grade: 'Grade 10 - Science',
    grade_level: 10,
    education_board: 'CBSE',
    preferred_language: 'en',
    school_name: 'D.A.V. Public School, Sector 8',
    school_address: 'Sector 8-C, Chandigarh, Punjab & Haryana, India',
    school_lat: 30.7398,
    school_lng: 76.7827,
    enrollmentDate: 'Aug 2024',
    enrolledCourses: [
      'Algebra I (MTH-101)',
      'Physics II (PHY-201)',
      'World History (HIS-101)',
      'Chemistry (CHM-101)',
      'English Literature (ENG-201)',
      'Computer Science (CSC-301)',
    ],
    overallProgress: 88,
    physicsProgress: 85,
    biologyProgress: 80,
    mathProgress: 95,
    attendance: 98,
    gpa: 3.82,
  },
  {
    id: 'user-stu-1',
    name: 'Sarah Connor',
    email: 'sarah.c@educateai.org',
    role: 'student',
    status: 'Active',
    createdAt: '2025-09-01',
    grade: '8th Grade',
    grade_level: 8,
    education_board: 'CBSE',
    preferred_language: 'en',
    school_name: 'Delhi Public School, R.K. Puram',
    school_address: 'Kaifi Azmi Marg, New Delhi, India',
    enrollmentDate: 'Sep 1, 2025',
    enrolledCourses: ['Physics (PHY-101)', 'Biology (BIO-201)', 'Mathematics (MTH-102)', 'Computer Science (CSC-301)'],
    overallProgress: 84,
    physicsProgress: 75,
    biologyProgress: 88,
    mathProgress: 92,
    attendance: 98,
    gpa: 3.85,
  },
  {
    id: 'user-stu-3',
    name: 'Liam Chen',
    email: 'liam.c@educateai.org',
    role: 'student',
    status: 'Active',
    createdAt: '2025-08-28',
    grade: '8th Grade',
    enrollmentDate: 'Aug 28, 2025',
    enrolledCourses: ['Physics', 'Honors Chemistry', 'Calculus'],
    overallProgress: 96,
    physicsProgress: 94,
    biologyProgress: 96,
    mathProgress: 98,
    attendance: 100,
    gpa: 3.95,
  },
  {
    id: 'user-stu-4',
    name: 'Carlos Mendez',
    email: 'carlos.m@educateai.org',
    role: 'student',
    status: 'Active',
    createdAt: '2025-09-08',
    grade: '7th Grade',
    enrollmentDate: 'Sep 8, 2025',
    enrolledCourses: ['Science 7B', 'Algebra', 'Art'],
    overallProgress: 76,
    physicsProgress: 72,
    biologyProgress: 76,
    mathProgress: 81,
    attendance: 94,
    gpa: 3.5,
  },
  {
    id: 'user-stu-5',
    name: 'Zoe Washington',
    email: 'zoe.w@educateai.org',
    role: 'student',
    status: 'Active',
    createdAt: '2025-09-02',
    grade: '8th Grade',
    enrollmentDate: 'Sep 2, 2025',
    enrolledCourses: ['Physics', 'Biology', 'Geometry'],
    overallProgress: 78,
    physicsProgress: 68,
    biologyProgress: 80,
    mathProgress: 85,
    attendance: 95,
    gpa: 3.65,
  },
  {
    id: 'user-stu-6',
    name: 'Daniel Vance',
    email: 'daniel.v@educateai.org',
    role: 'student',
    status: 'Inactive',
    createdAt: '2025-09-10',
    grade: '8th Grade',
    enrollmentDate: 'Sep 10, 2025',
    enrolledCourses: ['Physics', 'General Science', 'World History'],
    overallProgress: 55,
    physicsProgress: 45,
    biologyProgress: 58,
    mathProgress: 63,
    attendance: 86,
    gpa: 3.1,
  },
  {
    id: 'user-tch-1',
    name: 'Ms. Elena Rostova',
    email: 'elena.r@educateai.org',
    role: 'teacher',
    status: 'Active',
    createdAt: '2024-08-15',
    department: 'Life Sciences & Biology',
    assignedSubjects: ['Biology & Life Sciences', 'AP Environmental Science'],
    assignedCohorts: ['Class 7B - Science', 'Class 8C - Advanced Biology'],
    createdLessonPlansCount: 24,
    activeStudentsCount: 58,
  },
  {
    id: 'user-tch-2',
    name: 'Dr. David Vance',
    email: 'david.v@educateai.org',
    role: 'teacher',
    status: 'Active',
    createdAt: '2024-08-10',
    department: 'STEM & Physics',
    assignedSubjects: ['Physics & STEM', 'Classical Mechanics'],
    assignedCohorts: ['Class 8A - Physics', 'Class 9B - Mechanics'],
    createdLessonPlansCount: 31,
    activeStudentsCount: 62,
  },
  {
    id: 'user-tch-3',
    name: 'Mrs. Maria Santos',
    email: 'maria.s@educateai.org',
    role: 'teacher',
    status: 'Active',
    createdAt: '2024-09-01',
    department: 'Pure & Applied Mathematics',
    assignedSubjects: ['Pure & Applied Mathematics', 'Algebra & Geometry'],
    assignedCohorts: ['Class 7A - Pre-Algebra', 'Class 8A - Geometry'],
    createdLessonPlansCount: 19,
    activeStudentsCount: 54,
  },
  {
    id: 'user-adm-1',
    name: 'Dr. Marcus Vance',
    email: 'admin@educateai.org',
    role: 'admin',
    status: 'Active',
    createdAt: '2024-01-01',
    permissionLevel: 'Super Admin',
    activityLogs: [
      { id: 'act-1', timestamp: 'Today, 09:15 AM', action: 'System health check completed. All microservices operational.' },
      { id: 'act-2', timestamp: 'Today, 09:02 AM', action: 'Proctoring engine flagged anomaly for Feed 2 and Feed 6.' },
      { id: 'act-3', timestamp: 'Yesterday, 04:30 PM', action: 'Issued digital certificate EDU-AI-2026-98124 for Sarah Connor.' },
      { id: 'act-4', timestamp: 'Yesterday, 02:10 PM', action: 'Updated proctoring sensitivity threshold for Head Rotation.' },
    ],
  },
  {
    id: 'user-adm-2',
    name: 'Clara Morales',
    email: 'clara.m@educateai.org',
    role: 'admin',
    status: 'Active',
    createdAt: '2024-05-12',
    permissionLevel: 'Proctor Manager',
    activityLogs: [
      { id: 'act-5', timestamp: 'Today, 08:45 AM', action: 'Reviewed 4 flagged video anomalies in Midterm 2026 exam.' },
    ],
  },
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state managed via ThemeContext with localStorage persistence & root DOM synchronization
  const { theme, setTheme, toggleTheme } = useTheme();

  // Dynamic Subjects & Topics DB State synchronized in real-time (seeded across all Grades 6-12 & all 11 Boards)
  const [subjectsDB, setSubjectsDB] = useState<DBSubject[]>(DEFAULT_SUBJECTS_DB);
  const [topicsDB, setTopicsDB] = useState<DBTopic[]>(DEFAULT_TOPICS_DB);

  // Derive live CurriculumItem catalog from active subjectsDB & topicsDB
  const curriculumList = React.useMemo<CurriculumItem[]>(() => {
    return subjectsDB
      .filter((s) => s.status === 'ACTIVE')
      .map((s) => ({
        id: s.id,
        grade: s.grade_level,
        gradeLabel: `Grade ${s.grade_level}`,
        board: s.board || 'CBSE',
        category: s.category || 'STEM',
        subjectName: s.name,
        code: s.code || `${s.name.slice(0, 3).toUpperCase()}-${s.grade_level}01`,
        description: s.description || `${s.name} curriculum for Grade ${s.grade_level}`,
        sampleTopics: topicsDB
          .filter((t) => t.subject_id === s.id && t.status === 'ACTIVE')
          .map((t) => t.title),
      }));
  }, [subjectsDB, topicsDB]);

  const [activeGrades, setActiveGrades] = useState<number[]>([6, 7, 8, 9, 10, 11, 12]);
  const [activeCategories, setActiveCategories] = useState<string[]>([
    'STEM',
    'Language Arts',
    'Humanities',
    'Arts & Electives',
  ]);
  const [teacherSubjectContext, setTeacherSubjectContext] = useState<string>('10th Grade Physics');
  const [studentAcademicGrowth] = useState<StudentGradeGrowth[]>(SAMPLE_STUDENT_ACADEMIC_GROWTH);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState<boolean>(false);
  const [ecosystemOverviewMode, setEcosystemOverviewMode] = useState<boolean>(false);

  const [isCurriculumSyncing, setIsCurriculumSyncing] = useState<boolean>(false);

  // Fetch full curriculum from REST API
  const fetchCurriculum = async () => {
    try {
      setIsCurriculumSyncing(true);
      const res = await fetch('/api/curriculum/full');
      if (res.ok) {
        const data = await res.json();
        if (data.subjects) setSubjectsDB(data.subjects);
        if (data.topics) setTopicsDB(data.topics);
      }
    } catch (err) {
      console.warn('Failed to fetch curriculum from API, using cached state', err);
    } finally {
      setIsCurriculumSyncing(false);
    }
  };

  // Real-Time WebSocket synchronization for CurriculumState channel
  useEffect(() => {
    fetchCurriculum();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    let socket: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWebSocket = () => {
      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          // Connected to live server bus
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'CURRICULUM_STATE_INIT' && data.payload) {
              if (data.payload.subjects) setSubjectsDB(data.payload.subjects);
              if (data.payload.topics) setTopicsDB(data.payload.topics);
            } else if (data.type === 'CURRICULUM_UPDATED' && data.payload) {
              if (data.payload.subjects) setSubjectsDB(data.payload.subjects);
              if (data.payload.topics) setTopicsDB(data.payload.topics);

              // Notify user interface
              if (data.payload.action === 'TOPIC_CREATED') {
                addNotification(
                  'Curriculum Updated',
                  `New topic added: "${data.payload.topic.title}" in ${data.payload.subjectName || 'curriculum'}.`,
                  'info',
                  'admin'
                );
              } else if (data.payload.action === 'SUBJECT_CREATED') {
                addNotification(
                  'New Subject Added',
                  `Subject "${data.payload.subject.name}" (Grade ${data.payload.subject.grade_level}) published to curriculum.`,
                  'success',
                  'admin'
                );
              }
            } else if (data.type === 'NEW_MEETING_INVITE' && data.payload) {
              setMeetingInvites((prev) => [data.payload, ...prev]);
              setActiveStudentMeeting(data.payload);
              addNotification(
                '📹 Live Google Meet Dispatched',
                `${data.payload.host_name} launched: "${data.payload.title}". Click to join!`,
                'alert',
                'teacher'
              );
            }
          } catch (e) {
            console.error('Error parsing WebSocket curriculum message:', e);
          }
        };

        socket.onclose = () => {
          reconnectTimer = setTimeout(connectWebSocket, 4000);
        };

        socket.onerror = (err) => {
          console.warn('Curriculum WS connection notice:', err);
          socket?.close();
        };
      } catch (err) {
        console.warn('WebSocket setup issue:', err);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) socket.close();
    };
  }, []);

  // CRUD handlers for Admin Curriculum Management
  const createSubject = async (newSubj: { name: string; grade_level: number; board?: EducationBoard | 'ALL'; category?: any; code?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    try {
      const res = await fetch('/api/curriculum/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubj),
      });
      if (res.ok) {
        const data = await res.json();
        // Optimistic update
        setSubjectsDB((prev) => {
          const exists = prev.some((s) => s.id === data.subject.id);
          return exists ? prev : [data.subject, ...prev];
        });
        return data.subject;
      }
    } catch (err) {
      console.error('Error creating subject:', err);
      // Fallback local creation if offline
      const fallback: DBSubject = {
        id: `subj-${Date.now()}`,
        name: newSubj.name,
        grade_level: newSubj.grade_level,
        board: newSubj.board || 'CBSE',
        category: newSubj.category || 'STEM',
        code: newSubj.code || `${newSubj.name.slice(0, 3).toUpperCase()}-${newSubj.grade_level}01`,
        description: newSubj.description || '',
        status: newSubj.status || 'ACTIVE',
        created_at: new Date().toISOString().split('T')[0],
      };
      setSubjectsDB((prev) => [fallback, ...prev]);
      return fallback;
    }
    return null;
  };

  const updateSubject = async (id: string, updates: Partial<DBSubject>) => {
    try {
      const res = await fetch(`/api/curriculum/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setSubjectsDB((prev) => prev.map((s) => (s.id === id ? data.subject : s)));
        return data.subject;
      }
    } catch (err) {
      console.error('Error updating subject:', err);
    }
    setSubjectsDB((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    return null;
  };

  const deleteSubject = async (id: string) => {
    try {
      const res = await fetch(`/api/curriculum/subjects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubjectsDB((prev) => prev.filter((s) => s.id !== id));
        setTopicsDB((prev) => prev.filter((t) => t.subject_id !== id));
        return true;
      }
    } catch (err) {
      console.error('Error deleting subject:', err);
    }
    setSubjectsDB((prev) => prev.filter((s) => s.id !== id));
    setTopicsDB((prev) => prev.filter((t) => t.subject_id !== id));
    return true;
  };

  const createTopic = async (newTop: { subject_id: string; title: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    try {
      const res = await fetch('/api/curriculum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTop),
      });
      if (res.ok) {
        const data = await res.json();
        setTopicsDB((prev) => {
          const exists = prev.some((t) => t.id === data.topic.id);
          return exists ? prev : [...prev, data.topic];
        });
        return data.topic;
      }
    } catch (err) {
      console.error('Error creating topic:', err);
      const fallback: DBTopic = {
        id: `top-${Date.now()}`,
        subject_id: newTop.subject_id,
        title: newTop.title,
        description: newTop.description || '',
        status: newTop.status || 'ACTIVE',
        created_at: new Date().toISOString().split('T')[0],
      };
      setTopicsDB((prev) => [...prev, fallback]);
      return fallback;
    }
    return null;
  };

  const updateTopic = async (id: string, updates: Partial<DBTopic>) => {
    try {
      const res = await fetch(`/api/curriculum/topics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setTopicsDB((prev) => prev.map((t) => (t.id === id ? data.topic : t)));
        return data.topic;
      }
    } catch (err) {
      console.error('Error updating topic:', err);
    }
    setTopicsDB((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    return null;
  };

  const deleteTopic = async (id: string) => {
    try {
      const res = await fetch(`/api/curriculum/topics/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTopicsDB((prev) => prev.filter((t) => t.id !== id));
        return true;
      }
    } catch (err) {
      console.error('Error deleting topic:', err);
    }
    setTopicsDB((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  const toggleGradeFilter = (grade: number) => {
    setActiveGrades((prev) =>
      prev.includes(grade) ? (prev.length > 1 ? prev.filter((g) => g !== grade) : prev) : [...prev, grade].sort((a, b) => a - b)
    );
  };

  const toggleCategoryFilter = (cat: string) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? (prev.length > 1 ? prev.filter((c) => c !== cat) : prev) : [...prev, cat]
    );
  };

  // User Management & Authentication State
  const [usersList, setUsersList] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem('educate_ai_users_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse users list from localStorage', e);
    }
    return INITIAL_USERS;
  });

  // Persist usersList whenever users are added, updated, or deleted
  useEffect(() => {
    try {
      localStorage.setItem('educate_ai_users_list', JSON.stringify(usersList));
    } catch (e) {
      console.warn('Failed to persist users list to localStorage', e);
    }
  }, [usersList]);

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('educate_ai_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse current user from localStorage', e);
    }
    return INITIAL_USERS[0];
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [activeBroadcastQuiz, setActiveBroadcastQuiz] = useState<BroadcastedQuizInfo | null>(null);

  const [currentRole, setCurrentRoleState] = useState<UserRole>('student');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  const [studentNav, setStudentNav] = useState<StudentNavTab>('dashboard');
  const [adminNav, setAdminNav] = useState<'dashboard' | 'users' | 'curriculum' | 'teachers' | 'students' | 'config' | 'certificates' | 'analytics'>('dashboard');

  // Global Language & Board Configuration
  const [globalLanguage, setGlobalLanguage] = useState<string>('en');
  const [currentBoard, setCurrentBoard] = useState<string>('CBSE');

  // Institutional Schools State
  const [schools, setSchools] = useState<DBSchool[]>([
    {
      id: 'school-1',
      name: 'D.A.V. Public School, Sector 8',
      address: 'Sector 8-C, Chandigarh, Punjab & Haryana, India',
      lat: 30.7398,
      lng: 76.7827,
      created_at: '2026-01-01',
    },
    {
      id: 'school-2',
      name: 'Delhi Public School, R.K. Puram',
      address: 'Kaifi Azmi Marg, Sector XII, R.K. Puram, New Delhi, India',
      lat: 28.5684,
      lng: 77.1772,
      created_at: '2026-01-01',
    },
    {
      id: 'school-3',
      name: 'The Cathedral and John Connon School',
      address: '6, Purshottamdas Thakurdas Marg, Fort, Mumbai, Maharashtra, India',
      lat: 18.9348,
      lng: 72.8335,
      created_at: '2026-01-02',
    },
    {
      id: 'school-4',
      name: 'National Public School, Indiranagar',
      address: '12th A Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka, India',
      lat: 12.9719,
      lng: 77.6412,
      created_at: '2026-01-05',
    },
  ]);

  const fetchSchools = async (q?: string): Promise<DBSchool[]> => {
    try {
      const res = await fetch(`/api/schools${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.schools) {
          setSchools(data.schools);
          return data.schools;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch schools from API', e);
    }
    return schools;
  };

  const registerSchool = async (schoolData: {
    name: string;
    address?: string;
    lat?: number;
    lng?: number;
  }): Promise<DBSchool> => {
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.school) {
          setSchools((prev) => {
            if (prev.some((s) => s.id === data.school.id)) return prev;
            return [data.school, ...prev];
          });
          return data.school;
        }
      }
    } catch (e) {
      console.warn('School registration network notice', e);
    }
    const fallback: DBSchool = {
      id: `school-${Date.now()}`,
      name: schoolData.name,
      address: schoolData.address || `${schoolData.name}, India`,
      lat: schoolData.lat || 28.6139,
      lng: schoolData.lng || 77.209,
      created_at: new Date().toISOString().split('T')[0],
    };
    setSchools((prev) => [fallback, ...prev]);
    return fallback;
  };

  // Live Student Monitoring & Google Meet State
  const [meetingInvites, setMeetingInvites] = useState<MeetingInvite[]>([
    {
      id: 'meet-1',
      host_id: 'user-tch-1',
      host_name: 'Ms. Elena Rostova',
      title: "1-on-1 Socratic Doubt Clearance: Newton's 2nd Law",
      meet_link: 'https://meet.google.com/qwe-rtyu-iop',
      target_type: 'INDIVIDUAL',
      target_ids: ['user-stu-2', 'stu-2'], // Alex Rivera
      scheduled_time: 'Immediate Live Session',
      status: 'ACTIVE',
      agenda: 'Step-by-step vector breakdown following flagged inertia assessment doubt.',
      duration_mins: 25,
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      dispatched_emails: ['alex.r@educateai.org', 'elena.r@educateai.org'],
    },
    {
      id: 'meet-2',
      host_id: 'user-tch-2',
      host_name: 'Dr. David Vance',
      title: 'Grade 10 Science Sprint: Quadratic Functions & Cell Biology',
      meet_link: 'https://meet.google.com/asd-fghj-klz',
      target_type: 'COHORT',
      target_ids: ['10', 'Grade 10', 'Grade 10 - Science'],
      scheduled_time: 'Today, 04:30 PM IST',
      status: 'ACTIVE',
      agenda: 'Interactive cohort review session for upcoming CBSE midterm assessment.',
      duration_mins: 45,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      dispatched_emails: ['alex.r@educateai.org', 'liam.c@educateai.org'],
    },
  ]);

  const [activeStudentMeeting, setActiveStudentMeeting] = useState<MeetingInvite | null>(() => {
    // Check if any active meeting matches default Alex Rivera
    return {
      id: 'meet-1',
      host_id: 'user-tch-1',
      host_name: 'Ms. Elena Rostova',
      title: "1-on-1 Socratic Doubt Clearance: Newton's 2nd Law",
      meet_link: 'https://meet.google.com/qwe-rtyu-iop',
      target_type: 'INDIVIDUAL',
      target_ids: ['user-stu-2', 'stu-2'],
      scheduled_time: 'Immediate Live Session',
      status: 'ACTIVE',
      agenda: 'Step-by-step vector breakdown following flagged inertia assessment doubt.',
      duration_mins: 25,
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      dispatched_emails: ['alex.r@educateai.org', 'elena.r@educateai.org'],
    };
  });

  const dismissStudentMeetingAlert = () => {
    setActiveStudentMeeting(null);
  };

  const createMeetingInvite = async (data: any): Promise<MeetingInvite | null> => {
    try {
      const res = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const respData = await res.json();
        if (respData.invite) {
          setMeetingInvites((prev) => [respData.invite, ...prev]);
          addNotification(
            'Google Meet Invite Dispatched',
            `Meeting "${respData.invite.title}" created with link ${respData.invite.meet_link}. Multi-channel dispatch completed.`,
            'success',
            'teacher'
          );
          return respData.invite;
        }
      }
    } catch (e) {
      console.warn('Network issue creating meeting invite', e);
    }
    // Fallback local meet generation
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const randPart = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const fallbackLink = `https://meet.google.com/${randPart(3)}-${randPart(4)}-${randPart(3)}`;
    const fallback: MeetingInvite = {
      id: `meet-${Date.now()}`,
      host_id: data.host_id || 'teacher',
      host_name: data.host_name || 'Educator',
      title: data.title || 'Live Interactive Class',
      meet_link: fallbackLink,
      target_type: data.target_type || 'ALL',
      target_ids: data.target_ids || [],
      scheduled_time: data.scheduled_time || 'Immediate Live Session',
      status: 'ACTIVE',
      agenda: data.agenda || 'Live intervention session',
      duration_mins: data.duration_mins || 30,
      created_at: new Date().toISOString(),
      dispatched_emails: data.student_emails || ['student@educateai.org'],
    };
    setMeetingInvites((prev) => [fallback, ...prev]);
    return fallback;
  };

  // Student-Teacher Community Doubt Forum State with Structured Spaces & Moderation
  const [forumPoints, setForumPoints] = useState<number>(640);
  const [peerAnswersThisWeek, setPeerAnswersThisWeek] = useState<number>(1);
  const [liveSessionRsvp, setLiveSessionRsvp] = useState<boolean>(false);

  const toggleLiveSessionRsvp = () => {
    setLiveSessionRsvp((prev) => {
      const next = !prev;
      addNotification(
        next ? 'Live Doubt Session RSVP Confirmed' : 'Live Session RSVP Cancelled',
        next
          ? 'You are registered for Thursday 5:00 PM Live Doubt-Clearing Session (Class 10 Algebra & Physics).'
          : 'You have removed your RSVP from this week’s live doubt-clearing session.',
        'info',
        'student'
      );
      return next;
    });
  };

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: 'post-dotd',
      author_id: 'user-stu-1',
      author_name: 'Sarah Connor',
      author_role: 'student',
      author_points: 1450,
      title: 'Why does completing the square require adding (b/2a)² to both sides?',
      content: 'When solving ax² + bx + c = 0 by completing the square, I always memorize adding (b/2a)² after dividing by a. Can someone explain geometrically or algebraically why this exact term forms a perfect square?',
      attempted_solution: 'I factored out a to get x² + (b/a)x = -c/a. Then I wrote (x + k)² = x² + 2kx + k², so 2k = b/a means k = b/2a. Not sure how to visualize the missing square corner!',
      space: 'subject-doubts',
      subject: 'Mathematics',
      chapter_unit: 'Class 10 Algebra',
      grade_level: 10,
      topic: 'Class 10 Algebra',
      tags: ['Class 10 Algebra', 'Quadratics', 'DoubtOfTheDay'],
      created_at: '1 hour ago',
      upvotes: 29,
      views_count: 142,
      comments_count: 2,
      is_doubt_of_the_day: true,
      is_verified: false,
      accepted_comment_id: 'comm-dotd-1',
      comments: [
        {
          id: 'comm-dotd-1',
          author_id: 'user-stu-3',
          author_name: 'Liam Chen',
          author_role: 'student',
          author_badge: 'Best Answer',
          content: 'Step 1: Draw a square of side x (area x²) and split (b/a)x into two equal rectangles of width b/(2a) placed on the right and bottom edges. Step 2: Notice there is an empty corner square of side b/(2a), whose area is (b/2a)². Adding that exact corner area completes the full (x + b/2a)² square!',
          created_at: '35 mins ago',
          upvotes: 14,
          is_accepted: true,
        },
        {
          id: 'comm-dotd-2',
          author_id: 'user-stu-5',
          author_name: 'Zoe Washington',
          author_role: 'student',
          content: 'Thinking of the two rectangles of width b/(2a) made it click immediately—thank you!',
          created_at: '20 mins ago',
          upvotes: 5,
        },
      ],
      status: 'ACTIVE',
    },
    {
      id: 'post-1',
      author_id: 'user-stu-1',
      author_name: 'Sarah Connor',
      author_role: 'student',
      author_points: 1450,
      title: 'Why does the integration substitution step ln(1 + h/x) work in this limit?',
      content: "I'm struggling with the algebraic simplification when evaluating lim_{h->0} [ln(x+h) - ln(x)] / h. Specifically, how does the quotient rule convert it to 1/x?",
      attempted_solution: 'I rewrote ln(x+h) - ln(x) as ln((x+h)/x) = ln(1 + h/x), then got stuck factoring out 1/x cleanly.',
      space: 'subject-doubts',
      subject: 'Mathematics',
      chapter_unit: 'Calculus & Derivatives',
      grade_level: 10,
      topic: 'Calculus & Derivatives',
      tags: ['Calculus', 'Derivatives', 'Limits'],
      created_at: '2 hours ago',
      upvotes: 21,
      views_count: 85,
      comments_count: 1,
      is_verified: true,
      verified_solution: {
        teacher_name: 'Dr. David Vance (Moderator & Physics/Math Lead)',
        solution: 'Use logarithm quotient rule: ln(x+h) - ln(x) = ln((x+h)/x) = ln(1 + h/x). Then multiply numerator and denominator by x so the fraction becomes (1/x) * [ln(1+t)/t] where t = h/x. As h -> 0, t -> 0 and lim_{t->0} ln(1+t)/t = 1, leaving 1/x.',
        verified_at: '1 hour ago',
      },
      comments: [
        {
          id: 'comm-1',
          author_id: 'user-stu-3',
          author_name: 'Liam Chen',
          author_role: 'student',
          author_badge: 'Best Answer',
          content: 'Step 1: Set t = h/x so h = x·t. Step 2: Substitute h into the denominator to pull (1/x) outside the limit cleanly. That leaves lim_{t->0} ln(1+t)/t = 1.',
          created_at: '45 mins ago',
          upvotes: 4,
          is_accepted: true,
        },
      ],
      accepted_comment_id: 'comm-1',
      status: 'ACTIVE',
    },
    {
      id: 'post-2',
      author_id: 'user-stu-2',
      author_name: 'Alex Rivera',
      author_role: 'student',
      author_points: 620,
      title: 'Can heat be converted completely into mechanical work in a cyclic process?',
      content: 'My textbook states that 100% heat-to-work conversion is impossible for any cyclic thermodynamic engine, but why can electric heaters achieve near 100% work-to-heat conversion?',
      attempted_solution: 'I compared W = Q_h - Q_c for a Carnot cycle and saw Q_c cannot be 0 unless T_c = 0 K, which is impossible.',
      space: 'subject-doubts',
      subject: 'Physics',
      chapter_unit: 'Thermodynamics & Heat Cycles',
      grade_level: 10,
      topic: 'Thermodynamics & Heat Cycles',
      tags: ['Physics', 'Thermodynamics', 'CarnotEngine'],
      created_at: '5 hours ago',
      upvotes: 18,
      views_count: 64,
      comments_count: 0,
      is_verified: true,
      verified_solution: {
        teacher_name: 'Ms. Elena Rostova',
        solution: "This is Kelvin-Planck's statement of the Second Law of Thermodynamics! Work is ordered energy, while heat is disordered thermal motion. Degrading order into disorder (work to heat) increases entropy naturally, whereas converting disordered heat fully back into ordered cyclic work without rejecting waste heat to a cold reservoir violates entropy conservation.",
        verified_at: '3 hours ago',
      },
      comments: [],
      status: 'ACTIVE',
    },
    {
      id: 'post-3',
      author_id: 'user-stu-5',
      author_name: 'Zoe Washington',
      author_role: 'student',
      author_points: 890,
      title: 'When should I pick BFS vs DFS in Python recursion and shortest-path tasks?',
      content: 'Looking for a step-by-step explanation of when Breadth-First Search guarantees the shortest path vs when Depth-First Search with recursion is better.',
      attempted_solution: 'I wrote a recursive DFS function in Python, and it found a path from node A to node D, but it took 5 hops when a 2-hop path existed!',
      space: 'subject-doubts',
      subject: 'Coding',
      chapter_unit: 'Python Basics',
      grade_level: 11,
      topic: 'Python Basics',
      tags: ['Python Basics', 'Coding', 'Algorithms'],
      created_at: '6 hours ago',
      upvotes: 34,
      views_count: 110,
      comments_count: 0,
      is_verified: false,
      is_high_priority: true,
      comments: [],
      status: 'ACTIVE',
    },
    {
      id: 'post-4',
      author_id: 'user-stu-4',
      author_name: 'Carlos Mendez',
      author_role: 'student',
      author_points: 410,
      title: 'How do I prioritize functional groups in IUPAC naming of Organic Chemistry esters?',
      content: 'For our Friday mock assignment, I have a molecule containing both a carboxylic acid (-COOH) and an alcohol (-OH) group on a 5-carbon chain. Which suffix wins and how do we number the carbons?',
      attempted_solution: 'I numbered from the -OH side and called it 5-hydroxypentanoic acid, or should I name -OH as a prefix from the -COOH carbon 1?',
      space: 'assignment-exam',
      subject: 'Chemistry',
      chapter_unit: 'Organic Chemistry',
      grade_level: 10,
      topic: 'Organic Chemistry',
      tags: ['Organic Chemistry', 'IUPAC', 'HomeworkHelp'],
      created_at: '3 hours ago',
      upvotes: 12,
      views_count: 47,
      comments_count: 0,
      is_verified: false,
      is_high_priority: true,
      comments: [],
      status: 'ACTIVE',
    },
    {
      id: 'post-5',
      author_id: 'user-stu-6',
      author_name: 'Ananya Sharma',
      author_role: 'student',
      author_points: 530,
      title: 'Mock Exam Strategy: How to structure comparative literary essays in 35 minutes?',
      content: 'During timed English Literature mock exams, I run out of time on paragraph 3. Should I outline thesis + 2 body themes first or integrate quotes paragraph by paragraph?',
      attempted_solution: 'Last mock I spent 10 minutes outlining and barely finished my conclusion. Looking for peer-tested pacing tips.',
      space: 'assignment-exam',
      subject: 'English',
      chapter_unit: 'Critical Reading & Essay Craft',
      grade_level: 9,
      topic: 'Critical Reading & Essay Craft',
      tags: ['English', 'ExamStrategy', 'MockTest'],
      created_at: '4 hours ago',
      upvotes: 9,
      views_count: 39,
      comments_count: 0,
      is_verified: false,
      comments: [],
      status: 'ACTIVE',
    },
  ]);

  const [forumStudyGroups, setForumStudyGroups] = useState<ForumStudyGroup[]>([
    {
      id: 'sg-1',
      name: 'Class 10 Algebra Evening Prep',
      subject: 'Mathematics',
      chapter_unit: 'Class 10 Algebra',
      grade_level: 10,
      availability: 'Mon & Wed · 6:00 PM',
      focus_goal: 'Quadratic factoring, discriminant drills & board mock papers',
      host_name: 'Sarah Connor',
      members: ['Sarah Connor', 'Liam Chen', 'Praveen Bhatia'],
      max_members: 8,
      next_session: 'Wednesday, 6:00 PM',
      messages: [
        {
          id: 'sgm-1',
          author_name: 'Sarah Connor',
          author_role: 'student',
          content: 'Welcome! Bring 2 quadratic word problems you found tricky for Wednesday’s walkthrough.',
          created_at: '2 hours ago',
        },
        {
          id: 'sgm-2',
          author_name: 'Liam Chen',
          author_role: 'student',
          content: 'I uploaded the Class 10 Algebra formula sheet to the Resource Library for everyone.',
          created_at: '1 hour ago',
        },
      ],
    },
    {
      id: 'sg-2',
      name: 'Python Basics & Problem Solving Circle',
      subject: 'Coding',
      chapter_unit: 'Python Basics',
      grade_level: 11,
      availability: 'Saturdays · 11:00 AM',
      focus_goal: 'Loops, recursion, lists, dictionaries & dry-run trace tables',
      host_name: 'Zoe Washington',
      members: ['Zoe Washington', 'Alex Rivera'],
      max_members: 10,
      next_session: 'Saturday, 11:00 AM',
      messages: [
        {
          id: 'sgm-3',
          author_name: 'Zoe Washington',
          author_role: 'student',
          content: 'This weekend we will trace BFS vs DFS step-by-step on a 6-node graph.',
          created_at: '3 hours ago',
        },
      ],
    },
    {
      id: 'sg-3',
      name: 'Organic Chemistry & Physics Exam Sprint',
      subject: 'Chemistry',
      chapter_unit: 'Organic Chemistry',
      grade_level: 10,
      availability: 'Tue & Fri · 5:30 PM',
      focus_goal: 'IUPAC nomenclature, reaction mechanisms & thermodynamics numericals',
      host_name: 'Carlos Mendez',
      members: ['Carlos Mendez', 'Ananya Sharma'],
      max_members: 8,
      next_session: 'Friday, 5:30 PM',
      messages: [
        {
          id: 'sgm-4',
          author_name: 'Carlos Mendez',
          author_role: 'student',
          content: 'Let’s practice 10 IUPAC naming chains before Friday’s mock test!',
          created_at: '50 mins ago',
        },
      ],
    },
  ]);

  const [forumResources, setForumResources] = useState<ForumResourceItem[]>([
    {
      id: 'res-1',
      title: 'Class 10 Algebra: Quadratics & Completing the Square Summary Notes',
      resource_type: 'Notes',
      subject: 'Mathematics',
      chapter_unit: 'Class 10 Algebra',
      grade_level: 10,
      author_name: 'Liam Chen',
      author_role: 'student',
      description: 'Clean 4-page visual derivation sheet covering vertex form, discriminant cases, and Vieta’s root relationships.',
      helpful_count: 42,
      created_at: 'Yesterday',
    },
    {
      id: 'res-2',
      title: '2025 CBSE & ICSE Physics Board Mock Paper (With Step-by-Step Marking Scheme)',
      resource_type: 'Previous Paper',
      subject: 'Physics',
      chapter_unit: "Newton's Laws & Thermodynamics",
      grade_level: 10,
      author_name: 'Dr. David Vance',
      author_role: 'teacher',
      description: 'Full 80-mark practice paper with step-allocation rubrics and common free-body diagram pitfalls highlighted.',
      helpful_count: 58,
      created_at: '2 days ago',
    },
    {
      id: 'res-3',
      title: 'Python Basics: Lists, Recursion & Graph Traversal Cheat Sheet',
      resource_type: 'Revision Material',
      subject: 'Coding',
      chapter_unit: 'Python Basics',
      grade_level: 11,
      author_name: 'Zoe Washington',
      author_role: 'student',
      description: 'Annotated code patterns showing queue-based BFS vs recursive DFS with time complexity notes.',
      helpful_count: 31,
      created_at: '3 days ago',
    },
    {
      id: 'res-4',
      title: 'Organic Chemistry IUPAC Priority Table & Isomer Walkthrough',
      resource_type: 'Recommended Video',
      subject: 'Chemistry',
      chapter_unit: 'Organic Chemistry',
      grade_level: 10,
      author_name: 'Ms. Elena Rostova',
      author_role: 'teacher',
      description: '14-minute guided walkthrough explaining carboxylic acid, aldehyde, ketone, and alcohol suffix priorities.',
      helpful_count: 49,
      created_at: '4 days ago',
    },
  ]);

  const containsPersonalContactInfo = (text: string): boolean => {
    if (!text) return false;
    const phonePattern = /(?:\+?\d{1,3}[\s-]?)?\b\d{10}\b/;
    const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    return phonePattern.test(text) || emailPattern.test(text);
  };

  const addCommunityPost = async (postData: any): Promise<{ success: boolean; error?: string }> => {
    const combinedText = `${postData.title || ''} ${postData.content || ''} ${postData.attempted_solution || ''}`;
    if (detectFoulLanguage(combinedText)) {
      return {
        success: false,
        error: 'Zero-tolerance policy: respectful academic language is required.',
      };
    }
    if (containsPersonalContactInfo(combinedText)) {
      return {
        success: false,
        error: 'Participation rule: please avoid sharing personal phone numbers or email addresses publicly.',
      };
    }

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'ACCOUNT_SUSPENDED_POLICY_VIOLATION') {
          setIsAuthenticated(false);
          setCurrentUser(null);
          addNotification(
            'ACCOUNT SUSPENDED: ZERO-TOLERANCE POLICY VIOLATION',
            'Profanity/foul language detected. Your account has been automatically locked and dispatched to institutional administration.',
            'alert',
            'system'
          );
        }
        return { success: false, error: data.message || 'Post rejected by content moderation filter' };
      }
      if (data.post) {
        setCommunityPosts((prev) => [data.post, ...prev]);
        setForumPoints((pts) => pts + 10);
        addNotification(
          'Doubt Posted to Community',
          `Your question "${data.post.title.slice(0, 35)}..." is live (+10 Forum Points).`,
          'success',
          'student'
        );
        return { success: true };
      }
    } catch (e) {
      console.warn('Network issue creating community post, creating locally', e);
    }

    // Resilient local creation if server unreachable
    const localPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author_id: postData.author_id || currentUser?.id || 'user-stu-1',
      author_name: postData.author_name || currentUser?.name || 'Student',
      author_role: postData.author_role || currentUser?.role || 'student',
      author_points: forumPoints,
      title: postData.title,
      content: postData.content,
      attempted_solution: postData.attempted_solution,
      attachment_preview: postData.attachment_preview,
      space: postData.space === 'assignment-exam' ? 'assignment-exam' : 'subject-doubts',
      subject: postData.subject || 'Mathematics',
      chapter_unit: postData.chapter_unit || '',
      grade_level: Number(postData.grade_level) || 10,
      topic: postData.chapter_unit || postData.subject,
      tags: Array.isArray(postData.tags) ? postData.tags : [postData.subject],
      created_at: 'Just now',
      upvotes: 1,
      views_count: 1,
      comments_count: 0,
      is_verified: false,
      is_high_priority: Boolean(postData.is_high_priority),
      comments: [],
      status: 'ACTIVE',
    };
    setCommunityPosts((prev) => [localPost, ...prev]);
    setForumPoints((pts) => pts + 10);
    addNotification(
      'Doubt Posted to Community',
      `Your question "${localPost.title.slice(0, 35)}..." is live (+10 Forum Points).`,
      'success',
      'student'
    );
    return { success: true };
  };

  const addCommunityComment = async (postId: string, content: string): Promise<{ success: boolean; error?: string }> => {
    if (detectFoulLanguage(content)) {
      return {
        success: false,
        error: 'Zero-tolerance policy: please keep replies constructive and respectful.',
      };
    }
    if (containsPersonalContactInfo(content)) {
      return {
        success: false,
        error: 'Participation rule: avoid sharing personal phone numbers or emails publicly.',
      };
    }

    const targetPost = communityPosts.find((p) => p.id === postId);
    const wasUnanswered = Boolean(targetPost && !targetPost.accepted_comment_id && !targetPost.is_verified);

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_id: currentUser?.id || 'user-stu-1',
          author_name: currentUser?.name || 'Praveen Bhatia',
          author_role: currentUser?.role || 'student',
          author_avatar: currentUser?.avatar,
          content,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'ACCOUNT_SUSPENDED_POLICY_VIOLATION') {
          setIsAuthenticated(false);
          setCurrentUser(null);
          addNotification(
            'ACCOUNT SUSPENDED',
            'Foul language violation detected. You have been locked out.',
            'alert',
            'system'
          );
        }
        return { success: false, error: data.message };
      }
      if (data.comment) {
        setCommunityPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, comments: [...p.comments, data.comment], comments_count: p.comments_count + 1 }
              : p
          )
        );
        if (wasUnanswered) {
          setPeerAnswersThisWeek((c) => c + 1);
          setForumPoints((pts) => pts + 15);
        } else {
          setForumPoints((pts) => pts + 5);
        }
        addNotification(
          'Explanation Posted',
          wasUnanswered
            ? 'You helped an unanswered doubt! +15 Forum Points & +1 toward Weekly Peer Challenge.'
            : 'Your step-by-step reply has been added to the thread (+5 Forum Points).',
          'success',
          'student'
        );
        return { success: true };
      }
    } catch (e) {
      console.warn('Network comment error, adding locally', e);
    }

    const fallbackComment: CommunityComment = {
      id: `comm-${Date.now()}`,
      author_id: currentUser?.id || 'user-stu-1',
      author_name: currentUser?.name || 'Praveen Bhatia',
      author_role: currentUser?.role || 'student',
      author_avatar: currentUser?.avatar,
      content,
      created_at: 'Just now',
      upvotes: 0,
      is_teacher_verified: currentUser?.role === 'teacher' || currentUser?.role === 'admin',
    };
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, fallbackComment], comments_count: p.comments_count + 1 }
          : p
      )
    );
    if (wasUnanswered) {
      setPeerAnswersThisWeek((c) => c + 1);
      setForumPoints((pts) => pts + 15);
    } else {
      setForumPoints((pts) => pts + 5);
    }
    return { success: true };
  };

  const upvoteCommunityPost = async (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
    try {
      await fetch(`/api/community/posts/${postId}/upvote`, { method: 'POST' });
    } catch (e) {
      // ignore
    }
  };

  const upvoteCommunityComment = async (postId: string, commentId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c
              ),
            }
          : p
      )
    );
    try {
      await fetch(`/api/community/posts/${postId}/comments/${commentId}/upvote`, { method: 'POST' });
    } catch (e) {
      // ignore
    }
  };

  const acceptCommunityComment = async (postId: string, commentId: string) => {
    let acceptedAuthor = '';
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          accepted_comment_id: commentId,
          comments: p.comments.map((c) => {
            if (c.id === commentId) {
              acceptedAuthor = c.author_name;
              return { ...c, is_accepted: true, author_badge: 'Best Answer' };
            }
            return { ...c, is_accepted: false };
          }),
        };
      })
    );
    setForumPoints((pts) => pts + 25);
    addNotification(
      'Best Answer Marked Accepted',
      `${acceptedAuthor || 'Responder'} earned the Best Answer badge & +50 reputation points.`,
      'success',
      'student'
    );
    try {
      await fetch(`/api/community/posts/${postId}/comments/${commentId}/accept`, { method: 'POST' });
    } catch (e) {
      // ignore
    }
  };

  const flagCommunityPost = async (postId: string, reason: string = 'Needs teacher/moderator review') => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, is_flagged: true, flag_reason: reason } : p))
    );
    addNotification(
      'Thread Flagged for Moderator Review',
      'Teachers and moderators have been notified to review this doubt.',
      'warning',
      'teacher'
    );
    try {
      await fetch(`/api/community/posts/${postId}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    } catch (e) {
      // ignore
    }
  };

  const resolveFlaggedCommunityPost = (postId: string, action: 'dismiss' | 'remove') => {
    setCommunityPosts((prev) =>
      action === 'remove'
        ? prev.filter((p) => p.id !== postId)
        : prev.map((p) => (p.id === postId ? { ...p, is_flagged: false, flag_reason: undefined } : p))
    );
    addNotification(
      action === 'remove' ? 'Flagged Post Removed' : 'Flag Cleared by Moderator',
      action === 'remove'
        ? 'Thread removed from public feed following moderator review.'
        : 'Thread verified as safe and cleared from the moderation queue.',
      'info',
      'teacher'
    );
  };

  const verifyCommunityPost = async (postId: string, solution: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              is_verified: true,
              is_flagged: false,
              verified_solution: {
                teacher_name: currentUser?.name || 'Verified Educator',
                teacher_avatar: currentUser?.avatar,
                solution,
                verified_at: 'Just now',
              },
            }
          : p
      )
    );
    addNotification(
      'Official Solution Verified',
      'Educator solution published and thread marked Teacher-Verified.',
      'success',
      'student'
    );
    try {
      await fetch(`/api/community/posts/${postId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_name: currentUser?.name,
          teacher_avatar: currentUser?.avatar,
          solution,
        }),
      });
    } catch (e) {
      // ignore
    }
  };

  const joinOrLeaveStudyGroup = (groupId: string) => {
    const memberName = currentUser?.name || 'Praveen Bhatia';
    setForumStudyGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const alreadyMember = g.members.includes(memberName);
        if (alreadyMember) {
          return { ...g, members: g.members.filter((m) => m !== memberName) };
        }
        if (g.members.length >= g.max_members) return g;
        return { ...g, members: [...g.members, memberName] };
      })
    );
  };

  const createStudyGroup = (groupData: {
    name: string;
    subject: string;
    chapter_unit: string;
    grade_level: number;
    availability: string;
    focus_goal: string;
  }) => {
    const hostName = currentUser?.name || 'Praveen Bhatia';
    const newGroup: ForumStudyGroup = {
      id: `sg-${Date.now()}`,
      name: groupData.name,
      subject: groupData.subject,
      chapter_unit: groupData.chapter_unit,
      grade_level: groupData.grade_level,
      availability: groupData.availability,
      focus_goal: groupData.focus_goal,
      host_name: hostName,
      members: [hostName],
      max_members: 10,
      next_session: groupData.availability,
      messages: [
        {
          id: `sgm-${Date.now()}`,
          author_name: hostName,
          author_role: currentUser?.role || 'student',
          content: `Study group created! Focus: ${groupData.focus_goal}`,
          created_at: 'Just now',
        },
      ],
    };
    setForumStudyGroups((prev) => [newGroup, ...prev]);
    setForumPoints((pts) => pts + 15);
    addNotification(
      'Study Group Created',
      `"${newGroup.name}" is open for peers in ${newGroup.subject}.`,
      'success',
      'student'
    );
  };

  const addStudyGroupMessage = (groupId: string, content: string) => {
    if (!content.trim() || detectFoulLanguage(content) || containsPersonalContactInfo(content)) return;
    const authorName = currentUser?.name || 'Praveen Bhatia';
    setForumStudyGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              messages: [
                ...g.messages,
                {
                  id: `sgm-${Date.now()}`,
                  author_name: authorName,
                  author_role: currentUser?.role || 'student',
                  content: content.trim(),
                  created_at: 'Just now',
                },
              ],
            }
          : g
      )
    );
  };

  const addForumResource = (resource: {
    title: string;
    resource_type: 'Notes' | 'Previous Paper' | 'Revision Material' | 'Recommended Video';
    subject: string;
    chapter_unit: string;
    grade_level: number;
    description: string;
    url?: string;
  }) => {
    const newItem: ForumResourceItem = {
      id: `res-${Date.now()}`,
      ...resource,
      author_name: currentUser?.name || 'Praveen Bhatia',
      author_role: currentUser?.role || 'student',
      helpful_count: 1,
      created_at: 'Just now',
    };
    setForumResources((prev) => [newItem, ...prev]);
    setForumPoints((pts) => pts + 15);
    addNotification(
      'Resource Shared in Library',
      `"${newItem.title}" added to ${newItem.subject} · ${newItem.chapter_unit}.`,
      'success',
      'student'
    );
  };

  const upvoteForumResource = (resourceId: string) => {
    setForumResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, helpful_count: r.helpful_count + 1 } : r))
    );
  };

  // Subscription & 7-Day Free Trial State
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    tier: '7-Day Free Trial',
    trialStartDate: '2026-10-10',
    trialEndDate: '2026-10-17',
    trialDaysLeft: 5,
    isActive: true,
    paymentMethod: {
      type: 'UPI',
      detail: 'alexr@okhdfcbank',
    },
    autoRenew: true,
  });

  const updateSubscription = (updates: Partial<SubscriptionState>) => {
    setSubscriptionState((prev) => ({ ...prev, ...updates }));
    addNotification('Subscription Updated', 'Your subscription & billing preference has been updated.', 'success', 'system');
  };

  // Global Student Roster with real-time multi-panel synchronization
  const [studentsList, setStudentsList] = useState<StudentProfile[]>([
    {
      id: 'stu-1',
      name: 'Sarah Connor',
      email: 'sarah.c@educateai.org',
      grade: '8th Grade',
      gpa: 3.85,
      attendance: 98,
      enrolledSubjects: ['Physics', 'Biology', 'Algebra', 'English Literature', 'Chemistry', 'World History'],
      physicsProgress: 75,
      biologyProgress: 88,
      mathProgress: 92,
      riskScore: 'Low',
      activeProctorStatus: 'Clear',
    },
    {
      id: 'stu-2',
      name: 'Alex Rivera',
      email: 'alex.r@educateai.org',
      grade: '7th Grade',
      gpa: 3.2,
      attendance: 91,
      enrolledSubjects: ['Science 7B', 'Pre-Algebra', 'World History'],
      physicsProgress: 52,
      biologyProgress: 64,
      mathProgress: 70,
      riskScore: 'High',
      activeProctorStatus: 'Head Rotation',
    },
    {
      id: 'stu-3',
      name: 'Liam Chen',
      email: 'liam.c@educateai.org',
      grade: '8th Grade',
      gpa: 3.95,
      attendance: 100,
      enrolledSubjects: ['Physics', 'Honors Chemistry', 'Calculus'],
      physicsProgress: 94,
      biologyProgress: 96,
      mathProgress: 98,
      riskScore: 'Low',
      activeProctorStatus: 'Clear',
    },
    {
      id: 'stu-4',
      name: 'Carlos Mendez',
      email: 'carlos.m@educateai.org',
      grade: '7th Grade',
      gpa: 3.5,
      attendance: 94,
      enrolledSubjects: ['Science 7B', 'Algebra', 'Art'],
      physicsProgress: 72,
      biologyProgress: 76,
      mathProgress: 81,
      riskScore: 'Low',
      activeProctorStatus: 'Clear',
    },
    {
      id: 'stu-5',
      name: 'Zoe Washington',
      email: 'zoe.w@educateai.org',
      grade: '8th Grade',
      gpa: 3.65,
      attendance: 95,
      enrolledSubjects: ['Physics', 'Biology', 'Geometry'],
      physicsProgress: 68,
      biologyProgress: 80,
      mathProgress: 85,
      riskScore: 'Medium',
      activeProctorStatus: 'Head Rotation',
    },
    {
      id: 'stu-6',
      name: 'Daniel Vance',
      email: 'daniel.v@educateai.org',
      grade: '8th Grade',
      gpa: 3.1,
      attendance: 86,
      enrolledSubjects: ['Physics', 'General Science', 'World History'],
      physicsProgress: 45,
      biologyProgress: 58,
      mathProgress: 63,
      riskScore: 'High',
      activeProctorStatus: 'Multiple Faces Detected',
    },
  ]);

  // Agile Study Planner State
  const [dailyTasks, setDailyTasks] = useState<DailyStudyTask[]>(() => {
    const baseTasks: DailyStudyTask[] = [
      // October 2026 Tasks
      { id: 'dt-oct-2', day: 2, date: '2026-10-02', subject: 'Algebra I', topic: 'Linear Equations & Variables', duration_hrs: 1.5, is_core: true, status: 'Completed', points: 25, color: '#4F46E5' },
      { id: 'dt-oct-5', day: 5, date: '2026-10-05', subject: 'Physics', topic: 'Kinematics & Velocity Vectors', duration_hrs: 2, is_core: false, status: 'Completed', points: 30, color: '#0284C7' },
      { id: 'dt-oct-7', day: 7, date: '2026-10-07', subject: 'English Literature', topic: 'Shakespearean Sonnets & Metaphor Analysis', duration_hrs: 1.5, is_core: false, status: 'Completed', points: 25, color: '#D97706' },
      { id: 'dt-oct-8', day: 8, date: '2026-10-08', subject: 'Chemistry', topic: 'Atomic Structure & Bohr Model', duration_hrs: 1.5, is_core: false, status: 'Completed', points: 20, color: '#10B981' },
      { id: 'dt-oct-11', day: 11, date: '2026-10-11', subject: 'Biology', topic: 'Plant Respiration & Calvin Cycle Dynamics', duration_hrs: 1.5, is_core: false, status: 'Completed', points: 25, color: '#059669' },
      { id: 'dt-oct-12', day: 12, date: '2026-10-12', subject: 'Algebra I', topic: 'Lesson 3 Review: Linear Inequalities', duration_hrs: 1.5, is_core: true, status: 'Completed', points: 25, color: '#4F46E5' },
      { id: 'dt-oct-14', day: 14, date: '2026-10-14', subject: 'Physics', topic: 'Lab Prep: Vector Dynamics & Net Force', duration_hrs: 2, is_core: false, status: 'In Progress', points: 30, color: '#0284C7' },
      { id: 'dt-oct-15', day: 15, date: '2026-10-15', subject: 'History', topic: 'Reading: Global Dynasties (Ch 4)', duration_hrs: 1.5, is_core: false, status: 'In Progress', points: 20, color: '#0EA5E9' },
      { id: 'dt-oct-16', day: 16, date: '2026-10-16', subject: 'Biology', topic: 'Cell Division: Mitosis vs Meiosis', duration_hrs: 1.5, is_core: false, status: 'On Hold', points: 20, color: '#059669' },
      { id: 'dt-oct-18', day: 18, date: '2026-10-18', subject: 'English Literature', topic: 'Essay Drafting: Narrative Arc & Characterization', duration_hrs: 1.5, is_core: false, status: 'In Progress', points: 20, color: '#D97706' },
      { id: 'dt-oct-19', day: 19, date: '2026-10-19', subject: 'Algebra I', topic: 'Lesson 3 Review: Exponent Rules', duration_hrs: 1.5, is_core: true, status: 'To Do', points: 25, color: '#4F46E5' },
      { id: 'dt-oct-21a', day: 21, date: '2026-10-21', subject: 'Physics', topic: 'Lab Prep: Friction Coefficients', duration_hrs: 1.5, is_core: false, status: 'To Do', points: 25, color: '#0284C7' },
      { id: 'dt-oct-21b', day: 21, date: '2026-10-21', subject: 'History', topic: 'Reading: Economic Networks', duration_hrs: 1, is_core: false, status: 'Revision', points: 15, color: '#F59E0B' },
      { id: 'dt-oct-22', day: 22, date: '2026-10-22', subject: 'Biology', topic: 'Genetics: Mendelian Inheritance & Punnett Squares', duration_hrs: 1.5, is_core: false, status: 'To Do', points: 25, color: '#059669' },
      { id: 'dt-oct-23', day: 23, date: '2026-10-23', subject: 'History', topic: 'Reading: Maritime Trade Maps', duration_hrs: 1.5, is_core: false, status: 'To Do', points: 20, color: '#0EA5E9' },
      { id: 'dt-oct-25', day: 25, date: '2026-10-25', subject: 'English Literature', topic: 'Poetry Explication & Rhyme Scheme Mastery', duration_hrs: 1.5, is_core: false, status: 'To Do', points: 20, color: '#D97706' },
      { id: 'dt-oct-26', day: 26, date: '2026-10-26', subject: 'Algebra I', topic: 'Lesson 3 Review: Factoring Trinomials', duration_hrs: 1.5, is_core: true, status: 'Revision', points: 30, color: '#8B5CF6' },
      { id: 'dt-oct-28', day: 28, date: '2026-10-28', subject: 'Physics', topic: 'Lab Prep: Momentum Collisions', duration_hrs: 2, is_core: false, status: 'To Do', points: 35, color: '#0284C7' },
      { id: 'dt-oct-29', day: 29, date: '2026-10-29', subject: 'History', topic: 'Reading: Post-Classical Societies', duration_hrs: 1.5, is_core: false, status: 'To Do', points: 20, color: '#0EA5E9' },

      // November 2026 Tasks
      { id: 'dt-nov-2', day: 2, date: '2026-11-02', subject: 'Algebra I', topic: 'Quadratic Formula Intro & Roots', duration_hrs: 1.5, is_core: true, status: 'Completed', points: 25, color: '#4F46E5' },
      { id: 'dt-nov-3', day: 3, date: '2026-11-03', subject: 'Algebra I', topic: 'Parabola Symmetry & Vertex Form', duration_hrs: 1.5, is_core: true, status: 'In Progress', points: 25, color: '#4F46E5' },
      { id: 'dt-nov-4', day: 4, date: '2026-11-04', subject: 'Physics', topic: 'Centripetal Force & Orbit Mechanics', duration_hrs: 2, is_core: false, status: 'In Progress', points: 30, color: '#0284C7' },
      { id: 'dt-nov-5', day: 5, date: '2026-11-05', subject: 'English Literature', topic: 'Comparative Literature: Prose & Allegory', duration_hrs: 1.5, is_core: false, status: 'Completed', points: 25, color: '#D97706' },
      { id: 'dt-nov-6', day: 6, date: '2026-11-06', subject: 'Chemistry', topic: 'Chemical Equilibrium & Le Chatelier', duration_hrs: 1.5, is_core: false, status: 'To Do', points: 25, color: '#10B981' },
      { id: 'dt-nov-8', day: 8, date: '2026-11-08', subject: 'Biology', topic: 'Cell Membrane Transport: Osmosis & Diffusion', duration_hrs: 1.5, is_core: false, status: 'Revision', points: 20, color: '#059669' },
      { id: 'dt-nov-9', day: 9, date: '2026-11-09', subject: 'History', topic: 'Reading: Diplomatic Treaties & Alliances', duration_hrs: 1.5, is_core: false, status: 'To Do', points: 20, color: '#0EA5E9' },
      { id: 'dt-nov-10', day: 10, date: '2026-11-10', subject: 'History', topic: 'Reading: Cultural Diffusion & Trade routes', duration_hrs: 1.5, is_core: false, status: 'On Hold', points: 20, color: '#0EA5E9' },
      { id: 'dt-nov-12', day: 12, date: '2026-11-12', subject: 'Algebra I', topic: 'Complex Numbers & Imaginary Roots', duration_hrs: 1.5, is_core: true, status: 'To Do', points: 25, color: '#4F46E5' },
      { id: 'dt-nov-15', day: 15, date: '2026-11-15', subject: 'Biology', topic: 'Ecology: Trophic Levels & Energy Pyramids', duration_hrs: 1.5, is_core: false, status: 'To Do', points: 25, color: '#059669' },
      { id: 'dt-nov-16', day: 16, date: '2026-11-16', subject: 'Physics', topic: 'Work, Energy & Power Review', duration_hrs: 2, is_core: false, status: 'Completed', points: 30, color: '#0284C7' },
      { id: 'dt-nov-19', day: 19, date: '2026-11-19', subject: 'Chemistry', topic: 'Acid-Base Titration Curves & pH', duration_hrs: 1.5, is_core: false, status: 'Revision', points: 25, color: '#10B981' },
      { id: 'dt-nov-20', day: 20, date: '2026-11-20', subject: 'English Literature', topic: 'Final Paper Review: Persuasive Rhetoric', duration_hrs: 1.5, is_core: false, status: 'To Do', points: 20, color: '#D97706' },
      { id: 'dt-nov-24', day: 24, date: '2026-11-24', subject: 'Algebra I', topic: 'Polynomial Functions & Graph Analysis', duration_hrs: 1.5, is_core: true, status: 'To Do', points: 25, color: '#4F46E5' },
      { id: 'dt-nov-27', day: 27, date: '2026-11-27', subject: 'History', topic: 'Modern Economic Revolutions', duration_hrs: 1.5, is_core: false, status: 'To Do', points: 20, color: '#0EA5E9' },
    ];

    const now = new Date();
    const currentPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const hasCurrentMonthTasks = baseTasks.some((t) => t.date?.startsWith(currentPrefix));
    if (hasCurrentMonthTasks) {
      return baseTasks;
    }

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentMonthSeed = baseTasks
      .filter((t) => t.date?.startsWith('2026-11'))
      .map((t) => {
        const clampedDay = Math.min(t.day || 1, daysInMonth);
        return {
          ...t,
          id: `dt-cur-${clampedDay}-${t.id}`,
          day: clampedDay,
          date: `${currentPrefix}-${String(clampedDay).padStart(2, '0')}`,
        };
      });

    return [...baseTasks, ...currentMonthSeed];
  });

  // Synchronize student metrics across Student, Teacher, and Admin panels in real-time
  const syncStudentProgressAcrossPanels = (
    currentTasks: DailyStudyTask[] = dailyTasks,
    triggerTask?: DailyStudyTask
  ) => {
    const studentName = currentUser?.name || 'Sarah Connor';

    const getSubjectMetrics = (keywords: string[]) => {
      const matching = currentTasks.filter((t) =>
        keywords.some((k) => (t.subject || '').toLowerCase().includes(k))
      );
      if (matching.length === 0) return 75;
      const totalPoints = matching.reduce((acc, t) => acc + (t.points || 25), 0);
      const earnedPoints = matching.reduce((acc, t) => {
        if (t.status === 'Completed') return acc + (t.points || 25);
        if (t.status === 'Revision') return acc + (t.points || 25) * 0.75;
        if (t.status === 'In Progress') return acc + (t.points || 25) * 0.45;
        if (t.status === 'On Hold') return acc + (t.points || 25) * 0.15;
        return acc;
      }, 0);
      const ratio = totalPoints > 0 ? earnedPoints / totalPoints : 0;
      return Math.min(100, Math.max(15, Math.round(25 + ratio * 75)));
    };

    const mathProgress = getSubjectMetrics(['math', 'algeb', 'geom', 'calc']);
    const physicsProgress = getSubjectMetrics(['phys']);
    const chemistryProgress = getSubjectMetrics(['chem']);
    const biologyProgress = getSubjectMetrics(['bio']);
    const historyProgress = getSubjectMetrics(['hist', 'world', 'social', 'civic']);
    const englishProgress = getSubjectMetrics(['eng', 'lit', 'prose']);
    const overallProgress = Math.round(
      (mathProgress + physicsProgress + chemistryProgress + biologyProgress + historyProgress + englishProgress) / 6
    );

    // 1. Update currentUser in memory and storage
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        overallProgress,
        mathProgress,
        physicsProgress,
        chemistryProgress,
        biologyProgress,
        historyProgress,
        englishProgress,
      };
      try {
        localStorage.setItem('educate_ai_current_user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Update studentsList roster (so Teacher & Admin panels reflect real-time changes instantly)
    setStudentsList((prev) =>
      prev.map((s) => {
        const matchesUser =
          (currentUser?.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser?.id && s.id === currentUser.id) ||
          s.name === studentName ||
          (!currentUser && s.id === 'stu-1');
        if (matchesUser) {
          return {
            ...s,
            overallProgress,
            physicsProgress,
            biologyProgress,
            mathProgress,
            chemistryProgress,
            historyProgress,
            englishProgress,
          };
        }
        return s;
      })
    );

    // 3. Emit real-time cross-panel notification
    if (triggerTask) {
      addNotification(
        'Student Roadmap Activity Synced ⚡',
        `${studentName} updated "${triggerTask.subject}: ${triggerTask.topic}" to ${triggerTask.status}. Overall Mastery: ${overallProgress}% | Physics: ${physicsProgress}% | Chemistry: ${chemistryProgress}%. Parallelly synced across Student, Teacher & Admin dashboards!`,
        triggerTask.status === 'Completed' ? 'success' : 'info',
        'student'
      );
    }
  };

  const updateStudyTask = (taskId: string, updates: Partial<DailyStudyTask>) => {
    setDailyTasks((prev) => {
      let targetTask: DailyStudyTask | undefined;
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          targetTask = { ...t, ...updates };
          return targetTask;
        }
        return t;
      });
      syncStudentProgressAcrossPanels(updated, targetTask);
      return updated;
    });
  };

  const addStudyTask = (newTask: DailyStudyTask) => {
    setDailyTasks((prev) => {
      const updated = [...prev, newTask];
      syncStudentProgressAcrossPanels(updated, newTask);
      return updated;
    });
    addNotification(
      'Task Scheduled 📅',
      `Scheduled ${newTask.subject}: "${newTask.topic}" on Day ${newTask.day} (${newTask.points ?? 25} pts). Live progress recalculated!`,
      'success',
      'student'
    );
  };

  const deleteStudyTask = (taskId: string) => {
    setDailyTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      syncStudentProgressAcrossPanels(updated);
      return updated;
    });
    addNotification('Task Removed', 'Study task has been removed from roadmap.', 'info', 'student');
  };

  const completeCurriculumUnit = (subjectName: string, unitTitle: string) => {
    const studentName = currentUser?.name || 'Sarah Connor';
    const newTask: DailyStudyTask = {
      id: `task-unit-${Date.now()}`,
      day: new Date().getDate(),
      date: new Date().toISOString().split('T')[0],
      subject: subjectName,
      topic: unitTitle,
      duration_hrs: 1.5,
      is_core: subjectName.toLowerCase().includes('math') || subjectName.toLowerCase().includes('algeb'),
      status: 'Completed',
      points: 30,
      color: '#00A896',
    };

    setDailyTasks((prev) => {
      const updated = [newTask, ...prev];
      syncStudentProgressAcrossPanels(updated, newTask);
      return updated;
    });

    addNotification(
      'Unit Completed & Synced 📚',
      `${studentName} completed unit "${unitTitle}" in ${subjectName}. Progress immediately updated across Student, Teacher & Admin dashboards!`,
      'success',
      'student'
    );
  };

  const recordQuizSubmission = (
    quizId: string,
    answers: { [qIndex: number]: number }
  ): {
    score: number;
    correctCount: number;
    totalQuestions: number;
    certificateIssued?: DigitalCertificate;
  } => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) return { score: 0, correctCount: 0, totalQuestions: 0 };

    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.answerIndex) {
        correctCount++;
      }
    });

    const totalQuestions = Math.max(1, quiz.questions.length);
    const score = Math.round((correctCount / totalQuestions) * 100);
    const studentName = currentUser?.name || 'Sarah Connor';

    // 1. Update quiz attempts and avgScore
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === quizId) {
          const oldAttempts = q.attempts || 0;
          const oldAvg = q.avgScore || score;
          const newAvg = Math.round((oldAvg * oldAttempts + score) / (oldAttempts + 1));
          return { ...q, attempts: oldAttempts + 1, avgScore: newAvg };
        }
        return q;
      })
    );

    // 2. Update currentUser in real time
    const isPhysics = quiz.topic.toLowerCase().includes('phys') || quiz.title.toLowerCase().includes('phys') || quiz.topic.toLowerCase().includes('kinematics');
    const isBio = quiz.topic.toLowerCase().includes('bio') || quiz.title.toLowerCase().includes('cell');
    const isMath = quiz.topic.toLowerCase().includes('math') || quiz.title.toLowerCase().includes('algeb');
    const isChem = quiz.topic.toLowerCase().includes('chem') || quiz.title.toLowerCase().includes('atom') || quiz.title.toLowerCase().includes('period');

    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        physicsProgress: isPhysics ? Math.min(100, Math.max(prev.physicsProgress ?? 75, score)) : prev.physicsProgress,
        biologyProgress: isBio ? Math.min(100, Math.max(prev.biologyProgress ?? 80, score)) : prev.biologyProgress,
        mathProgress: isMath ? Math.min(100, Math.max(prev.mathProgress ?? 85, score)) : prev.mathProgress,
        chemistryProgress: isChem ? Math.min(100, Math.max(prev.chemistryProgress ?? 80, score)) : prev.chemistryProgress,
        gpa: parseFloat(Math.min(4.0, (prev.gpa ?? 3.85) + (score >= 80 ? 0.02 : 0)).toFixed(2)),
      };
      try {
        localStorage.setItem('educate_ai_current_user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. Update studentsList roster for real-time visibility in Teacher & Admin panels
    setStudentsList((prev) =>
      prev.map((s) => {
        const matchesUser =
          (currentUser?.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser?.id && s.id === currentUser.id) ||
          s.name === studentName ||
          (!currentUser && s.id === 'stu-1');
        if (matchesUser) {
          return {
            ...s,
            physicsProgress: isPhysics ? Math.min(100, Math.max(s.physicsProgress, score)) : s.physicsProgress,
            biologyProgress: isBio ? Math.min(100, Math.max(s.biologyProgress, score)) : s.biologyProgress,
            mathProgress: isMath ? Math.min(100, Math.max(s.mathProgress, score)) : s.mathProgress,
            chemistryProgress: isChem ? Math.min(100, Math.max(s.chemistryProgress ?? 80, score)) : s.chemistryProgress,
            gpa: parseFloat(Math.min(4.0, s.gpa + (score >= 80 ? 0.02 : 0)).toFixed(2)),
          };
        }
        return s;
      })
    );

    // 4. Issue certificate if score >= 80
    let cert: DigitalCertificate | undefined;
    if (score >= 80) {
      cert = issueCertificate(studentName, quiz.title, score);
    }

    // 5. Emit multi-panel notifications
    addNotification(
      'Assessment Complete 🎯',
      `${studentName} completed "${quiz.title}" scoring ${score}% (${correctCount}/${totalQuestions}). Updated in Teacher class roster and Admin analytics in real time!`,
      score >= 70 ? 'success' : 'info',
      'student'
    );

    return { score, correctCount, totalQuestions, certificateIssued: cert };
  };

  const [weeklySprints] = useState<WeeklySprintAllocation[]>([
    { week: 1, weekLabel: 'Week 1: Core Algebra & Kinematics', coreSubjectHours: 10.5, rotatingSubjectHours: { Physics: 8, History: 6, Chemistry: 4 }, totalHours: 28.5 },
    { week: 2, weekLabel: 'Week 2: Quadratic Functions & Cell Biology', coreSubjectHours: 10.5, rotatingSubjectHours: { Physics: 7, Biology: 6, History: 5 }, totalHours: 28.5 },
    { week: 3, weekLabel: 'Week 3: Midterm Simulation & Exam Review', coreSubjectHours: 10.5, rotatingSubjectHours: { Chemistry: 8, ComputerScience: 7, English: 4 }, totalHours: 29.5 },
  ]);

  const [masterChapters] = useState<MasterChapterItem[]>([
    { id: 'ch-1', subject: 'Algebra I', chapterName: 'Linear Equations & Inequalities', allocatedHours: 12, targetStartDate: '2026-10-12', targetEndDate: '2026-10-18', status: 'Completed' },
    { id: 'ch-2', subject: 'Algebra I', chapterName: 'Quadratic Functions & Parabolas', allocatedHours: 15, targetStartDate: '2026-10-19', targetEndDate: '2026-10-27', status: 'In Progress' },
    { id: 'ch-3', subject: 'Physics II', chapterName: "Newton's Laws & Kinematics", allocatedHours: 14, targetStartDate: '2026-10-15', targetEndDate: '2026-10-24', status: 'In Progress' },
    { id: 'ch-4', subject: 'Chemistry', chapterName: 'Periodic Table Trends & Bonding', allocatedHours: 10, targetStartDate: '2026-10-28', targetEndDate: '2026-11-05', status: 'Scheduled' },
    { id: 'ch-5', subject: 'World History', chapterName: 'Modern Era & Global Networks', allocatedHours: 8, targetStartDate: '2026-11-06', targetEndDate: '2026-11-15', status: 'Scheduled' },
  ]);

  const generateStudyPlan = async (params?: any) => {
    try {
      const res = await fetch('/api/study-planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {}),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.sheets?.dailyAgilePlanner) {
          setDailyTasks(data.sheets.dailyAgilePlanner);
          addNotification('Study Plan Regenerated', 'Agile Study Roadmap successfully recalculated with daily core allocation.', 'success', 'student');
        }
      }
    } catch (e) {
      console.warn('Study planner generation network notice', e);
    }
  };

  const exportStudyPlanSpreadsheet = () => {
    // Generate clean CSV format containing all 3 sheets
    let csv = '=== SHEET 1: DAILY AGILE PLANNER ===\n';
    csv += 'Day,Date,Subject,Topic,Allocated Hours,Is Core Practice,Status\n';
    dailyTasks.forEach((t) => {
      csv += `${t.day},${t.date},"${t.subject}","${t.topic}",${t.duration_hrs},${t.is_core ? 'YES (Core Math)' : 'NO'},${t.status}\n`;
    });

    csv += '\n=== SHEET 2: WEEKLY SPRINT BOARD ===\n';
    csv += 'Week,Sprint Label,Guaranteed Core Math Hours,Total Weekly Hours\n';
    weeklySprints.forEach((s) => {
      csv += `${s.week},"${s.weekLabel}",${s.coreSubjectHours},${s.totalHours}\n`;
    });

    csv += '\n=== SHEET 3: MASTER CHAPTER TRACKER ===\n';
    csv += 'Chapter ID,Subject,Chapter Title,Target Hours,Start Date,Completion Target,Status\n';
    masterChapters.forEach((c) => {
      csv += `${c.id},"${c.subject}","${c.chapterName}",${c.allocatedHours},${c.targetStartDate},${c.targetEndDate},${c.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PivotIQ_Agile_Study_Planner_${currentUser?.name?.replace(/\s+/g, '_') || 'Student'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('Spreadsheet Exported', 'Agile 3-Sheet Study Roadmap successfully downloaded as .csv/.xlsx.', 'success', 'student');
  };

  const signup = async (data: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    grade?: string;
    grade_level?: number | string;
    education_board?: string;
    preferred_language?: string;
    school_name?: string;
    school_address?: string;
    school_lat?: number;
    school_lng?: number;
    school_id?: string;
    mobile_number?: string;
    guardian_name?: string;
    guardian_phone?: string;
    guardian_email?: string;
  }): Promise<boolean> => {
    let finalSchoolId = data.school_id;
    if (data.school_name) {
      try {
        const saved = await registerSchool({
          name: data.school_name,
          address: data.school_address,
          lat: data.school_lat,
          lng: data.school_lng,
        });
        if (saved) finalSchoolId = saved.id;
      } catch (e) {
        console.warn(e);
      }
    }

    const newUser: AppUser = {
      id: `user-${data.role}-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      grade: data.grade || (data.role === 'student' ? 'Grade 10 - Science' : undefined),
      grade_level: data.grade_level || (data.role === 'student' ? 10 : undefined),
      education_board: data.education_board || 'CBSE',
      preferred_language: data.preferred_language || 'en',
      school_id: finalSchoolId,
      school_name: data.school_name || 'D.A.V. Public School, Sector 8',
      school_address: data.school_address || 'Sector 8-C, Chandigarh, India',
      school_lat: data.school_lat || 30.7398,
      school_lng: data.school_lng || 76.7827,
      enrollmentDate: 'Aug 2024',
      enrolledCourses: [
        'Algebra I (MTH-101)',
        'Physics II (PHY-201)',
        'World History (HIS-101)',
        'Chemistry (CHM-101)',
        'English Literature (ENG-201)',
        'Computer Science (CSC-301)',
      ],
      overallProgress: 88,
      physicsProgress: 85,
      biologyProgress: 80,
      mathProgress: 95,
      attendance: 98,
      gpa: 3.82,
    };

    setUsersList((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setCurrentRoleState(data.role);
    setIsAuthenticated(true);
    if (data.preferred_language) setGlobalLanguage(data.preferred_language);
    if (data.education_board) setCurrentBoard(data.education_board);

    addNotification(
      'Account Created & 7-Day Trial Active!',
      `Welcome ${data.name}! You have 7 days of full platform access activated.`,
      'success',
      data.role
    );
    return true;
  };

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    // Automatically switch currentUser to the matching user for that role so student portal reflects student state immediately
    const matched = usersList.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      try {
        localStorage.setItem('educate_ai_current_user', JSON.stringify(matched));
      } catch (e) {
        // ignore
      }
    }
  };

  const login = (role: UserRole, email?: string, password?: string): boolean => {
    const matched =
      usersList.find(
        (u) => u.role === role && (email ? u.email.toLowerCase() === email.toLowerCase() : true)
      ) ||
      usersList.find((u) => u.role === role) || {
        id: `user-${role}-demo`,
        name: role === 'student' ? 'Sarah Connor' : role === 'teacher' ? 'Ms. Elena Rostova' : 'Dr. Marcus Vance',
        email: email || `${role}@educateai.org`,
        role,
        status: 'Active',
        createdAt: '2026-01-01',
      };

    setCurrentUser(matched);
    try {
      localStorage.setItem('educate_ai_current_user', JSON.stringify(matched));
    } catch (e) {
      // ignore
    }
    setCurrentRoleState(role);
    setIsAuthenticated(true);

    addNotification(
      `Welcome, ${matched.name}!`,
      `Successfully signed in as ${role === 'student' ? 'Student' : role === 'teacher' ? 'Educator' : 'Administrator'}.`,
      'success',
      role
    );
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem('educate_ai_current_user');
    } catch (e) {
      // ignore
    }
    addNotification('Signed Out', 'You have been safely signed out.', 'info', 'system');
  };

  const updateCurrentUser = (updates: Partial<AppUser>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsersList((prev) => {
      const exists = prev.some((u) => u.id === updated.id);
      const next = exists ? prev.map((u) => (u.id === updated.id ? updated : u)) : [updated, ...prev];
      try {
        localStorage.setItem('educate_ai_users_list', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save users list', e);
      }
      return next;
    });
    try {
      localStorage.setItem('educate_ai_current_user', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save current user', e);
    }
    addNotification('Profile Updated', 'Your profile settings have been updated.', 'success', currentUser.role);
  };

  const addUser = (newUser: Omit<AppUser, 'id' | 'createdAt'>) => {
    const id = `user-${newUser.role.slice(0, 3)}-${Date.now()}`;
    const user: AppUser = {
      ...newUser,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsersList((prev) => [user, ...prev]);
    addNotification('User Created', `Successfully created user account for ${user.name} (${user.role}).`, 'success', 'admin');
  };

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    const previousUser = usersList.find((u) => u.id === id);
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
            try {
              localStorage.setItem('educate_ai_current_user', JSON.stringify(updated));
            } catch {}
          }
          return updated;
        }
        return u;
      })
    );

    if (previousUser && (updates.role === undefined || updates.role === 'student') && previousUser.role === 'student') {
      setStudentsList((prev) =>
        prev.map((s) => {
          const isMatch = s.id === id || s.email.toLowerCase() === previousUser.email.toLowerCase();
          if (!isMatch) return s;
          return {
            ...s,
            name: updates.name ?? s.name,
            email: updates.email ?? s.email,
            grade: updates.grade ?? s.grade,
            enrolledSubjects: updates.enrolledCourses ?? s.enrolledSubjects,
            gpa: updates.gpa ?? s.gpa,
            attendance: updates.attendance ?? s.attendance,
            overallProgress: updates.overallProgress ?? s.overallProgress,
          };
        })
      );
    }

    addNotification('User Updated', 'User details and permissions updated.', 'info', 'admin');
  };

  const deleteUser = (id: string) => {
    const target = usersList.find((u) => u.id === id);
    setUsersList((prev) => prev.filter((u) => u.id !== id));
    addNotification('User Removed', `Removed user ${target?.name || id} from directory.`, 'warning', 'admin');
  };

  // Student Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Hi Sarah! Ready for Newton's Laws of Motion today?",
      timestamp: '10:14 AM',
    },
    {
      id: 'msg-2',
      sender: 'student',
      text: "Student: I'm stuck on the 3rd law.",
      timestamp: '10:15 AM',
    },
    {
      id: 'msg-3',
      sender: 'ai',
      text: "AI Tutor: The 3rd law states: For every action, there is an equal and opposite reaction. Think of swimming!",
      timestamp: '10:15 AM',
      mathFormula: 'F_{action} = -F_{reaction}',
    },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chapterProgress, setChapterProgress] = useState(75);

  // Doubts (General Ecosystem)
  const [doubts, setDoubts] = useState<StudentDoubt[]>([
    {
      id: 'dbt-1',
      studentName: 'Sarah Connor',
      subject: 'Physics',
      question: "Why don't action and reaction forces cancel each other out?",
      createdAt: '10:12 AM',
      status: 'resolved',
      solution: 'Because they act on two different bodies! Force A on B does not cancel Force B on A.',
    },
    {
      id: 'dbt-2',
      studentName: 'Sarah Connor',
      subject: 'Biology',
      question: 'What is the exact role of NADP+ in the light-dependent stage?',
      createdAt: 'Yesterday',
      status: 'pending',
    },
  ]);

  // Private Student Quick Doubts AI (Real-time LLM only — never submitted to teachers)
  const [quickDoubts, setQuickDoubts] = useState<QuickDoubtItem[]>(() => {
    try {
      const saved = localStorage.getItem('educate_quick_doubts_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage error
    }
    return [
      {
        id: 'qd-welcome-1',
        subject: 'Physics',
        topic: "Newton's Laws of Motion",
        question: "Why don't action and reaction forces cancel each other out?",
        answer:
          "### Resolution\nAction and reaction forces never cancel each other out because they act on **two different objects**, never on the same body.\n\n- When Body A exerts force $F_{AB}$ on Body B, Body B exerts an equal and opposite force $F_{BA} = -F_{AB}$ back on Body A.\n- To determine whether **Body B** accelerates, you only sum forces acting *on Body B*, not forces acting on Body A.\n- Forces cancel out only when equal and opposite forces act on the **same** object.\n\n### Further Learning\n- Try applying Newton's 3rd Law to how a rocket accelerates in the vacuum of space.\n- Ask me: Why does a swimmer move forward when pushing water backward?\n- Challenge: Compare a book resting on a table (gravity vs normal force) with an action-reaction pair.",
        status: 'resolved',
        createdAt: 'AI Ready',
        gradeLevel: 8,
        board: 'CBSE',
        language: 'en',
        messages: [
          {
            id: 'turn-welcome-stu',
            sender: 'student',
            text: "Why don't action and reaction forces cancel each other out?",
            timestamp: 'AI Ready',
          },
          {
            id: 'turn-welcome-ai',
            sender: 'ai',
            text: "### Resolution\nAction and reaction forces never cancel each other out because they act on **two different objects**, never on the same body.\n\n- When Body A exerts force $F_{AB}$ on Body B, Body B exerts an equal and opposite force $F_{BA} = -F_{AB}$ back on Body A.\n- To determine whether **Body B** accelerates, you only sum forces acting *on Body B*, not forces acting on Body A.\n- Forces cancel out only when equal and opposite forces act on the **same** object.\n\n### Further Learning\n- Try applying Newton's 3rd Law to how a rocket accelerates in the vacuum of space.\n- Ask me: Why does a swimmer move forward when pushing water backward?\n- Challenge: Compare a book resting on a table (gravity vs normal force) with an action-reaction pair.",
            timestamp: 'AI Ready',
          },
        ],
      },
    ];
  });

  useEffect(() => {
    try {
      // Persist resolved/error items cleanly (avoid storing giant streaming blanks or stale streaming flags)
      const sanitized = quickDoubts.slice(0, 25).map((q) =>
        q.status === 'streaming' ? { ...q, status: 'error' as const, errorMessage: q.answer ? undefined : 'Interrupted' } : q
      );
      localStorage.setItem('educate_quick_doubts_v1', JSON.stringify(sanitized));
    } catch {
      // Ignore quota errors
    }
  }, [quickDoubts]);

  // Teacher Data
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([
    {
      id: 'lp-1',
      topic: 'Photosynthesis',
      grade: '7th',
      style: 'Interactive',
      duration: '45 Minutes',
      learningObjectives: [
        'Understand the biochemical role of chlorophyll and chloroplasts.',
        'Trace the conversion of photon light energy into chemical glucose.',
        'Recognize the global importance of oxygen and carbon cycles.',
      ],
      warmUpActivity: {
        title: 'The Sunlight Mystery Inquiry',
        duration: '7 mins',
        prompt: 'Compare two bean plants kept in sunlight vs total darkness for 5 days.',
      },
      coreActivities: [
        {
          name: 'Chloroplast Microscopy & Stomata Guard Cells',
          duration: '18 mins',
          description: 'Students analyze digital slides of leaf cross-sections under high magnification.',
        },
        {
          name: 'Chemical Balancing Puzzle Game',
          duration: '15 mins',
          description: 'Rearranging interactive magnetic atoms: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.',
        },
      ],
      readingMaterial: 'Photosynthesis is nature\'s solar kitchen, synthesizing organic sugars from carbon dioxide and water.',
      assessmentCheckpoints: ['Identify light reaction products', 'Explain why plant leaves look green'],
      homeworkChallenge: 'Create a 1-page visual comic strip tracing a photon from the Sun into a sugar molecule.',
      createdAt: 'Just now',
    },
  ]);

  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 'quiz-1',
      title: 'Plant Cells & Photosynthesis Assessment',
      topic: 'Biology · Plant Cells & Photosynthesis',
      grade: '8th Grade',
      author: 'Ms. Elena Rostova',
      createdAt: 'Today, 09:30 AM',
      assignedToClass: 'Class 8B - Biology',
      attempts: 24,
      avgScore: 84,
      questions: PLANT_CELLS_QUIZ_QUESTIONS,
    },
    {
      id: 'quiz-2',
      title: "Newton's Three Laws of Motion - Mastery Check",
      topic: "Physics · Newton's Laws of Motion",
      grade: '8th Grade',
      author: 'Mr. David Vance',
      createdAt: 'Yesterday',
      assignedToClass: 'Class 8A - Physics',
      attempts: 28,
      avgScore: 78,
      questions: NEWTONS_LAWS_QUIZ_QUESTIONS,
    },
    {
      id: 'quiz-3',
      title: 'Algebra, Linear & Quadratic Equations Mastery',
      topic: 'Mathematics · Algebra & Quadratics',
      grade: '8th Grade',
      author: 'Dr. Priya Nair',
      createdAt: '2 days ago',
      assignedToClass: 'Class 8A - Mathematics',
      attempts: 31,
      avgScore: 81,
      questions: ALGEBRA_QUADRATICS_QUIZ_QUESTIONS,
    },
  ]);

  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([
    {
      id: 'sug-1',
      studentName: 'Alex Rivera',
      studentId: 'stu-2',
      topic: 'Cellular Respiration vs Photosynthesis',
      message: 'Student Alex needs help with cellular respiration and ATP yield.',
      urgency: 'high',
      recommendedAction: 'Send 5-min interactive concept drill',
      timestamp: '12m ago',
    },
    {
      id: 'sug-2',
      studentName: 'Sarah Connor',
      studentId: 'stu-1',
      topic: "Newton's 3rd Law of Motion",
      message: "Student Sarah asked 2 doubts regarding Action-Reaction pairs on different bodies.",
      urgency: 'medium',
      recommendedAction: 'Recommend Swimming & Rocket propulsion simulation',
      timestamp: '25m ago',
    },
    {
      id: 'sug-3',
      studentName: 'Marcus Kane',
      studentId: 'stu-3',
      topic: 'Genetics & Punnett Squares',
      message: 'Marcus completed all chapter challenges with 96% score. Ready for honors track.',
      urgency: 'low',
      recommendedAction: 'Award Advanced Genetics Badge & unlock AP module',
      timestamp: '1h ago',
    },
  ]);

  const [isDraftingPlan, setIsDraftingPlan] = useState(false);
  const [isDraftingQuiz, setIsDraftingQuiz] = useState(false);

  // Proctoring Feeds (matching Ref Image 2)
  const [localWebcamActive, setLocalWebcamActive] = useState(false);
  const [proctorFeeds, setProctorFeeds] = useState<ProctorFeed[]>([
    {
      id: 'feed-1',
      studentId: 'stu-1',
      studentName: 'Student 1 (Sarah C.)',
      subject: 'Physics Midterm Exam',
      examName: 'Midterm 2026',
      status: 'Clear',
      anomalyConfidence: 12,
      avatarSeed: 1,
      lastActive: 'Live',
      streamColor: 'blue',
      flagsCount: 0,
    },
    {
      id: 'feed-2',
      studentId: 'stu-2',
      studentName: 'Student 2 (Alex R.)',
      subject: 'Physics Midterm Exam',
      examName: 'Midterm 2026',
      status: 'Head Rotation',
      anomalyConfidence: 89,
      avatarSeed: 2,
      lastActive: 'Live',
      streamColor: 'amber',
      flagsCount: 3,
    },
    {
      id: 'feed-3',
      studentId: 'stu-3',
      studentName: 'Student 3 (Liam C.)',
      subject: 'Physics Midterm Exam',
      examName: 'Midterm 2026',
      status: 'Clear',
      anomalyConfidence: 5,
      avatarSeed: 3,
      lastActive: 'Live',
      streamColor: 'yellow',
      flagsCount: 0,
    },
    {
      id: 'feed-4',
      studentId: 'stu-4',
      studentName: 'Student 4 (Carlos M.)',
      subject: 'Physics Midterm Exam',
      examName: 'Midterm 2026',
      status: 'Clear',
      anomalyConfidence: 8,
      avatarSeed: 4,
      lastActive: 'Live',
      streamColor: 'red',
      flagsCount: 0,
    },
    {
      id: 'feed-5',
      studentId: 'stu-5',
      studentName: 'Student 5 (Zoe W.)',
      subject: 'Physics Midterm Exam',
      examName: 'Midterm 2026',
      status: 'Head Rotation',
      anomalyConfidence: 78,
      avatarSeed: 5,
      lastActive: 'Live',
      streamColor: 'indigo',
      flagsCount: 2,
    },
    {
      id: 'feed-6',
      studentId: 'stu-6',
      studentName: 'Student 6 (Daniel V.)',
      subject: 'Physics Midterm Exam',
      examName: 'Midterm 2026',
      status: 'Multiple Faces Detected',
      anomalyConfidence: 96,
      avatarSeed: 6,
      lastActive: 'Live',
      streamColor: 'orange',
      flagsCount: 5,
    },
  ]);

  // Anomaly Logs (matching Ref Image 2)
  const [anomalyLogs, setAnomalyLogs] = useState<AnomalyLog[]>([
    {
      id: 'log-1',
      timestamp: '2026-10-13 13:18:58 AM',
      studentId: 'stu-1',
      studentName: 'Student 1',
      detectionType: 'Head Rotation',
      status: 'Active',
      severity: 'medium',
      feedThumbnailSeed: 1,
    },
    {
      id: 'log-2',
      timestamp: '2026-10-13 13:29:31 AM',
      studentId: 'stu-2',
      studentName: 'Student 2',
      detectionType: 'Head Rotation',
      status: 'Detected',
      severity: 'high',
      feedThumbnailSeed: 2,
    },
    {
      id: 'log-3',
      timestamp: '2026-10-13 13:35:10 AM',
      studentId: 'stu-6',
      studentName: 'Student 6',
      detectionType: 'Multiple Faces Detected',
      status: 'Active',
      severity: 'high',
      feedThumbnailSeed: 6,
    },
  ]);

  // Keep studentsList synchronized whenever students are added, removed, or signed up in usersList
  useEffect(() => {
    const studentUsers = usersList.filter((u) => u.role === 'student');
    setStudentsList((prev) => {
      const existingByEmail = new Map(prev.map((s) => [s.email.toLowerCase(), s]));
      const existingById = new Map(prev.map((s) => [s.id, s]));

      const synced: StudentProfile[] = studentUsers.map((u) => {
        const existing = existingByEmail.get(u.email.toLowerCase()) || existingById.get(u.id);
        if (existing) {
          return existing;
        }
        const overall = u.overallProgress ?? 75;
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          grade: u.grade || (u.grade_level ? `Grade ${u.grade_level}` : '8th Grade'),
          gpa: u.gpa ?? 3.5,
          attendance: u.attendance ?? 95,
          enrolledSubjects: u.enrolledCourses || ['Physics', 'Biology', 'Mathematics'],
          overallProgress: overall,
          physicsProgress: u.physicsProgress ?? 70,
          biologyProgress: u.biologyProgress ?? 75,
          mathProgress: u.mathProgress ?? 80,
          chemistryProgress: u.chemistryProgress,
          historyProgress: u.historyProgress,
          englishProgress: u.englishProgress,
          riskScore: overall < 60 ? 'High' : overall < 75 ? 'Medium' : 'Low',
          activeProctorStatus: 'Clear',
        };
      });

      return synced;
    });
  }, [usersList]);

  // Teachers roster derived live from usersList so any newly added/updated/deleted teacher reflects immediately
  const teachersList = React.useMemo<TeacherProfile[]>(() => {
    return usersList
      .filter((u) => u.role === 'teacher')
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        subject:
          (u.assignedSubjects && u.assignedSubjects.length > 0
            ? u.assignedSubjects.join(', ')
            : u.department) || 'General Sciences',
        classes:
          u.assignedCohorts && u.assignedCohorts.length > 0
            ? u.assignedCohorts
            : ['General Cohort'],
        activeStudentsCount: u.activeStudentsCount ?? 30,
        lessonPlansCount: u.createdLessonPlansCount ?? 0,
      }));
  }, [usersList]);

  // Digital Certificates
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([
    {
      id: 'cert-1',
      certificateNumber: 'PIVOTIQ-2026-98124',
      studentName: 'Sarah Connor',
      courseTitle: "Classical Mechanics & Newton's Laws",
      gradeLevel: 'Grade 8 Honors',
      issueDate: 'October 8, 2026',
      instructorName: 'Dr. David Vance & PivotIQ',
      verificationHash: '0x9e8a71b4c321d0a5e8211b43aa992f1406e123bc',
      status: 'Verified',
      skillsAcquired: [
        'Newton\'s Three Laws Analysis',
        'Kinematic Vector Problem Solving',
        'Frictional Force & Momentum Conservation',
      ],
      score: 95,
    },
    {
      id: 'cert-2',
      certificateNumber: 'EDU-AI-2026-77312',
      studentName: 'Sarah Connor',
      courseTitle: 'Cellular Respiration & Bioenergetics',
      gradeLevel: 'Grade 8 Science',
      issueDate: 'September 22, 2026',
      instructorName: 'Ms. Elena Rostova',
      verificationHash: '0x43b2e98711cf098a543cd219e88aa124b6f12019',
      status: 'Verified',
      skillsAcquired: [
        'Glycolysis & Krebs Cycle',
        'Mitochondrial ATP Synthase Mechanics',
        'Anaerobic Fermentation Pathways',
      ],
      score: 92,
    },
  ]);

  // Proctoring Settings
  const [sensitivity, setSensitivity] = useState({
    gazeThreshold: 75,
    rotationAngle: 35,
    multiFaceDetection: true,
    audioThreshold: 60,
  });

  // Cross-panel notifications
  const [notifications, setNotifications] = useState<CrossPanelNotification[]>([
    {
      id: 'n-1',
      sourceRole: 'system',
      title: 'Unified Ecosystem Online',
      description: 'Real-time WebSocket & Event synchronization running across Student, Teacher & Admin clients.',
      timestamp: 'Just now',
      type: 'info',
    },
  ]);

  const addNotification = (title: string, description: string, type: CrossPanelNotification['type'], source: UserRole | 'system' = 'system') => {
    const newNotif: CrossPanelNotification = {
      id: `notif-${Date.now()}`,
      title,
      description,
      type,
      sourceRole: source,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 7)]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Student sends message to AI Tutor
  const sendTutorMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      text: `Student: ${text}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    try {
      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatMessages.slice(-6).map((m) => ({
            role: m.sender === 'student' ? 'user' : 'model',
            content: m.text.replace(/^(Student:\s*|AI Tutor:\s*)/i, ''),
          })),
          subject: 'Physics',
          topic: "Newton's Laws of Motion",
          student_grade: currentUser?.grade || '8th Grade',
          board: currentBoard || 'CBSE',
          medium: globalLanguage || 'en',
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Let's explore this concept together step-by-step!";
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: reply.startsWith('AI Tutor:') ? reply : `AI Tutor: ${reply}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);

      // If student asked about doubt, trigger subtle sync to teacher activity
      if (text.toLowerCase().includes('stuck') || text.toLowerCase().includes('doubt') || text.toLowerCase().includes('confused')) {
        addNotification(
          'Student Query Logged',
          `Sarah Connor requested pedagogical assistance on "${text.slice(0, 35)}..."`,
          'info',
          'student'
        );
      }
    } catch (err) {
      console.error(err);
      const fallbackAiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: "AI Tutor: For every action, there is an equal and opposite reaction! Think of when you jump off a skateboard: you push forward, but the skateboard rolls backward.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Helper: Capture PNG screenshot & immediately dispatch Guardian WhatsApp + Email alert (never sent to teachers)
  const triggerGuardianEscalation = async (params: {
    subject: string;
    topic?: string;
    grade: number | string;
    board: string;
    surfaceLabel?: string;
  }): Promise<GuardianEscalationReceipt> => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullTimestamp = new Date().toLocaleString();
    const guardianName = currentUser?.guardian_name || 'David Connor (Parent/Guardian)';
    const guardianPhone = currentUser?.guardian_phone || '+91 98765 11223';
    const guardianEmail = currentUser?.guardian_email || 'david.c@guardian.org';

    const screenshotDataUrl = await captureQuickDoubtScreenshot({
      studentName: currentUser?.name || 'Sarah Connor',
      studentEmail: currentUser?.email || 'sarah.c@educateai.org',
      grade: params.grade,
      board: params.board,
      subject: params.subject,
      topic: params.topic,
      guardianName,
      guardianPhone,
      guardianEmail,
      surfaceLabel: params.surfaceLabel || 'Quick Doubts AI Assistant',
      timestamp: fullTimestamp,
    });

    try {
      const res = await fetch('/api/safety/report-guardian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser?.id || 'stu-1',
          studentName: currentUser?.name || 'Sarah Connor',
          studentEmail: currentUser?.email || '',
          grade: params.grade,
          board: params.board,
          subject: params.subject,
          topic: params.topic || '',
          violationType: 'FOUL_LANGUAGE',
          guardianName,
          guardianPhone,
          guardianEmail,
          screenshotBase64: screenshotDataUrl,
          capturedAt: fullTimestamp,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.incident) {
          return {
            ...data.incident,
            screenshotDataUrl,
          };
        }
      }
    } catch (err) {
      console.warn('Guardian escalation dispatch notice:', err);
    }

    const digits = guardianPhone.replace(/[^\d]/g, '') || '919876511223';
    const summaryText = `[PivotIQ Safety Alert] Foul language detected in ${currentUser?.name || 'Student'}'s Quick Doubts AI session (${params.subject}) at ${fullTimestamp}. Screenshot captured.`;
    return {
      id: `grd-${Date.now()}`,
      guardianName,
      guardianPhone,
      guardianEmail,
      timestamp,
      whatsappDispatched: true,
      emailDispatched: true,
      whatsappUrl: `https://wa.me/${digits}?text=${encodeURIComponent(summaryText)}`,
      emailUrl: `mailto:${encodeURIComponent(guardianEmail)}?subject=${encodeURIComponent('[Urgent Safety Alert] Conduct Guardrail Triggered')}&body=${encodeURIComponent(summaryText)}`,
      screenshotDataUrl,
    };
  };

  // Shared real-time interactive SSE streamer for both new doubts and interactive follow-up replies
  const streamQuickDoubtTurn = async (params: {
    itemId: string;
    aiTurnId: string;
    promptText: string;
    history: Array<{ sender: 'student' | 'ai'; text: string }>;
    subject: string;
    topic?: string;
    grade: number | string;
    board: string;
    medium: string;
    imageBase64?: string;
    imageMimeType?: string;
    surfaceLabel?: string;
  }) => {
    const {
      itemId,
      aiTurnId,
      promptText,
      history,
      subject,
      topic,
      grade,
      board,
      medium,
      imageBase64,
      imageMimeType,
      surfaceLabel,
    } = params;

    // Stress / Medical guardrail check (strictly only suggest parents & medical practitioner)
    if (detectStressOrMedicalQuery(promptText)) {
      setQuickDoubts((prev) =>
        prev.map((q) => {
          if (q.id !== itemId) return q;
          const updatedMsgs = (q.messages || []).map((m) =>
            m.id === aiTurnId
              ? { ...m, text: STRICT_PARENT_DOCTOR_ONLY_RESPONSE, isWellnessNotice: true }
              : m
          );
          return {
            ...q,
            answer: STRICT_PARENT_DOCTOR_ONLY_RESPONSE,
            status: 'resolved',
            isWellnessNotice: true,
            messages: updatedMsgs,
          };
        })
      );
      return;
    }

    try {
      const response = await fetch('/api/tutor/doubt-solve/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: promptText,
          history,
          subject,
          topic: topic || '',
          student_grade: grade,
          board,
          medium,
          imageBase64,
          imageMimeType,
        }),
      });

      if (!response.ok) {
        let errJson: any = null;
        try {
          errJson = await response.json();
        } catch {
          errJson = null;
        }

        if (response.status === 403 && errJson?.blocked) {
          const receipt = await triggerGuardianEscalation({
            subject,
            topic,
            grade,
            board,
            surfaceLabel,
          });
          setQuickDoubts((prev) =>
            prev.map((q) => {
              if (q.id !== itemId) return q;
              const cleanedMsgs = (q.messages || [])
                .filter((m) => m.id !== aiTurnId)
                .map((m, idx, arr) =>
                  idx === arr.length - 1 && m.sender === 'student'
                    ? {
                        ...m,
                        text: '[Message blocked by Safety Policy — Not accepted or answered by AI]',
                        isBlockedViolation: true,
                        guardianReport: receipt,
                      }
                    : m
                );
              return {
                ...q,
                status: 'blocked',
                blockedViolation: true,
                guardianReport: receipt,
                messages: cleanedMsgs,
              };
            })
          );
          return;
        }

        const errText = errJson?.error || `Server returned status ${response.status}`;
        setQuickDoubts((prev) =>
          prev.map((q) =>
            q.id === itemId
              ? {
                  ...q,
                  status: 'error',
                  errorMessage: errText,
                  messages: (q.messages || []).filter((m) => m.id !== aiTurnId),
                }
              : q
          )
        );
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        const res = await fetch('/api/tutor/doubt-solve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: promptText,
            history,
            subject,
            topic: topic || '',
            student_grade: grade,
            board,
            medium,
            imageBase64,
            imageMimeType,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to resolve doubt');
        }
        const solText = data.solution || '';
        setQuickDoubts((prev) =>
          prev.map((q) => {
            if (q.id !== itemId) return q;
            return {
              ...q,
              answer: solText,
              status: 'resolved',
              isWellnessNotice: Boolean(data.isWellnessNotice),
              messages: (q.messages || []).map((m) =>
                m.id === aiTurnId
                  ? { ...m, text: solText, isWellnessNotice: Boolean(data.isWellnessNotice) }
                  : m
              ),
            };
          })
        );
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let streamError: string | null = null;
      let isWellness = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith('data:')) continue;
          const payloadStr = line.slice(5).trim();
          if (!payloadStr) continue;

          try {
            const payload = JSON.parse(payloadStr);
            if (payload.isWellnessNotice) isWellness = true;
            if (payload.error) {
              streamError = payload.error;
              break;
            }
            if (payload.text) {
              accumulated += payload.text;
              setQuickDoubts((prev) =>
                prev.map((q) => {
                  if (q.id !== itemId) return q;
                  return {
                    ...q,
                    answer: accumulated,
                    isWellnessNotice: isWellness,
                    messages: (q.messages || []).map((m) =>
                      m.id === aiTurnId ? { ...m, text: accumulated, isWellnessNotice: isWellness } : m
                    ),
                  };
                })
              );
            }
          } catch {
            // Ignore malformed SSE line
          }
        }
        if (streamError) break;
      }

      if (streamError) {
        setQuickDoubts((prev) =>
          prev.map((q) =>
            q.id === itemId
              ? {
                  ...q,
                  status: 'error',
                  answer: accumulated || q.answer,
                  errorMessage: streamError || 'Stream error',
                  messages: accumulated
                    ? q.messages
                    : (q.messages || []).filter((m) => m.id !== aiTurnId),
                }
              : q
          )
        );
      } else {
        const finalText =
          accumulated ||
          '### Resolution\nResolved! Feel free to ask a follow-up question below.\n\n### Further Learning\n- Ask for a practice problem or another worked example on this topic.';
        setQuickDoubts((prev) =>
          prev.map((q) => {
            if (q.id !== itemId) return q;
            return {
              ...q,
              answer: finalText,
              status: 'resolved',
              isWellnessNotice: isWellness,
              messages: (q.messages || []).map((m) =>
                m.id === aiTurnId ? { ...m, text: finalText, isWellnessNotice: isWellness } : m
              ),
            };
          })
        );
      }
    } catch (err: any) {
      setQuickDoubts((prev) =>
        prev.map((q) =>
          q.id === itemId
            ? {
                ...q,
                status: 'error',
                errorMessage: err?.message || 'Unable to connect to the live AI service.',
                messages: (q.messages || []).filter((m) => m.id !== aiTurnId),
              }
            : q
        )
      );
    }
  };

  // Student asks Quick Doubts AI directly — Real-time LLM SSE streaming, NEVER submitted to any teacher
  const askQuickDoubtAI = async (
    question: string,
    subject: string,
    options?: {
      topic?: string;
      gradeLevel?: number | string;
      board?: string;
      medium?: string;
      imageBase64?: string;
      imageMimeType?: string;
      imagePreview?: string;
      surfaceLabel?: string;
    }
  ): Promise<string | undefined> => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return undefined;

    const itemId = `qd-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const resolvedGrade = options?.gradeLevel ?? currentUser?.grade_level ?? 8;
    const resolvedBoard = options?.board || currentUser?.education_board || currentBoard || 'CBSE';
    const resolvedMedium = options?.medium || globalLanguage || 'en';
    const resolvedTopic = options?.topic?.trim() || undefined;
    const resolvedSubject = subject || 'General Science';

    // Guardrail #1: Zero tolerance for foul language — NEVER reply/accept/invoke LLM; capture screenshot & alert guardian on WhatsApp + Email
    if (detectFoulLanguage(trimmedQuestion).isFoul) {
      const receipt = await triggerGuardianEscalation({
        subject: resolvedSubject,
        topic: resolvedTopic,
        grade: resolvedGrade,
        board: resolvedBoard,
        surfaceLabel: options?.surfaceLabel,
      });

      const blockedTurn: QuickDoubtChatTurn = {
        id: `turn-blk-${Date.now()}`,
        sender: 'student',
        text: '[Blocked by Conduct Guardrail — Foul language is never accepted or answered by the AI Assistant]',
        timestamp: nowTime,
        isBlockedViolation: true,
        guardianReport: receipt,
      };

      const blockedItem: QuickDoubtItem = {
        id: itemId,
        subject: resolvedSubject,
        topic: resolvedTopic,
        question: '[Blocked by Conduct Guardrail — Reported to Guardian]',
        answer: '',
        status: 'blocked',
        createdAt: nowTime,
        gradeLevel: resolvedGrade,
        board: resolvedBoard,
        language: resolvedMedium,
        blockedViolation: true,
        guardianReport: receipt,
        messages: [blockedTurn],
      };

      setQuickDoubts((prev) => [blockedItem, ...prev]);
      return itemId;
    }

    const stuTurnId = `turn-stu-${Date.now()}`;
    const aiTurnId = `turn-ai-${Date.now() + 1}`;

    const initialMessages: QuickDoubtChatTurn[] = [
      {
        id: stuTurnId,
        sender: 'student',
        text: trimmedQuestion,
        timestamp: nowTime,
        imagePreview: options?.imagePreview,
      },
      {
        id: aiTurnId,
        sender: 'ai',
        text: '',
        timestamp: nowTime,
      },
    ];

    const newItem: QuickDoubtItem = {
      id: itemId,
      subject: resolvedSubject,
      topic: resolvedTopic,
      question: trimmedQuestion,
      answer: '',
      status: 'streaming',
      createdAt: nowTime,
      gradeLevel: resolvedGrade,
      board: resolvedBoard,
      language: resolvedMedium,
      imagePreview: options?.imagePreview,
      messages: initialMessages,
    };

    setQuickDoubts((prev) => [newItem, ...prev]);

    await streamQuickDoubtTurn({
      itemId,
      aiTurnId,
      promptText: trimmedQuestion,
      history: [],
      subject: resolvedSubject,
      topic: resolvedTopic,
      grade: resolvedGrade,
      board: resolvedBoard,
      medium: resolvedMedium,
      imageBase64: options?.imageBase64,
      imageMimeType: options?.imageMimeType,
      surfaceLabel: options?.surfaceLabel,
    });

    return itemId;
  };

  // Student continues interactive chat inside an existing Quick Doubts AI thread
  const continueQuickDoubtChat = async (
    doubtId: string,
    followUpText: string,
    options?: {
      imageBase64?: string;
      imageMimeType?: string;
      imagePreview?: string;
      surfaceLabel?: string;
    }
  ) => {
    const trimmed = followUpText.trim();
    if (!trimmed) return;

    const target = quickDoubts.find((q) => q.id === doubtId);
    if (!target) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const resolvedGrade = target.gradeLevel ?? currentUser?.grade_level ?? 8;
    const resolvedBoard = target.board || currentUser?.education_board || currentBoard || 'CBSE';
    const resolvedMedium = target.language || globalLanguage || 'en';

    const existingMessages: QuickDoubtChatTurn[] =
      target.messages && target.messages.length > 0
        ? target.messages
        : [
            {
              id: `turn-init-stu-${target.id}`,
              sender: 'student',
              text: target.question,
              timestamp: target.createdAt,
              imagePreview: target.imagePreview,
            },
            ...(target.answer
              ? [
                  {
                    id: `turn-init-ai-${target.id}`,
                    sender: 'ai' as const,
                    text: target.answer,
                    timestamp: target.createdAt,
                  },
                ]
              : []),
          ];

    // Guardrail #1: Zero tolerance for foul language — never reply/accept; capture screenshot & alert guardian on WhatsApp + Email
    if (detectFoulLanguage(trimmed).isFoul) {
      const receipt = await triggerGuardianEscalation({
        subject: target.subject,
        topic: target.topic,
        grade: resolvedGrade,
        board: resolvedBoard,
        surfaceLabel: options?.surfaceLabel,
      });

      const blockedTurn: QuickDoubtChatTurn = {
        id: `turn-blk-${Date.now()}`,
        sender: 'student',
        text: '[Blocked by Conduct Guardrail — Foul language is never accepted or answered by the AI Assistant]',
        timestamp: nowTime,
        isBlockedViolation: true,
        guardianReport: receipt,
      };

      setQuickDoubts((prev) =>
        prev.map((q) =>
          q.id === doubtId
            ? {
                ...q,
                blockedViolation: true,
                guardianReport: receipt,
                messages: [...existingMessages, blockedTurn],
              }
            : q
        )
      );
      return;
    }

    const stuTurnId = `turn-stu-${Date.now()}`;
    const aiTurnId = `turn-ai-${Date.now() + 1}`;

    const historyForLLM = existingMessages
      .filter((m) => !m.isBlockedViolation && m.text.trim())
      .map((m) => ({ sender: m.sender, text: m.text }));

    const nextMessages: QuickDoubtChatTurn[] = [
      ...existingMessages,
      {
        id: stuTurnId,
        sender: 'student',
        text: trimmed,
        timestamp: nowTime,
        imagePreview: options?.imagePreview,
      },
      {
        id: aiTurnId,
        sender: 'ai',
        text: '',
        timestamp: nowTime,
      },
    ];

    setQuickDoubts((prev) =>
      prev.map((q) =>
        q.id === doubtId
          ? {
              ...q,
              status: 'streaming',
              errorMessage: undefined,
              messages: nextMessages,
            }
          : q
      )
    );

    await streamQuickDoubtTurn({
      itemId: doubtId,
      aiTurnId,
      promptText: trimmed,
      history: historyForLLM,
      subject: target.subject,
      topic: target.topic,
      grade: resolvedGrade,
      board: resolvedBoard,
      medium: resolvedMedium,
      imageBase64: options?.imageBase64,
      imageMimeType: options?.imageMimeType,
      surfaceLabel: options?.surfaceLabel,
    });
  };

  const deleteQuickDoubt = (id: string) => {
    setQuickDoubts((prev) => prev.filter((q) => q.id !== id));
  };

  const clearQuickDoubts = () => {
    setQuickDoubts([]);
  };

  // Student adds a quick doubt with topic context
  const addDoubt = async (question: string, subject: string, topic?: string) => {
    const newDoubt: StudentDoubt = {
      id: `dbt-${Date.now()}`,
      studentName: currentUser?.name || 'Sarah Connor',
      subject: topic ? `${subject} (${topic})` : subject,
      question,
      createdAt: 'Just now',
      status: 'pending',
    };
    setDoubts((prev) => [newDoubt, ...prev]);

    // Call backend doubt solver with full student context
    try {
      const res = await fetch('/api/tutor/doubt-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          subject,
          topic: topic || '',
          student_grade: currentUser?.grade_level || 8,
          board: currentUser?.education_board || currentBoard || 'CBSE',
          medium: globalLanguage || 'en',
        }),
      });
      const data = await res.json();
      if (data.solution) {
        setDoubts((prev) =>
          prev.map((d) => (d.id === newDoubt.id ? { ...d, solution: data.solution, status: 'resolved' } : d))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resolveDoubt = (id: string) => {
    setDoubts((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'resolved' } : d)));
  };

  // Teacher drafts lesson plan
  const draftLessonPlan = async (topic: string, grade: string, style: string): Promise<LessonPlan | null> => {
    setIsDraftingPlan(true);
    try {
      const res = await fetch('/api/lesson-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, grade, style }),
      });
      const data = await res.json();
      const newPlan: LessonPlan = {
        id: `lp-${Date.now()}`,
        topic: data.topic || topic,
        grade: data.grade || grade,
        style: data.style || style,
        duration: data.duration || '45 Minutes',
        learningObjectives: data.learningObjectives || ['Master core concepts', 'Practical lab synthesis'],
        warmUpActivity: data.warmUpActivity || { title: 'Introductory Inquiry', duration: '5 mins', prompt: 'Engaging real-world phenomenon.' },
        coreActivities: data.coreActivities || [],
        readingMaterial: data.readingMaterial || 'Key curriculum text content...',
        assessmentCheckpoints: data.assessmentCheckpoints || [],
        homeworkChallenge: data.homeworkChallenge || 'Review concept flashcards.',
        createdAt: 'Just now',
      };
      setLessonPlans((prev) => [newPlan, ...prev]);
      addNotification(
        'Lesson Plan Generated',
        `AI generated complete lesson plan for "${topic}" (${grade}).`,
        'success',
        'teacher'
      );
      return newPlan;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setIsDraftingPlan(false);
    }
  };

  // Teacher drafts quiz
  const draftQuiz = async (prompt: string): Promise<Quiz | null> => {
    setIsDraftingQuiz(true);
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, count: 5 }),
      });
      const data = await res.json();
      const newQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        title: data.title || prompt.slice(0, 30),
        topic: data.topic || 'General Science',
        grade: '7th Grade',
        author: 'Ms. Elena Rostova',
        createdAt: 'Just now',
        assignedToClass: 'Class 7B - Science',
        attempts: 0,
        avgScore: 0,
        questions: data.questions || [],
      };
      setQuizzes((prev) => [newQuiz, ...prev]);
      addNotification(
        'Quiz Generated by AI',
        `Dynamic assessment "${newQuiz.title}" successfully created with ${newQuiz.questions.length} questions.`,
        'success',
        'teacher'
      );
      return newQuiz;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setIsDraftingQuiz(false);
    }
  };

  // Teacher publishes quiz to students (cross-panel event)
  const publishQuiz = (quiz: Quiz, targetClass: string = 'Class 7B - Science') => {
    const info: BroadcastedQuizInfo = {
      quiz,
      targetClass,
      broadcastAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeLimit: '15 Minutes',
      proctoringEnabled: true,
    };
    setActiveBroadcastQuiz(info);
    addNotification(
      'New Assessment Published!',
      `Teacher published "${quiz.title}" for ${targetClass}. Accessible in Student Practice tab!`,
      'success',
      'teacher'
    );
    addNotification(
      '⚡ Live Assessment Broadcasted!',
      `Your instructor broadcasted "${quiz.title}" for ${targetClass}. Tap to start practice now!`,
      'info',
      'student'
    );
  };

  const dismissSuggestion = (id: string) => {
    setAiSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  // Admin proctoring anomaly triggers
  const triggerAnomaly = (feedId: string, anomalyType: AnomalyType) => {
    setProctorFeeds((prev) =>
      prev.map((f) => {
        if (f.id === feedId) {
          const isCleared = anomalyType === 'Clear';
          return {
            ...f,
            status: anomalyType,
            anomalyConfidence: isCleared ? 10 : 92,
            flagsCount: isCleared ? f.flagsCount : f.flagsCount + 1,
          };
        }
        return f;
      })
    );

    const targetFeed = proctorFeeds.find((f) => f.id === feedId);
    if (anomalyType !== 'Clear' && targetFeed) {
      const newLog: AnomalyLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        studentId: targetFeed.studentId,
        studentName: targetFeed.studentName,
        detectionType: anomalyType,
        status: 'Active',
        severity: anomalyType === 'Multiple Faces Detected' ? 'high' : 'medium',
        feedThumbnailSeed: targetFeed.avatarSeed,
      };
      setAnomalyLogs((prev) => [newLog, ...prev]);

      // Add high-priority cross-panel alert
      addNotification(
        `🚨 Proctoring Anomaly Flagged!`,
        `${anomalyType} detected on ${targetFeed.studentName}. High-priority alert sent to Admin & Teacher!`,
        'alert',
        'admin'
      );
    }
  };

  const resolveAnomaly = (logId: string) => {
    setAnomalyLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, status: 'Reviewed' } : l))
    );
  };

  // Issue digital verified certificate
  const issueCertificate = (studentName: string, courseTitle: string, score: number): DigitalCertificate => {
    const certNum = `EDU-AI-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const hash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newCert: DigitalCertificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNum,
      studentName,
      courseTitle,
      gradeLevel: 'Grade 8 Mastery',
      issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      instructorName: 'PivotIQ Academic Board',
      verificationHash: hash,
      status: 'Verified',
      skillsAcquired: [
        `${courseTitle} Core Mastery`,
        'Demonstrated Autonomous AI Assessment Readiness',
        'Applied Conceptual Synthesis',
      ],
      score,
    };

    setCertificates((prev) => [newCert, ...prev]);
    addNotification(
      'Verified AI Certificate Issued!',
      `Digital certificate ${certNum} generated and cryptographically verified for ${studentName}.`,
      'success',
      'admin'
    );
    return newCert;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        curriculumList,
        activeGrades,
        setActiveGrades,
        toggleGradeFilter,
        activeCategories,
        setActiveCategories,
        toggleCategoryFilter,
        teacherSubjectContext,
        setTeacherSubjectContext,
        studentAcademicGrowth,
        isCurriculumModalOpen,
        setIsCurriculumModalOpen,
        ecosystemOverviewMode,
        setEcosystemOverviewMode,
        subjectsDB,
        topicsDB,
        isCurriculumSyncing,
        fetchCurriculum,
        createSubject,
        updateSubject,
        deleteSubject,
        createTopic,
        updateTopic,
        deleteTopic,
        isAuthenticated,
        currentUser,
        login,
        logout,
        isProfileOpen,
        setIsProfileOpen,
        updateCurrentUser,
        usersList,
        addUser,
        updateUser,
        deleteUser,
        currentRole,
        setCurrentRole,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        globalSearch,
        setGlobalSearch,
        studentNav,
        setStudentNav,
        adminNav,
        setAdminNav,
        chatMessages,
        isAiTyping,
        sendTutorMessage,
        chapterProgress,
        setChapterProgress,
        doubts,
        addDoubt,
        resolveDoubt,
        quickDoubts,
        askQuickDoubtAI,
        continueQuickDoubtChat,
        deleteQuickDoubt,
        clearQuickDoubts,
        lessonPlans,
        quizzes,
        setQuizzes,
        recordQuizSubmission,
        completeCurriculumUnit,
        syncStudentProgressAcrossPanels,
        aiSuggestions,
        isDraftingPlan,
        isDraftingQuiz,
        draftLessonPlan,
        draftQuiz,
        activeBroadcastQuiz,
        setActiveBroadcastQuiz,
        publishQuiz,
        dismissSuggestion,
        proctorFeeds,
        anomalyLogs,
        localWebcamActive,
        setLocalWebcamActive,
        triggerAnomaly,
        resolveAnomaly,
        studentsList,
        setStudentsList,
        teachersList,
        certificates,
        issueCertificate,
        sensitivity,
        setSensitivity,
        notifications,
        removeNotification,
        addNotification,
        // Google Maps & Schools
        schools,
        fetchSchools,
        registerSchool,
        // Meetings
        meetingInvites,
        activeStudentMeeting,
        createMeetingInvite,
        dismissStudentMeetingAlert,
        // Community
        communityPosts,
        forumStudyGroups,
        forumResources,
        forumPoints,
        peerAnswersThisWeek,
        liveSessionRsvp,
        toggleLiveSessionRsvp,
        addCommunityPost,
        addCommunityComment,
        upvoteCommunityPost,
        upvoteCommunityComment,
        acceptCommunityComment,
        flagCommunityPost,
        resolveFlaggedCommunityPost,
        verifyCommunityPost,
        joinOrLeaveStudyGroup,
        createStudyGroup,
        addStudyGroupMessage,
        addForumResource,
        upvoteForumResource,
        // Subscription
        subscriptionState,
        updateSubscription,
        // Agile Study Planner
        dailyTasks,
        setDailyTasks,
        updateStudyTask,
        addStudyTask,
        deleteStudyTask,
        weeklySprints,
        masterChapters,
        generateStudyPlan,
        exportStudyPlanSpreadsheet,
        // Localization & Board
        globalLanguage,
        setGlobalLanguage,
        currentBoard,
        setCurrentBoard,
        signup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
