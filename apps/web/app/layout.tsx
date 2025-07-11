import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../src/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "../components/theme-provider";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { Toaster } from "../components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CanHav - Cryptocurrency Research and Analytics Platform",
    template: "%s | CanHav",
  },
  description: "Advanced cryptocurrency research and analytics platform for traders and investors",
  keywords: [
    "cryptocurrency",
    "crypto",
    "research",
    "analytics",
    "trading",
    "investment",
    "bitcoin",
    "ethereum",
    "blockchain",
    "defi",
    "market data",
  ],
  authors: [
    {
      name: "CanHav Team",
      url: "https://canhav.com",
    },
  ],
  creator: "CanHav",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://canhav.com",
    title: "CanHav - Cryptocurrency Research and Analytics Platform",
    description: "Advanced cryptocurrency research and analytics platform for traders and investors",
    siteName: "CanHav",
  },
  twitter: {
    card: "summary_large_image",
    title: "CanHav - Cryptocurrency Research and Analytics Platform",
    description: "Advanced cryptocurrency research and analytics platform for traders and investors",
    creator: "@canhav",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
