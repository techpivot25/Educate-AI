# Educate AI Agent Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.x-black.svg)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg)](https://vitejs.dev/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-orange.svg)](https://ai.google.dev/)
[![Google Maps](https://img.shields.io/badge/Google_Maps-Platform-green.svg)](https://developers.google.com/maps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An all-in-one, enterprise-grade AI educational ecosystem designed for modern schools, academies, and universities. The platform unifies **Multilingual Socratic Tutoring**, **Localized Curriculum & Board Alignment**, **Google Maps Institutional Geocoding**, **Google Meet Live Academic Intervention**, **Agile Study Sprint Planning**, **AI-Powered Proctoring & Anomaly Detection**, and **Cryptographically Verifiable Certificates**.

---

## 🌟 Key Capabilities & Highlights

```
                  ┌──────────────────────────────────────────────┐
                  │         Educate AI Agent Platform            │
                  └──────────────────────┬───────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│  Student Portal  │           │ Teacher Studio   │           │   Admin Hub      │
│                  │           │                  │           │                  │
│ • Quick Doubts   │           │ • Live Monitoring│           │ • Curriculum     │
│ • Board RAG Sync │           │ • Meet Dispatch  │           │   Studio (CRUD)  │
│ • Multilingual   │           │ • Lesson Creator │           │ • Real-time WS   │
│ • Agile Planner  │           │ • AI Quiz Engine │           │ • Proctor Matrix │
│ • Safe Community │           │ • Doubt Resolver │           │ • User Audit     │
└────────┬─────────┘           └────────┬─────────┘           └────────┬─────────┘
         │                              │                              │
         └──────────────────────────────┼──────────────────────────────┘
                                        ▼
                  ┌──────────────────────────────────────────────┐
                  │    Express Full-Stack Server & WebSockets    │
                  ├──────────────────────────────────────────────┤
                  │ • Gemini 2.5 Flash Socratic AI Engine        │
                  │ • Google Maps & Places Autocomplete API      │
                  │ • Automated Google Meet Dispatch Engine      │
                  │ • Zero-Tolerance Safe Content Moderation     │
                  │ • Real-Time Cross-Panel State Sync (WS)      │
                  └──────────────────────────────────────────────┘
```

---

## 🚀 Features Breakdown

### 1. 🎓 Student Portal & Quick Doubts AI
- **Automatic Grade-Level Syllabus Binding:** Reads the student's profile grade (Grades 6 through 12) upon authentication and dynamically binds subjects, units, and textbook chapters.
- **Grade Override Toggle:** An advanced revision toggle allowing students to browse adjacent grade levels for foundational review or advanced preparation.
- **Indian Education Boards Selector:** Native support for:
  - **National Boards:** CBSE, ICSE, IB, IGCSE.
  - **State Boards:** PSEB (Punjab), GSEB (Gujarat), MSBSHSE (Maharashtra), KSEEB (Karnataka), BSEAP/TOSS (Andhra/Telangana), WBBSE (West Bengal), and Tamil Nadu State Board.
  - Socratic AI retrieval aligns pedagogical explanations with board-specific textbook terminology (e.g., NCERT standards for CBSE).
- **Multilingual Regional Medium Support:** Fluid interaction across **10 languages**:
  - English (`en`), Hindi (`hi`), Punjabi (`pa`), Marathi (`mr`), Bengali (`bn`), Tamil (`ta`), Telugu (`te`), Gujarati (`gu`), Kannada (`kn`), and Malayalam (`ml`).
- **Socratic Pedagogical Guardrails:** Employs intuitive step-by-step analogies, formulas, and check-in questions rather than passive spoonfeeding.

### 2. 🔐 Multi-Auth Onboarding & Smart School Geocoding
- **Flexible Authentication:** Email & password with one-click social/enterprise single sign-on (SSO) via **Google**, **Outlook**, and **Apple**.
- **Guardian Contact Mapping:** Collects student details alongside parent/guardian emergency contact numbers and emails.
- **Google Maps & Places Institutional Integration:**
  - Integrated with `@vis.gl/react-google-maps`.
  - As students type their school name, Google Places Autocomplete suggests verified institutions.
  - Automatically captures and records institution name, formatted address, and latitude/longitude coordinates into the central school registry (`/api/schools`).
  - Interactive map preview with pin placement and satellite/terrain toggle.
- **Academic Profiling:**
  - Grade selector (Grades 6–12).
  - Stream selector for Grades 11 and 12: *Science (PCM/PCB)*, *Commerce*, or *Arts & Humanities*.

### 3. 📊 Agile Study Planner (3-Sheet Spreadsheet Engine)
- **Sheet 1: Daily Agile Planner:**
  - Generates day-by-day task schedules.
  - Guarantees daily non-negotiable core discipline allocation (e.g., *1.5 hours of Mathematics* daily).
  - Rotates supplementary sprint subjects (Physics, Chemistry, History, English, CS).
- **Sheet 2: Weekly Sprint Board:**
  - Breaks study milestones into targeted 7-day iterations.
  - Visual tracking of core vs. elective hours, sprint completion percentages, and milestone targets.
- **Sheet 3: Chapter Tracker:**
  - Complete master syllabus roadmap detailing estimated completion hours and target dates.
  - Status indicators (`Scheduled`, `In Progress`, `Completed`).
  - 1-click **CSV Spreadsheet Export** for offline tracking and spreadsheet software compatibility (Google Sheets / Excel).

### 4. 📹 Live Student Monitoring & Instant Google Meet Dispatch
- **3 Recipient Targeting Tiers:**
  1. **Individual Student:** 1-on-1 Socratic doubt resolution following flagged anomalies or academic support requests.
  2. **Selected Cohort / Grade:** Target entire grade sections (e.g., *Grade 8 Science Sprint*).
  3. **All Students:** School-wide broadcasts, guest lectures, or proctoring briefings.
- **Automated Google Meet Generation:**
  - Instant background generation of secure Google Meet links (`https://meet.google.com/xxx-yyyy-zzz`).
- **Multi-Channel Dispatch:**
  - High-priority modal popup alert appears immediately on targeted student dashboards with a direct **"Join Meeting"** CTA button.
  - Real-time WebSocket event dispatch across connected clients.
  - Automated transactional email notification dispatched to registered student addresses.

### 5. 💬 Student-Teacher Community Doubt Forum
- **Peer & Faculty Collaboration:** Students ask questions tagged by grade and subject; fellow students and teachers answer.
- **Teacher Verification:** Verified badge and highlighted solutions when an educator approves a resolution.
- **Zero-Tolerance Safe Moderation Engine:**
  - Real-time heuristic and pattern-matching filter for abusive content and profanity.
  - Automatic and immediate account lockout upon detection of violations.
  - High-priority security audit dispatch to the administrative proctoring activity log.

### 6. 👩‍🏫 Teacher Curriculum Studio & AI Assistant
- **AI Lesson Plan Generator:** Configurable by topic, grade level, and pedagogical methodology (Interactive, Inquiry-Based, Direct Instruction). Produces structured warmup drills, timed core activities, teacher guides, checkpoints, and homework challenges.
- **AI Assessment & Quiz Generator:** Generates multi-question MCQs with distractor explanations and answer keys.
- **Live Doubt Inbox:** Triage incoming student queries with 1-click Socratic draft generation or Google Meet escalation.

### 7. 🛡️ Admin Hub & Real-Time Proctoring Center
- **Dedicated Curriculum Studio:** Full CRUD management over institutional curriculum subjects and units for Grades 6 through 12, featuring category tagging and active/inactive switches.
- **Real-Time WebSocket Synchronization:** Instant live broadcast of curriculum modifications (`CURRICULUM_UPDATED`) to all connected student viewports without page refreshes.
- **Proctoring Anomaly Matrix:**
  - Multi-feed proctoring grid with simulated live video streams.
  - Anomaly detection triggers: **Head Rotation**, **Multiple Faces Detected**, **Off-Screen Gaze**, and **Audio Spike**.
  - Sensitivity controls, confidence scoring, and immutable audit logs.
- **User Management & Role-Based Access Control (RBAC):** Manage student, teacher, and administrator privileges.

### 8. 📜 Digital Verifiable Certificates
- Automated issuance upon course or milestone completion.
- Cryptographic SHA-256 verification hash and unique credential IDs.
- In-app credential verification modal with verified status seals and skill tags.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19 (SPA), TypeScript, Vite 6 |
| **Styling & Icons** | Tailwind CSS v4, Lucide React, Motion |
| **AI & LLM Services** | `@google/genai` (Gemini 2.5 Flash / Gemini 3.8 Flash) |
| **Maps & Geolocation** | `@vis.gl/react-google-maps` (Google Maps Platform, Places Autocomplete) |
| **Server & Realtime** | Express.js 4.x, WebSocket (`ws`), Node.js (via `tsx`) |
| **Animation & Effects** | `canvas-confetti`, `motion` |

---

## 📂 Project Structure

```
├── .env.example              # Sample environment configuration
├── index.html                # Main HTML entrypoint with OpenGraph tags
├── metadata.json             # AI Studio applet capabilities & metadata
├── package.json              # Project dependencies & npm scripts
├── server.ts                 # Full-stack Express server, WebSocket hub & Gemini endpoints
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite bundler configuration
└── src/
    ├── App.tsx               # Root component, theme & Google Maps APIProvider
    ├── index.css             # Tailwind CSS imports & global styles
    ├── main.tsx              # React DOM initialization
    ├── context/
    │   ├── AppContext.tsx    # Global state (auth, curriculum, meetings, study planner)
    │   └── ThemeContext.tsx  # Dark / Light theme provider
    ├── types/
    │   └── index.ts          # Complete TypeScript models, boards, mediums, and schemas
    ├── data/
    │   └── mockData.ts       # Seed curriculum, questions, and demo profiles
    ├── utils/
    │   └── imageUtils.ts     # Avatar compression & image processing helpers
    └── components/
        ├── Auth/
        │   └── UnifiedLogin.tsx       # Multi-auth login & Google Maps school onboarding
        ├── StudentView/
        │   └── StudentView.tsx        # Student Portal: Doubts, Planner, Meets & Community
        ├── TeacherView/
        │   ├── TeacherView.tsx        # Teacher Studio, live doubts, lesson planning
        │   └── LiveMeetModal.tsx      # Google Meet session launcher & cohort selector
        ├── AdminView/
        │   └── AdminView.tsx          # Curriculum management (CRUD) & Proctoring Matrix
        ├── UserProfile/
        │   └── UserProfileModal.tsx   # Profile modal: board, grade, school & guardian edit
        └── common/
            ├── GlobalHeader.tsx       # Navigation bar, role switcher & notification center
            └── SchoolAutocomplete.tsx # Google Places Autocomplete with live map pin preview
```

---

## 🔌 API Endpoints Reference

### 1. Artificial Intelligence & Tutoring
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/tutor/chat` | Multilingual, board-aligned Socratic tutor conversation powered by Gemini. |
| `POST` | `/api/lesson-plan/generate` | Generates comprehensive, structured pedagogical lesson plans. |
| `POST` | `/api/quiz/generate` | Generates topic-specific quizzes with answers and explanations. |

### 2. Institutions & Geocoding (Google Maps)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/schools` | Lists registered schools with query filtering. |
| `POST` | `/api/schools` | Registers a new school with address and latitude/longitude coordinates. |

### 3. Curriculum Management (Admin)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/curriculum/subjects` | Retrieves subjects with optional grade filtering. |
| `POST` | `/api/curriculum/subjects` | Creates a new curriculum subject (triggers WebSocket update). |
| `PUT` | `/api/curriculum/subjects/:id` | Updates an existing subject. |
| `DELETE` | `/api/curriculum/subjects/:id` | Deletes a subject and its associated topics. |
| `GET` | `/api/curriculum/full` | Returns the entire curriculum graph with subjects and unit topics. |
| `POST` | `/api/curriculum/topics` | Creates a unit topic nested under a subject. |
| `PUT` | `/api/curriculum/topics/:id` | Updates a unit topic. |
| `DELETE` | `/api/curriculum/topics/:id` | Deletes a unit topic. |

### 4. Live Student Monitoring & Google Meet
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/meetings` | Lists all active and scheduled live meetings. |
| `POST` | `/api/meetings/create` | Generates a Google Meet link and broadcasts invitations to students. |
| `PUT` | `/api/meetings/:id/status` | Updates meeting status (`ACTIVE`, `COMPLETED`, `CANCELLED`). |

### 5. Community Forum & Safe Moderation
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/community/posts` | Fetches active community posts by subject/grade. |
| `POST` | `/api/community/posts` | Submits a post (scanned by Zero-Tolerance Moderation). |
| `POST` | `/api/community/posts/:id/comments` | Submits a comment on a post. |
| `POST` | `/api/community/posts/:id/upvote` | Increments upvote count on a post. |
| `POST` | `/api/community/posts/:id/verify` | Verified educator solution marker. |

### 6. Agile Study Planner
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/study-planner/generate` | Generates a 3-sheet study plan (Daily Agile, Weekly Sprint, Chapter Roadmap). |

---

## ⚡ Getting Started & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/educate-ai-agent-platform.git
cd educate-ai-agent-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```bash
cp .env.example .env
```

Set the following variables:
```env
# Required for Gemini AI Socratic tutoring, lesson planning, and quiz generation
GEMINI_API_KEY="your_google_gemini_api_key_here"

# Required for Google Maps and Places Autocomplete school mapping
VITE_GOOGLE_MAPS_API_KEY="your_google_maps_platform_api_key_here"

# Optional: Host URL
APP_URL="http://localhost:3000"
```

> **Note:** The platform includes graceful fallback mechanisms. If the Gemini API key or Google Maps API key is not supplied, the app provides rich deterministic mock responses and local geocoding lookups.

### 4. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
npm run start
```

### 6. Linting & Type Checking
```bash
npm run lint
```

---

## 👥 User Roles & Demo Credentials

| Role | Default Name | Primary Focus |
|---|---|---|
| **Student** | Sarah Connor | Quick Doubts AI, Grade 8/10 Syllabus, Agile Study Planner, Live Meets |
| **Teacher** | Ms. Elena Rostova | Curriculum Studio, Lesson Plan Generator, Quiz Maker, Google Meet Dispatch |
| **Admin** | Super Admin | Curriculum Master CRUD, Proctoring Anomaly Matrix, Security Log |

*You can seamlessly switch between roles at any time using the role selector pill in the top navigation header.*

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
