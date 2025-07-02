import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

// Types for notifications
export type NotificationType = 
  | 'portfolio_update'  // When portfolio metrics change significantly
  | 'market_alert'      // Market condition alerts
  | 'risk_warning'      // Risk level changes
  | 'yield_opportunity' // New yield opportunities
  | 'system_update';    // System updates and announcements

export interface Notification {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  emailFrequency: 'immediate' | 'daily' | 'weekly';
  notifyOnPortfolioUpdates: boolean;
  notifyOnMarketAlerts: boolean;
  notifyOnRiskWarnings: boolean;
  notifyOnYieldOpportunities: boolean;
  notifyOnSystemUpdates: boolean;
}

// Default notification preferences
export const defaultNotificationPreferences: NotificationPreferences = {
  userId: '',
  emailEnabled: true,
  pushEnabled: true,
  emailFrequency: 'daily',
  notifyOnPortfolioUpdates: true,
  notifyOnMarketAlerts: true,
  notifyOnRiskWarnings: true,
  notifyOnYieldOpportunities: true,
  notifyOnSystemUpdates: true
};

/**
 * Save a notification to the database
 */
export const saveNotification = async (notification: Notification): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        is_read: notification.isRead,
        created_at: notification.createdAt.toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving notification:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      isRead: data.is_read,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error saving notification:', error);
    return null;
  }
};

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      type: item.type,
      title: item.title,
      message: item.message,
      link: item.link,
      isRead: item.is_read,
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

/**
 * Get notification preferences for a user
 */
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences> => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching notification preferences:', error);
      // Return default preferences if none exist
      return { ...defaultNotificationPreferences, userId };
    }

    return {
      userId: data.user_id,
      emailEnabled: data.email_enabled,
      pushEnabled: data.push_enabled,
      emailFrequency: data.email_frequency,
      notifyOnPortfolioUpdates: data.notify_on_portfolio_updates,
      notifyOnMarketAlerts: data.notify_on_market_alerts,
      notifyOnRiskWarnings: data.notify_on_risk_warnings,
      notifyOnYieldOpportunities: data.notify_on_yield_opportunities,
      notifyOnSystemUpdates: data.notify_on_system_updates
    };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return { ...defaultNotificationPreferences, userId };
  }
};

/**
 * Save notification preferences for a user
 */
export const saveNotificationPreferences = async (
  preferences: NotificationPreferences
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: preferences.userId,
        email_enabled: preferences.emailEnabled,
        push_enabled: preferences.pushEnabled,
        email_frequency: preferences.emailFrequency,
        notify_on_portfolio_updates: preferences.notifyOnPortfolioUpdates,
        notify_on_market_alerts: preferences.notifyOnMarketAlerts,
        notify_on_risk_warnings: preferences.notifyOnRiskWarnings,
        notify_on_yield_opportunities: preferences.notifyOnYieldOpportunities,
        notify_on_system_updates: preferences.notifyOnSystemUpdates
      });

    if (error) {
      console.error('Error saving notification preferences:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    return false;
  }
};

/**
 * Send a push notification to the browser
 */
export const sendPushNotification = async (
  title: string,
  options: NotificationOptions = {}
): Promise<boolean> => {
  try {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    // Check if permission is already granted
    if (Notification.permission === 'granted') {
      new Notification(title, options);
      return true;
    } 
    
    // Request permission if not denied
    else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        new Notification(title, options);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Create and send a notification (both in-app and push if enabled)
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
): Promise<boolean> => {
  try {
    // Get user preferences
    const preferences = await getNotificationPreferences(userId);
    
    // Check if this notification type is enabled
    let isEnabled = false;
    
    switch (type) {
      case 'portfolio_update':
        isEnabled = preferences.notifyOnPortfolioUpdates;
        break;
      case 'market_alert':
        isEnabled = preferences.notifyOnMarketAlerts;
        break;
      case 'risk_warning':
        isEnabled = preferences.notifyOnRiskWarnings;
        break;
      case 'yield_opportunity':
        isEnabled = preferences.notifyOnYieldOpportunities;
        break;
      case 'system_update':
        isEnabled = preferences.notifyOnSystemUpdates;
        break;
    }
    
    if (!isEnabled) {
      return false;
    }
    
    // Save notification to database
    const notification = await saveNotification({
      userId,
      type,
      title,
      message,
      link,
      isRead: false,
      createdAt: new Date()
    });
    
    if (!notification) {
      return false;
    }
    
    // Send push notification if enabled
    if (preferences.pushEnabled) {
      await sendPushNotification(title, {
        body: message,
        icon: '/icons/notification-icon.png',
        data: { url: link }
      });
    }
    
    // Email would be sent via a server-side job based on emailFrequency
    // This would typically be handled by a backend service
    
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};
