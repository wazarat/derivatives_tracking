"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { 
  BarChart3, 
  Home, 
  LineChart, 
  MessageSquare, 
  PieChart, 
  Settings, 
  User
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/metrics",
      label: "Metrics",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
      active: pathname === "/metrics" || (pathname && pathname.startsWith("/metrics/")),
    },
    {
      href: "/portfolio",
      label: "Portfolio",
      icon: <PieChart className="mr-2 h-4 w-4" />,
      active: pathname === "/portfolio" || (pathname && pathname.startsWith("/portfolio/")),
    },
    {
      href: "/research",
      label: "Research",
      icon: <LineChart className="mr-2 h-4 w-4" />,
      active: pathname === "/research" || (pathname && pathname.startsWith("/research/")),
    },
    {
      href: "/feedback",
      label: "Feedback",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
      active: pathname === "/feedback",
    },
  ];

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            route.active
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {route.icon}
          {route.label}
        </Link>
      ))}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/metrics",
      label: "Metrics",
      icon: <BarChart3 className="h-5 w-5" />,
      active: pathname === "/metrics" || (pathname && pathname.startsWith("/metrics/")),
    },
    {
      href: "/portfolio",
      label: "Portfolio",
      icon: <PieChart className="h-5 w-5" />,
      active: pathname === "/portfolio" || (pathname && pathname.startsWith("/portfolio/")),
    },
    {
      href: "/research",
      label: "Research",
      icon: <LineChart className="h-5 w-5" />,
      active: pathname === "/research" || (pathname && pathname.startsWith("/research/")),
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      active: pathname === "/settings",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
      <div className="grid h-full grid-cols-5">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-col items-center justify-center",
              route.active
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {route.icon}
            <span className="text-xs mt-1">{route.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function UserNav() {
  return (
    <div className="flex items-center gap-4">
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
