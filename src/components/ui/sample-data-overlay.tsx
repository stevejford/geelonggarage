import React from 'react';

interface SampleDataOverlayProps {
  show: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function SampleDataOverlay({ 
  show, 
  position = 'top-right' 
}: SampleDataOverlayProps) {
  if (!show) return null;
  
  const positionClasses = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2'
  };
  
  return (
    <div className={`absolute ${positionClasses[position]} z-10`}>
      <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-md text-xs font-medium border border-amber-200 shadow-sm">
        Sample Data
      </div>
    </div>
  );
}
