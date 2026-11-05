'use client';

import React from 'react';
import type { Project } from '@hub/shared';
import { ExternalLink, Github, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex flex-col justify-between group">
      {/* Optional Cover image / header gradient */}
      <div className="relative w-full h-44 -mx-6 -mt-6 mb-4 overflow-hidden bg-gradient-to-br from-sapphire/20 to-emerald/10 border-b border-white/5">
        {project.coverImageUrl ? (
          <img
            src={project.coverImageUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white/20" />
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center space-x-1.5">
          {project.featured && (
            <Badge variant="emerald" className="text-[10px] font-semibold">
              Featured
            </Badge>
          )}
          <Badge variant="default" className="text-[10px] uppercase font-mono">
            {project.category}
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-lg group-hover:text-emerald-light transition-colors line-clamp-1">
              {project.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-xs text-neutral-300">
              {project.summary}
            </CardDescription>
          </CardHeader>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 py-3">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-neutral-300 border border-white/5 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <CardFooter className="p-0 pt-3 justify-between">
          <div className="flex items-center space-x-2">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-neutral-400 hover:text-white">
                  <Github className="w-3.5 h-3.5 mr-1.5" />
                  Code
                </Button>
              </a>
            )}
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="glassEmerald" size="sm" className="h-8 px-2.5 text-xs">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Live
                </Button>
              </a>
            )}
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
