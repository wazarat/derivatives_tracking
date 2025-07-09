'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode, useEffect } from 'react';
import { PostHogProvider } from 'posthog-js/react';
import posthog from 'posthog-js';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  
  // Initialize PostHog
  useEffect(() => {
    // Check if we're in the browser and if the PostHog key is available
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        // Enable debug mode in development
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug();
        },
        // Disable capturing by default in development
        capture_pageview: process.env.NODE_ENV === 'production',
        // Disable in development
        autocapture: process.env.NODE_ENV === 'production',
        // Disable local storage in development
        persistence: process.env.NODE_ENV === 'production' ? 'localStorage' : 'memory',
      });
    }
  }, []);

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <PostHogProvider client={posthog}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </PostHogProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
