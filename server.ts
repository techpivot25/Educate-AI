import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { setGlobalDispatcher, Agent } from 'undici';
import { DEFAULT_SUBJECTS_DB, DEFAULT_TOPICS_DB } from './src/data/curriculumData';
import {
  detectFoulLanguage,
  detectStressOrMedicalQuery,
  STRICT_PARENT_DOCTOR_ONLY_RESPONSE,
} from './src/utils/safetyGuard';

dotenv.config();

// Configure undici dispatcher with extended headersTimeout to prevent HeadersTimeoutError
try {
  setGlobalDispatcher(
    new Agent({
      headersTimeout: 120_000,
      bodyTimeout: 120_000,
      connectTimeout: 30_000,
      keepAliveTimeout: 30_000,
    })
  );
} catch (e) {
  console.warn('Could not set undici dispatcher:', e);
}

const app = express();
app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI client with telemetry user-agent header and request timeout
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
    timeout: 60_000,
  },
});

// Database schema models
export interface DBSubject {
  id: string;
  name: string;
  grade_level: number; // 6 - 12
  board?: string;
  category?: 'STEM' | 'Language Arts' | 'Humanities' | 'Arts & Electives';
  code?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface DBTopic {
  id: string;
  subject_id: string;
  title: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

// In-memory Database Store for Schools / Institutions
interface DBSchool {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  created_at: string;
}

let schoolsDB: DBSchool[] = [
  {
    id: 'school-1',
    name: 'D.A.V. Public School, Sector 8',
    address: 'Sector 8-C, Chandigarh, 160018, Punjab & Haryana, India',
    lat: 30.7398,
    lng: 76.7827,
    created_at: '2026-01-01',
  },
  {
    id: 'school-2',
    name: 'Delhi Public School, R.K. Puram',
    address: 'Kaifi Azmi Marg, Sector XII, R.K. Puram, New Delhi, 110022, India',
    lat: 28.5684,
    lng: 77.1772,
    created_at: '2026-01-01',
  },
  {
    id: 'school-3',
    name: 'The Cathedral and John Connon School',
    address: '6, Purshottamdas Thakurdas Marg, Fort, Mumbai, 400001, Maharashtra, India',
    lat: 18.9348,
    lng: 72.8335,
    created_at: '2026-01-02',
  },
  {
    id: 'school-4',
    name: 'National Public School, Indiranagar',
    address: '12th A Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, 560008, Karnataka, India',
    lat: 12.9719,
    lng: 77.6412,
    created_at: '2026-01-05',
  },
  {
    id: 'school-5',
    name: "St. Xavier's Collegiate School",
    address: '30, Mother Teresa Sarani, Mullick Bazar, Park Street area, Kolkata, 700016, West Bengal, India',
    lat: 22.5497,
    lng: 88.3571,
    created_at: '2026-01-05',
  },
  {
    id: 'school-6',
    name: 'Hyderabad Public School, Begumpet',
    address: '1-11-87 & 88, S.P. Road, Begumpet, Hyderabad, 500016, Telangana, India',
    lat: 17.4435,
    lng: 78.4716,
    created_at: '2026-01-06',
  },
  {
    id: 'school-7',
    name: 'Chettinad Vidyashram',
    address: 'Raja Annamalaipuram, Chennai, 600028, Tamil Nadu, India',
    lat: 13.0189,
    lng: 80.2586,
    created_at: '2026-01-08',
  },
];

// In-memory Database Store seeded with full Grades 6-12 Curriculum across all 11 Education Boards
let subjectsDB: DBSubject[] = [...DEFAULT_SUBJECTS_DB];
let topicsDB: DBTopic[] = [...DEFAULT_TOPICS_DB];

// WebSocket Server & Connected Clients for Real-Time Synchronization
let wss: WebSocketServer | null = null;
const connectedClients = new Set<WebSocket>();

function broadcastCurriculumUpdate(eventType: 'CURRICULUM_UPDATED', payload: any) {
  const message = JSON.stringify({
    type: eventType,
    payload,
    timestamp: new Date().toISOString(),
  });
  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error('Failed to send WS message:', err);
      }
    }
  });
}

// In-memory unified event store for cross-panel state synchronization
interface SystemEvent {
  id: string;
  timestamp: string;
  source: 'student' | 'teacher' | 'admin' | 'system';
  type: 'doubt_asked' | 'doubt_resolved' | 'quiz_published' | 'quiz_completed' | 'anomaly_detected' | 'certificate_issued' | 'curriculum_updated';
  data: any;
}

const eventLog: SystemEvent[] = [
  {
    id: 'evt-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(),
    source: 'admin',
    type: 'anomaly_detected',
    data: { studentId: 'stu-2', studentName: 'Student 2 (Alex Rivera)', detectionType: 'Head Rotation', status: 'Active' },
  },
  {
    id: 'evt-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toLocaleTimeString(),
    source: 'admin',
    type: 'anomaly_detected',
    data: { studentId: 'stu-6', studentName: 'Student 6 (Daniel Vance)', detectionType: 'Multiple Faces Detected', status: 'Detected' },
  },
  {
    id: 'evt-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 50).toLocaleTimeString(),
    source: 'teacher',
    type: 'quiz_published',
    data: { title: 'Plant Cells & Photosynthesis 10-Q Assessment', grade: '7th Grade', teacher: 'Ms. Elena Rostova' },
  },
];

// --- 1. AI Tutor Conversational Endpoint ---
app.post('/api/tutor/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      history = [],
      subject = 'Physics',
      topic = "Newton's Laws",
      student_grade = '8th Grade',
      board = 'CBSE',
      medium = 'en',
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const languageNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिंदी)',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      mr: 'Marathi (मराठी)',
      bn: 'Bengali (বাংলা)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      gu: 'Gujarati (ગુજરાતી)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ml: 'Malayalam (മലയാളം)',
    };
    const targetLanguage = languageNames[medium] || medium || 'English';

    const getFallbackReply = () => {
      let reply = "That's a fantastic question! Newton's 3rd Law states: For every action, there is an equal and opposite reaction. Think of swimming: when your arms push the water backward (action), the water pushes you forward (reaction)! What other examples can you think of?";
      const lower = message.toLowerCase();
      if (medium === 'hi') {
        reply = "यह एक बेहतरीन सवाल है! न्यूटन का तीसरा नियम कहता है: हर क्रिया के बराबर और विपरीत प्रतिक्रिया होती है। जैसे जब आप तैरते समय पानी को पीछे धकेलते हैं, तो पानी आपको आगे बढ़ाता है!";
      } else if (medium === 'pa') {
        reply = "ਇਹ ਬਹੁਤ ਵਧੀਆ ਸਵਾਲ ਹੈ! ਨਿਊਟਨ ਦਾ ਤੀਜਾ ਨਿਯਮ ਕਹਿੰਦਾ ਹੈ: ਹਰ ਕਿਰਿਆ ਦੇ ਬਰਾਬਰ ਅਤੇ ਉਲਟ ਪ੍ਰਤੀਕਿਰਿਆ ਹੁੰਦੀ ਹੈ। ਜਿਵੇਂ ਤੈਰਾਕੀ ਵਿੱਚ ਜਦੋਂ ਤੁਸੀਂ ਪਾਣੀ ਨੂੰ ਪਿੱਛੇ ਧੱਕਦੇ ਹੋ, ਤਾਂ ਪਾਣੀ ਤੁਹਾਨੂੰ ਅੱਗੇ ਵਧਾਉਂਦਾ ਹੈ!";
      } else if (lower.includes('first') || lower.includes('1st') || lower.includes('inertia')) {
        reply = "Newton's 1st Law (Inertia): An object remains at rest or in uniform straight-line motion unless acted upon by an external net force. Think of a soccer ball on a field—it won't move until kicked, and in deep space, it would glide forever!";
      } else if (lower.includes('second') || lower.includes('2nd') || lower.includes('f=ma')) {
        reply = "Newton's 2nd Law states: Force = mass × acceleration (F = m · a). Pushing an empty grocery cart accelerates quickly, but pushing a loaded heavy cart with the same force accelerates much slower!";
      } else if (lower.includes('photosynthesis')) {
        reply = "Photosynthesis is nature's solar kitchen! Plants capture sunlight using chlorophyll in chloroplasts, combine it with water (H₂O) from roots and CO₂ from air, and produce Glucose (C₆H₁₂O₆) + Oxygen (O₂). Equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂!";
      } else if (lower.includes('periodic') || lower.includes('element') || lower.includes('atom')) {
        reply = "In the Periodic Table, elements are arranged by ascending atomic number (proton count). Elements in the same vertical column (group) share similar valence electron counts and chemical behaviors!";
      } else if (lower.includes('quad') || lower.includes('parabola') || lower.includes('algebra')) {
        reply = "For quadratic equations in the form ax² + bx + c = 0, the roots are found using x = (-b ± √(b² - 4ac)) / (2a). The discriminant Δ = b² - 4ac tells you whether the roots are real and distinct (Δ > 0), equal (Δ = 0), or complex (Δ < 0)!";
      }
      return reply;
    };

    if (process.env.GEMINI_API_KEY) {
      const promptHistory = history.slice(-6).map((h: any) => `${h.role === 'user' ? 'Student' : 'AI Tutor'}: ${h.content}`).join('\n');
      const systemInstruction = `You are "Educate AI Tutor", an empathetic, brilliant, pedagogical AI companion for students in the Educate AI Agent platform.
Target Context:
- Student Grade: ${student_grade}
- Education Board: ${board} (Align curriculum nuances and standard textbook conventions with this board)
- Response Language / Medium: ${targetLanguage}
- Subject: ${subject}
- Current Topic: ${topic}

Style & Pedagogical Rules:
- When a student asks in their regional language or selects medium "${targetLanguage}", respond fluently in ${targetLanguage} while retaining recognized scientific/mathematical terminology where appropriate.
- Keep answers focused, engaging, and clear (max 3-4 concise paragraphs or bullet points).
- Use the Socratic method: explain with intuitive analogies and step-by-step logic, guiding the learner to insight rather than blunt spoonfeeding.
- Conclude with a quick, supportive check question to test the student's understanding.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `${promptHistory ? `Previous conversation:\n${promptHistory}\n\n` : ''}Student: ${message}\n\nPlease respond as the AI Tutor.`,
          config: {
            systemInstruction,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });

        const reply = response.text || "I'm here to help you master this concept! Let's break it down step-by-step.";
        return res.json({ reply });
      } catch (geminiError: any) {
        console.warn('Gemini generateContent notice in /api/tutor/chat:', geminiError?.message || geminiError);
        return res.json({
          reply: getFallbackReply(),
          fallback: true,
        });
      }
    } else {
      return res.json({ reply: getFallbackReply() });
    }
  } catch (error: any) {
    console.error('Error in /api/tutor/chat handler:', error);
    return res.json({
      reply: "Newton's 3rd Law states: For every action, there is an equal and opposite reaction. Think of swimming: when you push water backward, it pushes you forward!",
      fallback: true,
    });
  }
});

// --- 2. Interactive Doubt Solver (Multi-Turn SSE Streaming, Safety Guardrails & Guardian Reporting) ---
interface GuardianIncidentRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  grade?: string | number;
  board?: string;
  subject: string;
  topic?: string;
  violationType: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  screenshotBase64: string;
  capturedAt: string;
  whatsappDispatched: boolean;
  emailDispatched: boolean;
}

const guardianIncidentsDB: GuardianIncidentRecord[] = [];

app.get('/api/safety/incidents/:id/screenshot.png', (req: Request, res: Response) => {
  const { id } = req.params;
  const record = guardianIncidentsDB.find((r) => r.id === id);
  if (!record || !record.screenshotBase64) {
    return res.status(404).send('Screenshot not found');
  }
  const base64Body = record.screenshotBase64.replace(/^data:image\/\w+;base64,/, '');
  const imgBuffer = Buffer.from(base64Body, 'base64');
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `inline; filename="incident-${id}.png"`);
  return res.send(imgBuffer);
});

app.post('/api/safety/report-guardian', async (req: Request, res: Response) => {
  try {
    const {
      studentId = 'stu-1',
      studentName = 'Student',
      studentEmail = '',
      grade = '8',
      board = 'CBSE',
      subject = 'General',
      topic = '',
      violationType = 'FOUL_LANGUAGE',
      guardianName = 'Parent / Guardian',
      guardianPhone = '+91 98765 11223',
      guardianEmail = 'david.c@guardian.org',
      screenshotBase64 = '',
      capturedAt,
    } = req.body || {};

    const incidentId = `grd-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = capturedAt || new Date().toLocaleString();

    const record: GuardianIncidentRecord = {
      id: incidentId,
      studentId: String(studentId),
      studentName: String(studentName),
      studentEmail: String(studentEmail),
      grade,
      board,
      subject: String(subject),
      topic: String(topic),
      violationType: String(violationType),
      guardianName: String(guardianName),
      guardianPhone: String(guardianPhone),
      guardianEmail: String(guardianEmail),
      screenshotBase64: String(screenshotBase64),
      capturedAt: timestamp,
      whatsappDispatched: true,
      emailDispatched: true,
    };

    guardianIncidentsDB.unshift(record);
    if (guardianIncidentsDB.length > 50) guardianIncidentsDB.pop();

    const cleanPhoneDigits = String(guardianPhone).replace(/[^\d]/g, '') || '919876511223';
    const screenshotUrl = `/api/safety/incidents/${incidentId}/screenshot.png`;
    const alertSummary =
      `[PivotIQ Safety Alert] Urgent notice for ${guardianName}: Foul or inappropriate language was detected in ${studentName}'s (Grade ${grade}, ${board}) Quick Doubts AI Assistant session (${subject}${topic ? ` - ${topic}` : ''}) at ${timestamp}. The AI Assistant immediately blocked the message and did not reply. Captured screenshot evidence ID: ${incidentId}.`;

    const whatsappUrl = `https://wa.me/${cleanPhoneDigits}?text=${encodeURIComponent(alertSummary)}`;
    const emailSubject = `[Urgent Safety Alert] Conduct Guardrail Triggered — ${studentName} (${incidentId})`;
    const emailBody = `${alertSummary}\n\nScreenshot Attachment: incident-${incidentId}.png\nIncident Reference: ${incidentId}\nTimestamp: ${timestamp}`;
    const emailUrl = `mailto:${encodeURIComponent(String(guardianEmail))}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Optional real external webhook integration if configured via environment variables
    if (process.env.WHATSAPP_WEBHOOK_URL) {
      fetch(process.env.WHATSAPP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: guardianPhone,
          message: alertSummary,
          screenshotBase64,
          incidentId,
        }),
      }).catch(() => {});
    }
    if (process.env.EMAIL_WEBHOOK_URL) {
      fetch(process.env.EMAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: guardianEmail,
          subject: emailSubject,
          body: emailBody,
          attachments: screenshotBase64
            ? [{ filename: `incident-${incidentId}.png`, content: screenshotBase64 }]
            : [],
        }),
      }).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      incident: {
        id: incidentId,
        guardianName: record.guardianName,
        guardianPhone: record.guardianPhone,
        guardianEmail: record.guardianEmail,
        timestamp,
        whatsappDispatched: true,
        emailDispatched: true,
        whatsappUrl,
        emailUrl,
        screenshotUrl,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/safety/report-guardian:', err);
    return res.status(500).json({ error: err?.message || 'Failed to dispatch guardian report.' });
  }
});

const DOUBT_LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  mr: 'Marathi (मराठी)',
  bn: 'Bengali (বাংলা)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  gu: 'Gujarati (ગુજરાતી)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
};

function buildQuickDoubtPrompts(params: {
  question: string;
  history?: Array<{ sender: 'student' | 'ai'; text: string }>;
  subject?: string;
  topic?: string;
  student_grade?: string | number;
  board?: string;
  medium?: string;
}) {
  const {
    question,
    history = [],
    subject = 'General Science',
    topic = '',
    student_grade = '8',
    board = 'CBSE',
    medium = 'en',
  } = params;
  const targetLanguage = DOUBT_LANGUAGE_NAMES[medium] || medium || 'English';
  const gradeLabel = String(student_grade).toLowerCase().includes('grade')
    ? String(student_grade)
    : `Grade ${student_grade}`;

  const systemInstruction = `You are "Quick Doubts AI Assistant", an interactive real-time academic AI tutor for students inside the Student Portal.
Critical Rules:
1. Respond directly and interactively to the student in ${targetLanguage}, maintaining continuity across follow-up messages.
2. Tailor depth, terminology, and syllabus expectations to ${gradeLabel} under the ${board} curriculum.
3. STRICT CONDUCT GUARDRAIL: If any message contains foul language, profanity, or abusive words, NEVER repeat, discuss, acknowledge, or reply to it—refuse immediately.
4. STRICT HEALTH & STRESS GUARDRAIL: NEVER suggest, name, or recommend any medicines, tablets, drugs, supplements, home remedies, or medical support/treatments for stress, anxiety, mental health, or physical symptoms. If asked about stress, emotional distress, or medical issues, ONLY advise the student to talk to their parents/guardians and consult a qualified medical practitioner.
5. For valid academic queries, ALWAYS format every reply clearly into these exact two Markdown sections:
### Resolution
- Give the direct, intuitive answer and step-by-step worked explanation (equations, formulas, clear examples, or answer to the student's follow-up).
### Further Learning
- Provide 2-3 concise, inviting bullet points for deeper exploration (e.g., related practice challenges, next connected concept, or follow-up questions the student can ask you right now in this interactive chat).
6. Never tell the student to submit doubts to a teacher—keep this an engaging 1-on-1 AI learning conversation.`;

  const historyBlock =
    Array.isArray(history) && history.length > 0
      ? `\nConversation History So Far:\n${history
          .slice(-8)
          .map((turn) => `${turn.sender === 'student' ? 'Student' : 'AI Assistant'}: ${turn.text}`)
          .join('\n')}\n`
      : '';

  const userPrompt = `Subject: ${subject}${topic ? ` (${topic})` : ''}
Grade & Board: ${gradeLabel} (${board})
Language Medium: ${targetLanguage}
${historyBlock}
Latest Student Message:
"${question}"

Respond interactively as the AI Assistant with ### Resolution and ### Further Learning sections.`;

  return { systemInstruction, userPrompt, targetLanguage };
}

// 2A. Real-Time Streaming Endpoint for Quick Doubts AI (SSE)
app.post('/api/tutor/doubt-solve/stream', async (req: Request, res: Response) => {
  const {
    question,
    history = [],
    subject = 'General Science',
    topic = '',
    student_grade = '8',
    board = 'CBSE',
    medium = 'en',
    imageBase64,
    imageMimeType,
  } = req.body || {};

  const trimmedQuestion = String(question || '').trim();
  if (!trimmedQuestion) {
    return res.status(400).json({ error: 'Question is required' });
  }

  // Server-side Guardrail #1: Zero tolerance for foul language — never invoke LLM or reply
  if (detectFoulLanguage(trimmedQuestion).isFoul) {
    return res.status(403).json({
      blocked: true,
      violationType: 'FOUL_LANGUAGE',
      error: 'Policy violation: Abusive or foul language is blocked. The AI Assistant will not respond.',
    });
  }

  // Server-side Guardrail #2: Stress / Medical / Medicines — strictly suggest ONLY parents & medical practitioner
  if (detectStressOrMedicalQuery(trimmedQuestion)) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(
      `data: ${JSON.stringify({
        text: STRICT_PARENT_DOCTOR_ONLY_RESPONSE,
        isWellnessNotice: true,
      })}\n\n`
    );
    res.write(`data: ${JSON.stringify({ done: true, isWellnessNotice: true })}\n\n`);
    return res.end();
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured. Please check your API key in Settings > Secrets.',
    });
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const { systemInstruction, userPrompt } = buildQuickDoubtPrompts({
      question: trimmedQuestion,
      history: Array.isArray(history) ? history : [],
      subject,
      topic,
      student_grade,
      board,
      medium,
    });

    const contents: any =
      imageBase64 && imageMimeType
        ? {
            parts: [
              {
                inlineData: {
                  mimeType: String(imageMimeType),
                  data: String(imageBase64).replace(/^data:[^;]+;base64,/, ''),
                },
              },
              { text: userPrompt },
            ],
          }
        : userPrompt;

    const stream = await ai.models.generateContentStream({
      model: 'gemini-4-hydrogen',
      contents,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    let emittedAny = false;
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        emittedAny = true;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    if (!emittedAny) {
      res.write(`data: ${JSON.stringify({ text: '### Resolution\nI analyzed your question—could you share a little more detail about what step you want clarified?\n\n### Further Learning\n- Share your current attempt so I can walk through it with you step-by-step.' })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  } catch (geminiError: any) {
    console.error('Gemini streaming error in /api/tutor/doubt-solve/stream:', geminiError);
    const rawMsg = geminiError?.message || 'Unable to generate live AI response.';
    const friendlyMsg =
      rawMsg.includes('API_KEY') || rawMsg.includes('PERMISSION_DENIED') || rawMsg.includes('403') || rawMsg.includes('401')
        ? 'Gemini API key error. Please check your GEMINI_API_KEY in Settings > Secrets.'
        : rawMsg;
    res.write(`data: ${JSON.stringify({ error: friendlyMsg })}\n\n`);
    return res.end();
  }
});

// 2B. Non-streaming Doubt Solver endpoint
app.post('/api/tutor/doubt-solve', async (req: Request, res: Response) => {
  try {
    const {
      question,
      history = [],
      subject = 'General Science',
      topic = '',
      student_grade = '8',
      board = 'CBSE',
      medium = 'en',
      imageBase64,
      imageMimeType,
    } = req.body;

    const trimmedQuestion = String(question || '').trim();
    if (!trimmedQuestion) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (detectFoulLanguage(trimmedQuestion).isFoul) {
      return res.status(403).json({
        blocked: true,
        violationType: 'FOUL_LANGUAGE',
        error: 'Policy violation: Abusive or foul language is blocked. The AI Assistant will not respond.',
      });
    }

    if (detectStressOrMedicalQuery(trimmedQuestion)) {
      return res.json({
        solution: STRICT_PARENT_DOCTOR_ONLY_RESPONSE,
        isWellnessNotice: true,
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Please check your API key in Settings > Secrets.',
      });
    }

    const { systemInstruction, userPrompt } = buildQuickDoubtPrompts({
      question: trimmedQuestion,
      history: Array.isArray(history) ? history : [],
      subject,
      topic,
      student_grade,
      board,
      medium,
    });

    const contents: any =
      imageBase64 && imageMimeType
        ? {
            parts: [
              {
                inlineData: {
                  mimeType: String(imageMimeType),
                  data: String(imageBase64).replace(/^data:[^;]+;base64,/, ''),
                },
              },
              { text: userPrompt },
            ],
          }
        : userPrompt;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    return res.json({ solution: response.text || 'Unable to generate an explanation for this question.' });
  } catch (error: any) {
    console.error('Error in /api/tutor/doubt-solve:', error);
    return res.status(500).json({ error: error?.message || 'Failed to resolve doubt via Gemini LLM.' });
  }
});

// --- 3. Teacher: AI Lesson Plan Generator ---
app.post('/api/lesson-plan/generate', async (req: Request, res: Response) => {
  try {
    const { topic = 'Photosynthesis', grade = '7th', style = 'Interactive' } = req.body;

    if (process.env.GEMINI_API_KEY) {
      const prompt = `Generate a high-impact, professional lesson plan for:
Topic: "${topic}"
Grade Level: "${grade}"
Pedagogical Style: "${style}"

Return a valid JSON object with the exact keys:
{
  "topic": "${topic}",
  "grade": "${grade}",
  "style": "${style}",
  "duration": "45 Minutes",
  "learningObjectives": ["string", "string", "string"],
  "warmUpActivity": { "title": "string", "duration": "5 mins", "prompt": "string" },
  "coreActivities": [
    { "name": "string", "duration": "15 mins", "description": "string", "teacherGuide": "string" },
    { "name": "string", "duration": "15 mins", "description": "string", "teacherGuide": "string" }
  ],
  "readingMaterial": "string (concise summary for students)",
  "assessmentCheckpoints": ["string", "string"],
  "homeworkChallenge": "string"
}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      } catch (geminiError: any) {
        console.warn('Gemini generateContent notice in /api/lesson-plan/generate (serving curriculum fallback):', geminiError?.message || geminiError);
      }
    }

    // Deterministic rich fallback (used when API key is missing or call times out)
    return res.json({
        topic,
        grade,
        style,
        duration: '45 Minutes',
        learningObjectives: [
          `Understand the chemical inputs and outputs of ${topic}.`,
          `Analyze the role of light energy conversion and cellular organelle function.`,
          `Relate ${topic} to broader ecosystem energy cycles and global carbon balance.`,
        ],
        warmUpActivity: {
          title: 'The Sunlight Mystery Inquiry',
          duration: '7 mins',
          prompt: 'Show two potted bean plants: one kept under full sunlight, one in a sealed dark closet for 5 days. Ask students to write down 3 observable differences.',
        },
        coreActivities: [
          {
            name: 'Chloroplast Anatomy & Pigment Extraction',
            duration: '18 mins',
            description: 'Hands-on leaf rubbing and digital microscope inspection of stomata guard cells.',
            teacherGuide: 'Guide students to notice how stomata open and close depending on humidity and light.',
          },
          {
            name: 'Interactive Chemical Equation Balancing Game',
            duration: '12 mins',
            description: 'Students rearrange 3D magnetic molecule tokens: 6 CO₂ + 6 H₂O + Photons → C₆H₁₂O₆ + 6 O₂.',
            teacherGuide: 'Emphasize that the oxygen emitted originates from splitting water molecules, not carbon dioxide.',
          },
        ],
        readingMaterial: `${topic} is the biochemical engine supporting nearly all Earth life. Autotrophs capture electromagnetic radiation using chlorophyll-a and b inside thylakoid membranes, producing high-energy adenosine triphosphate (ATP) and NADPH to fuel the Calvin Cycle.`,
        assessmentCheckpoints: [
          'Can students correctly identify the two primary stages (Light-dependent reactions vs. Calvin Cycle)?',
          'Can students explain why leaves appear green under white light spectrum?',
        ],
        homeworkChallenge: `Design a 1-page infographic explaining how aquatic plants conduct ${topic} underwater.`,
      });
  } catch (error: any) {
    console.error('Error in /api/lesson-plan/generate:', error);
    return res.status(500).json({ error: error.message });
  }
});

// --- 4. Teacher: AI Quiz Creator ---
app.post('/api/quiz/generate', async (req: Request, res: Response) => {
  try {
    const { prompt = 'Draft a 10-question MCQ quiz on Plant Cells', count = 5 } = req.body;

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Create an assessment quiz based on this prompt: "${prompt}".
Generate ${count} multiple choice questions.
Return a valid JSON object matching this schema:
{
  "title": "Quiz Title",
  "topic": "Target Topic",
  "questions": [
    {
      "id": "q1",
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Clear explanation of why this answer is correct."
    }
  ]
}`,
          config: {
            responseMimeType: 'application/json',
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      } catch (geminiError: any) {
        console.warn('Gemini generateContent notice in /api/quiz/generate (serving curriculum fallback):', geminiError?.message || geminiError);
      }
    }

    return res.json({
        title: 'Plant Cells & Organelles Mastery Quiz',
        topic: 'Plant Biology & Cellular Function',
        questions: [
          {
            id: 'q1',
            question: 'Which organelle is exclusively found in plant cells and serves as the primary site of photosynthesis?',
            options: ['Mitochondria', 'Chloroplast', 'Endoplasmic Reticulum', 'Ribosome'],
            answerIndex: 1,
            explanation: 'Chloroplasts contain chlorophyll pigments that capture sunlight energy to synthesize sugars.',
          },
          {
            id: 'q2',
            question: 'What structural component provides rigidity and turgor pressure resistance to plant cells?',
            options: ['Cell Membrane', 'Cellulose Cell Wall', 'Nuclear Envelope', 'Centrosome'],
            answerIndex: 1,
            explanation: 'The cell wall is composed of rigid cellulose fibers that prevent osmotic lysis and maintain plant posture.',
          },
          {
            id: 'q3',
            question: 'What is the function of the large central vacuole in mature plant cells?',
            options: ['Synthesizing proteins', 'Storing cellular sap and maintaining hydrostatic pressure', 'Directing DNA transcription', 'Pumping sodium ions'],
            answerIndex: 1,
            explanation: 'The central vacuole stores water, nutrients, and waste while providing structural turgidity to the plant tissue.',
          },
          {
            id: 'q4',
            question: 'Which gas is taken in through leaf stomata for the light-independent reactions of photosynthesis?',
            options: ['Nitrogen (N₂)', 'Carbon Dioxide (CO₂)', 'Helium (He)', 'Ozone (O₃)'],
            answerIndex: 1,
            explanation: 'Stomata open to allow atmospheric CO₂ to diffuse into the mesophyll cells for the Calvin cycle.',
          },
          {
            id: 'q5',
            question: 'How do plant mitochondria differ in primary purpose from chloroplasts?',
            options: ['Mitochondria produce glucose, chloroplasts break it down', 'Mitochondria generate ATP via cellular respiration, chloroplasts generate glucose via sunlight', 'They perform the exact same biochemical reaction', 'Mitochondria only exist in animal cells'],
            answerIndex: 1,
            explanation: 'Plants possess both chloroplasts (for sugar synthesis) and mitochondria (for breaking down sugar into usable cellular ATP).',
          },
        ],
      });
  } catch (error: any) {
    console.error('Error in /api/quiz/generate:', error);
    return res.status(500).json({ error: error.message });
  }
});

// --- 4.5 Institutional Schools Database API (Google Maps Linked) ---
app.get('/api/schools', (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.json({ schools: schoolsDB });
  }
  const query = q.toLowerCase().trim();
  const filtered = schoolsDB.filter(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      s.address.toLowerCase().includes(query)
  );
  res.json({ schools: filtered });
});

app.post('/api/schools', (req: Request, res: Response) => {
  const { name, address, lat, lng } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'School name is required' });
  }

  const trimmedName = name.trim();
  const existing = schoolsDB.find(
    (s) => s.name.toLowerCase().trim() === trimmedName.toLowerCase()
  );

  if (existing) {
    return res.json({ success: true, school: existing, isExisting: true });
  }

  const newSchool: DBSchool = {
    id: `school-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: trimmedName,
    address: address?.trim() || `${trimmedName}, India`,
    lat: Number(lat) || 28.6139,
    lng: Number(lng) || 77.2090,
    created_at: new Date().toISOString().split('T')[0],
  };

  schoolsDB.push(newSchool);
  res.status(201).json({ success: true, school: newSchool, isExisting: false });
});

// --- 5. System Events & Cross-panel Sync API ---
app.get('/api/events', (req: Request, res: Response) => {
  res.json({ events: eventLog });
});

app.post('/api/events', (req: Request, res: Response) => {
  const { source, type, data } = req.body;
  const newEvent: SystemEvent = {
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleTimeString(),
    source: source || 'system',
    type: type || 'anomaly_detected',
    data: data || {},
  };
  eventLog.unshift(newEvent);
  if (eventLog.length > 50) eventLog.pop();
  res.status(201).json({ success: true, event: newEvent });
});

// --- 6. Admin Curriculum Management API (Subjects & Topics CRUD) ---

// Get all subjects (optionally filtered by status or grade)
app.get('/api/curriculum/subjects', (req: Request, res: Response) => {
  const { status, grade, board } = req.query;
  let result = [...subjectsDB];
  if (status) {
    result = result.filter((s) => s.status === status);
  }
  if (grade) {
    result = result.filter((s) => s.grade_level === Number(grade));
  }
  if (board && board !== 'ALL') {
    result = result.filter((s) => !s.board || s.board === 'ALL' || s.board === String(board));
  }
  res.json({ subjects: result });
});

// Create a new subject
app.post('/api/curriculum/subjects', (req: Request, res: Response) => {
  const { name, grade_level, board = 'CBSE', category = 'STEM', code, description, status = 'ACTIVE' } = req.body;
  if (!name || !grade_level) {
    return res.status(400).json({ error: 'Name and grade_level (6-12) are required' });
  }

  const generatedCode = code || `${name.slice(0, 3).toUpperCase()}-${grade_level}01`;
  const newSubject: DBSubject = {
    id: `subj-${Date.now()}`,
    name,
    grade_level: Number(grade_level),
    board: board || 'CBSE',
    category,
    code: generatedCode,
    description: description || `${name} curriculum for Grade ${grade_level} (${board})`,
    status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    created_at: new Date().toISOString().split('T')[0],
  };

  subjectsDB.unshift(newSubject);

  // Broadcast Real-time sync event
  broadcastCurriculumUpdate('CURRICULUM_UPDATED', {
    action: 'SUBJECT_CREATED',
    subject: newSubject,
    subjects: subjectsDB,
    topics: topicsDB,
  });

  // Log system event
  eventLog.unshift({
    id: `evt-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    source: 'admin',
    type: 'curriculum_updated',
    data: { action: 'SUBJECT_CREATED', subjectName: newSubject.name, grade: newSubject.grade_level, board: newSubject.board },
  });

  res.status(201).json({ success: true, subject: newSubject });
});

// Update an existing subject
app.put('/api/curriculum/subjects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, grade_level, board, category, code, description, status } = req.body;
  const index = subjectsDB.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  const existing = subjectsDB[index];
  const updated: DBSubject = {
    ...existing,
    name: name !== undefined ? name : existing.name,
    grade_level: grade_level !== undefined ? Number(grade_level) : existing.grade_level,
    board: board !== undefined ? board : existing.board,
    category: category !== undefined ? category : existing.category,
    code: code !== undefined ? code : existing.code,
    description: description !== undefined ? description : existing.description,
    status: status !== undefined ? status : existing.status,
  };

  subjectsDB[index] = updated;

  // Broadcast Real-time sync event
  broadcastCurriculumUpdate('CURRICULUM_UPDATED', {
    action: 'SUBJECT_UPDATED',
    subject: updated,
    subjects: subjectsDB,
    topics: topicsDB,
  });

  res.json({ success: true, subject: updated });
});

// Delete a subject
app.delete('/api/curriculum/subjects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  subjectsDB = subjectsDB.filter((s) => s.id !== id);
  // Also clean topics under it
  topicsDB = topicsDB.filter((t) => t.subject_id !== id);

  broadcastCurriculumUpdate('CURRICULUM_UPDATED', {
    action: 'SUBJECT_DELETED',
    subjectId: id,
    subjects: subjectsDB,
    topics: topicsDB,
  });

  res.json({ success: true, message: 'Subject deleted successfully' });
});

// Get topics (optionally by subject_id)
app.get('/api/curriculum/topics', (req: Request, res: Response) => {
  const { subject_id, status } = req.query;
  let result = [...topicsDB];
  if (subject_id) {
    result = result.filter((t) => t.subject_id === subject_id);
  }
  if (status) {
    result = result.filter((t) => t.status === status);
  }
  res.json({ topics: result });
});

// Create a new topic
app.post('/api/curriculum/topics', (req: Request, res: Response) => {
  const { subject_id, title, description, status = 'ACTIVE' } = req.body;
  if (!subject_id || !title) {
    return res.status(400).json({ error: 'subject_id and title are required' });
  }

  const newTopic: DBTopic = {
    id: `top-${Date.now()}`,
    subject_id,
    title,
    description: description || `Unit topic on ${title}`,
    status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    created_at: new Date().toISOString().split('T')[0],
  };

  topicsDB.push(newTopic);

  const matchedSubject = subjectsDB.find((s) => s.id === subject_id);

  // Broadcast Real-time sync event
  broadcastCurriculumUpdate('CURRICULUM_UPDATED', {
    action: 'TOPIC_CREATED',
    topic: newTopic,
    subjectName: matchedSubject?.name,
    subjects: subjectsDB,
    topics: topicsDB,
  });

  eventLog.unshift({
    id: `evt-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    source: 'admin',
    type: 'curriculum_updated',
    data: { action: 'TOPIC_CREATED', topicTitle: newTopic.title, subjectName: matchedSubject?.name },
  });

  res.status(201).json({ success: true, topic: newTopic });
});

// Update a topic
app.put('/api/curriculum/topics/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, status, subject_id } = req.body;
  const index = topicsDB.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Topic not found' });
  }

  const existing = topicsDB[index];
  const updated: DBTopic = {
    ...existing,
    title: title !== undefined ? title : existing.title,
    description: description !== undefined ? description : existing.description,
    status: status !== undefined ? status : existing.status,
    subject_id: subject_id !== undefined ? subject_id : existing.subject_id,
  };

  topicsDB[index] = updated;

  broadcastCurriculumUpdate('CURRICULUM_UPDATED', {
    action: 'TOPIC_UPDATED',
    topic: updated,
    subjects: subjectsDB,
    topics: topicsDB,
  });

  res.json({ success: true, topic: updated });
});

// Delete a topic
app.delete('/api/curriculum/topics/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  topicsDB = topicsDB.filter((t) => t.id !== id);

  broadcastCurriculumUpdate('CURRICULUM_UPDATED', {
    action: 'TOPIC_DELETED',
    topicId: id,
    subjects: subjectsDB,
    topics: topicsDB,
  });

  res.json({ success: true, message: 'Topic deleted successfully' });
});

// Consolidated full curriculum data endpoint (subjects with their topics)
app.get('/api/curriculum/full', (_req: Request, res: Response) => {
  const data = subjectsDB.map((s) => ({
    ...s,
    topics: topicsDB.filter((t) => t.subject_id === s.id),
  }));
  res.json({ curriculum: data, subjects: subjectsDB, topics: topicsDB });
});

// --- 7. Live Student Monitoring & Google Meet Integration API ---
interface DBMeetingInvite {
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

function generateGoogleMeetCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const randSegment = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${randSegment(3)}-${randSegment(4)}-${randSegment(3)}`;
}

let meetingInvitesDB: DBMeetingInvite[] = [
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
    title: 'Grade 8 Science Sprint: Cell Organelles & Energy Synthesis',
    meet_link: 'https://meet.google.com/asd-fghj-klz',
    target_type: 'COHORT',
    target_ids: ['8', 'Grade 8', '8th Grade'],
    scheduled_time: 'Today, 04:30 PM IST',
    status: 'ACTIVE',
    agenda: 'Interactive cohort review session for upcoming CBSE midterm assessment.',
    duration_mins: 45,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    dispatched_emails: ['sarah.c@educateai.org', 'liam.c@educateai.org', 'zoe.w@educateai.org'],
  },
];

// Get all meetings
app.get('/api/meetings', (_req: Request, res: Response) => {
  res.json({ meetings: meetingInvitesDB });
});

// Create and dispatch new Google Meet invite
app.post('/api/meetings/create', (req: Request, res: Response) => {
  const {
    host_id,
    host_name,
    title,
    target_type,
    target_ids = [],
    scheduled_time,
    agenda,
    duration_mins,
    student_emails = [],
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Session title is required' });
  }

  const meet_link = generateGoogleMeetCode();
  const newInvite: DBMeetingInvite = {
    id: `meet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    host_id: host_id || 'teacher',
    host_name: host_name || 'Educator',
    title,
    meet_link,
    target_type: target_type || 'ALL',
    target_ids: Array.isArray(target_ids) ? target_ids : [target_ids],
    scheduled_time: scheduled_time || 'Immediate Live Session',
    status: 'ACTIVE',
    agenda: agenda || 'Live interactive academic intervention and doubt resolution.',
    duration_mins: Number(duration_mins) || 30,
    created_at: new Date().toISOString(),
    dispatched_emails: student_emails.length > 0 ? student_emails : ['student@educateai.org'],
  };

  meetingInvitesDB.unshift(newInvite);

  // Broadcast WebSocket event to all connected students and teachers
  const wsPayload = JSON.stringify({
    type: 'NEW_MEETING_INVITE',
    payload: newInvite,
    timestamp: new Date().toISOString(),
  });
  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(wsPayload);
      } catch (err) {
        console.error('Failed to broadcast meeting invite:', err);
      }
    }
  });

  // Log to system events
  eventLog.unshift({
    id: `evt-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    source: 'teacher',
    type: 'curriculum_updated',
    data: {
      action: 'LIVE_MEET_DISPATCHED',
      meetId: newInvite.id,
      title: newInvite.title,
      meetLink: newInvite.meet_link,
      targetType: newInvite.target_type,
    },
  });

  res.status(201).json({ success: true, invite: newInvite });
});

// Update meeting status
app.put('/api/meetings/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const match = meetingInvitesDB.find((m) => m.id === id);
  if (!match) {
    return res.status(404).json({ error: 'Meeting not found' });
  }
  match.status = status;
  res.json({ success: true, invite: match });
});

// --- 8. Student-Teacher Community Doubt Forum & Automated AI Moderation API ---
const TOXIC_PATTERNS = [
  /fuck/i,
  /shit/i,
  /bitch/i,
  /asshole/i,
  /bastard/i,
  /idiot/i,
  /stupid/i,
  /retard/i,
  /moron/i,
  /crap/i,
  /kill\s+yourself/i,
  /hate\s+you/i,
  /chutiya/i,
  /harami/i,
  /saala/i,
  /bakwaas/i,
];

const suspendedUsers = new Set<string>();

interface DBCommunityComment {
  id: string;
  author_id: string;
  author_name: string;
  author_role: 'student' | 'teacher' | 'admin';
  author_avatar?: string;
  author_badge?: string;
  content: string;
  created_at: string;
  upvotes: number;
  is_teacher_verified?: boolean;
  is_accepted?: boolean;
  is_flagged?: boolean;
}

interface DBCommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_role: 'student' | 'teacher' | 'admin';
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
  comments: DBCommunityComment[];
  status: 'ACTIVE' | 'FLAGGED_BLOCKED';
}

let communityPostsDB: DBCommunityPost[] = [
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
    comments_count: 3,
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
        content: 'That makes total sense! The change of variable t = h/x was the missing step for me.',
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
    comments_count: 2,
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
    comments_count: 4,
    is_verified: false,
    comments: [],
    status: 'ACTIVE',
  },
];

// Helper: Check for toxicity / foul language
function detectProfanity(text: string): boolean {
  if (!text) return false;
  return TOXIC_PATTERNS.some((pattern) => pattern.test(text));
}

// Get community posts
app.get('/api/community/posts', (req: Request, res: Response) => {
  const { subject, grade } = req.query;
  let posts = communityPostsDB.filter((p) => p.status === 'ACTIVE');
  if (subject && subject !== 'All') {
    posts = posts.filter((p) => p.subject.toLowerCase() === String(subject).toLowerCase());
  }
  if (grade) {
    posts = posts.filter((p) => p.grade_level === Number(grade));
  }
  res.json({ posts });
});

// Create community post with Zero-Tolerance Moderation
app.post('/api/community/posts', (req: Request, res: Response) => {
  const {
    author_id,
    author_name,
    author_role,
    author_avatar,
    title,
    content,
    attempted_solution,
    attachment_preview,
    space,
    subject,
    chapter_unit,
    grade_level,
    topic,
    is_high_priority,
    tags = [],
  } = req.body;

  if (suspendedUsers.has(author_id)) {
    return res.status(403).json({
      error: 'ACCOUNT_SUSPENDED',
      message: 'Your account has been suspended due to violation of the Zero-Tolerance Safe Community Policy.',
    });
  }

  // Check title, content, and attempted solution for foul language / toxicity
  const isToxic = detectProfanity(title) || detectProfanity(content) || detectProfanity(attempted_solution);

  if (isToxic) {
    suspendedUsers.add(author_id);

    eventLog.unshift({
      id: `evt-mod-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      source: 'admin',
      type: 'anomaly_detected',
      data: {
        violation: 'ZERO_TOLERANCE_FOUL_LANGUAGE',
        userId: author_id,
        userName: author_name,
        userRole: author_role,
        flaggedContent: `${title} | ${content}`.slice(0, 100),
        actionTaken: 'ACCOUNT_AUTOMATICALLY_BLOCKED',
      },
    });

    return res.status(403).json({
      error: 'ACCOUNT_SUSPENDED_POLICY_VIOLATION',
      message: 'Zero-tolerance policy violation detected (foul language / abusive content). Your account has been automatically suspended and reported to institutional administrators.',
    });
  }

  const newPost: DBCommunityPost = {
    id: `post-${Date.now()}`,
    author_id: author_id || 'anonymous',
    author_name: author_name || 'Student',
    author_role: author_role || 'student',
    author_avatar,
    author_points: 100,
    title,
    content,
    attempted_solution,
    attachment_preview,
    space: space === 'assignment-exam' ? 'assignment-exam' : 'subject-doubts',
    subject: subject || 'General',
    chapter_unit: chapter_unit || topic || '',
    grade_level: Number(grade_level) || 10,
    topic: topic || chapter_unit || '',
    tags: Array.isArray(tags) ? tags : [tags],
    created_at: 'Just now',
    upvotes: 1,
    views_count: 1,
    comments_count: 0,
    is_verified: false,
    is_high_priority: Boolean(is_high_priority),
    comments: [],
    status: 'ACTIVE',
  };

  communityPostsDB.unshift(newPost);
  res.status(201).json({ success: true, post: newPost });
});

// Post comment with Zero-Tolerance Moderation
app.post('/api/community/posts/:id/comments', (req: Request, res: Response) => {
  const { id } = req.params;
  const { author_id, author_name, author_role, author_avatar, content } = req.body;

  const post = communityPostsDB.find((p) => p.id === id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (suspendedUsers.has(author_id)) {
    return res.status(403).json({
      error: 'ACCOUNT_SUSPENDED',
      message: 'Your account has been suspended due to policy violation.',
    });
  }

  if (detectProfanity(content)) {
    suspendedUsers.add(author_id);
    eventLog.unshift({
      id: `evt-mod-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      source: 'admin',
      type: 'anomaly_detected',
      data: {
        violation: 'ZERO_TOLERANCE_FOUL_LANGUAGE',
        userId: author_id,
        userName: author_name,
        flaggedComment: content.slice(0, 80),
        actionTaken: 'ACCOUNT_AUTOMATICALLY_BLOCKED',
      },
    });
    return res.status(403).json({
      error: 'ACCOUNT_SUSPENDED_POLICY_VIOLATION',
      message: 'Foul language detected. Your account has been locked and suspended.',
    });
  }

  const newComment: DBCommunityComment = {
    id: `comm-${Date.now()}`,
    author_id,
    author_name,
    author_role: author_role || 'student',
    author_avatar,
    content,
    created_at: 'Just now',
    upvotes: 0,
    is_teacher_verified: author_role === 'teacher' || author_role === 'admin',
  };

  post.comments.push(newComment);
  post.comments_count = post.comments.length;
  res.status(201).json({ success: true, comment: newComment });
});

// Upvote post
app.post('/api/community/posts/:id/upvote', (req: Request, res: Response) => {
  const { id } = req.params;
  const post = communityPostsDB.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.upvotes += 1;
  res.json({ success: true, upvotes: post.upvotes });
});

// Upvote comment
app.post('/api/community/posts/:id/comments/:commentId/upvote', (req: Request, res: Response) => {
  const { id, commentId } = req.params;
  const post = communityPostsDB.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const comment = post.comments.find((c) => c.id === commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  comment.upvotes += 1;
  res.json({ success: true, upvotes: comment.upvotes });
});

// Mark answer as Accepted
app.post('/api/community/posts/:id/comments/:commentId/accept', (req: Request, res: Response) => {
  const { id, commentId } = req.params;
  const post = communityPostsDB.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.accepted_comment_id = commentId;
  post.comments = post.comments.map((c) => ({
    ...c,
    is_accepted: c.id === commentId,
    author_badge: c.id === commentId ? 'Best Answer' : c.author_badge,
  }));
  res.json({ success: true, post });
});

// Flag post for teacher/moderator review
app.post('/api/community/posts/:id/flag', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  const post = communityPostsDB.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.is_flagged = true;
  post.flag_reason = reason || 'Flagged for teacher/moderator review';
  res.json({ success: true, post });
});

// Teacher verifies answer
app.post('/api/community/posts/:id/verify', (req: Request, res: Response) => {
  const { id } = req.params;
  const { teacher_name, teacher_avatar, solution } = req.body;
  const post = communityPostsDB.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  post.is_verified = true;
  post.verified_solution = {
    teacher_name: teacher_name || 'Verified Educator',
    teacher_avatar,
    solution,
    verified_at: 'Just now',
  };
  res.json({ success: true, post });
});

// --- 9. Agile Study Planner 3-Sheet Spreadsheet Generator API ---
app.post('/api/study-planner/generate', (req: Request, res: Response) => {
  const {
    start_date = '2026-10-12',
    end_date = '2026-11-20',
    daily_hours = 4,
    core_subject_hours = 1.5,
    core_subject = 'Mathematics',
    grade = 10,
    board = 'CBSE',
  } = req.body;

  // Generate 3 Sheets:
  // Sheet 1: Daily Agile Planner
  const dailyTasks = [];
  const subjectsPool = ['Algebra I', 'Physics', 'World History', 'Chemistry', 'English Literature', 'Computer Science'];
  const start = new Date(start_date);
  const end = new Date(end_date);
  const totalDays = Math.max(7, Math.min(40, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));

  for (let i = 1; i <= totalDays; i++) {
    const curDate = new Date(start.getTime() + (i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    // 1. Mandatory Core Task (Mathematics)
    dailyTasks.push({
      day: i,
      date: curDate,
      subject: core_subject,
      topic: `Core Problem Set ${i}: Quadratic & Algebraic Foundations`,
      duration_hrs: core_subject_hours,
      is_core: true,
      status: i <= 5 ? 'Completed' : i <= 10 ? 'In Progress' : 'To Do',
      color: '#4F46E5',
    });

    // 2. Rotating Sprint Subject
    const rotatingSubj = subjectsPool[(i % (subjectsPool.length - 1)) + 1];
    dailyTasks.push({
      day: i,
      date: curDate,
      subject: rotatingSubj,
      topic: `Sprint Module ${Math.ceil(i / 3)}: Concept Drill & Flashcards`,
      duration_hrs: Math.max(1, daily_hours - core_subject_hours),
      is_core: false,
      status: i <= 4 ? 'Completed' : i <= 8 ? 'In Progress' : 'To Do',
      color: i % 2 === 0 ? '#0284C7' : '#0D9488',
    });
  }

  // Sheet 2: Weekly Sprint Board
  const weeklySprints = [
    { week: 1, weekLabel: 'Week 1: Core Algebra & Kinematics Sprint', coreSubjectHours: core_subject_hours * 7, rotatingSubjectHours: { Physics: 10, History: 5 }, totalHours: 28 },
    { week: 2, weekLabel: 'Week 2: Quadratic Functions & Cell Biology', coreSubjectHours: core_subject_hours * 7, rotatingSubjectHours: { Chemistry: 8, Biology: 7 }, totalHours: 28 },
    { week: 3, weekLabel: 'Week 3: Midterm Simulation & Exam Drill', coreSubjectHours: core_subject_hours * 7, rotatingSubjectHours: { English: 6, ComputerScience: 9 }, totalHours: 28 },
  ];

  // Sheet 3: Chapter Tracker
  const chapterTracker = [
    { id: 'ch-1', subject: 'Mathematics', chapterName: 'Linear Equations & Inequalities', allocatedHours: 12, targetStartDate: '2026-10-12', targetEndDate: '2026-10-18', status: 'Completed' },
    { id: 'ch-2', subject: 'Mathematics', chapterName: 'Quadratic Functions & Parabolas', allocatedHours: 15, targetStartDate: '2026-10-19', targetEndDate: '2026-10-27', status: 'In Progress' },
    { id: 'ch-3', subject: 'Physics', chapterName: "Newton's Laws & Dynamics", allocatedHours: 14, targetStartDate: '2026-10-15', targetEndDate: '2026-10-24', status: 'In Progress' },
    { id: 'ch-4', subject: 'Chemistry', chapterName: 'Periodic Table Trends & Bonding', allocatedHours: 10, targetStartDate: '2026-10-28', targetEndDate: '2026-11-05', status: 'Scheduled' },
    { id: 'ch-5', subject: 'World History', chapterName: 'Modern Era & Global Networks', allocatedHours: 8, targetStartDate: '2026-11-06', targetEndDate: '2026-11-15', status: 'Scheduled' },
  ];

  res.json({
    success: true,
    metadata: {
      generated_at: new Date().toISOString(),
      student_grade: grade,
      board,
      daily_hours,
      core_subject,
      core_subject_hours,
    },
    sheets: {
      dailyAgilePlanner: dailyTasks,
      weeklySprintBoard: weeklySprints,
      chapterTracker,
    },
  });
});

// Setup Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const server = http.createServer(app);

  // Initialize WebSocket Server on same HTTP port
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    connectedClients.add(ws);
    // Send immediate initial curriculum state on connection
    try {
      ws.send(
        JSON.stringify({
          type: 'CURRICULUM_STATE_INIT',
          payload: {
            subjects: subjectsDB,
            topics: topicsDB,
          },
          timestamp: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.error('Error sending init WS state:', e);
    }

    ws.on('close', () => {
      connectedClients.delete(ws);
    });

    ws.on('error', (err) => {
      console.error('WebSocket client error:', err);
      connectedClients.delete(ws);
    });
  });

  if (isProduction) {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Educate AI Agent Platform running at http://0.0.0.0:${PORT} with WebSocket sync`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
