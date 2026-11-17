import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AiModelRoutingTier,
  AiOveragePolicy,
  BillingCadence,
  PlanCurrency,
  SubscriberRecord,
  SubscriptionPlan,
  SubscriptionPlanStatus,
} from '../../types';
import {
  AI_MODEL_TIER_SPECS,
  calculatePlanTokenEconomics,
  formatCompactTokens,
} from '../../utils/tokenPricing';
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Cpu,
  Download,
  Edit2,
  Filter,
  History,
  Layers,
  LayoutGrid,
  MapPin,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Table2,
  Trash2,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';

const INDIAN_STATES_SUGGESTIONS = [
  'Chandigarh',
  'Delhi',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
];

export const SubscriptionPlansManager: React.FC = () => {
  const {
    subscriptionPlans,
    subscriptionPlanAuditLogs,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    discontinueSubscriptionPlan,
    reactivateSubscriptionPlan,
    subscribers,
    addSubscriber,
    updateSubscriberRecord,
  } = useApp();

  const [workspaceTab, setWorkspaceTab] = useState<'plans' | 'subscribers'>('plans');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SubscriptionPlanStatus>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Subscribers Filters
  const [subSearch, setSubSearch] = useState('');
  const [subDateFrom, setSubDateFrom] = useState('');
  const [subDateTo, setSubDateTo] = useState('');
  const [subStateFilter, setSubStateFilter] = useState('ALL');
  const [subCityFilter, setSubCityFilter] = useState('ALL');
  const [subPlanFilter, setSubPlanFilter] = useState('ALL');
  const [subYearFilter, setSubYearFilter] = useState('ALL');
  const [subStatusFilter, setSubStatusFilter] = useState<'ALL' | SubscriberRecord['status']>('ALL');

  // Add / Edit Subscriber Drawer State
  const [isSubDrawerOpen, setIsSubDrawerOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<SubscriberRecord | null>(null);
  const [subFormError, setSubFormError] = useState('');
  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subPhone, setSubPhone] = useState('');
  const [subGrade, setSubGrade] = useState('Grade 10');
  const [subBoard, setSubBoard] = useState('CBSE');
  const [subState, setSubState] = useState('Maharashtra');
  const [subCity, setSubCity] = useState('Mumbai');
  const [subPlanId, setSubPlanId] = useState('quarterly');
  const [subStartDate, setSubStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [subExpiresAt, setSubExpiresAt] = useState('');
  const [subPaymentMethod, setSubPaymentMethod] =
    useState<SubscriberRecord['paymentMethod']>('UPI');
  const [subStatus, setSubStatus] = useState<SubscriberRecord['status']>('Active');
  const [subRecurring, setSubRecurring] = useState(true);
  const [subAmountINR, setSubAmountINR] = useState('708');
  const [subNotes, setSubNotes] = useState('');

  // Create / Edit Slide-over Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [planName, setPlanName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [currency, setCurrency] = useState<PlanCurrency>('INR');
  const [basePrice, setBasePrice] = useState<string>('250');
  const [strikethroughPrice, setStrikethroughPrice] = useState<string>('');
  const [billingFrequency, setBillingFrequency] = useState<BillingCadence>('Monthly');
  const [gstApplicable, setGstApplicable] = useState<boolean>(true);
  const [courseAccessLevel, setCourseAccessLevel] = useState('All Grades 6-12 & Boards');
  const [usageQuotas, setUsageQuotas] = useState('Unlimited AI Tutor & Practice Quizzes');
  const [effectiveStartDate, setEffectiveStartDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState('');
  const [monthlyTokenQuota, setMonthlyTokenQuota] = useState<string>('350000');
  const [aiModelTier, setAiModelTier] = useState<AiModelRoutingTier>('flash-lite-hybrid');
  const [overagePolicy, setOveragePolicy] = useState<AiOveragePolicy>('prompt-upgrade-or-addon');
  const [maxVisionDoubtsPerMonth, setMaxVisionDoubtsPerMonth] = useState<string>('25');
  const [contextCachingEnabled, setContextCachingEnabled] = useState<boolean>(true);
  const [features, setFeatures] = useState<string[]>([
    'Full Agile Study Roadmap & Daily Planner',
    '350,000 AI Tutor Tokens / month (~300-400 doubts)',
  ]);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [integrityMode, setIntegrityMode] = useState<
    'new-enrollments-only' | 'next-renewal-cycle'
  >('new-enrollments-only');
  const [confirmedIntegrityImpact, setConfirmedIntegrityImpact] = useState(true);

  // Discontinue Confirmation Modal State
  const [planToDiscontinue, setPlanToDiscontinue] = useState<SubscriptionPlan | null>(null);
  const [discontinueReason, setDiscontinueReason] = useState('');

  // Audit Log Modal State
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditPlanFilter, setAuditPlanFilter] = useState<string>('ALL');

  const liveDraftEconomics = useMemo(
    () =>
      calculatePlanTokenEconomics({
        basePrice: Number(basePrice) || 0,
        currency,
        billingFrequency,
        monthlyTokenQuota: Number(monthlyTokenQuota) || 0,
        aiModelTier,
      }),
    [basePrice, currency, billingFrequency, monthlyTokenQuota, aiModelTier]
  );

  const stats = useMemo(() => {
    const activeCount = subscriptionPlans.filter((p) => p.status === 'Active').length;
    const discontinuedCount = subscriptionPlans.filter((p) => p.status === 'Discontinued').length;
    const liveActiveSubscribers = subscribers.filter((s) => s.status === 'Active').length;
    const baselinePlanSubs = subscriptionPlans.reduce(
      (sum, p) => sum + (p.activeSubscribersCount || 0),
      0
    );
    return {
      activeCount,
      discontinuedCount,
      totalSubscribers: Math.max(subscribers.length, baselinePlanSubs),
      liveActiveSubscribers,
      auditCount: subscriptionPlanAuditLogs.length,
    };
  }, [subscriptionPlans, subscriptionPlanAuditLogs, subscribers]);

  const subscriberFilterOptions = useMemo(() => {
    const states = Array.from(
      new Set([...subscribers.map((s) => s.state).filter(Boolean), ...INDIAN_STATES_SUGGESTIONS])
    ).sort();
    const citiesSource =
      subStateFilter === 'ALL'
        ? subscribers
        : subscribers.filter((s) => s.state === subStateFilter);
    const cities = Array.from(new Set(citiesSource.map((s) => s.city).filter(Boolean))).sort();
    const years = Array.from(
      new Set(
        subscribers
          .map((s) => s.subscribedDate?.slice(0, 4))
          .filter((y): y is string => Boolean(y && /^\d{4}$/.test(y)))
      )
    ).sort((a, b) => Number(b) - Number(a));
    const planNames = Array.from(
      new Set([
        ...subscriptionPlans.map((p) => p.name),
        ...subscribers.map((s) => s.planName),
      ])
    );
    return { states, cities, years, planNames };
  }, [subscribers, subscriptionPlans, subStateFilter]);

  const filteredSubscribers = useMemo(() => {
    const q = subSearch.trim().toLowerCase();
    return subscribers.filter((sub) => {
      if (subStatusFilter !== 'ALL' && sub.status !== subStatusFilter) return false;
      if (subStateFilter !== 'ALL' && sub.state !== subStateFilter) return false;
      if (subCityFilter !== 'ALL' && sub.city !== subCityFilter) return false;
      if (subPlanFilter !== 'ALL' && sub.planName !== subPlanFilter) return false;
      if (subYearFilter !== 'ALL' && !sub.subscribedDate.startsWith(subYearFilter)) return false;
      if (subDateFrom && sub.subscribedDate < subDateFrom) return false;
      if (subDateTo && sub.subscribedDate > subDateTo) return false;
      if (q) {
        const hay = [
          sub.studentName,
          sub.studentEmail,
          sub.phone || '',
          sub.city,
          sub.state,
          sub.planName,
          sub.invoiceId || '',
          sub.grade || '',
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    subscribers,
    subSearch,
    subStatusFilter,
    subStateFilter,
    subCityFilter,
    subPlanFilter,
    subYearFilter,
    subDateFrom,
    subDateTo,
  ]);

  const activeSubscriberFilterCount = [
    subSearch.trim() !== '',
    subDateFrom !== '',
    subDateTo !== '',
    subStateFilter !== 'ALL',
    subCityFilter !== 'ALL',
    subPlanFilter !== 'ALL',
    subYearFilter !== 'ALL',
    subStatusFilter !== 'ALL',
  ].filter(Boolean).length;

  const resetSubscriberFilters = () => {
    setSubSearch('');
    setSubDateFrom('');
    setSubDateTo('');
    setSubStateFilter('ALL');
    setSubCityFilter('ALL');
    setSubPlanFilter('ALL');
    setSubYearFilter('ALL');
    setSubStatusFilter('ALL');
  };

  const computeExpiryFromPlan = (planIdValue: string, startIso: string): string => {
    const matched = subscriptionPlans.find((p) => p.id === planIdValue);
    const startMs = startIso ? new Date(startIso).getTime() : Date.now();
    const days =
      planIdValue === 'trial'
        ? 7
        : matched?.billingFrequency === 'Annually'
        ? 365
        : matched?.billingFrequency === 'Quarterly'
        ? 90
        : 30;
    return new Date(startMs + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  };

  const computeTotalInrFromPlan = (planIdValue: string): string => {
    if (planIdValue === 'trial') return '0';
    const matched = subscriptionPlans.find((p) => p.id === planIdValue);
    if (!matched) return '295';
    const gst = matched.gstApplicable ? Math.round(matched.basePrice * 0.18) : 0;
    return String(matched.basePrice + gst);
  };

  const openAddSubscriberDrawer = () => {
    const todayIso = new Date().toISOString().split('T')[0];
    const defaultPlanId = subscriptionPlans.find((p) => p.id === 'quarterly')?.id || subscriptionPlans[0]?.id || 'quarterly';
    setEditingSubscriber(null);
    setSubFormError('');
    setSubName('');
    setSubEmail('');
    setSubPhone('+91 ');
    setSubGrade('Grade 10');
    setSubBoard('CBSE');
    setSubState('Maharashtra');
    setSubCity('Mumbai');
    setSubPlanId(defaultPlanId);
    setSubStartDate(todayIso);
    setSubExpiresAt(computeExpiryFromPlan(defaultPlanId, todayIso));
    setSubPaymentMethod('UPI');
    setSubStatus('Active');
    setSubRecurring(true);
    setSubAmountINR(computeTotalInrFromPlan(defaultPlanId));
    setSubNotes('');
    setIsSubDrawerOpen(true);
  };

  const openEditSubscriberDrawer = (sub: SubscriberRecord) => {
    setEditingSubscriber(sub);
    setSubFormError('');
    setSubName(sub.studentName);
    setSubEmail(sub.studentEmail);
    setSubPhone(sub.phone || '');
    setSubGrade(sub.grade || 'Grade 10');
    setSubBoard(sub.educationBoard || 'CBSE');
    setSubState(sub.state);
    setSubCity(sub.city);
    setSubPlanId(sub.planId);
    setSubStartDate(sub.subscribedDate);
    setSubExpiresAt(sub.expiresAt);
    setSubPaymentMethod(sub.paymentMethod);
    setSubStatus(sub.status);
    setSubRecurring(sub.recurringMonthly);
    setSubAmountINR(String(sub.amountPaidINR));
    setSubNotes(sub.notes || '');
    setIsSubDrawerOpen(true);
  };

  const handleSaveSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) {
      setSubFormError('Subscriber Name is required.');
      return;
    }
    if (!subEmail.trim() || !subEmail.includes('@')) {
      setSubFormError('Valid Email address is required.');
      return;
    }
    if (!subCity.trim() || !subState.trim()) {
      setSubFormError('Both City and State are required.');
      return;
    }
    if (!subStartDate || !subExpiresAt) {
      setSubFormError('Subscribed Date and Expiry Date are required.');
      return;
    }

    const matchedPlan = subscriptionPlans.find((p) => p.id === subPlanId);
    const resolvedPlanName =
      subPlanId === 'trial' ? '7-Day Free Trial' : matchedPlan?.name || 'Monthly Plan';
    const parsedAmount = Math.max(0, Number(subAmountINR) || 0);

    if (editingSubscriber) {
      updateSubscriberRecord(editingSubscriber.id, {
        studentName: subName.trim(),
        studentEmail: subEmail.trim(),
        phone: subPhone.trim() || undefined,
        grade: subGrade.trim() || undefined,
        educationBoard: subBoard.trim() || undefined,
        city: subCity.trim(),
        state: subState.trim(),
        planId: subPlanId,
        planName: resolvedPlanName,
        subscribedDate: subStartDate,
        expiresAt: subExpiresAt,
        amountPaidINR: parsedAmount,
        paymentMethod: subPaymentMethod,
        recurringMonthly: subRecurring,
        status: subStatus,
        notes: subNotes.trim() || undefined,
      });
    } else {
      addSubscriber({
        studentName: subName.trim(),
        studentEmail: subEmail.trim(),
        phone: subPhone.trim() || undefined,
        grade: subGrade.trim() || undefined,
        educationBoard: subBoard.trim() || undefined,
        city: subCity.trim(),
        state: subState.trim(),
        planId: subPlanId,
        planName: resolvedPlanName,
        subscribedDate: subStartDate,
        expiresAt: subExpiresAt,
        amountPaidINR: parsedAmount,
        paymentMethod: subPaymentMethod,
        recurringMonthly: subRecurring,
        status: subStatus,
        notes: subNotes.trim() || undefined,
      });
    }

    setIsSubDrawerOpen(false);
    setEditingSubscriber(null);
  };

  const handleExportSubscribersCsv = () => {
    const header = [
      'Subscriber Name',
      'Email',
      'Phone',
      'Grade',
      'City',
      'State',
      'Plan',
      'Subscribed Date',
      'Year',
      'Expires At',
      'Amount INR',
      'Payment Method',
      'Auto Renew',
      'Status',
      'Invoice ID',
    ];
    const rows = filteredSubscribers.map((s) => [
      s.studentName,
      s.studentEmail,
      s.phone || '',
      s.grade || '',
      s.city,
      s.state,
      s.planName,
      s.subscribedDate,
      s.subscribedDate.slice(0, 4),
      s.expiresAt,
      String(s.amountPaidINR),
      s.paymentMethod,
      s.recurringMonthly ? 'Yes' : 'No',
      s.status,
      s.invoiceId || '',
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `active-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredPlans = useMemo(() => {
    return subscriptionPlans.filter((plan) => {
      const matchesStatus = statusFilter === 'ALL' || plan.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        plan.name.toLowerCase().includes(q) ||
        plan.subtitle.toLowerCase().includes(q) ||
        plan.courseAccessLevel.toLowerCase().includes(q) ||
        plan.features.some((f) => f.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [subscriptionPlans, statusFilter, searchQuery]);

  const pricingOrCoreEntitlementsEdited = useMemo(() => {
    if (!editingPlan) return false;
    const parsedPrice = Number(basePrice);
    const parsedQuota = Number(monthlyTokenQuota);
    const parsedVision = Number(maxVisionDoubtsPerMonth);
    const cleanFeatures = features.map((f) => f.trim()).filter(Boolean);
    return (
      (!Number.isNaN(parsedPrice) && parsedPrice !== editingPlan.basePrice) ||
      currency !== editingPlan.currency ||
      billingFrequency !== editingPlan.billingFrequency ||
      courseAccessLevel.trim() !== editingPlan.courseAccessLevel ||
      usageQuotas.trim() !== editingPlan.usageQuotas ||
      (!Number.isNaN(parsedQuota) && parsedQuota !== (editingPlan.monthlyTokenQuota ?? 0)) ||
      aiModelTier !== (editingPlan.aiModelTier || 'flash-lite-hybrid') ||
      overagePolicy !== (editingPlan.overagePolicy || 'prompt-upgrade-or-addon') ||
      (!Number.isNaN(parsedVision) &&
        parsedVision !== (editingPlan.maxVisionDoubtsPerMonth ?? 0)) ||
      contextCachingEnabled !== Boolean(editingPlan.contextCachingEnabled ?? true) ||
      JSON.stringify(cleanFeatures) !== JSON.stringify(editingPlan.features)
    );
  }, [
    editingPlan,
    basePrice,
    currency,
    billingFrequency,
    courseAccessLevel,
    usageQuotas,
    monthlyTokenQuota,
    aiModelTier,
    overagePolicy,
    maxVisionDoubtsPerMonth,
    contextCachingEnabled,
    features,
  ]);

  const openCreateDrawer = () => {
    setEditingPlan(null);
    setFormError('');
    setPlanName('');
    setSubtitle('');
    setBadge('');
    setCurrency('INR');
    setBasePrice('499');
    setStrikethroughPrice('');
    setBillingFrequency('Monthly');
    setGstApplicable(true);
    setCourseAccessLevel('All Grades 6-12 & Boards');
    setUsageQuotas('600K AI Tokens/mo (~630 doubts) + Quizzes');
    setEffectiveStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setMonthlyTokenQuota('600000');
    setAiModelTier('hydrogen-vision');
    setOveragePolicy('prompt-upgrade-or-addon');
    setMaxVisionDoubtsPerMonth('60');
    setContextCachingEnabled(true);
    setFeatures([
      'Full Agile Study Roadmap & Daily Planner',
      '600,000 AI Tutor Tokens / month (~630 doubts)',
      '60 Image Vision & Diagram Doubts / month',
      'Interactive Practice Quizzes & Mock Tests',
    ]);
    setNewFeatureInput('');
    setIntegrityMode('new-enrollments-only');
    setConfirmedIntegrityImpact(true);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormError('');
    setPlanName(plan.name);
    setSubtitle(plan.subtitle);
    setBadge(plan.badge || '');
    setCurrency(plan.currency);
    setBasePrice(String(plan.basePrice));
    setStrikethroughPrice(
      typeof plan.strikethroughPrice === 'number' ? String(plan.strikethroughPrice) : ''
    );
    setBillingFrequency(plan.billingFrequency);
    setGstApplicable(plan.gstApplicable);
    setCourseAccessLevel(plan.courseAccessLevel);
    setUsageQuotas(plan.usageQuotas);
    setEffectiveStartDate(plan.effectiveStartDate);
    setEndDate(plan.endDate || '');
    setMonthlyTokenQuota(String(plan.monthlyTokenQuota ?? 350000));
    setAiModelTier(plan.aiModelTier || 'flash-lite-hybrid');
    setOveragePolicy(plan.overagePolicy || 'prompt-upgrade-or-addon');
    setMaxVisionDoubtsPerMonth(String(plan.maxVisionDoubtsPerMonth ?? 25));
    setContextCachingEnabled(plan.contextCachingEnabled ?? true);
    setFeatures(plan.features.length > 0 ? [...plan.features] : ['Core Curriculum Access']);
    setNewFeatureInput('');
    setIntegrityMode(
      plan.grandfatherExistingSubscribers === false
        ? 'next-renewal-cycle'
        : 'new-enrollments-only'
    );
    setConfirmedIntegrityImpact(true);
    setIsDrawerOpen(true);
  };

  const handleSyncTokenBulletsToFeatures = () => {
    const quotaNum = Math.max(0, Number(monthlyTokenQuota) || 0);
    const visionNum = Math.max(0, Number(maxVisionDoubtsPerMonth) || 0);
    const tierSpec = AI_MODEL_TIER_SPECS[aiModelTier];
    const approxDoubts = Math.round(quotaNum / 950);
    const tokenLine = `${quotaNum.toLocaleString('en-IN')} AI Tutor Tokens / month (~${approxDoubts} doubts)`;
    const visionLine = `${visionNum} Image Vision Doubts / mo (${tierSpec.shortLabel})`;

    setUsageQuotas(
      `${formatCompactTokens(quotaNum)} AI Tokens/mo (${tierSpec.shortLabel}) + Quizzes`
    );
    setFeatures((prev) => {
      const filtered = prev.filter(
        (f) => !f.toLowerCase().includes('token') && !f.toLowerCase().includes('vision doubt')
      );
      return [tokenLine, ...(visionNum > 0 ? [visionLine] : []), ...filtered];
    });
  };

  const handleAddFeatureBullet = () => {
    const trimmed = newFeatureInput.trim();
    if (!trimmed) return;
    setFeatures((prev) => [...prev, trimmed]);
    setNewFeatureInput('');
  };

  const handleUpdateFeatureAt = (idx: number, val: string) => {
    setFeatures((prev) => prev.map((item, i) => (i === idx ? val : item)));
  };

  const handleRemoveFeatureAt = (idx: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = planName.trim();
    if (!trimmedName) {
      setFormError('Plan Name is required.');
      return;
    }

    const numericBase = Number(basePrice);
    if (basePrice.trim() === '' || Number.isNaN(numericBase) || numericBase < 0) {
      setFormError('Base Price must be a non-negative number (0 or greater).');
      return;
    }

    let numericStrike: number | undefined;
    if (strikethroughPrice.trim() !== '') {
      const parsedStrike = Number(strikethroughPrice);
      if (Number.isNaN(parsedStrike) || parsedStrike < 0) {
        setFormError('Discount / Strikethrough Price must be a non-negative number.');
        return;
      }
      numericStrike = parsedStrike;
    }

    if (!effectiveStartDate) {
      setFormError('Effective Start Date is required.');
      return;
    }

    if (endDate && endDate < effectiveStartDate) {
      setFormError('End / Expiration Date cannot precede Effective Start Date.');
      return;
    }

    const cleanFeatures = features.map((f) => f.trim()).filter(Boolean);
    if (cleanFeatures.length === 0) {
      setFormError('Include at least one feature entitlement for student pricing cards.');
      return;
    }

    if (
      editingPlan &&
      editingPlan.status === 'Active' &&
      pricingOrCoreEntitlementsEdited &&
      !confirmedIntegrityImpact
    ) {
      setFormError(
        'Please confirm how pricing or entitlement changes affect current active subscribers.'
      );
      return;
    }

    const numericTokenQuota = Number(monthlyTokenQuota);
    if (monthlyTokenQuota.trim() === '' || Number.isNaN(numericTokenQuota) || numericTokenQuota < 0) {
      setFormError('Monthly AI Token Quota must be 0 or greater.');
      return;
    }

    const numericVisionCap = Number(maxVisionDoubtsPerMonth);
    if (
      maxVisionDoubtsPerMonth.trim() === '' ||
      Number.isNaN(numericVisionCap) ||
      numericVisionCap < 0
    ) {
      setFormError('Monthly Image Vision Doubts Cap must be 0 or greater.');
      return;
    }

    if (editingPlan) {
      updateSubscriptionPlan(
        editingPlan.id,
        {
          name: trimmedName,
          subtitle: subtitle.trim() || `${billingFrequency} subscription access`,
          badge: badge.trim() || undefined,
          currency,
          basePrice: numericBase,
          strikethroughPrice: numericStrike,
          billingFrequency,
          gstApplicable,
          courseAccessLevel: courseAccessLevel.trim() || 'Standard Access',
          usageQuotas: usageQuotas.trim() || 'Standard Quotas',
          monthlyTokenQuota: numericTokenQuota,
          aiModelTier,
          overagePolicy,
          maxVisionDoubtsPerMonth: numericVisionCap,
          contextCachingEnabled,
          effectiveStartDate,
          endDate: endDate || undefined,
          features: cleanFeatures,
        },
        {
          integrityMode,
        }
      );
    } else {
      createSubscriptionPlan({
        name: trimmedName,
        subtitle: subtitle.trim() || `${billingFrequency} subscription access`,
        badge: badge.trim() || undefined,
        currency,
        basePrice: numericBase,
        strikethroughPrice: numericStrike,
        billingFrequency,
        gstApplicable,
        courseAccessLevel: courseAccessLevel.trim() || 'All Grades 6-12 & Boards',
        usageQuotas: usageQuotas.trim() || `${formatCompactTokens(numericTokenQuota)} AI Tokens/mo`,
        monthlyTokenQuota: numericTokenQuota,
        aiModelTier,
        overagePolicy,
        maxVisionDoubtsPerMonth: numericVisionCap,
        contextCachingEnabled,
        features: cleanFeatures,
        status: 'Active',
        effectiveStartDate,
        endDate: endDate || undefined,
        grandfatherExistingSubscribers: true,
      });
    }

    setIsDrawerOpen(false);
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Lifecycle Integrity Banner */}
      <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-normal text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#00A896]" />
                <span>Subscription Plans Catalog &amp; Lifecycle</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                1:1 Synced with Student Pricing UI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create, version, edit, and soft-archive subscription tiers. Hard deletion is prohibited to protect historical invoicing and active student entitlements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => {
                setAuditPlanFilter('ALL');
                setIsAuditOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <History className="w-4 h-4 text-[#00A896]" />
              <span>Audit Log ({stats.auditCount})</span>
            </button>

            <button
              type="button"
              onClick={openCreateDrawer}
              className="px-4 py-2.5 rounded-2xl bg-[#00A896] hover:bg-[#009282] text-white text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Plan</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <button
            type="button"
            onClick={() => {
              setWorkspaceTab('plans');
              setStatusFilter('Active');
            }}
            className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
              workspaceTab === 'plans' && statusFilter === 'Active'
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                : 'bg-slate-50 dark:bg-[#1a2540] border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="text-slate-500 dark:text-slate-400">Active Tiers</div>
            <div className="text-xl text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.activeCount}
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setWorkspaceTab('plans');
              setStatusFilter('Discontinued');
            }}
            className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
              workspaceTab === 'plans' && statusFilter === 'Discontinued'
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
                : 'bg-slate-50 dark:bg-[#1a2540] border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="text-slate-500 dark:text-slate-400">Discontinued / Blocked</div>
            <div className="text-xl text-amber-600 dark:text-amber-400 mt-1">
              {stats.discontinuedCount}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceTab('subscribers')}
            className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
              workspaceTab === 'subscribers'
                ? 'bg-cyan-50/90 dark:bg-cyan-950/40 border-[#00A896] ring-1 ring-[#00A896]/30'
                : 'bg-slate-50 dark:bg-[#1a2540] border-slate-200 dark:border-slate-700 hover:border-[#00A896]/60'
            }`}
          >
            <div className="flex items-center justify-between gap-1 text-slate-500 dark:text-slate-400">
              <span>Active Subscribers</span>
              <span className="text-[10px] font-medium text-[#00A896]">View All &rarr;</span>
            </div>
            <div className="text-xl text-cyan-600 dark:text-cyan-400 mt-1 tabular-nums">
              {subscribers.length}
              <span className="text-[11px] font-normal text-slate-400 ml-1.5">
                ({stats.liveActiveSubscribers} active)
              </span>
            </div>
          </button>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
            <div className="text-slate-500 dark:text-slate-400">Integrity Mode</div>
            <div className="text-xs text-slate-800 dark:text-slate-200 mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00A896]" />
              <span>Soft-Archive Only</span>
            </div>
          </div>
        </div>

        {/* Filter Segments & View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(['ALL', 'Active', 'Discontinued'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setWorkspaceTab('plans');
                  setStatusFilter(tab);
                }}
                className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  workspaceTab === 'plans' && statusFilter === tab
                    ? 'bg-slate-900 text-white dark:bg-[#00A896] dark:text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab === 'ALL'
                  ? `All Plans (${subscriptionPlans.length})`
                  : tab === 'Active'
                  ? `Active (${stats.activeCount})`
                  : `Discontinued (${stats.discontinuedCount})`}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setWorkspaceTab('subscribers')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                workspaceTab === 'subscribers'
                  ? 'bg-[#00A896] text-white shadow-xs'
                  : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200 border border-cyan-200/80 dark:border-cyan-800/70 hover:bg-cyan-100 dark:hover:bg-cyan-900/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Active Subscribers ({subscribers.length})</span>
            </button>
          </div>

          {workspaceTab === 'plans' ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plan, access, or feature..."
                  className="pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00A896]"
                />
              </div>

              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white dark:bg-[#131d33] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-[#131d33] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Table2 className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setWorkspaceTab('plans')}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Plans</span>
              </button>
              <button
                type="button"
                onClick={handleExportSubscribersCsv}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#00A896]" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={openAddSubscriberDrawer}
                className="px-3.5 py-2 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subscriber</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ACTIVE SUBSCRIBERS DIRECTORY VIEW */}
      {workspaceTab === 'subscribers' && (
        <div className="space-y-5">
          {/* Filtered Summary Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white dark:bg-[#131d33] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400">Matching Subscribers</div>
              <div className="text-xl font-medium text-slate-900 dark:text-white mt-1 tabular-nums">
                {filteredSubscribers.length}{' '}
                <span className="text-xs font-normal text-slate-400">of {subscribers.length}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#131d33] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400">Active Plan Access</div>
              <div className="text-xl font-medium text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                {filteredSubscribers.filter((s) => s.status === 'Active').length}
              </div>
            </div>
            <div className="bg-white dark:bg-[#131d33] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400">Filtered Revenue (incl. GST)</div>
              <div className="text-xl font-medium text-[#00A896] mt-1 tabular-nums">
                INR{' '}
                {filteredSubscribers
                  .reduce((sum, s) => sum + (s.amountPaidINR || 0), 0)
                  .toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white dark:bg-[#131d33] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400">Cities &amp; States Covered</div>
              <div className="text-xl font-medium text-cyan-600 dark:text-cyan-400 mt-1 tabular-nums">
                {new Set(filteredSubscribers.map((s) => s.city)).size} cities &bull;{' '}
                {new Set(filteredSubscribers.map((s) => s.state)).size} states
              </div>
            </div>
          </div>

          {/* Comprehensive Admin Filter Bar */}
          <div className="bg-white dark:bg-[#131d33] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-white font-medium">
                <Filter className="w-4 h-4 text-[#00A896]" />
                <span>Filter Subscribers Directory</span>
                {activeSubscriberFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#00A896]/15 text-[#00A896]">
                    {activeSubscriberFilterCount} active
                  </span>
                )}
              </div>
              {activeSubscriberFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetSubscriberFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Search Subscriber
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    placeholder="Name, email, phone, invoice..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#00A896]"
                  />
                </div>
              </div>

              {/* Subscription Plan Filter */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Subscription Plan
                </label>
                <select
                  value={subPlanFilter}
                  onChange={(e) => setSubPlanFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#00A896]"
                >
                  <option value="ALL">All Subscription Plans</option>
                  {subscriberFilterOptions.planNames.map((planName) => (
                    <option key={planName} value={planName}>
                      {planName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Subscription Year
                </label>
                <select
                  value={subYearFilter}
                  onChange={(e) => setSubYearFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#00A896]"
                >
                  <option value="ALL">All Years</option>
                  {subscriberFilterOptions.years.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Account Status
                </label>
                <select
                  value={subStatusFilter}
                  onChange={(e) =>
                    setSubStatusFilter(e.target.value as 'ALL' | SubscriberRecord['status'])
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#00A896]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Trial">Trial</option>
                  <option value="Past Due">Past Due</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              {/* State Filter */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  State
                </label>
                <select
                  value={subStateFilter}
                  onChange={(e) => {
                    setSubStateFilter(e.target.value);
                    setSubCityFilter('ALL');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#00A896]"
                >
                  <option value="ALL">All States</option>
                  {subscriberFilterOptions.states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  City
                </label>
                <select
                  value={subCityFilter}
                  onChange={(e) => setSubCityFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#00A896]"
                >
                  <option value="ALL">All Cities</option>
                  {subscriberFilterOptions.cities.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range From */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Subscribed From (Date)
                </label>
                <input
                  type="date"
                  value={subDateFrom}
                  onChange={(e) => setSubDateFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#00A896]"
                />
              </div>

              {/* Date Range To */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Subscribed To (Date)
                </label>
                <input
                  type="date"
                  value={subDateTo}
                  onChange={(e) => setSubDateTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#00A896]"
                />
              </div>
            </div>
          </div>

          {/* Subscribers Directory Table */}
          <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
            {filteredSubscribers.length === 0 ? (
              <div className="py-12 text-center space-y-3 text-xs">
                <p className="text-slate-500 dark:text-slate-400">
                  No subscribers match the current filter combination.
                </p>
                <button
                  type="button"
                  onClick={resetSubscriberFilters}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#1a2540] text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Subscriber</th>
                    <th className="p-3">City &amp; State</th>
                    <th className="p-3">Subscription Plan</th>
                    <th className="p-3">Subscribed Date</th>
                    <th className="p-3">Renewal / Expiry</th>
                    <th className="p-3">Amount (INR)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSubscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {sub.studentName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {sub.studentEmail}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {sub.grade || 'Grade 10'} &bull; {sub.educationBoard || 'CBSE'}
                          {sub.phone ? ` • ${sub.phone}` : ''}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="inline-flex items-center gap-1 text-slate-800 dark:text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-[#00A896] shrink-0" />
                          <span>{sub.city}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 pl-4">{sub.state}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {sub.planName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sub.paymentMethod} &bull;{' '}
                          {sub.recurringMonthly ? 'Auto-Renew' : 'One-Time Cycle'}
                        </div>
                      </td>
                      <td className="p-3 tabular-nums text-slate-700 dark:text-slate-300">
                        <div>{sub.subscribedDate}</div>
                        <div className="text-[10px] text-slate-400">
                          Year {sub.subscribedDate.slice(0, 4)}
                        </div>
                      </td>
                      <td className="p-3 tabular-nums text-slate-700 dark:text-slate-300">
                        <div>{sub.expiresAt}</div>
                        {sub.invoiceId && (
                          <div className="text-[10px] font-mono text-slate-400">
                            {sub.invoiceId}
                          </div>
                        )}
                      </td>
                      <td className="p-3 tabular-nums font-medium text-slate-900 dark:text-white">
                        {sub.amountPaidINR > 0
                          ? `INR ${sub.amountPaidINR.toLocaleString('en-IN')}`
                          : 'Free Trial'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                            sub.status === 'Active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : sub.status === 'Trial'
                              ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                              : sub.status === 'Past Due'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : sub.status === 'Suspended'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openEditSubscriberDrawer(sub)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        {sub.status === 'Active' ? (
                          <button
                            type="button"
                            onClick={() =>
                              updateSubscriberRecord(sub.id, { status: 'Suspended' })
                            }
                            className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <PauseCircle className="w-3 h-3" />
                            <span>Suspend</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              updateSubscriberRecord(sub.id, { status: 'Active' })
                            }
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <PlayCircle className="w-3 h-3" />
                            <span>Activate</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* CARDS VIEW (Aligned 1:1 with Student Pricing Grid) */}
      {workspaceTab === 'plans' && viewMode === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          {filteredPlans.map((plan) => {
            const isDiscontinued = plan.status === 'Discontinued';
            const isHighlighted =
              !isDiscontinued &&
              (plan.id === 'quarterly' ||
                plan.badge === 'Recommended' ||
                plan.badge === 'Popular Choice');
            const gstValue = plan.gstApplicable ? Math.round(plan.basePrice * 0.18) : 0;
            const totalWithGst = plan.basePrice + gstValue;

            return (
              <div
                key={plan.id}
                className={`bg-white dark:bg-[#131d33] rounded-2xl p-5 border flex flex-col transition-all ${
                  isDiscontinued
                    ? 'border-amber-200/80 dark:border-amber-900/60 opacity-90'
                    : isHighlighted
                    ? 'border-[#00A896] ring-1 ring-[#00A896]/25 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                {/* 1. Top Status & Badge Row */}
                <div className="min-h-[26px] flex items-center justify-between gap-2 pb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        plan.status === 'Active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {plan.status}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 truncate">
                      v{plan.version} &bull; {plan.activeSubscribersCount} subs
                    </span>
                  </div>
                  {plan.badge && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border shrink-0 whitespace-nowrap ${
                        isHighlighted
                          ? 'bg-[#00A896]/10 text-[#00A896] border-[#00A896]/40'
                          : 'bg-teal-50 dark:bg-teal-950/60 text-[#00A896] border-teal-200/70 dark:border-teal-800/70'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>

                {/* 2. Title & Subtitle Band (Fixed Height for Horizontal Box Alignment) */}
                <div className="min-h-[64px]">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white leading-snug">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {plan.subtitle}
                  </p>
                </div>

                {/* 3. Pricing Box Band (Fixed Height for Horizontal Alignment) */}
                <div className="mt-3 px-4 py-3.5 min-h-[92px] rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200/80 dark:border-slate-700 flex flex-col justify-center gap-1">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    {typeof plan.strikethroughPrice === 'number' &&
                      plan.strikethroughPrice > plan.basePrice && (
                        <span className="text-xs text-slate-400 line-through tabular-nums">
                          {plan.currency} {plan.strikethroughPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    <span className="text-2xl font-medium text-slate-900 dark:text-white tabular-nums tracking-tight">
                      {plan.currency} {plan.basePrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {plan.billingCycleLabel}
                    </span>
                  </div>
                  <div className="text-[11px] leading-snug text-[#00A896] tabular-nums">
                    {plan.gstApplicable
                      ? `+ 18% GST (${plan.currency} ${gstValue}) • Total: ${plan.currency} ${totalWithGst.toLocaleString('en-IN')}`
                      : `Tax inclusive • Total: ${plan.currency} ${totalWithGst.toLocaleString('en-IN')}`}
                  </div>
                </div>

                {/* 4. Clean 3-Column AI Quota & Margin Grid */}
                {(() => {
                  const econ = calculatePlanTokenEconomics({
                    basePrice: plan.basePrice,
                    currency: plan.currency,
                    billingFrequency: plan.billingFrequency,
                    monthlyTokenQuota: plan.monthlyTokenQuota ?? 350000,
                    aiModelTier: plan.aiModelTier || 'flash-lite-hybrid',
                  });
                  return (
                    <div className="mt-3 grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700 rounded-xl bg-slate-50/90 dark:bg-[#1a2540]/70 border border-slate-200/80 dark:border-slate-700 py-2 text-center tabular-nums">
                      <div className="px-2">
                        <div className="text-[10px] text-slate-400">AI Quota</div>
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-100 mt-0.5">
                          {formatCompactTokens(plan.monthlyTokenQuota ?? 350000)}/mo
                        </div>
                      </div>
                      <div className="px-2">
                        <div className="text-[10px] text-slate-400">Max COGS</div>
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-100 mt-0.5">
                          ₹{econ.monthlyCogsINR}/mo
                        </div>
                      </div>
                      <div className="px-2">
                        <div className="text-[10px] text-slate-400">Margin</div>
                        <div
                          className={`text-xs font-medium mt-0.5 ${
                            econ.isBelowMarginFloor
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {econ.grossMarginPct}% ({econ.markupMultiplier}×)
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 5. Feature Entitlements */}
                <ul className="mt-4 flex-1 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-snug">
                      <Check className="w-3.5 h-3.5 text-[#00A896] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* 6. Compact Validity Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
                  <span>Start: {plan.effectiveStartDate}</span>
                  <span>
                    {isDiscontinued
                      ? `Blocked: ${plan.discontinuedDate || plan.endDate || 'Archived'}`
                      : plan.endDate
                      ? `Ends: ${plan.endDate}`
                      : 'Ongoing'}
                  </span>
                </div>

                {/* 7. Actions Footer (No Hard Delete) */}
                <div className="pt-3 mt-2 flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => openEditDrawer(plan)}
                    className="flex-1 h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {plan.status === 'Active' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPlanToDiscontinue(plan);
                        setDiscontinueReason('');
                      }}
                      className="flex-1 h-9 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center gap-1.5 cursor-pointer transition-colors font-medium"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Discontinue</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => reactivateSubscriptionPlan(plan.id)}
                      className="flex-1 h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors font-medium"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reactivate</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setAuditPlanFilter(plan.id);
                      setIsAuditOpen(true);
                    }}
                    title="Plan Audit History"
                    className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <History className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {workspaceTab === 'plans' && viewMode === 'table' && (
        <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#1a2540] text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Plan Name &amp; Ver</th>
                <th className="p-3">Pricing &amp; Cadence</th>
                <th className="p-3">Entitlements</th>
                <th className="p-3">Effective / End Dates</th>
                <th className="p-3">Subscribers</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="p-3">
                    <div className="text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{plan.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">v{plan.version}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{plan.subtitle}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-900 dark:text-white tabular-nums">
                      {plan.currency} {plan.basePrice.toLocaleString('en-IN')}{' '}
                      <span className="text-slate-400">/ {plan.billingFrequency}</span>
                    </div>
                    {typeof plan.strikethroughPrice === 'number' &&
                      plan.strikethroughPrice > plan.basePrice && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {plan.currency} {plan.strikethroughPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                  </td>
                  <td className="p-3 max-w-xs">
                    {(() => {
                      const econ = calculatePlanTokenEconomics({
                        basePrice: plan.basePrice,
                        currency: plan.currency,
                        billingFrequency: plan.billingFrequency,
                        monthlyTokenQuota: plan.monthlyTokenQuota ?? 350000,
                        aiModelTier: plan.aiModelTier || 'flash-lite-hybrid',
                      });
                      return (
                        <>
                          <div className="text-slate-700 dark:text-slate-300 truncate">
                            {formatCompactTokens(plan.monthlyTokenQuota ?? 350000)} tokens/mo &bull; {econ.grossMarginPct}% margin ({econ.markupMultiplier}×)
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {plan.courseAccessLevel} &bull; {plan.maxVisionDoubtsPerMonth ?? 25} vision doubts/mo
                          </div>
                        </>
                      );
                    })()}
                  </td>
                  <td className="p-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <div>Start: {plan.effectiveStartDate}</div>
                    <div>{plan.discontinuedDate ? `Blocked: ${plan.discontinuedDate}` : `End: ${plan.endDate || 'Ongoing'}`}</div>
                  </td>
                  <td className="p-3 text-cyan-600 dark:text-cyan-400 font-mono">
                    {plan.activeSubscribersCount}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] border ${
                        plan.status === 'Active'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {plan.status}
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                    <button
                      type="button"
                      onClick={() => openEditDrawer(plan)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] cursor-pointer"
                    >
                      Edit
                    </button>
                    {plan.status === 'Active' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPlanToDiscontinue(plan);
                          setDiscontinueReason('');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] cursor-pointer"
                      >
                        Discontinue
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => reactivateSubscriptionPlan(plan.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] cursor-pointer"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT SUBSCRIPTION PLAN SLIDE-OVER DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white dark:bg-[#131d33] w-full max-w-xl h-full overflow-y-auto p-6 border-l border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-normal text-slate-900 dark:text-white">
                  {editingPlan
                    ? `Edit Subscription Plan (${editingPlan.name} • v${editingPlan.version})`
                    : 'Create New Subscription Plan'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Fields sync directly to the Student-facing Subscription Checkout cards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              {/* Plan Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    Plan Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g., Monthly Plan, Pro, Enterprise"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    Card Highlight Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g., Popular Choice, Best Value"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 block">
                  Subtitle / Savings Note
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g., Save INR 150 vs. 3 monthly cycles (INR 200/mo)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Pricing Configuration */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-slate-800 dark:text-slate-200">Pricing Configuration</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as PlanCurrency)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Base Price <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Strikethrough Price
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={strikethroughPrice}
                      onChange={(e) => setStrikethroughPrice(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Billing Cadence
                    </label>
                    <select
                      value={billingFrequency}
                      onChange={(e) => setBillingFrequency(e.target.value as BillingCadence)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                      <option value="One-Time">One-Time</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={gstApplicable}
                    onChange={(e) => setGstApplicable(e.target.checked)}
                    className="accent-[#00A896] cursor-pointer"
                  />
                  <span>Add +18% GST at Checkout (+ GST as applicable)</span>
                </label>
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#00A896]" />
                    <span>
                      Effective Start Date <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    value={effectiveStartDate}
                    onChange={(e) => setEffectiveStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    End / Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Course Access & Quotas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    Course Access Level
                  </label>
                  <input
                    type="text"
                    value={courseAccessLevel}
                    onChange={(e) => setCourseAccessLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    Usage Quotas Summary Label
                  </label>
                  <input
                    type="text"
                    value={usageQuotas}
                    onChange={(e) => setUsageQuotas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* AI AGENT TOKEN QUOTA & UNIT ECONOMICS CONFIGURATION */}
              <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-[#122238] border border-cyan-200/80 dark:border-cyan-800/70 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#00A896]" />
                    <span>AI Agent Token Quota &amp; Cost Economics</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncTokenBulletsToFeatures}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1a2540] hover:bg-slate-100 dark:hover:bg-slate-800 border border-cyan-300 dark:border-cyan-700 text-[11px] text-[#00A896] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Sync Token Bullet to Card</span>
                  </button>
                </div>

                {/* Quick Token Presets */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400 mr-1">Presets:</span>
                  {[
                    { label: '25K Trial', val: '25000' },
                    { label: '250K Annual', val: '250000' },
                    { label: '350K Monthly', val: '350000' },
                    { label: '500K Quarterly', val: '500000' },
                    { label: '750K Pro', val: '750000' },
                    { label: '1M Heavy', val: '1000000' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setMonthlyTokenQuota(preset.val)}
                      className={`px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                        monthlyTokenQuota === preset.val
                          ? 'bg-[#00A896] text-white border-[#00A896]'
                          : 'bg-white dark:bg-[#131d33] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#00A896]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 dark:text-slate-300 block">
                      Monthly AI Token Quota <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={monthlyTokenQuota}
                      onChange={(e) => setMonthlyTokenQuota(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white tabular-nums"
                    />
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Approx. {liveDraftEconomics.approxDoubtsPerMonth} AI doubts/mo ({formatCompactTokens(liveDraftEconomics.totalCycleTokens)} / cycle)
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 dark:text-slate-300 block">
                      Monthly Image Vision Doubts Cap
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={maxVisionDoubtsPerMonth}
                      onChange={(e) => setMaxVisionDoubtsPerMonth(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white tabular-nums"
                    />
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Diagram / photo uploads allowed per month
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 dark:text-slate-300 block">
                      AI Model Routing Tier
                    </label>
                    <select
                      value={aiModelTier}
                      onChange={(e) => setAiModelTier(e.target.value as AiModelRoutingTier)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {Object.values(AI_MODEL_TIER_SPECS).map((spec) => (
                        <option key={spec.id} value={spec.id}>
                          {spec.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 dark:text-slate-300 block">
                      Quota Exhaustion Policy (At 100%)
                    </label>
                    <select
                      value={overagePolicy}
                      onChange={(e) => setOveragePolicy(e.target.value as AiOveragePolicy)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="prompt-upgrade-or-addon">
                        Prompt Upgrade Plan or Buy Credit Pack
                      </option>
                      <option value="auto-downgrade-lite">
                        Auto-Downgrade to Flash-Lite
                      </option>
                      <option value="hard-cap-pause">
                        Pause AI Chat Until Cycle Resets
                      </option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contextCachingEnabled}
                    onChange={(e) => setContextCachingEnabled(e.target.checked)}
                    className="accent-[#00A896] cursor-pointer"
                  />
                  <span>
                    Enable Gemini Context Caching for Board/Grade system instructions (~90% input cost savings)
                  </span>
                </label>

                {/* Live Wholesale Cost vs Retail Markup Preview */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#00A896]" />
                      <span>Live Wholesale Cost vs. Retail Margin Preview (At 100% Quota Burn)</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] border ${
                        liveDraftEconomics.isBelowMarginFloor
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {liveDraftEconomics.isBelowMarginFloor ? 'Below 60% Margin Floor' : 'Healthy Unit Economics'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] tabular-nums">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#1a2540]">
                      <div className="text-[10px] text-slate-400">Wholesale / 100K</div>
                      <div className="text-slate-900 dark:text-white">
                        ₹{liveDraftEconomics.wholesalePer100kINR}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#1a2540]">
                      <div className="text-[10px] text-slate-400">Your Retail / 100K</div>
                      <div className="text-slate-900 dark:text-white">
                        ₹{liveDraftEconomics.retailPer100kINR}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#1a2540]">
                      <div className="text-[10px] text-slate-400">Max Cycle COGS</div>
                      <div className="text-amber-600 dark:text-amber-400">
                        ₹{liveDraftEconomics.totalCycleCogsINR}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#1a2540]">
                      <div className="text-[10px] text-slate-400">Markup &amp; Margin</div>
                      <div className="text-emerald-600 dark:text-emerald-400">
                        {liveDraftEconomics.markupMultiplier}× &bull; {liveDraftEconomics.grossMarginPct}%
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex flex-wrap justify-between gap-2">
                    <span>
                      Est. Gross Profit / cycle: ₹{liveDraftEconomics.grossProfitINR}
                    </span>
                    <span>
                      Net Profit after 2% Gateway &amp; Infra: ₹{liveDraftEconomics.netProfitAfterFeesINR} ({liveDraftEconomics.netMarginPct}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Feature Entitlements */}
              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-300 block">
                  Feature Entitlements (Displayed on Student Pricing Cards)
                </label>
                <div className="space-y-2">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleUpdateFeatureAt(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeatureAt(idx)}
                        disabled={features.length <= 1}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 cursor-pointer"
                        title="Remove feature line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeatureBullet();
                      }
                    }}
                    placeholder="Add another included entitlement..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a2540] border border-dashed border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeatureBullet}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white cursor-pointer"
                  >
                    + Add Bullet
                  </button>
                </div>
              </div>

              {/* Versioning & Grandfathering Integrity Rule */}
              {editingPlan && editingPlan.status === 'Active' && pricingOrCoreEntitlementsEdited && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Pricing / Entitlement Versioning Rule ({editingPlan.activeSubscribersCount} active subscribers)
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-amber-800 dark:text-amber-300">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="integrityMode"
                        checked={integrityMode === 'new-enrollments-only'}
                        onChange={() => setIntegrityMode('new-enrollments-only')}
                        className="mt-0.5 accent-[#00A896]"
                      />
                      <span>
                        <strong>Grandfather Existing Subscribers (Recommended):</strong> Apply changes to new enrollments only (creates v{editingPlan.version + 1}).
                      </span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="integrityMode"
                        checked={integrityMode === 'next-renewal-cycle'}
                        onChange={() => setIntegrityMode('next-renewal-cycle')}
                        className="mt-0.5 accent-[#00A896]"
                      />
                      <span>
                        <strong>Apply at Next Renewal Cycle:</strong> Notify current subscribers and transition upon their next billing renewal.
                      </span>
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-[11px] text-amber-900 dark:text-amber-200 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmedIntegrityImpact}
                      onChange={(e) => setConfirmedIntegrityImpact(e.target.checked)}
                      className="accent-[#00A896]"
                    />
                    <span>I confirm this billing version policy for active subscribers.</span>
                  </label>
                </div>
              )}

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white cursor-pointer"
                >
                  {editingPlan ? 'Save & Sync Plan Changes' : 'Publish Subscription Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISCONTINUE / BLOCK CONFIRMATION MODAL */}
      {planToDiscontinue && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131d33] rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Discontinue "{planToDiscontinue.name}"?</span>
              </div>
              <button
                type="button"
                onClick={() => setPlanToDiscontinue(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Discontinuing this plan will hide it from new students. Existing subscribers ({planToDiscontinue.activeSubscribersCount}) will remain unaffected until renewal. Proceed?
            </p>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 block">
                Audit Note / Reason (Optional)
              </label>
              <input
                type="text"
                value={discontinueReason}
                onChange={(e) => setDiscontinueReason(e.target.value)}
                placeholder="e.g., Replaced by updated curriculum bundle"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlanToDiscontinue(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  discontinueSubscriptionPlan(planToDiscontinue.id, discontinueReason);
                  setPlanToDiscontinue(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
              >
                Confirm Discontinue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT TRAIL MODAL */}
      {isAuditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131d33] rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-normal text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-[#00A896]" />
                  <span>Subscription Plan Audit Trail</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tracks Admin ID, timestamp, versioning mode, and soft-archive lifecycle changes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Filter by Plan:</span>
              <select
                value={auditPlanFilter}
                onChange={(e) => setAuditPlanFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Plans</option>
                {subscriptionPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {subscriptionPlanAuditLogs
                .filter((log) => auditPlanFilter === 'ALL' || log.planId === auditPlanFilter)
                .map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] border ${
                            log.action === 'Created' || log.action === 'Reactivated'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : log.action === 'Discontinued'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="text-slate-900 dark:text-white">{log.planName}</span>
                        {log.versionSnapshot && (
                          <span className="text-[10px] font-mono text-slate-400">
                            v{log.versionSnapshot}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300">{log.summary}</p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#00A896]" />
                      <span>
                        Admin ID: {log.adminId} ({log.adminName})
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT SUBSCRIBER SLIDE-OVER DRAWER */}
      {isSubDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white dark:bg-[#131d33] w-full max-w-lg h-full overflow-y-auto p-6 border-l border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-medium text-slate-900 dark:text-white">
                  {editingSubscriber ? `Edit Subscriber — ${editingSubscriber.studentName}` : 'Add New Subscriber'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Syncs subscriber directory, financial ledger, and AI token quota immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubscriber} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    Student Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="e.g., Priya Menon"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">Phone</label>
                  <input
                    type="text"
                    value={subPhone}
                    onChange={(e) => setSubPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">Grade</label>
                  <select
                    value={subGrade}
                    onChange={(e) => setSubGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={`Grade ${g}`}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">Board</label>
                  <select
                    value={subBoard}
                    onChange={(e) => setSubBoard(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {['CBSE', 'ICSE', 'IB', 'IGCSE', 'PSEB', 'GSEB', 'MSBSHSE', 'KSEEB', 'BSEAP/TOSS', 'WBBSE', 'Tamil Nadu State Board'].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subState}
                    onChange={(e) => setSubState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {INDIAN_STATES_SUGGESTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subCity}
                    onChange={(e) => setSubCity(e.target.value)}
                    placeholder="e.g., Mumbai, Pune, Jaipur..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    Subscription Plan
                  </label>
                  <select
                    value={subPlanId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setSubPlanId(nextId);
                      setSubExpiresAt(computeExpiryFromPlan(nextId, subStartDate));
                      setSubAmountINR(computeTotalInrFromPlan(nextId));
                      if (nextId === 'trial') setSubStatus('Trial');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {subscriptionPlans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.currency} {p.basePrice} / {p.billingFrequency})
                      </option>
                    ))}
                    <option value="trial">7-Day Free Trial (INR 0)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    Amount Paid (INR incl. GST)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={subAmountINR}
                    onChange={(e) => setSubAmountINR(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    Subscribed Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={subStartDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSubStartDate(val);
                      if (val) setSubExpiresAt(computeExpiryFromPlan(subPlanId, val));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    Renewal / Expiry Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={subExpiresAt}
                    onChange={(e) => setSubExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    Payment Method
                  </label>
                  <select
                    value={subPaymentMethod}
                    onChange={(e) =>
                      setSubPaymentMethod(e.target.value as SubscriberRecord['paymentMethod'])
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Offline / Invoice">Offline / Invoice</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block">
                    Account Status
                  </label>
                  <select
                    value={subStatus}
                    onChange={(e) =>
                      setSubStatus(e.target.value as SubscriberRecord['status'])
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Trial">Trial</option>
                    <option value="Past Due">Past Due</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={subRecurring}
                  onChange={(e) => setSubRecurring(e.target.checked)}
                  className="accent-[#00A896]"
                />
                <span>Enable Monthly Recurring Auto-Renew</span>
              </label>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 block">
                  Admin Note (Optional)
                </label>
                <input
                  type="text"
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  placeholder="e.g., School scholarship cohort or manual NEFT verification"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {subFormError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                  {subFormError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white font-medium cursor-pointer"
                >
                  {editingSubscriber ? 'Save Subscriber Changes' : 'Add & Activate Subscriber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
