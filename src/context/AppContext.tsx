import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
export { useTheme } from './ThemeContext';
import {
  UserRole,
  AppUser,
  ChatMessage,
  StudentDoubt,
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
  DailyStudyTask,
  WeeklySprintAllocation,
  MasterChapterItem,
  SubscriptionState,
} from '../types';
import {
  COMPREHENSIVE_CURRICULUM_6_12,
  SAMPLE_STUDENT_ACADEMIC_GROWTH,
} from '../data/curriculumData';

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
  createSubject: (subject: { name: string; grade_level: number; category?: any; code?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => Promise<DBSubject | null>;
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
  addCommunityPost: (data: any) => Promise<{ success: boolean; error?: string }>;
  addCommunityComment: (postId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  upvoteCommunityPost: (postId: string) => Promise<void>;
  verifyCommunityPost: (postId: string, solution: string) => Promise<void>;

  // Subscription & 7-Day Free Trial
  subscriptionState: SubscriptionState;
  updateSubscription: (updates: Partial<SubscriptionState>) => void;

  // Agile Study Planner
  dailyTasks: DailyStudyTask[];
  setDailyTasks: React.Dispatch<React.SetStateAction<DailyStudyTask[]>>;
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

  // Teacher State
  lessonPlans: LessonPlan[];
  quizzes: Quiz[];
  aiSuggestions: AiSuggestion[];
  isDraftingPlan: boolean;
  isDraftingQuiz: boolean;
  draftLessonPlan: (topic: string, grade: string, style: string) => Promise<LessonPlan | null>;
  draftQuiz: (prompt: string) => Promise<Quiz | null>;
  publishQuiz: (quiz: Quiz) => void;
  dismissSuggestion: (id: string) => void;

  // Admin & Proctoring State
  proctorFeeds: ProctorFeed[];
  anomalyLogs: AnomalyLog[];
  localWebcamActive: boolean;
  setLocalWebcamActive: (val: boolean) => void;
  triggerAnomaly: (feedId: string, anomalyType: AnomalyType) => void;
  resolveAnomaly: (logId: string) => void;
  studentsList: StudentProfile[];
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

  // Curriculum & Grades 6-12 Global Context State
  const [curriculumList, setCurriculumList] = useState<CurriculumItem[]>(COMPREHENSIVE_CURRICULUM_6_12);
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

  // Dynamic Subjects & Topics DB State synchronized in real-time
  const [subjectsDB, setSubjectsDB] = useState<DBSubject[]>([
    { id: 'subj-1', name: 'Physics', grade_level: 10, category: 'STEM', code: 'PHY-101', description: 'Classical Mechanics, Kinematics & Energy', status: 'ACTIVE', created_at: '2026-01-10' },
    { id: 'subj-2', name: 'Biology', grade_level: 9, category: 'STEM', code: 'BIO-201', description: 'Cellular Systems, Genetics & Photosynthesis', status: 'ACTIVE', created_at: '2026-01-10' },
    { id: 'subj-3', name: 'Mathematics', grade_level: 8, category: 'STEM', code: 'MTH-102', description: 'Algebraic Equations & Functions', status: 'ACTIVE', created_at: '2026-01-10' },
    { id: 'subj-4', name: 'Computer Science', grade_level: 11, category: 'STEM', code: 'CSC-301', description: 'Algorithms, Data Structures & Python', status: 'ACTIVE', created_at: '2026-01-10' },
    { id: 'subj-5', name: 'Chemistry', grade_level: 10, category: 'STEM', code: 'CHM-101', description: 'Atomic Theory & Chemical Reactivity', status: 'ACTIVE', created_at: '2026-01-12' },
    { id: 'subj-6', name: 'Earth & Space Science', grade_level: 6, category: 'STEM', code: 'SCI-601', description: 'Planetary Geology & Atmospheric Cycles', status: 'ACTIVE', created_at: '2026-01-12' },
    { id: 'subj-7', name: 'Environmental Science', grade_level: 11, category: 'STEM', code: 'ENV-301', description: 'Renewable Resources, Ecology & Climate Systems', status: 'ACTIVE', created_at: '2026-01-15' },
    { id: 'subj-8', name: 'English Literature & Rhetoric', grade_level: 10, category: 'Language Arts', code: 'ENG-201', description: 'Rhetorical Analysis & Classic World Prose', status: 'ACTIVE', created_at: '2026-01-15' },
    { id: 'subj-9', name: 'World History & Civilizations', grade_level: 7, category: 'Humanities', code: 'HIS-101', description: 'Global Dynasties & Cross-Cultural Networks', status: 'ACTIVE', created_at: '2026-01-15' },
    { id: 'subj-10', name: 'Artificial Intelligence', grade_level: 12, category: 'STEM', code: 'AI-401', description: 'Neural Networks, Vision & Machine Cognition', status: 'ACTIVE', created_at: '2026-01-18' },
    { id: 'subj-11', name: 'Robotics & Automation', grade_level: 11, category: 'STEM', code: 'ROB-301', description: 'Sensors, Actuators & Control Engineering', status: 'ACTIVE', created_at: '2026-01-20' },
  ]);

  const [topicsDB, setTopicsDB] = useState<DBTopic[]>([
    { id: 'top-1', subject_id: 'subj-1', title: "Newton's Laws of Motion", description: 'Inertia, F=ma, Action & Reaction pairs', status: 'ACTIVE', created_at: '2026-01-10' },
    { id: 'top-2', subject_id: 'subj-1', title: 'Kinematics & Velocity Vectors', description: 'Displacement, velocity, and projectile motion', status: 'ACTIVE', created_at: '2026-01-10' },
    { id: 'top-3', subject_id: 'subj-1', title: 'Work, Energy & Momentum', description: 'Conservation of mechanical energy & collisions', status: 'ACTIVE', created_at: '2026-01-10' },
    { id: 'top-4', subject_id: 'subj-2', title: 'Photosynthesis & Solar Conversion', description: 'Light reactions, Calvin cycle, ATP synthesis', status: 'ACTIVE', created_at: '2026-01-10' },
    { id: 'top-5', subject_id: 'subj-2', title: 'Cellular Organelles & Membranes', description: 'Chloroplasts, mitochondria, transport mechanisms', status: 'ACTIVE', created_at: '2026-01-10' },
    { id: 'top-6', subject_id: 'subj-3', title: 'Quadratic Functions & Parabolas', description: 'Factoring, vertex form, quadratic formula', status: 'ACTIVE', created_at: '2026-01-10' },
    { id: 'top-7', subject_id: 'subj-3', title: 'Linear Equations & Graphing', description: 'Slope-intercept, point-slope, systems of equations', status: 'ACTIVE', created_at: '2026-01-10' },
    { id: 'top-8', subject_id: 'subj-7', title: 'Renewable Energy Systems', description: 'Solar photovoltaic, wind turbines, grid storage', status: 'ACTIVE', created_at: '2026-01-15' },
    { id: 'top-9', subject_id: 'subj-11', title: 'Robotics Kinematics & Automation', description: 'Inverse kinematics, motor drivers, PID loops', status: 'ACTIVE', created_at: '2026-01-20' },
    { id: 'top-10', subject_id: 'subj-10', title: 'Large Language Models & Transformers', description: 'Self-attention mechanisms and encoder-decoder stacks', status: 'ACTIVE', created_at: '2026-01-20' },
  ]);

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
  const createSubject = async (newSubj: { name: string; grade_level: number; category?: any; code?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
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

  // Student-Teacher Community Doubt Forum State with Zero-Tolerance Moderation
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: 'post-1',
      author_id: 'user-stu-1',
      author_name: 'Sarah Connor',
      author_role: 'student',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      author_points: 1450,
      title: 'How to find the derivative of ln(x) using the limit definition?',
      content: "I'm struggling with the algebraic simplification when evaluating lim_{h->0} [ln(x+h) - ln(x)] / h. Specifically, how does the e base property transform the exponent?",
      subject: 'Mathematics',
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
        teacher_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
        solution: 'Use logarithm quotient rule: ln(x+h) - ln(x) = ln((x+h)/x) = ln(1 + h/x). Then rewrite the limit as (1/x) * lim_{t->0} [ln(1+t)/t] where t = h/x. Since lim_{t->0} ln(1+t)/t = 1, the derivative is exactly 1/x.',
        verified_at: '1 hour ago',
      },
      comments: [
        {
          id: 'comm-1',
          author_id: 'user-stu-3',
          author_name: 'Liam Chen',
          author_role: 'student',
          content: 'That makes total sense! The change of variable t = h/x was the key step.',
          created_at: '45 mins ago',
          upvotes: 4,
        },
      ],
      status: 'ACTIVE',
    },
    {
      id: 'post-2',
      author_id: 'user-stu-2',
      author_name: 'Alex Rivera',
      author_role: 'student',
      author_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces',
      author_points: 620,
      title: 'Can heat be converted completely into mechanical work in a cyclic process?',
      content: 'My textbook states that 100% heat-to-work conversion is impossible for any cyclic thermodynamic engine, but why can electric heaters achieve near 100% work-to-heat conversion?',
      subject: 'Physics',
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
        solution: "This is Kelvin-Planck's statement of the Second Law of Thermodynamics! Work is ordered energy, while heat is disordered thermal motion. Degrading order into disorder (work to heat) is thermodynamically favored (entropy increases), but gathering scattered molecular kinetic energy back into macroscopic ordered work without leaving an entropy footprint in a cold reservoir is impossible.",
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
      title: 'Difference between BFS and DFS traversal in graph algorithms?',
      content: 'Looking for a clear, intuitive visual explanation of when to use Breadth-First Search vs Depth-First Search in tree/graph shortest path search.',
      subject: 'Computer Science',
      grade_level: 11,
      topic: 'Graph Data Structures',
      tags: ['ComputerScience', 'DataStructures', 'Algorithms'],
      created_at: '6 hours ago',
      upvotes: 34,
      views_count: 110,
      comments_count: 0,
      is_verified: false,
      comments: [],
      status: 'ACTIVE',
    },
  ]);

  const addCommunityPost = async (postData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'ACCOUNT_SUSPENDED_POLICY_VIOLATION') {
          // Zero tolerance violation triggered: lock user out
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
        addNotification(
          'Doubt Posted to Community',
          `Your question "${data.post.title.slice(0, 30)}..." has been published to peers & teachers.`,
          'success',
          'student'
        );
        return { success: true };
      }
    } catch (e) {
      console.warn('Network issue creating community post', e);
    }
    return { success: false, error: 'Failed to connect to moderation server' };
  };

  const addCommunityComment = async (postId: string, content: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_id: currentUser?.id || 'user-stu-2',
          author_name: currentUser?.name || 'Alex Rivera',
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
        return { success: true };
      }
    } catch (e) {
      console.warn('Network comment error', e);
    }
    return { success: false, error: 'Network error' };
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

  const verifyCommunityPost = async (postId: string, solution: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              is_verified: true,
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

  // Agile Study Planner State
  const [dailyTasks, setDailyTasks] = useState<DailyStudyTask[]>([
    { id: 'dt-1', day: 1, date: '2026-10-12', subject: 'Algebra I', topic: 'Lesson 3 Review: Linear Inequalities', duration_hrs: 1.5, is_core: true, status: 'Completed', color: '#4F46E5' },
    { id: 'dt-3', day: 3, date: '2026-10-14', subject: 'Physics', topic: 'Lab Prep: Vector Dynamics & Net Force', duration_hrs: 2, is_core: false, status: 'In Progress', color: '#0284C7' },
    { id: 'dt-4', day: 4, date: '2026-10-15', subject: 'History', topic: 'Reading: Global Dynasties (Ch 4)', duration_hrs: 1.5, is_core: false, status: 'In Progress', color: '#0EA5E9' },
    { id: 'dt-5', day: 5, date: '2026-10-16', subject: 'History', topic: 'Reading: Primary Sources & Analysis', duration_hrs: 1.5, is_core: false, status: 'Completed', color: '#10B981' },
    { id: 'dt-8', day: 8, date: '2026-10-19', subject: 'Algebra I', topic: 'Lesson 3 Review: Exponent Rules', duration_hrs: 1.5, is_core: true, status: 'Completed', color: '#4F46E5' },
    { id: 'dt-10a', day: 10, date: '2026-10-21', subject: 'Physics', topic: 'Lab Prep: Friction Coefficients', duration_hrs: 1.5, is_core: false, status: 'In Progress', color: '#0284C7' },
    { id: 'dt-10b', day: 10, date: '2026-10-21', subject: 'History', topic: 'Reading: Economic Networks', duration_hrs: 1, is_core: false, status: 'In Progress', color: '#0EA5E9' },
    { id: 'dt-12', day: 12, date: '2026-10-23', subject: 'History', topic: 'Reading: Maritime Trade Maps', duration_hrs: 1.5, is_core: false, status: 'To Do', color: '#0EA5E9' },
    { id: 'dt-15', day: 15, date: '2026-10-26', subject: 'Algebra I', topic: 'Lesson 3 Review: Factoring Trinomials', duration_hrs: 1.5, is_core: true, status: 'To Do', color: '#4F46E5' },
    { id: 'dt-17', day: 17, date: '2026-10-28', subject: 'Physics', topic: 'Lab Prep: Momentum Collisions', duration_hrs: 2, is_core: false, status: 'To Do', color: '#0284C7' },
    { id: 'dt-18', day: 18, date: '2026-10-29', subject: 'History', topic: 'Reading: Post-Classical Societies', duration_hrs: 1.5, is_core: false, status: 'To Do', color: '#0EA5E9' },
    { id: 'dt-22', day: 22, date: '2026-11-02', subject: 'Algebra I', topic: 'Lesson 3 Review: Quadratic Formula Intro', duration_hrs: 1.5, is_core: true, status: 'To Do', color: '#4F46E5' },
    { id: 'dt-23', day: 23, date: '2026-11-03', subject: 'Algebra I', topic: 'Lesson 3 Review: Parabola Symmetry', duration_hrs: 1.5, is_core: true, status: 'To Do', color: '#4F46E5' },
    { id: 'dt-24', day: 24, date: '2026-11-04', subject: 'Algebra I', topic: 'Lesson 3 Review: Vertex Form Drills', duration_hrs: 1.5, is_core: true, status: 'To Do', color: '#4F46E5' },
    { id: 'dt-29', day: 29, date: '2026-11-09', subject: 'History', topic: 'Reading: Diplomatic Treaties', duration_hrs: 1.5, is_core: false, status: 'To Do', color: '#0EA5E9' },
    { id: 'dt-30', day: 30, date: '2026-11-10', subject: 'History', topic: 'Reading: Cultural Diffusion', duration_hrs: 1.5, is_core: false, status: 'To Do', color: '#0EA5E9' },
    { id: 'dt-31', day: 31, date: '2026-11-11', subject: 'History', topic: 'Reading: Final Chapter Synthesis', duration_hrs: 1.5, is_core: false, status: 'To Do', color: '#0EA5E9' },
  ]);

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
    link.setAttribute('download', `EducateAI_Agile_Study_Planner_${currentUser?.name?.replace(/\s+/g, '_') || 'Student'}.csv`);
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
    const id = `user-${Date.now()}`;
    const user: AppUser = {
      ...newUser,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsersList((prev) => [user, ...prev]);
    addNotification('User Created', `Successfully created user account for ${user.name} (${user.role}).`, 'success', 'admin');
  };

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
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

  // Doubts
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
      topic: 'Plant Cells',
      grade: '7th Grade',
      author: 'Ms. Elena Rostova',
      createdAt: 'Today, 09:30 AM',
      assignedToClass: 'Class 7B - Science',
      attempts: 24,
      avgScore: 84,
      questions: [
        {
          id: 'q1',
          question: 'Which organelle is exclusively found in plant cells and carries out photosynthesis?',
          options: ['Mitochondria', 'Chloroplast', 'Centriole', 'Ribosome'],
          answerIndex: 1,
          explanation: 'Chloroplasts house chlorophyll pigments which absorb light to convert CO₂ and water into glucose.',
        },
        {
          id: 'q2',
          question: 'What rigid outer layer protects plant cells from osmotic bursting?',
          options: ['Cell Membrane', 'Cellulose Cell Wall', 'Nuclear Envelope', 'Lipid Bilayer'],
          answerIndex: 1,
          explanation: 'The cell wall is made of rigid cellulose fibers providing structural turgor support.',
        },
        {
          id: 'q3',
          question: 'What gas is consumed during the light-independent reactions (Calvin Cycle)?',
          options: ['Carbon Dioxide (CO₂)', 'Oxygen (O₂)', 'Nitrogen (N₂)', 'Hydrogen (H₂)'],
          answerIndex: 0,
          explanation: 'Carbon dioxide is fixed into 3-carbon phosphoglycerate molecules by the enzyme RuBisCO.',
        },
      ],
    },
    {
      id: 'quiz-2',
      title: "Newton's Three Laws of Motion - Quick Check",
      topic: "Newton's Laws",
      grade: '8th Grade',
      author: 'Mr. David Vance',
      createdAt: 'Yesterday',
      assignedToClass: 'Class 8A - Physics',
      attempts: 28,
      avgScore: 78,
      questions: [
        {
          id: 'q2-1',
          question: 'Which law explains why passengers jerk forward when a bus suddenly brakes?',
          options: ['1st Law (Inertia)', '2nd Law (F = ma)', '3rd Law (Action-Reaction)', 'Universal Gravitation'],
          answerIndex: 0,
          explanation: "Inertia keeps the passenger's body moving forward at the original velocity until stopped by an external force.",
        },
        {
          id: 'q2-2',
          question: 'If you push a wall with 50 N of force, the wall exerts what force back on you?',
          options: ['0 N', '25 N', '50 N in opposite direction', '100 N'],
          answerIndex: 2,
          explanation: 'By Newton\'s 3rd Law, every action has an equal magnitude and opposite direction reaction force.',
        },
      ],
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

  // Students roster
  const [studentsList] = useState<StudentProfile[]>([
    {
      id: 'stu-1',
      name: 'Sarah Connor',
      email: 'sarah.c@educateai.org',
      grade: '8th Grade',
      gpa: 3.85,
      attendance: 98,
      enrolledSubjects: ['Physics', 'Biology', 'Algebra', 'English Literature'],
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

  // Teachers roster
  const [teachersList] = useState<TeacherProfile[]>([
    {
      id: 'tch-1',
      name: 'Ms. Elena Rostova',
      email: 'elena.r@educateai.org',
      subject: 'Biology & Life Sciences',
      classes: ['Class 7B - Science', 'Class 8C - Advanced Biology'],
      activeStudentsCount: 58,
      lessonPlansCount: 24,
    },
    {
      id: 'tch-2',
      name: 'Dr. David Vance',
      email: 'david.v@educateai.org',
      subject: 'Physics & STEM',
      classes: ['Class 8A - Physics', 'Class 9B - Mechanics'],
      activeStudentsCount: 62,
      lessonPlansCount: 31,
    },
    {
      id: 'tch-3',
      name: 'Mrs. Maria Santos',
      email: 'maria.s@educateai.org',
      subject: 'Pure & Applied Mathematics',
      classes: ['Class 7A - Pre-Algebra', 'Class 8A - Geometry'],
      activeStudentsCount: 54,
      lessonPlansCount: 19,
    },
  ]);

  // Digital Certificates
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([
    {
      id: 'cert-1',
      certificateNumber: 'EDU-AI-2026-98124',
      studentName: 'Sarah Connor',
      courseTitle: "Classical Mechanics & Newton's Laws",
      gradeLevel: 'Grade 8 Honors',
      issueDate: 'October 8, 2026',
      instructorName: 'Dr. David Vance & Educate AI Agent',
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
          history: chatMessages.map((m) => ({ role: m.sender === 'student' ? 'user' : 'model', content: m.text })),
          subject: 'Physics',
          topic: "Newton's Laws of Motion",
        }),
      });

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: `AI Tutor: ${data.reply}`,
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

    // Send notification
    addNotification(
      'New Student Doubt',
      `${currentUser?.name || 'Student'} raised a doubt in ${subject}${topic ? ` • ${topic}` : ''}: "${question.slice(0, 40)}..."`,
      'info',
      'student'
    );

    // Call backend doubt solver with topic context
    try {
      const res = await fetch('/api/tutor/doubt-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, subject: topic ? `${subject} - ${topic}` : subject }),
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
  const publishQuiz = (quiz: Quiz) => {
    addNotification(
      'New Assessment Published!',
      `Teacher published "${quiz.title}" to student portal. Now accessible in Student Practice tab!`,
      'success',
      'teacher'
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
      instructorName: 'Educate AI Agent Academic Board',
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
        lessonPlans,
        quizzes,
        aiSuggestions,
        isDraftingPlan,
        isDraftingQuiz,
        draftLessonPlan,
        draftQuiz,
        publishQuiz,
        dismissSuggestion,
        proctorFeeds,
        anomalyLogs,
        localWebcamActive,
        setLocalWebcamActive,
        triggerAnomaly,
        resolveAnomaly,
        studentsList,
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
        addCommunityPost,
        addCommunityComment,
        upvoteCommunityPost,
        verifyCommunityPost,
        // Subscription
        subscriptionState,
        updateSubscription,
        // Agile Study Planner
        dailyTasks,
        setDailyTasks,
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
