import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApexChartsWrapper from '@/components/charts/ApexChartsWrapper';

interface DonutChartProps {
  title: string;
  description?: string;
  data: number[];
  labels: string[];
  colors?: string[];
  height?: number;
  className?: string;
  index?: number; // For staggered animations
}

export function DonutChart({
  title,
  description,
  data,
  labels,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  height = 350,
  className,
  index = 0 // Default to 0 if not provided
}: DonutChartProps) {
  // Calculate the total for static display
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
        donut: {
          size: '60%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 500,
              color: undefined,
              offsetY: -10,
            },
            value: {
              show: false,
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '16px',
              fontWeight: 600,
              color: '#374151',
              formatter: function (w) {
                return total.toString();
              }
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      markers: {
        width: 10,
        height: 10,
        radius: 2
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(value) {
          return value.toString();
        }
      }
    },
    stroke: {
      width: 2
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ApexChartsWrapper>
          <ReactApexChart 
            options={options} 
            series={data} 
            type="donut" 
            height={height} 
          />
        </ApexChartsWrapper>
      </CardContent>
    </Card>
  );
}
