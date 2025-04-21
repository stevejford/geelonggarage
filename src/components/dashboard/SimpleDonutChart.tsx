import React from 'react';

interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  size?: number;
  thickness?: number;
  showLegend?: boolean;
}

export default function SimpleDonutChart({ 
  data, 
  size = 160, 
  thickness = 30,
  showLegend = true
}: DonutChartProps) {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate the circumference of the circle
  const radius = size / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the starting point for each segment
  let currentOffset = 0;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* If no data, show empty circle */}
        {total === 0 ? (
          <circle
            cx={radius}
            cy={radius}
            r={radius - thickness / 2}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={thickness}
          />
        ) : (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {data.map((item, index) => {
              // Skip if value is 0
              if (item.value === 0) return null;
              
              // Calculate the percentage and the dash array
              const percentage = item.value / total;
              const dashArray = circumference;
              const dashOffset = circumference * (1 - percentage);
              
              // Calculate rotation based on current offset
              const rotation = currentOffset * 360;
              currentOffset += percentage;
              
              return (
                <circle
                  key={index}
                  cx={radius}
                  cy={radius}
                  r={radius - thickness / 2}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={thickness}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(${rotation} ${radius} ${radius})`}
                  strokeLinecap="round"
                />
              );
            })}
            
            {/* Inner circle for donut effect */}
            <circle
              cx={radius}
              cy={radius}
              r={radius - thickness}
              fill="white"
            />
            
            {/* Center text showing total */}
            <text
              x={radius}
              y={radius}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xl font-bold"
              fill="#374151"
            >
              {total}
            </text>
          </svg>
        )}
      </div>
      
      {/* Legend */}
      {showLegend && (
        <div className="mt-4 grid grid-cols-2 gap-2 w-full">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs text-gray-600">{item.label} ({item.value})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
