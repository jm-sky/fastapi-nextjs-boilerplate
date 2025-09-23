// Login page

import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { getPageTitle, getPageDescription } from '@/lib/app.config';

export const metadata: Metadata = {
  title: getPageTitle('Sign In'),
  description: getPageDescription('Sign in to your account to access your dashboard and manage your settings.'),
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}