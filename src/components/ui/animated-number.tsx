import React, { useState, useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number; // Added delay parameter for staggered animations
  formatFn?: (value: number) => string;
  className?: string;
  decimals?: number;
}

export function AnimatedNumber({
  value,
  duration = 1800, // Longer duration for smoother animation
  delay = 0, // Default to no delay
  formatFn,
  className = '',
  decimals = 0,
}: AnimatedNumberProps) {
  // Ensure value is a number
  const numericValue = typeof value === 'number' ? value : 0;

  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const previousValueRef = useRef<number>(0);
  const animationStarted = useRef<boolean>(false);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only start animation if we have a valid numeric value
    if (isNaN(numericValue)) {
      return;
    }

    // Store the previous value for when the component updates
    previousValueRef.current = animationStarted.current ? displayValue : 0;

    // Reset start time
    startTimeRef.current = null;

    // Cancel any existing animation
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    // Clear any existing delay timeout
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }

    // Function to start the animation
    const startAnimation = () => {
      animationStarted.current = true;

      // Start the animation
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Use a custom easing function for an even smoother animation
        // This combines easeOutQuint with easeOutExpo for a more natural feel
        const p = 1 - progress;
        // Smoother cubic-bezier like easing function
        const easing = 1 - (p * p * p * (1 + p * (10 * p - 10)));

        // Calculate the current value based on the easing function
        const currentValue = previousValueRef.current + (numericValue - previousValueRef.current) * easing;

        // Update the display value
        setDisplayValue(currentValue);

        // Continue the animation if not complete
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    };

    // If there's a delay, use setTimeout, otherwise start immediately
    if (delay > 0) {
      delayTimeoutRef.current = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    // Clean up on unmount or when value changes
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, [numericValue, duration, delay]);

  // Format the display value
  const formattedValue = formatFn
    ? formatFn(displayValue)
    : decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toString();

  return <span className={className}>{formattedValue}</span>;
}
