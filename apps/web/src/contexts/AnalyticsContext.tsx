'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  initPostHog, 
  trackPageView, 
  identifyUser, 
  resetUser, 
  setUserConsent 
} from '@/services/analyticsService';

// Default consent state - can be stored in localStorage
const getInitialConsent = () => {
  if (typeof window === 'undefined') return false;
  
  const storedConsent = localStorage.getItem('analytics-consent');
  return storedConsent === 'true';
};

// Create context
type AnalyticsContextType = {
  hasConsent: boolean;
  setConsent: (consent: boolean) => void;
};

const AnalyticsContext = createContext<AnalyticsContextType>({
  hasConsent: false,
  setConsent: () => {},
});

export const useAnalytics = () => useContext(AnalyticsContext);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
    
    // Check for stored consent
    const initialConsent = getInitialConsent();
    if (initialConsent) {
      setHasConsent(true);
      setUserConsent(true);
    }
  }, []);

  // Track page views when route changes
  useEffect(() => {
    if (hasConsent) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams, hasConsent]);

  // Identify user when they log in
  useEffect(() => {
    if (hasConsent && user) {
      identifyUser(user.id, {
        email: user.email,
        created_at: (user as any).createdAt || new Date().toISOString(),
      });
    } else if (!user) {
      resetUser();
    }
  }, [user, hasConsent]);

  // Handle consent changes
  const setConsent = (consent: boolean) => {
    setHasConsent(consent);
    setUserConsent(consent);
    
    // Store consent preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics-consent', String(consent));
    }
  };

  return (
    <AnalyticsContext.Provider value={{ hasConsent, setConsent }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
