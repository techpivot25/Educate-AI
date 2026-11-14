# PivotIQ Student Portal — End-to-End Workflows

**Scope:** Student Portal (`PivotIQ Student Hub`) Only  
**Notation:** Mermaid Flowcharts + Step-by-Step Operational Rules  

---

## Workflow 1: Student Portal Entry, Authentication & Onboarding

### Process Diagram
```mermaid
flowchart TD
    A[Open PivotIQ App] --> B{Authenticated Session in localStorage?}
    B -- Yes & Not Suspended --> E[Enter Student Hub Dashboard]
    B -- No --> C[Render UnifiedLogin Screen]
    C --> D{Auth Path Chosen}
    D -- Demo Student --> D1[Auto-load sarah.c@educateai.org]
    D -- Email/Password or SSO --> D2[Validate Credentials & Active Status]
    D -- Sign Up --> S1[Enter Identity, Grade 6-12, Stream, Board, Language, Guardian]
    S1 --> S2{Google Maps Autocomplete Available?}
    S2 -- Yes --> S3[Select School & Lat/Lng Coordinates]
    S2 -- Quota Exceeded --> S4[QuotaDefenseBanner -> Select from GET /api/schools]
    S3 --> S5[POST /api/schools + Create AppUser + Activate 7-Day Free Trial]
    S4 --> S5
    D1 --> E
    D2 -- Valid --> E
    D2 -- Suspended --> X[Block Access: Policy Violation]
    S5 --> E
```

### Step-by-Step Flow
1. `App.tsx` checks `isAuthenticated` and `currentUser` (`educate_ai_current_user`).
2. Unauthenticated users land on `UnifiedLogin.tsx` with four paths: Email/Password Sign-In, Social SSO (Google/Outlook/Apple), Quick Demo Student (`sarah.c@educateai.org`), or Full Sign-Up.
3. During Sign-Up, the student specifies Grade (`6`–`12`), Stream, Governing Board (`11` choices), Language Medium (`10` choices), Guardian details, and Institutional School.
4. If Google Maps quota triggers `gmp-quota-exceeded`, `QuotaDefenseBanner` automatically switches school selection to cached records from `GET /api/schools`.
5. Completing signup registers/links the school (`POST /api/schools`), activates the 7-Day Free Trial, binds global `currentBoard` and `globalLanguage`, and opens the Student Hub.

---

## Workflow 2: Student Shell Navigation & Live Teacher Intervention Handling

### Process Diagram
```mermaid
flowchart LR
    WS[WebSocket / Shared AppContext] -->|NEW_MEETING_INVITE| MB[Display LIVE SESSION Meet Banner]
    WS -->|Teacher Broadcasts Quiz| QB[Display Broadcast Quiz Alert Banner]
    WS -->|CURRICULUM_UPDATED| SP[Refresh displaySubjects & Skills Passport]
    MB -->|Click Join Meeting| EXT[Open Google Meet URL in New Tab]
    QB -->|Click Start Assessment| PR[Set activeQuizId & Switch to Practice Tab]
    NAV[Student Sidebar 8 Tabs + Settings] --> FAB[Persistent Quick Doubts AI FAB Available Everywhere]
```

### Step-by-Step Flow
1. The Student Shell maintains persistent WebSocket connectivity (`ws` on port `3000`) and shared `AppContext` subscriptions across all 9 views.
2. When an instructor schedules/starts a class, `NEW_MEETING_INVITE` renders the dismissible `LIVE SESSION` banner above the main workspace with a `Join Meeting` link.
3. When an instructor publishes a live quiz, `activeBroadcastQuiz` renders a top banner with a `Start Assessment` button that binds `activeQuizId` and switches directly to `practice`.
4. Clicking the top header profile avatar or `My Account` opens `UserProfileModal`, allowing instant updates to Grade, Board, Language, Guardian info, Password, or Avatar (26 DiceBear presets + custom upload).

---

## Workflow 3: Agile Study Roadmap, Drag-and-Drop & AI Sprint Recalculation

### Process Diagram
```mermaid
flowchart TD
    A[Open Dashboard -> Agile Study Roadmap] --> B{Select View Mode}
    B --> M[Month Calendar Grid]
    B --> W[Week Days 8-14 View]
    B --> S[Sprint 5-Column Kanban]
    M & W & S --> ACT{Student Interaction}
    ACT -- Drag Card to Day/Column --> UPD[updateStudyTask: Update date or status]
    ACT -- Click Quick Button Done/InProg/Revise --> UPD
    ACT -- Click Card -> Edit Modal --> EDT[Modify Topic, Status, XP 5-100, Hours, Notes]
    EDT -- Save --> UPD
    EDT -- Ask AI Tutor --> TUT[Route to ai-tutor + Auto-send Context Prompt]
    ACT -- Click New Task --> ADD[addStudyTask: Day, Subject, Topic, Status, XP, Core Flag]
    ACT -- Click Recalculate AI Sprints --> AI[POST /api/study-planner/generate -> Rebalance Tasks]
    ACT -- Click Spreadsheet --> CSV[Download 3-Section UTF-8 CSV Export]
    UPD & ADD & AI --> SYNC[syncStudentProgressAcrossPanels]
```

### Step-by-Step Flow
1. Student views planned tasks in Month, Week (Days 8–14), or 5-column Sprint Kanban (`To Do`, `In Progress`, `On Hold`, `Revision`, `Completed`), optionally filtered by status pills.
2. Student reschedules tasks via drag-and-drop across calendar days (including overflow cells) or transitions statuses via Kanban drag-and-drop / inline quick buttons (`✓ Done`, `▶ In Prog`, `↺ Revise`).
3. Opening any task displays the Edit Modal with XP (`5–100`), duration (`0.5–6h`), revision notes, and a direct `Ask AI Tutor ->` shortcut.
4. Clicking `Recalculate AI Sprints` invokes `POST /api/study-planner/generate` to re-sequence workload automatically.
5. Every task mutation immediately triggers `syncStudentProgressAcrossPanels` (see Workflow 4).

---

## Workflow 4: Reactive Progress Calculation & Real-Time Cross-Panel Sync

### Process Diagram
```mermaid
sequenceDiagram
    participant S as Student Portal (Roadmap / Tracker)
    participant C as AppContext (syncStudentProgressAcrossPanels)
    participant T as Teacher Studio (Cohort Telemetry)
    participant A as Admin Hub (Institution KPIs)

    S->>C: Mutate Task / Complete Unit / Submit Quiz
    Note over C: Apply Status Weights:<br/>Completed=1.0, Revision=0.75,<br/>In Progress=0.45, On Hold=0.15, To Do=0.0
    Note over C: Score = min(100, max(15, round(25 + (earned/total)*75)))
    C-->>S: Re-render CourseProgressTracker Bars & KPIs (0ms, no refresh)
    C-->>T: Update Student Mastery & Agile Completion Rate Live
    C-->>A: Update Institutional Analytics & Audit Counters Live
```

### Step-by-Step Flow
1. Any task status change, point adjustment, task creation/deletion, or unit completion updates `dailyTasks`.
2. `CourseProgressTracker` and `syncStudentProgressAcrossPanels` compute weighted earned points per subject (`Completed=1.0`, `Revision=0.75`, `In Progress=0.45`, `On Hold=0.15`, `To Do=0.0`) multiplied by `task.points ?? 25`.
3. Subject mastery is clamped to `[15, 100]` using `round(25 + (earned / total) * 75)`.
4. `studentsList` and `currentUser` update in shared `AppContext` memory and `localStorage`, ensuring Teacher and Admin dashboards reflect the exact updated percentages immediately with zero page reload.

---

## Workflow 5: Formulas, Board Diagrams & Interactive Chemistry Bohr Simulator

### Process Diagram
```mermaid
flowchart TD
    A[Select Formulas & Graphs Tab] --> B[Choose Subject Pill: Math / Physics / Chemistry / History & Civics / Biology]
    B --> C[Filter by All / Formulas / Diagrams or Search Query]
    C --> D{Item Selected}
    D -- Formula Card --> F1[Inspect Equation, Variables, Worked Example, Takeaway]
    F1 --> F2[One-Click Copy Expression to Clipboard]
    D -- Annotated SVG Diagram --> G1[Inspect Interactive Diagram]
    G1 --> G2[Open Fullscreen Lightbox View]
    B -- Chemistry Tab --> CH1[Render ChemistryAtomicChart Z=1 to Z=82]
    CH1 --> CH2[Filter by 8 Chemical Families or Search Name/Symbol/Z]
    CH2 --> CH3[Select Element -> Dynamic SVG Bohr Orbit Visualizer]
    CH3 --> CH4[Inspect Protons, Neutrons, Core vs Valence Shells, Electronegativity, Copy Details]
```

### Step-by-Step Flow
1. Student selects one of 5 subject pills and filters by view mode (`All`, `Formulas`, `Diagrams`) or keyword search.
2. Student studies any of the **16 Master Formulas** with worked examples and copies notation to clipboard, or opens any of the **5 Annotated SVG Diagrams** in fullscreen mode.
3. Selecting **Chemistry** embeds `ChemistryAtomicChart`, allowing the student to browse elements **$Z=1$ to $Z=82$**, filter across 8 chemical categories, click any element to inspect its live concentric Bohr orbit diagram (nucleus $p^+ / n^0$ + valence highlight), and copy atomic specifications.

---

## Workflow 6: Skills Passport, Practice Quizzes & Automated Certification (`>= 80%`)

### Process Diagram
```mermaid
flowchart TD
    A[Skills Passport Tab] --> B[Display Grade-Filtered Subjects & Active Topics]
    B --> C{Unit Action}
    C -- Click ✓ Complete --> D[completeCurriculumUnit: Add 30 XP Completed Task + Sync]
    C -- Click Launch AI Drill --> E[Route to AI Tutor with Topic Drill Prompt]
    C -- Click Practice Quiz --> F[Route to Practice Quizzes Tab]
    F --> G[Select Quiz & Answer MCQs A/B/C/D]
    G --> H[Click Submit Answers & Sync -> recordQuizSubmission]
    H --> I[Compute Score %, Update Quiz Avg & Subject GPA]
    I --> J{Score >= 80%?}
    J -- Yes --> K[Auto-Issue DigitalCertificate with 40-Hex Hash]
    K --> L[Show View Issued Certificate CTA + Update Certificates Tab]
    J -- No --> M[Show Per-Question Explanations + Remedial Retake Option]
```

### Step-by-Step Flow
1. In `my-courses`, the student reviews subjects filtered dynamically by `activeGradeFilter` (or opens `CurriculumExplorerModal` for Grades 6–12).
2. Marking a unit `✓ Complete` logs a completed `30 XP` task and recalculates mastery across all panels.
3. Launching a quiz in `practice` opens the interactive MCQ runner. Submitting calls `recordQuizSubmission`, which grades responses, updates quiz statistics, recalculates student GPA/mastery, and persists to `localStorage`.
4. Whenever `score >= 80%`, the system automatically mints a verified `DigitalCertificate` (`EDU-AI-{YEAR}-{5digit}`) with a 40-character hex hash and surfaces it immediately in both the quiz result view and the `certificates` tab.

---

## Workflow 7: Socratic 24/7 AI Tutor & Floating Quick Doubts AI

### Process Diagram
```mermaid
flowchart TD
    A{Entry Channel} -->|ai-tutor Tab| B[Choose Input Mode]
    B -- Text Question --> T1[Send Socratic Prompt]
    B -- Summary Button --> T2[Request Structured Concept Recap]
    B -- Upload Photo --> T3[FileReader Data URL Preview + Prompt]
    B -- Voice Mic --> T4[Web Speech API Transcript -> Input]
    T1 & T2 & T3 & T4 --> API1[POST /api/tutor/chat: Board + Grade + Language Grounded]
    API1 --> G1{Gemini 3.8 Flash Reachable within 120s?}
    G1 -- Yes --> R1[Render Socratic Guidance & Formula Blocks]
    G1 -- No / Timeout --> R2[Render Curriculum-Aware Deterministic Fallback]

    A -->|Floating Quick Doubts FAB or Dashboard Card| Q1[Select Subject + Enter Doubt + Optional Diagram Name]
    Q1 --> API2[addDoubt -> POST /api/tutor/doubt-solve]
    API2 --> R3[Store Doubt, Render Instant Answer & Notify Teacher Queue]
```

### Step-by-Step Flow
1. Student accesses `ai-tutor` directly or jumps contextually from Course Progress (`Practice AI Drill`), Agile Roadmap (`Ask AI Tutor`), Skills Passport (`Launch AI Drill`), or Grades (`Start Targeted Practice`).
2. Student interacts via text, `Summary` shortcut, homework image upload (`FileReader`), or Web Speech voice input.
3. `POST /api/tutor/chat` injects `{currentBoard}`, `Grade {studentGradeLevel}`, and `{globalLanguage}` into `gemini-3.8-flash` (`ThinkingLevel.LOW`, 120s `undici` timeout), falling back cleanly to a deterministic Socratic response if unavailable.
4. From any screen, the student can alternatively open the bottom-right **Quick Doubts AI** popover, attach a diagram filename, and trigger `POST /api/tutor/doubt-solve`.

---

## Workflow 8: Community Q&A & Zero-Tolerance Automated Moderation

### Process Diagram
```mermaid
flowchart TD
    A[Open Community Q&A Tab] --> B{Action}
    B -- Upvote --> U[POST /api/community/posts/:id/upvote -> Increment Score]
    B -- Submit Post or Comment --> M{Inspect Against TOXIC_PATTERNS}
    M -- Clean Academic Content --> OK[Persist Post/Comment + Render in Feed]
    M -- Profanity / Abuse Detected --> ERR[HTTP 403 ACCOUNT_SUSPENDED_POLICY_VIOLATION]
    ERR --> LOCK[Mark Account Suspended + Clear Session -> Logout to UnifiedLogin]
    ERR --> ADM[Log High-Priority anomaly_detected Alert to Admin Security Telemetry]
```

### Step-by-Step Flow
1. Students browse Q&As, review **Teacher-Verified Solutions**, upvote helpful questions, and post new questions or replies.
2. Every submitted post or comment is scanned against `TOXIC_PATTERNS` both client-side and on `server.ts`.
3. Clean submissions save and broadcast to the feed immediately; any policy violation returns HTTP `403`, suspends the student account, forces immediate logout, and dispatches a security alert to Admin telemetry.

---

## Workflow 9: Gamification, Offline Study Pack & Parent Weekly Digest

### Process Diagram
```mermaid
flowchart LR
    H[Top Header / Roadmap Footer] --> G[Gamification Hub]
    H --> O[Offline Study Pack]
    H --> P[Parent Weekly Digest]

    G --> G1[Toggle Streak Freeze / Claim +25 XP Confetti / Track Quests & Badges]
    G1 --> G2[Persist in localStorage: educate_ai_gamification_state]

    O --> O1[Toggle Low-Bandwidth 2G Saver -> educate_ai_low_bandwidth]
    O1 --> O2[Generate Standalone HTML Bundle: 15 Tasks + 4 STEM Summaries + Checklist]
    O2 --> O3[Download .html or Print PDF]

    P --> P1[Inspect Sprint Hours 26.0/28.5 = 91% & Remarks]
    P1 --> P2[Preview 1-Page Report -> Print PDF or Toggle Sunday 07:00 PM IST Auto-Dispatch]
```

### Step-by-Step Flow
1. **Gamification Hub:** Tracks daily streaks, Streak Freeze safeguard, `+25 XP` bonus claims with confetti, daily quests, Emerald League standing, and 6 achievement badges in `localStorage`.
2. **Offline Study Pack:** Enables 2G Low-Bandwidth mode (`educate_ai_low_bandwidth`) and exports a portable, self-contained `.html` revision pack (15 daily tasks, 4 STEM summaries, exam checklist) or prints to PDF.
3. **Parent Weekly Digest:** Summarizes weekly sprint completion (`91%`), displays a 1-page printable parent report, and configures automated Sunday 07:00 PM IST guardian delivery or simulated immediate test dispatch.
