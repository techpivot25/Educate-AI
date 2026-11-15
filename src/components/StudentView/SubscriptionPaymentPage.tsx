import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
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

export type PlanId = 'monthly' | 'quarterly' | 'annual';
export type PaymentOptionId = 'Credit Card' | 'Debit Card' | 'PayPal' | 'UPI' | 'Net Banking';

interface SubscriptionPlanOption {
  id: PlanId;
  name: string;
  tierLabel: 'Monthly Plan' | 'Quarterly Plan' | 'Annual Plan';
  billingCycle: string;
  priceINR: number;
  effectiveMonthlyINR: number;
  badge?: string;
  savingsNote: string;
  features: string[];
}

const GST_RATE = 0.18;

const SUBSCRIPTION_PLANS: SubscriptionPlanOption[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    tierLabel: 'Monthly Plan',
    billingCycle: 'per month',
    priceINR: 250,
    effectiveMonthlyINR: 250,
    savingsNote: 'Flexible month-to-month access',
    features: [
      'Full Agile Study Roadmap & Daily Planner',
      'Unlimited Socratic 24/7 AI Tutor Sessions',
      'Interactive Practice Quizzes & Mock Tests',
      'Pomodoro Study Timer & Progress Analytics',
    ],
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    tierLabel: 'Quarterly Plan',
    billingCycle: 'per 3 months',
    priceINR: 600,
    effectiveMonthlyINR: 200,
    badge: 'Popular Choice',
    savingsNote: 'Save INR 150 vs. 3 monthly cycles (INR 200/mo)',
    features: [
      'Everything in Monthly Plan included',
      'Full Master Formulas & Board Diagrams Library',
      'Parental Weekly Digest PDF Summaries',
      'Offline Study Pack & Priority Doubt Q&A',
    ],
  },
  {
    id: 'annual',
    name: 'Annual Plan',
    tierLabel: 'Annual Plan',
    billingCycle: 'per year',
    priceINR: 1100,
    effectiveMonthlyINR: 92,
    badge: 'Best Value',
    savingsNote: 'Save INR 1,900/year vs. monthly (~INR 92/mo)',
    features: [
      'Everything in Quarterly Plan for 12 months',
      'Verified Digital Skill & Mastery Certificates',
      'Full-Year Exam Sprint & Revision Roadmaps',
      'Lowest effective monthly rate all year',
    ],
  },
];

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
  const { subscriptionState, updateSubscription, currentUser, addNotification } = useApp();

  const [step, setStep] = useState<'plans' | 'payment' | 'success'>('plans');
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>('quarterly');
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

  const selectedPlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[0];

  const gstAmount = Math.round(selectedPlan.priceINR * GST_RATE);
  const totalPayable = selectedPlan.priceINR + gstAmount;

  const clearTransientFinancialFields = () => {
    setCardHolder('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setPaypalEmail('');
    setUpiId('');
  };

  const handleChoosePlan = (planId: PlanId) => {
    setSelectedPlanId(planId);
    setRecurringMonthly(planId === 'monthly' ? true : recurringMonthly);
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

      // Only store non-sensitive plan status; zero financial credentials saved
      updateSubscription({
        tier: selectedPlan.tierLabel,
        activePlanId: selectedPlan.id,
        isActive: true,
        autoRenew: recurringMonthly,
        recurringMonthly,
        lastBilledAmountINR: totalPayable,
        paymentMethod: {
          type: paymentOption,
          detail: 'Financial details not stored',
        },
      });

      setReceiptMeta({
        referenceId: refId,
        planName: selectedPlan.name,
        baseAmount: selectedPlan.priceINR,
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
        `${selectedPlan.name} (INR ${totalPayable} incl. GST) activated via ${paymentOption}.`,
        'success',
        'student'
      );
    }, 650);
  };

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

      {/* STEP 1: 3 SUBSCRIPTION PLANS */}
      {step === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const planGst = Math.round(plan.priceINR * GST_RATE);
              const planTotal = plan.priceINR + planGst;
              const isCurrentActive = subscriptionState.tier === plan.tierLabel;
              const isHighlighted = plan.id === 'quarterly';

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 border flex flex-col justify-between transition-all bg-white dark:bg-[#0E1A2D] ${
                    isHighlighted
                      ? 'border-[#00A896]/70 ring-1 ring-[#00A896]/25 shadow-sm'
                      : 'border-slate-200/90 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-normal text-slate-900 dark:text-white">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                          {plan.savingsNote}
                        </p>
                      </div>
                      {plan.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-teal-50 dark:bg-teal-950/60 text-[#00A896] dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/70 shrink-0">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Price Display */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/55 border border-slate-200/80 dark:border-slate-700/70 space-y-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-normal text-slate-900 dark:text-white tabular-nums">
                          INR {plan.priceINR.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-300">
                          {plan.billingCycle}
                        </span>
                      </div>
                      <div className="text-xs text-[#00A896] dark:text-teal-300">
                        + GST as applicable (18% GST: INR {planGst} &bull; Total: INR {planTotal.toLocaleString('en-IN')})
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-200">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#00A896] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleChoosePlan(plan.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-normal transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
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
      {step === 'payment' && (
        <form onSubmit={handleCompletePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Payment Options, Recurring Billing, Terms & Disclaimer */}
          <div className="lg:col-span-7 space-y-5">
            {/* Switch Plan Mini Selector */}
            <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                <span>Selected Subscription Plan</span>
                <span>All plans + GST as applicable</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPlanId === plan.id
                        ? 'bg-slate-200/90 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-400 dark:border-slate-500'
                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-normal">{plan.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-300 mt-0.5">
                      INR {plan.priceINR.toLocaleString('en-IN')} + GST
                    </div>
                  </button>
                ))}
              </div>
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

              {/* Recurring Payment Monthly Option */}
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
                <span>Selected Plan</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedPlan.name}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                <span>Plan Base Price ({selectedPlan.billingCycle})</span>
                <span className="tabular-nums">INR {selectedPlan.priceINR.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                <span>GST (18% as applicable)</span>
                <span className="tabular-nums">INR {gstAmount.toLocaleString('en-IN')}.00</span>
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
                  INR {totalPayable.toLocaleString('en-IN')}.00
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
                  : `Pay INR ${totalPayable.toLocaleString('en-IN')} via ${paymentOption}`}
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
    </div>
  );
};
