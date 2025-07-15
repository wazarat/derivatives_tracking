declare module '@radix-ui/react-dialog' {
  import * as React from 'react';

  // Define the types for Radix UI Dialog
  export const Root: React.FC<React.ComponentProps<'div'>>;
  export const Trigger: React.FC<React.ComponentProps<'button'>>;
  export const Portal: React.FC<React.ComponentProps<'div'>>;
  export const Overlay: React.FC<React.ComponentProps<'div'>> & {
    displayName: string;
  };
  export const Content: React.FC<React.ComponentProps<'div'>> & {
    displayName: string;
  };
  export const Close: React.FC<React.ComponentProps<'button'>>;
  export const Title: React.FC<React.ComponentProps<'h2'>> & {
    displayName: string;
  };
  export const Description: React.FC<React.ComponentProps<'p'>> & {
    displayName: string;
  };
}
