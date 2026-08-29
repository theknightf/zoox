'use client';
import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';

export function I18nFontManager() {
  const { language } = useApp();

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (language === 'ar') {
      root.classList.add('font-tajawal');
    } else {
      root.classList.remove('font-tajawal');
    }
  }, [language]);

  return null;
}
