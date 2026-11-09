'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cn } from './ui/button';

export function Navigation() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const { locale, toggleLocale, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-4 sm:px-6 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand identity */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sapphire to-emerald flex items-center justify-center p-[1px] shadow-glass shrink-0">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[11px] flex items-center justify-center">
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-sapphire-light to-emerald-light text-sm">
                ID
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-wide text-white group-hover:text-emerald-light transition-colors">
              Ivan De Stefani
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              ivandestefani.it
            </span>
          </div>
        </Link>

        {/* Navigation, Language Switcher & Admin */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                !isAdmin ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'
              )}
            >
              {t.nav.portfolio}
            </Link>
            <Link
              href="/#projects"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {t.nav.projects}
            </Link>
            <Link
              href="/#skills"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {t.nav.architecture}
            </Link>
          </nav>

          {/* Language Switcher Icon Button */}
          <button
            onClick={toggleLocale}
            title={t.nav.langSwitch}
            aria-label={t.nav.langSwitch}
            className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg glass-card border border-white/10 hover:border-emerald/40 text-neutral-300 hover:text-white transition-all duration-200 group shrink-0 h-9"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-light group-hover:rotate-45 transition-transform duration-300" />
            <span className="text-xs font-mono font-semibold tracking-wider">
              {locale.toUpperCase()}
            </span>
          </button>

          {/* Admin Link Button */}
          <Link
            href={isAdmin ? '/' : '/admin'}
            title={isAdmin ? t.nav.exitAdmin : t.nav.adminHub}
            aria-label={isAdmin ? t.nav.exitAdmin : t.nav.adminHub}
            className={cn(
              'flex items-center justify-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border shrink-0 h-9',
              isAdmin
                ? 'bg-sapphire/20 text-sapphire-light border-sapphire/40 shadow-sapphire-glow'
                : 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10'
            )}
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{isAdmin ? t.nav.exitAdmin : t.nav.adminHub}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
