'use client';

import React from 'react';
import { Cpu, Server, Globe, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const DOMAINS = [
  {
    title: 'Frontend Architecture',
    icon: Globe,
    accent: 'sapphire',
    items: ['React 19 & Next.js 15 (App Router)', 'Tailwind CSS & Glassmorphism UI', 'TanStack Query (React Query)', 'Framer Motion Transitions', 'TypeScript Strict Mode'],
  },
  {
    title: 'Backend & High-Throughput APIs',
    icon: Server,
    accent: 'emerald',
    items: ['Node.js & Fastify REST Architecture', 'MariaDB & Sequelize ORM', 'JWT & OAuth SSO Authentication', 'Zod Schema Validation', 'Streaming File Pipeline'],
  },
  {
    title: 'DevOps & Zero-Downtime Deployment',
    icon: Zap,
    accent: 'sapphire',
    items: ['Caddy Dynamic Reverse Proxy (Admin API)', 'Docker Container Orchestration', 'Blue/Green Deployment (Zero-Downtime)', 'GitHub Actions Automated CI/CD', 'Automated Health-check Rollbacks'],
  },
];

export function SkillsSection() {
  return (
    <section id="skills" className="py-20 relative bg-black/40 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="text-sapphire-light text-xs font-mono mb-2 uppercase tracking-widest">
            Core Competencies
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Engineered for Resilience & Speed
          </h2>
          <p className="text-sm text-neutral-400">
            A battle-tested stack combining modern reactive frontends, lightweight async backends, and robust containerized infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DOMAINS.map((domain) => {
            const Icon = domain.icon;
            const isEmerald = domain.accent === 'emerald';
            return (
              <Card key={domain.title} className="hover:border-white/20">
                <CardHeader>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isEmerald ? 'bg-emerald/10 text-emerald-light border border-emerald/20 shadow-emerald-glow' : 'bg-sapphire/10 text-sapphire-light border border-sapphire/20 shadow-sapphire-glow'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">{domain.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {domain.items.map((item) => (
                      <li key={item} className="flex items-center text-xs text-neutral-300">
                        <span className={`w-1.5 h-1.5 rounded-full mr-2.5 ${isEmerald ? 'bg-emerald' : 'bg-sapphire-light'}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
