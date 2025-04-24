import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  ArrowLeft,
  Download,
  Calendar,
  Filter,
  BarChart3,
  DollarSign,
  Users,
  FileText,
  TrendingUp
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SampleDataOverlay } from "@/components/ui/sample-data-overlay";
import BarChart from "@/components/charts/BarChart";
import LineChart from "@/components/charts/LineChart";
import DonutChart from "@/components/charts/DonutChart";
import { Link } from "react-router-dom";

export default function SalesPerformanceReport() {
  const [timeRange, setTimeRange] = useState("last30days");
  const [viewType, setViewType] = useState("overview");

  // Fetch metrics
  const metrics = useQuery(api.dashboard.getDashboardMetrics) || {
    counts: { leads: 0, contacts: 0, accounts: 0, quotes: 0, workOrders: 0, invoices: 0 },
    quotes: { open: 0, accepted: 0, declined: 0, conversionRate: 0 },
    workOrders: { pending: 0, scheduled: 0, inProgress: 0, completed: 0 },
    invoices: { draft: 0, sent: 0, paid: 0, totalRevenue: 0, outstandingRevenue: 0 },
    recentActivity: { leads: [], quotes: [], workOrders: [], invoices: [] }
  };

  // Sample data for sales by service type
  const salesByServiceData = [
    {
      name: "Revenue",
      data: [42000, 28000, 18000, 12000, 8000]
    }
  ];
  const salesByServiceCategories = ["Installation", "Repair", "Maintenance", "Inspection", "Consultation"];

  // Sample data for sales by month
  const salesByMonthData = [
    {
      name: "Revenue",
      data: [15000, 18000, 22000, 19000, 24000, 28000, 32000, 30000, 35000, 38000, 42000, 45000]
    }
  ];
  const salesByMonthCategories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Sample data for sales by customer type
  const salesByCustomerData = [60, 25, 15];
  const salesByCustomerLabels = ["Residential", "Commercial", "Industrial"];
  const salesByCustomerColors = ["#3b82f6", "#10b981", "#f59e0b"];

  // Sample data for top customers
  const topCustomers = [
    { name: "Acme Corp", revenue: 28500, orders: 12, avgOrderValue: 2375 },
    { name: "XYZ Industries", revenue: 22000, orders: 8, avgOrderValue: 2750 },
    { name: "123 Properties", revenue: 18500, orders: 9, avgOrderValue: 2056 },
    { name: "Global Services", revenue: 15000, orders: 6, avgOrderValue: 2500 },
    { name: "City Hospital", revenue: 12000, orders: 4, avgOrderValue: 3000 },
  ];

  // Sample data for sales team performance
  const salesTeamPerformance = [
    { name: "John Smith", leads: 45, quotes: 38, closed: 22, revenue: 58000, conversionRate: 58 },
    { name: "Sarah Johnson", leads: 52, quotes: 41, closed: 28, revenue: 72000, conversionRate: 68 },
    { name: "Mike Williams", leads: 38, quotes: 30, closed: 18, revenue: 48000, conversionRate: 60 },
    { name: "Lisa Brown", leads: 42, quotes: 35, closed: 20, revenue: 52000, conversionRate: 57 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Sales Performance Report</h1>
            <p className="text-gray-500 mt-1">Analyze sales data and trends</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
              <SelectItem value="thisyear">This Year</SelectItem>
              <SelectItem value="lastyear">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={viewType} onValueChange={setViewType}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="team">Sales Team</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(metrics.invoices.totalRevenue || 280000)}</h3>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> +12.5% from previous period
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <h3 className="text-2xl font-bold mt-1">{metrics.invoices.paid || 124}</h3>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> +8.2% from previous period
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {formatCurrency(metrics.invoices.totalRevenue && metrics.invoices.paid ? 
                        metrics.invoices.totalRevenue / metrics.invoices.paid : 2258)}
                    </h3>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> +3.8% from previous period
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">New Customers</p>
                    <h3 className="text-2xl font-bold mt-1">{metrics.counts.accounts || 38}</h3>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> +15.3% from previous period
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative">
              <SampleDataOverlay show={metrics.invoices.totalRevenue === 0} />
              <LineChart
                title="Monthly Sales Trend"
                description="Revenue over the past 12 months"
                data={salesByMonthData}
                categories={salesByMonthCategories}
                colors={["#3b82f6"]}
                height={300}
              />
            </div>
            <div className="relative">
              <SampleDataOverlay show={metrics.invoices.totalRevenue === 0} />
              <DonutChart
                title="Sales by Customer Type"
                description="Revenue distribution by customer segment"
                data={salesByCustomerData}
                labels={salesByCustomerLabels}
                colors={salesByCustomerColors}
                height={300}
              />
            </div>
          </div>

          {/* Sales by Service Type */}
          <div className="relative">
            <SampleDataOverlay show={metrics.invoices.totalRevenue === 0} />
            <BarChart
              title="Sales by Service Type"
              description="Revenue breakdown by service category"
              data={salesByServiceData}
              categories={salesByServiceCategories}
              colors={["#3b82f6"]}
              height={300}
            />
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
              <CardDescription>Highest revenue-generating customers in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-right py-3 px-4">Revenue</th>
                      <th className="text-right py-3 px-4">Orders</th>
                      <th className="text-right py-3 px-4">Avg. Order Value</th>
                      <th className="text-right py-3 px-4">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((customer, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4">{customer.name}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(customer.revenue)}</td>
                        <td className="py-3 px-4 text-right">{customer.orders}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(customer.avgOrderValue)}</td>
                        <td className="py-3 px-4 text-right">
                          {formatPercentage(customer.revenue / 280000 * 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Customer Acquisition Cost and Lifetime Value would go here */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition Cost</CardTitle>
                <CardDescription>Average cost to acquire a new customer</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center py-8">
                  <h3 className="text-4xl font-bold text-blue-600">{formatCurrency(450)}</h3>
                  <p className="text-sm text-gray-500 mt-2">Average CAC</p>
                  <div className="mt-6 flex justify-center">
                    <div className="bg-gray-100 rounded-full h-2 w-64">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">35% lower than industry average</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Customer Lifetime Value</CardTitle>
                <CardDescription>Average revenue generated per customer</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center py-8">
                  <h3 className="text-4xl font-bold text-green-600">{formatCurrency(3800)}</h3>
                  <p className="text-sm text-gray-500 mt-2">Average CLV</p>
                  <div className="mt-6 flex justify-center">
                    <div className="bg-gray-100 rounded-full h-2 w-64">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">CLV to CAC Ratio: 8.4:1</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="relative">
            <SampleDataOverlay show={metrics.invoices.totalRevenue === 0} />
            <BarChart
              title="Sales by Service Type"
              description="Revenue breakdown by service category"
              data={salesByServiceData}
              categories={salesByServiceCategories}
              colors={["#3b82f6"]}
              height={300}
            />
          </div>

          {/* Service Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
              <CardDescription>Detailed breakdown by service type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Service Type</th>
                      <th className="text-right py-3 px-4">Revenue</th>
                      <th className="text-right py-3 px-4">Orders</th>
                      <th className="text-right py-3 px-4">Avg. Price</th>
                      <th className="text-right py-3 px-4">% of Total</th>
                      <th className="text-right py-3 px-4">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">Installation</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(42000)}</td>
                      <td className="py-3 px-4 text-right">35</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(1200)}</td>
                      <td className="py-3 px-4 text-right">38.9%</td>
                      <td className="py-3 px-4 text-right text-green-600">+15.2%</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">Repair</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(28000)}</td>
                      <td className="py-3 px-4 text-right">42</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(667)}</td>
                      <td className="py-3 px-4 text-right">25.9%</td>
                      <td className="py-3 px-4 text-right text-green-600">+8.7%</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">Maintenance</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(18000)}</td>
                      <td className="py-3 px-4 text-right">30</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(600)}</td>
                      <td className="py-3 px-4 text-right">16.7%</td>
                      <td className="py-3 px-4 text-right text-green-600">+12.3%</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">Inspection</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(12000)}</td>
                      <td className="py-3 px-4 text-right">24</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(500)}</td>
                      <td className="py-3 px-4 text-right">11.1%</td>
                      <td className="py-3 px-4 text-right text-green-600">+5.8%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4">Consultation</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(8000)}</td>
                      <td className="py-3 px-4 text-right">16</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(500)}</td>
                      <td className="py-3 px-4 text-right">7.4%</td>
                      <td className="py-3 px-4 text-right text-red-600">-2.1%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Team Performance</CardTitle>
              <CardDescription>Individual performance metrics for the sales team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Sales Rep</th>
                      <th className="text-right py-3 px-4">Leads</th>
                      <th className="text-right py-3 px-4">Quotes</th>
                      <th className="text-right py-3 px-4">Closed</th>
                      <th className="text-right py-3 px-4">Revenue</th>
                      <th className="text-right py-3 px-4">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesTeamPerformance.map((rep, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4">{rep.name}</td>
                        <td className="py-3 px-4 text-right">{rep.leads}</td>
                        <td className="py-3 px-4 text-right">{rep.quotes}</td>
                        <td className="py-3 px-4 text-right">{rep.closed}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(rep.revenue)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end">
                            <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className={`h-2.5 rounded-full ${rep.conversionRate >= 65 ? 'bg-green-600' : rep.conversionRate >= 55 ? 'bg-yellow-500' : 'bg-red-600'}`}
                                style={{ width: `${rep.conversionRate}%` }}
                              ></div>
                            </div>
                            <span>{rep.conversionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
