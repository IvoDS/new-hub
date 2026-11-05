export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: 'web' | 'mobile' | 'ai' | 'cloud' | 'tooling';
  tags: string[];
  coverImageUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProjectInput = Partial<CreateProjectInput>;
