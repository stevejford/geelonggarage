import * as React from "react";
import { cn } from "@/lib/utils";

interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  direction?: "horizontal" | "vertical";
}

export function Spacer({
  size = "md",
  direction = "vertical",
  className,
  ...props
}: SpacerProps) {
  return (
    <div
      className={cn(
        direction === "vertical" ? "w-full" : "h-full inline-block",
        size === "xs" && (direction === "vertical" ? "h-1" : "w-1"),
        size === "sm" && (direction === "vertical" ? "h-2" : "w-2"),
        size === "md" && (direction === "vertical" ? "h-4" : "w-4"),
        size === "lg" && (direction === "vertical" ? "h-6" : "w-6"),
        size === "xl" && (direction === "vertical" ? "h-8" : "w-8"),
        size === "2xl" && (direction === "vertical" ? "h-12" : "w-12"),
        className
      )}
      {...props}
    />
  );
}

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical";
  className?: string;
}

export function Divider({
  direction = "horizontal",
  className,
  ...props
}: DividerProps) {
  return (
    <div
      className={cn(
        direction === "horizontal"
          ? "w-full h-px bg-gray-200 my-4"
          : "h-full w-px bg-gray-200 mx-4 inline-block",
        className
      )}
      role="separator"
      {...props}
    />
  );
}

interface SpaceYProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export function SpaceY({
  size = "md",
  className,
  children,
  ...props
}: SpaceYProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        size === "xs" && "space-y-1",
        size === "sm" && "space-y-2",
        size === "md" && "space-y-4",
        size === "lg" && "space-y-6",
        size === "xl" && "space-y-8",
        size === "2xl" && "space-y-12",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SpaceXProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export function SpaceX({
  size = "md",
  className,
  children,
  ...props
}: SpaceXProps) {
  return (
    <div
      className={cn(
        "flex flex-row items-center",
        size === "xs" && "space-x-1",
        size === "sm" && "space-x-2",
        size === "md" && "space-x-4",
        size === "lg" && "space-x-6",
        size === "xl" && "space-x-8",
        size === "2xl" && "space-x-12",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface GapProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Gap({
  size = "md",
  className,
  children,
  ...props
}: GapProps) {
  return (
    <div
      className={cn(
        "grid",
        size === "xs" && "gap-1",
        size === "sm" && "gap-2",
        size === "md" && "gap-4",
        size === "lg" && "gap-6",
        size === "xl" && "gap-8",
        size === "2xl" && "gap-12",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
