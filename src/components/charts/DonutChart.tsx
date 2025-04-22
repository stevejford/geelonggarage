import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApexChartsWrapper from './ApexChartsWrapper';

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
        offsetY: 10, // Add some top padding to center the donut better
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
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return total > 0 ? total.toString() : 'No Data';
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
                return val > 0 ? val.toString() : '';
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
      offsetY: 5, // Add some space between chart and legend
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
          plotOptions: {
            pie: {
              offsetY: 0, // Reset offset on mobile
              donut: {
                labels: {
                  total: {
                    fontSize: '14px',
                  },
                  value: {
                    fontSize: '18px',
                  },
                },
              },
            },
          },
          legend: {
            position: 'bottom',
            offsetY: 0,
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
          <ReactApexChart options={options} series={series} type="donut" height={height} />
        </ApexChartsWrapper>
      </CardContent>
    </Card>
  );
}
