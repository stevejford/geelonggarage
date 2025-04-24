import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import {
  Users,
  ClipboardList,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Activity,
  UserCog,
  Truck,
  Tool,
  Wrench,
  CalendarClock
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercentage, getRelativeTime } from "@/lib/utils";
import MetricCard from "@/components/dashboard/MetricCard";
import DonutChart from "@/components/charts/DonutChart";
import BarChart from "@/components/charts/BarChart";
import LineChart from "@/components/charts/LineChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SampleDataOverlay } from "@/components/ui/sample-data-overlay";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function OperationsManagerDashboard() {
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

  // Operations metrics
  const operationsMetrics = [
    {
      title: "Active Work Orders",
      value: metrics.workOrders.inProgress,
      icon: <ClipboardList className="h-6 w-6 text-blue-600" />,
      color: "blue",
      link: "/work-orders"
    },
    {
      title: "Scheduled Jobs",
      value: metrics.workOrders.scheduled,
      icon: <Calendar className="h-6 w-6 text-purple-600" />,
      color: "purple",
      link: "/work-orders"
    },
    {
      title: "Pending Approval",
      value: metrics.workOrders.pending,
      icon: <Clock className="h-6 w-6 text-yellow-600" />,
      color: "yellow",
      link: "/work-orders"
    },
    {
      title: "Completed Jobs",
      value: metrics.workOrders.completed,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      color: "green",
      link: "/work-orders"
    },
  ];

  // Technician efficiency metrics (sample data)
  const technicianEfficiency = [
    { name: "John Smith", jobs: 24, onTime: 22, efficiency: 92 },
    { name: "Sarah Johnson", jobs: 18, onTime: 17, efficiency: 94 },
    { name: "Mike Williams", jobs: 21, onTime: 18, efficiency: 86 },
    { name: "Lisa Brown", jobs: 15, onTime: 14, efficiency: 93 },
  ];

  // Work order completion time (sample data)
  const completionTimeData = [
    {
      name: "Avg. Completion Time (hours)",
      data: [4.2, 3.8, 4.5, 3.5, 3.9, 4.1, 3.7, 3.6, 3.4, 3.2, 3.0, 2.9]
    }
  ];
  const completionTimeCategories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Work order type distribution (sample data)
  const workOrderTypeData = [25, 35, 20, 15, 5];
  const workOrderTypeLabels = ["Installation", "Repair", "Maintenance", "Inspection", "Other"];
  const workOrderTypeColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#6b7280"];

  // Customer satisfaction (sample data)
  const satisfactionData = [
    {
      name: "Customer Satisfaction",
      data: [88, 92, 90, 93, 91, 94, 92, 95, 93, 96, 94, 97]
    }
  ];
  const satisfactionCategories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Upcoming scheduled jobs (sample data)
  const upcomingJobs = [
    { id: "wo-1", customer: "Acme Corp", type: "Installation", scheduled: "Today, 2:00 PM", technician: "John S." },
    { id: "wo-2", customer: "XYZ Industries", type: "Repair", scheduled: "Today, 4:30 PM", technician: "Sarah J." },
    { id: "wo-3", customer: "123 Properties", type: "Maintenance", scheduled: "Tomorrow, 9:00 AM", technician: "Mike W." },
    { id: "wo-4", customer: "Global Services", type: "Inspection", scheduled: "Tomorrow, 1:00 PM", technician: "Lisa B." },
    { id: "wo-5", customer: "City Hospital", type: "Installation", scheduled: "Jun 18, 10:00 AM", technician: "John S." },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Operations Dashboard</h1>
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

      {/* Primary Operations Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {operationsMetrics.map((metric, index) => (
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

      {/* Work Order Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          <SampleDataOverlay show={metrics.workOrders.inProgress === 0} />
          <BarChart
            title="Work Order Status"
            description="Distribution of work orders by status"
            data={[
              {
                name: "Work Orders",
                data: [
                  metrics.workOrders.pending,
                  metrics.workOrders.scheduled,
                  metrics.workOrders.inProgress,
                  metrics.workOrders.completed
                ]
              }
            ]}
            categories={["Pending", "Scheduled", "In Progress", "Completed"]}
            colors={["#6b7280", "#3b82f6", "#f59e0b", "#10b981"]}
            height={300}
          />
        </div>
        <div className="relative">
          <SampleDataOverlay show={true} />
          <DonutChart
            title="Work Order Types"
            description="Distribution by service type"
            data={workOrderTypeData}
            labels={workOrderTypeLabels}
            colors={workOrderTypeColors}
            height={300}
          />
        </div>
      </div>

      {/* Technician Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Technician Performance</CardTitle>
          <CardDescription>Efficiency and job completion metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Technician</th>
                  <th className="text-center py-3 px-4">Jobs Completed</th>
                  <th className="text-center py-3 px-4">On-Time Completion</th>
                  <th className="text-center py-3 px-4">Efficiency Rate</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {technicianEfficiency.map((tech, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {tech.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{tech.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">{tech.jobs}</td>
                    <td className="text-center py-3 px-4">{tech.onTime} ({Math.round(tech.onTime/tech.jobs*100)}%)</td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${tech.efficiency >= 90 ? 'bg-green-600' : tech.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-600'}`}
                            style={{ width: `${tech.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="ml-2">{tech.efficiency}%</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <StatusBadge
                        variant={tech.efficiency >= 90 ? 'completed' : tech.efficiency >= 80 ? 'pending' : 'overdue'}
                        size="sm"
                      >
                        {tech.efficiency >= 90 ? 'Excellent' : tech.efficiency >= 80 ? 'Good' : 'Needs Improvement'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          <SampleDataOverlay show={true} />
          <LineChart
            title="Average Job Completion Time"
            description="Monthly trend in hours"
            data={completionTimeData}
            categories={completionTimeCategories}
            colors={["#3b82f6"]}
            height={300}
          />
        </div>
        <div className="relative">
          <SampleDataOverlay show={true} />
          <LineChart
            title="Customer Satisfaction"
            description="Monthly trend (percentage)"
            data={satisfactionData}
            categories={satisfactionCategories}
            colors={["#10b981"]}
            height={300}
          />
        </div>
      </div>

      {/* Upcoming Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle>Upcoming Scheduled Jobs</CardTitle>
          <Button variant="outline" size="sm">
            <CalendarClock className="mr-2 h-4 w-4" />
            View Schedule
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Work Order</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Scheduled</th>
                  <th className="text-left py-3 px-4">Technician</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingJobs.map((job, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">{job.id}</td>
                    <td className="py-3 px-4">{job.customer}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {job.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{job.scheduled}</td>
                    <td className="py-3 px-4">{job.technician}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
