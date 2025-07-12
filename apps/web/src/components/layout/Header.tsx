'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { AccessibilityMenu } from '@/components/accessibility/AccessibilityMenu';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Define simple avatar components inline to avoid import issues
const Avatar = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ''}`} {...props} />
);

const AvatarImage = ({ src, alt = '', className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img src={src} alt={alt} className={`aspect-square h-full w-full ${className || ''}`} {...props} />
);

const AvatarFallback = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 ${className || ''}`} {...props} />
);

import { 
  BarChart3, 
  Home, 
  LayoutDashboard, 
  LogOut, 
  PieChart, 
  Settings, 
  TrendingUp, 
  User,
  LineChart
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Navigation items
  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: <Home className="h-4 w-4 mr-2" />
    },
    {
      name: 'Assets',
      href: '/assets',
      icon: <BarChart3 className="h-4 w-4 mr-2" />
    },
    {
      name: 'Metrics',
      href: '/metrics',
      icon: <LineChart className="h-4 w-4 mr-2" />
    },
    {
      name: 'Portfolios',
      href: '/portfolios',
      icon: <PieChart className="h-4 w-4 mr-2" />
    },
    {
      name: 'Trending',
      href: '/trending',
      icon: <TrendingUp className="h-4 w-4 mr-2" />
    }
  ];

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.email) return '?';
    
    const email = user.email;
    const nameParts = email.split('@')[0].split(/[._-]/);
    
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    
    return nameParts[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">CanHav</span>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="ml-auto flex items-center space-x-4">
          {/* Accessibility Menu */}
          <AccessibilityMenu />
          
          {/* Notification Dropdown */}
          <NotificationDropdown />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(user as any).user_metadata?.avatar_url} alt={user.email || ''} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notifications/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Notification Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
