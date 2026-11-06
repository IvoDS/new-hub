export interface CompetencyItem {
  id: string;
  textIt: string;
  textEn: string;
}

export interface CompetencySection {
  id: string;
  titleIt: string;
  titleEn: string;
  accent: 'sapphire' | 'emerald';
  icon: 'globe' | 'server' | 'zap' | 'cpu';
  items: CompetencyItem[];
}

export interface SiteHeroText {
  statusPillIt: string;
  statusPillEn: string;
  helloIt: string;
  helloEn: string;
  fullName: string;
  headlineIt: string;
  headlineEn: string;
  bioIt: string;
  bioEn: string;
}

export interface SiteContent {
  id: string;
  hero: SiteHeroText;
  competencies: CompetencySection[];
  updatedAt?: string;
}

export type UpdateSiteContentInput = Partial<Omit<SiteContent, 'id' | 'updatedAt'>>;

export const DEFAULT_SITE_CONTENT: Omit<SiteContent, 'id' | 'updatedAt'> = {
  hero: {
    statusPillIt: 'Architettura Blue/Green a Zero Downtime',
    statusPillEn: 'Zero-Downtime Blue/Green Architecture',
    helloIt: 'Ciao, sono',
    helloEn: 'Hello, I am',
    fullName: 'Ivan De Stefani',
    headlineIt: 'Full Stack Engineer & Cloud Architect',
    headlineEn: 'Full Stack Engineer & Cloud Architect',
    bioIt: 'Progetto sistemi distribuiti resilienti, firmware stabili e affidabili, applicazioni web ad alte prestazioni e pipeline di rilascio automatizzate a zero downtime con Caddy e Docker.',
    bioEn: 'Designing resilient distributed systems, robust embedded firmware, ultra-fast web applications, and automated zero-downtime deployment pipelines with Caddy and Docker.',
  },
  competencies: [
    {
      id: 'frontend',
      titleIt: 'Architettura Frontend',
      titleEn: 'Frontend Architecture',
      accent: 'sapphire',
      icon: 'globe',
      items: [
        { id: 'fe-1', textIt: 'React 19 & Next.js 15 (App Router)', textEn: 'React 19 & Next.js 15 (App Router)' },
        { id: 'fe-2', textIt: 'Tailwind CSS & UI Glassmorphism', textEn: 'Tailwind CSS & Glassmorphism UI' },
        { id: 'fe-3', textIt: 'TanStack Query (React Query)', textEn: 'TanStack Query (React Query)' },
        { id: 'fe-4', textIt: 'Transizioni fluide Framer Motion', textEn: 'Framer Motion Transitions' },
        { id: 'fe-5', textIt: 'TypeScript in Strict Mode', textEn: 'TypeScript Strict Mode' },
      ],
    },
    {
      id: 'backend',
      titleIt: 'Backend & API ad Alto Throughput',
      titleEn: 'Backend & High-Throughput APIs',
      accent: 'emerald',
      icon: 'server',
      items: [
        { id: 'be-1', textIt: 'Architettura REST con Node.js & Fastify', textEn: 'Node.js & Fastify REST Architecture' },
        { id: 'be-2', textIt: 'MariaDB & ORM Sequelize', textEn: 'MariaDB & Sequelize ORM' },
        { id: 'be-3', textIt: 'Autenticazione SSO OAuth & JWT', textEn: 'JWT & OAuth SSO Authentication' },
        { id: 'be-4', textIt: 'Validazione degli Schemi con Zod', textEn: 'Zod Schema Validation' },
        { id: 'be-5', textIt: 'Streaming Pipeline per File e Upload', textEn: 'Streaming File Pipeline' },
      ],
    },
    {
      id: 'devops',
      titleIt: 'DevOps & Rilasci a Zero Downtime',
      titleEn: 'DevOps & Zero-Downtime Deployment',
      accent: 'sapphire',
      icon: 'zap',
      items: [
        { id: 'do-1', textIt: 'Reverse Proxy Dinamico Caddy (Admin API)', textEn: 'Caddy Dynamic Reverse Proxy (Admin API)' },
        { id: 'do-2', textIt: 'Orchestrazione Container con Docker', textEn: 'Docker Container Orchestration' },
        { id: 'do-3', textIt: 'Deployment Blue/Green (Zero Downtime)', textEn: 'Blue/Green Deployment (Zero-Downtime)' },
        { id: 'do-4', textIt: 'CI/CD Automatizzato con GitHub Actions', textEn: 'GitHub Actions Automated CI/CD' },
        { id: 'do-5', textIt: 'Rollback Istantaneo su Health-check', textEn: 'Automated Health-check Rollbacks' },
      ],
    },
    {
      id: 'firmware',
      titleIt: 'Sistemi Embedded & Competenze Firmware',
      titleEn: 'Embedded Systems & Firmware Engineering',
      accent: 'emerald',
      icon: 'cpu',
      items: [
        { id: 'fw-1', textIt: 'Sviluppo Firmware C/C++ Bare-Metal & Modern C++', textEn: 'Bare-Metal C/C++ & Modern C++ Firmware' },
        { id: 'fw-2', textIt: 'Kernel Real-Time: FreeRTOS & Zephyr OS', textEn: 'Real-Time Kernels: FreeRTOS & Zephyr OS' },
        { id: 'fw-3', textIt: 'Microcontrollori: STM32 (ARM Cortex-M), ESP32, Nordic nRF', textEn: 'MCU Architectures: STM32 (ARM Cortex-M), ESP32, Nordic nRF' },
        { id: 'fw-4', textIt: 'Bus e Protocolli: CAN bus, I2C, SPI, UART, Modbus, MQTT', textEn: 'Buses & Protocols: CAN bus, I2C, SPI, UART, Modbus, MQTT' },
        { id: 'fw-5', textIt: 'Hardware Bring-up, Debugging JTAG/SWD & Analisi di Segnale', textEn: 'Hardware Bring-up, JTAG/SWD Debugging & Logic Analysis' },
      ],
    },
  ],
};
