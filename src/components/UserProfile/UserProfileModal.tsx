import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { processAvatarImage } from '../../utils/imageUtils';
import { EducationBoard, LanguageMedium } from '../../types';
import { SchoolAutocomplete } from '../common/SchoolAutocomplete';
import { SchoolLocationMap } from '../common/SchoolLocationMap';
import {
  X,
  User,
  Mail,
  Lock,
  KeyRound,
  Check,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  Layers,
  Activity,
  Upload,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  MapPin,
  Languages,
  Phone,
  Users,
} from 'lucide-react';

const SUPPORTED_BOARDS: { value: EducationBoard; label: string }[] = [
  { value: 'CBSE', label: 'CBSE - Central Board of Secondary Education' },
  { value: 'ICSE', label: 'ICSE / CISCE - Indian Certificate of Secondary Education' },
  { value: 'IB', label: 'IB - International Baccalaureate' },
  { value: 'IGCSE', label: 'Cambridge IGCSE / Edexcel' },
  { value: 'PSEB', label: 'PSEB - Punjab School Education Board' },
  { value: 'GSEB', label: 'GSEB - Gujarat Secondary & Higher Secondary' },
  { value: 'MSBSHSE', label: 'MSBSHSE - Maharashtra State Board' },
  { value: 'KSEEB', label: 'KSEEB - Karnataka Secondary Education Board' },
  { value: 'BSEAP/TOSS', label: 'BSEAP / TOSS - Andhra Pradesh & Telangana' },
  { value: 'WBBSE', label: 'WBBSE - West Bengal Board of Secondary Education' },
  { value: 'Tamil Nadu State Board', label: 'Tamil Nadu State Board' },
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

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    updateCurrentUser,
    isProfileOpen,
    setIsProfileOpen,
    lessonPlans,
    currentRole,
    setGlobalLanguage,
    setCurrentBoard,
  } = useApp();

  const role = currentUser?.role || 'student';

  // Form states - declared unconditionally at the top of the component
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [status, setStatus] = useState(currentUser?.status || 'Active');
  const [avatarSeed, setAvatarSeed] = useState(currentUser?.avatar || '');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Student specific editable states
  const [gradeLevel, setGradeLevel] = useState<number>(
    typeof currentUser?.grade_level === 'number'
      ? currentUser.grade_level
      : parseInt(String(currentUser?.grade || '8').replace(/\D/g, '')) || 8
  );
  const [stream, setStream] = useState<string>('Science (PCM/PCB)');
  const [educationBoard, setEducationBoard] = useState<EducationBoard>(
    (currentUser?.education_board as EducationBoard) || 'CBSE'
  );
  const [languageMedium, setLanguageMedium] = useState<LanguageMedium>(
    (currentUser?.preferred_language as LanguageMedium) || 'en'
  );
  const [schoolData, setSchoolData] = useState<{
    id?: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  }>({
    id: currentUser?.school_id,
    name: currentUser?.school_name || 'D.A.V. Public School, Sector 8',
    address: currentUser?.school_address || 'Sector 8-C, Chandigarh, Punjab & Haryana, India',
    lat: currentUser?.school_lat || 30.7398,
    lng: currentUser?.school_lng || 76.7827,
  });
  const [mobileNumber, setMobileNumber] = useState(currentUser?.mobile_number || '+91 98765 43210');
  const [guardianName, setGuardianName] = useState(currentUser?.guardian_name || 'David Connor');
  const [guardianPhone, setGuardianPhone] = useState(currentUser?.guardian_phone || '+91 98765 11223');
  const [guardianEmail, setGuardianEmail] = useState(currentUser?.guardian_email || 'david.c@guardian.org');

  // Teacher specific editable states
  const [teacherDepartment, setTeacherDepartment] = useState(currentUser?.department || 'Life Sciences & Biology');
  const [teacherCabin, setTeacherCabin] = useState(currentUser?.cabin || 'Lab 3B - Science Wing');
  const [teacherAssignedClass, setTeacherAssignedClass] = useState(currentUser?.assignedCohorts?.[0] || 'Class 7B - Science');

  // Sync state whenever modal opens or currentUser updates
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setStatus(currentUser.status);
      setAvatarSeed(currentUser.avatar || '');
      setGradeLevel(
        typeof currentUser.grade_level === 'number'
          ? currentUser.grade_level
          : parseInt(String(currentUser.grade || '8').replace(/\D/g, '')) || 8
      );
      if (currentUser.education_board) setEducationBoard(currentUser.education_board as EducationBoard);
      if (currentUser.preferred_language) setLanguageMedium(currentUser.preferred_language as LanguageMedium);
      if (currentUser.school_name) {
        setSchoolData({
          id: currentUser.school_id,
          name: currentUser.school_name,
          address: currentUser.school_address || `${currentUser.school_name}, India`,
          lat: currentUser.school_lat || 28.6139,
          lng: currentUser.school_lng || 77.2090,
        });
      }
      if (currentUser.mobile_number) setMobileNumber(currentUser.mobile_number);
      if (currentUser.guardian_name) setGuardianName(currentUser.guardian_name);
      if (currentUser.guardian_phone) setGuardianPhone(currentUser.guardian_phone);
      if (currentUser.guardian_email) setGuardianEmail(currentUser.guardian_email);
      if (currentUser.department) setTeacherDepartment(currentUser.department);
      if (currentUser.cabin) setTeacherCabin(currentUser.cabin);
      if (currentUser.assignedCohorts?.[0]) setTeacherAssignedClass(currentUser.assignedCohorts[0]);
    }
  }, [currentUser, isProfileOpen]);

  // Role-specific themes for Profile Modal
  const getThemeStyles = () => {
    if (role === 'student') {
      return {
        accentBg: 'bg-gradient-to-r from-[#0D1B3E] via-[#0B1E38] to-[#00A896]',
        badge: 'bg-[#00A896]/15 text-[#00A896] dark:bg-[#00A896]/25 dark:text-[#00A896] border border-[#00A896]/30',
        border: 'border-[#00A896]',
        btn: 'bg-[#00A896] hover:bg-[#009282] text-white shadow-md shadow-[#00A896]/20',
        highlight: 'text-[#00A896] dark:text-[#00A896]',
      };
    }
    if (role === 'teacher') {
      return {
        accentBg: 'bg-gradient-to-r from-[#0D1B3E] via-[#0B1E38] to-[#00A896]',
        badge: 'bg-[#00A896]/15 text-[#00A896] dark:bg-[#00A896]/25 dark:text-[#00A896] border border-[#00A896]/30',
        border: 'border-[#00A896]',
        btn: 'bg-[#00A896] hover:bg-[#009282] text-white shadow-md shadow-[#00A896]/20',
        highlight: 'text-[#00A896] dark:text-[#00A896]',
      };
    }
    return {
      accentBg: 'bg-cyan-600',
      badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      border: 'border-cyan-500',
      btn: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      highlight: 'text-cyan-600 dark:text-cyan-400',
    };
  };

  const themeStyles = getThemeStyles();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name,
      email,
      status,
      avatar: avatarSeed,
      department: teacherDepartment,
      cabin: teacherCabin,
      assignedCohorts: [teacherAssignedClass, 'Class 8C - Advanced Biology', 'Class 9A - Laboratory Mentorship'],
      grade: `Grade ${gradeLevel}`,
      grade_level: gradeLevel,
      education_board: educationBoard,
      preferred_language: languageMedium,
      school_id: schoolData.id,
      school_name: schoolData.name,
      school_address: schoolData.address,
      school_lat: schoolData.lat,
      school_lng: schoolData.lng,
      mobile_number: mobileNumber,
      guardian_name: guardianName,
      guardian_phone: guardianPhone,
      guardian_email: guardianEmail,
    });
    setGlobalLanguage(languageMedium);
    setCurrentBoard(educationBoard);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) return;
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setPasswordSuccess(false);
      setShowPasswordSection(false);
    }, 2500);
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimizedAvatar = await processAvatarImage(file);
        setAvatarSeed(optimizedAvatar);
        updateCurrentUser({
          avatar: optimizedAvatar,
        });
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 2500);
      } catch (err) {
        console.error('Failed to process avatar image:', err);
      }
    }
  };

  if (!isProfileOpen || !currentUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 transition-colors">
        {/* Modal Header */}
        <div className={`p-6 ${themeStyles.accentBg} text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl shadow-inner">
              {role === 'student' && <GraduationCap className="w-6 h-6" />}
              {role === 'teacher' && <Briefcase className="w-6 h-6" />}
              {role === 'admin' && <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{currentUser?.name || 'User'}</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">
                  {currentUser?.role || role}
                </span>
              </div>
              <p className="text-xs text-white/80">Account Profile & Workspace Settings</p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile details saved successfully!</span>
            </div>
          )}

          {/* COMMON FIELDS FORM */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span>Account Information</span>
              </h3>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Avatar & Photo Picker */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden relative ring-2 ring-indigo-400/50 shrink-0">
                {avatarSeed && (avatarSeed.startsWith('data:') || avatarSeed.startsWith('http') || avatarSeed.startsWith('/')) ? (
                  <img src={avatarSeed} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{name.charAt(0) || 'U'}</span>
                )}
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Profile Picture
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Upload an image from your computer to reflect instantly across your portal.
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <label className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                  </label>
                  {avatarSeed && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarSeed('');
                        updateCurrentUser({ avatar: '' });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const dicebearAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'Sarah')}-${Date.now()}`;
                      setAvatarSeed(dicebearAvatar);
                      updateCurrentUser({ avatar: dicebearAvatar });
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Avatar Style</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name (Editable)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Editable)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* STUDENT ACADEMIC & INSTITUTIONAL CONFIGURATION */}
            {role === 'student' && (
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>Academic & Curriculum Configuration</span>
                  </h4>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                    Auto-Syncs With AI Tutor
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Grade Dropdown (Grades 6 to 12) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Current Grade Level (Grades 6-12)
                    </label>
                    <select
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
                  {(gradeLevel === 11 || gradeLevel === 12) && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Academic Stream (Grades 11 & 12)
                      </label>
                      <select
                        value={stream}
                        onChange={(e) => setStream(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/40 text-xs font-bold text-indigo-900 dark:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="Science (PCM/PCB)">Science (PCM / PCB)</option>
                        <option value="Commerce">Commerce (Accountancy & Economics)</option>
                        <option value="Arts / Humanities">Arts & Humanities</option>
                      </select>
                    </div>
                  )}

                  {/* Education Board Selection */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Educational Board / Governing Syllabus
                    </label>
                    <select
                      value={educationBoard}
                      onChange={(e) => setEducationBoard(e.target.value as EducationBoard)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {SUPPORTED_BOARDS.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preferred Language Medium */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      AI Tutor Medium / Language
                    </label>
                    <select
                      value={languageMedium}
                      onChange={(e) => setLanguageMedium(e.target.value as LanguageMedium)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label} ({l.native})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Smart School & Location Mapping */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Linked School / Institution (Google Maps Platform)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Coordinates: {schoolData.lat.toFixed(4)}, {schoolData.lng.toFixed(4)}
                    </span>
                  </div>
                  <SchoolAutocomplete
                    selectedSchoolName={schoolData.name}
                    selectedSchoolAddress={schoolData.address}
                    onSelectSchool={(s) => {
                      setSchoolData({
                        id: s.id,
                        name: s.name,
                        address: s.address,
                        lat: s.lat,
                        lng: s.lng,
                      });
                    }}
                  />
                  <SchoolLocationMap
                    lat={schoolData.lat}
                    lng={schoolData.lng}
                    schoolName={schoolData.name}
                    address={schoolData.address}
                  />
                </div>

                {/* Student & Guardian Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Student Mobile (SMS Alerts)
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Guardian Emergency Contact
                    </label>
                    <input
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TEACHER FACULTY & DEPARTMENT CONFIGURATION (Editable) */}
            {role === 'teacher' && (
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-normal uppercase tracking-wider text-[#00A896] flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    <span>Faculty & Teaching Assignment</span>
                  </h4>
                  <span className="text-[10px] bg-[#00A896]/15 text-[#00A896] dark:bg-[#00A896]/20 dark:text-[#00A896] px-2 py-0.5 rounded-full font-normal border border-[#00A896]/30">
                    Live Sync with Classes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-normal text-slate-700 dark:text-slate-300 mb-1">
                      Department Specialization (Editable)
                    </label>
                    <input
                      type="text"
                      value={teacherDepartment}
                      onChange={(e) => setTeacherDepartment(e.target.value)}
                      placeholder="e.g. Life Sciences & Biology"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1B3E] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-normal text-slate-700 dark:text-slate-300 mb-1">
                      Primary Assigned Cohort / Class
                    </label>
                    <select
                      value={teacherAssignedClass}
                      onChange={(e) => setTeacherAssignedClass(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1B3E] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                    >
                      <option value="Class 7B - Science">Class 7B - Science</option>
                      <option value="Class 8A - Physics">Class 8A - Physics</option>
                      <option value="Class 8C - Adv Biology">Class 8C - Adv Biology</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-slate-700 dark:text-slate-300 mb-1">
                    Faculty Office / Lab Cabin
                  </label>
                  <input
                    type="text"
                    value={teacherCabin}
                    onChange={(e) => setTeacherCabin(e.target.value)}
                    placeholder="e.g. Lab 3B - Science Wing"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1B3E] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{showPasswordSection ? 'Hide Password Reset' : 'Change Password'}</span>
              </button>

              <button
                type="submit"
                className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer ${themeStyles.btn}`}
              >
                Save Details
              </button>
            </div>
          </form>

          {/* PASSWORD RESET SECTION */}
          {showPasswordSection && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Password Reset Security</span>
              </h4>

              {passwordSuccess ? (
                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Password updated securely!</span>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 cursor-pointer"
                  >
                    Confirm Password Change
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ROLE SPECIFIC PROFILE ADDITIONS */}

          {/* 1. STUDENT PROFILE ADDITIONS */}
          {role === 'student' && (
            <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Academic Overview</span>
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Enrolled: {currentUser?.enrollmentDate || 'Sep 1, 2025'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Class Grade</span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    {currentUser?.grade || '8th Grade'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Cumulative GPA</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    {currentUser?.gpa || 3.85}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Attendance</span>
                  <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                    {currentUser?.attendance || 98}%
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Overall Mastery</span>
                  <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                    {currentUser?.overallProgress || 84}%
                  </span>
                </div>
              </div>

              {/* Dynamic Progress Overview */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Dynamic Subject Progress</span>
                  <span className="text-[10px] text-slate-500 font-normal">Real-Time Sync</span>
                </h5>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      <span>Physics (Newton's Laws)</span>
                      <span>{currentUser?.physicsProgress || 75}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${currentUser?.physicsProgress || 75}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      <span>Biology & Cell Energy</span>
                      <span>{currentUser?.biologyProgress || 88}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${currentUser?.biologyProgress || 88}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      <span>Mathematics & Algebra</span>
                      <span>{currentUser?.mathProgress || 92}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${currentUser?.mathProgress || 92}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Enrolled Course Modules:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {(
                    currentUser?.enrolledCourses || [
                      'Physics (PHY-101)',
                      'Biology (BIO-201)',
                      'Mathematics (MTH-102)',
                      'Computer Science (CSC-301)',
                    ]
                  ).map((course, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs"
                    >
                      📚 {course}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. TEACHER PROFILE ADDITIONS */}
          {role === 'teacher' && (
            <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-normal uppercase tracking-wider text-[#00A896] dark:text-[#00A896] flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                <span>Educator Faculty Overview</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-[#00A896]/10 dark:bg-[#00A896]/15 border border-[#00A896]/30 space-y-1">
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 block">
                    Department Specialization
                  </span>
                  <span className="text-sm font-normal text-slate-900 dark:text-white">
                    {currentUser?.department || teacherDepartment}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D1B3E] border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 block">
                    Active Student Cohorts
                  </span>
                  <span className="text-sm font-normal text-slate-900 dark:text-white">
                    {currentUser?.activeStudentsCount || 58} Students Assigned
                  </span>
                </div>
              </div>

              {/* Assigned Cohorts */}
              <div>
                <h5 className="text-xs font-normal text-slate-800 dark:text-slate-200 mb-2">
                  Assigned Classes & Cohorts:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {(
                    currentUser?.assignedCohorts || [
                      teacherAssignedClass,
                      'Class 8C - Advanced Biology',
                      'Class 9A - Laboratory Mentorship',
                    ]
                  ).map((cohort, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-xs font-normal bg-[#00A896]/15 dark:bg-[#00A896]/20 text-[#00A896] dark:text-[#00A896] border border-[#00A896]/30"
                    >
                      🏫 {cohort}
                    </span>
                  ))}
                </div>
              </div>

              {/* Created Lesson Plans list */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0D1B3E] border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-normal text-slate-800 dark:text-slate-200">
                  <span>Created Lesson Plans ({lessonPlans.length})</span>
                  <span className="text-[#00A896] text-[11px]">AI Curriculum Studio</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {lessonPlans.slice(0, 3).map((plan) => (
                    <div
                      key={plan.id}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {plan.topic}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {plan.grade} &bull; {plan.duration}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-semibold">
                        Ready
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. ADMIN PROFILE ADDITIONS */}
          {role === 'admin' && (
            <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Administrative Security Credentials</span>
                </h4>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                  {currentUser?.permissionLevel || 'Super Admin'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                  Permissions Scope
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Authorized for ecosystem-wide CRUD management, real-time proctoring anomaly controls, certificate cryptography, and multi-portal switching.
                </p>
              </div>

              {/* Activity Logs */}
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Recent Security & Administrative Activity Logs:</span>
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {(
                    currentUser?.activityLogs || [
                      { id: '1', timestamp: 'Today, 09:15 AM', action: 'System health check completed. All microservices operational.' },
                      { id: '2', timestamp: 'Today, 09:02 AM', action: 'Proctoring engine flagged anomaly for Feed 2 and Feed 6.' },
                      { id: '3', timestamp: 'Yesterday, 04:30 PM', action: 'Issued digital certificate EDU-AI-2026-98124 for Sarah Connor.' },
                      { id: '4', timestamp: 'Yesterday, 02:10 PM', action: 'Updated proctoring sensitivity threshold for Head Rotation.' },
                    ]
                  ).map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs flex items-start gap-2.5"
                    >
                      <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap pt-0.5">
                        {log.timestamp}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">{log.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setIsProfileOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
