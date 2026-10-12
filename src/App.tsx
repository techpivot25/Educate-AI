/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { GlobalHeader } from './components/common/GlobalHeader';
import { StudentView } from './components/StudentView/StudentView';
import { TeacherView } from './components/TeacherView/TeacherView';
import { AdminView } from './components/AdminView/AdminView';
import { UnifiedLogin } from './components/Auth/UnifiedLogin';
import { UserProfileModal } from './components/UserProfile/UserProfileModal';
import { CurriculumExplorerModal } from './components/common/CurriculumExplorerModal';
import { UnifiedEcosystemView } from './components/common/UnifiedEcosystemView';
import { AlertTriangle, ExternalLink, X } from 'lucide-react';

const QuotaDefenseBanner: React.FC = () => {
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  if (!quotaExceeded) return null;

  return (
    <div className="bg-amber-500 dark:bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between z-50 shadow-md">
      <div className="flex items-center gap-2 max-w-4xl">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          Google Maps Platform demo usage limit reached. Maps and place autocomplete are falling back to cached educational database records.
        </span>
        <a
          href="https://console.cloud.google.com/google/maps-apis/overview"
          target="_blank"
          rel="noopener noreferrer"
          className="underline inline-flex items-center gap-1 font-bold hover:text-amber-100 shrink-0 ml-1"
        >
          <span>Upgrade API Key</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <button
        onClick={() => setQuotaExceeded(false)}
        className="p-1 hover:bg-black/10 rounded-md transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { currentRole, isAuthenticated, ecosystemOverviewMode } = useApp();

  if (!isAuthenticated) {
    return <UnifiedLogin />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors bg-[#F5F7FF] dark:bg-[#12131C] text-[#1F1F24] dark:text-[#F1F1F6]">
      <QuotaDefenseBanner />
      <GlobalHeader />
      <div className="flex-1">
        {ecosystemOverviewMode ? (
          <UnifiedEcosystemView />
        ) : (
          <>
            {currentRole === 'student' && <StudentView />}
            {currentRole === 'teacher' && <TeacherView />}
            {currentRole === 'admin' && <AdminView />}
          </>
        )}
      </div>
      <UserProfileModal />
      <CurriculumExplorerModal />
    </div>
  );
};

export default function App() {
  const mapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  return (
    <APIProvider apiKey={mapsApiKey} solutionChannel="GMP_GCC_react_v1">
      <ThemeProvider>
        <AppProvider>
          <MainContent />
        </AppProvider>
      </ThemeProvider>
    </APIProvider>
  );
}
