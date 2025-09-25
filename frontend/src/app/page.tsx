import type { Metadata } from 'next';
import { getPageTitle, getPageDescription } from '@/lib/app.config';
import { Navigation, HeroSection, StatusSection, Footer } from '@/components/landing';

export const metadata: Metadata = {
  title: getPageTitle('Home'),
  description: getPageDescription('Modern SaaS application built with FastAPI and Next.js.'),
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <HeroSection />
        <StatusSection />
      </main>

      <Footer />
    </div>
  );
}
