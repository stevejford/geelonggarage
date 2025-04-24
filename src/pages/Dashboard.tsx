import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect, useRef } from "react";
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

  // State for storing and managing activities
  const [displayedActivities, setDisplayedActivities] = useState([]);
  const [activityLimit, setActivityLimit] = useState(10);

  // Fetch recent activity data - this will automatically update when new data is available
  const recentActivityData = useQuery(api.dashboard.getRecentActivity, {
    limit: activityLimit
  }) || [];

  // Update displayed activities whenever the data changes
  useEffect(() => {
    if (recentActivityData.length > 0) {
      // Filter to get activities for work orders, quotes, and invoices (everything except communication)
      const filteredActivities = recentActivityData
        .filter(activity => ["invoice", "quote", "workOrder", "workorder"].includes(activity.type))
        .sort((a, b) => new Date(b.time) - new Date(a.time)); // Sort newest to oldest

      setDisplayedActivities(filteredActivities);
    }
  }, [recentActivityData]);

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

  // Tasks (synced with the Tasks page)
  const [tasks, setTasks] = useState([
    { id: "task-1", title: "Follow up with new lead", due: "Today", priority: "High" },
    { id: "task-2", title: "Send quote to customer", due: "Tomorrow", priority: "Medium" },
    { id: "task-3", title: "Schedule technician visit", due: "Next week", priority: "Low" },
    { id: "task-5", title: "Call back customer about invoice", due: "Today", priority: "High" },
  ]);

  // State for lazy loading and sorting
  const [taskSort, setTaskSort] = useState("newest");
  const [isLoadingMoreTasks, setIsLoadingMoreTasks] = useState(false);
  const taskContainerRef = useRef(null);

  // State for activity loading
  const [isLoadingMoreActivity, setIsLoadingMoreActivity] = useState(false);

  // Effect for scroll-based lazy loading for tasks and activity
  useEffect(() => {
    const handleTaskScroll = (e) => {
      const container = e.target;
      if (container.scrollHeight - container.scrollTop <= container.clientHeight * 1.2) {
        if (!isLoadingMoreTasks) {
          loadMoreTasks();
        }
      }
    };

    const handleActivityScroll = (e) => {
      const container = e.target;
      if (container.scrollHeight - container.scrollTop <= container.clientHeight * 1.2) {
        if (!isLoadingMoreActivity) {
          loadMoreActivity();
        }
      }
    };

    const taskContainer = document.getElementById('task-container');
    const activityContainer = document.getElementById('activity-container');

    if (taskContainer) {
      taskContainer.addEventListener('scroll', handleTaskScroll);
    }

    if (activityContainer) {
      activityContainer.addEventListener('scroll', handleActivityScroll);
    }

    return () => {
      if (taskContainer) {
        taskContainer.removeEventListener('scroll', handleTaskScroll);
      }
      if (activityContainer) {
        activityContainer.removeEventListener('scroll', handleActivityScroll);
      }
    };
  }, [isLoadingMoreTasks, isLoadingMoreActivity]);

  // Effect for sorting tasks
  useEffect(() => {
    setTasks(prevTasks => {
      const sortedTasks = [...prevTasks];

      switch (taskSort) {
        case 'newest':
          return sortedTasks.sort((a, b) => b.id.localeCompare(a.id));
        case 'oldest':
          return sortedTasks.sort((a, b) => a.id.localeCompare(b.id));
        case 'priority':
          const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
          return sortedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        case 'due':
          const dueOrder = { 'Today': 0, 'Tomorrow': 1, 'This week': 2, 'Next week': 3, 'Not set': 4 };
          return sortedTasks.sort((a, b) => {
            const aOrder = dueOrder[a.due] !== undefined ? dueOrder[a.due] : 5;
            const bOrder = dueOrder[b.due] !== undefined ? dueOrder[b.due] : 5;
            return aOrder - bOrder;
          });
        default:
          return sortedTasks;
      }
    });
  }, [taskSort]);

  // Function to mark a task as done
  const markTaskAsDone = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  // Function to load more tasks (simulated)
  const loadMoreTasks = () => {
    setIsLoadingMoreTasks(true);
    // Simulate API call delay
    setTimeout(() => {
      const newTasks = [
        { id: `task-${Date.now()}-1`, title: "Review monthly reports", due: "Next week", priority: "Medium" },
        { id: `task-${Date.now()}-2`, title: "Update customer database", due: "This week", priority: "Low" },
      ];

      setTasks(prevTasks => [...prevTasks, ...newTasks]);
      setIsLoadingMoreTasks(false);
    }, 1000);
  };

  // Function to load more activity items
  const loadMoreActivity = () => {
    if (isLoadingMoreActivity) return;

    setIsLoadingMoreActivity(true);

    try {
      // Increase the limit to get more activities
      const newLimit = activityLimit + 10;
      setActivityLimit(newLimit);
      console.log("Increasing activity limit to:", newLimit);

      // The useQuery hook will automatically fetch more data with the new limit
    } catch (error) {
      console.error("Error loading more activities:", error);
    } finally {
      // Set a short timeout to prevent multiple rapid calls
      setTimeout(() => {
        setIsLoadingMoreActivity(false);
      }, 500);
    }
  };

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
        {/* Recent Activity - Invoices */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle>Recent Activity</CardTitle>
              <div className="flex items-center space-x-2">
                <select
                  className="text-xs border rounded p-1"
                  onChange={(e) => {
                    if (e.target.value) {
                      window.location.href = e.target.value;
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>View all...</option>
                  <option value="/invoices">Invoices</option>
                  <option value="/quotes">Quotes</option>
                  <option value="/work-orders">Work Orders</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="space-y-4 h-[300px] overflow-y-auto pr-2" id="activity-container">
                {displayedActivities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent business activity</p>
                ) : (
                  <>
                    {displayedActivities.map((activity, index) => {
                      // Determine icon and color based on activity type
                      let icon = <Receipt className="h-5 w-5 text-purple-600" />;
                      let bgColor = "bg-gray-100";
                      let linkPath = `/invoices/${activity.id}`;

                      if (activity.type === "quote") {
                        icon = <FileText className="h-5 w-5 text-yellow-600" />;
                        bgColor = "bg-yellow-50";
                        linkPath = `/quotes/${activity.id}`;
                      } else if (activity.type === "workOrder") {
                        icon = <ClipboardList className="h-5 w-5 text-blue-600" />;
                        bgColor = "bg-blue-50";
                        linkPath = `/work-orders/${activity.id}`;
                      } else if (activity.type === "invoice") {
                        icon = <Receipt className="h-5 w-5 text-purple-600" />;
                        bgColor = "bg-purple-50";
                        linkPath = `/invoices/${activity.id}`;
                      }

                      return (
                        <Link
                          to={linkPath}
                          key={index}
                          className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0 hover:bg-gray-50 rounded-md p-2 transition-colors"
                        >
                          <div className={`p-2 rounded-full ${bgColor}`}>
                            {icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium">{activity.action} {activity.type}</p>
                              <StatusBadge
                                variant={activity.status === 'completed' ? 'completed' :
                                        activity.status === 'pending' ? 'pending' : 'default'}
                                size="sm"
                              >
                                {activity.status || 'New'}
                              </StatusBadge>
                            </div>
                            <p className="text-sm text-gray-700">{activity.number || activity.id}</p>
                            <p className="text-sm text-gray-600">{activity.customerName || 'Customer'} - {activity.address || 'Address'}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-500">{activity.description && activity.description.length > 30 ?
                                `${activity.description.substring(0, 30)}...` :
                                activity.description || 'No description'}</p>
                              <p className="text-xs text-gray-400">{getRelativeTime(activity.time)}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}

                  {/* Load more button */}
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMoreActivity}
                      disabled={isLoadingMoreActivity}
                      className="w-full text-xs"
                    >
                      {isLoadingMoreActivity ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span> Loading...
                        </>
                      ) : (
                        'Load More Activity'
                      )}
                    </Button>
                  </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks */}
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle>Tasks</CardTitle>
              <div className="flex items-center space-x-2">
                <Link to="/tasks" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
                <Link to="/tasks" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  <Plus className="h-4 w-4 inline-block" /> Add Task
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {/* Task sorting options */}
              <div className="mb-3 flex justify-end">
                <select
                  value={taskSort}
                  onChange={(e) => setTaskSort(e.target.value)}
                  className="text-xs border rounded p-1"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">Priority</option>
                  <option value="due">Due Date</option>
                </select>
              </div>

              <div ref={taskContainerRef} className="space-y-3 h-[300px] overflow-y-auto pr-2" id="task-container">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tasks</p>
                ) : (
                  tasks.map((task, index) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border border-gray-100">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={() => markTaskAsDone(task.id)}
                      />
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

                {/* Load more button */}
                {tasks.length > 0 && (
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMoreTasks}
                      disabled={isLoadingMoreTasks}
                      className="w-full text-xs"
                    >
                      {isLoadingMoreTasks ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span> Loading...
                        </>
                      ) : (
                        'Load More Tasks'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
