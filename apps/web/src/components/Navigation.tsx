'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Terminal, Shield, Layers, ExternalLink } from 'lucide-react';
import { api } from '@/lib/apiClient';
import { Badge } from './ui/badge';
import { cn } from './ui/button';

export function Navigation() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  // Query current active deployment slot for live header indicator
  const { data: deploymentData } = useQuery({
    queryKey: ['deployments-status'],
    queryFn: () => api.getDeployments(),
    refetchInterval: 10000,
  });

  const activeSlot = deploymentData?.routing?.activeSlot || 'blue';

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-6 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand identity */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sapphire to-emerald flex items-center justify-center p-[1px] shadow-glass">
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

        {/* Live Slot & Navigation items */}
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                !isAdmin ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'
              )}
            >
              Portfolio
            </Link>
            <Link
              href="/#projects"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/#skills"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Architecture
            </Link>
          </nav>

          {/* Active slot indicator badge */}
          <div className="flex items-center space-x-2 pl-3 border-l border-white/10">
            <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">Active Slot:</span>
            <Badge variant={activeSlot === 'blue' ? 'sapphire' : 'emerald'} className="capitalize font-mono">
              <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', activeSlot === 'blue' ? 'bg-sapphire-light animate-pulse' : 'bg-emerald animate-pulse')} />
              {activeSlot}
            </Badge>
          </div>

          {/* Admin Switch */}
          <Link
            href={isAdmin ? '/' : '/admin'}
            className={cn(
              'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border',
              isAdmin
                ? 'bg-sapphire/20 text-sapphire-light border-sapphire/40 shadow-sapphire-glow'
                : 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10'
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Exit Admin' : 'Admin Hub'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
