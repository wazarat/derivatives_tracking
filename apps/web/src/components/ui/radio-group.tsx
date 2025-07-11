"use client"

import * as React from "react"

import { cn } from "../../lib/utils"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, defaultValue, children, ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "");
    
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);
    
    const handleValueChange = React.useCallback((newValue: string) => {
      setSelectedValue(newValue);
      onValueChange?.(newValue);
    }, [onValueChange]);
    
    return (
      <div 
        ref={ref}
        className={cn("grid gap-2", className)}
        role="radiogroup"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          
          return React.cloneElement(child as React.ReactElement<RadioGroupItemProps>, {
            name: props.id || "radio-group",
            checked: selectedValue === (child.props as RadioGroupItemProps).value,
            onCheckedChange: () => handleValueChange((child.props as RadioGroupItemProps).value)
          });
        })}
      </div>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  checked?: boolean;
  onCheckedChange?: () => void;
  name?: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, checked, onCheckedChange, name, children, ...props }, ref) => {
    return (
      <div className={cn("flex items-center space-x-2", className)} {...props}>
        <div className="relative flex items-center justify-center">
          <input
            type="radio"
            ref={ref}
            id={`${name}-${value}`}
            name={name}
            value={value}
            checked={checked}
            onChange={() => onCheckedChange?.()}
            className="sr-only"
          />
          <div 
            className={cn(
              "h-4 w-4 rounded-full border border-primary",
              checked ? "border-primary" : "border-input"
            )}
          >
            {checked && (
              <div className="h-2.5 w-2.5 rounded-full bg-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            )}
          </div>
        </div>
        {children && (
          <label htmlFor={`${name}-${value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {children}
          </label>
        )}
      </div>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem }
