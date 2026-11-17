import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AiModelRoutingTier } from '../../types';
import {
  AI_ADDON_PACKS,
  AI_MODEL_TIER_SPECS,
  calculatePlanTokenEconomics,
  formatCompactTokens,
} from '../../utils/tokenPricing';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  Coins,
  Cpu,
  Plus,
  Sliders,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

export const AiCostMonitorDashboard: React.FC = () => {
  const {
    subscriptionPlans,
    billingLedger,
    studentAiQuotas,
    aiTokenUsageLogs,
    grantBonusTokensToStudent,
    updateStudentMonthlyQuotaOverride,
  } = useApp();

  // Interactive Margin Simulator State
  const [simPrice, setSimPrice] = useState(250);
  const [simQuota, setSimQuota] = useState(350000);
  const [simTier, setSimTier] = useState<AiModelRoutingTier>('flash-lite-hybrid');

  // Inline Grant / Cap Override UI State
  const [grantTargetId, setGrantTargetId] = useState<string | null>(null);
  const [grantTokensAmount, setGrantTokensAmount] = useState('100000');
  const [grantNote, setGrantNote] = useState('Exam Prep Goodwill Credits');
  const [editingCapId, setEditingCapId] = useState<string | null>(null);
  const [editingCapVal, setEditingCapVal] = useState('');

  const simEcon = useMemo(
    () =>
      calculatePlanTokenEconomics({
        basePrice: simPrice,
        currency: 'INR',
        billingFrequency: 'Monthly',
        monthlyTokenQuota: simQuota,
        aiModelTier: simTier,
      }),
    [simPrice, simQuota, simTier]
  );

  const summary = useMemo(() => {
    const totalRevenueINR = billingLedger
      .filter((tx) => tx.paymentStatus === 'Success')
      .reduce((sum, tx) => sum + tx.baseAmountINR, 0);

    const totalCogsINR = studentAiQuotas.reduce(
      (sum, rec) => sum + rec.estimatedMonthlyCogsINR,
      0
    );

    const totalTokensConsumed = studentAiQuotas.reduce(
      (sum, rec) => sum + rec.monthlyTokensUsed,
      0
    );

    const avgCostPerStudentINR =
      studentAiQuotas.length > 0 ? totalCogsINR / studentAiQuotas.length : 0;

    const grossProfitINR = totalRevenueINR - totalCogsINR;
    const grossMarginPct =
      totalRevenueINR > 0 ? (grossProfitINR / totalRevenueINR) * 100 : 100;

    return {
      totalRevenueINR: Number(totalRevenueINR.toFixed(2)),
      totalCogsINR: Number(totalCogsINR.toFixed(2)),
      totalTokensConsumed,
      avgCostPerStudentINR: Number(avgCostPerStudentINR.toFixed(2)),
      grossMarginPct: Number(grossMarginPct.toFixed(1)),
      markupMultiplier: totalCogsINR > 0 ? Number((totalRevenueINR / totalCogsINR).toFixed(1)) : 0,
    };
  }, [billingLedger, studentAiQuotas]);

  const studentChartData = useMemo(
    () =>
      studentAiQuotas.map((rec) => ({
        name: rec.studentName.split(' ')[0],
        usedK: Math.round(rec.monthlyTokensUsed / 1000),
        cogsINR: rec.estimatedMonthlyCogsINR,
      })),
    [studentAiQuotas]
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-normal text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#00A896]" />
                <span>AI Token Quota &amp; FinOps Cost Monitor</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                Centralized Gemini Paid Tier Metering
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Track wholesale Google Gemini token COGS vs. student subscription revenue, enforce per-tier caps, and manage bonus credit wallets.
            </p>
          </div>
          <div className="text-xs px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            Blended Cost Basis: <span className="text-[#00A896]">₹7.74 / 100K tokens</span> (80% Flash-Lite + 20% Hydrogen)
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
            <div className="text-slate-500 dark:text-slate-400">Net Subscription Revenue</div>
            <div className="text-2xl text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              ₹{summary.totalRevenueINR.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Excl. 18% GST</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
            <div className="text-slate-500 dark:text-slate-400">Est. Gemini API COGS</div>
            <div className="text-2xl text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
              ₹{summary.totalCogsINR.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Avg ₹{summary.avgCostPerStudentINR}/student
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
            <div className="text-slate-500 dark:text-slate-400">Platform Gross Margin</div>
            <div className="text-2xl text-[#00A896] mt-1 tabular-nums">
              {summary.grossMarginPct}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {summary.markupMultiplier}× revenue over token cost
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
            <div className="text-slate-500 dark:text-slate-400">Monthly Tokens Burned</div>
            <div className="text-2xl text-cyan-600 dark:text-cyan-400 mt-1 tabular-nums">
              {formatCompactTokens(summary.totalTokensConsumed)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Across {studentAiQuotas.length} metered accounts
            </div>
          </div>
        </div>
      </div>

      {/* PLAN & ADD-ON RETAIL OVER WHOLESALE TOKEN COST MATRIX + CHART */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-normal text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00A896]" />
              <span>Retail Price Over Token Cost (Plans &amp; Add-On Credit Packs)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live unit economics assuming worst-case 100% token exhaustion.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#1a2540] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2.5">Offering</th>
                  <th className="p-2.5">Retail (ex-GST)</th>
                  <th className="p-2.5">Token Quota</th>
                  <th className="p-2.5">Max COGS</th>
                  <th className="p-2.5">Markup</th>
                  <th className="p-2.5">Gross Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 tabular-nums">
                {subscriptionPlans.map((plan) => {
                  const econ = calculatePlanTokenEconomics({
                    basePrice: plan.basePrice,
                    currency: plan.currency,
                    billingFrequency: plan.billingFrequency,
                    monthlyTokenQuota: plan.monthlyTokenQuota ?? 350000,
                    aiModelTier: plan.aiModelTier || 'flash-lite-hybrid',
                  });
                  return (
                    <tr key={plan.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="p-2.5 text-slate-900 dark:text-white">
                        <div>{plan.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {AI_MODEL_TIER_SPECS[plan.aiModelTier || 'flash-lite-hybrid']?.shortLabel}
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-700 dark:text-slate-200">
                        {plan.currency} {plan.basePrice}
                      </td>
                      <td className="p-2.5 text-cyan-600 dark:text-cyan-400">
                        {formatCompactTokens(plan.monthlyTokenQuota ?? 350000)}/mo
                      </td>
                      <td className="p-2.5 text-amber-600 dark:text-amber-400">
                        ₹{econ.totalCycleCogsINR}
                      </td>
                      <td className="p-2.5 text-slate-800 dark:text-slate-200">
                        {econ.markupMultiplier}×
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] border ${
                            econ.isBelowMarginFloor
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {econ.grossMarginPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {AI_ADDON_PACKS.map((pack) => {
                  const cogs = Number(((pack.tokens / 100_000) * 7.74).toFixed(2));
                  const markup = Number((pack.priceINR / cogs).toFixed(1));
                  const margin = Number((((pack.priceINR - cogs) / pack.priceINR) * 100).toFixed(1));
                  return (
                    <tr key={pack.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 bg-slate-50/40 dark:bg-slate-800/20">
                      <td className="p-2.5 text-slate-900 dark:text-white">
                        <div>{pack.name}</div>
                        <div className="text-[10px] text-[#00A896]">Add-On Top-Up</div>
                      </td>
                      <td className="p-2.5 text-slate-700 dark:text-slate-200">INR {pack.priceINR}</td>
                      <td className="p-2.5 text-cyan-600 dark:text-cyan-400">+{formatCompactTokens(pack.tokens)}</td>
                      <td className="p-2.5 text-amber-600 dark:text-amber-400">₹{cogs}</td>
                      <td className="p-2.5 text-slate-800 dark:text-slate-200">{markup}×</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOKEN BURN CHART + MARGIN SIMULATOR */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-base font-normal text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00A896]" />
              <span>Plan Markup &amp; Margin Simulator</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Monthly Plan Price (ex-GST)</span>
                  <span className="text-slate-900 dark:text-white tabular-nums">₹{simPrice}</span>
                </div>
                <input
                  type="range"
                  min={79}
                  max={999}
                  step={10}
                  value={simPrice}
                  onChange={(e) => setSimPrice(Number(e.target.value))}
                  className="w-full accent-[#00A896] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Monthly AI Token Quota</span>
                  <span className="text-cyan-600 dark:text-cyan-400 tabular-nums">
                    {simQuota.toLocaleString('en-IN')} (~{simEcon.approxDoubtsPerMonth} doubts)
                  </span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={1500000}
                  step={25000}
                  value={simQuota}
                  onChange={(e) => setSimQuota(Number(e.target.value))}
                  className="w-full accent-[#00A896] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 block mb-1">
                  Model Routing Tier
                </label>
                <select
                  value={simTier}
                  onChange={(e) => setSimTier(e.target.value as AiModelRoutingTier)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {Object.values(AI_MODEL_TIER_SPECS).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 tabular-nums text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400">Max AI COGS</div>
                  <div className="text-amber-600 dark:text-amber-400 text-sm">₹{simEcon.totalCycleCogsINR}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400">Markup</div>
                  <div className="text-slate-900 dark:text-white text-sm">{simEcon.markupMultiplier}×</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400">Gross Margin</div>
                  <div className={`text-sm ${simEcon.isBelowMarginFloor ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {simEcon.grossMarginPct}%
                  </div>
                </div>
              </div>
              {simEcon.isBelowMarginFloor && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Warning: Margin is below the 60% SaaS safety floor. Lower quota or raise plan price.</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-normal text-slate-900 dark:text-white">
              Tokens Burned by Student (Thousands)
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.18} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val}K tokens`, 'Consumed']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="usedK" radius={[6, 6, 0, 0]}>
                    {studentChartData.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? '#00A896' : '#0891b2'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* PER-STUDENT TOKEN QUOTA LEDGER */}
      <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-normal text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00A896]" />
              <span>Per-Student AI Token Quotas &amp; Credit Wallets</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monitor monthly utilization, grant goodwill bonus tokens, or override individual monthly limits.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#1a2540] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Active Tier</th>
                <th className="p-3">Monthly Quota Usage</th>
                <th className="p-3">Add-On Wallet</th>
                <th className="p-3">Est. AI COGS</th>
                <th className="p-3 text-right">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {studentAiQuotas.map((rec) => {
                const pct =
                  rec.monthlyQuota > 0
                    ? Math.min(100, Math.round((rec.monthlyTokensUsed / rec.monthlyQuota) * 100))
                    : 100;
                return (
                  <tr key={rec.studentId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="p-3">
                      <div className="text-slate-900 dark:text-white">{rec.studentName}</div>
                      <div className="text-[10px] text-slate-400">{rec.studentEmail}</div>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{rec.planName}</td>
                    <td className="p-3 min-w-[200px]">
                      <div className="flex justify-between text-[11px] tabular-nums mb-1">
                        <span>
                          {rec.monthlyTokensUsed.toLocaleString()} / {rec.monthlyQuota.toLocaleString()}
                        </span>
                        <span className={pct >= 85 ? 'text-amber-500' : 'text-[#00A896]'}>
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 90 ? 'bg-rose-500' : pct >= 75 ? 'bg-amber-500' : 'bg-[#00A896]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-3 tabular-nums">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-[11px]">
                        +{rec.addonCreditsRemaining.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 tabular-nums text-amber-600 dark:text-amber-400">
                      ₹{rec.estimatedMonthlyCogsINR.toFixed(2)}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                      {editingCapId === rec.studentId ? (
                        <span className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            value={editingCapVal}
                            onChange={(e) => setEditingCapVal(e.target.value)}
                            className="w-24 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-[11px]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              updateStudentMonthlyQuotaOverride(
                                rec.studentId,
                                Number(editingCapVal) || rec.monthlyQuota
                              );
                              setEditingCapId(null);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#00A896] text-white text-[11px] cursor-pointer"
                          >
                            Save
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCapId(rec.studentId);
                            setEditingCapVal(String(rec.monthlyQuota));
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] cursor-pointer"
                        >
                          Edit Cap
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setGrantTargetId(rec.studentId);
                          setGrantTokensAmount('100000');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Grant Credits</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {grantTargetId && (
          <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-[#1a2540] border border-cyan-200 dark:border-cyan-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white">
              <Coins className="w-4 h-4 text-[#00A896]" />
              <span>
                Grant Bonus AI Credits to{' '}
                {studentAiQuotas.find((s) => s.studentId === grantTargetId)?.studentName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                step={25000}
                value={grantTokensAmount}
                onChange={(e) => setGrantTokensAmount(e.target.value)}
                className="w-28 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                value={grantNote}
                onChange={(e) => setGrantNote(e.target.value)}
                placeholder="Reason note..."
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700"
              />
              <button
                type="button"
                onClick={() => {
                  grantBonusTokensToStudent(
                    grantTargetId,
                    Number(grantTokensAmount) || 0,
                    grantNote
                  );
                  setGrantTargetId(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#00A896] text-white cursor-pointer"
              >
                Confirm Grant
              </button>
              <button
                type="button"
                onClick={() => setGrantTargetId(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LIVE AI TOKEN USAGE TELEMETRY STREAM */}
      <div className="bg-white dark:bg-[#131d33] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-normal text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00A896]" />
            <span>Recent Live AI Token Metering Ledger</span>
          </h3>
          <span className="text-xs text-slate-400">{aiTokenUsageLogs.length} events recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#1a2540] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-2.5">Student</th>
                <th className="p-2.5">Surface &amp; Subject</th>
                <th className="p-2.5">Model</th>
                <th className="p-2.5">In / Out (Cached)</th>
                <th className="p-2.5">Total Tokens</th>
                <th className="p-2.5">Est. COGS</th>
                <th className="p-2.5">Bucket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 tabular-nums">
              {aiTokenUsageLogs.slice(0, 12).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="p-2.5 text-slate-900 dark:text-white">
                    <div>{log.studentName}</div>
                    <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                  </td>
                  <td className="p-2.5 text-slate-700 dark:text-slate-300">
                    <div>{log.surface}</div>
                    <div className="text-[10px] text-slate-400">{log.subject}</div>
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
                    {log.model}
                  </td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-300">
                    {log.promptTokens} / {log.outputTokens}{' '}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ({log.cachedTokens} cached)
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-900 dark:text-white">
                    {log.totalTokens.toLocaleString()}
                  </td>
                  <td className="p-2.5 text-amber-600 dark:text-amber-400">
                    ₹{log.estimatedCostINR.toFixed(2)}
                  </td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {log.paidFrom}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
