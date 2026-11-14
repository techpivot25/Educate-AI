# PivotIQ Student Portal — Functional Specification Document (FSD)

**Document Version:** 1.0  
**Scope:** Student Portal (`PivotIQ Student Hub`) Only  
**Platform Architecture:** React + TypeScript + Vite SPA with Express (`server.ts`) & WebSocket Real-Time Sync  

---

## 1. Document Purpose & Strict Scope Boundary

This Functional Specification Document defines the complete functional behavior, business rules, data contracts, calculations, fallback mechanisms, and real-time synchronization triggers of the **Student Portal** (`src/components/StudentView/*`, student auth/profile flows, and student-facing `AppContext` / `server.ts` contracts).

- **In Scope:** Student authentication & onboarding, student profile editing, Student Hub navigation shell, all **9 Student Portal routes/tabs**, interactive modals (Gamification Hub, Offline Study Pack, Parent Weekly Digest, Curriculum Explorer), persistent Quick Doubts AI widget, live intervention banners, student APIs, and student-triggered real-time state updates.
- **Out of Scope:** Internal Teacher Studio and Admin Hub workflows. Teacher and Admin portals are referenced exclusively as downstream **real-time synchronization recipients** of student activity or upstream **publishers** of live student interventions (Broadcast Quiz alerts, Google Meet invites, and Curriculum updates).

---

## 2. Student Persona, Academic Matrix & Trial Context

### 2.1 Primary Actor
- **Role:** `student` (`AppUser` in `src/types/index.ts`)
- **Default Demo Accounts:**
  - Pre-auth context default: `Alex Rivera` (`user-stu-2`, Grade 10, CBSE, `en`)
  - Quick Demo Student Login: `sarah.c@educateai.org`
- **Core Student Attributes:** `id`, `name`, `email`, `phone`, `grade` / `grade_level` (`6`–`12`), `stream` (e.g., `Science (PCM/PCB)`), `board`, `language`, `guardian_name`, `guardian_phone`, `guardian_email`, `school_name`, `school_id`, `school_lat`, `school_lng`, `avatar_url`, `gpa`, `overall_mastery`, `agile_completion_rate`, `study_streak`, `status` (`Active` | `Suspended`).

### 2.2 Supported Governing Education Boards (11)
`CBSE`, `ICSE`, `IB`, `IGCSE`, `PSEB`, `GSEB`, `MSBSHSE`, `KSEEB`, `BSEAP/TOSS`, `WBBSE`, `Tamil Nadu State Board`

### 2.3 Supported Language Media (10)
| Code | Language | Native Script |
| :--- | :--- | :--- |
| `en` | English | English |
| `hi` | Hindi | हिंदी |
| `pa` | Punjabi | ਪੰਜਾਬੀ |
| `mr` | Marathi | मराठी |
| `bn` | Bengali | বাংলা |
| `ta` | Tamil | தமிழ் |
| `te` | Telugu | తెలుగు |
| `gu` | Gujarati | ગુજરાતી |
| `kn` | Kannada | ಕನ್ನಡ |
| `ml` | Malayalam | മലയാളം |

### 2.4 Trial Subscription State
- Newly registered students receive an automated **7-Day Free Trial** (`subscriptionState`) tracked in days remaining and displayed as a live progress meter in the sidebar footer and the `settings` view.

---

## 3. Authentication, Onboarding & Student Profile Management

### 3.1 Student Authentication & Sign-Up (`src/components/Auth/UnifiedLogin.tsx`)
1. **Authentication Gate (`src/App.tsx`):** Unauthenticated sessions render `UnifiedLogin`; authenticated users with `role === 'student'` enter `StudentView` directly.
2. **Sign-In Modes:**
   - **Email & Password Sign-In:** Validates student credentials against `usersList` in `AppContext`. Suspended accounts (`status === 'Suspended'`) are blocked from login.
   - **Social SSO:** One-click sign-in flows for **Google**, **Outlook**, and **Apple**.
   - **Quick Demo Login:** Instant student session entry via `sarah.c@educateai.org`.
3. **Student Sign-Up Onboarding Form:**
   - **Identity:** Full Name, Email Address, Mobile Number (e.g., `+91 98765 43210`), Password.
   - **Academic Context:** Grade Level (`6`–`12`), Academic Stream (`Science (PCM/PCB)`), Governing Education Board (11 options), Preferred Language Medium (10 options).
   - **Guardian Contact:** Guardian Name, Guardian Phone, Guardian Email (auto-populates Parent Weekly Digest defaults).
   - **Institutional School Picker:** Uses `SchoolAutocomplete` + `SchoolLocationMap` (Google Maps integration) to bind school name and coordinates (`school_lat`, `school_lng`).
     - *Quota Fallback:* If Google Maps fires `gmp-quota-exceeded`, `QuotaDefenseBanner` activates and falls back gracefully to cached school records via `GET /api/schools`.
   - **Post-Signup Actions:** Creates student `AppUser`, registers/links school (`POST /api/schools`), activates 7-day trial, binds global `currentBoard` and `globalLanguage`, and persists user state to `localStorage` (`educate_ai_current_user`, `educate_ai_users_list`).

### 3.2 Student Profile Management (`src/components/UserProfile/UserProfileModal.tsx`)
- Accessible from the sidebar footer (`My Account`), top header profile avatar, and `settings` tab (`Edit Personal Info`).
- **Editable Fields:** Full Name, Phone, Grade Level (`6`–`12`), Stream, Governing Board, Preferred Language Medium, Guardian Name/Phone/Email, Institutional School, and Password update.
- **Avatar System:**
  - **26 Preset DiceBear Avatars** organized into 4 categories (`Students`, `Robots`, `Creatives`, `Fun`).
  - **Custom Seed Generator** and **Custom Image Upload** processed client-side (`processAvatarImage`).
- **Persistence:** Calls `updateCurrentUser(...)`, synchronizing `currentUser`, `studentsList`, `currentBoard`, `globalLanguage`, and `localStorage` immediately.

---

## 4. Application Shell, Navigation & Persistent Controls (`StudentView.tsx`)

### 4.1 Brand & Theme Shell
- **Brand Identity:** `PivotIQ` + `Student Hub` (`#0B1E38` navy sidebar, `#00A896` teal active indicator, `#FF6B00` orange high-priority CTAs).
- **Theme Support:** Light / Dark mode toggle (`ThemeContext`) persisted across views.
- **Responsive Drawer:** Desktop persistent left sidebar; mobile slide-over drawer controlled via `mobileSidebarOpen`.

### 4.2 Student Portal Navigation Architecture (8 Primary Tabs + 1 Settings Route)

| Route ID (`studentNav`) | Sidebar Label | Badge | Module / Purpose |
| :--- | :--- | :--- | :--- |
| `dashboard` | Dashboard | — | Agile Study Roadmap, Course Progress Tracker, Academic Filters, Quick Doubts, Study Momentum |
| `formulas-graphs` | Formulas & Graphs | `New` | Master STEM & Humanities Formulas, Annotated SVG Diagrams, Interactive Chemistry Periodic & Bohr Chart |
| `my-courses` | Skills Passport | — | Grade-filtered Syllabus Mastery, Unit Completion, Quiz & AI Drill Launchers |
| `grades` | Grades & Mastery | — | Cumulative KPI Scorecards, Continuous Evaluation Ledger, Faculty Review Request, AI Remedial Banner |
| `practice` | Practice Quizzes | — | Interactive MCQ Quiz Runner, Live Grading, Explanations, Auto-Certification (`>=80%`) |
| `ai-tutor` | AI Tutor | — | Socratic 24/7 AI Chat, Summary Prompt, Homework Image Upload, Web Speech Voice Input |
| `certificates` | Certificates | — | Verified Digital Credential Vault with Cryptographic Verification Hash |
| `community` | Community Q&A | — | Peer & Teacher-Verified Doubt Forum with Upvoting & Automated Abuse Moderation |
| `settings` | *(Header/Account Route)* | — | Personal Profile Modal Trigger, 7-Day Trial Status Card, Institutional School Summary |

### 4.3 Sidebar Footer Controls
- **7-Day Free Trial Progress Card:** Visualizes remaining trial duration.
- **My Account:** Opens `UserProfileModal`.
- **Theme Toggle:** Switches Light/Dark mode.
- **Sign Out:** Calls `logout()` and clears active session. (If an admin is previewing Student Hub, displays `Admin ->` switcher).

### 4.4 Global Top Header Bar
- Dynamic View Title & Subtitle reflecting active `studentNav`.
- **Gamification Hub Pill (`StudentGamificationHub`):** Live Flame Streak counter + Total XP badge; clicking opens the 3-tab Gamification modal.
- **Offline Pack Button:** Opens `OfflineStudyPackModal`.
- **Parent Digest Button:** Opens `ParentWeeklyDigestModal`.
- **Context Pills:** Active Governing Board badge, Active Grade badge, Current Date pill.
- **Workflow Map Button:** Launches Ecosystem Overview (`setEcosystemOverviewMode(true)`).
- **Profile Avatar Button:** Opens `UserProfileModal`.

### 4.5 Live Intervention Banners (Top of Content Workspace)
1. **Active Teacher Broadcast Quiz (`activeBroadcastQuiz`):**
   - Dismissible real-time alert displaying quiz title, target grade/cohort, broadcast timestamp, and question count.
   - **CTA (`Start Assessment`):** Sets `activeQuizId` to the broadcast quiz and switches `studentNav` to `practice`.
2. **Active Live Class Meeting (`activeStudentMeeting`):**
   - Dismissible `LIVE SESSION` banner triggered via WebSocket event `NEW_MEETING_INVITE`.
   - Displays session title, host instructor name, and **`Join Meeting`** external link to the Google Meet URL.

### 4.6 Floating Persistent Quick Doubts AI Widget
- Rendered bottom-right across **all 9 views** as a collapsible Floating Action Button + Popover.
- **Inputs:** Subject dropdown (populated dynamically from `displaySubjects`), Question textarea, **`Diagram`** button (triggers file picker and inserts `[Attached Diagram: <filename>]` context into the prompt).
- **Execution:** Dispatches `addDoubt(subject, question)` -> `POST /api/tutor/doubt-solve` and shows instant doubt resolution status.

---

## 5. Detailed Module & Tab Functional Specifications

### 5.1 Dashboard (`dashboard`)

#### 5.1.1 Course Progress Tracker (`src/components/StudentView/CourseProgressTracker.tsx`)
- **View Switcher:** Toggles between **Bar Chart** (Recharts `ResponsiveContainer`, `BarChart`, `LabelList`) and **Course Cards** grid.
- **4 Top KPI Cards:**
  1. **Overall Completion %:** Mean completion across active grade-filtered courses.
  2. **Agile Roadmap Tasks Done / Planned:** Ratio of `Completed` tasks to total `dailyTasks`.
  3. **Mastery Milestone:** Count of subjects scoring `> 90%` (certification-ready).
  4. **Active Courses:** Total active courses in the student's grade stream.
- **Interactive Course Drilldown Panel:**
  - Triggered by clicking any Recharts bar, legend pill, or course card.
  - Displays: Live mastery %, completed curriculum units, Agile completed/total task breakdown, next scheduled topic, and **`Practice AI Drill`** CTA (navigates to `ai-tutor` and auto-sends a targeted drill prompt).

#### 5.1.2 Agile Study Roadmap & Daily Planner (`src/components/StudentView/AgileStudyRoadmap.tsx`)
- **Calendar & View Controls:**
  - Month previous/next navigation (defaults to **October 2026**, matching pre-seeded October & November 2026 task datasets).
  - **3 View Modes:**
    1. `Month` — Full 7-column calendar grid including previous/next month overflow cells (`type: 'prev' | 'current' | 'next'`).
    2. `Week` — Focused 7-day sprint strip (Days 8–14).
    3. `Sprint` — 5-column Kanban board (`To Do`, `In Progress`, `On Hold`, `Revision`, `Completed`).
- **Status Filter Strip & Sprint XP Meter:**
  - Interactive pills (`All Tasks`, `To Do`, `In Progress`, `On Hold`, `Revision`, `Done`) showing real-time counts per status.
  - Live **Sprint Story Points XP** progress bar summing earned vs. planned task points.
- **Drag-and-Drop Rescheduling:**
  - Month/Week: Dragging a task card onto any day cell updates `task.date` and `task.day` via `updateStudyTask`.
  - Sprint Kanban: Dragging a card across columns updates `task.status` immediately via `updateStudyTask`.
- **Inline One-Click Quick Actions:**
  - Calendar/Week cards: `✓ Done`, `▶ In Prog`, `↺ Revise`.
  - Kanban cards: `Progress`, `Done`, `Revision` one-click status transitions.
- **Edit Task Modal (`selectedTask`):**
  - Editable fields: Topic title, 5-status selector, XP Points (`5`–`100`, step `5`, quick presets `10`, `15`, `20`, `25`, `30`, `50`), Estimated Duration (`0.5`–`6h`, step `0.5`), Revision Notes.
  - **`Ask AI Tutor ->`** button: Closes modal, opens `ai-tutor`, and sends a contextual prompt for that task's subject and topic.
  - **Delete** (`deleteStudyTask`) and **Save** (`updateStudyTask`).
- **New Task Modal (`isNewTaskOpen`):**
  - Inputs: Day of month (`1`–`31`), Subject (6 presets), Topic, Initial Status, XP (`5`–`100`), `Core Daily Practice` boolean flag.
  - Creates task via `addStudyTask`.
- **Footer Utility Bar:**
  - Status color legend.
  - **`Recalculate AI Sprints`:** Calls `generateStudyPlan` (`POST /api/study-planner/generate`) to rebalance pending tasks into sprint blocks.
  - **`Offline Pack`:** Opens `OfflineStudyPackModal`.
  - **`Parent Digest`:** Opens `ParentWeeklyDigestModal`.
  - **`Spreadsheet`:** Executes `exportStudyPlanSpreadsheet()` to download a multi-section UTF-8 CSV (`Daily Agile Planner`, `Weekly Sprint Board`, `Master Chapter Tracker`).

#### 5.1.3 Dashboard Right Rail (`StudentView.tsx`)
1. **Grade & Board Filters Card:**
   - Grade selector (`6`–`12`, toggles `gradeOverride` to preview any grade curriculum without mutating permanent enrollment unless saved in Profile).
   - Governing Board selector (11 boards -> `setCurrentBoard`).
   - Language Medium selector (10 languages -> `setGlobalLanguage`).
   - **`View Syllabus ->`** CTA opens `CurriculumExplorerModal`.
2. **Quick Doubts AI Card:** Inline subject/question submission (`addDoubt`) + displays the 2 most recent doubts with resolution status and AI solution snippet.
3. **Study Momentum Card:** Displays `5-Day Streak` badge, `Weekly Core Math` progress (`10.5 / 10.5 hrs`), progress bar, and `Next Milestone` preview.

---

### 5.2 Formulas & Graphs (`formulas-graphs`)

#### 5.2.1 Master Formulas & Board Diagrams (`src/components/StudentView/FormulasAndGraphsTab.tsx`)
- **Navigation & Filtering:**
  - **5 Subject Pills:** `Mathematics`, `Physics`, `Chemistry`, `History & Civics`, `Biology`.
  - **View Mode Toggle:** `All` | `Formulas` | `Diagrams`.
  - **Live Search Input:** Filters formula titles, expressions, variables, examples, and diagram annotations in real time.
- **Master Formula Library (16 Formulas Total):**
  - *Mathematics (4):* Quadratic Formula, Pythagorean Theorem, Arithmetic Progression ($n$-th term & sum), Area of Sector & Arc Length.
  - *Physics (4):* Ohm's Law & Electrical Power, Newton's Second Law & Momentum, Mirror & Lens Formula with Magnification, Equations of Uniformly Accelerated Motion.
  - *Chemistry (5):* Ideal Gas Law ($PV=nRT$), Molarity & Dilution ($M_1V_1=M_2V_2$), pH & pOH Equilibrium, Nernst Equation, Combined Gas Law.
  - *History & Civics (2):* Constitutional Parliamentary Timeline, Federal Division of Powers (Union/State/Concurrent Lists).
  - *Biology (1):* Photosynthesis & Cellular Respiration Stoichiometry.
  - **Formula Card Features:** Formatted mathematical/chemical notation, variable definitions with SI units, worked numerical example, exam key takeaway, and **One-Click Copy to Clipboard** with visual confirmation.
- **Annotated SVG Board Diagrams (5 Interactive Diagrams):**
  1. DC Resistor Circuit (Series & Parallel equivalent resistance + ammeter/voltmeter placement)
  2. Bohr Atomic Model — Sodium ($Z=11$, 2-8-1 electron shells)
  3. Periodic Atomic Structure Reference Chart
  4. Quadratic Parabola ($y = x^2 - 4x + 3$, vertex, axis of symmetry, roots at $x=1,3$)
  5. Indian Freedom Movement Chronology (1857–1947 key milestones)
  - **Lightbox Fullscreen Modal:** Clicking expand opens any SVG diagram in a high-contrast fullscreen inspection overlay.

#### 5.2.2 Interactive Chemistry Periodic Table & Bohr Simulator (`src/components/StudentView/ChemistryAtomicChart.tsx`)
- Rendered automatically inside the `Chemistry` view of `Formulas & Graphs`.
- **Element Coverage:** Interactive dataset covering elements **$Z=1$ (Hydrogen) through $Z=82$ (Lead)**.
- **Search & Category Filters:** Search by element symbol, name, or atomic number $Z$; filter across **8 chemical families** (`alkali`, `alkaline-earth`, `transition`, `post-transition`, `metalloid`, `nonmetal`, `halogen`, `noble-gas`).
- **Dynamic SVG Bohr Planetary Orbit Visualizer:**
  - Renders concentric electron shells around a central nucleus showing **proton ($p^+$) and neutron ($n^0$) counts**.
  - Visually differentiates **core shell electrons** from **outermost valence shell electrons**.
- **Element Telemetry Inspector:** Displays atomic mass, electron configuration, oxidation states, Pauling electronegativity, atomic radius (pm), physical state, **Copy Element Details** button, and **Periodic Trend Cards** (Atomic Radius, Ionization Energy, Electronegativity across periods/groups).

---

### 5.3 Skills Passport & Enrolled Curriculum (`my-courses`)
- **Grade-Reactive Curriculum:** Dynamically filters `subjectsDB` and `topicsDB` (populated via `GET /api/curriculum/full` and live WebSocket `CURRICULUM_UPDATED` pushes) by `activeGradeFilter`.
- **Per-Subject Cards:**
  - Displays live mastery %, completed vs. total Agile tasks, and up to **3 active syllabus units/topics**.
  - **Unit Actions:**
    - **`✓ Complete`:** Calls `completeCurriculumUnit(subjectName, unitName)`, creating a completed `30 XP` Agile task and triggering `syncStudentProgressAcrossPanels`.
    - **`Practice Quiz`:** Auto-matches a relevant quiz in `quizzes` and routes directly to `practice`.
    - **`Launch AI Drill`:** Navigates to `ai-tutor` and triggers a targeted Socratic practice prompt for that topic.
- **Full Syllabus Explorer:** **`Browse Full Grades 6-12 Curriculum`** opens `CurriculumExplorerModal` (`src/components/common/CurriculumExplorerModal.tsx`) for multi-grade/board inspection.

---

### 5.4 Grades & Mastery KPIs (`grades`)
- **KPI Summary Cards:** Cumulative GPA, Governing Board Compliance (`98%`), Overall Mastery %, Physics Progress %, Algebra I Mastery %, Attendance %.
- **Continuous Evaluation Ledger (6 Courses):**
  - Tabular view of Subject, Weighting/Credits, Live Mastery %, Evaluation Status, and **`Launch Drill`** button per row.
- **Student Actions:**
  - **`Request Faculty Review`:** Calls `addNotification(...)` to dispatch a live review request visible in the educator workflow without page reload.
  - **AI Targeted Remedial Opportunity Banner:** Highlights the lowest-scoring domain and provides a **`Start Targeted Practice`** button routing directly into `ai-tutor`.

---

### 5.5 Practice Quizzes (`practice`)
- **Quiz Selection Grid:** Displays available assessments (default seeded + live teacher-broadcast quizzes) with Grade level badge, Question count, Attempts counter, and Historical Average Score %.
- **Interactive MCQ Assessment Runner:**
  - Single-choice radio selection (`A`, `B`, `C`, `D`) per question with live **`Answered X / Y`** progress tracker.
  - **`Submit Answers & Sync`** triggers `recordQuizSubmission(quizId, answers)`:
    1. Computes exact percentage score (`0–100%`).
    2. Increments `attempts` and recalculates `avgScore` on the quiz.
    3. Updates subject mastery and student GPA across `currentUser` and `studentsList` (persisted to `localStorage`).
    4. **Automated Certification Rule:** If `score >= 80%`, automatically issues a verified `DigitalCertificate` (`EDU-AI-{YEAR}-{5digit}` / `PIVOTIQ-...`) with a 40-character hex verification hash and attaches it to the student's `certificates` list.
- **Post-Submission Review:**
  - Highlights correct/incorrect answers per question with step-by-step explanations.
  - Displays **`View Issued Certificate`** CTA (navigates to `certificates`) when `score >= 80%`, plus **`Reset / Retake`**.

---

### 5.6 Socratic 24/7 AI Tutor (`ai-tutor`)
- **Curriculum Grounding:** Every session displays active alignment pills for `{currentBoard}`, `Grade {studentGradeLevel}`, and `{globalLanguage}`.
- **Interaction Modes:**
  1. **Text Socratic Chat:** Prompts guide the student through reasoning steps rather than giving bare answers, rendering math formula highlight blocks.
  2. **`Summary` Quick Action:** Requests an instant structured concept recap of the current conversation.
  3. **Homework Photo Upload:** File input (`image/*`) reads image via `FileReader` into a base64 Data URL preview and attaches visual homework context to the user prompt.
  4. **Voice-to-Text Input:** Integrates browser `SpeechRecognition` / `webkitSpeechRecognition` (`Mic` / `MicOff` toggle) with clean fallback messaging if unsupported.
- **Backend Processing (`POST /api/tutor/chat`):**
  - Uses `@google/genai` (`gemini-3.8-flash` with `ThinkingLevel.LOW`) and `undici` global dispatcher configured with a 120s headers timeout.
  - **Resilience Fallback:** If the Gemini API key is absent or upstream inference times out, returns a deterministic, curriculum- and language-aware Socratic fallback response so student study is never blocked.

---

### 5.7 Digital Certificates (`certificates`)
- Displays all earned `DigitalCertificate` credentials for the student.
- **Certificate Fields:** Certificate Title/Course, Credential ID (`EDU-AI-YYYY-NNNNN` or `PIVOTIQ-...`), Issue Date, Score Achieved (`%`), Issuing Authority, Verification Status (`Verified` | `Revoked`), and **40-character hexadecimal cryptographic verification hash**.

---

### 5.8 Community Doubt & Q&A Forum (`community`)
- **Collaborative Q&A Feed:** Shows peer academic questions, subject tags, timestamps, upvote counts, comments, and highlighted **Teacher-Verified Solution** badges.
- **Interactions:**
  - **Create Post:** `addCommunityPost` (`POST /api/community/posts`).
  - **Add Comment:** `addCommunityComment` (`POST /api/community/posts/:id/comments`).
  - **Upvote Question:** `upvoteCommunityPost` (`POST /api/community/posts/:id/upvote`).
- **Zero-Tolerance Automated Abuse Moderation:**
  - Both client context and `server.ts` evaluate incoming posts and comments against `TOXIC_PATTERNS`.
  - **Enforcement Action on Match:** Returns HTTP `403` (`ACCOUNT_SUSPENDED_POLICY_VIOLATION`), marks the student's account `Suspended`, immediately clears `isAuthenticated` and `currentUser` (forcing immediate portal lockout to `UnifiedLogin`), and logs a high-priority `anomaly_detected` security alert to Admin telemetry.

---

### 5.9 Student Settings (`settings`)
- **Personal & Academic Information:** Summary card + **`Edit Personal Info`** CTA opening `UserProfileModal`.
- **Plan & Trial Card:** Shows active plan tier and 7-Day Free Trial status.
- **Institutional School Mapping:** Shows linked school name, board, and geolocation status.

---

## 6. Engagement & Utility Modals

### 6.1 Gamification Hub (`src/components/StudentView/StudentGamificationHub.tsx`)
- **Persistence Key:** `localStorage['educate_ai_gamification_state']`.
- **3 Interactive Tabs:**
  1. **Streak & Safeguards:** 7-day visual streak tracker, **Streak Freeze** toggle safeguard, and one-click **`Claim +25 XP Daily Bonus`** action with celebratory confetti animation.
  2. **Daily XP Quests:** Daily XP target meter, 3 actionable daily study quests, and tier standing (**Level 4 Master Scholar — Emerald League**).
  3. **Milestones & Badges:** 6 progressive academic badges (unlock states + criteria).

### 6.2 Offline Study Pack (`src/components/StudentView/OfflineStudyPackModal.tsx`)
- **Low-Bandwidth 2G Saver Toggle:** Persisted at `localStorage['educate_ai_low_bandwidth']`; reduces heavy visual overhead for constrained connectivity.
- **Local Cache Status Indicator:** Confirms locally persisted study items.
- **Self-Contained HTML Bundle Download:** Generates and downloads a standalone `.html` study pack containing up to **15 Agile daily tasks**, **4 STEM quick-reference summaries**, and an **exam readiness checklist**, plus direct **`Print / Save PDF`** (`window.print()`).

### 6.3 Parent Weekly Digest (`src/components/StudentView/ParentWeeklyDigestModal.tsx`)
- **3 Interactive Tabs:**
  1. **Sprint Hours & Progress:** Displays weekly study volume (`26.0 / 28.5 hrs = 91%`), 4-subject breakdown bars, and Teacher/AI Mentor remarks.
  2. **1-Page PDF Summary Preview:** Formatted executive parent report with direct `window.print()` export.
  3. **Settings & Dispatch:** Guardian name/email fields, **Sunday 07:00 PM IST Automated Weekly Dispatch** toggle, and **`Send Test Digest Now`** simulated instant email confirmation.

---

## 7. Mathematical Formulas & Real-Time Sync Engine

### 7.1 Reactive Course Progress & Agile Task Weighting
Defined identically in `CourseProgressTracker.tsx` and `syncStudentProgressAcrossPanels` (`AppContext.tsx`):

- **Task Status Weights ($W_{\text{status}}$):**
  - `Completed` = `1.00`
  - `Revision` = `0.75`
  - `In Progress` = `0.45`
  - `On Hold` = `0.15`
  - `To Do` = `0.00`
- **Task Points ($P_i$):** `task.points ?? 25`
- **Weighted Earned Ratio:**
  $$\text{Ratio} = \frac{\sum (P_i \times W_{\text{status}, i})}{\sum P_i}$$
- **Reactive Subject Completion Score ($S_{\text{subject}}$):**
  $$S_{\text{subject}} = \min\Big(100,\; \max\big(15,\; \text{round}(25 + \text{Ratio} \times 75)\big)\Big)$$

### 7.2 Real-Time Cross-Panel Synchronization Triggers
Without requiring a page refresh, the following student actions immediately propagate across `AppContext` shared state (`studentsList`, `quizzes`, `certificates`, `doubts`, `notifications`) and/or `server.ts` WebSocket broadcasts:

| Student Action | Local State & Persistence | Cross-Panel Sync Target (Teacher / Admin) |
| :--- | :--- | :--- |
| Agile task added, edited, dragged, or status toggled | `dailyTasks` updated; `syncStudentProgressAcrossPanels` recalculates course & overall completion | Teacher Cohort Progress & Admin Student Telemetry update immediately |
| Curriculum unit marked `✓ Complete` | Prepends `Completed` `30 XP` task; updates subject mastery | Teacher Skills Tracker & Admin Mastery Metrics update immediately |
| Practice quiz submitted (`recordQuizSubmission`) | Updates `quizzes` stats, recalculates student `gpa` & mastery; if `score >= 80%`, mints `DigitalCertificate`; updates `localStorage` | Teacher Gradebook (`quiz_completed`), Certificate Registry (`certificate_issued`), Admin KPIs update immediately |
| Quick Doubt submitted (`addDoubt`) | Calls `POST /api/tutor/doubt-solve`; appends resolved doubt | Teacher Doubt Queue & Notification Feed (`doubt_asked` / `doubt_resolved`) |
| Faculty Review requested (`grades`) | Adds review notification via `addNotification` | Teacher Studio & Admin Review Queue receive live alert |
| Community post/comment flagged by `TOXIC_PATTERNS` | Clears auth (`logout`), suspends user | Admin Security Log receives `anomaly_detected` alert |
| Teacher publishes Quiz or creates Meeting (upstream) | WebSocket `CURRICULUM_UPDATED` / `NEW_MEETING_INVITE` or shared state | Student Portal displays live Broadcast Quiz or `LIVE SESSION` Meet banner |

---

## 8. Student Portal API & WebSocket Contract

### 8.1 HTTP Endpoints Consumed by Student Portal
- `POST /api/tutor/chat` — Socratic AI Tutor response generation (`gemini-3.8-flash` + fallback).
- `POST /api/tutor/doubt-solve` — Quick Doubts AI instant answer generation.
- `POST /api/study-planner/generate` — AI Sprint recalculation & task schedule optimization.
- `GET /api/schools` & `POST /api/schools` — Institutional school lookup (including Maps quota fallback) & signup school registration.
- `GET /api/curriculum/full` — Grades 6–12 subjects & topics hydration.
- `GET /api/community/posts`, `POST /api/community/posts`, `POST /api/community/posts/:id/comments`, `POST /api/community/posts/:id/upvote` — Community Q&A operations & HTTP `403` moderation enforcement.
- `GET /api/meetings` — Active live class session status hydration.
- `GET /api/events` & `POST /api/events` — Student activity & telemetry event log.

### 8.2 WebSocket Events (`ws` on port `3000`)
- `CURRICULUM_STATE_INIT` — Hydrates initial Grades 6–12 curriculum state on WebSocket connect.
- `CURRICULUM_UPDATED` — Real-time subject/topic updates pushed to Student Skills Passport & Filters.
- `NEW_MEETING_INVITE` — Pushes live Google Meet alert (`activeStudentMeeting`) to Student Portal header banner.

---

## 9. Persistence & Non-Functional Requirements

- **Client Persistence (`localStorage` Keys):**
  - `educate_ai_current_user` — Active student session profile.
  - `educate_ai_users_list` — Registered user profiles & updated academic metrics.
  - `educate_ai_gamification_state` — Streak count, freeze toggle, XP balance, claimed quests & badges.
  - `educate_ai_low_bandwidth` — Low-Bandwidth 2G Saver mode preference.
- **Zero-Refresh Reactivity:** All dashboard charts, Kanban boards, GPA counters, and certificate lists update via React state and WebSocket listeners without browser reload.
- **Browser Capability Fallbacks:**
  - Web Speech API unsupported -> Clean fallback prompt without crashing chat UI.
  - Google Maps quota error -> `QuotaDefenseBanner` + cached `/api/schools` list.
  - Gemini API timeout/missing key -> `undici` 120s headers timeout + structured Socratic deterministic fallback.
