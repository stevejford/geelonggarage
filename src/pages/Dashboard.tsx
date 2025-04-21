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
  PieChart
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatNumber, formatPercentage, getRelativeTime } from "@/lib/utils";
import MetricCard from "@/components/dashboard/MetricCard";
import SimpleBarChart from "@/components/dashboard/SimpleBarChart";
import SimpleDonutChart from "@/components/dashboard/SimpleDonutChart";

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
      value: formatNumber(metrics.counts.leads),
      icon: <Users className="h-6 w-6 text-blue-600" />,
      color: "blue",
      link: "/leads"
    },
    {
      title: "Total Contacts",
      value: formatNumber(metrics.counts.contacts),
      icon: <Users className="h-6 w-6 text-green-600" />,
      color: "green",
      link: "/contacts"
    },
    {
      title: "Total Accounts",
      value: formatNumber(metrics.counts.accounts),
      icon: <Building2 className="h-6 w-6 text-purple-600" />,
      color: "purple",
      link: "/accounts"
    },
    {
      title: "Open Quotes",
      value: formatNumber(metrics.quotes.open),
      icon: <FileText className="h-6 w-6 text-yellow-600" />,
      color: "yellow",
      link: "/quotes"
    },
  ];

  // Financial metrics
  const financialMetrics = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.invoices.totalRevenue),
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      color: "green"
    },
    {
      title: "Outstanding Revenue",
      value: formatCurrency(metrics.invoices.outstandingRevenue),
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      color: "orange"
    },
    {
      title: "Quote Conversion",
      value: formatPercentage(metrics.quotes.conversionRate),
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      color: "blue"
    },
    {
      title: "Completed Work Orders",
      value: formatNumber(metrics.workOrders.completed),
      icon: <CheckCircle className="h-6 w-6 text-indigo-600" />,
      color: "indigo"
    },
  ];

  // Quote status chart data
  const quoteStatusData = [
    { label: "Open", value: metrics.quotes.open, color: "bg-yellow-500" },
    { label: "Accepted", value: metrics.quotes.accepted, color: "bg-green-500" },
    { label: "Declined", value: metrics.quotes.declined, color: "bg-red-500" },
  ];

  // Work order status chart data
  const workOrderStatusData = [
    { label: "Pending", value: metrics.workOrders.pending, color: "bg-gray-500" },
    { label: "Scheduled", value: metrics.workOrders.scheduled, color: "bg-blue-500" },
    { label: "In Progress", value: metrics.workOrders.inProgress, color: "bg-yellow-500" },
    { label: "Completed", value: metrics.workOrders.completed, color: "bg-green-500" },
  ];

  // Invoice status chart data
  const invoiceStatusData = [
    { label: "Draft", value: metrics.invoices.draft, color: "bg-gray-500" },
    { label: "Sent", value: metrics.invoices.sent, color: "bg-blue-500" },
    { label: "Paid", value: metrics.invoices.paid, color: "bg-green-500" },
  ];

  // Tasks (placeholder for now)
  const tasks = [
    { title: "Follow up with new lead", due: "Today", priority: "High" },
    { title: "Send quote to customer", due: "Tomorrow", priority: "Medium" },
    { title: "Schedule technician visit", due: "Next week", priority: "Low" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome back, {firstName}!</h1>
        <div className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <MetricCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            link={stat.link}
          />
        ))}
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {financialMetrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quote Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Quote Status</h2>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-center">
            <SimpleDonutChart data={quoteStatusData} />
          </div>
        </div>

        {/* Work Order Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Work Order Status</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-center">
            <SimpleBarChart data={workOrderStatusData} />
          </div>
        </div>

        {/* Invoice Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Invoice Status</h2>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-center">
            <SimpleDonutChart data={invoiceStatusData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <Link to="/" className="text-sm text-blue-600 hover:text-blue-800">View all</Link>
            </div>
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
          </div>
        </div>

        {/* Tasks */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Tasks</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800">+ Add Task</button>
            </div>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tasks</p>
              ) : (
                tasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {task.due}
                        </div>
                        <div className={`flex items-center text-xs px-1.5 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-800' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {task.priority}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
