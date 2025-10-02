'use client';

// Register form component with validation and loading states

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth.context';
import { getErrorMessage } from '@/lib/error.guards';
import { RegisterSchema, type RegisterFormData } from '@/lib/validations';
import { AUTH_CONFIG } from '@/lib/auth.config';
import Link from 'next/link';

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onBlur', // Enable validation on blur
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setSuccess(null);

    try {
      // Execute reCAPTCHA verification
      let recaptchaToken: string | undefined;
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha('register');
      }

      await registerUser({
        ...data,
        recaptchaToken,
      });

      // Check if registration auto-logs the user in or not
      // If it auto-logs in, redirect to dashboard
      // If not, redirect to login with success message
      setSuccess('Registration successful! Redirecting...');

      // Give user time to see success message
      setTimeout(() => {
        router.push(AUTH_CONFIG.loginRedirect); // Default to dashboard
      }, 1500);

    } catch (error: unknown) {
      // Use type-safe error handling
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
    }
  };

  // Consolidate loading states: prioritize auth context loading, then form submission
  const isFormLoading = isLoading || isSubmitting;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Create a new account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              disabled={isFormLoading}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={isFormLoading}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isFormLoading}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Password must contain at least 8 characters with uppercase, lowercase, digit, and special character
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isFormLoading}>
            {isLoading ? 'Creating account...' : isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              disabled={isFormLoading}
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}