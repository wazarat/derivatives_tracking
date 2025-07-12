'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Check, Cog, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { useToast } from '../../components/ui/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Notification, 
  NotificationType,
  getUserNotifications, 
  markAllNotificationsAsRead, 
  markNotificationAsRead 
} from '../../services/notificationService';

export default function NotificationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }
      
      setIsLoading(true);
      try {
        const userNotifications = await getUserNotifications(user.id);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notifications'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotifications();
  }, [user, router, toast]);

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
          description: 'Your notifications have been updated'
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read'
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

  // Get icon and color for notification type
  const getNotificationTypeInfo = (type: NotificationType) => {
    switch (type) {
      case NotificationType.PORTFOLIO:
        return { 
          icon: <div className="h-3 w-3 rounded-full bg-blue-500" />,
          label: 'Portfolio Update',
          color: 'bg-blue-500/10 text-blue-500'
        };
      case NotificationType.PRICE_ALERT:
        return { 
          icon: <div className="h-3 w-3 rounded-full bg-yellow-500" />,
          label: 'Market Alert',
          color: 'bg-yellow-500/10 text-yellow-500'
        };
      case NotificationType.WARNING:
        return { 
          icon: <div className="h-3 w-3 rounded-full bg-red-500" />,
          label: 'Risk Warning',
          color: 'bg-red-500/10 text-red-500'
        };
      case NotificationType.SUCCESS:
        return { 
          icon: <div className="h-3 w-3 rounded-full bg-green-500" />,
          label: 'Yield Opportunity',
          color: 'bg-green-500/10 text-green-500'
        };
      case NotificationType.SYSTEM:
        return { 
          icon: <div className="h-3 w-3 rounded-full bg-purple-500" />,
          label: 'System Update',
          color: 'bg-purple-500/10 text-purple-500'
        };
      default:
        return { 
          icon: <div className="h-3 w-3 rounded-full bg-gray-500" />,
          label: 'Notification',
          color: 'bg-gray-500/10 text-gray-500'
        };
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  // If not logged in, redirect to auth page
  if (!user && !isLoading) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead || notifications.filter(n => !n.isRead).length === 0}
          >
            {isMarkingAllRead ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Mark all as read
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href="/notifications/settings">
              <Cog className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="ml-2 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>
        
        <TabsContent value="unread" className="mt-0">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderNotificationsList(notificationsList: Notification[]) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading notifications...</span>
        </div>
      );
    }

    if (notificationsList.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === 'all' 
                ? "You don't have any notifications yet" 
                : "You don't have any unread notifications"}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {notificationsList.map((notification) => {
          const typeInfo = getNotificationTypeInfo(notification.type);
          
          return (
            <Card 
              key={notification.id} 
              className={`cursor-pointer transition-colors ${!notification.isRead ? 'bg-muted/50 border-primary/20' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {typeInfo.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium">{notification.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatNotificationDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{notification.message}</p>
                    {notification.link && (
                      <div className="mt-2">
                        <Button variant="link" size="sm" className="p-0 h-auto">
                          View details
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
}
