import React, { useState } from 'react';
import {
  Download,
  WifiOff,
  Wifi,
  FileText,
  Printer,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  X,
  BookOpen,
  Sparkles,
  Zap,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface OfflineStudyPackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineStudyPackModal: React.FC<OfflineStudyPackModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    dailyTasks,
    weeklySprints,
    currentBoard,
    addNotification,
  } = useApp();

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [lowBandwidthMode, setLowBandwidthMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('educate_ai_low_bandwidth') === 'true';
    } catch {
      return false;
    }
  });
  const [lastSyncDate] = useState<string>('Today at 05:00 AM');

  if (!isOpen) return null;

  const toggleLowBandwidth = () => {
    const nextVal = !lowBandwidthMode;
    setLowBandwidthMode(nextVal);
    try {
      localStorage.setItem('educate_ai_low_bandwidth', String(nextVal));
    } catch {}

    if (nextVal) {
      addNotification(
        'Low-Bandwidth Mode Activated',
        'Enabled text-first compression and disabled heavy animations for tier-2/3 connectivity.',
        'info',
        'system'
      );
    }
  };

  // Generate self-contained, pristine Offline HTML Package
  const handleDownloadOfflinePack = () => {
    setIsExporting(true);

    setTimeout(() => {
      const studentName = currentUser?.name || 'Alex Rivera';
      const grade = currentUser?.grade || 'Grade 10 - Science';
      const board = currentBoard || 'CBSE';
      const school = currentUser?.school_name || 'D.A.V. Public School';
      const exportTimestamp = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      // Format tasks into clean HTML table
      const tasksRows = dailyTasks
        .slice(0, 15)
        .map(
          (t) => `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 12px; font-weight: bold; color: #0f172a;">Day ${t.day}</td>
            <td style="padding: 8px 12px; color: #475569;">${t.date || 'Scheduled'}</td>
            <td style="padding: 8px 12px; font-weight: 600; color: #0284c7;">${t.subject}</td>
            <td style="padding: 8px 12px; color: #1e293b;">${t.topic}</td>
            <td style="padding: 8px 12px; text-align: center; color: #334155;">${t.duration_hrs} hrs</td>
            <td style="padding: 8px 12px; text-align: center;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: ${
                t.status === 'Completed'
                  ? '#dcfce7; color: #15803d;'
                  : t.status === 'In Progress'
                  ? '#dbeafe; color: #1d4ed8;'
                  : '#f1f5f9; color: #475569;'
              }">${t.status}</span>
            </td>
          </tr>
        `
        )
        .join('');

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PivotIQ Offline Learning Pack - ${studentName}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      border-bottom: 2px solid #00A896;
      padding-bottom: 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0D1B3E;
      margin: 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #e6fffa;
      color: #00A896;
      font-weight: bold;
      border-radius: 6px;
      font-size: 12px;
    }
    .card {
      background: #f1f5f9;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 13px;
    }
    th {
      background: #0D1B3E;
      color: white;
      text-align: left;
      padding: 10px 12px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-box {
      border-left: 4px solid #00A896;
      background: #f8fafc;
      padding: 12px 16px;
      margin-bottom: 12px;
      border-radius: 0 8px 8px 0;
    }
    .formula-tag {
      font-family: monospace;
      background: #fef3c7;
      color: #b45309;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="brand-title">PivotIQ &bull; Offline Learning Pack</h1>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">
          Self-Contained Low-Bandwidth Study System &bull; Zero Internet Required
        </p>
      </div>
      <div style="text-align: right;">
        <span class="badge">OFFLINE VERIFIED</span>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Generated: ${exportTimestamp}</div>
      </div>
    </div>

    <!-- Student Credentials -->
    <div class="card" style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 13px;">
      <div><strong>Student:</strong> ${studentName}</div>
      <div><strong>Grade:</strong> ${grade}</div>
      <div><strong>Board:</strong> ${board}</div>
      <div><strong>Institution:</strong> ${school}</div>
    </div>

    <!-- SECTION 1: AGILE STUDY ROADMAP -->
    <h2 style="font-size: 18px; color: #0D1B3E; margin-top: 24px;">📅 Agile Study Roadmap (Current Sprints)</h2>
    <p style="font-size: 12px; color: #64748b;">Daily scheduled study units with core mathematics guarantees:</p>
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th>Date</th>
          <th>Subject</th>
          <th>Topic & Milestone</th>
          <th>Est. Duration</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${tasksRows}
      </tbody>
    </table>

    <!-- SECTION 2: AI QUICK REVISION SUMMARIES -->
    <h2 style="font-size: 18px; color: #0D1B3E; margin-top: 32px;">🧠 AI Quick Revision Summaries (Tier-2/3 Low-Bandwidth Core)</h2>
    
    <div class="summary-box">
      <h3 style="margin: 0 0 6px 0; font-size: 14px; color: #1e293b;">📐 Mathematics: Quadratic Equations & Roots</h3>
      <p style="margin: 0 0 6px 0; font-size: 12.5px; color: #475569;">
        Standard form: <span class="formula-tag">ax² + bx + c = 0</span>. Discriminant: <span class="formula-tag">D = b² - 4ac</span>.<br>
        &bull; If D > 0: Two distinct real roots &bull; If D = 0: Two equal real roots (-b/2a) &bull; If D < 0: No real roots (complex).<br>
        Quadratic Formula: <span class="formula-tag">x = [-b &plusmn; &radic;(b² - 4ac)] / 2a</span>
      </p>
    </div>

    <div class="summary-box">
      <h3 style="margin: 0 0 6px 0; font-size: 14px; color: #1e293b;">⚡ Physics: Kinematics & Linear Equations of Motion</h3>
      <p style="margin: 0 0 6px 0; font-size: 12.5px; color: #475569;">
        Under uniform acceleration 'a' with initial velocity 'u' and final velocity 'v':<br>
        1. <span class="formula-tag">v = u + at</span> &bull; 
        2. <span class="formula-tag">s = ut + &frac12;at²</span> &bull; 
        3. <span class="formula-tag">v² = u² + 2as</span> &bull; 
        Momentum: <span class="formula-tag">p = mv</span>. Net Force: <span class="formula-tag">F = ma = &Delta;p / &Delta;t</span>.
      </p>
    </div>

    <div class="summary-box">
      <h3 style="margin: 0 0 6px 0; font-size: 14px; color: #1e293b;">🧪 Chemistry: Chemical Reactions & Balancing Equations</h3>
      <p style="margin: 0 0 6px 0; font-size: 12.5px; color: #475569;">
        Law of Conservation of Mass: Atoms cannot be created or destroyed.<br>
        Key Reaction Types: Combination (A+B &rarr; AB), Decomposition (AB &rarr; A+B), Displacement (Fe + CuSO₄ &rarr; FeSO₄ + Cu), Double Displacement (Precipitation), Redox (Oxidation is loss of e⁻, Reduction is gain of e⁻).
      </p>
    </div>

    <div class="summary-box">
      <h3 style="margin: 0 0 6px 0; font-size: 14px; color: #1e293b;">🌿 Biology: Photosynthesis & Cellular Respiration</h3>
      <p style="margin: 0 0 6px 0; font-size: 12.5px; color: #475569;">
        Photosynthesis: <span class="formula-tag">6CO₂ + 6H₂O + Sunlight &rarr; C₆H₁₂O₆ + 6O₂</span> (Chlorophyll in chloroplasts).<br>
        Aerobic Respiration: <span class="formula-tag">C₆H₁₂O₆ + 6O₂ &rarr; 6CO₂ + 6H₂O + 38 ATP</span>.<br>
        Anaerobic (Yeast): Produces Ethanol + CO₂ + 2 ATP. Anaerobic (Muscle): Produces Lactic Acid causing cramps.
      </p>
    </div>

    <!-- SECTION 3: EMERGENCY EXAM CHECKLIST -->
    <h2 style="font-size: 18px; color: #0D1B3E; margin-top: 32px;">📝 Offline Exam Preparation Checklist</h2>
    <div style="font-size: 12.5px; color: #475569; line-height: 1.8;">
      &bull; [ ] Verify SI units before plugging numbers into kinematics & force formulas.<br>
      &bull; [ ] Always check discriminant before attempting factorization of trinomials.<br>
      &bull; [ ] Write states of matter (s, l, g, aq) in chemical reactions to score full marks in state boards.<br>
      &bull; [ ] Clearly label ray diagrams with arrow directions pointing towards the optical center/mirror.
    </div>

    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
      PivotIQ Offline Learning System &bull; Certified for CBSE / State Board Offline Sprints &bull; Generated for ${studentName}
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PivotIQ_Offline_Study_Pack_${studentName.replace(/\s+/g, '_')}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setExportSuccess(true);
      addNotification(
        'Offline Study Pack Downloaded',
        'Study pack saved as self-contained HTML! You can open it anytime without internet.',
        'success',
        'student'
      );

      setTimeout(() => setExportSuccess(false), 4000);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#0E1A2D] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#0D1B3E] via-[#162746] to-[#0A1526] text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00A896] to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
              <WifiOff className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">
                  Offline Mode & Low-Bandwidth Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tier-2/3 Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Save Agile Study Planners & AI Quick Summaries for zero-internet learning.
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

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200">
          {/* Low-Bandwidth Mode Toggle Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  lowBandwidthMode
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'bg-emerald-500/20 text-emerald-500'
                }`}
              >
                {lowBandwidthMode ? <Zap className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Low-Bandwidth (2G Data Saver) Mode
                  </h4>
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      lowBandwidthMode
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {lowBandwidthMode ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Compresses assets, disables high-res video streaming, and caches all sprint data for
                  rural & tier-2/3 networks.
                </p>
              </div>
            </div>

            <button
              onClick={toggleLowBandwidth}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                lowBandwidthMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
              }`}
            >
              {lowBandwidthMode ? 'Enabled' : 'Enable 2G Saver'}
            </button>
          </div>

          {/* Offline Cache Status Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Local Browser Storage Status
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  24 Modules, 15 Formulas, and 3 Sprints cached &bull; Last synchronized {lastSyncDate}
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              100% Ready
            </span>
          </div>

          {/* 1-Click Save Offline Study Package Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0D1B3E] to-slate-900 text-white border border-slate-800 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00A896]">
                  Full Offline Study Package
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  Download All-In-One Offline Study File
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                  Contains your Agile Study Roadmap, AI Quick Revision Summaries (Math, Physics,
                  Chemistry, Biology), master board formulas, and emergency exam checklist in a
                  single file. Works on any phone or laptop without internet!
                </p>
              </div>
              <Download className="w-8 h-8 text-[#00A896] shrink-0" />
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadOfflinePack}
                disabled={isExporting}
                className="px-5 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#008f80] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-500/30 cursor-pointer transition-all"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Packaging Offline Bundle...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Offline Pack (.HTML)</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/10 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>

              {exportSuccess && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully saved to Downloads!
                </span>
              )}
            </div>
          </div>

          {/* Included Features List */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              What is saved in your offline pack:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#00A896]" />
                <span>Agile Study Roadmap & 31-Day Sprints</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Quick Summaries (4 STEM Subjects)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Master Formula Sheets & Key Constants</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>State Board Emergency Exam Checklist</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            Zero external CDN dependencies. Safe for offline USB/SD card transfers.
          </span>
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
