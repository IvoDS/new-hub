'use client';

import React from 'react';
import { Server, Globe, Zap, Cpu } from 'lucide-react';
import type { CompetencySection } from '@hub/shared';
import { DEFAULT_SITE_CONTENT } from '@hub/shared';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const ICON_MAP = {
  globe: Globe,
  server: Server,
  zap: Zap,
  cpu: Cpu,
};

interface SkillsSectionProps {
  competencies?: CompetencySection[];
}

export function SkillsSection({ competencies }: SkillsSectionProps) {
  const { locale, t } = useLanguage();

  const sectionsToRender = (competencies && competencies.length > 0)
    ? competencies
    : DEFAULT_SITE_CONTENT.competencies;

  return (
    <section id="skills" className="py-20 relative bg-black/40 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="text-sapphire-light text-xs font-mono mb-2 uppercase tracking-widest">
            {t.skills.tagline}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            {t.skills.title}
          </h2>
          <p className="text-sm text-neutral-400">
            {t.skills.description}
          </p>
        </div>

        {/* 4 Competency Sections: Frontend, Backend, DevOps, Firmware */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sectionsToRender.map((section) => {
            const IconComponent = ICON_MAP[section.icon] || Cpu;
            const isEmerald = section.accent === 'emerald';
            const title = locale === 'it' ? section.titleIt : section.titleEn;

            return (
              <Card key={section.id} className="hover:border-white/20 flex flex-col justify-between">
                <div>
                  <CardHeader>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                        isEmerald
                          ? 'bg-emerald/10 text-emerald-light border border-emerald/20 shadow-emerald-glow'
                          : 'bg-sapphire/10 text-sapphire-light border border-sapphire/20 shadow-sapphire-glow'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base font-semibold text-white">
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {section.items.map((item) => {
                        const itemText = locale === 'it' ? item.textIt : item.textEn;
                        return (
                          <li key={item.id} className="flex items-start text-xs text-neutral-300 leading-snug">
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-2.5 mt-1.5 shrink-0 ${
                                isEmerald ? 'bg-emerald' : 'bg-sapphire-light'
                              }`}
                            />
                            <span>{itemText}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
