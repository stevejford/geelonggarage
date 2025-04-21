import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    },
    plotOptions: {
      bar: {
        horizontal: horizontal,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: colors,
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    grid: {
      borderColor: '#f1f1f1',
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
        <ReactApexChart options={options} series={series} type="bar" height={height} />
      </CardContent>
    </Card>
  );
}
