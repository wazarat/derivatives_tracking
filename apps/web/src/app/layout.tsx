import React from 'react';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '../components/ui/toaster';
import { AuthProvider } from '../contexts/AuthContext';
import { Header } from '../components/layout/Header';
import { cn } from '../lib/utils';
import '../styles/globals.css';
import '../styles/accessibility.css';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import { CookieConsentBanner } from '../components/analytics/CookieConsentBanner';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CanHav - Crypto Yield Portfolio Builder',
  description: 'Build, manage, and share crypto yield portfolios with risk-adjusted returns',
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  themeColor: '#0f172a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CanHav',
  },
};

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}

function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CanHav" />
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
        <ClerkProvider
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              card: "bg-card shadow-md rounded-lg border border-border",
              socialButtonsBlockButton: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            }
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AnalyticsProvider>
              <AuthProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <footer className="border-t py-6">
                    <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                      <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        {new Date().getFullYear()} CanHav. All rights reserved.
                      </p>
                      <div className="flex items-center gap-4">
                        <a 
                          href="/terms" 
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          Terms
                        </a>
                        <a 
                          href="/privacy" 
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          Privacy
                        </a>
                      </div>
                    </div>
                  </footer>
                </div>
                <Toaster />
                <CookieConsentBanner />
              </AuthProvider>
            </AnalyticsProvider>
          </ThemeProvider>
        </ClerkProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
