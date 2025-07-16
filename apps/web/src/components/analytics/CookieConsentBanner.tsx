'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useAnalytics } from '@/contexts/AnalyticsContext';

export function CookieConsentBanner() {
  const { hasConsent, setConsent } = useAnalytics();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Show banner if consent hasn't been given yet
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const hasSeenBanner = localStorage.getItem('has-seen-cookie-banner') === 'true';
        setIsVisible(!hasSeenBanner && hasConsent !== true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasConsent]);

  const handleAccept = () => {
    setConsent(true);
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('has-seen-cookie-banner', 'true');
    }
  };

  const handleDecline = () => {
    setConsent(false);
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('has-seen-cookie-banner', 'true');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('has-seen-cookie-banner', 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-background border-t shadow-lg">
      <div className="container flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium">Cookie Consent</h3>
          <p className="text-sm text-muted-foreground mt-1">
            We use cookies to improve your experience and analyze website traffic. 
            By clicking "Accept", you agree to our website's cookie use as described in our Privacy Policy.
          </p>
        </div>
        <div className="flex items-center gap-2 self-end md:self-center">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
