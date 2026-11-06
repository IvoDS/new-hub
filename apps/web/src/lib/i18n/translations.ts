export type Locale = 'en' | 'it';

const rawTranslations = {
  en: {
    nav: {
      portfolio: 'Portfolio',
      projects: 'Projects',
      architecture: 'Architecture',
      activeSlot: 'Active Slot',
      adminHub: 'Admin Hub',
      exitAdmin: 'Exit Admin',
      langSwitch: 'Switch to Italian',
    },
    hero: {
      statusPill: 'Zero-Downtime Blue/Green Architecture',
      hello: 'Hello, I am',
      headline: 'Full Stack Engineer & Cloud Architect',
      bio: 'Designing resilient distributed systems, stable and reliable firmware, ultra-fast web applications, and automated zero-downtime deployment pipelines.',
      exploreShowcase: 'Explore Showcase',
      downloadCv: 'Download Curriculum',
      github: 'GitHub',
    },
    projects: {
      tagline: 'Showcase',
      title: 'Selected Works & Architecture',
      categories: {
        all: 'All Projects',
        cloud: 'Cloud & Infrastructure',
        ai: 'AI & Agents',
        web: 'Web Systems',
        tooling: 'Developer Tooling',
      },
      featured: 'Featured',
      code: 'Code',
      live: 'Live Demo',
      loading: 'Loading projects from backend API...',
      empty: "No projects in category '{category}'.",
    },
    skills: {
      tagline: 'Core Competencies',
      title: 'Engineered for Resilience & Speed',
      description: 'A battle-tested stack combining modern reactive frontends, lightweight async backends, and robust containerized infrastructure.',
      domains: {
        frontend: {
          title: 'Frontend Architecture',
          items: [
            'React 19 & Next.js 15 (App Router)',
            'Tailwind CSS & Glassmorphism UI',
            'TanStack Query (React Query)',
            'Framer Motion Transitions',
            'TypeScript Strict Mode',
          ],
        },
        backend: {
          title: 'Backend & High-Throughput APIs',
          items: [
            'Node.js & Fastify REST Architecture',
            'MariaDB & Sequelize ORM',
            'JWT & OAuth SSO Authentication',
            'Zod Schema Validation',
            'Streaming File Pipeline',
          ],
        },
        devops: {
          title: 'DevOps & Zero-Downtime Deployment',
          items: [
            'Caddy Dynamic Reverse Proxy (Admin API)',
            'Docker Container Orchestration',
            'Blue/Green Deployment (Zero-Downtime)',
            'GitHub Actions Automated CI/CD',
            'Automated Health-check Rollbacks',
          ],
        },
      },
    },
    admin: {
      title: 'Admin & Deployment Manager',
      subtitle: 'Zero-downtime routing controller & content management interface for ivandestefani.it',
      devMode: 'Dev Admin Mode (Bypass Active)',
      tabs: {
        deployments: 'Blue/Green Controller',
        content: 'Site Texts & Competencies',
        projects: 'Projects Manager',
        assets: 'Static Assets & CV',
      },
      blueSlot: {
        title: 'Production Slot: Blue',
        activeTraffic: '● ACTIVE TRAFFIC',
        standby: '○ STANDBY',
        switchTo: 'Switch Live Traffic to Blue',
        status: 'Container status: Connected via Caddy reverse proxy.',
      },
      greenSlot: {
        title: 'Production Slot: Green',
        activeTraffic: '● ACTIVE TRAFFIC',
        standby: '○ STANDBY',
        switchTo: 'Switch Live Traffic to Green',
        status: 'Container status: Connected via Caddy reverse proxy.',
      },
      actions: {
        title: 'Deployment Switch Actions',
        desc: 'Executes atomic HTTP configuration switch via Caddy REST API with zero-downtime.',
        promoteStandby: 'Promote Standby Slot ({slot}) to Active',
        rollback: 'Trigger Instant Rollback',
      },
      audit: {
        title: 'Deployment Audit Trail',
        desc: 'Recent releases, switch commands, and gate approvals recorded in MariaDB.',
      },
      projectsManager: {
        title: 'Project Showcase Portfolio',
        addBtn: 'Add New Project',
        cancelBtn: 'Cancel',
        saveBtn: 'Save Project',
      },
      assetsManager: {
        title: 'Asset & Curriculum Manager',
        desc: 'Upload PDF resumes, portfolio assets, and project screenshots to persistent server volume.',
        uploadPrompt: 'Upload New File',
        uploadDetails: 'Accepts PDF, PNG, JPG up to 50MB',
        browseBtn: 'Browse File',
      },
    },
    footer: {
      rights: 'All rights reserved.',
      poweredBy: 'Zero-Downtime Blue/Green Deployment Hub • Powered by Next.js, Fastify & Caddy',
    },
  },
  it: {
    nav: {
      portfolio: 'Portfolio',
      projects: 'Progetti',
      architecture: 'Architettura',
      activeSlot: 'Slot Attivo',
      adminHub: 'Pannello Admin',
      exitAdmin: 'Esci da Admin',
      langSwitch: 'Passa all\'Inglese',
    },
    hero: {
      statusPill: 'Architettura Blue/Green a Zero Downtime',
      hello: 'Ciao, sono',
      headline: 'Full Stack Engineer & Cloud Architect',
      bio: 'Progetto sistemi distribuiti resilienti, firmware stabilili e affidabili, applicazioni web ad alte prestazioni e pipeline di rilascio automatizzate a zero downtime.',
      exploreShowcase: 'Esplora i Progetti',
      downloadCv: 'Scarica Curriculum',
      github: 'GitHub',
    },
    projects: {
      tagline: 'Vetrina',
      title: 'Progetti Selezionati & Architettura',
      categories: {
        all: 'Tutti i Progetti',
        cloud: 'Cloud & Infrastruttura',
        ai: 'AI & Agenti',
        web: 'Sistemi Web',
        tooling: 'Developer Tooling',
      },
      featured: 'In Evidenza',
      code: 'Codice',
      live: 'Demo Live',
      loading: 'Caricamento progetti dal backend API...',
      empty: "Nessun progetto nella categoria '{category}'.",
    },
    skills: {
      tagline: 'Competenze Chiave',
      title: 'Progettato per Resilienza e Velocità',
      description: 'Uno stack collaudato che unisce frontend reattivi moderni, backend asincroni leggeri e infrastruttura containerizzata robusta.',
      domains: {
        frontend: {
          title: 'Architettura Frontend',
          items: [
            'React 19 & Next.js 15 (App Router)',
            'Tailwind CSS & UI Glassmorphism',
            'TanStack Query (React Query)',
            'Transizioni fluide Framer Motion',
            'TypeScript in Strict Mode',
          ],
        },
        backend: {
          title: 'Backend & API ad Alto Throughput',
          items: [
            'Architettura REST con Node.js & Fastify',
            'MariaDB & ORM Sequelize',
            'Autenticazione SSO OAuth & JWT',
            'Validazione degli Schemi con Zod',
            'Streaming Pipeline per File e Upload',
          ],
        },
        devops: {
          title: 'DevOps & Rilasci a Zero Downtime',
          items: [
            'Reverse Proxy Dinamico Caddy (Admin API)',
            'Orchestrazione Container con Docker',
            'Deployment Blue/Green (Zero Downtime)',
            'CI/CD Automatizzato con GitHub Actions',
            'Rollback Istantaneo su Health-check',
          ],
        },
      },
    },
    admin: {
      title: 'Pannello di Amministrazione & Deployment Manager',
      subtitle: 'Centro di controllo routing a zero downtime e gestione contenuti dinamici per ivandestefani.it',
      devMode: 'Modalità Dev Admin (Bypass Attivo)',
      tabs: {
        deployments: 'Controller Blue/Green',
        content: 'Testi & Competenze',
        projects: 'Gestione Progetti',
        assets: 'Asset Statici & CV',
      },
      blueSlot: {
        title: 'Slot di Produzione: Blue',
        activeTraffic: '● TRAFFICO ATTIVO',
        standby: '○ IN STANDBY',
        switchTo: 'Devia Traffico su Blue',
        status: 'Stato container: Connesso tramite reverse proxy Caddy.',
      },
      greenSlot: {
        title: 'Slot di Produzione: Green',
        activeTraffic: '● TRAFFICO ATTIVO',
        standby: '○ IN STANDBY',
        switchTo: 'Devia Traffico su Green',
        status: 'Stato container: Connesso tramite reverse proxy Caddy.',
      },
      actions: {
        title: 'Comandi di Rilascio & Switch',
        desc: 'Esegue lo switch atomico della configurazione HTTP tramite API REST di Caddy a zero downtime.',
        promoteStandby: 'Promuovi lo Slot di Standby ({slot}) ad Attivo',
        rollback: 'Innesca Rollback Istantaneo',
      },
      audit: {
        title: 'Registro Storico Deployment',
        desc: 'Rilasci recenti, comandi di switch e approvazioni manuali registrate in MariaDB.',
      },
      projectsManager: {
        title: 'Portfolio Progetti',
        addBtn: 'Aggiungi Nuovo Progetto',
        cancelBtn: 'Annulla',
        saveBtn: 'Salva Progetto',
      },
      assetsManager: {
        title: 'Gestione Asset & Curriculum',
        desc: 'Carica curriculum in PDF, asset e immagini di copertina sul volume persistente del server.',
        uploadPrompt: 'Carica Nuovo File',
        uploadDetails: 'Supporta PDF, PNG, JPG fino a 50MB',
        browseBtn: 'Sfoglia File',
      },
    },
    footer: {
      rights: 'Tutti i diritti riservati.',
      poweredBy: 'Hub di Rilascio Blue/Green a Zero Downtime • Powered by Next.js, Fastify & Caddy',
    },
  },
} as const;

type DeepString<T> = {
  [K in keyof T]: T[K] extends readonly (infer _)[]
    ? readonly string[]
    : T[K] extends object
    ? DeepString<T[K]>
    : string;
};

type BaseTranslations = typeof rawTranslations['en'];
export type TranslationKeys = DeepString<BaseTranslations>;

export const translations: Record<Locale, TranslationKeys> = rawTranslations;
