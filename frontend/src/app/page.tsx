'use client';

import { Button } from "@/components/ui/button";
import { HealthStatus } from "@/components/HealthStatus";
import { useTranslations } from 'next-intl';
import { useRouter } from "next/navigation";

export default function Home() {
  const t = useTranslations('HomePage');
  const router = useRouter();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        <HealthStatus />

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button
            type="button"
            variant="default"
            className="px-8"
            onClick={() => router.push('/login')}
          >
            {t('loginButton')}
          </Button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 text-xs hover:underline hover:underline-offset-4"
          href="https://dev-made.it"
          target="_blank"
          rel="noopener noreferrer"
        >
          &copy; 2025 DEV Made IT
        </a>
      </footer>
    </div>
  );
}
