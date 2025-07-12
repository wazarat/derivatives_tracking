// Notification service stub

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system',
  PRICE_ALERT = 'price_alert',
  PORTFOLIO = 'portfolio',
  SECURITY = 'security',
  PORTFOLIO_UPDATE = 'portfolio_update',
  MARKET_ALERT = 'market_alert',
  RISK_WARNING = 'risk_warning',
  YIELD_OPPORTUNITY = 'yield_opportunity',
  SYSTEM_UPDATE = 'system_update',
}

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export interface NotificationPreferences {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  emailFrequency?: 'immediate' | 'daily' | 'weekly';
  notifyOnPortfolioUpdates?: boolean;
  notifyOnMarketAlerts?: boolean;
  notifyOnRiskWarnings?: boolean;
  notifyOnYieldOpportunities?: boolean;
  notifyOnSystemUpdates?: boolean;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  emailEnabled: true,
  pushEnabled: true,
  emailFrequency: 'daily',
  notifyOnPortfolioUpdates: true,
  notifyOnMarketAlerts: true,
  notifyOnRiskWarnings: true,
  notifyOnYieldOpportunities: true,
  notifyOnSystemUpdates: true,
};

/**
 * Get notifications for a user
 * @param userId User ID
 * @returns Promise with user notifications
 */
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  // Stub implementation
  return [
    {
      id: '1',
      userId,
      title: 'Welcome to CanHav',
      message: 'Thank you for joining CanHav. Start exploring crypto markets now!',
      type: NotificationType.INFO,
      isRead: false,
      link: '/dashboard',
      createdAt: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: '2',
      userId,
      title: 'Bitcoin Price Alert',
      message: 'Bitcoin has increased by 5% in the last 24 hours.',
      type: NotificationType.PRICE_ALERT,
      isRead: true,
      link: '/markets/bitcoin',
      createdAt: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      id: '3',
      userId,
      title: 'Security Reminder',
      message: 'Remember to enable two-factor authentication for enhanced security.',
      type: NotificationType.SECURITY,
      isRead: false,
      link: '/settings/security',
      createdAt: new Date(Date.now() - 172800000) // 2 days ago
    }
  ];
};

/**
 * Mark a notification as read
 * @param notificationId Notification ID
 * @returns Promise with success status
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  // Stub implementation
  console.log(`Marking notification ${notificationId} as read`);
  return true;
};

/**
 * Mark all notifications as read for a user
 * @param userId User ID
 * @returns Promise with success status
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  // Stub implementation
  console.log(`Marking all notifications as read for user ${userId}`);
  return true;
};

/**
 * Get notification preferences for a user
 * @param userId User ID
 * @returns Promise with notification preferences
 */
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences> => {
  // Stub implementation
  console.log(`Getting notification preferences for user ${userId}`);
  return defaultNotificationPreferences;
};

/**
 * Save notification preferences for a user
 * @param userId User ID
 * @param preferences Notification preferences
 * @returns Promise with success status
 */
export const saveNotificationPreferences = async (
  userId: string, 
  preferences: NotificationPreferences
): Promise<boolean> => {
  // Stub implementation
  console.log(`Saving notification preferences for user ${userId}`, preferences);
  return true;
};

/**
 * Request browser notification permission
 * @returns Promise with boolean indicating if permission was granted
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  // Stub implementation
  console.log('Requesting notification permission');
  return true;
};
