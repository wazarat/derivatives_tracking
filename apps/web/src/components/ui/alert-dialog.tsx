"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AlertDialogProps {
  children: React.ReactNode
}

const AlertDialog = ({ children }: AlertDialogProps) => {
  return <div>{children}</div>
}

interface AlertDialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

const AlertDialogTrigger = React.forwardRef<
  HTMLDivElement,
  AlertDialogTriggerProps & React.HTMLAttributes<HTMLDivElement>
>(({
  children,
  asChild = false,
  className,
  ...props
}, ref) => {
  const Comp = asChild ? React.Fragment : "div";
  
  return (
    <Comp
      ref={ref}
      className={cn(className)}
      {...props}
    >
      {children}
    </Comp>
  );
});
AlertDialogTrigger.displayName = "AlertDialogTrigger";

interface AlertDialogContentProps {
  children: React.ReactNode
}

const AlertDialogContent = ({
  children,
}: AlertDialogContentProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" />
      <div className="z-50 grid w-full max-w-lg gap-4 bg-white p-6 shadow-lg sm:rounded-lg">
        {children}
      </div>
    </div>
  )
}

interface AlertDialogHeaderProps {
  children: React.ReactNode
}

const AlertDialogHeader = ({
  children,
}: AlertDialogHeaderProps) => {
  return <div className="flex flex-col space-y-2 text-center sm:text-left">{children}</div>
}

interface AlertDialogFooterProps {
  children: React.ReactNode
}

const AlertDialogFooter = ({
  children,
}: AlertDialogFooterProps) => {
  return <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">{children}</div>
}

interface AlertDialogTitleProps {
  children: React.ReactNode
}

const AlertDialogTitle = ({
  children,
}: AlertDialogTitleProps) => {
  return <h2 className="text-lg font-semibold">{children}</h2>
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode
}

const AlertDialogDescription = ({
  children,
}: AlertDialogDescriptionProps) => {
  return <p className="text-sm text-gray-500">{children}</p>
}

interface AlertDialogActionProps {
  children: React.ReactNode
  onClick?: () => void
}

const AlertDialogAction = ({
  children,
  onClick,
}: AlertDialogActionProps) => {
  return (
    <button
      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

interface AlertDialogCancelProps {
  children: React.ReactNode
  onClick?: () => void
}

const AlertDialogCancel = ({
  children,
  onClick,
}: AlertDialogCancelProps) => {
  return (
    <button
      className="mt-2 inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
