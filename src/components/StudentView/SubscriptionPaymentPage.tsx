import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Coins,
  Cpu,
  CreditCard,
  FileText,
  Info,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AI_ADDON_PACKS, AI_MODEL_TIER_SPECS, formatCompactTokens } from '../../utils/tokenPricing';

export type PlanId = string;
export type PaymentOptionId = 'Credit Card' | 'Debit Card' | 'PayPal' | 'UPI' | 'Net Banking';

const GST_RATE = 0.18;

const NET_BANKING_BANKS = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
];

const UPI_APPS = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'];

interface SubscriptionPaymentPageProps {
  onBackToDashboard: () => void;
}

export const SubscriptionPaymentPage: React.FC<SubscriptionPaymentPageProps> = ({
  onBackToDashboard,
}) => {
  const {
    subscriptionPlans,
    subscriptionState,
    updateSubscription,
    billingLedger,
    recordBillingTransaction,
    currentStudentAiQuota,
    purchaseAddonTokenPack,
    currentUser,
    addNotification,
  } = useApp();

  const todayIso = new Date().toISOString().split('T')[0];

  const availablePlans = subscriptionPlans.filter((plan) => {
    if (plan.status !== 'Active') return false;
    if (plan.effectiveStartDate && plan.effectiveStartDate > todayIso) return false;
    if (plan.endDate && plan.endDate < todayIso) return false;
    return true;
  });

  const currentGrandfatheredPlan = subscriptionPlans.find(
    (p) =>
      (p.id === subscriptionState.activePlanId || p.name === subscriptionState.tier) &&
      p.status === 'Discontinued'
  );

  const [step, setStep] = useState<'plans' | 'payment' | 'success'>('plans');
  const [checkoutType, setCheckoutType] = useState<'plan' | 'addon'>('plan');
  const [selectedAddonPackId, setSelectedAddonPackId] = useState<string>(AI_ADDON_PACKS[0].id);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    availablePlans.find((p) => p.id === 'quarterly')?.id || availablePlans[0]?.id || ''
  );
  const [paymentOption, setPaymentOption] = useState<PaymentOptionId>('Credit Card');
  const [recurringMonthly, setRecurringMonthly] = useState<boolean>(true);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [showFullTerms, setShowFullTerms] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [receiptMeta, setReceiptMeta] = useState<{
    referenceId: string;
    planName: string;
    baseAmount: number;
    gstAmount: number;
    totalAmount: number;
    method: PaymentOptionId;
    recurringMonthly: boolean;
    paidAt: string;
  } | null>(null);

  // Transient payment form inputs (never persisted to storage or context)
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [selectedBank, setSelectedBank] = useState(NET_BANKING_BANKS[0]);

  const selectedAddonPack =
    AI_ADDON_PACKS.find((p) => p.id === selectedAddonPackId) || AI_ADDON_PACKS[0];

  const selectedPlan =
    availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0];

  const selectedCurrency = checkoutType === 'addon' ? 'INR' : selectedPlan?.currency || 'INR';
  const selectedBasePrice =
    checkoutType === 'addon' ? selectedAddonPack.priceINR : selectedPlan?.basePrice ?? 0;
  const gstAmount =
    checkoutType === 'addon' || selectedPlan?.gstApplicable
      ? Math.round(selectedBasePrice * GST_RATE)
      : 0;
  const totalPayable = selectedBasePrice + gstAmount;

  const clearTransientFinancialFields = () => {
    setCardHolder('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setPaypalEmail('');
    setUpiId('');
  };

  const handleChoosePlan = (planId: string) => {
    setCheckoutType('plan');
    setSelectedPlanId(planId);
    setRecurringMonthly(planId === 'monthly' ? true : recurringMonthly);
    setValidationError('');
    setStep('payment');
  };

  const handleChooseAddonPack = (packId: string) => {
    setCheckoutType('addon');
    setSelectedAddonPackId(packId);
    setRecurringMonthly(false);
    setValidationError('');
    setStep('payment');
  };

  const formatCardNumberInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const validatePaymentForm = (): string | null => {
    if (paymentOption === 'Credit Card' || paymentOption === 'Debit Card') {
      if (!cardHolder.trim()) return `Please enter the cardholder name for your ${paymentOption}.`;
      const rawDigits = cardNumber.replace(/\s+/g, '');
      if (rawDigits.length < 12) return `Please enter a valid ${paymentOption.toLowerCase()} number.`;
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) return 'Please enter expiry in MM/YY format.';
      if (cardCvv.replace(/\D/g, '').length < 3) return 'Please enter a valid 3 or 4 digit CVV.';
    } else if (paymentOption === 'PayPal') {
      if (!paypalEmail.trim() || !paypalEmail.includes('@')) {
        return 'Please enter a valid PayPal account email address.';
      }
    } else if (paymentOption === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        return 'Please enter a valid UPI ID (e.g., name@okbank).';
      }
    } else if (paymentOption === 'Net Banking') {
      if (!selectedBank) return 'Please select your bank for Net Banking.';
    }

    if (!termsAccepted) {
      return 'You must accept the Terms & Conditions before completing your subscription payment.';
    }

    return null;
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validatePaymentForm();
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');
    setIsProcessing(true);

    setTimeout(() => {
      const refId = `PVQ-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
      const paidAtStr = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      if (checkoutType === 'addon') {
        const recordedTx = purchaseAddonTokenPack(selectedAddonPack.id, paymentOption);
        setReceiptMeta({
          referenceId: recordedTx?.invoiceId || refId,
          planName: `AI Credit Top-Up: ${selectedAddonPack.name}`,
          baseAmount: selectedBasePrice,
          gstAmount,
          totalAmount: totalPayable,
          method: paymentOption,
          recurringMonthly: false,
          paidAt: paidAtStr,
        });
        clearTransientFinancialFields();
        setIsProcessing(false);
        setStep('success');
        return;
      }

      if (!selectedPlan) {
        setIsProcessing(false);
        return;
      }

      const cycleDays =
        selectedPlan.billingFrequency === 'Annually'
          ? 365
          : selectedPlan.billingFrequency === 'Quarterly'
          ? 90
          : selectedPlan.billingFrequency === 'One-Time'
          ? 365
          : 30;
      const expiryDate = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // Only store non-sensitive plan status; zero financial credentials saved
      updateSubscription({
        tier: selectedPlan.name,
        activePlanId: selectedPlan.id,
        grandfatheredPlanVersion: selectedPlan.version,
        lockedCyclePrice: totalPayable,
        isActive: true,
        moduleAccessEnabled: true,
        billingStatus: 'Active',
        expiresAt: expiryDate,
        autoRenew: recurringMonthly,
        recurringMonthly,
        lastBilledAmountINR: totalPayable,
        paymentMethod: {
          type: paymentOption,
          detail: 'Financial details not stored',
        },
      });

      const recordedTx = recordBillingTransaction({
        studentId: currentUser?.id || 'user-stu-1',
        studentName: currentUser?.name || 'Sarah Connor',
        studentEmail: currentUser?.email || 'sarah.c@educateai.org',
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        baseAmountINR: selectedBasePrice,
        gstAmountINR: gstAmount,
        totalAmountINR: totalPayable,
        paymentMethod: paymentOption,
        paymentStatus: 'Success',
        recurringMonthly,
        expiresAt: expiryDate,
        note: `${selectedPlan.name} (v${selectedPlan.version}) activated${selectedPlan.gstApplicable ? ' + 18% GST' : ''}`,
      });

      setReceiptMeta({
        referenceId: recordedTx.invoiceId || refId,
        planName: selectedPlan.name,
        baseAmount: selectedBasePrice,
        gstAmount,
        totalAmount: totalPayable,
        method: paymentOption,
        recurringMonthly,
        paidAt: paidAtStr,
      });

      clearTransientFinancialFields();
      setIsProcessing(false);
      setStep('success');

      addNotification(
        'Subscription Activated',
        `${selectedPlan.name} (${selectedCurrency} ${totalPayable}${selectedPlan.gstApplicable ? ' incl. GST' : ''}) activated via ${paymentOption}.`,
        'success',
        'student'
      );
    }, 650);
  };

  const studentTransactions = billingLedger.filter(
    (tx) =>
      !currentUser ||
      tx.studentId === currentUser.id ||
      tx.studentEmail.toLowerCase() === currentUser.email.toLowerCase() ||
      tx.studentName === currentUser.name
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Step Indicator */}
      <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {step === 'payment' && (
              <button
                type="button"
                onClick={() => {
                  setValidationError('');
                  setStep('plans');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Plans</span>
              </button>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              Current Status: {subscriptionState.tier}
              {subscriptionState.tier === '7-Day Free Trial'
                ? ` (${subscriptionState.trialDaysLeft} days left)`
                : ' (Active)'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light text-slate-900 dark:text-white tracking-wide">
            {step === 'plans'
              ? 'Choose Your Learning Subscription Plan'
              : step === 'payment'
              ? 'Complete Subscription Payment'
              : 'Subscription Payment Confirmed'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300">
            {step === 'plans'
              ? 'Upgrade from your 7-day free trial with transparent INR pricing (+ GST as applicable).'
              : step === 'payment'
              ? 'Select your preferred payment method and recurring monthly billing preference.'
              : 'Your learning access is active. No financial details were saved during checkout.'}
          </p>
        </div>

        {/* Clean 2-Step Indicator */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <button
            type="button"
            onClick={() => step !== 'success' && setStep('plans')}
            className={`px-3 py-1.5 rounded-xl border transition-colors ${
              step === 'plans'
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700 cursor-pointer'
            }`}
          >
            1. Select Plan
          </button>
          <span className="text-slate-400">&rarr;</span>
          <div
            className={`px-3 py-1.5 rounded-xl border ${
              step === 'payment'
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            2. Payment &amp; Terms
          </div>
        </div>
      </div>

      {/* GRANDFATHERED PLAN NOTICE WHEN EXISTING PLAN IS DISCONTINUED BY ADMIN */}
      {currentGrandfatheredPlan && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/70 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            Your current tier (<strong>{currentGrandfatheredPlan.name}</strong>) has been discontinued for new enrollments, but your active entitlement remains grandfathered and unaffected through <strong>{subscriptionState.expiresAt || subscriptionState.trialEndDate}</strong>.
          </div>
        </div>
      )}

      {/* STEP 1: DYNAMIC ACTIVE SUBSCRIPTION PLANS */}
      {step === 'plans' && (
        <div className="space-y-6">
          {availablePlans.length === 0 ? (
            <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-300">
              No active subscription plans are currently open for new enrollment. Existing active subscribers retain uninterrupted access.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {availablePlans.map((plan) => {
                const planGst = plan.gstApplicable ? Math.round(plan.basePrice * GST_RATE) : 0;
                const planTotal = plan.basePrice + planGst;
                const isCurrentActive =
                  subscriptionState.activePlanId === plan.id || subscriptionState.tier === plan.name;
                const isHighlighted =
                  plan.id === 'quarterly' ||
                  plan.badge === 'Recommended' ||
                  plan.badge === 'Popular Choice';

                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-6 border flex flex-col transition-all bg-white dark:bg-[#0E1A2D] ${
                      isHighlighted
                        ? 'border-[#00A896] ring-1 ring-[#00A896]/25 shadow-sm'
                        : 'border-slate-200/90 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* 1. Header Band (Uniform Height for Exact Price Box Alignment) */}
                    <div className="min-h-[72px] flex items-start justify-between gap-2.5">
                      <div className="min-w-0">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white leading-snug">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                          {plan.subtitle}
                        </p>
                      </div>
                      {plan.badge && (
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border shrink-0 whitespace-nowrap ${
                            isHighlighted
                              ? 'bg-[#00A896]/10 text-[#00A896] border-[#00A896]/40'
                              : 'bg-teal-50 dark:bg-teal-950/60 text-[#00A896] dark:text-teal-300 border-teal-200/70 dark:border-teal-800/70'
                          }`}
                        >
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* 2. Price Box Band (Uniform Height & Crisp 2-Line Structure) */}
                    <div className="mt-4 px-4 py-4 min-h-[108px] rounded-xl bg-slate-50 dark:bg-slate-800/55 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-center gap-1.5">
                      <div className="flex flex-wrap items-baseline gap-2">
                        {typeof plan.strikethroughPrice === 'number' &&
                          plan.strikethroughPrice > plan.basePrice && (
                            <span className="text-xs text-slate-400 line-through tabular-nums">
                              {plan.currency} {plan.strikethroughPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        <span className="text-[28px] leading-none font-medium text-slate-900 dark:text-white tabular-nums tracking-tight">
                          {plan.currency} {plan.basePrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-300">
                          {plan.billingCycleLabel}
                        </span>
                      </div>
                      <div className="text-[11px] leading-snug text-[#00A896] dark:text-teal-300 tabular-nums">
                        {plan.gstApplicable
                          ? `+ 18% GST (${plan.currency} ${planGst}) • Total: ${plan.currency} ${planTotal.toLocaleString('en-IN')}`
                          : `Tax inclusive • Total: ${plan.currency} ${planTotal.toLocaleString('en-IN')}`}
                      </div>
                    </div>

                    {/* 3. Subtle Single-Line AI Allowance Bar */}
                    <div className="mt-3 px-3.5 py-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5 font-medium">
                        <Cpu className="w-3.5 h-3.5 text-[#00A896] shrink-0" />
                        <span>{formatCompactTokens(plan.monthlyTokenQuota ?? 350000)} AI tokens/mo</span>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 truncate">
                        {AI_MODEL_TIER_SPECS[plan.aiModelTier || 'flash-lite-hybrid']?.shortLabel}
                      </span>
                    </div>

                    {/* 4. Clean Features List */}
                    <ul className="mt-5 flex-1 space-y-3 text-[13px] text-slate-600 dark:text-slate-200">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 leading-snug">
                          <Check className="w-4 h-4 text-[#00A896] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* 5. Aligned Footer CTA */}
                    <div className="pt-5 mt-6 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleChoosePlan(plan.id)}
                        className={`w-full h-10 px-4 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                          isHighlighted
                            ? 'bg-[#00A896] hover:bg-[#009282] text-white border-[#00A896]'
                            : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        <span>
                          {isCurrentActive ? `Selected (${plan.name})` : `Choose ${plan.name}`}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* AI TOKEN CREDIT ADD-ON PACKS */}
          <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#00A896]" />
                  <span>AI Token Credit Add-On Packs (Top-Up Wallet)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                  Add-on tokens activate automatically when your monthly plan quota reaches 100% and roll over while active.
                </p>
              </div>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 tabular-nums shrink-0">
                <span>
                  Monthly Left:{' '}
                  <strong className="text-[#00A896]">
                    {formatCompactTokens(
                      Math.max(
                        0,
                        currentStudentAiQuota.monthlyQuota - currentStudentAiQuota.monthlyTokensUsed
                      )
                    )}
                  </strong>
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span>
                  Add-On Wallet:{' '}
                  <strong className="text-cyan-600 dark:text-cyan-400">
                    +{formatCompactTokens(currentStudentAiQuota.addonCreditsRemaining)}
                  </strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {AI_ADDON_PACKS.map((pack) => {
                const packGst = Math.round(pack.priceINR * GST_RATE);
                return (
                  <div
                    key={pack.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/45 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2.5">
                      <div className="min-h-[26px] flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {pack.name}
                        </span>
                        {pack.badge && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 dark:bg-teal-950/60 text-[#00A896] border border-teal-200/70 dark:border-teal-800 shrink-0">
                            {pack.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-2xl font-medium text-slate-900 dark:text-white tabular-nums">
                          INR {pack.priceINR}
                        </span>
                        <span className="text-[11px] text-[#00A896] tabular-nums">
                          + 18% GST (Total: INR {pack.priceINR + packGst})
                        </span>
                      </div>
                      <div className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                        +{formatCompactTokens(pack.tokens)} AI tokens &bull; {pack.approxDoubts}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed min-h-[36px]">
                        {pack.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChooseAddonPack(pack.id)}
                      className="w-full h-9 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-900 dark:text-white cursor-pointer transition-colors"
                    >
                      Buy {pack.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing & Privacy Note */}
          <div className="bg-slate-50 dark:bg-[#0E1A2D] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#00A896] shrink-0" />
              <span>
                All plans support Credit Card, Debit Card, PayPal, UPI, and Net Banking with optional monthly recurring auto-pay. We never store your financial credentials.
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
              All prices in INR + GST as applicable
            </span>
          </div>
        </div>
      )}

      {/* STEP 2: PAYMENT PAGE */}
      {step === 'payment' && (checkoutType === 'addon' || selectedPlan) && (
        <form onSubmit={handleCompletePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Payment Options, Recurring Billing, Terms & Disclaimer */}
          <div className="lg:col-span-7 space-y-5">
            {/* Switch Plan or Credit Pack Mini Selector */}
            <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                <span>
                  {checkoutType === 'addon' ? 'Selected AI Credit Add-On Pack' : 'Selected Subscription Plan'}
                </span>
                <span>All prices + GST as applicable</span>
              </div>
              {checkoutType === 'addon' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {AI_ADDON_PACKS.map((pack) => (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setSelectedAddonPackId(pack.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedAddonPack.id === pack.id
                          ? 'bg-slate-200/90 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-400 dark:border-slate-500'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-normal">{pack.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-300 mt-0.5">
                        INR {pack.priceINR} + GST &bull; +{formatCompactTokens(pack.tokens)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availablePlans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedPlan.id === plan.id
                          ? 'bg-slate-200/90 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-400 dark:border-slate-500'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-normal">{plan.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-300 mt-0.5">
                        {plan.currency} {plan.basePrice.toLocaleString('en-IN')} {plan.gstApplicable ? '+ GST' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Options */}
            <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-light text-slate-900 dark:text-white">
                  Select Payment Method
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-300">
                  <Lock className="w-3.5 h-3.5 text-[#00A896]" />
                  <span>Session-Only Checkout</span>
                </span>
              </div>

              {/* 5 Payment Method Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(
                  [
                    { id: 'Credit Card', icon: <CreditCard className="w-4 h-4" /> },
                    { id: 'Debit Card', icon: <CreditCard className="w-4 h-4" /> },
                    { id: 'PayPal', icon: <Wallet className="w-4 h-4" /> },
                    { id: 'UPI', icon: <Smartphone className="w-4 h-4" /> },
                    { id: 'Net Banking', icon: <Building2 className="w-4 h-4" /> },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setPaymentOption(opt.id);
                      setValidationError('');
                    }}
                    className={`p-3 rounded-xl border text-xs font-normal flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentOption === opt.id
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-400 dark:border-slate-500 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt.icon}
                    <span className="text-center leading-tight">{opt.id}</span>
                  </button>
                ))}
              </div>

              {/* Payment Method Details Form */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/45 border border-slate-200/80 dark:border-slate-700/70 space-y-3">
                {(paymentOption === 'Credit Card' || paymentOption === 'Debit Card') && (
                  <div className="space-y-3 text-xs">
                    <div className="text-slate-700 dark:text-slate-200">
                      {paymentOption} Details (never saved after transaction)
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-300 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder={currentUser?.name || 'Name on card'}
                        autoComplete="off"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-300 mb-1">
                        {paymentOption} Number
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
                        placeholder="4532 •••• •••• 1234"
                        autoComplete="off"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-300 mb-1">
                          Expiry Date (MM/YY)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiryInput(e.target.value))}
                          placeholder="08/29"
                          autoComplete="off"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-300 mb-1">
                          CVV / Security Code
                        </label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="•••"
                          autoComplete="off"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentOption === 'PayPal' && (
                  <div className="space-y-3 text-xs">
                    <div className="text-slate-700 dark:text-slate-200">
                      PayPal Checkout
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-300 mb-1">
                        PayPal Account Email
                      </label>
                      <input
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder={currentUser?.email || 'parent@example.com'}
                        autoComplete="off"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-300">
                      You will authorize this INR {totalPayable.toLocaleString('en-IN')} payment via PayPal for this session without saving your PayPal credentials.
                    </p>
                  </div>
                )}

                {paymentOption === 'UPI' && (
                  <div className="space-y-3 text-xs">
                    <div className="text-slate-700 dark:text-slate-200">
                      UPI Instant Payment (GPay / PhonePe / Paytm / BHIM)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {UPI_APPS.map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setSelectedUpiApp(app)}
                          className={`px-3 py-1.5 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                            selectedUpiApp === app
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-400 dark:border-slate-500'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-300 mb-1">
                        Enter UPI ID ({selectedUpiApp})
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank"
                        autoComplete="off"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>
                  </div>
                )}

                {paymentOption === 'Net Banking' && (
                  <div className="space-y-3 text-xs">
                    <div className="text-slate-700 dark:text-slate-200">
                      Net Banking — Choose Your Bank
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {NET_BANKING_BANKS.map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`px-3 py-2 rounded-xl border text-left text-xs cursor-pointer transition-colors ${
                            selectedBank === bank
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-400 dark:border-slate-500'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recurring Payment Monthly Option (Plans Only) */}
              {checkoutType === 'plan' && selectedPlan && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/45 border border-slate-200/80 dark:border-slate-700/70 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <RefreshCw className="w-4 h-4 text-[#00A896] mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <div className="text-xs font-medium text-slate-900 dark:text-white">
                        Enable Monthly Recurring Payment (Auto-Renew Monthly)
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-300 leading-relaxed">
                        {selectedPlan.id === 'monthly'
                          ? 'Automatically bills INR 250 + GST every month so your study access continues uninterrupted. Cancel anytime.'
                          : `After your ${selectedPlan.name.toLowerCase()} period ends, automatically continue with monthly recurring billing (INR 250/month + GST). Cancel anytime.`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={recurringMonthly}
                    onClick={() => setRecurringMonthly((prev) => !prev)}
                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative shrink-0 ${
                      recurringMonthly ? 'bg-[#00A896]' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        recurringMonthly ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Financial Data Non-Storage Disclaimer */}
            <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-700 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-slate-700 dark:text-slate-200 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-medium text-slate-900 dark:text-white">
                  Financial Data Disclaimer — Zero Financial Data Saved
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  PivotIQ does <strong>not</strong> save, store, or retain any financial or payment data—including credit or debit card numbers, CVV, expiry dates, UPI IDs/PINs, PayPal credentials, or Net Banking login details—in our database or your browser storage. Payment inputs are used transiently for this session only and cleared immediately after checkout.
                </p>
              </div>
            </div>

            {/* Terms & Conditions + Acceptance */}
            <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-900 dark:text-white">
                  <FileText className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                  <span>Terms &amp; Conditions and Subscription Billing Policy</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullTerms((prev) => !prev)}
                  className="text-[11px] text-[#00A896] hover:underline cursor-pointer"
                >
                  {showFullTerms ? 'Hide Full Terms' : 'Read Full Terms'}
                </button>
              </div>

              <div
                className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed ${
                  showFullTerms ? 'max-h-60 overflow-y-auto' : 'max-h-24 overflow-y-auto'
                }`}
              >
                <p>
                  1. <strong>Subscription Plans &amp; GST:</strong> Subscriptions are offered as Monthly (INR 250), Quarterly (INR 600), and Annual (INR 1,100) plans. Goods &amp; Services Tax (GST @ 18% or as applicable under Indian tax regulations) is added at checkout.
                </p>
                <p>
                  2. <strong>Monthly Recurring Billing:</strong> If you enable the monthly recurring payment option, you authorize recurring monthly billing of INR 250 + applicable GST upon completion of your active billing cycle until cancelled. You may cancel recurring billing anytime prior to the next renewal date from Account Settings.
                </p>
                <p>
                  3. <strong>Financial Data Privacy &amp; Non-Storage:</strong> No card numbers, CVV codes, UPI PINs/handles, PayPal passwords, or Net Banking credentials are saved, cached, or logged by the platform.
                </p>
                <p>
                  4. <strong>Access &amp; Cancellation:</strong> Plan benefits activate immediately upon payment confirmation. Existing paid cycles remain active through the end of the purchased period even if recurring renewal is turned off.
                </p>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) setValidationError('');
                  }}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#00A896] focus:ring-[#00A896] cursor-pointer"
                />
                <span className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                  I have read and accept the{' '}
                  <span className="underline">Terms &amp; Conditions</span>, GST applicability (+18% as applicable), and acknowledge that my financial data will not be saved.
                </span>
              </label>

              {validationError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/35 border border-red-200 dark:border-red-800/70 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Cols: Order Summary & Pay Action */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-5 lg:sticky lg:top-24">
            <h3 className="text-base font-light text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Order &amp; Tax Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                <span>{checkoutType === 'addon' ? 'Selected Credit Pack' : 'Selected Plan'}</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {checkoutType === 'addon' ? selectedAddonPack.name : selectedPlan.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                <span>
                  {checkoutType === 'addon'
                    ? `Pack Price (+${selectedAddonPack.tokens.toLocaleString()} tokens)`
                    : `Plan Base Price (${selectedPlan.billingCycleLabel})`}
                </span>
                <span className="tabular-nums">{selectedCurrency} {selectedBasePrice.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                <span>GST (18% as applicable)</span>
                <span className="tabular-nums">{selectedCurrency} {gstAmount.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                <span>Payment Method</span>
                <span>{paymentOption}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                <span>Monthly Recurring Auto-Pay</span>
                <span className={recurringMonthly ? 'text-[#00A896]' : 'text-slate-500 dark:text-slate-400'}>
                  {recurringMonthly ? 'Enabled (INR 250/mo + GST)' : 'One-Time Cycle Only'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm text-slate-900 dark:text-white">
                <span>Total Payable</span>
                <span className="text-lg tabular-nums font-medium">
                  {selectedCurrency} {totalPayable.toLocaleString('en-IN')}.00
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-normal transition-all cursor-pointer flex items-center justify-center gap-2 ${
                termsAccepted
                  ? 'bg-[#00A896] hover:bg-[#009282] text-white shadow-xs'
                  : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white'
              } disabled:opacity-60`}
            >
              <Lock className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Processing Payment...'
                  : `Pay ${selectedCurrency} ${totalPayable.toLocaleString('en-IN')} via ${paymentOption}`}
              </span>
            </button>

            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
              No financial details are saved. Instant activation upon checkout.
            </p>
          </div>
        </form>
      )}

      {/* STEP 3: SUCCESS RECEIPT */}
      {step === 'success' && receiptMeta && (
        <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/80 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-light text-slate-900 dark:text-white">
              Subscription Activated Successfully
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Your {receiptMeta.planName} is now active. All transient financial inputs were cleared and were not saved.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-300">Reference ID</span>
              <span className="text-slate-900 dark:text-white tabular-nums">{receiptMeta.referenceId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-300">Active Plan</span>
              <span className="text-slate-900 dark:text-white">{receiptMeta.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-300">Base Price</span>
              <span className="text-slate-900 dark:text-white tabular-nums">
                INR {receiptMeta.baseAmount.toLocaleString('en-IN')}.00
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-300">GST (18% as applicable)</span>
              <span className="text-slate-900 dark:text-white tabular-nums">
                INR {receiptMeta.gstAmount.toLocaleString('en-IN')}.00
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-medium">
              <span className="text-slate-900 dark:text-white">Total Paid</span>
              <span className="text-slate-900 dark:text-white tabular-nums">
                INR {receiptMeta.totalAmount.toLocaleString('en-IN')}.00
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-300">Payment Method</span>
              <span className="text-slate-900 dark:text-white">{receiptMeta.method} (Not saved)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-300">Monthly Recurring Auto-Pay</span>
              <span className="text-slate-900 dark:text-white">
                {receiptMeta.recurringMonthly ? 'Enabled (Monthly)' : 'Off'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-300">Confirmed On</span>
              <span className="text-slate-900 dark:text-white">{receiptMeta.paidAt}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-5 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white text-xs cursor-pointer transition-colors"
            >
              Return to Student Dashboard
            </button>
            <button
              type="button"
              onClick={() => setStep('plans')}
              className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs cursor-pointer transition-colors"
            >
              View Subscription Plans
            </button>
          </div>
        </div>
      )}
      {/* BILLING HISTORY & INVOICE LOGS (Zero Financial Credentials Stored) */}
      <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-light text-slate-900 dark:text-white">
              Billing History &amp; Access Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Synced with Admin Financial Ledger. Only invoice metadata is stored; card/UPI credentials are never saved.
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs border self-start sm:self-auto ${
              subscriptionState.moduleAccessEnabled === false
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            Module Access: {subscriptionState.moduleAccessEnabled === false ? 'Suspended' : 'Provisioned'}
          </span>
        </div>

        {studentTransactions.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-300">
            No paid invoices yet. You are currently on {subscriptionState.tier}.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 text-[11px]">
                  <th className="py-2.5 px-3 font-normal">Invoice ID</th>
                  <th className="py-2.5 px-3 font-normal">Plan</th>
                  <th className="py-2.5 px-3 font-normal">Total (incl. GST)</th>
                  <th className="py-2.5 px-3 font-normal">Method</th>
                  <th className="py-2.5 px-3 font-normal">Expires</th>
                  <th className="py-2.5 px-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {studentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 tabular-nums text-slate-900 dark:text-white">{tx.invoiceId}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">
                      {tx.planName}
                      {tx.recurringMonthly && (
                        <span className="ml-1.5 text-[10px] text-[#00A896]">(Monthly Recurring)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums text-slate-900 dark:text-white">
                      INR {tx.totalAmountINR.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{tx.paymentMethod}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{tx.expiresAt}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] border ${
                          tx.paymentStatus === 'Success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : tx.paymentStatus === 'Failed'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {tx.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
