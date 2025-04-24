/**
 * Color Contrast Utility
 * 
 * This utility helps ensure that all text meets WCAG 2.1 AA requirements for color contrast.
 * The WCAG AA standard requires a contrast ratio of at least:
 * - 4.5:1 for normal text (less than 18pt or 14pt bold)
 * - 3:1 for large text (at least 18pt or 14pt bold)
 * 
 * Usage:
 * 1. Import this utility in your component
 * 2. Use the functions to check if your color combinations meet WCAG AA requirements
 * 
 * Example:
 * ```tsx
 * import { getContrastRatio, meetsWCAGAA } from "@/lib/color-contrast";
 * 
 * const contrastRatio = getContrastRatio("#ffffff", "#000000");
 * const isAccessible = meetsWCAGAA("#ffffff", "#000000");
 * ```
 */

/**
 * Convert a hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, '');

  // Parse the hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}

/**
 * Calculate the relative luminance of a color
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(color: string): number {
  const { r, g, b } = hexToRgb(color);

  // Convert RGB to sRGB
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;

  // Calculate luminance
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculate the contrast ratio between two colors
 * @see https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = getLuminance(foreground);
  const backgroundLuminance = getLuminance(background);

  // Calculate contrast ratio
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if the contrast ratio meets WCAG AA requirements for normal text
 */
export function meetsWCAGAA(foreground: string, background: string): boolean {
  const contrastRatio = getContrastRatio(foreground, background);
  return contrastRatio >= 4.5;
}

/**
 * Check if the contrast ratio meets WCAG AA requirements for large text
 */
export function meetsWCAGAALarge(foreground: string, background: string): boolean {
  const contrastRatio = getContrastRatio(foreground, background);
  return contrastRatio >= 3;
}

/**
 * Check if the contrast ratio meets WCAG AAA requirements for normal text
 */
export function meetsWCAGAAA(foreground: string, background: string): boolean {
  const contrastRatio = getContrastRatio(foreground, background);
  return contrastRatio >= 7;
}

/**
 * Check if the contrast ratio meets WCAG AAA requirements for large text
 */
export function meetsWCAAAALarge(foreground: string, background: string): boolean {
  const contrastRatio = getContrastRatio(foreground, background);
  return contrastRatio >= 4.5;
}

/**
 * Get a color that has sufficient contrast with the background
 * If the provided color doesn't have sufficient contrast, it will be adjusted
 */
export function getAccessibleColor(color: string, background: string): string {
  // If the color already has sufficient contrast, return it
  if (meetsWCAGAA(color, background)) {
    return color;
  }

  // Otherwise, adjust the color to have sufficient contrast
  const { r, g, b } = hexToRgb(color);
  const backgroundLuminance = getLuminance(background);

  // Determine if we need to lighten or darken the color
  const shouldLighten = backgroundLuminance < 0.5;

  // Adjust the color until it has sufficient contrast
  let adjustedR = r;
  let adjustedG = g;
  let adjustedB = b;
  let adjustedColor = color;
  let contrastRatio = getContrastRatio(adjustedColor, background);

  // Maximum number of iterations to prevent infinite loops
  const maxIterations = 100;
  let iterations = 0;

  while (contrastRatio < 4.5 && iterations < maxIterations) {
    if (shouldLighten) {
      // Lighten the color
      adjustedR = Math.min(255, adjustedR + 5);
      adjustedG = Math.min(255, adjustedG + 5);
      adjustedB = Math.min(255, adjustedB + 5);
    } else {
      // Darken the color
      adjustedR = Math.max(0, adjustedR - 5);
      adjustedG = Math.max(0, adjustedG - 5);
      adjustedB = Math.max(0, adjustedB - 5);
    }

    // Convert back to hex
    adjustedColor = `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;
    contrastRatio = getContrastRatio(adjustedColor, background);
    iterations++;
  }

  return adjustedColor;
}
