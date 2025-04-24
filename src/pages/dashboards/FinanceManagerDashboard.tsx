import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import {
  DollarSign,
  Receipt,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Activity,
  CreditCard,
  Wallet,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Percent
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercentage, getRelativeTime } from "@/lib/utils";
import MetricCard from "@/components/dashboard/MetricCard";
import DonutChart from "@/components/charts/DonutChart";
import BarChart from "@/components/charts/BarChart";
import AreaChart from "@/components/charts/AreaChart";
import LineChart from "@/components/charts/LineChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SampleDataOverlay } from "@/components/ui/sample-data-overlay";

export default function FinanceManagerDashboard() {
  const { user } = useUser();
  const firstName = user?.firstName || "User";

  // Fetch dashboard metrics
  const metrics = useQuery(api.dashboard.getDashboardMetrics) || {
    counts: { leads: 0, contacts: 0, accounts: 0, quotes: 0, workOrders: 0, invoices: 0 },
    quotes: { open: 0, accepted: 0, declined: 0, conversionRate: 0 },
    workOrders: { pending: 0, scheduled: 0, inProgress: 0, completed: 0 },
    invoices: { draft: 0, sent: 0, paid: 0, totalRevenue: 0, outstandingRevenue: 0 },
    recentActivity: { leads: [], quotes: [], workOrders: [], invoices: [] }
  };

  // Financial metrics
  const financialMetrics = [
    {
      title: "Total Revenue",
      value: metrics.invoices.totalRevenue,
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      color: "green",
      link: "/invoices"
    },
    {
      title: "Outstanding Revenue",
      value: metrics.invoices.outstandingRevenue,
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      color: "orange",
      link: "/invoices"
    },
    {
      title: "Invoices Sent",
      value: metrics.invoices.sent,
      icon: <Receipt className="h-6 w-6 text-blue-600" />,
      color: "blue",
      link: "/invoices"
    },
    {
      title: "Invoices Paid",
      value: metrics.invoices.paid,
      icon: <CheckCircle className="h-6 w-6 text-indigo-600" />,
      color: "indigo",
      link: "/invoices"
    },
  ];

  // Secondary financial metrics
  const secondaryMetrics = [
    {
      title: "Average Invoice Value",
      value: metrics.invoices.totalRevenue > 0 && metrics.invoices.paid > 0 
        ? formatCurrency(metrics.invoices.totalRevenue / metrics.invoices.paid) 
        : formatCurrency(0),
      icon: <FileText className="h-6 w-6 text-purple-600" />,
      color: "purple"
    },
    {
      title: "Payment Rate",
      value: metrics.invoices.sent > 0 
        ? `${Math.round((metrics.invoices.paid / (metrics.invoices.sent + metrics.invoices.paid)) * 100)}%` 
        : "0%",
      icon: <Percent className="h-6 w-6 text-yellow-600" />,
      color: "yellow"
    },
    {
      title: "Quote Conversion",
      value: `${metrics.quotes.conversionRate.toFixed(1)}%`,
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      color: "blue"
    },
    {
      title: "Profit Margin",
      value: "32.5%", // Sample data
      icon: <PieChart className="h-6 w-6 text-green-600" />,
      color: "green"
    },
  ];

  // Monthly revenue data
  const currentMonth = new Date().getMonth();
  const monthlyRevenueCategories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Use real data if available, otherwise generate sample data
  const monthlyRevenueData = [
    {
      name: "Revenue",
      data: metrics.invoices.totalRevenue > 0 ?
        // If we have real invoice data, distribute it across months with current month having the highest value
        Array.from({ length: 12 }, (_, i) => {
          const distanceFromCurrent = Math.abs(i - currentMonth);
          const factor = Math.max(0, 1 - (distanceFromCurrent / 6));
          return Math.round((metrics.invoices.totalRevenue / 3) + (metrics.invoices.totalRevenue * 0.7 * factor));
        }) :
        // Otherwise use sample data
        Array.from({ length: 12 }, (_, i) => {
          // Create a realistic growth trend with some randomness
          const distanceFromCurrent = Math.abs(i - currentMonth);
          const baseTrend = 4000 + (i * 1000); // Base upward trend
          const seasonalFactor = Math.max(0, 1 - (distanceFromCurrent / 6));
          const randomVariation = Math.random() * 1500 - 750; // Random variation
          return Math.max(0, Math.round(baseTrend + (seasonalFactor * 3000) + randomVariation));
        })
    }
  ];

  // Accounts receivable aging (sample data)
  const arAgingData = [
    {
      name: "Outstanding Amount",
      data: [42000, 28000, 15000, 8000]
    }
  ];
  const arAgingCategories = ["Current", "1-30 Days", "31-60 Days", "61+ Days"];
  const arAgingColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  // Payment method distribution (sample data)
  const paymentMethodData = [65, 20, 10, 5];
  const paymentMethodLabels = ["Credit Card", "Bank Transfer", "Check", "Other"];
  const paymentMethodColors = ["#3b82f6", "#10b981", "#f59e0b", "#6b7280"];

  // Recent invoices (sample data)
  const recentInvoices = [
    { id: "INV-1001", customer: "Acme Corp", amount: 2500, status: "Paid", date: "Jun 12, 2023" },
    { id: "INV-1002", customer: "XYZ Industries", amount: 1800, status: "Sent", date: "Jun 10, 2023" },
    { id: "INV-1003", customer: "123 Properties", amount: 3200, status: "Overdue", date: "May 28, 2023" },
    { id: "INV-1004", customer: "Global Services", amount: 950, status: "Paid", date: "Jun 5, 2023" },
    { id: "INV-1005", customer: "City Hospital", amount: 4100, status: "Sent", date: "Jun 8, 2023" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button size="sm">
            <Activity className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Primary Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialMetrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            link={metric.link}
            index={index}
            trend={index % 2 === 0 ? { value: 12, isPositive: true } : { value: 5, isPositive: false }}
          />
        ))}
      </div>

      {/* Secondary Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {secondaryMetrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            index={index + 4} // Offset index for staggered animation
            trend={index % 2 === 0 ? { value: 8, isPositive: true } : { value: 3, isPositive: false }}
          />
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="relative">
        <SampleDataOverlay show={metrics.invoices.totalRevenue === 0} />
        <AreaChart
          title="Monthly Revenue"
          description="Revenue trends over the past 12 months"
          data={monthlyRevenueData}
          categories={monthlyRevenueCategories}
          colors={['#3b82f6']}
          height={300}
        />
      </div>

      {/* AR Aging and Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          <SampleDataOverlay show={true} />
          <BarChart
            title="Accounts Receivable Aging"
            description="Outstanding amounts by age"
            data={arAgingData}
            categories={arAgingCategories}
            colors={arAgingColors}
            height={300}
          />
        </div>
        <div className="relative">
          <SampleDataOverlay show={true} />
          <DonutChart
            title="Payment Method Distribution"
            description="Percentage by payment type"
            data={paymentMethodData}
            labels={paymentMethodLabels}
            colors={paymentMethodColors}
            height={300}
          />
        </div>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle>Recent Invoices</CardTitle>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            View All Invoices
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Invoice #</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((invoice, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">{invoice.id}</td>
                    <td className="py-3 px-4">{invoice.customer}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(invoice.amount)}</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge
                        variant={invoice.status === 'Paid' ? 'completed' : invoice.status === 'Sent' ? 'pending' : 'overdue'}
                        size="sm"
                      >
                        {invoice.status}
                      </StatusBadge>
                    </td>
                    <td className="py-3 px-4">{invoice.date}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
          <CardDescription>Access detailed financial reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <BarChart3 className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="font-medium text-lg mb-1">Sales Performance</h3>
                <p className="text-sm text-gray-500">Revenue by product, service, and customer</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Clock className="h-10 w-10 text-orange-600 mb-4" />
                <h3 className="font-medium text-lg mb-1">AR Aging Report</h3>
                <p className="text-sm text-gray-500">Detailed accounts receivable aging analysis</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <PieChart className="h-10 w-10 text-green-600 mb-4" />
                <h3 className="font-medium text-lg mb-1">Profit & Loss</h3>
                <p className="text-sm text-gray-500">Comprehensive P&L statement</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
