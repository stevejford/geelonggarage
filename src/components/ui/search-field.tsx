import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Loader2 } from "lucide-react";

interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  isLoading?: boolean;
  onSearch?: (value: string) => void;
  containerClassName?: string;
  inputClassName?: string;
}

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ 
    id, 
    placeholder = "Search...",
    isLoading = false,
    onSearch,
    className, 
    containerClassName,
    inputClassName,
    onChange,
    ...props 
  }, ref) => {
    // Generate a unique ID if one isn't provided
    const inputId = id || `search-field-${React.useId()}`;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e);
      if (onSearch) onSearch(e.target.value);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch((e.target as HTMLInputElement).value);
      }
      if (props.onKeyDown) props.onKeyDown(e);
    };
    
    return (
      <div className={cn("relative", containerClassName)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        
        <Input
          id={inputId}
          type="search"
          placeholder={placeholder}
          className={cn(
            "pl-9 pr-9",
            inputClassName
          )}
          ref={ref}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          {...props}
        />
        
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 animate-spin" />
        )}
      </div>
    );
  }
);

SearchField.displayName = "SearchField";

export { SearchField };
