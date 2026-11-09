import { connectDatabase } from '../config/database.js';
import { DEFAULT_SITE_CONTENT } from '@hub/shared';
import { ProjectModel, initProjectModel } from './ProjectModel.js';
import { ProfileModel, initProfileModel } from './ProfileModel.js';
import { DeploymentModel, initDeploymentModel } from './DeploymentModel.js';
import { SiteContentModel, initSiteContentModel } from './SiteContentModel.js';

export function initializeModels() {
  initProjectModel();
  initProfileModel();
  initDeploymentModel();
  initSiteContentModel();
}

export async function syncDatabase(force = false) {
  const db = await connectDatabase();
  initializeModels();
  await db.sync({ force, alter: false });

  // Seed default Profile if table is empty
  const profileCount = await ProfileModel.count();
  if (profileCount === 0) {
    await ProfileModel.create({
      fullName: 'Ivan De Stefani',
      headline: 'Full Stack Engineer & Cloud Architect',
      bio: 'Crafting resilient, high-performance web systems, cloud architectures, and developer tooling. Specializing in Node.js, React/Next.js, micro-frontends, and zero-downtime Blue/Green deployments.',
      avatarUrl: '/uploads/avatar-default.png',
      cvPdfUrl: '/uploads/ivan-de-stefani-cv.pdf',
      location: 'Milan, Italy',
      email: 'contact@ivandestefani.it',
      socialLinks: [
        { platform: 'github', url: 'https://github.com/IvoDS', label: 'GitHub' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/ivandestefani', label: 'LinkedIn' },
        { platform: 'website', url: 'https://ivandestefani.it', label: 'Portfolio' },
      ],
      skills: [
        { category: 'Frontend', items: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'TypeScript', 'TanStack Query'] },
        { category: 'Backend & APIs', items: ['Node.js', 'Fastify', 'Express', 'Sequelize', 'MariaDB', 'PostgreSQL', 'REST', 'GraphQL'] },
        { category: 'DevOps & Infrastructure', items: ['Docker', 'Caddy Reverse Proxy', 'GitHub Actions CI/CD', 'Blue/Green Deployments', 'Linux'] },
        { category: 'Firmware & Embedded', items: ['C/C++', 'FreeRTOS', 'STM32', 'ESP32', 'CAN bus', 'SPI/I2C/UART'] },
      ],
    });
  } else {
    // Migrate existing profile GitHub URL to IvoDS if needed
    const existingProfile = await ProfileModel.findOne();
    if (existingProfile && existingProfile.socialLinks) {
      let changed = false;
      const updatedLinks = existingProfile.socialLinks.map((link) => {
        if (link.platform === 'github' && link.url.includes('github.com/ivandestefani')) {
          changed = true;
          return { ...link, url: 'https://github.com/IvoDS' };
        }
        return link;
      });
      if (changed) {
        await existingProfile.update({ socialLinks: updatedLinks });
      }
    }
  }

  // Seed SiteContent if table is empty
  const contentCount = await SiteContentModel.count();
  if (contentCount === 0) {
    await SiteContentModel.create({
      hero: DEFAULT_SITE_CONTENT.hero,
      competencies: DEFAULT_SITE_CONTENT.competencies,
    });
  }

  // Seed initial Projects if table is empty
  const projectsCount = await ProjectModel.count();
  if (projectsCount === 0) {
    await ProjectModel.bulkCreate([
      {
        title: 'Hub Personale & Deployment Manager',
        slug: 'hub-personale',
        summary: 'Custom portfolio hub and live deployment orchestrator with zero-downtime Blue/Green traffic switching via Caddy REST API.',
        description: 'An integrated personal hub combining a glassmorphic portfolio presentation layer with an internal deployment management control panel. Features dynamic upstream routing, instant rollbacks, and Docker container lifecycle tracking.',
        category: 'cloud',
        tags: ['Next.js', 'Fastify', 'MariaDB', 'Caddy', 'Docker', 'Blue/Green'],
        featured: true,
        order: 1,
        published: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        githubUrl: 'https://github.com/IvoDS/new-hub',
        demoUrl: 'https://ivandestefani.it',
      },
      {
        title: 'Agentic Workflow Engine',
        slug: 'agentic-workflow-engine',
        summary: 'Autonomous AI coding agent orchestrator with multi-step planning and automated verification loops.',
        description: 'High-throughput agent framework executing code transformations, automated regression suites, and reactive notifications.',
        category: 'ai',
        tags: ['TypeScript', 'Fastify', 'LLM Agents', 'Automation'],
        featured: true,
        order: 2,
        published: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        githubUrl: 'https://github.com/IvoDS',
      },
      {
        title: 'Cloud Edge Reverse Proxy Controller',
        slug: 'cloud-edge-proxy',
        summary: 'Ultra-low latency dynamic reverse proxy management interface built on modern Caddy HTTP API.',
        description: 'Enables programmatic TLS provisioning, health-checked canary releases, and weighted traffic splitting for distributed web applications.',
        category: 'tooling',
        tags: ['Go', 'Caddy', 'Networking', 'Reverse Proxy'],
        featured: false,
        order: 3,
        published: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
        githubUrl: 'https://github.com/IvoDS',
      },
    ]);
  } else {
    // Migrate existing projects GitHub URLs to IvoDS
    const allProjects = await ProjectModel.findAll();
    for (const p of allProjects) {
      if (p.githubUrl && p.githubUrl.includes('github.com/ivandestefani')) {
        const updated = p.githubUrl.replace('github.com/ivandestefani', 'github.com/IvoDS');
        await p.update({ githubUrl: updated });
      }
    }
  }

  // Seed initial Deployment record
  const deploymentCount = await DeploymentModel.count();
  if (deploymentCount === 0) {
    await DeploymentModel.create({
      projectName: 'Hub Web App',
      repository: 'IvoDS/new-hub',
      branch: 'main',
      commitHash: 'a1b2c3d',
      commitMessage: 'feat: initialize personal hub and deployment manager',
      imageTag: 'ivandestefani-hub:v1.0.0-blue',
      slot: 'blue',
      status: 'active',
      upstreamUrl: '127.0.0.1:3001',
      deployedAt: new Date().toISOString(),
      activatedAt: new Date().toISOString(),
      approvedBy: 'Ivan De Stefani',
    });
  }

  return db;
}

export { ProjectModel, ProfileModel, DeploymentModel, SiteContentModel };
