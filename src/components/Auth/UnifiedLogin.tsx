import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, EducationBoard, LanguageMedium } from '../../types';
import { SchoolAutocomplete } from '../common/SchoolAutocomplete';
import { SchoolLocationMap } from '../common/SchoolLocationMap';
import { PivotIQLogo } from '../common/PivotIQLogo';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  Radio,
  KeyRound,
  Check,
  AlertCircle,
  HelpCircle,
  Phone,
  User,
  Users,
  Compass,
  MapPin,
  BookOpen,
  Languages,
  Layers,
  ChevronDown,
} from 'lucide-react';

const SUPPORTED_BOARDS: { value: EducationBoard; label: string; desc: string }[] = [
  { value: 'CBSE', label: 'CBSE - Central Board of Secondary Education', desc: 'National curriculum, NCERT aligned' },
  { value: 'ICSE', label: 'ICSE / CISCE - Indian Certificate of Secondary Education', desc: 'Comprehensive conceptual syllabus' },
  { value: 'IB', label: 'IB - International Baccalaureate', desc: 'Inquiry-based international curriculum' },
  { value: 'IGCSE', label: 'Cambridge IGCSE / Edexcel', desc: 'Global international assessment board' },
  { value: 'PSEB', label: 'PSEB - Punjab School Education Board', desc: 'Punjab state syllabus & regional literature' },
  { value: 'GSEB', label: 'GSEB - Gujarat Secondary and Higher Secondary', desc: 'Gujarat state curriculum' },
  { value: 'MSBSHSE', label: 'MSBSHSE - Maharashtra State Board', desc: 'Maharashtra state secondary & higher board' },
  { value: 'KSEEB', label: 'KSEEB - Karnataka Secondary Education Board', desc: 'Karnataka state board syllabus' },
  { value: 'BSEAP/TOSS', label: 'BSEAP / TOSS - Andhra Pradesh & Telangana', desc: 'Telugu states board curriculum' },
  { value: 'WBBSE', label: 'WBBSE - West Bengal Board of Secondary Education', desc: 'West Bengal state syllabus' },
  { value: 'Tamil Nadu State Board', label: 'Tamil Nadu State Board (Samacheer Kalvi)', desc: 'Tamil Nadu school education board' },
];

const SUPPORTED_LANGUAGES: { value: LanguageMedium; label: string; native: string }[] = [
  { value: 'en', label: 'English', native: 'Default International' },
  { value: 'hi', label: 'Hindi', native: 'हिंदी' },
  { value: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { value: 'mr', label: 'Marathi', native: 'मराठी' },
  { value: 'bn', label: 'Bengali', native: 'বাংলা' },
  { value: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { value: 'te', label: 'Telugu', native: 'తెలుగు' },
  { value: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { value: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { value: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

export const UnifiedLogin: React.FC = () => {
  const { theme, toggleTheme, login, signup } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Sign In Form State
  const [email, setEmail] = useState('sarah.c@educateai.org');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Sign Up / Onboarding State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('+91 98765 43210');
  const [signupPassword, setSignupPassword] = useState('student2026');
  const [guardianName, setGuardianName] = useState('David Connor');
  const [guardianPhone, setGuardianPhone] = useState('+91 98765 11223');
  const [guardianEmail, setGuardianEmail] = useState('david.connor@guardian.org');
  const [gradeNumber, setGradeNumber] = useState<number>(8);
  const [stream, setStream] = useState<string>('Science (PCM/PCB)');
  const [educationBoard, setEducationBoard] = useState<EducationBoard>('CBSE');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageMedium>('en');
  const [selectedSchool, setSelectedSchool] = useState<{
    id?: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  }>({
    id: 'school-1',
    name: 'D.A.V. Public School, Sector 8',
    address: 'Sector 8-C, Chandigarh, Punjab & Haryana, India',
    lat: 30.7398,
    lng: 76.7827,
  });

  // Sync demo credentials when switching roles in Sign In
  useEffect(() => {
    if (selectedRole === 'student') {
      setEmail('sarah.c@educateai.org');
      setPassword('student2026');
    } else if (selectedRole === 'teacher') {
      setEmail('elena.r@educateai.org');
      setPassword('teacher2026');
    } else {
      setEmail('admin@educateai.org');
      setPassword('admin2026');
    }
  }, [selectedRole]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      login(selectedRole, email, password);
      setIsSubmitting(false);
    }, 400);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signup({
        name: signupName || 'New Student',
        email: signupEmail || `student.${Date.now()}@educateai.org`,
        role: selectedRole,
        password: signupPassword,
        grade: `Grade ${gradeNumber}`,
        grade_level: gradeNumber,
        education_board: educationBoard,
        preferred_language: preferredLanguage,
        school_name: selectedSchool.name,
        school_address: selectedSchool.address,
        school_lat: selectedSchool.lat,
        school_lng: selectedSchool.lng,
        school_id: selectedSchool.id,
        mobile_number: signupPhone,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        guardian_email: guardianEmail,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSSO = (provider: 'Google' | 'Outlook' | 'Apple') => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (authMode === 'signin') {
        const defaultEmail =
          selectedRole === 'student'
            ? 'sarah.c@educateai.org'
            : selectedRole === 'teacher'
            ? 'elena.r@educateai.org'
            : 'admin@educateai.org';
        login(selectedRole, defaultEmail);
      } else {
        signup({
          name: `${provider} Verified User`,
          email: `user.${provider.toLowerCase()}@educateai.org`,
          role: selectedRole,
          grade: `Grade ${gradeNumber}`,
          grade_level: gradeNumber,
          education_board: educationBoard,
          preferred_language: preferredLanguage,
          school_name: selectedSchool.name,
          school_address: selectedSchool.address,
          school_lat: selectedSchool.lat,
          school_lng: selectedSchool.lng,
          school_id: selectedSchool.id,
          mobile_number: signupPhone,
          guardian_name: guardianName,
          guardian_phone: guardianPhone,
          guardian_email: guardianEmail,
        });
      }
      setIsSubmitting(false);
    }, 500);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    setSelectedRole(role);
    setIsSubmitting(true);
    setTimeout(() => {
      const defaultEmail =
        role === 'student'
          ? 'sarah.c@educateai.org'
          : role === 'teacher'
          ? 'elena.r@educateai.org'
          : 'admin@educateai.org';
      login(role, defaultEmail);
      setIsSubmitting(false);
    }, 300);
  };

  const getThemeAccents = () => {
    return {
      bgGlow: 'bg-[#00A896]/10 dark:bg-[#00A896]/5',
      primaryBtn: 'bg-[#00A896] hover:bg-[#009282] text-white shadow-[#00A896]/25 focus:ring-[#00A896]',
      activeBadge: 'bg-[#00A896]/15 text-[#00A896] dark:bg-[#00A896]/20 dark:text-[#00A896] border-[#00A896]/30',
      ringColor: 'ring-[#00A896]/40 border-[#00A896] shadow-lg shadow-[#00A896]/15',
      cardHighlight: 'border-[#00A896] bg-[#00A896]/5 dark:bg-[#00A896]/10',
      titleColor: 'text-[#00A896]',
      tagline: selectedRole === 'student' ? 'Student Portal' : selectedRole === 'teacher' ? "Teacher's Desktop" : 'Institutional Control',
    };
  };

  const accents = getThemeAccents();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0D1B3E] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors relative overflow-hidden font-normal">
      {/* Background ambient decorative shapes matching #00A896 and #0D1B3E */}
      <div
        className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${accents.bgGlow}`}
      />
      <div
        className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${accents.bgGlow}`}
      />

      {/* Top Navigation Bar */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md bg-white/70 dark:bg-[#0D1B3E]/80 px-4 sm:px-8 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <PivotIQLogo size={36} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-normal text-slate-900 dark:text-white text-base tracking-tight">
                PivotIQ
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-normal bg-[#00A896]/15 text-[#00A896] dark:bg-[#00A896]/20 dark:text-[#00A896] border border-[#00A896]/30">
                <Radio className="w-2.5 h-2.5 animate-pulse text-[#00A896]" />
                Live Sync Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-light">
              Unified Role-Based Authentication Gateway & Institutional Onboarding
            </p>
          </div>
        </div>

        {/* Right Header Tools: Theme Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Light and Dark Mode"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-normal bg-white dark:bg-[#12234e] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-normal">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#00A896]" />
                <span className="hidden sm:inline font-normal">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 z-10 max-w-4xl mx-auto w-full">
        {/* Auth Mode Toggle Tabs (Sign In vs Sign Up) */}
        <div className="flex items-center p-1 bg-slate-200/80 dark:bg-[#12234e] rounded-2xl mb-6 shadow-inner">
          <button
            onClick={() => setAuthMode('signin')}
            className={`px-6 py-2 rounded-xl text-xs font-normal transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white dark:bg-[#0D1B3E] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In to Account
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            className={`px-6 py-2 rounded-xl text-xs font-normal flex items-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white dark:bg-[#0D1B3E] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Student Onboarding & Sign Up</span>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-normal bg-[#00A896]/20 text-[#00A896] dark:bg-[#00A896]/30 dark:text-teal-300">
              7-Day Free Trial
            </span>
          </button>
        </div>

        {/* Portal Selection Cards */}
        <div className="w-full mb-6">
          <div className="text-center mb-4">
            <h1 className="text-xl sm:text-2xl font-light text-slate-900 dark:text-white tracking-tight">
              {authMode === 'signin' ? 'Sign In to Your Workspace' : 'Begin Your Personalized Learning Journey'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-light">
              Select your educational role to enter your dedicated AI-assisted environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Student Role Card */}
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative bg-white dark:bg-[#12234e] ${
                selectedRole === 'student'
                  ? 'border-[#00A896] ring-2 ring-[#00A896]/30 shadow-md shadow-[#00A896]/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-normal ${
                  selectedRole === 'student'
                    ? 'bg-[#00A896] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
                {selectedRole === 'student' && (
                  <span className="w-2 h-2 rounded-full bg-[#00A896] animate-pulse" />
                )}
              </div>
              <h3 className="text-xs font-normal text-slate-900 dark:text-white">Student Portal</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-light">
                Socratic AI, Doubts & Agile Study
              </p>
            </button>

            {/* Teacher Role Card */}
            <button
              type="button"
              onClick={() => setSelectedRole('teacher')}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative bg-white dark:bg-[#12234e] ${
                selectedRole === 'teacher'
                  ? 'border-[#00A896] ring-2 ring-[#00A896]/30 shadow-md shadow-[#00A896]/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-normal ${
                  selectedRole === 'teacher'
                    ? 'bg-[#00A896] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                {selectedRole === 'teacher' && (
                  <span className="w-2 h-2 rounded-full bg-[#00A896] animate-pulse" />
                )}
              </div>
              <h3 className="text-xs font-normal text-slate-900 dark:text-white">Teacher's Desktop</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-light">
                Curriculum, Live Meet & Grading
              </p>
            </button>

            {/* Admin Role Card */}
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative bg-white dark:bg-[#12234e] ${
                selectedRole === 'admin'
                  ? 'border-[#00A896] ring-2 ring-[#00A896]/30 shadow-md shadow-[#00A896]/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-normal ${
                  selectedRole === 'admin'
                    ? 'bg-[#00A896] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                {selectedRole === 'admin' && (
                  <span className="w-2 h-2 rounded-full bg-[#00A896] animate-pulse" />
                )}
              </div>
              <h3 className="text-xs font-normal text-slate-900 dark:text-white">Admin Hub</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-light">
                Multi-Panel Switch & Institutional Control
              </p>
            </button>
          </div>
        </div>

        {/* Social SSO Row */}
        <div className="w-full bg-white dark:bg-[#12234e] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl mb-4">
          <div className="mb-5">
            <span className="text-[11px] font-normal uppercase tracking-wider text-slate-400 block mb-2 text-center">
              One-Click Social & Enterprise Authentication
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleSocialSSO('Google')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] hover:bg-slate-100 dark:hover:bg-[#162a5c] text-xs font-normal text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:scale-101"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialSSO('Outlook')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] hover:bg-slate-100 dark:hover:bg-[#162a5c] text-xs font-normal text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:scale-101"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#0078D4" d="M24 7.25v9.5c0 1.24-1.01 2.25-2.25 2.25H8.25A2.25 2.25 0 0 1 6 16.75V7.25C6 6.01 7.01 5 8.25 5h13.5C22.99 5 24 6.01 24 7.25z"/>
                  <path fill="#28A8EA" d="M0 6.5l6-2v15l-6-2z"/>
                  <path fill="#002050" d="M6 7.25L15 12l9-4.75V7.25L15 12 6 7.25z"/>
                </svg>
                <span>Outlook</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialSSO('Apple')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] hover:bg-slate-100 dark:hover:bg-[#162a5c] text-xs font-normal text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:scale-101"
              >
                <svg className="w-4 h-4 fill-current text-slate-800 dark:text-white" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.36.21-10.39-1.9-15.08-6.35-3.35-2.91-7.25-7.66-11.7-14.25-5.92-8.8-10.59-19.14-14.01-30.98-3.41-11.85-5.12-22.95-5.12-33.31 0-14.71 3.73-27.02 11.2-36.93 7.47-9.92 16.92-14.99 28.36-15.22 4.8 0 10.22 1.34 16.27 4.02 6.04 2.68 10.04 4.07 12 4.17 1.8 0 5.86-1.42 12.19-4.27 6.33-2.85 11.83-4.11 16.5-3.79 17.51 1.25 30.63 8.35 39.38 21.32-15.53 9.42-23.11 22.09-22.74 38 0 12.33 4.67 22.75 14 31.25 4.35 3.99 9.39 7.02 15.11 9.09-2.58 7.39-5.46 14.62-8.62 21.68zM119.22 33.11c0-7.85 2.82-15.42 8.46-22.71 5.64-7.29 12.56-12.01 20.76-14.16 1.13 6.98-.32 14.05-4.35 21.2-4.03 7.15-10.09 12.18-18.17 15.09-.94-.83-1.89-1.91-2.85-3.24-2.57-3.56-3.85-8.96-3.85-16.18z"/>
                </svg>
                <span>Apple</span>
              </button>
            </div>
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[10px] font-normal uppercase tracking-wider text-slate-400">
                Or Continue With Credentials
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>
          </div>

          {/* SIGN IN FORM */}
          {authMode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-normal text-slate-700 dark:text-slate-300 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@educateai.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs text-slate-900 dark:text-white font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-normal text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-normal text-[#00A896] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs text-slate-900 dark:text-white font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1 font-normal">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-[#00A896] focus:ring-[#00A896]"
                  />
                  <span>Remember me on this device</span>
                </label>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-normal">
                  <CheckCircle2 className="w-3 h-3 text-[#00A896]" /> 256-bit Secure
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-2 py-3 px-4 rounded-xl font-normal text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${accents.primaryBtn} disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      Sign In to{' '}
                      {selectedRole === 'student'
                        ? 'Student Portal'
                        : selectedRole === 'teacher'
                        ? "Teacher's Desktop"
                        : 'Admin Console'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGN UP / ONBOARDING FORM WITH GOOGLE MAPS SCHOOL AUTOCOMPLETE */
            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Personal Details */}
              <div className="space-y-3">
                <span className="text-xs font-normal uppercase tracking-wider text-[#00A896] flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>1. Student Identity & Contact</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-normal text-slate-600 dark:text-slate-300 mb-1">
                      Full Student Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs text-slate-900 dark:text-white font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-normal text-slate-600 dark:text-slate-300 mb-1">
                      Student Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex.r@school.edu"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs text-slate-900 dark:text-white font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-normal text-slate-600 dark:text-slate-300 mb-1">
                      Mobile Number (For SMS & Live Alerts)
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs text-slate-900 dark:text-white font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-normal text-slate-600 dark:text-slate-300 mb-1">
                      Create Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs text-slate-900 dark:text-white font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Guardian / Parent Details */}
              {selectedRole === 'student' && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-normal uppercase tracking-wider text-[#00A896] flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>2. Guardian / Parents Contact</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-normal text-slate-600 dark:text-slate-300 mb-1">
                        Parent / Guardian Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Parent Name"
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs text-slate-900 dark:text-white font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-normal text-slate-600 dark:text-slate-300 mb-1">
                        Parent Contact Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 00000"
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs text-slate-900 dark:text-white font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-normal text-slate-600 dark:text-slate-300 mb-1">
                        Emergency Parent Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="parent@emergency.org"
                        value={guardianEmail}
                        onChange={(e) => setGuardianEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs text-slate-900 dark:text-white font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Smart School & Location Mapping (Google Maps Platform) */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-normal uppercase tracking-wider text-[#00A896] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>3. Smart School & Location Mapping (Google Maps)</span>
                  </span>
                  <span className="text-[10px] bg-[#00A896]/15 text-[#00A896] px-2 py-0.5 rounded-full font-normal">
                    Auto Geocoded
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light">
                  Search your school name. Powered by Google Places API, new entries are automatically registered in the central institutional database.
                </p>

                <SchoolAutocomplete
                  selectedSchoolName={selectedSchool.name}
                  selectedSchoolAddress={selectedSchool.address}
                  onSelectSchool={(school) => {
                    setSelectedSchool({
                      id: school.id,
                      name: school.name,
                      address: school.address,
                      lat: school.lat,
                      lng: school.lng,
                    });
                  }}
                />

                {/* Interactive Map Preview */}
                <SchoolLocationMap
                  lat={selectedSchool.lat}
                  lng={selectedSchool.lng}
                  schoolName={selectedSchool.name}
                  address={selectedSchool.address}
                />
              </div>

              {/* Academic Profiling: Grade, Stream, Board, and Language Medium */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-normal uppercase tracking-wider text-[#00A896] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>4. Academic Curriculum & Board Profiling</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Grade Dropdown (Grades 6-12) */}
                  <div>
                    <label className="block text-[11px] font-normal text-slate-600 dark:text-slate-300 mb-1">
                      Current Grade / Class
                    </label>
                    <select
                      value={gradeNumber}
                      onChange={(e) => setGradeNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                    >
                      <option value={6}>Grade 6 (Middle School)</option>
                      <option value={7}>Grade 7 (Middle School)</option>
                      <option value={8}>Grade 8 (Secondary Foundations)</option>
                      <option value={9}>Grade 9 (Secondary High School)</option>
                      <option value={10}>Grade 10 (Secondary Board Exam Prep)</option>
                      <option value={11}>Grade 11 (Senior Secondary Stream)</option>
                      <option value={12}>Grade 12 (Senior Secondary Final Prep)</option>
                    </select>
                  </div>

                  {/* Stream Selection (Mandatory for Grades 11 and 12) */}
                  {(gradeNumber === 11 || gradeNumber === 12) && (
                    <div className="animate-fadeIn">
                      <label className="block text-[11px] font-normal text-slate-600 dark:text-slate-300 mb-1">
                        Academic Stream (Grades 11 & 12 Only)
                      </label>
                      <select
                        value={stream}
                        onChange={(e) => setStream(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#00A896]/40 bg-[#00A896]/10 text-xs font-normal text-teal-900 dark:text-teal-200 focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                      >
                        <option value="Science (PCM/PCB)">Science (PCM / PCB & STEM Electives)</option>
                        <option value="Commerce">Commerce (Accountancy, Business Studies, Economics)</option>
                        <option value="Arts / Humanities">Arts & Humanities (History, Psychology, Political Science)</option>
                      </select>
                    </div>
                  )}

                  {/* Education Board Dropdown */}
                  <div>
                    <label className="block text-[11px] font-normal text-slate-600 dark:text-slate-300 mb-1">
                      Educational Board / Syllabus
                    </label>
                    <select
                      value={educationBoard}
                      onChange={(e) => setEducationBoard(e.target.value as EducationBoard)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                    >
                      {SUPPORTED_BOARDS.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language Medium Dropdown */}
                  <div>
                    <label className="block text-[11px] font-normal text-slate-600 dark:text-slate-300 mb-1">
                      Preferred Language Medium
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value as LanguageMedium)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label} ({l.native})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 7-Day Free Trial Callout */}
              <div className="p-3.5 rounded-2xl bg-[#00A896]/10 border border-[#00A896]/30 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#00A896] text-white flex items-center justify-center font-normal">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-normal text-slate-900 dark:text-white">
                      7-Day Full Access Free Trial Included
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light">
                      Unrestricted AI Tutoring, Quick Doubts 24/7, and Agile Study Roadmap generation.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-normal px-2.5 py-1 rounded-full bg-[#00A896] text-white whitespace-nowrap">
                  No Charge Today
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-normal text-sm bg-[#00A896] hover:bg-[#009282] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#00A896]/25 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Onboarding & Start 7-Day Trial</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo 1-Click Login Row for Fast Testing */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mb-2.5">
              ⚡ Quick One-Click Demo Logins:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                className="py-1.5 px-2 rounded-lg text-[11px] font-normal bg-[#00A896]/10 hover:bg-[#00A896]/20 text-[#00A896] dark:text-teal-300 border border-[#00A896]/30 transition-colors cursor-pointer"
              >
                🎓 Sarah (Student)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('teacher')}
                className="py-1.5 px-2 rounded-lg text-[11px] font-normal bg-slate-100 hover:bg-slate-200 dark:bg-[#0D1B3E] dark:hover:bg-[#162a5c] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                💼 Ms. Elena (Teacher)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="py-1.5 px-2 rounded-lg text-[11px] font-normal bg-slate-100 hover:bg-slate-200 dark:bg-[#0D1B3E] dark:hover:bg-[#162a5c] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                🛡️ Dr. Marcus (Admin)
              </button>
            </div>
          </div>
        </div>

        {/* Access Rule Footnote */}
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-lg font-light">
          🔒 Access Rule Enforcement: Student and Educator logins are strictly confined to their dedicated workspaces. Only Administrators possess permissions to switch across all three panels.
        </p>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-normal">
          <div className="bg-white dark:bg-[#12234e] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#00A896]" />
                <h3 className="font-normal text-slate-900 dark:text-white text-base">Reset Password</h3>
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#00A896]/15 text-[#00A896] mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-normal text-slate-900 dark:text-white text-sm">Reset Link Sent</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                  We sent a recovery link to <strong>{forgotEmail || email}</strong>. Please check your inbox to reset your password.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSuccess(false);
                  }}
                  className="w-full py-2 bg-[#00A896] text-white rounded-xl text-xs font-normal cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSuccess(true);
                }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                  Enter your registered institutional email. We will dispatch a secure one-time password verification link.
                </p>
                <div>
                  <label className="block text-xs font-normal text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail || email}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D1B3E] text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white font-normal text-xs shadow-md transition-colors cursor-pointer"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
