'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Activity, 
  RotateCcw, 
  ArrowRightLeft, 
  Plus, 
  Trash2, 
  UploadCloud, 
  CheckCircle, 
  ShieldCheck, 
  FileText, 
  Loader2,
  Sliders,
  Save,
  Cpu,
  Globe,
  Server,
  Zap
} from 'lucide-react';
import { api } from '@/lib/apiClient';
import type { 
  Project, 
  CreateProjectInput, 
  DeploymentSlot, 
  SiteContent, 
  CompetencySection,
  DEFAULT_SITE_CONTENT
} from '@hub/shared';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AdminPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'deployments' | 'content' | 'projects' | 'assets'>('content');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // --- 1. Deployments & Caddy State ---
  const { data: deploymentData } = useQuery({
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

  // --- 2. Site Content & Competencies Editor ---
  const { data: initialContent, isLoading: loadingContent } = useQuery({
    queryKey: ['admin-content'],
    queryFn: () => api.getContent(),
  });

  const [contentForm, setContentForm] = useState<SiteContent | null>(null);

  useEffect(() => {
    if (initialContent) {
      setContentForm(initialContent);
    }
  }, [initialContent]);

  const updateContentMutation = useMutation({
    mutationFn: (data: SiteContent) => api.updateContent(data),
    onSuccess: (saved) => {
      setContentForm(saved);
      setActionMessage('Site texts and competencies saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
    },
  });

  const resetContentMutation = useMutation({
    mutationFn: () => api.resetContent(),
    onSuccess: (saved) => {
      setContentForm(saved);
      setActionMessage('Site content restored to factory defaults!');
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
    },
  });

  // Competency management helpers
  const handleAddItem = (sectionId: string) => {
    if (!contentForm) return;
    const updatedSections = contentForm.competencies.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const newItem = {
        id: `item-${Date.now()}`,
        textIt: 'Nuova competenza',
        textEn: 'New skill item',
      };
      return { ...sec, items: [...sec.items, newItem] };
    });
    setContentForm({ ...contentForm, competencies: updatedSections });
  };

  const handleUpdateItem = (
    sectionId: string,
    itemId: string,
    field: 'textIt' | 'textEn',
    value: string
  ) => {
    if (!contentForm) return;
    const updatedSections = contentForm.competencies.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const updatedItems = sec.items.map((item) => {
        if (item.id !== itemId) return item;
        return { ...item, [field]: value };
      });
      return { ...sec, items: updatedItems };
    });
    setContentForm({ ...contentForm, competencies: updatedSections });
  };

  const handleRemoveItem = (sectionId: string, itemId: string) => {
    if (!contentForm) return;
    const updatedSections = contentForm.competencies.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return { ...sec, items: sec.items.filter((item) => item.id !== itemId) };
    });
    setContentForm({ ...contentForm, competencies: updatedSections });
  };

  const handleUpdateSectionTitle = (
    sectionId: string,
    field: 'titleIt' | 'titleEn',
    value: string
  ) => {
    if (!contentForm) return;
    const updatedSections = contentForm.competencies.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return { ...sec, [field]: value };
    });
    setContentForm({ ...contentForm, competencies: updatedSections });
  };

  // --- 3. Projects Management ---
  const { data: projects } = useQuery({
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

  // --- 4. Assets & Uploads ---
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
              {t.admin.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {t.admin.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="emerald" className="px-3 py-1 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            {t.admin.devMode}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={activeTab === 'content' ? 'emerald' : 'glass'}
          size="sm"
          onClick={() => setActiveTab('content')}
        >
          <Sliders className="w-3.5 h-3.5 mr-2" />
          {t.admin.tabs.content}
        </Button>
        <Button
          variant={activeTab === 'deployments' ? 'emerald' : 'glass'}
          size="sm"
          onClick={() => setActiveTab('deployments')}
        >
          <Activity className="w-3.5 h-3.5 mr-2" />
          {t.admin.tabs.deployments}
        </Button>
        <Button
          variant={activeTab === 'projects' ? 'emerald' : 'glass'}
          size="sm"
          onClick={() => setActiveTab('projects')}
        >
          <FileText className="w-3.5 h-3.5 mr-2" />
          {t.admin.tabs.projects}
        </Button>
        <Button
          variant={activeTab === 'assets' ? 'emerald' : 'glass'}
          size="sm"
          onClick={() => setActiveTab('assets')}
        >
          <UploadCloud className="w-3.5 h-3.5 mr-2" />
          {t.admin.tabs.assets}
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

      {/* TAB: SITE TEXTS & KEY COMPETENCIES */}
      {activeTab === 'content' && (
        <div className="space-y-8">
          {/* Action Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl glass-panel border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white">Gestione Testi & Competenze del Sito</h2>
              <p className="text-xs text-neutral-400">
                Modifica le frasi, aggiungi/rimuovi elementi dalle liste e personalizza la sezione Firmware.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetContentMutation.mutate()}
                disabled={resetContentMutation.isPending}
              >
                Ripristina Predefiniti
              </Button>
              <Button
                variant="emerald"
                size="sm"
                onClick={() => contentForm && updateContentMutation.mutate(contentForm)}
                disabled={updateContentMutation.isPending || !contentForm}
              >
                {updateContentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salva Tutte le Modifiche
              </Button>
            </div>
          </div>

          {loadingContent || !contentForm ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="w-8 h-8 text-emerald animate-spin" />
            </div>
          ) : (
            <>
              {/* 1. HERO SECTION TEXTS */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Frasi della Sezione Principale (Hero)</CardTitle>
                  <CardDescription className="text-xs">
                    Imposta i testi sia in Italiano che in Inglese per il saluto iniziale, il titolo e la bio.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Nome Completo</label>
                    <input
                      className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                      value={contentForm.hero.fullName}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          hero: { ...contentForm.hero, fullName: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Status Pill (Italiano)</label>
                      <input
                        className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                        value={contentForm.hero.statusPillIt}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            hero: { ...contentForm.hero, statusPillIt: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Status Pill (Inglese)</label>
                      <input
                        className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                        value={contentForm.hero.statusPillEn}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            hero: { ...contentForm.hero, statusPillEn: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Titolo / Ruolo (Italiano)</label>
                      <input
                        className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                        value={contentForm.hero.headlineIt}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            hero: { ...contentForm.hero, headlineIt: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Titolo / Ruolo (Inglese)</label>
                      <input
                        className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                        value={contentForm.hero.headlineEn}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            hero: { ...contentForm.hero, headlineEn: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Bio / Presentazione (Italiano)</label>
                      <textarea
                        rows={3}
                        className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                        value={contentForm.hero.bioIt}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            hero: { ...contentForm.hero, bioIt: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Bio / Presentazione (Inglese)</label>
                      <textarea
                        rows={3}
                        className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                        value={contentForm.hero.bioEn}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            hero: { ...contentForm.hero, bioEn: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. KEY COMPETENCIES LIST EDITOR (4 SECTIONS INCL. FIRMWARE) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Competenze Chiave (4 Sezioni)</h3>
                    <p className="text-xs text-neutral-400">
                      Gestisci i titoli delle sezioni e aggiungi, modifica o rimuovi singoli elementi dalla lista.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {contentForm.competencies.map((section) => (
                    <Card key={section.id} className="border border-white/10 flex flex-col justify-between">
                      <div>
                        <CardHeader className="pb-3 border-b border-white/5">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant={section.accent === 'emerald' ? 'emerald' : 'sapphire'} className="uppercase font-mono text-[10px]">
                              {section.id} • {section.accent}
                            </Badge>
                            <span className="text-[11px] text-neutral-400 font-mono">
                              {section.items.length} elementi
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-neutral-400 block mb-1 font-mono">Titolo (IT)</label>
                              <input
                                className="glass-input w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                                value={section.titleIt}
                                onChange={(e) =>
                                  handleUpdateSectionTitle(section.id, 'titleIt', e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-400 block mb-1 font-mono">Titolo (EN)</label>
                              <input
                                className="glass-input w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                                value={section.titleEn}
                                onChange={(e) =>
                                  handleUpdateSectionTitle(section.id, 'titleEn', e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </CardHeader>

                        {/* Items in this competency section */}
                        <CardContent className="pt-4 space-y-3">
                          <div className="space-y-2">
                            {section.items.map((item, idx) => (
                              <div
                                key={item.id}
                                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-colors flex items-center gap-2"
                              >
                                <span className="text-[10px] font-mono text-neutral-500 w-4 text-center">
                                  {idx + 1}
                                </span>
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    className="glass-input w-full px-2 py-1 rounded text-[11px]"
                                    placeholder="Testo IT..."
                                    value={item.textIt}
                                    onChange={(e) =>
                                      handleUpdateItem(section.id, item.id, 'textIt', e.target.value)
                                    }
                                  />
                                  <input
                                    className="glass-input w-full px-2 py-1 rounded text-[11px]"
                                    placeholder="Testo EN..."
                                    value={item.textEn}
                                    onChange={(e) =>
                                      handleUpdateItem(section.id, item.id, 'textEn', e.target.value)
                                    }
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                                  title="Rimuovi elemento"
                                  onClick={() => handleRemoveItem(section.id, item.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Add item button */}
                          <Button
                            variant="glass"
                            size="sm"
                            className="w-full text-xs mt-3 border-dashed border-white/15 hover:border-emerald/40"
                            onClick={() => handleAddItem(section.id)}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1.5 text-emerald-light" />
                            Aggiungi Elemento alla Lista
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB: BLUE / GREEN DEPLOYMENT CONTROLLER */}
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
                    {activeSlot === 'blue' ? t.admin.blueSlot.activeTraffic : t.admin.blueSlot.standby}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-white">{t.admin.blueSlot.title}</CardTitle>
                <CardDescription className="text-xs font-mono text-neutral-300">
                  Target Upstream: {routing?.blueUpstream || '127.0.0.1:3001'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-neutral-400">
                  {t.admin.blueSlot.status}
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
                    {t.admin.blueSlot.switchTo}
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
                    {activeSlot === 'green' ? t.admin.greenSlot.activeTraffic : t.admin.greenSlot.standby}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-white">{t.admin.greenSlot.title}</CardTitle>
                <CardDescription className="text-xs font-mono text-neutral-300">
                  Target Upstream: {routing?.greenUpstream || '127.0.0.1:3002'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-neutral-400">
                  {t.admin.greenSlot.status}
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
                    {t.admin.greenSlot.switchTo}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.admin.actions.title}</CardTitle>
              <CardDescription className="text-xs">
                {t.admin.actions.desc}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 items-center">
              <Button
                variant="emerald"
                disabled={switchMutation.isPending}
                onClick={() => switchMutation.mutate(standbySlot)}
              >
                {switchMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRightLeft className="w-4 h-4 mr-2" />}
                {t.admin.actions.promoteStandby.replace('{slot}', standbySlot.toUpperCase())}
              </Button>

              <Button
                variant="danger"
                disabled={rollbackMutation.isPending}
                onClick={() => rollbackMutation.mutate()}
              >
                {rollbackMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                {t.admin.actions.rollback}
              </Button>
            </CardContent>
          </Card>

          {/* Deployment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.admin.audit.title}</CardTitle>
              <CardDescription className="text-xs">
                {t.admin.audit.desc}
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

      {/* TAB: PROJECTS MANAGER */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{t.admin.projectsManager.title}</h2>
            <Button variant="emerald" size="sm" onClick={() => setIsCreatingProject(!isCreatingProject)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {isCreatingProject ? t.admin.projectsManager.cancelBtn : t.admin.projectsManager.addBtn}
            </Button>
          </div>

          {/* Project creation form */}
          {isCreatingProject && (
            <Card className="border border-emerald/30 bg-emerald/5">
              <CardHeader>
                <CardTitle className="text-base">Crea Nuovo Progetto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Titolo Progetto</label>
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
                  <label className="text-xs text-neutral-400 block mb-1">Sommario (Breve descrizione)</label>
                  <input
                    className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                    value={newProject.summary}
                    onChange={(e) => setNewProject({ ...newProject, summary: e.target.value })}
                    placeholder="Short overview..."
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Descrizione Completa</label>
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
                    <label className="text-xs text-neutral-400 block mb-1">Categoria</label>
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
                  {t.admin.projectsManager.saveBtn}
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

      {/* TAB: STATIC ASSETS & CV UPLOAD */}
      {activeTab === 'assets' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.admin.assetsManager.title}</CardTitle>
            <CardDescription className="text-xs">
              {t.admin.assetsManager.desc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center space-y-4 hover:border-emerald/40 transition-colors">
              <UploadCloud className="w-10 h-10 mx-auto text-emerald-light" />
              <div>
                <p className="text-sm font-medium text-white">{t.admin.assetsManager.uploadPrompt}</p>
                <p className="text-xs text-neutral-400 mt-1">{t.admin.assetsManager.uploadDetails}</p>
              </div>
              <input
                type="file"
                className="hidden"
                id="file-upload-input"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload-input">
                <span className="inline-block px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer border border-white/10 font-medium">
                  {t.admin.assetsManager.browseBtn}
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
