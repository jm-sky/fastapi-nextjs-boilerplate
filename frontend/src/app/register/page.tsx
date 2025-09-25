// Register page

import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';
import { getPageTitle, getPageDescription } from '@/lib/app.config';

export const metadata: Metadata = {
  title: getPageTitle('Create Account'),
  description: getPageDescription('Create a new account to access our platform and start your journey with us.'),
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join us today and get started</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}