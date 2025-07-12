"use client"

import * as React from "react"

// Simple tooltip implementation without Radix UI dependency
export interface TooltipProps {
  children: React.ReactNode
  delayDuration?: number
  skipDelayDuration?: number
  disableHoverableContent?: boolean
}

const TooltipProvider: React.FC<TooltipProps> = ({ 
  children,
  delayDuration = 300,
  skipDelayDuration = 300,
  disableHoverableContent = false
}) => {
  return <>{children}</>
}

export interface TooltipTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button"
    return (
      <Comp
        ref={ref}
        className={className}
        {...props}
      />
    )
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
  alignOffset?: number
  arrowPadding?: number
  collisionPadding?: number | { top?: number; right?: number; bottom?: number; left?: number }
  sticky?: "partial" | "always"
  hideWhenDetached?: boolean
  avoidCollisions?: boolean
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", align = "center", sideOffset = 4, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className || ""}`}
        {...props}
      />
    )
  }
)
TooltipContent.displayName = "TooltipContent"

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ children, className, open, defaultOpen, onOpenChange, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen || false)
    
    React.useEffect(() => {
      if (open !== undefined) {
        setIsOpen(open)
      }
    }, [open])
    
    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen)
      onOpenChange?.(newOpen)
    }
    
    return (
      <div
        ref={ref}
        className={`inline-block ${className || ""}`}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Tooltip.displayName = "Tooltip"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
