import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApexChartsWrapper from './ApexChartsWrapper';

interface BarChartProps {
  title: string;
  description?: string;
  data: {
    name: string;
    data: number[];
  }[];
  categories: string[];
  colors?: string[];
  horizontal?: boolean;
  stacked?: boolean;
  height?: number;
  className?: string;
}

export default function BarChart({
  title,
  description,
  data,
  categories,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  horizontal = false,
  stacked = false,
  height = 350,
  className,
}: BarChartProps) {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
      stacked: stacked,
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
    plotOptions: {
      bar: {
        horizontal: horizontal,
        columnWidth: '55%',
        borderRadius: 4,
        distributed: data.length === 1, // Enable distributed look for single series
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val > 0 ? val.toString() : '';
      },
      style: {
        fontSize: '12px',
        fontFamily: 'inherit',
        fontWeight: 'bold',
        colors: ['#fff']
      },
      background: {
        enabled: true,
        foreColor: '#000',
        padding: 4,
        borderRadius: 2,
        borderWidth: 1,
        opacity: 0.9,
        dropShadow: {
          enabled: false,
        }
      },
      dropShadow: {
        enabled: false,
      }
    },
    colors: colors,
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    grid: {
      borderColor: '#f1f1f1',
      row: {
        colors: ['#f8f9fa', 'transparent'],
        opacity: 0.5
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
          fontFamily: 'inherit',
        },
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
        offsetY: 5, // Add some space between bars and labels
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
          fontFamily: 'inherit',
        },
        formatter: function (value) {
          return value.toFixed(0);
        },
      },
      min: 0,
      forceNiceScale: true,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: function (val) {
          return val.toString();
        },
      },
      marker: {
        show: true,
      },
      fixed: {
        enabled: false,
        position: 'topRight',
        offsetX: 0,
        offsetY: 0,
      },
    },
    legend: {
      show: false, // Hide the legend since it's redundant with x-axis labels
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5,
      fontFamily: 'inherit',
      labels: {
        colors: '#64748b',
      },
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '70%',
            },
          },
          legend: {
            position: 'bottom',
            offsetY: 0,
            offsetX: 0,
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
        <ApexChartsWrapper>
          <ReactApexChart options={options} series={series} type="bar" height={height} />
        </ApexChartsWrapper>
      </CardContent>
    </Card>
  );
}
