import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { PivotIQLogo } from './PivotIQLogo';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Bell,
  Sparkles,
  Zap,
  Radio,
  CheckCircle2,
  AlertTriangle,
  X,
  Sun,
  Moon,
  LogOut,
  User,
  Sliders,
  BookOpen,
  Layers,
  Menu,
  Search,
  Calendar,
} from 'lucide-react';

export const GlobalHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    logout,
    setIsProfileOpen,
    notifications,
    removeNotification,
    triggerAnomaly,
    publishQuiz,
    quizzes,
    setIsCurriculumModalOpen,
    ecosystemOverviewMode,
    setEcosystemOverviewMode,
    sidebarCollapsed,
    toggleSidebar,
    globalSearch,
    setGlobalSearch,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSimulations, setShowSimulations] = useState(false);

  const isAdminUser = currentUser?.role === 'admin';
  const isStudentPanel = currentRole === 'student';
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#1E1E2F] border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Collapsible Sidebar Trigger, Brand Logo & Global Search */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          {/* Collapsible Sidebar Toggle (≡) */}
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#F5F7FF] dark:hover:bg-[#12131C] hover:text-[#4B49AC] dark:hover:text-[#98BDFF] transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <PivotIQLogo size={36} />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#1F1F24] dark:text-[#F1F1F6] text-base tracking-tight">
                  PivotIQ
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#98BDFF]/20 text-[#4B49AC] dark:text-[#98BDFF] border border-[#98BDFF]/40">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-[#4B49AC] dark:text-[#7DA0FA]" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-[#6C7383] dark:text-[#9CA3AF] leading-none">
                Autonomous Educational Ecosystem
              </p>
            </div>
          </div>

          {/* Integrated Global Search Bar */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="w-4 h-4 text-[#6C7383] dark:text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search subjects, users, quizzes..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F5F7FF] dark:bg-[#12131C] text-xs text-[#1F1F24] dark:text-[#F1F1F6] placeholder-[#6C7383] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#4B49AC] transition-all"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Center: Admin Panel Switcher or Role Badge */}
        <div className="flex items-center gap-2">
          {isStudentPanel ? (
            /* Student Panel Header - Clean Student Badge (No Admin Switcher) */
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5F7FF] dark:bg-[#12131C] border border-[#98BDFF]/40 text-[#4B49AC] dark:text-[#98BDFF] text-xs font-bold shadow-xs">
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 bg-[#4B49AC] flex items-center justify-center text-white text-[9px] ring-1 ring-[#98BDFF]/60">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="w-3 h-3 text-[#4B49AC] dark:text-[#7DA0FA]" />
                  )}
                </div>
                <span>
                  Student Portal &bull; {currentUser?.name || 'Sarah Connor'}
                </span>
              </div>
              {isAdminUser && (
                <button
                  onClick={() => setCurrentRole('admin')}
                  className="text-[11px] font-bold text-[#4B49AC] dark:text-[#98BDFF] bg-[#98BDFF]/15 hover:bg-[#98BDFF]/25 px-2.5 py-1 rounded-lg border border-[#98BDFF]/40 transition-colors cursor-pointer"
                  title="Return to Admin Dashboard"
                >
                  &larr; Exit to Admin
                </button>
              )}
            </div>
          ) : isAdminUser ? (
            <div className="flex items-center bg-[#F5F7FF] dark:bg-[#12131C] p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
              <span className="hidden xl:inline-block px-2 text-[10px] font-extrabold uppercase text-[#4B49AC] dark:text-[#98BDFF] tracking-wider">
                Admin Switcher:
              </span>

              <button
                onClick={() => setCurrentRole('student')}
                title="Switch to Student Portal"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-[#6C7383] dark:text-slate-300 hover:text-[#4B49AC] dark:hover:text-white"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                onClick={() => setCurrentRole('teacher')}
                title="Switch to Teacher Panel"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'teacher'
                    ? 'bg-[#4B49AC] text-white shadow-sm'
                    : 'text-[#6C7383] dark:text-slate-300 hover:text-[#4B49AC] dark:hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Teacher</span>
              </button>

              <button
                onClick={() => setCurrentRole('admin')}
                title="Switch to Admin Dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-[#4B49AC] text-white shadow-sm'
                    : 'text-[#6C7383] dark:text-slate-300 hover:text-[#4B49AC] dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5F7FF] dark:bg-[#12131C] border border-[#98BDFF]/40 text-[#4B49AC] dark:text-[#98BDFF] text-xs font-bold shadow-xs">
                <Briefcase className="w-4 h-4 text-[#4B49AC] dark:text-[#7DA0FA]" />
                <span>
                  Teacher's Desktop &bull;{' '}
                  {currentUser?.name || 'Educator'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Tools: Date, Curriculum, Ecosystem Map, Theme Toggle, Alerts & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Dynamic Date display */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F5F7FF] dark:bg-[#12131C] text-[11px] font-semibold text-[#6C7383] dark:text-[#9CA3AF] border border-slate-200 dark:border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-[#4B49AC] dark:text-[#7DA0FA]" />
            <span>{currentDateStr}</span>
          </div>

          {/* Grades 6-12 Curriculum Modal Trigger (Hidden in Student panel) */}
          {!isStudentPanel && (
            <button
              onClick={() => setIsCurriculumModalOpen(true)}
              title="Browse Complete Grades 6-12 Curriculum Database"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#F5F7FF] dark:bg-[#12131C] text-[#4B49AC] dark:text-[#98BDFF] border border-slate-200 dark:border-slate-800 hover:bg-[#98BDFF]/15 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#4B49AC] dark:text-[#7DA0FA]" />
              <span>Grades 6-12</span>
            </button>
          )}

          {/* Ecosystem Map Overview Trigger (Hidden in Student panel) */}
          {!isStudentPanel && (
            <button
              onClick={() => setEcosystemOverviewMode(!ecosystemOverviewMode)}
              title="Toggle Unified Ecosystem 3-Panel Overview"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                ecosystemOverviewMode
                  ? 'bg-[#4B49AC] text-white border-[#4B49AC] shadow-sm'
                  : 'bg-[#F5F7FF] dark:bg-[#12131C] hover:bg-slate-200 dark:hover:bg-slate-800 text-[#1F1F24] dark:text-slate-200 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#7DA0FA]" />
              <span className="hidden sm:inline">Ecosystem</span>
            </button>
          )}

          {/* ISSUE 2 FIX: Robust Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-button"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={`Toggle theme: currently ${theme} mode`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F5F7FF] hover:bg-slate-200 dark:bg-[#12131C] dark:hover:bg-slate-800 text-[#1F1F24] dark:text-[#F1F1F6] border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin-slow" />
                <span className="hidden sm:inline font-bold">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#4B49AC] fill-[#4B49AC]" />
                <span className="hidden sm:inline font-bold">Dark</span>
              </>
            )}
          </button>

          {/* Quick Simulation Trigger Dropdown (Proctoring test tool - Admin panel only) */}
          {currentRole === 'admin' && (
            <div className="relative">
              <button
                onClick={() => setShowSimulations(!showSimulations)}
                title="Test Real-Time Event Bus"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#F5F7FF] dark:bg-[#12131C] text-[#4B49AC] dark:text-[#98BDFF] border border-slate-200 dark:border-slate-800 hover:bg-[#98BDFF]/15 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#7978E9] fill-[#7978E9]" />
                <span className="hidden md:inline">Simulate</span>
              </button>

              {showSimulations && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1E1E2F] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 text-xs">
                  <div className="px-2 py-1 font-bold text-[#1F1F24] dark:text-white border-b border-slate-100 dark:border-slate-800 flex justify-between items-center mb-1">
                    <span>Trigger Cross-Panel Events</span>
                    <button onClick={() => setShowSimulations(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => {
                        triggerAnomaly('feed-2', 'Head Rotation');
                        setShowSimulations(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-between"
                    >
                      <span>⚠️ Trigger "Head Rotation" (Feed 2)</span>
                      <span className="text-[10px] text-slate-400">Admin alert</span>
                    </button>
                    <button
                      onClick={() => {
                        triggerAnomaly('feed-6', 'Multiple Faces Detected');
                        setShowSimulations(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#F3797E] flex items-center justify-between font-bold"
                    >
                      <span>🚨 Trigger "Multiple Faces" (Feed 6)</span>
                      <span className="text-[10px] text-slate-400">Coral flag</span>
                    </button>
                    <button
                      onClick={() => {
                        triggerAnomaly('feed-2', 'Clear');
                        triggerAnomaly('feed-6', 'Clear');
                        setShowSimulations(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-between"
                    >
                      <span>✅ Clear All Proctor Flags</span>
                      <span className="text-[10px] text-slate-400">Reset</span>
                    </button>
                    <button
                      onClick={() => {
                        if (quizzes[0]) publishQuiz(quizzes[0]);
                        setShowSimulations(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#F5F7FF] dark:hover:bg-[#12131C] text-[#4B49AC] dark:text-[#98BDFF] flex items-center justify-between font-semibold"
                    >
                      <span>📝 Publish Quiz to Student Portal</span>
                      <span className="text-[10px] text-slate-400">Sync quiz</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Center with Soft Coral (#F3797E) Alert dot */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#F5F7FF] dark:hover:bg-[#12131C] transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#F3797E] ring-2 ring-white dark:ring-[#1E1E2F] animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1E1E2F] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#4B49AC]" />
                    <span className="text-xs font-extrabold text-[#1F1F24] dark:text-white">
                      Unified Event Stream
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6C7383]">{notifications.length} updates</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 mt-2 space-y-1">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="pt-2.5 pb-2.5 text-xs flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'alert' && <AlertTriangle className="w-4 h-4 text-[#F3797E]" />}
                        {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {notif.type === 'info' && <Radio className="w-4 h-4 text-[#4B49AC]" />}
                        {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1F1F24] dark:text-slate-200">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-[#6C7383]">{notif.timestamp}</span>
                        </div>
                        <p className="text-[#6C7383] dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                          {notif.description}
                        </p>
                      </div>
                      <button
                        onClick={() => removeNotification(notif.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with Role Badge & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsProfileOpen(true)}
              title="Click to view & edit your profile"
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#F5F7FF] dark:hover:bg-[#12131C] transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#4B49AC] flex items-center justify-center font-bold text-xs text-white shadow-xs overflow-hidden ring-2 ring-[#98BDFF]/50 shrink-0">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser?.name || 'User Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser?.name.charAt(0) || 'U'
                )}
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-bold text-[#1F1F24] dark:text-[#F1F1F6] leading-tight">
                  {currentUser?.name || 'User Profile'}
                </div>
                <div className="text-[10px] text-[#6C7383] dark:text-[#9CA3AF] font-medium">
                  {currentUser?.role ? currentUser.role.toUpperCase() : 'USER'} &bull; Settings
                </div>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Log Out to Unified Login Gateway"
              className="p-2 rounded-xl text-slate-500 hover:text-[#F3797E] dark:text-slate-400 dark:hover:text-[#F3797E] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
