import * as React from "react";
import { cn } from "@/lib/utils";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  mdCols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  lgCols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: "none" | "sm" | "md" | "lg";
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    cols = 1, 
    mdCols, 
    lgCols, 
    gap = "md", 
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid w-full",
          
          // Columns for different screen sizes
          cols === 1 && "grid-cols-1",
          cols === 2 && "grid-cols-2",
          cols === 3 && "grid-cols-3",
          cols === 4 && "grid-cols-4",
          cols === 5 && "grid-cols-5",
          cols === 6 && "grid-cols-6",
          cols === 12 && "grid-cols-12",
          
          // Medium screen columns
          mdCols === 1 && "md:grid-cols-1",
          mdCols === 2 && "md:grid-cols-2",
          mdCols === 3 && "md:grid-cols-3",
          mdCols === 4 && "md:grid-cols-4",
          mdCols === 5 && "md:grid-cols-5",
          mdCols === 6 && "md:grid-cols-6",
          mdCols === 12 && "md:grid-cols-12",
          
          // Large screen columns
          lgCols === 1 && "lg:grid-cols-1",
          lgCols === 2 && "lg:grid-cols-2",
          lgCols === 3 && "lg:grid-cols-3",
          lgCols === 4 && "lg:grid-cols-4",
          lgCols === 5 && "lg:grid-cols-5",
          lgCols === 6 && "lg:grid-cols-6",
          lgCols === 12 && "lg:grid-cols-12",
          
          // Gap sizes
          gap === "none" && "gap-0",
          gap === "sm" && "gap-2",
          gap === "md" && "gap-4 md:gap-6",
          gap === "lg" && "gap-6 md:gap-8",
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

export { Grid };
