'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { trackEvent } from '@/services/analyticsService';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Global error caught:', error);
    
    // Track error in analytics
    trackEvent('global_error', {
      error: error.toString(),
      digest: error.digest,
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
            
            <p className="text-muted-foreground">
              We apologize for the inconvenience. Our team has been notified of this issue.
            </p>
            
            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={reset} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Return home
                </Link>
              </Button>
            </div>
            
            {process.env.NODE_ENV !== 'production' && (
              <div className="mt-8 p-4 bg-muted rounded-md text-left overflow-auto max-h-[300px]">
                <p className="font-mono text-sm">{error.message}</p>
                {error.stack && (
                  <pre className="mt-2 font-mono text-xs whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
