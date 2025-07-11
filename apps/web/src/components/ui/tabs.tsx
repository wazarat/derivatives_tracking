import React from 'react';

// Tabs component
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, ...props }, ref) => {
    return <div ref={ref} className={`tabs ${className || ''}`} {...props} />;
  }
);
Tabs.displayName = 'Tabs';

// TabsList component
interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={`tabs-list ${className || ''}`} {...props} />;
  }
);
TabsList.displayName = 'TabsList';

// TabsTrigger component
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`tabs-trigger ${className || ''}`}
        data-value={value}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

// TabsContent component
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`tabs-content ${className || ''}`}
        data-value={value}
        {...props}
      />
    );
  }
);
TabsContent.displayName = 'TabsContent';
