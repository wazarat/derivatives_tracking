'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuFooter
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Notification, 
  getUserNotifications, 
  markAllNotificationsAsRead, 
  markNotificationAsRead,
  requestNotificationPermission
} from '@/services/notificationService';

export function NotificationDropdown() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Load notifications when dropdown opens
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user || !isOpen) return;
      
      setIsLoading(true);
      try {
        const userNotifications = await getUserNotifications(user.id);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [user, isOpen]);

  // Request notification permission when component mounts
  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user]);

  // Handle marking a notification as read
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.id) return;
    
    // Navigate to link if provided
    if (notification.link) {
      router.push(notification.link);
    }
    
    // Mark as read if not already
    if (!notification.isRead) {
      const success = await markNotificationAsRead(notification.id);
      if (success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      }
    }
    
    setIsOpen(false);
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    setIsMarkingAllRead(true);
    try {
      const success = await markAllNotificationsAsRead(user.id);
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast({
          title: 'All notifications marked as read',
          description: 'Your notifications have been updated',
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive',
      });
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  // Format notification date
  const formatNotificationDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than a minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than a week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Format as date
    return date.toLocaleDateString();
  };

  // Get icon for notification type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'portfolio_update':
        return <div className="h-2 w-2 rounded-full bg-blue-500" />;
      case 'market_alert':
        return <div className="h-2 w-2 rounded-full bg-yellow-500" />;
      case 'risk_warning':
        return <div className="h-2 w-2 rounded-full bg-red-500" />;
      case 'yield_opportunity':
        return <div className="h-2 w-2 rounded-full bg-green-500" />;
      case 'system_update':
        return <div className="h-2 w-2 rounded-full bg-purple-500" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-500" />;
    }
  };

  // If no user, don't show the component
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllRead || unreadCount === 0}
            >
              {isMarkingAllRead ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Check className="h-3 w-3 mr-1" />
              )}
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No notifications yet
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start p-3 cursor-pointer ${
                  !notification.isRead ? 'bg-muted/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNotificationDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        
        <DropdownMenuFooter className="text-xs text-center text-muted-foreground py-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full h-8 text-xs"
            onClick={() => router.push('/notifications')}
          >
            View all notifications
          </Button>
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
