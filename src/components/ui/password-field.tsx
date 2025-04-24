import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
  showPasswordToggle?: boolean;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
}

const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ 
    id, 
    label, 
    description, 
    error, 
    showPasswordToggle = true,
    className, 
    labelClassName, 
    inputClassName, 
    containerClassName,
    ...props 
  }, ref) => {
    // Generate a unique ID if one isn't provided
    const inputId = id || `password-field-${React.useId()}`;
    const [showPassword, setShowPassword] = React.useState(false);
    
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
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          
          <Input
            id={inputId}
            type={showPassword ? "text" : "password"}
            className={cn(
              "pl-10",
              showPasswordToggle ? "pr-10" : "",
              error ? "border-red-500 focus-visible:ring-red-500" : "",
              inputClassName
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : undefined}
            ref={ref}
            {...props}
          />
          
          {showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
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

PasswordField.displayName = "PasswordField";

export { PasswordField };
