import posthog from 'posthog-js';

// Initialize PostHog with environment variables
export const initPostHog = () => {
  // Only initialize in browser environment and if API key is available
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      // Enable debug mode in development
      debug: process.env.NODE_ENV !== 'production',
      // Disable capturing by default, enable after user consent
      capture_pageview: false,
      // Disable autocapture to control what we track
      autocapture: false,
      // Disable persistence in local storage until user consents
      persistence: 'memory',
      // Disable session recording by default
      session_recording: {
        enabled: false,
      },
    });
  }
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.capture('$pageview', { url });
  }
};

// Track custom events
export const trackEvent = (
  eventName: string, 
  properties?: Record<string, any>,
  options?: { sendImmediately?: boolean }
) => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.capture(eventName, properties, options);
  }
};

// Identify user
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.identify(userId, traits);
  }
};

// Reset user identity (for logout)
export const resetUser = () => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.reset();
  }
};

// Set user consent for tracking
export const setUserConsent = (consent: boolean) => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    if (consent) {
      // Enable tracking features when user consents
      posthog.opt_in_capturing();
      // Update configuration to persist data
      posthog.set_config({
        persistence: 'localStorage',
        capture_pageview: true,
      });
    } else {
      // Disable tracking when user doesn't consent
      posthog.opt_out_capturing();
    }
  }
};

// Track portfolio creation
export const trackPortfolioCreation = (portfolioId: string, assetCount: number) => {
  trackEvent('portfolio_created', { portfolioId, assetCount });
};

// Track asset view
export const trackAssetView = (assetId: string, assetName: string, sector: string) => {
  trackEvent('asset_viewed', { assetId, assetName, sector });
};

// Track notification interaction
export const trackNotificationInteraction = (notificationId: string, action: 'viewed' | 'clicked' | 'dismissed') => {
  trackEvent('notification_interaction', { notificationId, action });
};

// Track smart allocate usage
export const trackSmartAllocate = (inputParams: Record<string, any>, outputAssetCount: number) => {
  trackEvent('smart_allocate_used', { 
    inputParams,
    outputAssetCount,
  });
};

// Export PostHog instance for direct access if needed
export { posthog };
