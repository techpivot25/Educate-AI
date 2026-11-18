import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { processAvatarImage } from '../../utils/imageUtils';
import { DBSubject, EducationBoard, LanguageMedium } from '../../types';
import { SUPPORTED_LOCALES } from '../../i18n';
import { translateSubjectLabel, translateCategoryLabel } from '../../i18n/helpers';
import {
  BOARD_LABELS,
  getLocalizedSubjectName,
  formatEnrolledCourseEntry,
  isSubjectEnrolled,
  resolveSubjectsForBoard,
} from '../../data/curriculumData';
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
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';

interface PresetAvatar {
  id: string;
  name: string;
  category: 'Students' | 'Robots' | 'Creatives' | 'Fun';
  url: string;
}

const PRESET_AVATARS: PresetAvatar[] = [
  // Students & Scholars
  { id: 'av-s1', name: 'Sarah', category: 'Students', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Sarah&backgroundColor=b6e3f4,c0aede,d1d4f9' },
  { id: 'av-s2', name: 'Alex', category: 'Students', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Alex&backgroundColor=b6e3f4,c0aede,d1d4f9' },
  { id: 'av-s3', name: 'Jordan', category: 'Students', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Jordan&backgroundColor=ffd5dc,ffdfbf' },
  { id: 'av-s4', name: 'Maya', category: 'Students', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Maya&backgroundColor=c0aede,d1d4f9' },
  { id: 'av-s5', name: 'Leo', category: 'Students', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Leo&backgroundColor=b6e3f4,ffdfbf' },
  { id: 'av-s6', name: 'Chloe', category: 'Students', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Chloe&backgroundColor=ffd5dc,c0aede' },
  { id: 'av-s7', name: 'Dev', category: 'Students', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Dev&backgroundColor=b6e3f4,c0aede' },
  { id: 'av-s8', name: 'Aria', category: 'Students', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Aria&backgroundColor=ffdfbf,ffd5dc' },

  // Tech & Socratic Robots (Bottts)
  { id: 'av-r1', name: 'Nova', category: 'Robots', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nova&backgroundColor=b6e3f4,c0aede' },
  { id: 'av-r2', name: 'Sparky', category: 'Robots', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky&backgroundColor=ffdfbf,ffd5dc' },
  { id: 'av-r3', name: 'Byte', category: 'Robots', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Byte&backgroundColor=d1d4f9,c0aede' },
  { id: 'av-r4', name: 'Cosmo', category: 'Robots', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Cosmo&backgroundColor=b6e3f4,ffdfbf' },
  { id: 'av-r5', name: 'Pixel', category: 'Robots', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pixel&backgroundColor=ffd5dc,b6e3f4' },
  { id: 'av-r6', name: 'Gizmo', category: 'Robots', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo&backgroundColor=c0aede,d1d4f9' },

  // Creatives & Adventurers
  { id: 'av-c1', name: 'Astro', category: 'Creatives', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Astro' },
  { id: 'av-c2', name: 'Science', category: 'Creatives', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Science' },
  { id: 'av-c3', name: 'Explorer', category: 'Creatives', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Explorer' },
  { id: 'av-c4', name: 'Genius', category: 'Creatives', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Genius' },
  { id: 'av-c5', name: 'Champion', category: 'Creatives', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Champion' },
  { id: 'av-c6', name: 'Scholar', category: 'Creatives', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Scholar' },

  // Socratic Fun Emojis & Mascots
  { id: 'av-f1', name: 'Genius', category: 'Fun', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Genius' },
  { id: 'av-f2', name: 'Happy', category: 'Fun', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy' },
  { id: 'av-f3', name: 'Cool', category: 'Fun', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool' },
  { id: 'av-f4', name: 'Star', category: 'Fun', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Star' },
  { id: 'av-f5', name: 'Curious', category: 'Fun', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Curious' },
  { id: 'av-f6', name: 'Thinker', category: 'Fun', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Thinker' },
];

export const UserProfileModal: React.FC = () => {
  const { t } = useTranslation('common');
  const {
    currentUser,
    updateCurrentUser,
    isProfileOpen,
    setIsProfileOpen,
    lessonPlans,
    changePlatformLanguage,
    setCurrentBoard,
    boardsConfig,
    boardSubjectMappings,
    subjectsDB,
    topicsDB,
    activeGrades,
    activeCategories,
    currentBoard,
    globalLanguage,
  } = useApp();

  const role = currentUser?.role || 'student';

  // Form states - declared unconditionally at top level
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

  // Avatar Selection states
  const [showAvatarGallery, setShowAvatarGallery] = useState(true);
  const [avatarCategory, setAvatarCategory] = useState<'All' | 'Students' | 'Robots' | 'Creatives' | 'Fun'>('All');
  const [customSeedInput, setCustomSeedInput] = useState('');

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

  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    currentUser?.enrolledCourses || []
  );
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState<string>('ALL');
  const [boardSwitchWarning, setBoardSwitchWarning] = useState<string | null>(null);

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
      setEducationBoard(
        ((currentUser.education_board as EducationBoard) || currentBoard || 'CBSE')
      );
      setLanguageMedium(
        ((currentUser.preferred_language as LanguageMedium) || globalLanguage || 'en')
      );
      setSelectedCourses(currentUser.enrolledCourses || []);
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
  }, [currentUser, isProfileOpen, currentBoard, globalLanguage]);

  // Live Admin-managed relational curriculum subjects filtered for student's selected grade & board
  const availableGradeBoardSubjects = useMemo(() => {
    return resolveSubjectsForBoard(educationBoard, subjectsDB, boardSubjectMappings).filter((s) => {
      if (s.status !== 'ACTIVE') return false;
      if (s.grade_level !== gradeLevel) return false;
      if (activeCategories.length > 0 && s.category && !activeCategories.includes(s.category)) return false;
      return true;
    });
  }, [subjectsDB, boardSubjectMappings, gradeLevel, educationBoard, activeCategories]);

  const handleEducationBoardChange = (nextBoard: EducationBoard) => {
    setEducationBoard(nextBoard);
    const nextBoardSubjects = resolveSubjectsForBoard(
      nextBoard,
      subjectsDB,
      boardSubjectMappings
    ).filter((s) => s.status === 'ACTIVE');

    if (selectedCourses.length > 0) {
      const removedCourses: string[] = [];
      const compatibleCourses = selectedCourses.filter((entry) => {
        const matchesAny = nextBoardSubjects.some((subj) =>
          isSubjectEnrolled(subj, [entry], nextBoard)
        );
        if (!matchesAny) removedCourses.push(entry);
        return matchesAny;
      });
      if (removedCourses.length > 0) {
        setSelectedCourses(compatibleCourses);
        setBoardSwitchWarning(
          `Cleared ${removedCourses.join(', ')} because it is not mapped under ${BOARD_LABELS[nextBoard] || nextBoard}.`
        );
        return;
      }
    }
    setBoardSwitchWarning(null);
  };

  const displayedProfileSubjects = useMemo(() => {
    if (subjectCategoryFilter === 'ALL') return availableGradeBoardSubjects;
    return availableGradeBoardSubjects.filter((s) => (s.category || 'STEM') === subjectCategoryFilter);
  }, [availableGradeBoardSubjects, subjectCategoryFilter]);

  const gradeOptions = useMemo(() => {
    const set = new Set<number>(activeGrades.length > 0 ? activeGrades : [6, 7, 8, 9, 10, 11, 12]);
    set.add(gradeLevel);
    return Array.from(set).sort((a, b) => a - b);
  }, [activeGrades, gradeLevel]);

  const toggleCourseSelection = (subj: DBSubject) => {
    const localized = getLocalizedSubjectName(subj.name, educationBoard);
    const entry = formatEnrolledCourseEntry(localized, subj.code);
    const alreadySelected = isSubjectEnrolled(subj, selectedCourses, educationBoard);

    if (alreadySelected) {
      setSelectedCourses((prev) =>
        prev.filter((item) => !isSubjectEnrolled(subj, [item], educationBoard))
      );
    } else {
      setSelectedCourses((prev) => (prev.includes(entry) ? prev : [...prev, entry]));
    }
  };

  const handleSelectAllAvailable = () => {
    const entries = availableGradeBoardSubjects.map((s) =>
      formatEnrolledCourseEntry(getLocalizedSubjectName(s.name, educationBoard), s.code)
    );
    setSelectedCourses(entries);
  };

  const handleClearSelectedCourses = () => {
    setSelectedCourses([]);
  };

  // Filtered preset avatars based on selected category
  const filteredAvatars = useMemo(() => {
    if (avatarCategory === 'All') return PRESET_AVATARS;
    return PRESET_AVATARS.filter((a) => a.category === avatarCategory);
  }, [avatarCategory]);

  // Unified theme styles matching Student & Teacher panel dashboard
  const getThemeStyles = () => {
    return {
      accentBg: 'bg-gradient-to-r from-[#0D1B3E] via-[#0E1A2D] to-[#00A896]',
      badge: 'bg-[#00A896]/15 text-[#00A896] dark:bg-[#00A896]/20 dark:text-[#00A896] border border-[#00A896]/30',
      border: 'border-[#00A896]',
      btn: 'bg-[#00A896] hover:bg-[#009282] text-white shadow-xs',
      highlight: 'text-[#00A896] dark:text-[#00A896]',
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
      enrolledCourses: selectedCourses,
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
    setCurrentBoard(educationBoard);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) return;
    const nowTime = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    updateCurrentUser({
      passwordUpdatedAt: nowTime,
      credentialResetRequestedAt: undefined,
    });
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

  const handleRollRandomAvatar = () => {
    const randomSeed = `PivotIQ-${Math.floor(Math.random() * 100000)}`;
    const randomUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    setAvatarSeed(randomUrl);
    updateCurrentUser({ avatar: randomUrl });
  };

  // Safe early render guard after all hooks
  if (!isProfileOpen || !currentUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-[#132A4C] shadow-2xl overflow-hidden my-8 transition-colors">
        {/* Modal Header - matching Student & Teacher panel dark navy header */}
        <div className={`p-6 ${themeStyles.accentBg} text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-normal text-xl shadow-inner border border-white/20">
              {role === 'student' && <GraduationCap className="w-6 h-6 text-white" />}
              {role === 'teacher' && <Briefcase className="w-6 h-6 text-white" />}
              {role === 'admin' && <ShieldCheck className="w-6 h-6 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-normal text-white">{currentUser?.name || 'User'}</h2>
                <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-white/20 uppercase tracking-wider text-white">
                  {currentUser?.role || role}
                </span>
              </div>
              <p className="text-xs text-white/80">{t('profileModal.title')}</p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label={t('actions.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {(currentUser.isFlagged || currentUser.credentialResetRequestedAt) && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-normal space-y-1">
              {currentUser.isFlagged && (
                <div>
                  Account Flagged by Administrator: {currentUser.flagReason || 'Verification review active.'}
                </div>
              )}
              {currentUser.credentialResetRequestedAt && (
                <div>
                  Security Notice: Admin triggered a credential reset ({currentUser.credentialResetRequestedAt}). Please update your password below.
                </div>
              )}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-normal flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('profileModal.savedToast')}</span>
            </div>
          )}

          {/* COMMON FIELDS FORM */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-normal text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#00A896]" />
                <span>{t('profileModal.accountTab')}</span>
              </h3>
              <div className="flex items-center gap-2">
                <label className="text-xs font-normal text-slate-500 dark:text-white">Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                  className="text-xs font-normal px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#1C3A66] bg-slate-50 dark:bg-[#132A4C]/60 text-slate-800 dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#00A896]"
                >
                  <option value="Active">{t('statuses.ACTIVE')}</option>
                  <option value="Inactive">{t('statuses.INACTIVE')}</option>
                </select>
              </div>
            </div>

            {/* AVATAR PROFILE PICKER WITH RICH CURATED GALLERY */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#132A4C]/40 border border-slate-200/80 dark:border-[#1C3A66] space-y-3.5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0D1B3E] to-[#00A896] flex items-center justify-center text-white text-xl font-normal shadow-md overflow-hidden relative ring-2 ring-[#00A896]/60 shrink-0">
                  {avatarSeed && (avatarSeed.startsWith('data:') || avatarSeed.startsWith('http') || avatarSeed.startsWith('/')) ? (
                    <img src={avatarSeed} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{name.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-normal text-slate-800 dark:text-white block">
                      {t('profileModal.chooseAvatar')}
                    </label>
                    <span className="text-[10px] text-[#00A896] font-normal">Live Preview</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-white">
                    Choose an avatar from the gallery, roll a fresh style, or upload a custom photo.
                  </p>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowAvatarGallery(!showAvatarGallery)}
                      className="px-3 py-1.5 rounded-lg bg-[#00A896] hover:bg-[#009282] text-white text-[11px] font-normal flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{showAvatarGallery ? 'Collapse Gallery' : 'Select Avatar Gallery'}</span>
                    </button>

                    <label className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#132A4C] hover:bg-slate-100 dark:hover:bg-[#1C3A66] text-slate-700 dark:text-white text-[11px] font-normal flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#00A896]" />
                      <span>Upload Image</span>
                      <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                    </label>

                    <button
                      type="button"
                      onClick={handleRollRandomAvatar}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#132A4C] border border-slate-200 dark:border-slate-700 text-[11px] font-normal text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1C3A66] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Roll a random avatar"
                    >
                      <RefreshCw className="w-3 h-3 text-[#00A896]" />
                      <span>Randomize</span>
                    </button>

                    {avatarSeed && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarSeed('');
                          updateCurrentUser({ avatar: '' });
                        }}
                        className="px-2 py-1.5 rounded-lg text-slate-500 hover:text-rose-500 text-[11px] font-normal transition-colors cursor-pointer"
                      >
                        {t('actions.reset')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Avatar Gallery Grid with Categories */}
              {showAvatarGallery && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
                  {/* Category Filter Pills */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[11px] flex-wrap">
                      {(['All', 'Students', 'Robots', 'Creatives', 'Fun'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setAvatarCategory(cat)}
                          className={`px-2.5 py-0.5 rounded-full font-normal transition-colors cursor-pointer ${
                            avatarCategory === cat
                              ? 'bg-[#00A896] text-white shadow-2xs'
                              : 'bg-white dark:bg-[#0D1B3E] text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1C3A66] border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-white hidden sm:inline">
                      Click any avatar to select
                    </span>
                  </div>

                  {/* Avatar Thumbnail Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-44 overflow-y-auto p-2 rounded-xl bg-white dark:bg-[#0D1B3E] border border-slate-200 dark:border-[#1C3A66]">
                    {filteredAvatars.map((item) => {
                      const isSelected = avatarSeed === item.url;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setAvatarSeed(item.url);
                            updateCurrentUser({ avatar: item.url });
                          }}
                          className={`relative group aspect-square rounded-xl p-1 transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'ring-2 ring-[#00A896] bg-[#00A896]/15 scale-105 shadow-xs'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:scale-102 border border-transparent'
                          }`}
                          title={`Select ${item.name} (${item.category})`}
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#00A896] text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                          <span className="text-[9px] text-slate-500 dark:text-white truncate max-w-full block leading-none mt-0.5 font-normal">
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Seed Input Generator */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="relative flex-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#00A896] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customSeedInput}
                        onChange={(e) => setCustomSeedInput(e.target.value)}
                        placeholder="Or type a custom name to generate unique avatar (e.g. Einstein, Ada)..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#0D1B3E] text-[11px] text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A896]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!customSeedInput.trim()) return;
                        const customUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(customSeedInput.trim())}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                        setAvatarSeed(customUrl);
                        updateCurrentUser({ avatar: customUrl });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#00A896] hover:bg-[#009282] text-white text-[11px] font-normal transition-colors cursor-pointer shrink-0"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-normal text-slate-700 dark:text-white mb-1">
                  {t('profileModal.fullName')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#132A4C]/60 text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 dark:text-white mb-1">
                  {t('profileModal.email')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#132A4C]/60 text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                  />
                </div>
              </div>
            </div>

            {/* STUDENT ACADEMIC & INSTITUTIONAL CONFIGURATION */}
            {role === 'student' && (
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-normal uppercase tracking-wider text-[#00A896] dark:text-[#00A896] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>{t('profileModal.academicConfig')}</span>
                  </h4>
                  <span className="text-[10px] bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] px-2.5 py-0.5 rounded-full font-normal border border-[#00A896]/30">
                    Auto-Syncs With AI Tutor
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Grade Dropdown (Dynamic Admin Active Grades) */}
                  <div>
                    <label className="block text-[11px] font-normal text-slate-700 dark:text-white mb-1">
                      {t('profileModal.gradeLevel')}
                    </label>
                    <select
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#132A4C]/60 text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                    >
                      {gradeOptions.map((g) => (
                        <option key={g} value={g}>
                          {t('curriculumExplorer.gradeOption', { grade: g })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stream Selection */}
                  {(gradeLevel === 11 || gradeLevel === 12) && (
                    <div>
                      <label className="block text-[11px] font-normal text-slate-700 dark:text-white mb-1">
                        {t('profileModal.stream')}
                      </label>
                      <select
                        value={stream}
                        onChange={(e) => setStream(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#00A896]/40 dark:border-[#00A896]/40 bg-[#00A896]/10 dark:bg-[#132A4C]/60 text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                      >
                        <option value="Science (PCM/PCB)">Science (PCM / PCB)</option>
                        <option value="Commerce">Commerce (Accountancy & Economics)</option>
                        <option value="Arts / Humanities">Arts & Humanities</option>
                      </select>
                    </div>
                  )}

                  {/* Education Board Selection */}
                  <div>
                    <label className="block text-[11px] font-normal text-slate-700 dark:text-white mb-1">
                      {t('profileModal.governingBoard')}
                    </label>
                    <select
                      value={educationBoard}
                      onChange={(e) => handleEducationBoardChange(e.target.value as EducationBoard)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#132A4C]/60 text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                    >
                      {boardsConfig.map((b) => (
                        <option key={b.board_id} value={b.board_id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language Medium Selection (Bidirectionally synced with Top-Nav Switcher) */}
                  <div>
                    <label className="block text-[11px] font-normal text-slate-700 dark:text-white mb-1">
                      {t('profileModal.preferredMedium')}
                    </label>
                    <select
                      value={languageMedium}
                      onChange={(e) => {
                        const nextLang = e.target.value as LanguageMedium;
                        setLanguageMedium(nextLang);
                        void changePlatformLanguage(nextLang, { silent: true });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#132A4C]/60 text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                    >
                      {SUPPORTED_LOCALES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.code === 'en' ? l.nativeName : `${l.nativeName} (${l.englishName})`}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 dark:text-slate-300 mt-1">
                      {t('profileModal.preferredMediumHint')}
                    </p>
                  </div>
                </div>

                {/* LIVE ADMIN CURRICULUM SUBJECT SELECTION */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#132A4C]/40 border border-slate-200/80 dark:border-[#1C3A66] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#00A896]" />
                        <span>
                          Select Subjects for Grade {gradeLevel} &bull; {BOARD_LABELS[educationBoard] || educationBoard}
                        </span>
                      </h5>
                      <p className="text-[10px] text-slate-500 dark:text-white/80 mt-0.5">
                        Live synced with Admin Curriculum ({availableGradeBoardSubjects.length} subjects available, {selectedCourses.length} selected)
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleSelectAllAvailable}
                        className="px-2.5 py-1 rounded-lg bg-[#00A896]/15 hover:bg-[#00A896]/25 text-[#00A896] text-[10px] font-normal border border-[#00A896]/30 cursor-pointer transition-colors"
                      >
                        Select All ({availableGradeBoardSubjects.length})
                      </button>
                      {selectedCourses.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearSelectedCourses}
                          className="px-2 py-1 rounded-lg bg-white dark:bg-[#0D1B3E] hover:text-rose-500 text-slate-500 dark:text-white/80 text-[10px] font-normal border border-slate-200 dark:border-[#1C3A66] cursor-pointer transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['ALL', ...(activeCategories.length > 0 ? activeCategories : ['STEM', 'Language Arts', 'Humanities', 'Arts & Electives'])]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSubjectCategoryFilter(cat)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-normal transition-colors cursor-pointer ${
                          subjectCategoryFilter === cat
                            ? 'bg-[#00A896] text-white shadow-2xs'
                            : 'bg-white dark:bg-[#0D1B3E] text-slate-600 dark:text-white border border-slate-200 dark:border-[#1C3A66] hover:bg-slate-100 dark:hover:bg-[#1C3A66]'
                        }`}
                      >
                        {cat === 'ALL' ? t('curriculumExplorer.allDomains') : translateCategoryLabel(cat, t)}
                      </button>
                    ))}
                  </div>

                  {boardSwitchWarning && (
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{boardSwitchWarning}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setBoardSwitchWarning(null)}
                        className="text-amber-700 dark:text-amber-300 hover:underline text-[10px] cursor-pointer shrink-0"
                      >
                        {t('header.dismiss')}
                      </button>
                    </div>
                  )}

                  {/* Subject Selection Checklist Grid */}
                  {displayedProfileSubjects.length === 0 ? (
                    <p className="text-[11px] text-slate-500 dark:text-white/80 py-2">
                      No active subjects found in this domain for Grade {gradeLevel} ({educationBoard}). Ask Admin to publish subjects or switch domain filter.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                      {displayedProfileSubjects.map((subj) => {
                        const isSelected = isSubjectEnrolled(subj, selectedCourses, educationBoard);
                        const localizedName = translateSubjectLabel(
                          getLocalizedSubjectName(subj.name, educationBoard),
                          t
                        );
                        const topicCount = topicsDB.filter(
                          (t) => t.subject_id === subj.id && t.status === 'ACTIVE'
                        ).length;

                        return (
                          <button
                            key={subj.id}
                            type="button"
                            onClick={() => toggleCourseSelection(subj)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                              isSelected
                                ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 border-[#00A896] ring-1 ring-[#00A896]/40'
                                : 'bg-white dark:bg-[#0D1B3E] border-slate-200 dark:border-[#1C3A66] hover:border-[#00A896]/50'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-normal text-slate-900 dark:text-white truncate">
                                  {localizedName}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 dark:text-white/80">
                                <span>{subj.code || `GR-${subj.grade_level}`}</span>
                                <span>&bull;</span>
                                <span>{topicCount} {topicCount === 1 ? 'Topic' : 'Topics'}</span>
                                {subj.board && subj.board !== 'ALL' && (
                                  <>
                                    <span>&bull;</span>
                                    <span className="text-[#00A896]">{subj.board}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                                isSelected
                                  ? 'bg-[#00A896] border-[#00A896] text-white'
                                  : 'border-slate-300 dark:border-slate-600 text-transparent'
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* School Autocomplete & Location */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-normal text-slate-700 dark:text-white mb-1">
                      Enrolled School Name & Location (India-Wide Coverage)
                    </label>
                    <SchoolAutocomplete
                      selectedSchoolName={schoolData.name}
                      selectedSchoolAddress={schoolData.address}
                      onSelectSchool={(school) => setSchoolData(school)}
                    />
                  </div>

                  <SchoolLocationMap
                    lat={schoolData.lat}
                    lng={schoolData.lng}
                    schoolName={schoolData.name}
                    address={schoolData.address}
                  />
                </div>

                {/* Contact & Guardian details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-normal text-slate-700 dark:text-white mb-1">
                      {t('auth.mobileNumber')}
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#132A4C]/60 text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-normal text-slate-700 dark:text-white mb-1">
                      {t('profileModal.guardianName')}
                    </label>
                    <div className="relative">
                      <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        placeholder="David Connor"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#132A4C]/60 text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-normal text-slate-700 dark:text-white mb-1">
                      {t('profileModal.guardianPhone')}
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        placeholder="+91 98765 11223"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#132A4C]/60 text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-normal text-slate-700 dark:text-white mb-1">
                      {t('profileModal.guardianEmail')}
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={guardianEmail}
                        onChange={(e) => setGuardianEmail(e.target.value)}
                        placeholder="david.c@guardian.org"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#132A4C]/60 text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TEACHER ACADEMIC & FACULTY CONFIGURATION */}
            {role === 'teacher' && (
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-normal uppercase tracking-wider text-[#00A896] dark:text-[#00A896] flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    <span>Faculty & Department Assignments</span>
                  </h4>
                  <span className="text-[10px] bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] px-2.5 py-0.5 rounded-full font-normal border border-[#00A896]/30">
                    Socratic Studio Enabled
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-normal text-slate-700 dark:text-white mb-1">
                      Department Specialization
                    </label>
                    <select
                      value={teacherDepartment}
                      onChange={(e) => setTeacherDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#132A4C]/60 text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                    >
                      <option value="Life Sciences & Biology">Life Sciences & Biology</option>
                      <option value="Physics & Astronomy">Physics & Astronomy</option>
                      <option value="Pure Mathematics & Calculus">Pure Mathematics & Calculus</option>
                      <option value="Chemical Sciences">Chemical Sciences</option>
                      <option value="Language Arts & Literature">Language Arts & Literature</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-normal text-slate-700 dark:text-white mb-1">
                      Primary Assigned Cohort
                    </label>
                    <select
                      value={teacherAssignedClass}
                      onChange={(e) => setTeacherAssignedClass(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#132A4C]/60 text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896] cursor-pointer"
                    >
                      <option value="Class 7B - Science">Class 7B - Science (28 Students)</option>
                      <option value="Class 8A - Physics">Class 8A - Physics (32 Students)</option>
                      <option value="Class 8C - Adv Biology">Class 8C - Adv Biology (24 Students)</option>
                      <option value="Class 9A - Laboratory">Class 9A - Laboratory (18 Students)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-slate-700 dark:text-white mb-1">
                    Faculty Cabin / Desk Room
                  </label>
                  <input
                    type="text"
                    value={teacherCabin}
                    onChange={(e) => setTeacherCabin(e.target.value)}
                    placeholder="e.g. Lab 3B - Science Wing"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#132A4C]/60 text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-xs font-normal text-[#00A896] dark:text-[#00A896] flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{showPasswordSection ? 'Hide Password Reset' : t('profileModal.passwordReset')}</span>
              </button>

              <button
                type="submit"
                className={`px-4 py-2 rounded-xl text-xs font-normal shadow-xs transition-colors cursor-pointer ${themeStyles.btn}`}
              >
                {t('profileModal.saveChanges')}
              </button>
            </div>
          </form>

          {/* PASSWORD RESET SECTION */}
          {showPasswordSection && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#132A4C]/40 border border-slate-200 dark:border-[#1C3A66] space-y-3">
              <h4 className="text-xs font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#00A896]" />
                <span>{t('profileModal.passwordReset')}</span>
              </h4>

              {passwordSuccess ? (
                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-normal flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Password updated securely!</span>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-normal text-slate-600 dark:text-white mb-1">
                        {t('profileModal.currentPassword')}
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#0D1B3E] text-xs font-normal text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-normal text-slate-600 dark:text-white mb-1">
                        {t('profileModal.newPassword')}
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#0D1B3E] text-xs font-normal text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-normal text-slate-600 dark:text-white mb-1">
                        {t('profileModal.confirmPassword')}
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1C3A66] bg-white dark:bg-[#0D1B3E] text-xs font-normal text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-[#00A896] hover:bg-[#009282] text-white text-xs font-normal cursor-pointer transition-colors"
                  >
                    {t('profileModal.updatePasswordBtn')}
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
                <h4 className="text-xs font-normal uppercase tracking-wider text-[#00A896] dark:text-[#00A896] flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Academic Overview</span>
                </h4>
                <span className="text-xs text-slate-500 dark:text-white">
                  Enrolled: {currentUser?.enrollmentDate || 'Sep 1, 2025'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#132A4C]/50 border border-slate-200/80 dark:border-[#1C3A66] text-center">
                  <span className="text-[10px] text-slate-500 dark:text-white block font-normal">Class Grade</span>
                  <span className="text-sm font-normal text-[#00A896]">
                    {currentUser?.grade || '8th Grade'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#132A4C]/50 border border-slate-200/80 dark:border-[#1C3A66] text-center">
                  <span className="text-[10px] text-slate-500 dark:text-white block font-normal">Cumulative GPA</span>
                  <span className="text-sm font-normal text-emerald-600 dark:text-emerald-400">
                    {currentUser?.gpa || 3.85}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#132A4C]/50 border border-slate-200/80 dark:border-[#1C3A66] text-center">
                  <span className="text-[10px] text-slate-500 dark:text-white block font-normal">Attendance</span>
                  <span className="text-sm font-normal text-teal-600 dark:text-teal-400">
                    {currentUser?.attendance || 98}%
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#132A4C]/50 border border-slate-200/80 dark:border-[#1C3A66] text-center">
                  <span className="text-[10px] text-slate-500 dark:text-white block font-normal">Overall Mastery</span>
                  <span className="text-sm font-normal text-[#00A896]">
                    {currentUser?.overallProgress || 84}%
                  </span>
                </div>
              </div>

              {/* Dynamic Progress Overview */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#132A4C]/40 border border-slate-200 dark:border-[#1C3A66] space-y-3">
                <h5 className="text-xs font-normal text-slate-800 dark:text-white flex items-center justify-between">
                  <span>Dynamic Subject Progress</span>
                  <span className="text-[10px] text-slate-500 dark:text-white/80 font-normal">Real-Time Sync</span>
                </h5>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-normal text-slate-600 dark:text-white mb-1">
                      <span>Physics (Newton's Laws)</span>
                      <span>{currentUser?.physicsProgress || 75}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#00A896] h-full rounded-full transition-all duration-500"
                        style={{ width: `${currentUser?.physicsProgress || 75}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-normal text-slate-600 dark:text-white mb-1">
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
                    <div className="flex justify-between text-[11px] font-normal text-slate-600 dark:text-white mb-1">
                      <span>Mathematics & Algebra</span>
                      <span>{currentUser?.mathProgress || 92}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${currentUser?.mathProgress || 92}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-normal text-slate-800 dark:text-white">
                    Enrolled Course Modules ({selectedCourses.length}):
                  </h5>
                  <span className="text-[10px] text-[#00A896] font-normal">
                    Grade {gradeLevel} &bull; {educationBoard}
                  </span>
                </div>
                {selectedCourses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedCourses.map((course, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl text-xs font-normal bg-white dark:bg-[#132A4C] border border-slate-200 dark:border-[#1C3A66] text-slate-700 dark:text-white shadow-2xs flex items-center gap-1.5"
                      >
                        <span>📚 {course}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCourses((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Remove subject (remember to click Save Details)"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-white/80 italic">
                    No subjects selected yet. Choose subjects in "Academic & Curriculum Configuration" above and click Save Details.
                  </p>
                )}
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
                <div className="p-3.5 rounded-2xl bg-[#00A896]/10 dark:bg-[#132A4C]/50 border border-[#00A896]/30 dark:border-[#1C3A66] space-y-1">
                  <span className="text-[11px] font-normal text-slate-500 dark:text-white block">
                    Department Specialization
                  </span>
                  <span className="text-sm font-normal text-slate-900 dark:text-white">
                    {currentUser?.department || teacherDepartment}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#132A4C]/50 border border-slate-200 dark:border-[#1C3A66] space-y-1">
                  <span className="text-[11px] font-normal text-slate-500 dark:text-white block">
                    Active Student Cohorts
                  </span>
                  <span className="text-sm font-normal text-slate-900 dark:text-white">
                    {currentUser?.activeStudentsCount || 58} Students Assigned
                  </span>
                </div>
              </div>

              {/* Assigned Cohorts */}
              <div>
                <h5 className="text-xs font-normal text-slate-800 dark:text-white mb-2">
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
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#132A4C]/40 border border-slate-200 dark:border-[#1C3A66] space-y-2">
                <div className="flex items-center justify-between text-xs font-normal text-slate-800 dark:text-white">
                  <span>Created Lesson Plans ({lessonPlans.length})</span>
                  <span className="text-[#00A896] text-[11px]">AI Curriculum Studio</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {lessonPlans.slice(0, 3).map((plan) => (
                    <div
                      key={plan.id}
                      className="p-2 rounded-xl bg-white dark:bg-[#0D1B3E] border border-slate-100 dark:border-[#1C3A66] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-normal text-slate-900 dark:text-white block">
                          {plan.topic}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-white/80">
                          {plan.grade} &bull; {plan.duration}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-normal">
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
                <h4 className="text-xs font-normal uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Administrative Security Credentials</span>
                </h4>
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                  {currentUser?.permissionLevel || 'Super Admin'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-[#132A4C]/50 border border-cyan-200/60 dark:border-[#1C3A66] space-y-1">
                <span className="text-[11px] font-normal text-slate-500 dark:text-white block">
                  Permissions Scope
                </span>
                <p className="text-xs text-slate-700 dark:text-white leading-relaxed font-normal">
                  Authorized for ecosystem-wide CRUD management, real-time proctoring anomaly controls, certificate cryptography, and multi-portal switching.
                </p>
              </div>

              {/* Activity Logs */}
              <div>
                <h5 className="text-xs font-normal text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
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
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1B3E] border border-slate-200/80 dark:border-[#1C3A66] text-xs flex items-start gap-2.5"
                    >
                      <span className="text-[10px] font-normal text-cyan-600 dark:text-cyan-400 whitespace-nowrap pt-0.5">
                        {log.timestamp}
                      </span>
                      <span className="text-slate-700 dark:text-white font-normal">{log.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#0D1B3E] border-t border-slate-200 dark:border-[#132A4C] flex justify-end">
          <button
            onClick={() => setIsProfileOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-normal bg-slate-200 hover:bg-slate-300 dark:bg-[#132A4C] dark:hover:bg-[#1C3A66] text-slate-800 dark:text-white transition-colors cursor-pointer"
          >
            {t('actions.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
