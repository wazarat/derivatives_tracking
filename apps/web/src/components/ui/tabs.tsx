"use client"

import * as React from "react"

// Create a shared context for tabs
const TabsContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, ...props }, ref) => {
    const [selectedTab, setSelectedTab] = React.useState<string>(value ?? defaultValue ?? "")
    
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedTab(value)
      }
    }, [value])
    
    const handleValueChange = (newValue: string) => {
      setSelectedTab(newValue)
      onValueChange?.(newValue)
    }
    
    return (
      <TabsContext.Provider value={{ value: selectedTab, onValueChange: handleValueChange }}>
        <div 
          ref={ref} 
          className={`tabs ${className || ""}`} 
          data-state={selectedTab ? "active" : "inactive"}
          data-value={selectedTab}
          {...props} 
        />
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ""}`}
      role="tablist"
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    
    const isSelected = context.value === value
    
    return (
      <button
        ref={ref}
        role="tab"
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className || ""}`}
        aria-selected={isSelected}
        data-state={isSelected ? "active" : "inactive"}
        onClick={() => context.onValueChange?.(value)}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    
    const isSelected = context.value === value
    
    if (!isSelected) return null
    
    return (
      <div
        ref={ref}
        role="tabpanel"
        className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ""}`}
        data-state={isSelected ? "active" : "inactive"}
        {...props}
      />
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
