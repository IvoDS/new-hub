import type { Metadata } from 'next';
import '@/styles/globals.css';
import { QueryProvider } from '@/lib/queryProvider';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

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
        <LanguageProvider>
          <QueryProvider>
            <div className="relative min-h-screen flex flex-col justify-between">
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </QueryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
