import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CheckboxFieldProps {
  id?: string;
  label: string | React.ReactNode;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
}

const CheckboxField = React.forwardRef<HTMLButtonElement, CheckboxFieldProps>(
  ({ 
    id, 
    label, 
    description, 
    checked, 
    defaultChecked,
    onCheckedChange, 
    disabled, 
    required,
    error,
    className, 
    labelClassName, 
    containerClassName,
    ...props 
  }, ref) => {
    // Generate a unique ID if one isn't provided
    const checkboxId = id || `checkbox-field-${React.useId()}`;
    
    return (
      <div className={cn("space-y-2", containerClassName)}>
        <div className="flex items-start gap-2">
          <Checkbox
            id={checkboxId}
            ref={ref}
            checked={checked}
            defaultChecked={defaultChecked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            required={required}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${checkboxId}-error` : undefined}
            className={cn(
              "mt-1",
              className
            )}
            {...props}
          />
          <div>
            <Label 
              htmlFor={checkboxId} 
              className={cn(
                "text-sm font-medium text-gray-700",
                disabled && "opacity-70",
                labelClassName
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            
            {description && (
              <p className={cn(
                "text-xs text-gray-500",
                disabled && "opacity-70"
              )}>
                {description}
              </p>
            )}
          </div>
        </div>
        
        {error && (
          <p 
            id={`${checkboxId}-error`}
            className="text-sm text-red-600 pl-6"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

CheckboxField.displayName = "CheckboxField";

export { CheckboxField };
