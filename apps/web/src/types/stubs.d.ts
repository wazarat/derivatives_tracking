// Type stubs for UI libraries that don't ship with TypeScript declarations
// These can be replaced with proper types when the upstream packages publish them

// Radix UI components
declare module '@radix-ui/react-accordion';
declare module '@radix-ui/react-checkbox';
declare module '@radix-ui/react-dialog' {
  import * as React from 'react';
  
  export interface DialogPortalProps {
    children: React.ReactNode;
    container?: HTMLElement;
    forceMount?: boolean;
  }
}
declare module '@radix-ui/react-dropdown-menu';
declare module '@radix-ui/react-label';
declare module '@radix-ui/react-popover';
declare module '@radix-ui/react-progress';
declare module '@radix-ui/react-radio-group';
declare module '@radix-ui/react-scroll-area';
declare module '@radix-ui/react-select';
declare module '@radix-ui/react-slider';
declare module '@radix-ui/react-slot';
declare module '@radix-ui/react-switch';
declare module '@radix-ui/react-tabs';
declare module '@radix-ui/react-toast';
declare module '@radix-ui/react-tooltip';

// Analytics and AI services
declare module 'posthog-js';
declare module 'openai';
