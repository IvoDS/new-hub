'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { HeroSection } from '@/components/HeroSection';
import { ProjectsShowcase } from '@/components/ProjectsShowcase';
import { SkillsSection } from '@/components/SkillsSection';

export default function HomePage() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  });

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection profile={profile} />
      <ProjectsShowcase />
      <SkillsSection />
    </div>
  );
}
