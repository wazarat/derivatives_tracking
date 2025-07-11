"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bitcoin, Menu, X } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserButton } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function SiteHeader() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

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
          <Link href="/" className="flex items-center space-x-2">
            <Bitcoin className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">CanHav</span>
          </Link>
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
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col space-y-4 py-4">
                <Link
                  href="/"
                  className="flex items-center space-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Bitcoin className="h-6 w-6" />
                  <span className="font-bold">CanHav</span>
                </Link>
                <div className="flex flex-col space-y-3">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-foreground/80",
                        route.active
                          ? "text-foreground"
                          : "text-foreground/60"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {route.label}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
