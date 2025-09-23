import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import { QueryProvider } from '@/components/providers';
import { APP_CONFIG } from '@/lib/app.config';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.title,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  keywords: APP_CONFIG.keywords,
  authors: [{ name: APP_CONFIG.author }],
  creator: APP_CONFIG.author,
  publisher: APP_CONFIG.author,
  metadataBase: new URL(APP_CONFIG.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_CONFIG.url,
    title: APP_CONFIG.title,
    description: APP_CONFIG.description,
    siteName: APP_CONFIG.name,
    images: APP_CONFIG.ogImage ? [
      {
        url: APP_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: APP_CONFIG.name,
      },
    ] : undefined,
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.title,
    description: APP_CONFIG.description,
    images: APP_CONFIG.ogImage ? [APP_CONFIG.ogImage] : undefined,
  },
  icons: {
    icon: APP_CONFIG.favicon,
    shortcut: APP_CONFIG.favicon,
    apple: APP_CONFIG.favicon,
  },
  manifest: '/site.webmanifest',
  other: {
    'theme-color': APP_CONFIG.themeColor,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            {children}
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
