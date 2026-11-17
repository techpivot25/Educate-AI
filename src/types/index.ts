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
  chemistryProgress?: number;
  historyProgress?: number;
  englishProgress?: number;
  attendance?: number;
  gpa?: number;

  // Teacher Profile Additions
  department?: string;
  assignedSubjects?: string[];
  assignedCohorts?: string[];
  createdLessonPlansCount?: number;
  activeStudentsCount?: number;
  cabin?: string;

  // Admin Profile Additions
  permissionLevel?: 'Super Admin' | 'Proctor Manager' | 'Content Admin';
  activityLogs?: { id: string; timestamp: string; action: string }[];

  // Security, Flagging & Credential Sync Controls
  isFlagged?: boolean;
  flagReason?: string;
  flaggedAt?: string;
  credentialResetRequestedAt?: string;
  passwordUpdatedAt?: string;
  moduleAccessSuspended?: boolean;
}

export interface ProfileAuditEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  field: string;
  oldValue: string;
  newValue: string;
  actorRole: UserRole | 'system';
  actorName: string;
  timestamp: string;
  changeType: 'profile_edit' | 'status_control' | 'security_reset' | 'account_flag';
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
  assignedTo?: string;
  resolutionStatus?: 'Open' | 'Assigned' | 'Resolved' | 'Closed';
  createdAtMs?: number;
  resolvedAtMs?: number;
  responseTimeLabel?: string;
  adminNote?: string;
}

export interface GuardianEscalationReceipt {
  id: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  timestamp: string;
  whatsappDispatched: boolean;
  emailDispatched: boolean;
  whatsappUrl: string;
  emailUrl: string;
  screenshotDataUrl?: string;
  screenshotUrl?: string;
}

export interface QuickDoubtChatTurn {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  timestamp: string;
  imagePreview?: string;
  isBlockedViolation?: boolean;
  isWellnessNotice?: boolean;
  guardianReport?: GuardianEscalationReceipt;
}

export interface QuickDoubtItem {
  id: string;
  subject: string;
  topic?: string;
  question: string;
  answer: string;
  status: 'streaming' | 'resolved' | 'error' | 'blocked';
  createdAt: string;
  gradeLevel?: number | string;
  board?: string;
  language?: string;
  imagePreview?: string;
  errorMessage?: string;
  blockedViolation?: boolean;
  isWellnessNotice?: boolean;
  guardianReport?: GuardianEscalationReceipt;
  messages?: QuickDoubtChatTurn[];
  studentName?: string;
  assignedTo?: string;
  resolutionStatus?: 'Open' | 'Assigned' | 'Resolved' | 'Closed';
  adminResolutionNote?: string;
  createdAtMs?: number;
  resolvedAtMs?: number;
  responseTimeLabel?: string;
}

export interface QuizAttemptLog {
  id: string;
  studentId: string;
  studentName: string;
  quizId: string;
  quizTitle: string;
  topic: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timestamp: string;
  createdAtMs: number;
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
  overallProgress?: number;
  physicsProgress: number; // percentage
  biologyProgress: number;
  mathProgress: number;
  chemistryProgress?: number;
  historyProgress?: number;
  englishProgress?: number;
  riskScore: 'Low' | 'Medium' | 'High';
  activeProctorStatus: AnomalyType;
  status?: 'Active' | 'Inactive';
  isFlagged?: boolean;
  flagReason?: string;
  subscriptionTier?: string;
  accessSuspended?: boolean;
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

export interface CertificateDownloadLog {
  id: string;
  certificateId: string;
  certificateNumber: string;
  studentName: string;
  downloadedAt: string;
  format: string;
}

export interface CertAutoTriggerConfig {
  enabled: boolean;
  minScore: number;
  requireAdminApproval: boolean;
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
  status: 'Verified' | 'Revoked' | 'Pending Approval';
  skillsAcquired: string[];
  score: number;
  triggerSource?: 'Auto' | 'Manual';
  downloadCount?: number;
  downloadLogs?: CertificateDownloadLog[];
}

export interface CrossPanelNotification {
  id: string;
  sourceRole: UserRole | 'system';
  title: string;
  description: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'alert';
}

export type SubjectType = 'CORE' | 'REGIONAL_LANGUAGE' | 'ELECTIVE';

export interface BoardConfig {
  board_id: EducationBoard | string;
  name: string;
  shortLabel: string;
  boardCategory: 'NATIONAL' | 'STATE' | 'INTERNATIONAL';
  supportsOptionalRegionalLanguages?: boolean;
}

export interface BoardSubjectMapping {
  id: string;
  board_id: EducationBoard | 'ALL' | string;
  subject_id: string;
  subject_type: SubjectType;
  is_required: boolean;
  created_at: string;
}

export interface DBSubject {
  id: string;
  name: string;
  grade_level: number; // 6 to 12
  board?: EducationBoard | 'ALL';
  subject_type?: SubjectType;
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
  board?: EducationBoard | 'ALL';
  subject_type?: SubjectType;
  category: 'STEM' | 'Language Arts' | 'Humanities' | 'Arts & Electives';
  subjectName: string;
  code: string;
  description: string;
  sampleTopics: string[];
}

export type StudentNavTab =
  | 'dashboard'
  | 'pomodoro'
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
  | 'certificates'
  | 'subscription';

export type AdminNavTab =
  | 'dashboard'
  | 'users'
  | 'curriculum'
  | 'teachers'
  | 'students'
  | 'tasks-sync'
  | 'interactions'
  | 'billing'
  | 'subscription-plans'
  | 'ai-cost-monitor'
  | 'config'
  | 'certificates'
  | 'analytics';

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

export type ForumSpace =
  | 'subject-doubts'
  | 'assignment-exam'
  | 'unanswered'
  | 'study-groups'
  | 'resources';

export interface CommunityComment {
  id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  author_avatar?: string;
  author_badge?: string;
  content: string;
  created_at: string;
  upvotes: number;
  is_teacher_verified?: boolean;
  is_accepted?: boolean;
  is_flagged?: boolean;
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
  attempted_solution?: string;
  attachment_preview?: string;
  space?: 'subject-doubts' | 'assignment-exam';
  subject: string;
  chapter_unit?: string;
  grade_level: number;
  topic?: string;
  tags: string[];
  created_at: string;
  upvotes: number;
  views_count: number;
  comments_count: number;
  is_verified?: boolean;
  accepted_comment_id?: string;
  is_doubt_of_the_day?: boolean;
  is_high_priority?: boolean;
  is_flagged?: boolean;
  flag_reason?: string;
  verified_solution?: {
    teacher_name: string;
    teacher_avatar?: string;
    solution: string;
    verified_at: string;
  };
  comments: CommunityComment[];
  status: 'ACTIVE' | 'FLAGGED_BLOCKED';
}

export interface ForumStudyGroupMessage {
  id: string;
  author_name: string;
  author_role: UserRole;
  content: string;
  created_at: string;
}

export interface ForumStudyGroup {
  id: string;
  name: string;
  subject: string;
  chapter_unit: string;
  grade_level: number;
  availability: string;
  focus_goal: string;
  host_name: string;
  members: string[];
  max_members: number;
  next_session: string;
  messages: ForumStudyGroupMessage[];
}

export interface ForumResourceItem {
  id: string;
  title: string;
  resource_type: 'Notes' | 'Previous Paper' | 'Revision Material' | 'Recommended Video';
  subject: string;
  chapter_unit: string;
  grade_level: number;
  author_name: string;
  author_role: UserRole;
  description: string;
  url?: string;
  helpful_count: number;
  created_at: string;
}

export type StudyTaskStatus = 'To Do' | 'In Progress' | 'On Hold' | 'Completed' | 'Revision';

export type TaskSubmissionStatus =
  | 'Pending'
  | 'Submitted'
  | 'Under Review'
  | 'Graded'
  | 'Revision Required';

export type CustomTaskApprovalStatus =
  | 'Pending Approval'
  | 'Approved'
  | 'Modified'
  | 'Rejected';

export interface DailyStudyTask {
  id: string;
  day: number;
  date: string;
  study_time?: string; // e.g. '16:30' (24h HH:MM)
  subject: string;
  topic: string;
  duration_hrs: number;
  is_core: boolean; // e.g. Mathematics daily 1.5 hrs
  status: StudyTaskStatus;
  points?: number; // Story points / XP reward
  notes?: string;
  color: string;
  created_at?: string;
  status_updated_at?: string;
  // Task & Assignment Management (Module 2)
  studentName?: string;
  priority?: 'Normal' | 'High';
  submissionStatus?: TaskSubmissionStatus;
  submissionType?: 'Code' | 'Document' | 'Link' | 'Note';
  submissionTitle?: string;
  submissionContent?: string;
  submissionFileName?: string;
  submittedAt?: string;
  score?: number;
  maxScore?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  // Custom Tasks & Project Modules Approval (Module 5)
  isCustom?: boolean;
  customCategory?: 'Custom Task' | 'Side Project' | 'Self-Paced Milestone';
  approvalStatus?: CustomTaskApprovalStatus;
  adminReviewNote?: string;
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

export type SubscriptionPlanStatus = 'Active' | 'Discontinued';
export type BillingCadence = 'Monthly' | 'Quarterly' | 'Annually' | 'One-Time';
export type PlanCurrency = 'INR' | 'USD';

export type AiModelRoutingTier =
  | 'flash-lite'
  | 'flash-lite-hybrid'
  | 'hydrogen-standard'
  | 'hydrogen-vision'
  | 'pro-reasoning';

export type AiOveragePolicy =
  | 'prompt-upgrade-or-addon'
  | 'auto-downgrade-lite'
  | 'hard-cap-pause';

export interface SubscriptionPlan {
  id: string;
  name: string;
  subtitle: string;
  badge?: string;
  currency: PlanCurrency;
  basePrice: number;
  strikethroughPrice?: number;
  billingFrequency: BillingCadence;
  billingCycleLabel: string;
  gstApplicable: boolean;
  courseAccessLevel: string;
  usageQuotas: string;
  // AI Agent Token Quota & Cost Economics
  monthlyTokenQuota: number;
  aiModelTier: AiModelRoutingTier;
  overagePolicy: AiOveragePolicy;
  maxVisionDoubtsPerMonth?: number;
  contextCachingEnabled?: boolean;
  features: string[];
  status: SubscriptionPlanStatus;
  version: number;
  activeSubscribersCount: number;
  createdAt: string;
  effectiveStartDate: string;
  endDate?: string;
  discontinuedDate?: string;
  lastModifiedAt: string;
  lastModifiedByAdminId: string;
  grandfatherExistingSubscribers?: boolean;
}

export interface AiAddonPack {
  id: string;
  name: string;
  tokens: number;
  priceINR: number;
  badge?: string;
  approxDoubts: string;
  description: string;
}

export interface AiTokenUsageLog {
  id: string;
  studentId: string;
  studentName: string;
  surface: 'Quick Doubts AI' | 'Socratic AI Tutor';
  subject: string;
  model: string;
  modelTier: AiModelRoutingTier;
  promptTokens: number;
  outputTokens: number;
  cachedTokens: number;
  totalTokens: number;
  estimatedCostINR: number;
  paidFrom: 'monthly-quota' | 'addon-credits' | 'split';
  timestamp: string;
  createdAtMs: number;
}

export interface StudentAiQuotaRecord {
  studentId: string;
  studentName: string;
  studentEmail: string;
  planName: string;
  monthlyQuota: number;
  monthlyTokensUsed: number;
  addonCreditsRemaining: number;
  visionDoubtsUsed: number;
  maxVisionDoubtsPerMonth: number;
  estimatedMonthlyCogsINR: number;
  cycleResetDate: string;
  lastActiveAt: string;
}

export interface SubscriptionPlanAuditEntry {
  id: string;
  planId: string;
  planName: string;
  action: 'Created' | 'Edited' | 'Discontinued' | 'Reactivated';
  adminId: string;
  adminName: string;
  timestamp: string;
  summary: string;
  versionSnapshot?: number;
  integrityMode?: 'new-enrollments-only' | 'next-renewal-cycle';
}

export interface BillingTransaction {
  id: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  planId: string;
  planName: string;
  baseAmountINR: number;
  gstAmountINR: number;
  totalAmountINR: number;
  paymentMethod: 'Credit Card' | 'Debit Card' | 'PayPal' | 'UPI' | 'Net Banking' | 'Card' | 'Apple Pay';
  paymentStatus: 'Success' | 'Failed' | 'Pending';
  recurringMonthly: boolean;
  expiresAt: string;
  createdAt: string;
  note?: string;
}

export interface SubscriberRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  phone?: string;
  grade?: string;
  educationBoard?: string;
  city: string;
  state: string;
  planId: string;
  planName: string;
  subscribedDate: string; // YYYY-MM-DD
  expiresAt: string; // YYYY-MM-DD
  amountPaidINR: number;
  paymentMethod:
    | 'Credit Card'
    | 'Debit Card'
    | 'PayPal'
    | 'UPI'
    | 'Net Banking'
    | 'Offline / Invoice';
  recurringMonthly: boolean;
  status: 'Active' | 'Trial' | 'Past Due' | 'Suspended' | 'Expired';
  invoiceId?: string;
  notes?: string;
}

export interface SubscriptionState {
  tier: string;
  trialStartDate: string;
  trialEndDate: string;
  trialDaysLeft: number;
  isActive: boolean;
  moduleAccessEnabled?: boolean;
  billingStatus?: 'Active' | 'Past Due' | 'Suspended' | 'Trial';
  expiresAt?: string;
  paymentMethod?: {
    type: 'Credit Card' | 'Debit Card' | 'PayPal' | 'UPI' | 'Net Banking' | 'Card' | 'Apple Pay';
    detail: string;
  };
  autoRenew: boolean;
  recurringMonthly?: boolean;
  lastBilledAmountINR?: number;
  activePlanId?: string;
  grandfatheredPlanVersion?: number;
  lockedCyclePrice?: number;
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
