"use client"

import * as React from "react"
import { Check } from "lucide-react"

interface DropdownMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const DropdownMenu = ({ children, open, onOpenChange }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(open || false);
  
  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);
  
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };
  
  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DropdownMenuTrigger) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onClick: () => handleOpenChange(!isOpen),
          });
        }
        if (React.isValidElement(child) && child.type === DropdownMenuContent) {
          const contentChild = child as React.ReactElement<DropdownMenuContentProps>;
          return isOpen || (contentChild.props as DropdownMenuContentProps).forceMount ? contentChild : null;
        }
        return child;
      })}
    </div>
  );
};

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

const DropdownMenuTrigger = ({
  children,
  asChild = false,
}: DropdownMenuTriggerProps) => {
  return (
    <button
      className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
    >
      {children}
    </button>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: "start" | "end" | "center"
  sideOffset?: number
  alignOffset?: number
  avoidCollisions?: boolean
  collisionPadding?: number | { top?: number; right?: number; bottom?: number; left?: number }
  className?: string
  forceMount?: boolean
}

const DropdownMenuContent = ({
  children,
  align = "center",
  sideOffset = 4,
  alignOffset = 0,
  avoidCollisions = true,
  collisionPadding = 0,
  className = "",
  forceMount,
}: DropdownMenuContentProps) => {
  return (
    <div className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${className}`}>
      <div className="py-1">{children}</div>
    </div>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onSelect?: (event: Event) => void
  onClick?: () => void | Promise<void>
  disabled?: boolean
  inset?: boolean
  asChild?: boolean
  className?: string
}

const DropdownMenuItem = ({
  children,
  onSelect,
  onClick,
  disabled = false,
  inset = false,
  asChild = false,
  className = "",
}: DropdownMenuItemProps) => {
  if (asChild) {
    return <div className={`block w-full ${className}`}>{children}</div>
  }
  
  return (
    <button
      className={`block w-full px-4 py-2 text-left text-sm ${
        disabled ? "text-gray-400" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      } ${inset ? "pl-8" : ""} ${className}`}
      disabled={disabled}
      onClick={(e) => {
        onSelect?.(e as unknown as Event);
        onClick?.();
      }}
    >
      {children}
    </button>
  )
}

interface DropdownMenuCheckboxItemProps {
  children: React.ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

const DropdownMenuCheckboxItem = ({
  children,
  checked = false,
  onCheckedChange,
  disabled = false,
}: DropdownMenuCheckboxItemProps) => {
  return (
    <button
      className={`flex w-full items-center px-4 py-2 text-left text-sm ${
        disabled ? "text-gray-400" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
    >
      <div className="mr-2 h-4 w-4 flex items-center justify-center rounded border border-gray-300">
        {checked && <Check className="h-3 w-3" />}
      </div>
      {children}
    </button>
  )
}

interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuLabel = ({
  children,
  className = "",
}: DropdownMenuLabelProps) => {
  return (
    <div className={`px-4 py-2 text-sm font-semibold text-gray-900 ${className}`}>
      {children}
    </div>
  )
}

const DropdownMenuSeparator = () => {
  return <div className="my-1 h-px bg-gray-200" />
}

interface DropdownMenuFooterProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuFooter = ({
  children,
  className = "",
}: DropdownMenuFooterProps) => {
  return (
    <div className={`px-4 py-2 text-sm text-gray-500 ${className}`}>
      {children}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuFooter,
}
