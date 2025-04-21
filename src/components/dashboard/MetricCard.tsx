import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
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
}

export default function MetricCard({
  title,
  value,
  icon,
  color,
  link,
  trend,
  className
}: MetricCardProps) {
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

  const Card = () => (
    <div className={cn(
      `bg-white rounded-lg shadow-sm p-6 border-l-4 ${colorClasses[color as keyof typeof colorClasses]} hover:shadow-md transition-shadow`,
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>

          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span>{Math.abs(trend.value)}% from last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full bg-gray-50">
          {icon}
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block">
        <Card />
      </Link>
    );
  }

  return <Card />;
}
