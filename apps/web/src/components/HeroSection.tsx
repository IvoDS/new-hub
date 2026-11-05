'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, Download, Github, Linkedin, Mail, Sparkles, Terminal } from 'lucide-react';
import type { Profile } from '@hub/shared';
import { Button } from './ui/button';

interface HeroSectionProps {
  profile?: Profile;
}

export function HeroSection({ profile }: HeroSectionProps) {
  const fullName = profile?.fullName || 'Ivan De Stefani';
  const headline = profile?.headline || 'Full Stack Engineer & Cloud Architect';
  const bio = profile?.bio || 'Designing resilient, distributed systems, high-speed web apps, and automated zero-downtime deployment pipelines with Caddy and Docker.';

  return (
    <section className="relative pt-20 pb-16 overflow-hidden">
      {/* Dynamic ambient glass glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sapphire/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/3 -translate-y-1/2 w-80 h-80 bg-emerald/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center text-center space-y-6"
        >
          {/* Status pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-glass">
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            <span className="text-xs font-mono text-neutral-300">
              Zero-Downtime Blue/Green Architecture
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
            <span className="text-white">Hello, I am </span>
            <span className="text-gradient-sapphire">{fullName}</span>
          </h1>

          <p className="text-lg sm:text-2xl font-medium text-gradient-emerald max-w-2xl">
            {headline}
          </p>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed">
            {bio}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="#projects">
              <Button variant="emerald" size="lg" className="group">
                <span>Explore Showcase</span>
                <ArrowDownRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </Button>
            </a>

            {profile?.cvPdfUrl ? (
              <a href={profile.cvPdfUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="glass" size="lg" className="border-white/15">
                  <Download className="w-4 h-4 mr-2 text-sapphire-light" />
                  <span>Download Curriculum</span>
                </Button>
              </a>
            ) : null}

            <a href="https://github.com/ivandestefani" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="border-white/15">
                <Github className="w-4 h-4 mr-2" />
                <span>GitHub</span>
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
