import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AreaChartProps {
  title: string;
  description?: string;
  data: {
    name: string;
    data: number[];
  }[];
  categories: string[];
  colors?: string[];
  height?: number;
  className?: string;
}

export default function AreaChart({
  title,
  description,
  data,
  categories,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  height = 350,
  className,
}: AreaChartProps) {
  const options: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      fontFamily: 'inherit',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    colors: colors,
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: '#f1f1f1',
      row: {
        colors: ['transparent', 'transparent'],
        opacity: 0.5,
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
    },
    tooltip: {
      theme: 'light',
      x: {
        show: true,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5,
      fontFamily: 'inherit',
      labels: {
        colors: '#64748b',
      },
    },
  };

  const series = data;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ReactApexChart options={options} series={series} type="area" height={height} />
      </CardContent>
    </Card>
  );
}
