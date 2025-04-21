import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DonutChartProps {
  title: string;
  description?: string;
  data: number[];
  labels: string[];
  colors?: string[];
  height?: number;
  className?: string;
}

export default function DonutChart({
  title,
  description,
  data,
  labels,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  height = 350,
  className,
}: DonutChartProps) {
  const options: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
    },
    colors: colors,
    labels: labels,
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '16px',
              fontFamily: 'inherit',
              fontWeight: 600,
              color: '#374151',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString();
              },
            },
            value: {
              show: true,
              fontSize: '22px',
              fontFamily: 'inherit',
              fontWeight: 600,
              color: '#374151',
              offsetY: -10,
              formatter: function (val) {
                return val.toString();
              },
            },
          },
        },
      },
    },
    legend: {
      position: 'bottom',
      fontFamily: 'inherit',
      fontSize: '14px',
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
          legend: {
            position: 'bottom',
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
      <CardContent>
        <ReactApexChart options={options} series={series} type="donut" height={height} />
      </CardContent>
    </Card>
  );
}
