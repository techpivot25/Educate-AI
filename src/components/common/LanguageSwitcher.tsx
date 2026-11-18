import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_LOCALES, getLocaleMeta } from '../../i18n';
import type { LanguageMedium } from '../../types';

interface LanguageSwitcherProps {
  variant?: 'portal' | 'global' | 'compact';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'portal' }) => {
  const { t } = useTranslation('common');
  const { globalLanguage, changePlatformLanguage } = useApp();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeMeta = getLocaleMeta(globalLanguage);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleSelect = (code: LanguageMedium) => {
    setOpen(false);
    if (code !== activeMeta.code) {
      void changePlatformLanguage(code);
    }
  };

  const triggerClass =
    variant === 'global'
      ? 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F5F7FF] hover:bg-slate-200 dark:bg-[#12131C] dark:hover:bg-slate-800 text-[#1F1F24] dark:text-[#F1F1F6] border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0'
      : variant === 'compact'
      ? 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-normal bg-white dark:bg-[#12234e] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0'
      : 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-normal text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0';

  const iconAccent = variant === 'global' ? 'text-[#4B49AC] dark:text-[#98BDFF]' : 'text-[#00A896]';

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('languageSwitcher.selectLanguage')}
        title={`${t('languageSwitcher.label')}: ${activeMeta.nativeName} (${activeMeta.englishName})`}
        className={triggerClass}
      >
        <Globe className={`w-3.5 h-3.5 shrink-0 ${iconAccent}`} />
        <span className="hidden sm:inline">{activeMeta.nativeName}</span>
        <span className="sm:hidden">{activeMeta.shortLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-150 shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('languageSwitcher.selectLanguage')}
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#161B2E] border border-slate-200 dark:border-slate-700/90 shadow-xl z-50 overflow-hidden py-1.5"
        >
          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t('languageSwitcher.selectLanguage')}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#00A896]/15 text-[#00A896] font-medium">
              {activeMeta.shortLabel}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {SUPPORTED_LOCALES.map((loc) => {
              const isSelected = loc.code === activeMeta.code;
              return (
                <button
                  key={loc.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(loc.code)}
                  className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#00A896]/10 dark:bg-[#00A896]/20 text-slate-900 dark:text-white'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-semibold uppercase w-6 text-slate-400 dark:text-slate-400 shrink-0">
                      {loc.shortLabel}
                    </span>
                    <span className="truncate font-normal">
                      {loc.code === 'en' ? loc.nativeName : `${loc.nativeName} (${loc.englishName})`}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#00A896] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
