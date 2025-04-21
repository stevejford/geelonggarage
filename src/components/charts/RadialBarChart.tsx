import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApexChartsWrapper from './ApexChartsWrapper';

interface RadialBarChartProps {
  title: string;
  description?: string;
  data: number[];
  labels: string[];
  colors?: string[];
  height?: number;
  className?: string;
}

export default function RadialBarChart({
  title,
  description,
  data,
  labels,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  height = 350,
  className,
}: RadialBarChartProps) {
  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      fontFamily: 'inherit',
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '14px',
            fontFamily: 'inherit',
            color: '#64748b',
          },
          value: {
            fontSize: '16px',
            fontFamily: 'inherit',
            fontWeight: 600,
            color: '#374151',
            formatter: function (val) {
              return val + '%';
            },
          },
          total: {
            show: true,
            label: 'Total',
            fontSize: '14px',
            fontFamily: 'inherit',
            fontWeight: 600,
            color: '#374151',
            formatter: function (w) {
              const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0) / w.globals.series.length;
              return total.toFixed(0) + '%';
            },
          },
        },
        hollow: {
          size: '40%',
        },
        track: {
          background: '#f1f5f9',
        },
      },
    },
    colors: colors,
    labels: labels,
    legend: {
      show: true,
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
    stroke: {
      lineCap: 'round',
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
        <ApexChartsWrapper>
          <ReactApexChart options={options} series={series} type="radialBar" height={height} />
        </ApexChartsWrapper>
      </CardContent>
    </Card>
  );
}
