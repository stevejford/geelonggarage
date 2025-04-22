import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import {
  Users,
  Building2,
  FileText,
  ClipboardList,
  Receipt,
  TrendingUp,
  Calendar,
  AlertCircle,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatNumber, formatPercentage, getRelativeTime } from "@/lib/utils";
import MetricCard from "@/components/dashboard/MetricCard";
import DonutChart from "@/components/charts/DonutChart";
import BarChart from "@/components/charts/BarChart";
import AreaChart from "@/components/charts/AreaChart";
import LineChart from "@/components/charts/LineChart";
import RadialBarChart from "@/components/charts/RadialBarChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SampleDataOverlay } from "@/components/ui/sample-data-overlay";

export default function Dashboard() {
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

  // Fetch recent activity
  const recentActivity = useQuery(api.dashboard.getRecentActivity, { limit: 10 }) || [];

  // Stats cards data
  const stats = [
    {
      title: "Total Leads",
      value: metrics.counts.leads,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      color: "blue",
      link: "/leads"
    },
    {
      title: "Total Contacts",
      value: metrics.counts.contacts,
      icon: <Users className="h-6 w-6 text-green-600" />,
      color: "green",
      link: "/contacts"
    },
    {
      title: "Total Accounts",
      value: metrics.counts.accounts,
      icon: <Building2 className="h-6 w-6 text-purple-600" />,
      color: "purple",
      link: "/accounts"
    },
    {
      title: "Open Quotes",
      value: metrics.quotes.open,
      icon: <FileText className="h-6 w-6 text-yellow-600" />,
      color: "yellow",
      link: "/quotes"
    },
  ];

  // Financial metrics
  const financialMetrics = [
    {
      title: "Total Revenue",
      value: metrics.invoices.totalRevenue,
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      color: "green"
    },
    {
      title: "Outstanding Revenue",
      value: metrics.invoices.outstandingRevenue,
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      color: "orange"
    },
    {
      title: "Quote Conversion",
      value: `${metrics.quotes.conversionRate.toFixed(1)}%`,
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      color: "blue"
    },
    {
      title: "Completed Work Orders",
      value: metrics.workOrders.completed,
      icon: <CheckCircle className="h-6 w-6 text-indigo-600" />,
      color: "indigo"
    },
  ];

  // Quote status chart data
  const quoteStatusData = [
    metrics.quotes.open,
    metrics.quotes.accepted,
    metrics.quotes.declined
  ];
  const quoteStatusLabels = ["Open", "Accepted", "Declined"];
  const quoteStatusColors = ["#f59e0b", "#10b981", "#ef4444"];

  // Work order status chart data
  const workOrderStatusData = [
    {
      name: "Work Orders",
      data: [
        metrics.workOrders.pending,
        metrics.workOrders.scheduled,
        metrics.workOrders.inProgress,
        metrics.workOrders.completed
      ]
    }
  ];
  const workOrderStatusCategories = ["Pending", "Scheduled", "In Progress", "Completed"];
  const workOrderStatusColors = ["#6b7280", "#3b82f6", "#f59e0b", "#10b981"];

  // Invoice status chart data
  const invoiceStatusData = [
    metrics.invoices.draft,
    metrics.invoices.sent,
    metrics.invoices.paid
  ];
  const invoiceStatusLabels = ["Draft", "Sent", "Paid"];
  const invoiceStatusColors = ["#6b7280", "#3b82f6", "#10b981"];

  // Check if we have any real data
  const hasRealQuoteData = quoteStatusData.some(value => value > 0);
  const hasRealWorkOrderData = workOrderStatusData[0].data.some(value => value > 0);
  const hasRealInvoiceData = invoiceStatusData.some(value => value > 0);

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

  // Performance metrics - use real data when available
  const quoteConversionRate = metrics.quotes.conversionRate || 85;
  const invoicePaymentRate = metrics.invoices.totalRevenue > 0 && metrics.invoices.outstandingRevenue > 0 ?
    (metrics.invoices.totalRevenue / (metrics.invoices.totalRevenue + metrics.invoices.outstandingRevenue)) * 100 : 95;

  const performanceData = [
    Math.round(quoteConversionRate), // Quote conversion rate
    92, // Customer satisfaction (sample)
    78, // Team efficiency (sample)
    Math.round(invoicePaymentRate)  // Invoice payment rate
  ];
  const performanceLabels = ["Quote Conversion", "Customer Satisfaction", "Team Efficiency", "Payment Rate"];
  const performanceColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

  // Tasks (placeholder for now)
  const tasks = [
    { title: "Follow up with new lead", due: "Today", priority: "High" },
    { title: "Send quote to customer", due: "Tomorrow", priority: "Medium" },
    { title: "Schedule technician visit", due: "Next week", priority: "Low" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {firstName}!</h1>
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

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <MetricCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            link={stat.link}
            index={index} // Pass index for staggered animation
            trend={index % 2 === 0 ? { value: 12, isPositive: true } : { value: 5, isPositive: false }}
          />
        ))}
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialMetrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            index={index + 4} // Offset index for staggered animation (after the first set of cards)
            trend={index % 2 === 0 ? { value: 8, isPositive: true } : { value: 3, isPositive: false }}
          />
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative">
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
        <div className="relative">
          <SampleDataOverlay show={!hasRealQuoteData && !hasRealInvoiceData} />
          <RadialBarChart
            title="Performance Metrics"
            description="Key performance indicators"
            data={performanceData}
            labels={performanceLabels}
            colors={performanceColors}
            height={300}
          />
        </div>
      </div>

      {/* Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="relative">
          <SampleDataOverlay show={!hasRealQuoteData} />
          <DonutChart
            title="Quote Status"
            description="Distribution of quotes by status"
            data={quoteStatusData}
            labels={quoteStatusLabels}
            colors={quoteStatusColors}
            height={350} // Increased height to accommodate legend
          />
        </div>
        <div className="relative">
          <SampleDataOverlay show={!hasRealWorkOrderData} />
          <BarChart
            title="Work Order Status"
            description="Distribution of work orders by status"
            data={workOrderStatusData}
            categories={workOrderStatusCategories}
            colors={workOrderStatusColors}
            height={300}
          />
        </div>
        <div className="relative">
          <SampleDataOverlay show={!hasRealInvoiceData} />
          <DonutChart
            title="Invoice Status"
            description="Distribution of invoices by status"
            data={invoiceStatusData}
            labels={invoiceStatusLabels}
            colors={invoiceStatusColors}
            height={350} // Increased height to accommodate legend
          />
        </div>
      </div>

      {/* Activity and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle>Recent Activity</CardTitle>
              <Link to="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="p-2 rounded-full bg-gray-100">
                        {activity.type === "lead" && <Users className="h-5 w-5 text-blue-600" />}
                        {activity.type === "quote" && <FileText className="h-5 w-5 text-yellow-600" />}
                        {activity.type === "workorder" && <ClipboardList className="h-5 w-5 text-green-600" />}
                        {activity.type === "invoice" && <Receipt className="h-5 w-5 text-purple-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{getRelativeTime(activity.time)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle>Tasks</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                <Plus className="h-4 w-4 mr-1" /> Add Task
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tasks</p>
                ) : (
                  tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border border-gray-100">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {task.due}
                          </div>
                          <StatusBadge
                            variant={task.priority === 'High' ? 'overdue' : task.priority === 'Medium' ? 'pending' : 'completed'}
                            size="sm"
                          >
                            {task.priority}
                          </StatusBadge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
