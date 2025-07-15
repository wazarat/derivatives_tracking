declare module '@/components/ui/dialog' {
  import * as React from 'react';

  export interface DialogProps {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
  }

  export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
  }

  export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    children: React.ReactNode;
  }

  export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    children?: React.ReactNode;
  }

  export const Dialog: React.FC<DialogProps>;
  export const DialogTrigger: React.FC<DialogTriggerProps>;
  export const DialogContent: React.FC<DialogContentProps>;
  export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
  export const DialogClose: React.FC<DialogCloseProps>;
  export const DialogPortal: React.FC<{ children: React.ReactNode }>;
  export const DialogOverlay: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}
