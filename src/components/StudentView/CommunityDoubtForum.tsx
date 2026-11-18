import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Flag,
  Flame,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  Play,
  Plus,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Users,
  Video,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CommunityPost, ForumSpace } from '../../types';
import { SubjectIcon } from '../common/SubjectIcon';
import { translateSubjectLabel } from '../../i18n/helpers';

interface CommunityDoubtForumProps {
  isModeratorView?: boolean;
  onJoinLiveSession?: () => void;
}

const SUBJECT_OPTIONS = [
  'All',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Coding',
  'English',
  'Computer Science',
  'General Science',
];

const CHAPTER_PRESETS = [
  'All Chapters',
  'Class 10 Algebra',
  'Python Basics',
  'Organic Chemistry',
  'Calculus & Derivatives',
  'Thermodynamics & Heat Cycles',
  'Critical Reading & Essay Craft',
];

const RESOURCE_TYPES: Array<'Notes' | 'Previous Paper' | 'Revision Material' | 'Recommended Video'> = [
  'Notes',
  'Previous Paper',
  'Revision Material',
  'Recommended Video',
];

export const CommunityDoubtForum: React.FC<CommunityDoubtForumProps> = ({
  isModeratorView = false,
  onJoinLiveSession,
}) => {
  const {
    currentUser,
    communityPosts,
    forumStudyGroups,
    forumResources,
    forumPoints,
    peerAnswersThisWeek,
    liveSessionRsvp,
    toggleLiveSessionRsvp,
    addCommunityPost,
    addCommunityComment,
    upvoteCommunityPost,
    upvoteCommunityComment,
    acceptCommunityComment,
    flagCommunityPost,
    resolveFlaggedCommunityPost,
    verifyCommunityPost,
    joinOrLeaveStudyGroup,
    createStudyGroup,
    addStudyGroupMessage,
    addForumResource,
    upvoteForumResource,
  } = useApp();
  const { t } = useTranslation(['student', 'common']);

  const currentUserName = currentUser?.name || 'Praveen Bhatia';
  const currentUserId = currentUser?.id || 'user-stu-1';
  const isEducator = isModeratorView || currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  // Navigation & Filters
  const [activeSpace, setActiveSpace] = useState<ForumSpace>('subject-doubts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedChapter, setSelectedChapter] = useState('All Chapters');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'priority' | 'upvotes' | 'newest'>('priority');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(communityPosts[0]?.id || null);

  // Reply & Moderator Inputs per Post
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyErrors, setReplyErrors] = useState<Record<string, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const [verifyDrafts, setVerifyDrafts] = useState<Record<string, string>>({});
  const [showVerifyFormId, setShowVerifyFormId] = useState<string | null>(null);

  // Modals
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isDigestModalOpen, setIsDigestModalOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);

  // Ask Doubt Form State
  const [askSpace, setAskSpace] = useState<'subject-doubts' | 'assignment-exam'>('subject-doubts');
  const [askSubject, setAskSubject] = useState('Mathematics');
  const [askChapter, setAskChapter] = useState('Class 10 Algebra');
  const [askGrade, setAskGrade] = useState<number>(Number(currentUser?.grade_level) || 10);
  const [askTitle, setAskTitle] = useState('');
  const [askContent, setAskContent] = useState('');
  const [askAttempt, setAskAttempt] = useState('');
  const [askAttachment, setAskAttachment] = useState<string | undefined>(undefined);
  const [askHighPriority, setAskHighPriority] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [isSubmittingAsk, setIsSubmittingAsk] = useState(false);

  // Study Groups State
  const [groupSubjectFilter, setGroupSubjectFilter] = useState('All');
  const [groupMessageDrafts, setGroupMessageDrafts] = useState<Record<string, string>>({});
  const [activeGroupId, setActiveGroupId] = useState<string | null>(forumStudyGroups[0]?.id || null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('Mathematics');
  const [newGroupChapter, setNewGroupChapter] = useState('Class 10 Algebra');
  const [newGroupGrade, setNewGroupGrade] = useState(10);
  const [newGroupAvailability, setNewGroupAvailability] = useState('Thu & Sat · 5:00 PM');
  const [newGroupGoal, setNewGroupGoal] = useState('');

  // Resource Library State
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('All');
  const [resourceSubjectFilter, setResourceSubjectFilter] = useState<string>('All');
  const [newResTitle, setNewResTitle] = useState('');
  const [newResType, setNewResType] = useState<'Notes' | 'Previous Paper' | 'Revision Material' | 'Recommended Video'>('Notes');
  const [newResSubject, setNewResSubject] = useState('Mathematics');
  const [newResChapter, setNewResChapter] = useState('Class 10 Algebra');
  const [newResGrade, setNewResGrade] = useState(10);
  const [newResDesc, setNewResDesc] = useState('');
  const [newResUrl, setNewResUrl] = useState('');

  const isPostUnanswered = (post: CommunityPost) =>
    !post.accepted_comment_id && !post.is_verified && post.comments.length === 0;

  const isPostNeedsAccepted = (post: CommunityPost) =>
    !post.accepted_comment_id && !post.is_verified;

  const unansweredCount = useMemo(
    () => communityPosts.filter((p) => p.status === 'ACTIVE' && isPostNeedsAccepted(p)).length,
    [communityPosts]
  );

  const flaggedCount = useMemo(
    () => communityPosts.filter((p) => p.status === 'ACTIVE' && p.is_flagged).length,
    [communityPosts]
  );

  const doubtOfTheDay = useMemo(
    () => communityPosts.find((p) => p.is_doubt_of_the_day) || communityPosts[0],
    [communityPosts]
  );

  const availableChapters = useMemo(() => {
    const fromPosts = communityPosts
      .map((p) => p.chapter_unit || p.topic)
      .filter((c): c is string => Boolean(c && c.trim()));
    return Array.from(new Set([...CHAPTER_PRESETS, ...fromPosts]));
  }, [communityPosts]);

  const bestAnswerCountForUser = useMemo(() => {
    let count = 0;
    communityPosts.forEach((p) => {
      p.comments.forEach((c) => {
        if (c.is_accepted && (c.author_id === currentUserId || c.author_name === currentUserName)) {
          count += 1;
        }
      });
    });
    return count;
  }, [communityPosts, currentUserId, currentUserName]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = communityPosts.filter((post) => {
      if (post.status !== 'ACTIVE') return false;
      if (activeSpace === 'assignment-exam' && post.space !== 'assignment-exam') return false;
      if (activeSpace === 'unanswered' && !isPostNeedsAccepted(post)) return false;

      if (selectedSubject !== 'All' && post.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }

      if (selectedChapter !== 'All Chapters') {
        const chapterText = (post.chapter_unit || post.topic || '').toLowerCase();
        if (chapterText !== selectedChapter.toLowerCase()) return false;
      }

      if (selectedGrade !== 'All' && post.grade_level !== Number(selectedGrade)) {
        return false;
      }

      if (q) {
        const hay = `${post.title} ${post.content} ${post.subject} ${post.chapter_unit || ''} ${post.topic || ''} ${post.author_name} ${post.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
      if (sortBy === 'priority') {
        const aScore = (a.is_flagged && isEducator ? 100 : 0) + (isPostNeedsAccepted(a) ? 20 : 0) + (a.is_high_priority ? 10 : 0);
        const bScore = (b.is_flagged && isEducator ? 100 : 0) + (isPostNeedsAccepted(b) ? 20 : 0) + (b.is_high_priority ? 10 : 0);
        if (bScore !== aScore) return bScore - aScore;
        return b.upvotes - a.upvotes;
      }
      return 0;
    });
  }, [communityPosts, activeSpace, selectedSubject, selectedChapter, selectedGrade, searchQuery, sortBy, isEducator]);

  const filteredStudyGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return forumStudyGroups.filter((g) => {
      if (groupSubjectFilter !== 'All' && g.subject.toLowerCase() !== groupSubjectFilter.toLowerCase()) {
        return false;
      }
      if (q) {
        const hay = `${g.name} ${g.subject} ${g.chapter_unit} ${g.focus_goal} ${g.availability}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [forumStudyGroups, groupSubjectFilter, searchQuery]);

  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return forumResources.filter((r) => {
      if (resourceTypeFilter !== 'All' && r.resource_type !== resourceTypeFilter) return false;
      if (resourceSubjectFilter !== 'All' && r.subject.toLowerCase() !== resourceSubjectFilter.toLowerCase()) {
        return false;
      }
      if (q) {
        const hay = `${r.title} ${r.subject} ${r.chapter_unit} ${r.description} ${r.author_name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [forumResources, resourceTypeFilter, resourceSubjectFilter, searchQuery]);

  const weeklyDigestData = useMemo(() => {
    const topQuestions = [...communityPosts]
      .filter((p) => p.status === 'ACTIVE')
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 3);
    const bestAccepted = communityPosts.filter((p) => p.accepted_comment_id || p.is_verified).slice(0, 3);
    const latestResources = forumResources.slice(0, 3);
    return { topQuestions, bestAccepted, latestResources };
  }, [communityPosts, forumResources]);

  const handleScreenshotUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAskAttachment(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    setAskError(null);
    if (askTitle.trim().length < 8) {
      setAskError(t('student:community.errTitleShort'));
      return;
    }
    if (askContent.trim().length < 15) {
      setAskError(t('student:community.errContentShort'));
      return;
    }
    setIsSubmittingAsk(true);
    const result = await addCommunityPost({
      author_id: currentUserId,
      author_name: currentUserName,
      author_role: currentUser?.role || 'student',
      title: askTitle.trim(),
      content: askContent.trim(),
      attempted_solution: askAttempt.trim() || undefined,
      attachment_preview: askAttachment,
      space: askSpace,
      subject: askSubject,
      chapter_unit: askChapter.trim() || askSubject,
      grade_level: askGrade,
      topic: askChapter.trim() || askSubject,
      is_high_priority: askHighPriority,
      tags: [askSubject, askChapter.trim() || 'Doubt', askSpace === 'assignment-exam' ? 'ExamHelp' : 'Concept'],
    });
    setIsSubmittingAsk(false);

    if (!result.success) {
      setAskError(result.error || t('student:community.errPostGeneric'));
      return;
    }

    setAskTitle('');
    setAskContent('');
    setAskAttempt('');
    setAskAttachment(undefined);
    setAskHighPriority(false);
    setIsAskModalOpen(false);
    setActiveSpace(askSpace);
  };

  const handleSubmitReply = async (postId: string) => {
    const content = (replyDrafts[postId] || '').trim();
    if (!content) return;
    setReplyErrors((prev) => ({ ...prev, [postId]: '' }));
    setSubmittingReplyId(postId);
    const res = await addCommunityComment(postId, content);
    setSubmittingReplyId(null);
    if (!res.success) {
      setReplyErrors((prev) => ({ ...prev, [postId]: res.error || t('student:community.errReplyGeneric') }));
      return;
    }
    setReplyDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupGoal.trim()) return;
    createStudyGroup({
      name: newGroupName.trim(),
      subject: newGroupSubject,
      chapter_unit: newGroupChapter.trim() || newGroupSubject,
      grade_level: newGroupGrade,
      availability: newGroupAvailability.trim() || 'Flexible Evenings',
      focus_goal: newGroupGoal.trim(),
    });
    setNewGroupName('');
    setNewGroupGoal('');
    setIsCreateGroupOpen(false);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim() || !newResDesc.trim()) return;
    addForumResource({
      title: newResTitle.trim(),
      resource_type: newResType,
      subject: newResSubject,
      chapter_unit: newResChapter.trim() || newResSubject,
      grade_level: newResGrade,
      description: newResDesc.trim(),
      url: newResUrl.trim() || undefined,
    });
    setNewResTitle('');
    setNewResDesc('');
    setNewResUrl('');
    setIsAddResourceOpen(false);
  };

  const renderInitialsAvatar = (name: string, role?: string) => {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
    const tone =
      role === 'teacher' || role === 'admin'
        ? 'bg-[#00A896] text-white'
        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white';
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-lollipop-regular shrink-0 ${tone}`}>
        {initials || 'ST'}
      </div>
    );
  };

  const challengeTarget = 2;
  const challengeProgress = Math.min(100, Math.round((peerAnswersThisWeek / challengeTarget) * 100));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-lollipop-regular text-slate-900 dark:text-white tracking-wide">
              {t('student:community.heading')}
            </h2>
            <span className="text-xs font-lollipop-regular text-[#00A896]">
              {t('student:community.headerBadge')}
            </span>
          </div>
          <p className="text-sm font-lollipop-regular text-slate-600 dark:text-slate-300">
            {t('student:community.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsDigestModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white text-xs sm:text-sm font-lollipop-regular flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>{t('student:community.weeklyDigest')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRulesModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white text-xs sm:text-sm font-lollipop-regular flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-[#00A896]" />
            <span>{t('student:community.participationRules')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAskModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs sm:text-sm font-lollipop-regular shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{t('student:community.askDoubt')}</span>
          </button>
        </div>
      </div>

      {/* Engagement Strip: Doubt of the Day · Peer-Answer Challenge · Live Session */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* 1. Doubt of the Day */}
        <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-lollipop-regular text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                <span>{t('student:community.doubtOfDay')}</span>
              </span>
              {doubtOfTheDay && (
                <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <SubjectIcon subject={doubtOfTheDay.subject} size="xs" />
                  <span>
                    {translateSubjectLabel(doubtOfTheDay.subject, t)} ·{' '}
                    {doubtOfTheDay.chapter_unit ||
                      `${t('student:community.filterGrade')} ${doubtOfTheDay.grade_level}`}
                  </span>
                </span>
              )}
            </div>
            <p className="text-sm font-lollipop-regular text-slate-900 dark:text-white line-clamp-2">
              {doubtOfTheDay?.title || t('student:community.dailyChallengeFallback')}
            </p>
          </div>
          {doubtOfTheDay && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-lollipop-regular">
              <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                {t('student:community.upvotesRepliesLine', {
                  upvotes: doubtOfTheDay.upvotes,
                  replies: doubtOfTheDay.comments_count,
                })}
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveSpace('subject-doubts');
                  setSelectedSubject('All');
                  setSelectedChapter('All Chapters');
                  setExpandedPostId(doubtOfTheDay.id);
                }}
                className="text-slate-600 dark:text-slate-300 hover:underline cursor-pointer whitespace-nowrap"
              >
                {t('student:community.openThread')} &rarr;
              </button>
            </div>
          )}
        </div>

        {/* 2. Peer-Answer Challenge & Points */}
        <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-lollipop-regular">
              <span className="flex items-center gap-1.5 text-[#00A896]">
                <Award className="w-4 h-4" />
                <span>{t('student:community.peerChallenge')}</span>
              </span>
              <span className="text-slate-700 dark:text-slate-200 tabular-nums">
                {peerAnswersThisWeek} / {challengeTarget} {t('student:community.thisWeek')}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-[#00A896] rounded-full transition-all duration-300"
                style={{ width: `${challengeProgress}%` }}
              />
            </div>
            <p className="text-xs font-lollipop-regular text-slate-600 dark:text-slate-300">
              {peerAnswersThisWeek >= challengeTarget
                ? t('student:community.challengeGoalReached')
                : t('student:community.challengeMoreNeeded', {
                    remaining: challengeTarget - peerAnswersThisWeek,
                  })}
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-lollipop-regular text-slate-500 dark:text-slate-300 tabular-nums">
            <span>{t('student:community.forumPointsLine', { pts: forumPoints })}</span>
            <span>{t('student:community.bestAnswersLine', { count: bestAnswerCountForUser })}</span>
          </div>
        </div>

        {/* 3. Live Doubt-Clearing Session */}
        <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-lollipop-regular text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                <Video className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span>{t('student:community.liveSession')}</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {t('student:community.liveSlotTime')}
              </span>
            </div>
            <p className="text-sm font-lollipop-regular text-slate-900 dark:text-white">
              {t('student:community.liveWalkthroughTitle')}
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
            <span className="text-xs font-lollipop-regular text-slate-500 dark:text-slate-400">
              {t('student:community.hostedByVance')}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLiveSessionRsvp}
                className={`px-3 py-1.5 rounded-lg text-xs font-lollipop-regular transition-colors cursor-pointer whitespace-nowrap ${
                  liveSessionRsvp
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white'
                }`}
              >
                {liveSessionRsvp ? t('student:community.rsvpRegistered') : t('student:community.rsvpSeat')}
              </button>
              {onJoinLiveSession && (
                <button
                  type="button"
                  onClick={onJoinLiveSession}
                  className="px-3 py-1.5 rounded-lg bg-[#00A896] hover:bg-[#009282] text-white text-xs font-lollipop-regular cursor-pointer whitespace-nowrap"
                >
                  {t('student:community.joinLive')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Space Tabs Bar */}
      <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-2 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-wrap items-center gap-1.5">
        {[
          {
            id: 'subject-doubts' as ForumSpace,
            label: t('student:community.tabSubjectDoubts'),
            icon: <Layers className="w-4 h-4" />,
          },
          {
            id: 'assignment-exam' as ForumSpace,
            label: t('student:community.tabAssignmentExam'),
            icon: <FileText className="w-4 h-4" />,
          },
          {
            id: 'unanswered' as ForumSpace,
            label: t('student:community.unansweredTabCount', { count: unansweredCount }),
            icon: <Clock className="w-4 h-4" />,
          },
          {
            id: 'study-groups' as ForumSpace,
            label: t('student:community.studyGroupsTabCount', { count: forumStudyGroups.length }),
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: 'resources' as ForumSpace,
            label: t('student:community.resourcesTabCount', { count: forumResources.length }),
            icon: <BookOpen className="w-4 h-4" />,
          },
        ].map((tab) => {
          const active = activeSpace === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveSpace(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-lollipop-regular flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                active
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}

        {isEducator && flaggedCount > 0 && (
          <span className="ml-auto px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-lollipop-regular flex items-center gap-1.5 whitespace-nowrap">
            <Flag className="w-3.5 h-3.5" />
            <span className="tabular-nums">
              {t('student:community.flaggedReviewCount', { count: flaggedCount })}
            </span>
          </span>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSpace === 'study-groups'
                ? t('student:community.searchGroups')
                : activeSpace === 'resources'
                ? t('student:community.searchResources')
                : t('student:community.searchDoubts')
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {(activeSpace === 'subject-doubts' || activeSpace === 'assignment-exam' || activeSpace === 'unanswered') && (
          <div className="space-y-2.5">
            {/* Quick Subject Icon Strip matching illustrated subject icons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { value: 'All', label: t('student:community.allSubjects'), iconSubject: 'General' },
                { value: 'Physics', label: translateSubjectLabel('Physics', t), iconSubject: 'Physics' },
                { value: 'Chemistry', label: translateSubjectLabel('Chemistry', t), iconSubject: 'Chemistry' },
                { value: 'Mathematics', label: translateSubjectLabel('Maths', t), iconSubject: 'Mathematics' },
                { value: 'Biology', label: translateSubjectLabel('Biology', t), iconSubject: 'Biology' },
                { value: 'Coding', label: translateSubjectLabel('Coding', t), iconSubject: 'Coding' },
                { value: 'English', label: translateSubjectLabel('General', t), iconSubject: 'General' },
              ].map((item) => {
                const isActiveSub = selectedSubject.toLowerCase() === item.value.toLowerCase();
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedSubject(item.value)}
                    className={`flex flex-col items-center gap-1 px-3.5 py-2 rounded-xl border transition-all cursor-pointer shrink-0 min-w-[78px] ${
                      isActiveSub
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/45 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                        : 'bg-slate-50/70 dark:bg-slate-800/60 border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <SubjectIcon subject={item.iconSubject} size="md" />
                    <span className="text-xs font-lollipop-regular whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              aria-label={t('student:community.filterSubject')}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-lollipop-regular text-slate-800 dark:text-white cursor-pointer"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub === 'All' ? t('student:community.allSubjects') : translateSubjectLabel(sub, t)}
                </option>
              ))}
            </select>

            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              aria-label={t('student:community.doubtChapterLabel')}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-lollipop-regular text-slate-800 dark:text-white cursor-pointer"
            >
              {availableChapters.map((ch) => (
                <option key={ch} value={ch}>
                  {ch === 'All Chapters' ? t('student:community.allChapters') : ch}
                </option>
              ))}
            </select>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              aria-label={t('student:community.filterGrade')}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-lollipop-regular text-slate-800 dark:text-white cursor-pointer"
            >
              <option value="All">{t('student:community.allGrades')}</option>
              {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={String(g)}>
                  {t('student:community.filterGrade')} {g}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'priority' | 'upvotes' | 'newest')}
              aria-label={t('student:community.sortLabel')}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-lollipop-regular text-slate-800 dark:text-white cursor-pointer"
            >
              <option value="priority">{t('student:community.sortPriority')}</option>
              <option value="upvotes">{t('student:community.sortUpvotes')}</option>
              <option value="newest">{t('student:community.sortNewest')}</option>
            </select>
            </div>
          </div>
        )}

        {activeSpace === 'study-groups' && (
          <div className="flex items-center gap-2.5">
            <select
              value={groupSubjectFilter}
              onChange={(e) => setGroupSubjectFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-lollipop-regular text-slate-800 dark:text-white cursor-pointer"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub === 'All' ? t('student:community.allSubjects') : translateSubjectLabel(sub, t)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsCreateGroupOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-xs sm:text-sm font-lollipop-regular flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{t('student:community.createGroup')}</span>
            </button>
          </div>
        )}

        {activeSpace === 'resources' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={resourceTypeFilter}
              onChange={(e) => setResourceTypeFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-lollipop-regular text-slate-800 dark:text-white cursor-pointer"
            >
              <option value="All">{t('student:community.allResourceTypes')}</option>
              {RESOURCE_TYPES.map((rt) => (
                <option key={rt} value={rt}>
                  {t(`student:community.resourceTypes.${rt}`, { defaultValue: rt })}
                </option>
              ))}
            </select>
            <select
              value={resourceSubjectFilter}
              onChange={(e) => setResourceSubjectFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-lollipop-regular text-slate-800 dark:text-white cursor-pointer"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub === 'All' ? t('student:community.allSubjects') : translateSubjectLabel(sub, t)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsAddResourceOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-xs sm:text-sm font-lollipop-regular flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{t('student:community.shareResource')}</span>
            </button>
          </div>
        )}
      </div>

      {/* =======================================================================
          SPACE 1-3: Q&A THREADS (Subject Doubts / Assignment & Exam / Unanswered)
         ======================================================================= */}
      {(activeSpace === 'subject-doubts' || activeSpace === 'assignment-exam' || activeSpace === 'unanswered') && (
        <div className="space-y-4">
          {activeSpace === 'unanswered' && (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm font-lollipop-regular text-slate-700 dark:text-slate-200">
              <span>
                {t('student:community.priorityQueueNote')}
              </span>
              <span className="text-slate-700 dark:text-slate-200 whitespace-nowrap tabular-nums">
                {t('student:community.openDoubtsCount', { count: filteredPosts.length })}
              </span>
            </div>
          )}

          {filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-10 border border-slate-200/90 dark:border-slate-800/80 text-center space-y-3">
              <p className="text-base font-lollipop-regular text-slate-800 dark:text-white">
                {t('student:community.noDoubtsFound')}
              </p>
              <p className="text-sm font-lollipop-regular text-slate-500 dark:text-slate-400">
                {t('student:community.noDoubtsHint')}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSubject('All');
                    setSelectedChapter('All Chapters');
                    setSelectedGrade('All');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-700 dark:text-white cursor-pointer"
                >
                  {t('student:community.clearFiltersBtn')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-sm font-lollipop-regular cursor-pointer"
                >
                  {t('student:community.askDoubt')}
                </button>
              </div>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isExpanded = expandedPostId === post.id;
              const hasAccepted = Boolean(post.accepted_comment_id);
              const isAsker = post.author_id === currentUserId || post.author_name === currentUserName;
              const sortedComments = [...post.comments].sort((a, b) => {
                if (a.is_accepted && !b.is_accepted) return -1;
                if (!a.is_accepted && b.is_accepted) return 1;
                return b.upvotes - a.upvotes;
              });

              return (
                <div
                  key={post.id}
                  className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4"
                >
                  {/* Top Header & Upvote */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      {renderInitialsAvatar(post.author_name, post.author_role)}
                      <div className="min-w-0 space-y-1">
                        {/* Unboxed Metadata Row */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-lollipop-regular text-slate-500 dark:text-slate-300">
                          <span className="text-slate-900 dark:text-white">{post.author_name}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1.5">
                            <SubjectIcon subject={post.subject} size="xs" />
                            <span>{translateSubjectLabel(post.subject, t)}</span>
                          </span>
                          {post.chapter_unit && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{post.chapter_unit}</span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span>{t('student:community.filterGrade')} {post.grade_level}</span>
                          {post.space === 'assignment-exam' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-700 dark:text-slate-200">
                                {t('student:community.assignmentExamHelp')}
                              </span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span>{post.created_at}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className="text-left text-base sm:text-lg font-lollipop-regular text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          {post.title}
                        </button>

                        {/* Explicit Status Indicator (Text + Icon, never hue alone) */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-lollipop-regular pt-0.5">
                          {hasAccepted && (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t('student:community.acceptedAnswer')}</span>
                            </span>
                          )}
                          {post.is_verified && (
                            <span className="flex items-center gap-1 text-[#00A896]">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{t('student:community.teacherVerifiedSolution')}</span>
                            </span>
                          )}
                          {!hasAccepted && !post.is_verified && (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {post.is_high_priority
                                  ? t('student:community.highPriorityUnanswered')
                                  : t('student:community.awaitingAccepted')}
                              </span>
                            </span>
                          )}
                          {post.is_flagged && (
                            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                              <Flag className="w-3.5 h-3.5" />
                              <span>{t('student:community.flaggedReview')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => upvoteCommunityPost(post.id)}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs sm:text-sm font-lollipop-regular text-slate-700 dark:text-white transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 tabular-nums"
                      title={t('student:community.upvote')}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{post.upvotes}</span>
                    </button>
                  </div>

                  {/* Full Question & Attempted Solution */}
                  <div className="space-y-3 text-sm font-lollipop-regular text-slate-700 dark:text-slate-200 leading-relaxed">
                    <p>{post.content}</p>

                    {post.attempted_solution && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-1">
                        <div className="text-xs font-lollipop-regular text-slate-500 dark:text-slate-400">
                          {t('student:community.studentAttempted')}
                        </div>
                        <p className="text-sm font-lollipop-regular text-slate-800 dark:text-slate-100">
                          {post.attempted_solution}
                        </p>
                      </div>
                    )}

                    {post.attachment_preview && (
                      <div className="pt-1">
                        <img
                          src={post.attachment_preview}
                          alt={`Attachment for ${post.title}`}
                          className="max-h-60 rounded-xl border border-slate-200 dark:border-slate-700 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Official Teacher-Verified Solution */}
                  {post.is_verified && post.verified_solution && (
                    <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/80 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs font-lollipop-regular text-emerald-800 dark:text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Teacher-Verified Solution · {post.verified_solution.teacher_name}</span>
                        </span>
                        <span className="text-emerald-700/80 dark:text-emerald-400/80">
                          {post.verified_solution.verified_at}
                        </span>
                      </div>
                      <p className="text-sm font-lollipop-regular text-emerald-950 dark:text-emerald-100 leading-relaxed">
                        {post.verified_solution.solution}
                      </p>
                    </div>
                  )}

                  {/* Moderator Controls (if flagged or educator) */}
                  {isEducator && (post.is_flagged || showVerifyFormId === post.id) && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      {post.is_flagged && (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-lollipop-regular text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4" />
                            <span>Moderator Review Requested: {post.flag_reason || 'Review content or priority'}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => resolveFlaggedCommunityPost(post.id, 'dismiss')}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-lollipop-regular text-slate-700 dark:text-white cursor-pointer"
                            >
                              Clear Flag
                            </button>
                            <button
                              type="button"
                              onClick={() => resolveFlaggedCommunityPost(post.id, 'remove')}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-lollipop-regular cursor-pointer"
                            >
                              Remove Post
                            </button>
                          </div>
                        </div>
                      )}

                      {showVerifyFormId === post.id && (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={verifyDrafts[post.id] || ''}
                            onChange={(e) => setVerifyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Write step-by-step official teacher solution..."
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowVerifyFormId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-lollipop-regular text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const sol = (verifyDrafts[post.id] || '').trim();
                                if (!sol) return;
                                await verifyCommunityPost(post.id, sol);
                                setShowVerifyFormId(null);
                              }}
                              className="px-4 py-1.5 rounded-lg bg-[#00A896] hover:bg-[#009282] text-white text-xs font-lollipop-regular cursor-pointer"
                            >
                              Publish Verified Solution
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer Action Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-lollipop-regular">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white flex items-center gap-1.5 cursor-pointer tabular-nums"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          {isExpanded ? 'Hide Discussion' : `View & Reply (${post.comments.length})`}
                        </span>
                      </button>

                      {isEducator && !post.is_verified && (
                        <button
                          type="button"
                          onClick={() => setShowVerifyFormId(showVerifyFormId === post.id ? null : post.id)}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-[#00A896] hover:bg-teal-100 dark:hover:bg-teal-900/50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify Solution</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => flagCommunityPost(post.id)}
                      disabled={Boolean(post.is_flagged)}
                      className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      title="Flag content for teacher/moderator review"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{post.is_flagged ? 'Flagged' : 'Flag for Review'}</span>
                    </button>
                  </div>

                  {/* Expanded Answers & Reply Composer */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="text-xs font-lollipop-regular text-slate-500 dark:text-slate-400 tabular-nums">
                        {sortedComments.length === 0
                          ? 'No peer replies yet — be the first to walk through the solution step by step.'
                          : `${sortedComments.length} Community ${sortedComments.length === 1 ? 'Explanation' : 'Explanations'}`}
                      </div>

                      {sortedComments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-xl border space-y-2.5 ${
                            comment.is_accepted
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/70'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-lollipop-regular text-slate-600 dark:text-slate-300">
                              <span className="text-slate-900 dark:text-white">{comment.author_name}</span>
                              {comment.author_role !== 'student' && (
                                <span className="text-[#00A896]">· Educator</span>
                              )}
                              {(comment.is_accepted || comment.author_badge) && (
                                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                                  <Award className="w-3.5 h-3.5" />
                                  <span>{comment.is_accepted ? 'Accepted · Best Answer' : comment.author_badge}</span>
                                </span>
                              )}
                              <span aria-hidden="true">·</span>
                              <span>{comment.created_at}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => upvoteCommunityComment(post.id, comment.id)}
                                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-xs font-lollipop-regular text-slate-700 dark:text-white flex items-center gap-1 cursor-pointer tabular-nums"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{comment.upvotes}</span>
                              </button>

                              {(isAsker || isEducator) && !comment.is_accepted && (
                                <button
                                  type="button"
                                  onClick={() => acceptCommunityComment(post.id, comment.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-lollipop-regular flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Mark as Accepted</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="text-sm font-lollipop-regular text-slate-800 dark:text-slate-100 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      ))}

                      {/* Reply Composer */}
                      <div className="space-y-2 pt-1">
                        <label className="block text-xs font-lollipop-regular text-slate-500 dark:text-slate-400">
                          Explain step-by-step reasoning (avoid posting direct answers without explanation or sharing personal contact details)
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <textarea
                            rows={2}
                            value={replyDrafts[post.id] || ''}
                            onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Step 1: Identify the concept... Step 2: Show the transformation..."
                            className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                          />
                          <button
                            type="button"
                            disabled={!(replyDrafts[post.id] || '').trim() || submittingReplyId === post.id}
                            onClick={() => handleSubmitReply(post.id)}
                            className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-40 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-sm font-lollipop-regular flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap self-end sm:self-stretch"
                          >
                            <Send className="w-4 h-4" />
                            <span>{submittingReplyId === post.id ? 'Posting...' : 'Post Reply'}</span>
                          </button>
                        </div>
                        {replyErrors[post.id] && (
                          <p className="text-xs font-lollipop-regular text-rose-600 dark:text-rose-400">
                            {replyErrors[post.id]}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =======================================================================
          SPACE 4: STUDY GROUPS (Peer Finder by Class, Subject & Availability)
         ======================================================================= */}
      {activeSpace === 'study-groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredStudyGroups.map((group) => {
            const isMember = group.members.includes(currentUserName);
            const isOpenThread = activeGroupId === group.id;

            return (
              <div
                key={group.id}
                className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-lollipop-regular text-slate-500 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5 text-[#00A896]">
                          <SubjectIcon subject={group.subject} size="xs" />
                          <span>{group.subject}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{group.chapter_unit}</span>
                        <span aria-hidden="true">·</span>
                        <span>Grade {group.grade_level}</span>
                      </div>
                      <h3 className="text-lg font-lollipop-regular text-slate-900 dark:text-white">
                        {group.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => joinOrLeaveStudyGroup(group.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-lollipop-regular cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                        isMember
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isMember ? 'Joined · Leave' : 'Join Group'}
                    </button>
                  </div>

                  <p className="text-sm font-lollipop-regular text-slate-600 dark:text-slate-300">
                    {group.focus_goal}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-lollipop-regular text-slate-500 dark:text-slate-400 tabular-nums">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                      <span>{group.availability}</span>
                    </span>
                    <span>
                      Members: {group.members.length} / {group.max_members} · Host: {group.host_name}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <button
                    type="button"
                    onClick={() => setActiveGroupId(isOpenThread ? null : group.id)}
                    className="text-xs font-lollipop-regular text-[#00A896] hover:underline cursor-pointer"
                  >
                    {isOpenThread
                      ? 'Hide Group Thread'
                      : `Open Study-Group Thread (${group.messages.length} messages)`}
                  </button>

                  {isOpenThread && (
                    <div className="space-y-3">
                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {group.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs font-lollipop-regular space-y-1"
                          >
                            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                              <span className="text-slate-900 dark:text-white">{msg.author_name}</span>
                              <span>{msg.created_at}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-200">{msg.content}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={groupMessageDrafts[group.id] || ''}
                          onChange={(e) =>
                            setGroupMessageDrafts((prev) => ({ ...prev, [group.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addStudyGroupMessage(group.id, groupMessageDrafts[group.id] || '');
                              setGroupMessageDrafts((prev) => ({ ...prev, [group.id]: '' }));
                            }
                          }}
                          placeholder="Share exam prep plans or questions with your group..."
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-lollipop-regular text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            addStudyGroupMessage(group.id, groupMessageDrafts[group.id] || '');
                            setGroupMessageDrafts((prev) => ({ ...prev, [group.id]: '' }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-xs font-lollipop-regular cursor-pointer whitespace-nowrap"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =======================================================================
          SPACE 5: RESOURCE LIBRARY (Notes, Previous Papers, Revision, Videos)
         ======================================================================= */}
      {activeSpace === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-lollipop-regular">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                    {res.resource_type === 'Recommended Video' ? (
                      <Play className="w-3.5 h-3.5" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5" />
                    )}
                    <span>{res.resource_type}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <SubjectIcon subject={res.subject} size="xs" />
                    <span>
                      {res.subject} · {res.chapter_unit} · Grade {res.grade_level}
                    </span>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-lollipop-regular text-slate-900 dark:text-white">
                  {res.title}
                </h3>

                <p className="text-sm font-lollipop-regular text-slate-600 dark:text-slate-300 leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs font-lollipop-regular">
                <span className="text-slate-500 dark:text-slate-400">
                  Shared by {res.author_name} · {res.created_at}
                </span>

                <button
                  type="button"
                  onClick={() => upvoteForumResource(res.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white flex items-center gap-1.5 cursor-pointer tabular-nums whitespace-nowrap"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({res.helpful_count})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =======================================================================
          MODAL 1: ASK A DOUBT (With Attempted Solution, Attachment & Rules)
         ======================================================================= */}
      {isAskModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1A2D] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-lollipop-regular text-slate-900 dark:text-white">
                  Ask a Doubt
                </h3>
                <p className="text-xs font-lollipop-regular text-slate-500 dark:text-slate-400 mt-0.5">
                  Include your attempted steps and an optional screenshot for faster, clearer help
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAskModalOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDoubt} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-lollipop-regular text-slate-600 dark:text-slate-300">
                    Forum Space
                  </label>
                  <select
                    value={askSpace}
                    onChange={(e) => setAskSpace(e.target.value as 'subject-doubts' | 'assignment-exam')}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
                  >
                    <option value="subject-doubts">Subject-Wise Doubts</option>
                    <option value="assignment-exam">Assignment &amp; Exam Help</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-lollipop-regular text-slate-600 dark:text-slate-300">
                    Subject
                  </label>
                  <select
                    value={askSubject}
                    onChange={(e) => setAskSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
                  >
                    {SUBJECT_OPTIONS.filter((s) => s !== 'All').map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-lollipop-regular text-slate-600 dark:text-slate-300">
                    Chapter or Unit
                  </label>
                  <input
                    type="text"
                    value={askChapter}
                    onChange={(e) => setAskChapter(e.target.value)}
                    placeholder="e.g., Class 10 Algebra, Python Basics"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-lollipop-regular text-slate-600 dark:text-slate-300">
                    Grade Level
                  </label>
                  <select
                    value={askGrade}
                    onChange={(e) => setAskGrade(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-lollipop-regular text-slate-600 dark:text-slate-300">
                  Clear Question Title
                </label>
                <input
                  type="text"
                  value={askTitle}
                  onChange={(e) => setAskTitle(e.target.value)}
                  placeholder="e.g., Why does this integration step work?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-lollipop-regular text-slate-600 dark:text-slate-300">
                  Full Question
                </label>
                <textarea
                  rows={3}
                  value={askContent}
                  onChange={(e) => setAskContent(e.target.value)}
                  placeholder="Include the complete problem statement, conditions, and what concept feels unclear..."
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-lollipop-regular text-slate-600 dark:text-slate-300">
                  Your Attempted Solution
                </label>
                <textarea
                  rows={2}
                  value={askAttempt}
                  onChange={(e) => setAskAttempt(e.target.value)}
                  placeholder="Show what you have tried so far so peers and teachers can guide the next step..."
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="px-3.5 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-xs font-lollipop-regular text-slate-600 dark:text-slate-300 hover:border-slate-400 flex items-center gap-2 cursor-pointer">
                  <ImageIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>{askAttachment ? 'Change Screenshot' : 'Attach Screenshot (optional)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleScreenshotUpload(e.target.files?.[0])}
                  />
                </label>

                <label className="flex items-center gap-2 text-xs font-lollipop-regular text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={askHighPriority}
                    onChange={(e) => setAskHighPriority(e.target.checked)}
                    className="rounded border-slate-300 text-slate-700 focus:ring-slate-400"
                  />
                  <span>Mark as High-Priority (upcoming exam/deadline)</span>
                </label>
              </div>

              {askAttachment && (
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img src={askAttachment} alt="Attached problem preview" className="h-14 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setAskAttachment(undefined)}
                    className="text-xs font-lollipop-regular text-rose-600 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {askError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-lollipop-regular text-rose-700 dark:text-rose-300">
                  {askError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-700 dark:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAsk}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-sm font-lollipop-regular cursor-pointer"
                >
                  {isSubmittingAsk ? 'Publishing...' : 'Publish Doubt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 2: PARTICIPATION RULES
         ======================================================================= */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1A2D] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-lollipop-regular text-slate-900 dark:text-white">
                Community Participation Rules
              </h3>
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-3 text-sm font-lollipop-regular text-slate-700 dark:text-slate-200 list-decimal pl-5">
              <li>
                Write a clear question title, such as &ldquo;Why does this integration step work?&rdquo;
              </li>
              <li>
                Include the full question, your attempted solution, and a screenshot if possible.
              </li>
              <li>
                Do not post direct homework answers without explanation; encourage step-by-step reasoning.
              </li>
              <li>
                Reply respectfully and avoid sharing personal contact details publicly.
              </li>
              <li>
                Mark the answer that solved your doubt as <strong>Accepted</strong> to award the Best Answer badge.
              </li>
              <li>
                Use <strong>Flag for Review</strong> whenever content needs teacher or moderator attention.
              </li>
            </ol>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-sm font-lollipop-regular cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 3: WEEKLY DIGEST
         ======================================================================= */}
      {isDigestModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1A2D] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-lollipop-regular text-slate-900 dark:text-white">
                  Weekly Community Digest
                </h3>
                <p className="text-xs font-lollipop-regular text-slate-500 dark:text-slate-400">
                  Summary of top questions, best accepted answers, and newly shared resources
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDigestModalOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm font-lollipop-regular">
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Top Upvoted Questions
                </h4>
                {weeklyDigestData.topQuestions.map((q) => (
                  <button
                    type="button"
                    key={`dig-q-${q.id}`}
                    onClick={() => {
                      setIsDigestModalOpen(false);
                      setActiveSpace('subject-doubts');
                      setExpandedPostId(q.id);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="text-slate-900 dark:text-white truncate">{q.title}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 shrink-0 tabular-nums">{q.upvotes} upvotes</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Best Accepted &amp; Verified Answers
                </h4>
                {weeklyDigestData.bestAccepted.map((q) => (
                  <button
                    type="button"
                    key={`dig-a-${q.id}`}
                    onClick={() => {
                      setIsDigestModalOpen(false);
                      setActiveSpace('subject-doubts');
                      setExpandedPostId(q.id);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="text-slate-900 dark:text-white truncate">{q.title}</span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 shrink-0">Solved</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  New Study Resources
                </h4>
                {weeklyDigestData.latestResources.map((r) => (
                  <button
                    type="button"
                    key={`dig-r-${r.id}`}
                    onClick={() => {
                      setIsDigestModalOpen(false);
                      setActiveSpace('resources');
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="text-slate-900 dark:text-white truncate">{r.title}</span>
                    <span className="text-xs text-[#00A896] shrink-0">{r.resource_type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 4: CREATE STUDY GROUP
         ======================================================================= */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1A2D] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-lollipop-regular text-slate-900 dark:text-white">
                Create Peer Study Group
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateGroupOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3.5">
              <input
                type="text"
                required
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group Name (e.g., Grade 10 Physics Mock Prep)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newGroupSubject}
                  onChange={(e) => setNewGroupSubject(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
                >
                  {SUBJECT_OPTIONS.filter((s) => s !== 'All').map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <select
                  value={newGroupGrade}
                  onChange={(e) => setNewGroupGrade(Number(e.target.value))}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
                >
                  {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={newGroupChapter}
                onChange={(e) => setNewGroupChapter(e.target.value)}
                placeholder="Chapter / Focus Topic"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={newGroupAvailability}
                onChange={(e) => setNewGroupAvailability(e.target.value)}
                placeholder="Availability (e.g., Thu & Sat · 5:00 PM)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
              />
              <textarea
                rows={2}
                required
                value={newGroupGoal}
                onChange={(e) => setNewGroupGoal(e.target.value)}
                placeholder="Study goal or upcoming exam deadline..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-700 dark:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00A896] text-white text-sm font-lollipop-regular cursor-pointer"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 5: SHARE RESOURCE
         ======================================================================= */}
      {isAddResourceOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1A2D] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-lollipop-regular text-slate-900 dark:text-white">
                Share Revision Resource
              </h3>
              <button
                type="button"
                onClick={() => setIsAddResourceOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-3.5">
              <input
                type="text"
                required
                value={newResTitle}
                onChange={(e) => setNewResTitle(e.target.value)}
                placeholder="Resource Title (e.g., Organic Chemistry Functional Group Sheet)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newResType}
                  onChange={(e) =>
                    setNewResType(
                      e.target.value as 'Notes' | 'Previous Paper' | 'Revision Material' | 'Recommended Video'
                    )
                  }
                  className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
                >
                  {RESOURCE_TYPES.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
                <select
                  value={newResSubject}
                  onChange={(e) => setNewResSubject(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
                >
                  {SUBJECT_OPTIONS.filter((s) => s !== 'All').map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newResChapter}
                  onChange={(e) => setNewResChapter(e.target.value)}
                  placeholder="Chapter / Unit"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
                />
                <select
                  value={newResGrade}
                  onChange={(e) => setNewResGrade(Number(e.target.value))}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
                >
                  {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                rows={2}
                required
                value={newResDesc}
                onChange={(e) => setNewResDesc(e.target.value)}
                placeholder="Brief summary of what this resource covers..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
              />
              <input
                type="url"
                value={newResUrl}
                onChange={(e) => setNewResUrl(e.target.value)}
                placeholder="Optional link (video or reference URL)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddResourceOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-lollipop-regular text-slate-700 dark:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00A896] text-white text-sm font-lollipop-regular cursor-pointer"
                >
                  Share Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
