import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  centered?: boolean;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({
    className,
    size = "xl",
    padding = "md",
    centered = true,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "w-full",

          // Size variants
          size === "sm" && "max-w-4xl",
          size === "md" && "max-w-5xl",
          size === "lg" && "max-w-7xl",
          size === "xl" && "max-w-[90rem]",
          size === "full" && "max-w-full",

          // Padding variants
          padding === "none" && "px-0 py-0",
          padding === "sm" && "px-6 py-4",
          padding === "md" && "px-8 py-6",
          padding === "lg" && "px-10 py-8",

          // Centered
          centered && "mx-auto",

          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export { Container };
