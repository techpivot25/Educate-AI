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

interface ParentWeeklyDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentWeeklyDigestModal: React.FC<ParentWeeklyDigestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, currentBoard, addNotification } = useApp();

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
    { subject: 'Mathematics (Core Sprint)', planned: 10.5, completed: 10.5, adherence: 100, color: '#4F46E5' },
    { subject: 'Physics (Kinematics & Optics)', planned: 8.0, completed: 7.5, adherence: 94, color: '#0284C7' },
    { subject: 'Chemistry (Chemical Reactions)', planned: 4.0, completed: 4.0, adherence: 100, color: '#10B981' },
    { subject: 'World History (Global Trade)', planned: 6.0, completed: 4.0, adherence: 67, color: '#F59E0B' },
  ];

  const handleSendTestEmail = () => {
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSentTimestamp(timeStr);

      addNotification(
        'Parent Weekly Digest Dispatched',
        `Automated 1-page sprint summary successfully emailed to ${parentEmail}.`,
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">Parental Weekly Digest</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sunday Auto-Email
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Automated 1-Page PDF Summary: Completed sprint hours vs planned hours sent to parent.
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
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'digest'
                ? 'border-[#00A896] text-[#00A896] dark:text-[#00A896]'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Sprint Hours & Progress</span>
          </button>
          <button
            onClick={() => setActiveTab('preview-pdf')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview-pdf'
                ? 'border-[#00A896] text-[#00A896] dark:text-[#00A896]'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1-Page PDF Summary Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-[#00A896] text-[#00A896] dark:text-[#00A896]'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Parent Email & Schedule</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200">
          {/* TAB 1: SPRINT HOURS & ADHERENCE */}
          {activeTab === 'digest' && (
            <div className="space-y-5">
              {/* Overall Sprint Hours KPI Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-300 dark:border-emerald-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Weekly Sprint Adherence
                    </span>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      {completedHours} / {plannedHours} Hours Completed
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Outstanding performance! Student has completed 91.2% of their planned sprint study
                      hours this week.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {adherenceRate}%
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Adherence</div>
                    </div>

                    <div className="text-center px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="text-2xl font-black text-amber-500">14</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Day Streak</div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    <span>Weekly Sprint Completion Meter</span>
                    <span>{completedHours} hrs done &bull; 2.5 hrs remaining</span>
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
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Subject-by-Subject Sprint Hours Breakdown
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
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {sb.subject}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Completed {sb.completed} hrs of {sb.planned} hrs target
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
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-12 text-right">
                          {sb.adherence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Highlights & Teacher Remarks */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>Teacher & AI Advisor Remarks for Parent</span>
                </div>
                <p className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
                  "{currentUser?.name || 'Alex'} has demonstrated outstanding dedication to daily core
                  Mathematics, logging 10.5 consecutive sprint hours without missed days. Recommended
                  focus for the upcoming week: reinforce Kinematics vector decomposition before Wednesday's
                  formative assessment."
                </p>
                <div className="mt-2 text-[11px] text-blue-700 dark:text-blue-400 font-semibold">
                  &bull; Certified by: Dr. Evelyn Reed (Physics Lead) & Marcus Vance (Math Chair)
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 1-PAGE PDF SUMMARY PREVIEW */}
          {activeTab === 'preview-pdf' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Printable 1-Page Sunday Digest
                  </h4>
                  <p className="text-xs text-slate-500">
                    This exact 1-page document is attached to the weekly Sunday email.
                  </p>
                </div>

                <button
                  onClick={handlePrintPDF}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>

              {/* THE 1-PAGE REPORT CARD PREVIEW (Clean, Crisp, Professional A4 Styling) */}
              <div
                id="parent-digest-printable-card"
                className="p-6 sm:p-8 rounded-2xl bg-white text-slate-900 border-2 border-slate-300 shadow-lg space-y-5"
                style={{ fontFamily: 'sans-serif' }}
              >
                {/* Official Letterhead */}
                <div className="border-b-2 border-[#00A896] pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-[#0D1B3E] tracking-tight">
                      PIVOTIQ ACADEMY &bull; PARENT WEEKLY DIGEST
                    </h2>
                    <p className="text-xs text-slate-500">
                      State Board & CBSE Accredited Academic Sprints &bull; Confidential Guardian Report
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md">
                      WEEK 2 SPRINT REPORT
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Generated: Sunday, Oct 19, 2026 &bull; 07:00 PM
                    </div>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                    <strong className="text-slate-800">{currentUser?.name || 'Alex Rivera'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Grade & Board</span>
                    <strong className="text-slate-800">
                      {currentUser?.grade || 'Grade 10'} ({currentBoard || 'CBSE'})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Parent/Guardian</span>
                    <strong className="text-slate-800">{parentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Email</span>
                    <strong className="text-slate-800 truncate block">{parentEmail}</strong>
                  </div>
                </div>

                {/* Core Sprint Hours Comparison */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Sprint Hours Adherence (Completed vs Planned)
                    </h5>
                    <span className="text-xs font-black text-emerald-600">
                      {completedHours} hrs completed / {plannedHours} hrs planned ({adherenceRate}%)
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
                      <span className="text-slate-400 block text-[10px]">Planned Sprints</span>
                      <strong className="text-slate-800">{plannedHours} Hours</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Actual Completed</span>
                      <strong className="text-emerald-600">{completedHours} Hours</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Daily Streak</span>
                      <strong className="text-amber-600">14 Days Active</strong>
                    </div>
                  </div>
                </div>

                {/* Subject Summary Table */}
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0D1B3E] text-white">
                      <th className="p-2 text-left">Subject</th>
                      <th className="p-2 text-center">Planned Hours</th>
                      <th className="p-2 text-center">Completed Hours</th>
                      <th className="p-2 text-center">Adherence</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectBreakdown.map((sb, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 font-bold text-slate-800">{sb.subject}</td>
                        <td className="p-2 text-center text-slate-600">{sb.planned} hrs</td>
                        <td className="p-2 text-center font-bold text-slate-800">{sb.completed} hrs</td>
                        <td className="p-2 text-center font-bold text-emerald-600">{sb.adherence}%</td>
                        <td className="p-2 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            On Track
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Signatures & Verification */}
                <div className="pt-4 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
                  <div>
                    <p className="font-bold text-slate-700">Dean of Academics: Dr. Sarah Jenkins</p>
                    <p className="text-[10px] text-slate-400">Digitally verified via PivotIQ SIS Core &bull; ID: PVQ-RPT-9021</p>
                  </div>
                  <div className="text-right">
                    <div className="font-serif italic text-slate-600 text-sm">Sarah Jenkins</div>
                    <span className="text-[10px] text-slate-400 block">Authorized Signature</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS & EMAIL DISPATCH */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Parent / Guardian Contact Configuration
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Parent / Guardian Name</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Registered Email Address</label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Automatic Sunday Evening Dispatch
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Dispatches every Sunday at 07:00 PM IST with the attached 1-page PDF.
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
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Send Test Digest Email Now
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Trigger an instant sample dispatch to <strong className="text-slate-700 dark:text-slate-300">{parentEmail}</strong> to preview how it arrives in your inbox.
                  </p>
                </div>

                <button
                  onClick={handleSendTestEmail}
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all shrink-0"
                >
                  {isSending ? (
                    <>
                      <Send className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Test Email</span>
                    </>
                  )}
                </button>
              </div>

              {sendSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Weekly Digest successfully delivered to <strong>{parentEmail}</strong> at {sentTimestamp}! Verified with 1-page PDF attachment.
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
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Email Sunday Summary Now</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
