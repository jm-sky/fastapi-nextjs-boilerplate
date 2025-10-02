'use client';

import { Button } from '@/components/ui/button';
import { GoogleIcon } from '@/components/icons/google-icon';

interface GoogleLoginButtonProps {
  disabled?: boolean;
  variant?: 'login' | 'signup';
}

export function GoogleLoginButton({ disabled = false, variant = 'login' }: GoogleLoginButtonProps) {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/login`;
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={disabled}
      onClick={handleGoogleLogin}
    >
      <GoogleIcon className="mr-2 h-4 w-4" />
      {variant === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
    </Button>
  );
}
