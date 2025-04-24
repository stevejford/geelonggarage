import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  heading,
  description,
  children,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6",
        className
      )}
      {...props}
    >
      <div>
        <h1 className="text-2xl font-bold">{heading}</h1>
        {description && <p className="text-gray-500 mt-1">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
