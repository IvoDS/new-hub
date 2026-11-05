import type { Metadata } from 'next';
import '@/styles/globals.css';
import { QueryProvider } from '@/lib/queryProvider';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Ivan De Stefani | Personal Hub & Deployment Manager',
  description: 'Full Stack Engineer & Cloud Architect portfolio and deployment manager with zero-downtime Blue/Green releases.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7] antialiased selection:bg-emerald selection:text-black">
        <QueryProvider>
          <div className="relative min-h-screen flex flex-col justify-between">
            <Navigation />
            <main className="flex-1">{children}</main>
            <footer className="w-full glass-panel border-t border-white/5 py-8 px-6 text-center text-xs text-neutral-500 font-mono">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <span>© {new Date().getFullYear()} Ivan De Stefani. All rights reserved.</span>
                <span>Zero-Downtime Blue/Green Deployment Hub • Powered by Next.js, Fastify & Caddy</span>
              </div>
            </footer>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
