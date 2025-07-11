'use client';

import React, { useState, useEffect } from 'react';
import { XCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  isVisible?: boolean;
  children?: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  isVisible = true,
  children,
  className = '',
}) => {
  const [visible, setVisible] = useState(isVisible);

  useEffect(() => {
    setVisible(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getToastClasses = () => {
    const baseClasses = "fixed bottom-4 right-4 flex items-center p-4 rounded-lg shadow-lg max-w-xs z-50 animate-slide-up";
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border border-green-200`;
      case 'error':
        return `${baseClasses} bg-red-50 border border-red-200`;
      case 'warning':
        return `${baseClasses} bg-amber-50 border border-amber-200`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-50 border border-blue-200`;
    }
  };

  return (
    <div className={`${getToastClasses()} ${className}`} role="alert">
      <div className="flex items-center">
        <div className="mr-3">{getIcon()}</div>
        <div className="text-sm font-medium">{message}</div>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg focus:ring-2 focus:ring-gray-300"
        aria-label="Close"
      >
        <XCircle className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const ToastTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="text-sm font-medium">{children}</div>;
};

export const ToastDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="text-sm opacity-90">{children}</div>;
};

export const ToastClose: React.FC = () => {
  return (
    <button
      className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg focus:ring-2 focus:ring-gray-300"
      aria-label="Close"
    >
      <XCircle className="h-4 w-4 text-gray-500" />
    </button>
  );
};

export const ToastViewport: React.FC = () => {
  return <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50" />;
};

export const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {children}
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType; duration: number }>>([]);

  const showToast = (message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
  };
};

export const StaleDataToast: React.FC<{ lastUpdated: Date | string | null; threshold?: number }> = ({ 
  lastUpdated, 
  threshold = 5 * 60 * 1000 // 5 minutes in milliseconds
}) => {
  const [isStale, setIsStale] = useState(false);
  
  useEffect(() => {
    if (!lastUpdated) {
      setIsStale(true);
      return;
    }
    
    const lastUpdatedTime = typeof lastUpdated === 'string' 
      ? new Date(lastUpdated).getTime() 
      : lastUpdated.getTime();
    
    const checkStale = () => {
      const now = new Date().getTime();
      const timeDiff = now - lastUpdatedTime;
      setIsStale(timeDiff > threshold);
    };
    
    // Check immediately
    checkStale();
    
    // Set up interval to check every minute
    const interval = setInterval(checkStale, 60000);
    
    return () => clearInterval(interval);
  }, [lastUpdated, threshold]);
  
  if (!isStale) return null;
  
  return (
    <Toast
      type="warning"
      message="Data may be stale. Last update was more than 5 minutes ago."
      duration={0} // Don't auto-dismiss stale data warnings
    />
  );
};
