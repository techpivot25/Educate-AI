export type UserRole = 'student' | 'teacher' | 'admin';

export type EducationBoard =
  | 'CBSE'
  | 'ICSE'
  | 'IB'
  | 'IGCSE'
  | 'PSEB'
  | 'GSEB'
  | 'MSBSHSE'
  | 'KSEEB'
  | 'BSEAP/TOSS'
  | 'WBBSE'
  | 'Tamil Nadu State Board';

export type LanguageMedium =
  | 'en'
  | 'hi'
  | 'pa'
  | 'mr'
  | 'bn'
  | 'ta'
  | 'te'
  | 'gu'
  | 'kn'
  | 'ml';

export interface DBSchool {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  created_at: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;

  // Student Profile & Institution Additions
  grade?: string;
  grade_level?: number | string; // e.g. 6, 8, 10
  education_board?: string; // CBSE, PSEB, ICSE, MSBSHSE, etc.
  preferred_language?: string; // en, hi, pa, etc.
  school_id?: string;
  school_name?: string;
  school_address?: string;
  school_lat?: number;
  school_lng?: number;
  mobile_number?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;

  enrollmentDate?: string;
  enrolledCourses?: string[];
  overallProgress?: number;
  physicsProgress?: number;
  biologyProgress?: number;
  mathProgress?: number;
  attendance?: number;
  gpa?: number;

  // Teacher Profile Additions
  department?: string;
  assignedSubjects?: string[];
  assignedCohorts?: string[];
  createdLessonPlansCount?: number;
  activeStudentsCount?: number;

  // Admin Profile Additions
  permissionLevel?: 'Super Admin' | 'Proctor Manager' | 'Content Admin';
  activityLogs?: { id: string; timestamp: string; action: string }[];
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'student';
  text: string;
  timestamp: string;
  avatar?: string;
  mathFormula?: string;
  resolved?: boolean;
}

export interface StudentDoubt {
  id: string;
  studentName: string;
  subject: string;
  question: string;
  createdAt: string;
  status: 'pending' | 'resolved';
  solution?: string;
}

export interface LessonPlanActivity {
  name: string;
  duration: string;
  description: string;
  teacherGuide?: string;
}

export interface LessonPlan {
  id: string;
  topic: string;
  grade: string;
  style: string;
  duration: string;
  learningObjectives: string[];
  warmUpActivity: {
    title: string;
    duration: string;
    prompt: string;
  };
  coreActivities: LessonPlanActivity[];
  readingMaterial: string;
  assessmentCheckpoints: string[];
  homeworkChallenge: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  grade?: string;
  questions: QuizQuestion[];
  createdAt: string;
  author: string;
  assignedToClass?: string;
  attempts?: number;
  avgScore?: number;
}

export type AnomalyType = 'Clear' | 'Head Rotation' | 'Multiple Faces Detected' | 'Off-Screen Gaze' | 'Audio Spike';

export interface ProctorFeed {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  examName: string;
  status: AnomalyType;
  anomalyConfidence: number; // 0 - 100
  isLocalWebcam?: boolean;
  avatarSeed: number;
  lastActive: string;
  streamColor: string;
  flagsCount: number;
}

export interface AnomalyLog {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  detectionType: AnomalyType;
  status: 'Active' | 'Detected' | 'Reviewed' | 'Dismissed';
  severity: 'low' | 'medium' | 'high';
  feedThumbnailSeed: number;
  notes?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  grade: string;
  gpa: number;
  attendance: number; // percentage
  enrolledSubjects: string[];
  physicsProgress: number; // percentage
  biologyProgress: number;
  mathProgress: number;
  riskScore: 'Low' | 'Medium' | 'High';
  activeProctorStatus: AnomalyType;
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  subject: string;
  classes: string[];
  activeStudentsCount: number;
  lessonPlansCount: number;
}

export interface AiSuggestion {
  id: string;
  studentName: string;
  studentId: string;
  topic: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  recommendedAction: string;
  timestamp: string;
}

export interface DigitalCertificate {
  id: string;
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  gradeLevel: string;
  issueDate: string;
  instructorName: string;
  verificationHash: string;
  status: 'Verified' | 'Revoked';
  skillsAcquired: string[];
  score: number;
}

export interface CrossPanelNotification {
  id: string;
  sourceRole: UserRole | 'system';
  title: string;
  description: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'alert';
}

export interface DBSubject {
  id: string;
  name: string;
  grade_level: number; // 6 to 12
  category?: 'STEM' | 'Language Arts' | 'Humanities' | 'Arts & Electives';
  code?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface DBTopic {
  id: string;
  subject_id: string; // FK to DBSubject.id
  title: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface CurriculumItem {
  id: string;
  grade: number; // 6 to 12
  gradeLabel: string;
  category: 'STEM' | 'Language Arts' | 'Humanities' | 'Arts & Electives';
  subjectName: string;
  code: string;
  description: string;
  sampleTopics: string[];
}

export type StudentNavTab =
  | 'dashboard'
  | 'my-courses'
  | 'grades'
  | 'formulas-graphs'
  | 'ai-tutor'
  | 'resources'
  | 'community'
  | 'settings'
  | 'subjects'
  | 'practice'
  | 'progress'
  | 'certificates';

export interface MeetingInvite {
  id: string;
  host_id: string;
  host_name: string;
  title: string;
  meet_link: string;
  target_type: 'INDIVIDUAL' | 'COHORT' | 'ALL';
  target_ids: string[];
  scheduled_time: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  agenda?: string;
  duration_mins?: number;
  created_at: string;
  dispatched_emails?: string[];
}

export interface CommunityComment {
  id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  author_avatar?: string;
  content: string;
  created_at: string;
  upvotes: number;
  is_teacher_verified?: boolean;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  author_avatar?: string;
  author_points?: number;
  title: string;
  content: string;
  subject: string;
  grade_level: number;
  topic?: string;
  tags: string[];
  created_at: string;
  upvotes: number;
  views_count: number;
  comments_count: number;
  is_verified?: boolean;
  verified_solution?: {
    teacher_name: string;
    teacher_avatar?: string;
    solution: string;
    verified_at: string;
  };
  comments: CommunityComment[];
  status: 'ACTIVE' | 'FLAGGED_BLOCKED';
}

export type StudyTaskStatus = 'To Do' | 'In Progress' | 'On Hold' | 'Completed' | 'Revision';

export interface DailyStudyTask {
  id: string;
  day: number;
  date: string;
  subject: string;
  topic: string;
  duration_hrs: number;
  is_core: boolean; // e.g. Mathematics daily 1.5 hrs
  status: StudyTaskStatus;
  points?: number; // Story points / XP reward
  notes?: string;
  color: string;
}

export interface WeeklySprintAllocation {
  week: number;
  weekLabel: string;
  coreSubjectHours: number;
  rotatingSubjectHours: { [subject: string]: number };
  totalHours: number;
}

export interface MasterChapterItem {
  id: string;
  subject: string;
  chapterName: string;
  allocatedHours: number;
  targetStartDate: string;
  targetEndDate: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface SubscriptionState {
  tier: '7-Day Free Trial' | 'Student Pro' | 'Annual Mastery';
  trialStartDate: string;
  trialEndDate: string;
  trialDaysLeft: number;
  isActive: boolean;
  paymentMethod?: {
    type: 'UPI' | 'Card' | 'Apple Pay';
    detail: string;
  };
  autoRenew: boolean;
}

export interface StudentGradeGrowth {
  gradeLabel: string;
  gradeNumber: number;
  status: 'Completed' | 'Current' | 'Enrolled' | 'Upcoming';
  courses: {
    name: string;
    progress?: number;
    completed?: boolean;
    statusBadge?: string;
  }[];
}
