import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  icon?: React.ReactNode;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ 
    id, 
    label, 
    description, 
    error, 
    icon, 
    className, 
    labelClassName, 
    inputClassName, 
    containerClassName,
    ...props 
  }, ref) => {
    // Generate a unique ID if one isn't provided
    const inputId = id || `field-${React.useId()}`;
    
    return (
      <div className={cn("space-y-2", containerClassName)}>
        <Label 
          htmlFor={inputId} 
          className={cn(
            "text-sm font-medium text-gray-700",
            labelClassName
          )}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <Input
            id={inputId}
            className={cn(
              icon ? "pl-10" : "",
              error ? "border-red-500 focus-visible:ring-red-500" : "",
              inputClassName
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : undefined}
            ref={ref}
            {...props}
          />
        </div>
        
        {error && (
          <p 
            id={`${inputId}-error`}
            className="text-sm text-red-600 flex items-start gap-1"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };
