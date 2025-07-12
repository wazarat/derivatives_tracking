"use client"

import * as React from "react"
import { createContext, useCallback, useState } from "react"

// Toast types
export type ToastType = "default" | "success" | "error" | "warning" | "info" | "destructive"

export interface Toast {
  id: string
  title?: string
  description?: string
  /**
   * Variant of toast (preferred). Maintained alongside deprecated `type` for backward compatibility.
   */
  variant?: ToastType
  /**
   * @deprecated Use `variant` instead. Kept to avoid breaking existing usages inside the component.
   */
  type?: ToastType
  duration?: number
  action?: React.ReactNode
}

export interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

// Create context for toast management
export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Add a new toast
  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)

    // Normalize variant/type for consistency
    const variant = (toast as any).variant ?? toast.type ?? "default"
    const newToast: Toast = {
      ...toast,
      variant,
      type: variant, // keep both properties populated for internal usage
      id,
    }

    setToasts((prevToasts) => [...prevToasts, newToast])

    // Auto-dismiss toast after duration
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }, [])

  // Remove a toast by ID
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

// Toaster component that renders all active toasts
export function Toaster() {
  const { toasts, removeToast } = React.useContext(ToastContext) || { toasts: [], removeToast: () => {} }

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-md">
      {toasts.map((toast) => {
        const toastVariant = toast.variant ?? toast.type ?? "default"
        const variantBorder =
          toastVariant === "error" ? "border-red-500" :
          toastVariant === "success" ? "border-green-500" :
          toastVariant === "warning" ? "border-yellow-500" :
          toastVariant === "info" ? "border-blue-500" : ""

        return (
          <div
            key={toast.id}
            className={`bg-white dark:bg-gray-800 rounded-md shadow-lg p-4 flex flex-col gap-1 animate-in slide-in-from-right ${variantBorder && `border-l-4 ${variantBorder}`}`}
          >
            {toast.title && (
              <div className="font-medium">{toast.title}</div>
            )}
            {toast.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400">{toast.description}</div>
            )}
            {toast.action && (
              <div className="flex justify-end mt-2">{toast.action}</div>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              aria-label="Close toast"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return {
    toast: context.addToast,
    dismiss: context.removeToast,
  }
}

export function Toast({
  id,
  title,
  description,
  action,
  // accept both props names
  variant,
  type = "default",
}: Toast) {
  const { removeToast } = React.useContext(ToastContext) || { removeToast: () => {} }

  const toastVariant = variant ?? type

  return (
    <div
      className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full mb-4 ${
        toastVariant === "error" ? "border-l-4 border-red-500" :
        toastVariant === "success" ? "border-l-4 border-green-500" :
        toastVariant === "warning" ? "border-l-4 border-yellow-500" :
        toastVariant === "info" ? "border-l-4 border-blue-500" : ""
      }`}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
      {action}
      <button
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        onClick={() => removeToast(id)}
      >
        <span className="sr-only">Close</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  )
}

// Export the Provider as a named export for convenience
export { ToastProvider as Provider }
