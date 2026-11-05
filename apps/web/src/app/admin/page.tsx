'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Activity, 
  RotateCcw, 
  ArrowRightLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  UploadCloud, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Loader2 
} from 'lucide-react';
import { api } from '@/lib/apiClient';
import type { Project, CreateProjectInput, DeploymentSlot } from '@hub/shared';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'deployments' | 'projects' | 'assets'>('deployments');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // --- 1. Deployments & Caddy State ---
  const { data: deploymentData, isLoading: loadingDeployments } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => api.getDeployments(),
    refetchInterval: 5000,
  });

  const routing = deploymentData?.routing;
  const history = deploymentData?.history || [];
  const activeSlot = routing?.activeSlot || 'blue';
  const standbySlot: DeploymentSlot = activeSlot === 'blue' ? 'green' : 'blue';

  const switchMutation = useMutation({
    mutationFn: (target: DeploymentSlot) => api.switchSlot(target, 'Manual admin switch'),
    onSuccess: (data) => {
      setActionMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      queryClient.invalidateQueries({ queryKey: ['deployments-status'] });
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: () => api.rollback('Admin manual rollback'),
    onSuccess: (data) => {
      setActionMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      queryClient.invalidateQueries({ queryKey: ['deployments-status'] });
    },
  });

  // --- 2. Projects Management ---
  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => api.getAllProjectsAdmin(),
  });

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProject, setNewProject] = useState<CreateProjectInput>({
    title: '',
    slug: '',
    summary: '',
    description: '',
    category: 'web',
    tags: ['Next.js', 'Fastify'],
    coverImageUrl: '',
    demoUrl: '',
    githubUrl: '',
    featured: false,
    order: 1,
    published: true,
  });

  const createProjectMutation = useMutation({
    mutationFn: (input: CreateProjectInput) => api.createProject(input),
    onSuccess: () => {
      setIsCreatingProject(false);
      setNewProject({
        title: '',
        slug: '',
        summary: '',
        description: '',
        category: 'web',
        tags: ['Next.js'],
        featured: false,
        order: 1,
        published: true,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // --- 3. Assets & Uploads ---
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus('Uploading asset to server...');
      const res = await api.uploadFile(file);
      setUploadStatus(`File uploaded successfully! URL: ${res.url}`);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err: any) {
      setUploadStatus(`Upload failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header & Dev Admin Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald shadow-emerald-glow animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Admin & Deployment Manager
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Zero-downtime routing controller & content management interface for ivandestefani.it
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="emerald" className="px-3 py-1 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            Dev Admin Mode (Bypass Active)
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8">
        <Button
          variant={activeTab === 'deployments' ? 'emerald' : 'glass'}
          size="sm"
          onClick={() => setActiveTab('deployments')}
        >
          <Activity className="w-3.5 h-3.5 mr-2" />
          Blue/Green Controller
        </Button>
        <Button
          variant={activeTab === 'projects' ? 'emerald' : 'glass'}
          size="sm"
          onClick={() => setActiveTab('projects')}
        >
          <FileText className="w-3.5 h-3.5 mr-2" />
          Projects Manager
        </Button>
        <Button
          variant={activeTab === 'assets' ? 'emerald' : 'glass'}
          size="sm"
          onClick={() => setActiveTab('assets')}
        >
          <UploadCloud className="w-3.5 h-3.5 mr-2" />
          Static Assets & CV
        </Button>
      </div>

      {/* Feedback banner */}
      {actionMessage && (
        <div className="mb-6 p-4 rounded-xl glass-panel border-emerald/30 bg-emerald/10 flex items-center justify-between text-emerald-light text-xs font-mono">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-white/60 hover:text-white">✕</button>
        </div>
      )}

      {/* TAB 1: BLUE / GREEN DEPLOYMENT CONTROLLER */}
      {activeTab === 'deployments' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blue Slot Card */}
            <Card className={`relative border-2 ${activeSlot === 'blue' ? 'border-sapphire/80 shadow-sapphire-glow bg-sapphire/10' : 'border-white/10 opacity-75'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-sapphire-light font-bold">
                    Slot Blue
                  </span>
                  <Badge variant={activeSlot === 'blue' ? 'sapphire' : 'idle'}>
                    {activeSlot === 'blue' ? '● ACTIVE TRAFFIC' : '○ STANDBY'}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-white">Production Slot: Blue</CardTitle>
                <CardDescription className="text-xs font-mono text-neutral-300">
                  Target Upstream: {routing?.blueUpstream || '127.0.0.1:3001'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-neutral-400">
                  Container status: Connected via Caddy reverse proxy on port 8080.
                </p>
                {activeSlot !== 'blue' && (
                  <Button
                    variant="glassSapphire"
                    size="sm"
                    className="w-full"
                    disabled={switchMutation.isPending}
                    onClick={() => switchMutation.mutate('blue')}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 mr-2" />
                    Switch Live Traffic to Blue
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Green Slot Card */}
            <Card className={`relative border-2 ${activeSlot === 'green' ? 'border-emerald/80 shadow-emerald-glow bg-emerald/10' : 'border-white/10 opacity-75'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-light font-bold">
                    Slot Green
                  </span>
                  <Badge variant={activeSlot === 'green' ? 'emerald' : 'idle'}>
                    {activeSlot === 'green' ? '● ACTIVE TRAFFIC' : '○ STANDBY'}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-white">Production Slot: Green</CardTitle>
                <CardDescription className="text-xs font-mono text-neutral-300">
                  Target Upstream: {routing?.greenUpstream || '127.0.0.1:3002'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-neutral-400">
                  Container status: Connected via Caddy reverse proxy on port 8080.
                </p>
                {activeSlot !== 'green' && (
                  <Button
                    variant="glassEmerald"
                    size="sm"
                    className="w-full"
                    disabled={switchMutation.isPending}
                    onClick={() => switchMutation.mutate('green')}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 mr-2" />
                    Switch Live Traffic to Green
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deployment Switch Actions</CardTitle>
              <CardDescription className="text-xs">
                Executes atomic HTTP configuration switch via Caddy REST API with zero-downtime.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 items-center">
              <Button
                variant="emerald"
                disabled={switchMutation.isPending}
                onClick={() => switchMutation.mutate(standbySlot)}
              >
                {switchMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRightLeft className="w-4 h-4 mr-2" />}
                Promote Standby Slot ({standbySlot.toUpperCase()}) to Active
              </Button>

              <Button
                variant="danger"
                disabled={rollbackMutation.isPending}
                onClick={() => rollbackMutation.mutate()}
              >
                {rollbackMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                Trigger Instant Rollback
              </Button>
            </CardContent>
          </Card>

          {/* Deployment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deployment Audit Trail</CardTitle>
              <CardDescription className="text-xs">
                Recent releases, switch commands, and gate approvals recorded in MariaDB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-white/5 font-mono text-xs">
                {history.map((record) => (
                  <div key={record.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-white">{record.commitMessage}</span>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        commit: <span className="text-emerald-light">{record.commitHash}</span> • branch: {record.branch} • tag: {record.imageTag}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-right">
                      <Badge variant={record.slot === 'blue' ? 'sapphire' : 'emerald'}>
                        {record.slot.toUpperCase()}
                      </Badge>
                      <span className="text-[11px] text-neutral-500">
                        {new Date(record.deployedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: PROJECTS MANAGER */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Project Showcase Portfolio</h2>
            <Button variant="emerald" size="sm" onClick={() => setIsCreatingProject(!isCreatingProject)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {isCreatingProject ? 'Cancel' : 'Add New Project'}
            </Button>
          </div>

          {/* Project creation form */}
          {isCreatingProject && (
            <Card className="border border-emerald/30 bg-emerald/5">
              <CardHeader>
                <CardTitle className="text-base">Create New Project Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Project Title</label>
                    <input
                      className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="e.g. Next-Gen Cloud Orchestrator"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Slug</label>
                    <input
                      className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                      value={newProject.slug}
                      onChange={(e) => setNewProject({ ...newProject, slug: e.target.value })}
                      placeholder="e.g. cloud-orchestrator"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Summary (Short card description)</label>
                  <input
                    className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                    value={newProject.summary}
                    onChange={(e) => setNewProject({ ...newProject, summary: e.target.value })}
                    placeholder="Short overview..."
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Comprehensive details..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Category</label>
                    <select
                      className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value as any })}
                    >
                      <option value="web">Web</option>
                      <option value="mobile">Mobile</option>
                      <option value="ai">AI</option>
                      <option value="cloud">Cloud</option>
                      <option value="tooling">Tooling</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Demo URL</label>
                    <input
                      className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                      value={newProject.demoUrl || ''}
                      onChange={(e) => setNewProject({ ...newProject, demoUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">GitHub URL</label>
                    <input
                      className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                      value={newProject.githubUrl || ''}
                      onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>

                <Button
                  variant="emerald"
                  size="sm"
                  disabled={createProjectMutation.isPending || !newProject.title || !newProject.slug}
                  onClick={() => createProjectMutation.mutate(newProject)}
                >
                  Save Project
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Projects Table */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {projects?.map((project) => (
                  <div key={project.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-white">{project.title}</h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">{project.slug} • {project.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => deleteProjectMutation.mutate(project.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: STATIC ASSETS & CV UPLOAD */}
      {activeTab === 'assets' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Asset & Curriculum Manager</CardTitle>
            <CardDescription className="text-xs">
              Upload PDF resumes, portfolio assets, and project screenshots to persistent server volume.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center space-y-4 hover:border-emerald/40 transition-colors">
              <UploadCloud className="w-10 h-10 mx-auto text-emerald-light" />
              <div>
                <p className="text-sm font-medium text-white">Upload New File</p>
                <p className="text-xs text-neutral-400 mt-1">Accepts PDF, PNG, JPG up to 50MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                id="file-upload-input"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload-input">
                <span className="inline-block px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer border border-white/10 font-medium">
                  Browse File
                </span>
              </label>
            </div>

            {uploadStatus && (
              <p className="text-xs font-mono text-emerald-light bg-emerald/10 p-3 rounded-lg border border-emerald/20">
                {uploadStatus}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
