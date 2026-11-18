import React, { useState } from 'react';
import {
  Mail,
  Send,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  FileText,
  UserCheck,
  ChevronRight,
  TrendingUp,
  X,
  Sparkles,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import { translateBoardLabel, translateStatusLabel } from '../../i18n/helpers';

interface ParentWeeklyDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentWeeklyDigestModal: React.FC<ParentWeeklyDigestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, currentBoard, addNotification } = useApp();
  const { t, i18n } = useTranslation(['student', 'common']);

  const [activeTab, setActiveTab] = useState<'digest' | 'preview-pdf' | 'settings'>('digest');

  // Guardian details state
  const [parentName, setParentName] = useState('Dr. Marcus Rivera (Parent/Guardian)');
  const [parentEmail, setParentEmail] = useState('techpivot25@gmail.com');
  const [parentPhone, setParentPhone] = useState('+91 98765 43210');
  const [autoSundayDispatch, setAutoSundayDispatch] = useState(true);

  // Email simulation states
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sentTimestamp, setSentTimestamp] = useState<string | null>(null);

  if (!isOpen) return null;

  // Sprint hours data
  const plannedHours = 28.5;
  const completedHours = 26.0;
  const adherenceRate = Math.round((completedHours / plannedHours) * 100);

  const subjectBreakdown = [
    { subject: t('student:parentDigest.subMathCore'), planned: 10.5, completed: 10.5, adherence: 100, color: '#4F46E5' },
    { subject: t('student:parentDigest.subPhysicsKin'), planned: 8.0, completed: 7.5, adherence: 94, color: '#0284C7' },
    { subject: t('student:parentDigest.subChemReact'), planned: 4.0, completed: 4.0, adherence: 100, color: '#10B981' },
    { subject: t('student:parentDigest.subWorldHist'), planned: 6.0, completed: 4.0, adherence: 67, color: '#F59E0B' },
  ];

  const handleSendTestEmail = () => {
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      const timeStr = new Date().toLocaleTimeString(i18n.language || 'en-US', { hour: '2-digit', minute: '2-digit' });
      setSentTimestamp(timeStr);

      addNotification(
        t('student:parentDigest.notifTitle'),
        t('student:parentDigest.notifBody', { email: parentEmail }),
        'success',
        'system'
      );
    }, 1200);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-[#0E1A2D] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#0D1B3E] via-[#162746] to-[#0A1526] text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-xs text-slate-800 dark:text-white">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-normal tracking-tight">{t('student:parentDigest.modalTitle')}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-normal uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {t('student:parentDigest.sundayAutoEmail')}
                </span>
              </div>
              <p className="text-xs font-normal text-slate-300 mt-0.5">
                {t('student:parentDigest.modalSub')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('digest')}
            className={`px-4 py-2 text-xs font-normal border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'digest'
                ? 'border-[#00A896] text-[#00A896] dark:text-[#00A896]'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('student:parentDigest.tabSprintHours')}</span>
          </button>
          <button
            onClick={() => setActiveTab('preview-pdf')}
            className={`px-4 py-2 text-xs font-normal border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview-pdf'
                ? 'border-[#00A896] text-[#00A896] dark:text-[#00A896]'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('student:parentDigest.tabPdfPreview')}</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-normal border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-[#00A896] text-[#00A896] dark:text-[#00A896]'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t('student:parentDigest.tabParentSettings')}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-white">
          {/* TAB 1: SPRINT HOURS & ADHERENCE */}
          {activeTab === 'digest' && (
            <div className="space-y-5">
              {/* Overall Sprint Hours KPI Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-300 dark:border-emerald-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-normal uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {t('student:parentDigest.weeklyAdherence')}
                    </span>
                    <h4 className="text-xl font-normal text-slate-900 dark:text-white mt-0.5">
                      {t('student:parentDigest.hoursCompletedRatio', { done: completedHours, total: plannedHours })}
                    </h4>
                    <p className="text-xs font-normal text-slate-600 dark:text-white mt-1">
                      {t('student:parentDigest.adherenceDesc')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="text-2xl font-normal text-emerald-600 dark:text-emerald-400">
                        {adherenceRate}%
                      </div>
                      <div className="text-[10px] font-normal text-slate-500 dark:text-white uppercase">{t('student:parentDigest.adherenceLabel')}</div>
                    </div>

                    <div className="text-center px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="text-2xl font-normal text-amber-500">14</div>
                      <div className="text-[10px] font-normal text-slate-500 dark:text-white uppercase">{t('student:parentDigest.dayStreakLabel')}</div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-normal text-slate-600 dark:text-white mb-1.5">
                    <span>{t('student:parentDigest.completionMeter')}</span>
                    <span>{t('student:parentDigest.hoursDoneRemaining', { done: completedHours, rem: 2.5 })}</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-[#00A896] to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${(completedHours / plannedHours) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div>
                <h5 className="text-xs font-normal uppercase tracking-wider text-slate-500 dark:text-white mb-2">
                  {t('student:parentDigest.subjectBreakdownTitle')}
                </h5>

                <div className="space-y-2">
                  {subjectBreakdown.map((sb, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: sb.color }}
                          />
                          <span className="text-xs font-normal text-slate-900 dark:text-white">
                            {sb.subject}
                          </span>
                        </div>
                        <div className="text-[11px] font-normal text-slate-500 dark:text-white mt-0.5">
                          {t('student:parentDigest.completedHrsOfPlanned', { done: sb.completed, planned: sb.planned })}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-28 sm:w-36 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, sb.adherence)}%`,
                              backgroundColor: sb.color,
                            }}
                          />
                        </div>
                        <span className="text-xs font-normal text-slate-700 dark:text-white w-12 text-right">
                          {sb.adherence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Highlights & Teacher Remarks */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-normal text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>{t('student:parentDigest.teacherRemarksHeading')}</span>
                </div>
                <p className="text-xs font-normal text-blue-950 dark:text-blue-100 leading-relaxed">
                  {t('student:parentDigest.teacherRemarksQuote', { name: currentUser?.name || 'Alex' })}
                </p>
                <div className="mt-2 text-[11px] text-blue-700 dark:text-blue-300 font-normal">
                  {t('student:parentDigest.certifiedBy')}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 1-PAGE PDF SUMMARY PREVIEW */}
          {activeTab === 'preview-pdf' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-normal uppercase tracking-wider text-slate-500 dark:text-white">
                    {t('student:parentDigest.printableHeading')}
                  </h4>
                  <p className="text-xs font-normal text-slate-500 dark:text-white">
                    {t('student:parentDigest.printableSub')}
                  </p>
                </div>

                <button
                  onClick={handlePrintPDF}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-normal flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('student:offlinePack.printSavePdf')}</span>
                </button>
              </div>

              {/* THE 1-PAGE REPORT CARD PREVIEW (Clean, Crisp, Professional A4 Styling) */}
              <div
                id="parent-digest-printable-card"
                className="p-6 sm:p-8 rounded-2xl bg-white text-slate-900 border-2 border-slate-300 shadow-lg space-y-5 font-normal"
                style={{ fontFamily: 'sans-serif' }}
              >
                {/* Official Letterhead */}
                <div className="border-b-2 border-[#00A896] pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-normal text-[#0D1B3E] tracking-tight">
                      {t('student:parentDigest.letterheadTitle')}
                    </h2>
                    <p className="text-xs font-normal text-slate-500">
                      {t('student:parentDigest.letterheadSub')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-normal rounded-md">
                      {t('student:parentDigest.week2Badge')}
                    </span>
                    <div className="text-[10px] font-normal text-slate-400 mt-1">
                      {t('student:parentDigest.generatedSampleTime')}
                    </div>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-normal">{t('student:parentDigest.studentLabel')}</span>
                    <span className="font-normal text-slate-800">{currentUser?.name || 'Alex Rivera'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-normal">{t('student:parentDigest.boardGradeLabel')}</span>
                    <span className="font-normal text-slate-800">
                      {currentUser?.grade || 'Grade 10'} ({translateBoardLabel(currentBoard || 'CBSE', t)})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-normal">{t('student:parentDigest.parentGuardianLabel')}</span>
                    <span className="font-normal text-slate-800">{parentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-normal">{t('student:parentDigest.deliveryEmailLabel')}</span>
                    <span className="font-normal text-slate-800 truncate block">{parentEmail}</span>
                  </div>
                </div>

                {/* Core Sprint Hours Comparison */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-normal uppercase tracking-wider text-slate-700">
                      {t('student:parentDigest.sprintAdherenceTitle')}
                    </h5>
                    <span className="text-xs font-normal text-emerald-600">
                      {t('student:parentDigest.completedVsPlannedMeta', { done: completedHours, planned: plannedHours, pct: adherenceRate })}
                    </span>
                  </div>

                  <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00A896] rounded-full"
                      style={{ width: `${(completedHours / plannedHours) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-normal">{t('student:parentDigest.plannedSprints')}</span>
                      <span className="font-normal text-slate-800">{t('student:parentDigest.hoursCount', { hrs: plannedHours })}</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-normal">{t('student:parentDigest.actualCompleted')}</span>
                      <span className="font-normal text-emerald-600">{t('student:parentDigest.hoursCount', { hrs: completedHours })}</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-normal">{t('student:parentDigest.dailyStreak')}</span>
                      <span className="font-normal text-amber-600">{t('student:parentDigest.daysActive', { days: 14 })}</span>
                    </div>
                  </div>
                </div>

                {/* Subject Summary Table */}
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0D1B3E] text-white">
                      <th className="p-2 text-left font-normal">{t('student:parentDigest.colSubject')}</th>
                      <th className="p-2 text-center font-normal">{t('student:parentDigest.plannedHrsCol')}</th>
                      <th className="p-2 text-center font-normal">{t('student:parentDigest.completedHrsCol')}</th>
                      <th className="p-2 text-center font-normal">{t('student:parentDigest.adherenceCol')}</th>
                      <th className="p-2 text-center font-normal">{t('student:parentDigest.colStatus')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectBreakdown.map((sb, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 font-normal text-slate-800">{sb.subject}</td>
                        <td className="p-2 text-center font-normal text-slate-600">{t('student:parentDigest.hrsShort', { hrs: sb.planned })}</td>
                        <td className="p-2 text-center font-normal text-slate-800">{t('student:parentDigest.hrsShort', { hrs: sb.completed })}</td>
                        <td className="p-2 text-center font-normal text-emerald-600">{sb.adherence}%</td>
                        <td className="p-2 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-emerald-100 text-emerald-800">
                            {translateStatusLabel('On Track', t)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Signatures & Verification */}
                <div className="pt-4 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
                  <div>
                    <p className="font-normal text-slate-700">{t('student:parentDigest.deanAcademics')}</p>
                    <p className="text-[10px] font-normal text-slate-400">{t('student:parentDigest.verifiedCoreId')}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-serif italic font-normal text-slate-600 text-sm">Sarah Jenkins</div>
                    <span className="text-[10px] font-normal text-slate-400 block">{t('student:parentDigest.authorizedSig')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS & EMAIL DISPATCH */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h5 className="text-xs font-normal uppercase tracking-wider text-slate-700 dark:text-white">
                  {t('student:parentDigest.contactConfigTitle')}
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 dark:text-white mb-1 font-normal">{t('student:parentDigest.parentNameLabel')}</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-white mb-1 font-normal">{t('student:parentDigest.registeredEmailLabel')}</label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-normal"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <div>
                      <span className="text-xs font-normal text-slate-900 dark:text-white block">
                        {t('student:parentDigest.autoSundayTitle')}
                      </span>
                      <span className="text-[11px] font-normal text-slate-500 dark:text-white">
                        {t('student:parentDigest.autoSundayDesc')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setAutoSundayDispatch(!autoSundayDispatch)}
                    className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${
                      autoSundayDispatch ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        autoSundayDispatch ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Instant Test Dispatch Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-[#00A896]/10 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-normal text-slate-900 dark:text-white">
                    {t('student:parentDigest.sendTestHeading')}
                  </h4>
                  <p className="text-[11px] font-normal text-slate-500 dark:text-white mt-0.5">
                    {t('student:parentDigest.sendTestDesc', { email: parentEmail })}
                  </p>
                </div>

                <button
                  onClick={handleSendTestEmail}
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-normal flex items-center gap-1.5 cursor-pointer shadow-xs transition-all shrink-0"
                >
                  {isSending ? (
                    <>
                      <Send className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('student:parentDigest.sendingEmail')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('student:parentDigest.sendTestBtn')}</span>
                    </>
                  )}
                </button>
              </div>

              {sendSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-normal flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    {t('student:parentDigest.sentDeliveredBanner', { email: parentEmail, time: sentTimestamp })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendTestEmail}
              disabled={isSending}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-normal flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('student:parentDigest.emailSundayNow')}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-normal transition-colors cursor-pointer"
          >
            {t('common:actions.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
