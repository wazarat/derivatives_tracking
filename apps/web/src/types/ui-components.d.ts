declare module '@/components/ui/breadcrumb' {
  import * as React from 'react';

  export interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
    separator?: React.ReactNode;
    children: React.ReactNode;
  }

  export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
    href?: string;
    current?: boolean;
    children: React.ReactNode;
  }

  export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    asChild?: boolean;
    children: React.ReactNode;
  }

  export const Breadcrumb: React.FC<BreadcrumbProps>;
  export const BreadcrumbItem: React.FC<BreadcrumbItemProps>;
  export const BreadcrumbLink: React.FC<BreadcrumbLinkProps>;
  export const BreadcrumbPage: React.FC<React.HTMLAttributes<HTMLSpanElement>>;
  export const BreadcrumbSeparator: React.FC<React.HTMLAttributes<HTMLSpanElement>>;
  export const BreadcrumbEllipsis: React.FC<React.HTMLAttributes<HTMLSpanElement>>;
}

declare module '@/components/ui/select' {
  import * as React from 'react';

  export interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    name?: string;
    children: React.ReactNode;
  }

  export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
  }

  export interface SelectValueProps {
    placeholder?: string;
    children?: React.ReactNode;
  }

  export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
    position?: 'item-aligned' | 'popper';
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    alignOffset?: number;
    children: React.ReactNode;
  }

  export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    disabled?: boolean;
    children: React.ReactNode;
  }

  export const Select: React.FC<SelectProps>;
  export const SelectContent: React.FC<SelectContentProps>;
  export const SelectItem: React.FC<SelectItemProps>;
  export const SelectTrigger: React.FC<SelectTriggerProps>;
  export const SelectValue: React.FC<SelectValueProps>;
  export const SelectGroup: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const SelectLabel: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const SelectSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}
