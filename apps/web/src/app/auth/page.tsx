'use client';

import React from 'react';
import AuthForm from '../../components/auth/AuthForm';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect to portfolios if already logged in
  React.useEffect(() => {
    if (user && isLoaded) {
      router.push('/portfolios');
    }
  }, [user, isLoaded, router]);

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading...</h2>
        <p className="text-muted-foreground">Checking authentication status</p>
      </div>
    );
  }

  // If not logged in, show auth form
  if (!user) {
    return (
      <div className="container max-w-md py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to CanHav</h1>
          <p className="text-muted-foreground mt-2">
            Sign in or create an account to manage your crypto portfolios
          </p>
        </div>
        <AuthForm />
      </div>
    );
  }

  // This should not be reached due to the redirect, but just in case
  return null;
}
