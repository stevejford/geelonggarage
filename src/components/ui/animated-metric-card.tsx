import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Card, CardContent } from '@/components/ui/card';

interface AnimatedMetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  link?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  index?: number; // For staggered animations
}

export function AnimatedMetricCard({
  title,
  value,
  icon,
  color,
  link,
  trend,
  className,
  index = 0 // Default to 0 if not provided
}: AnimatedMetricCardProps) {
  const colorClasses = {
    blue: 'border-blue-500 text-blue-600',
    green: 'border-green-500 text-green-600',
    yellow: 'border-yellow-500 text-yellow-600',
    purple: 'border-purple-500 text-purple-600',
    red: 'border-red-500 text-red-600',
    indigo: 'border-indigo-500 text-indigo-600',
    pink: 'border-pink-500 text-pink-600',
    orange: 'border-orange-500 text-orange-600',
  };

  const CardContent = () => (
    <div className={cn(
      `bg-white rounded-lg shadow-sm p-6 border-l-4 ${colorClasses[color as keyof typeof colorClasses]} hover:shadow-md transition-shadow`,
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-1">
            {typeof value === 'number' ? (
              <AnimatedNumber
                value={value}
                delay={index * 150} // Staggered delay based on card index
                formatFn={(val) => {
                  // Check if the value is a currency
                  if (title.toLowerCase().includes('revenue') || 
                      title.toLowerCase().includes('value') || 
                      title.toLowerCase().includes('total') && title.toLowerCase().includes('paid')) {
                    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  }
                  // Check if the value is a percentage
                  if (title.toLowerCase().includes('rate') || title.toLowerCase().includes('percentage')) {
                    return `${val.toFixed(1)}%`;
                  }
                  // Default formatting for other numbers
                  return val.toLocaleString();
                }}
              />
            ) : (
              value
            )}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? (
                  <ArrowUpRight className="inline-block w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="inline-block w-3 h-3 mr-1" />
                )}
                {trend.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color === 'blue' ? 'bg-blue-100' : 
                                           color === 'green' ? 'bg-green-100' : 
                                           color === 'yellow' ? 'bg-yellow-100' : 
                                           color === 'purple' ? 'bg-purple-100' : 
                                           color === 'red' ? 'bg-red-100' : 
                                           color === 'indigo' ? 'bg-indigo-100' : 
                                           color === 'pink' ? 'bg-pink-100' : 
                                           'bg-orange-100'}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}
