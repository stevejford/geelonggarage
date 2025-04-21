import React, { useEffect } from 'react';

// This component fixes the "resolve is not defined" error in ApexCharts
export default function ApexChartsWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add the missing resolve function to the window object
    // This is needed because ApexCharts tries to use it but it's not defined
    if (typeof window !== 'undefined' && !window.hasOwnProperty('resolve')) {
      Object.defineProperty(window, 'resolve', {
        configurable: true,
        value: () => {},
      });
    }
  }, []);

  return <>{children}</>;
}
