'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/auth.context';
import Link from 'next/link';

export function Navigation() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="border-b bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg"></div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
                SaaS Boilerplate
              </h1>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  // Authenticated user buttons
                  <>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => window.location.href = '/dashboard'}
                    >
                      Dashboard
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  // Unauthenticated user buttons
                  <>
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-sky-700" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button variant="default" size="sm" asChild>
                      <Link href="/register">Register</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}