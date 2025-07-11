import React from 'react';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastActionElement {
  altText: string;
  onClick: () => void;
  children?: React.ReactNode;
}

interface Toast extends ToastProps {
  id: string;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive';
}

type ToastActionType = (props: ToastProps) => void;

interface ToastContextValue {
  toast: ToastActionType;
  dismiss: (toastId?: string) => void;
}

export const useToast = (): ToastContextValue => {
  // Stub implementation
  const toast: ToastActionType = (props) => {
    console.log('Toast triggered:', props);
  };

  const dismiss = (toastId?: string) => {
    console.log('Toast dismissed:', toastId);
  };

  return {
    toast,
    dismiss,
  };
};
