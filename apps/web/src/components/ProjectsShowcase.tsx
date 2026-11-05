'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Sparkles } from 'lucide-react';
import { api } from '@/lib/apiClient';
import type { Project } from '@hub/shared';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ProjectCard } from './ProjectCard';
import { Button } from './ui/button';

export function ProjectsShowcase() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: t.projects.categories.all },
    { id: 'cloud', label: t.projects.categories.cloud },
    { id: 'ai', label: t.projects.categories.ai },
    { id: 'web', label: t.projects.categories.web },
    { id: 'tooling', label: t.projects.categories.tooling },
  ] as const;

  const { data: projects, isLoading, isError, error } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    if (selectedCategory === 'all') return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  return (
    <section id="projects" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2 text-emerald-light text-xs font-mono mb-2 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.projects.tagline}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {t.projects.title}
            </h2>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'emerald' : 'glass'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="text-xs transition-all"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content states */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-sapphire-light animate-spin" />
            <span className="text-sm text-neutral-400 font-mono">{t.projects.loading}</span>
          </div>
        )}

        {isError && (
          <div className="glass-panel p-8 rounded-2xl text-center space-y-3 border-red-500/20">
            <p className="text-red-400 text-sm font-semibold">Could not load projects from API</p>
            <p className="text-neutral-400 text-xs">{(error as Error)?.message}</p>
          </div>
        )}

        {projects && filteredProjects.length === 0 && (
          <div className="py-16 text-center text-neutral-400 text-sm">
            {t.projects.empty.replace('{category}', selectedCategory)}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
