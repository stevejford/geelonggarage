import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApexChartsWrapper from './ApexChartsWrapper';
import { AnimatedNumber } from '@/components/ui/animated-number';

interface DonutChartProps {
  title: string;
  description?: string;
  data: number[];
  labels: string[];
  colors?: string[];
  height?: number;
  className?: string;
  index?: number; // Added for staggered animations
}

export default function DonutChart({
  title,
  description,
  data,
  labels,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  height = 350,
  className,
  index = 0, // Default to 0 if not provided
}: DonutChartProps) {
  // Calculate the total for animated display
  const total = data.reduce((sum, value) => sum + value, 0);
  const options: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      }
    },
    colors: colors,
    labels: labels,
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        offsetY: -10, // Move the chart up a bit
        offsetX: 0,
        customScale: 0.85, // Slightly smaller to ensure proper centering and leave room for legend
        donut: {
          size: '65%', // Make the donut hole larger
          labels: {
            show: false, // Hide the built-in labels, we'll add our own animated one
          },
        },
      },
    },
    legend: {
      position: 'bottom',
      fontFamily: 'inherit',
      fontSize: '14px',
      offsetY: 0,
      horizontalAlign: 'center',
      labels: {
        colors: '#64748b',
      },
      markers: {
        width: 12,
        height: 12,
        radius: 12,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 5,
      },
      containerMargin: {
        top: 15
      }
    },
    tooltip: {
      theme: 'light',
      fillSeriesColor: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 300,
          },
          plotOptions: {
            pie: {
              customScale: 0.8,
              offsetY: -5,
            }
          },
          legend: {
            position: 'bottom',
            offsetY: 0,
            fontSize: '12px',
          },
        },
      },
    ],
  };

  const series = data;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        <div className="relative">
          <ApexChartsWrapper>
            <ReactApexChart options={options} series={series} type="donut" height={height} />
          </ApexChartsWrapper>

          {/* Custom animated total in the center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-10%', left: '0', right: '0', bottom: '10%' }}>
            <div className="flex flex-col items-center justify-center">
              <div className="text-sm font-medium text-gray-500">Total</div>
              <div className="text-2xl font-bold text-gray-800">
                {Math.round(total)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
