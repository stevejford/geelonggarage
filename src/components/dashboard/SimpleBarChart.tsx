import React from 'react';

interface BarChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  height?: number;
  showValues?: boolean;
}

export default function SimpleBarChart({ data, height = 200, showValues = true }: BarChartProps) {
  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  return (
    <div className="w-full">
      <div className="flex items-end h-[200px] gap-2">
        {data.map((item, index) => {
          // Calculate the height percentage based on the value
          const heightPercentage = (item.value / maxValue) * 100;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex flex-col items-center justify-end h-[160px]">
                {showValues && (
                  <span className="text-xs font-medium mb-1">{item.value}</span>
                )}
                <div 
                  className={`w-full rounded-t-md ${item.color}`} 
                  style={{ height: `${heightPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-2 text-center w-full truncate">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
