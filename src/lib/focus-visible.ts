/**
 * Focus Visible Utility
 * 
 * This utility helps ensure that all interactive elements have proper focus indicators
 * that meet WCAG 2.1 AA requirements for focus visibility.
 * 
 * Usage:
 * 1. Import this utility in your component
 * 2. Use the focusVisibleClasses in your component's className
 * 
 * Example:
 * ```tsx
 * import { focusVisibleClasses } from "@/lib/focus-visible";
 * 
 * <button className={cn("...", focusVisibleClasses)}>Click me</button>
 * ```
 */

/**
 * Standard focus visible classes that meet WCAG 2.1 AA requirements
 */
export const focusVisibleClasses = 
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

/**
 * Focus visible classes with a specific ring color
 */
export const focusVisibleWithColor = (color: string) => 
  `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-${color} focus-visible:ring-offset-2`;

/**
 * Focus visible classes with a specific ring width
 */
export const focusVisibleWithWidth = (width: number) => 
  `focus-visible:outline-none focus-visible:ring-${width} focus-visible:ring-blue-500 focus-visible:ring-offset-2`;

/**
 * Focus visible classes with a specific ring offset
 */
export const focusVisibleWithOffset = (offset: number) => 
  `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-${offset}`;

/**
 * Focus visible classes with custom ring color, width, and offset
 */
export const focusVisibleCustom = (color: string, width: number, offset: number) => 
  `focus-visible:outline-none focus-visible:ring-${width} focus-visible:ring-${color} focus-visible:ring-offset-${offset}`;
