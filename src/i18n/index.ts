'use client';
import { useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { dict as core } from './ar/core';
import { dict as nav } from './ar/nav';
import { dict as dashboard } from './ar/dashboard';
import { dict as reservations } from './ar/reservations';
import { dict as liveSessions } from './ar/liveSessions';
import { dict as pages } from './ar/pages';
import { dict as system } from './ar/system';

const arDictionary: Record<string, string> = {
  ...core,
  ...nav,
  ...dashboard,
  ...reservations,
  ...liveSessions,
  ...pages,
  ...system,
};

export type Lang = 'en' | 'ar';

export function translate(lang: Lang, key: string): string {
  if (lang === 'ar') {
    const value = arDictionary[key];
    if (value) return value;
  }
  return key;
}

export function useTranslation() {
  const { language } = useApp();
  const t = useCallback((key: string) => translate(language as Lang, key), [language]);
  return { t, language };
}
