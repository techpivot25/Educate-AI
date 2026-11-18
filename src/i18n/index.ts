import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { LanguageMedium } from '../types';

import enCommon from '../../locales/en/common.json';
import enStudent from '../../locales/en/student.json';
import enTeacher from '../../locales/en/teacher.json';

import hiCommon from '../../locales/hi/common.json';
import hiStudent from '../../locales/hi/student.json';
import hiTeacher from '../../locales/hi/teacher.json';

import paCommon from '../../locales/pa/common.json';
import paStudent from '../../locales/pa/student.json';
import paTeacher from '../../locales/pa/teacher.json';

import mrCommon from '../../locales/mr/common.json';
import mrStudent from '../../locales/mr/student.json';
import mrTeacher from '../../locales/mr/teacher.json';

import bnCommon from '../../locales/bn/common.json';
import bnStudent from '../../locales/bn/student.json';
import bnTeacher from '../../locales/bn/teacher.json';

import taCommon from '../../locales/ta/common.json';
import taStudent from '../../locales/ta/student.json';
import taTeacher from '../../locales/ta/teacher.json';

import teCommon from '../../locales/te/common.json';
import teStudent from '../../locales/te/student.json';
import teTeacher from '../../locales/te/teacher.json';

import guCommon from '../../locales/gu/common.json';
import guStudent from '../../locales/gu/student.json';
import guTeacher from '../../locales/gu/teacher.json';

import knCommon from '../../locales/kn/common.json';
import knStudent from '../../locales/kn/student.json';
import knTeacher from '../../locales/kn/teacher.json';

import mlCommon from '../../locales/ml/common.json';
import mlStudent from '../../locales/ml/student.json';
import mlTeacher from '../../locales/ml/teacher.json';

export interface LocaleMeta {
  code: LanguageMedium;
  englishName: string;
  nativeName: string;
  shortLabel: string;
}

export const SUPPORTED_LOCALES: LocaleMeta[] = [
  { code: 'en', englishName: 'English', nativeName: 'English', shortLabel: 'EN' },
  { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी', shortLabel: 'HI' },
  { code: 'pa', englishName: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', shortLabel: 'PA' },
  { code: 'mr', englishName: 'Marathi', nativeName: 'मराठी', shortLabel: 'MR' },
  { code: 'bn', englishName: 'Bengali', nativeName: 'বাংলা', shortLabel: 'BN' },
  { code: 'ta', englishName: 'Tamil', nativeName: 'தமிழ்', shortLabel: 'TA' },
  { code: 'te', englishName: 'Telugu', nativeName: 'తెలుగు', shortLabel: 'TE' },
  { code: 'gu', englishName: 'Gujarati', nativeName: 'ગુજરાતી', shortLabel: 'GU' },
  { code: 'kn', englishName: 'Kannada', nativeName: 'ಕನ್ನಡ', shortLabel: 'KN' },
  { code: 'ml', englishName: 'Malayalam', nativeName: 'മലയാളം', shortLabel: 'ML' },
];

export const VALID_LOCALE_CODES = new Set<string>(SUPPORTED_LOCALES.map((l) => l.code));

export const LOCALE_STORAGE_KEY = 'pivot_iq_locale';
export const LOCALE_COOKIE_NAME = 'pivot_iq_locale';

export function normalizeLocaleCode(raw?: string | null): LanguageMedium {
  if (!raw) return 'en';
  const cleaned = String(raw).trim().toLowerCase().split(/[-_]/)[0];
  return VALID_LOCALE_CODES.has(cleaned) ? (cleaned as LanguageMedium) : 'en';
}

export function getLocaleCookie(): LanguageMedium | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const part of cookies) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (rawKey === LOCALE_COOKIE_NAME) {
      const val = decodeURIComponent(rest.join('=')).trim().toLowerCase();
      if (VALID_LOCALE_CODES.has(val)) return val as LanguageMedium;
    }
  }
  return null;
}

export function getStoredLocale(userPreferredLanguage?: string | null): LanguageMedium {
  if (userPreferredLanguage && VALID_LOCALE_CODES.has(userPreferredLanguage.toLowerCase())) {
    return userPreferredLanguage.toLowerCase() as LanguageMedium;
  }
  if (typeof window !== 'undefined') {
    try {
      const fromStorage = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (fromStorage && VALID_LOCALE_CODES.has(fromStorage.toLowerCase())) {
        return fromStorage.toLowerCase() as LanguageMedium;
      }
      const savedUserRaw = window.localStorage.getItem('educate_ai_current_user');
      if (savedUserRaw) {
        const parsed = JSON.parse(savedUserRaw);
        if (parsed?.preferred_language && VALID_LOCALE_CODES.has(String(parsed.preferred_language).toLowerCase())) {
          return String(parsed.preferred_language).toLowerCase() as LanguageMedium;
        }
      }
    } catch {
      // Ignore storage read issues
    }
  }
  const fromCookie = getLocaleCookie();
  if (fromCookie) return fromCookie;
  return 'en';
}

export function persistLocaleStorageAndCookie(code: LanguageMedium): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, code);
    } catch {
      // Ignore quota errors
    }
  }
  if (typeof document !== 'undefined') {
    document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(code)}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = code;
  }
}

export function getLocaleMeta(code?: string | null): LocaleMeta {
  const norm = normalizeLocaleCode(code);
  return SUPPORTED_LOCALES.find((l) => l.code === norm) || SUPPORTED_LOCALES[0];
}

const initialLanguage = getStoredLocale();

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { common: enCommon, student: enStudent, teacher: enTeacher },
      hi: { common: hiCommon, student: hiStudent, teacher: hiTeacher },
      pa: { common: paCommon, student: paStudent, teacher: paTeacher },
      mr: { common: mrCommon, student: mrStudent, teacher: mrTeacher },
      bn: { common: bnCommon, student: bnStudent, teacher: bnTeacher },
      ta: { common: taCommon, student: taStudent, teacher: taTeacher },
      te: { common: teCommon, student: teStudent, teacher: teTeacher },
      gu: { common: guCommon, student: guStudent, teacher: guTeacher },
      kn: { common: knCommon, student: knStudent, teacher: knTeacher },
      ml: { common: mlCommon, student: mlStudent, teacher: mlTeacher },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    ns: ['common', 'student', 'teacher'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    returnEmptyString: false,
  });

  if (typeof document !== 'undefined') {
    document.documentElement.lang = initialLanguage;
  }

  i18n.on('languageChanged', (lng) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = normalizeLocaleCode(lng);
    }
  });
}

export default i18n;
