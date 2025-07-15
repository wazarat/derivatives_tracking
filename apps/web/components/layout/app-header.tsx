"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MainNav, UserNav } from "../../components/navigation/main-nav";
import { ModeToggle } from "../../components/theme/mode-toggle";
import { Button } from "../../components/ui/button";
import { Search } from "lucide-react";

interface AppHeaderProps {
  showMobileNav?: boolean;
}

export function AppHeader({ showMobileNav = true }: AppHeaderProps) {
  const pathname = usePathname();
  
  // Don't show the header on the landing page
  if (pathname === "/") {
    return null;
  }
  
  // Don't show the header on auth pages
  if (pathname && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">CanHav</span>
          </Link>
          <div className="hidden md:flex">
            <MainNav />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search assets..."
              className="rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[200px]"
            />
          </div>
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
