'use client';

import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/auth.context';
import Link from 'next/link';

export function HeroSection() {
  const t = useTranslations('HomePage');
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="inline-block">
          <span className="inline-block w-2 h-2 bg-sky-400 rounded-full animate-pulse mr-2"></span>
          <span className="text-sm font-medium text-sky-600 uppercase tracking-wide">
            Modern SaaS Platform
          </span>
        </div>
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
        Welcome to{' '}
        <span className="bg-gradient-to-r from-sky-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
          SaaS Boilerplate
        </span>
      </h1>

      <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
        {t('subtitle') || 'Modern SaaS application built with FastAPI and Next.js. Get started in minutes with authentication, dashboard, and enterprise-grade features.'}
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
        {!isLoading && (
          <>
            {isAuthenticated ? (
              <Button
                variant="gradient"
                size="lg"
                className="px-10 py-4 text-lg"
                asChild
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="gradient"
                  size="lg"
                  className="px-10 py-4 text-lg"
                  asChild
                >
                  <Link href="/register">Get Started Free</Link>
                </Button>
                <Button
                  variant="gradient-outline"
                  size="lg"
                  className="px-10 py-4 text-lg"
                  asChild
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}