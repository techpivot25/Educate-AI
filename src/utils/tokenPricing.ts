import { AiAddonPack, AiModelRoutingTier, BillingCadence, PlanCurrency } from '../types';

export const USD_TO_INR = 85;
export const RECOMMENDED_RETAIL_FLOOR_INR_PER_100K = 19;

export interface AiModelTierSpec {
  id: AiModelRoutingTier;
  label: string;
  shortLabel: string;
  wholesalePer100kINR: number;
  inputPer1MUSD: number;
  outputPer1MUSD: number;
  description: string;
}

export const AI_MODEL_TIER_SPECS: Record<AiModelRoutingTier, AiModelTierSpec> = {
  'flash-lite': {
    id: 'flash-lite',
    label: 'Flash-Lite Only (Lowest COGS)',
    shortLabel: 'Flash-Lite',
    wholesalePer100kINR: 5.84,
    inputPer1MUSD: 0.25,
    outputPer1MUSD: 1.5,
    description: 'High-speed lightweight text explanations (~₹5.84 / 100K tokens)',
  },
  'flash-lite-hybrid': {
    id: 'flash-lite-hybrid',
    label: 'Flash-Lite + Hydrogen (80/20 Routing)',
    shortLabel: 'Flash-Lite + Hydrogen',
    wholesalePer100kINR: 7.74,
    inputPer1MUSD: 0.35,
    outputPer1MUSD: 1.95,
    description: '80% Flash-Lite text Q&A + 20% Hydrogen multimodal (~₹7.74 / 100K tokens)',
  },
  'hydrogen-standard': {
    id: 'hydrogen-standard',
    label: 'Hydrogen (LOW Thinking Fair-Use)',
    shortLabel: 'Hydrogen LOW',
    wholesalePer100kINR: 7.74,
    inputPer1MUSD: 0.35,
    outputPer1MUSD: 1.95,
    description: 'Balanced Hydrogen Socratic explanations with LOW thinking (~₹7.74 / 100K tokens)',
  },
  'hydrogen-vision': {
    id: 'hydrogen-vision',
    label: 'Hydrogen + Image Vision Priority',
    shortLabel: 'Hydrogen + Vision',
    wholesalePer100kINR: 7.74,
    inputPer1MUSD: 0.4,
    outputPer1MUSD: 2.1,
    description: 'Includes diagram & homework photo parsing (~₹7.74 blended / 100K tokens)',
  },
  'pro-reasoning': {
    id: 'pro-reasoning',
    label: 'Pro Deep Reasoning + Full Multimodal',
    shortLabel: 'Pro Deep Solve',
    wholesalePer100kINR: 15.3,
    inputPer1MUSD: 0.75,
    outputPer1MUSD: 3.75,
    description: 'Heavy multi-step STEM reasoning & image vision (~₹15.30 / 100K tokens)',
  },
};

export const AI_ADDON_PACKS: AiAddonPack[] = [
  {
    id: 'booster-100k',
    name: 'Quick Booster 100K',
    tokens: 100_000,
    priceINR: 49,
    approxDoubts: '~90-110 extra doubts',
    description: 'Instant top-up tokens that roll over while your subscription is active.',
  },
  {
    id: 'sprint-500k',
    name: 'Exam Sprint 500K',
    tokens: 500_000,
    priceINR: 149,
    badge: 'Popular',
    approxDoubts: '~450-550 extra doubts',
    description: 'Best for board & unit test prep; includes diagram vision support.',
  },
  {
    id: 'mega-1500k',
    name: 'Scholar Mega 1.5M',
    tokens: 1_500_000,
    priceINR: 299,
    badge: 'Best Value',
    approxDoubts: '~1,350+ extra doubts',
    description: 'Maximum exam-season AI runway at our lowest per-token add-on rate.',
  },
];

export function getCycleMonths(cadence: BillingCadence): number {
  if (cadence === 'Quarterly') return 3;
  if (cadence === 'Annually') return 12;
  return 1;
}

export function formatCompactTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    const val = tokens / 1_000_000;
    return `${Number.isInteger(val) ? val : val.toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    const val = tokens / 1_000;
    return `${Number.isInteger(val) ? val : val.toFixed(1)}K`;
  }
  return String(tokens);
}

export interface PlanTokenEconomics {
  cycleMonths: number;
  basePriceINR: number;
  totalCycleTokens: number;
  wholesalePer100kINR: number;
  retailPer100kINR: number;
  totalCycleCogsINR: number;
  monthlyCogsINR: number;
  markupMultiplier: number;
  grossProfitINR: number;
  grossMarginPct: number;
  netProfitAfterFeesINR: number;
  netMarginPct: number;
  approxDoubtsPerMonth: number;
  isBelowMarginFloor: boolean;
}

export function calculatePlanTokenEconomics(params: {
  basePrice: number;
  currency: PlanCurrency;
  billingFrequency: BillingCadence;
  monthlyTokenQuota: number;
  aiModelTier: AiModelRoutingTier;
}): PlanTokenEconomics {
  const cycleMonths = getCycleMonths(params.billingFrequency);
  const basePriceINR =
    params.currency === 'USD' ? params.basePrice * USD_TO_INR : params.basePrice;
  const safeMonthlyQuota = Math.max(0, Number(params.monthlyTokenQuota) || 0);
  const totalCycleTokens = safeMonthlyQuota * cycleMonths;
  const tierSpec =
    AI_MODEL_TIER_SPECS[params.aiModelTier] || AI_MODEL_TIER_SPECS['flash-lite-hybrid'];
  const wholesalePer100kINR = tierSpec.wholesalePer100kINR;

  const totalCycleCogsINR = Number(
    ((totalCycleTokens / 100_000) * wholesalePer100kINR).toFixed(2)
  );
  const monthlyCogsINR = Number((totalCycleCogsINR / cycleMonths).toFixed(2));
  const retailPer100kINR =
    totalCycleTokens > 0
      ? Number((basePriceINR / (totalCycleTokens / 100_000)).toFixed(2))
      : basePriceINR;

  const markupMultiplier =
    totalCycleCogsINR > 0 ? Number((basePriceINR / totalCycleCogsINR).toFixed(1)) : 0;
  const grossProfitINR = Number((basePriceINR - totalCycleCogsINR).toFixed(2));
  const grossMarginPct =
    basePriceINR > 0
      ? Number(((grossProfitINR / basePriceINR) * 100).toFixed(1))
      : 0;

  // Subtract 2% payment gateway fee + Rs 10/mo platform infra overhead
  const gatewayFee = basePriceINR * 0.02;
  const infraCost = 10 * cycleMonths;
  const netProfitAfterFeesINR = Number(
    (basePriceINR - totalCycleCogsINR - gatewayFee - infraCost).toFixed(2)
  );
  const netMarginPct =
    basePriceINR > 0
      ? Number(((netProfitAfterFeesINR / basePriceINR) * 100).toFixed(1))
      : 0;

  return {
    cycleMonths,
    basePriceINR,
    totalCycleTokens,
    wholesalePer100kINR,
    retailPer100kINR,
    totalCycleCogsINR,
    monthlyCogsINR,
    markupMultiplier,
    grossProfitINR,
    grossMarginPct,
    netProfitAfterFeesINR,
    netMarginPct,
    approxDoubtsPerMonth: Math.max(0, Math.round(safeMonthlyQuota / 950)),
    isBelowMarginFloor:
      basePriceINR > 0 &&
      (grossMarginPct < 60 ||
        (totalCycleTokens > 0 && retailPer100kINR < RECOMMENDED_RETAIL_FLOOR_INR_PER_100K)),
  };
}

export function estimateTurnCostINR(params: {
  promptTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  modelTier?: AiModelRoutingTier;
}): number {
  const tierSpec =
    AI_MODEL_TIER_SPECS[params.modelTier || 'flash-lite-hybrid'] ||
    AI_MODEL_TIER_SPECS['flash-lite-hybrid'];
  const cached = Math.min(params.promptTokens, params.cachedTokens || 0);
  const uncachedPrompt = Math.max(0, params.promptTokens - cached);

  // Cached input gets ~90% discount
  const inputCostUSD =
    (uncachedPrompt * tierSpec.inputPer1MUSD + cached * (tierSpec.inputPer1MUSD * 0.1)) /
    1_000_000;
  const outputCostUSD = (params.outputTokens * tierSpec.outputPer1MUSD) / 1_000_000;

  return Number(((inputCostUSD + outputCostUSD) * USD_TO_INR).toFixed(4));
}
