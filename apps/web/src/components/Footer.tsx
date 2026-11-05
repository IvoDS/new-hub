'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full glass-panel border-t border-white/5 py-8 px-6 text-center text-xs text-neutral-500 font-mono">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>© {new Date().getFullYear()} Ivan De Stefani. {t.footer.rights}</span>
        <span>{t.footer.poweredBy}</span>
      </div>
    </footer>
  );
}
