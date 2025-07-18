"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bitcoin, Menu, X } from "lucide-react";

import dynamic from "next/dynamic";
import { useAuth } from "@clerk/nextjs";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function SiteHeader() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  const routes = [
    {
      href: "/research",
      label: "Research",
      active: pathname === "/research",
    },
    {
      href: "/watchlist",
      label: "Watchlist",
      active: pathname === "/watchlist",
    },
    {
      href: "/portfolio",
      label: "Portfolio",
      active: pathname === "/portfolio",
    },
    {
      href: "/chatbot",
      label: "AI Assistant",
      active: pathname === "/chatbot",
    },
    {
      href: "/analytics",
      label: "Analytics",
      active: pathname === "/analytics",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          {isSignedIn ? (
            <div className="flex items-center space-x-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 400 120" 
                width="120" 
                height="40" 
                className="h-8 w-auto"
              >
                <defs>
                  <linearGradient id="canhavGradientSiteHeader" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#0066CC', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: '#4D4DFF', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#8A2BE2', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <text x="20" y="80" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="bold" fill="url(#canhavGradientSiteHeader)">
                  canhav
                </text>
              </svg>
            </div>
          ) : (
            <Link href="/" className="flex items-center space-x-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 400 120" 
                width="120" 
                height="40" 
                className="h-8 w-auto"
              >
                <defs>
                  <linearGradient id="canhavGradientSiteHeaderLink" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#0066CC', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: '#4D4DFF', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#8A2BE2', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <text x="20" y="80" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="bold" fill="url(#canhavGradientSiteHeaderLink)">
                  canhav
                </text>
              </svg>
            </Link>
          )}
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <div className="flex items-center space-x-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80",
                  route.active
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                {route.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <UserButton afterSignOutUrl="/" />
          </div>
        </nav>
        
        {/* Mobile Navigation */}
        <div className="flex flex-1 items-center justify-end md:hidden">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
          <Sheet>
            <SheetTrigger className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      route.href === pathname
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                    onClick={() => {}}
                  >
                    {route.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
