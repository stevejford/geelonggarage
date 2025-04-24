import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  ArrowLeft,
  Download,
  Calendar,
  Filter,
  Clock,
  AlertCircle,
  DollarSign,
  FileText,
  TrendingUp,
  Mail,
  Phone
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SampleDataOverlay } from "@/components/ui/sample-data-overlay";
import { StatusBadge } from "@/components/ui/status-badge";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import { Link } from "react-router-dom";

export default function AccountsReceivableReport() {
  const [timeRange, setTimeRange] = useState("current");
  const [viewType, setViewType] = useState("summary");

  // Fetch metrics
  const metrics = useQuery(api.dashboard.getDashboardMetrics) || {
    counts: { leads: 0, contacts: 0, accounts: 0, quotes: 0, workOrders: 0, invoices: 0 },
    quotes: { open: 0, accepted: 0, declined: 0, conversionRate: 0 },
    workOrders: { pending: 0, scheduled: 0, inProgress: 0, completed: 0 },
    invoices: { draft: 0, sent: 0, paid: 0, totalRevenue: 0, outstandingRevenue: 0 },
    recentActivity: { leads: [], quotes: [], workOrders: [], invoices: [] }
  };

  // AR aging data
  const arAgingData = [
    {
      name: "Outstanding Amount",
      data: [42000, 28000, 15000, 8000]
    }
  ];
  const arAgingCategories = ["Current", "1-30 Days", "31-60 Days", "61+ Days"];
  const arAgingColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  // AR by customer type
  const arByCustomerData = [55, 35, 10];
  const arByCustomerLabels = ["Residential", "Commercial", "Industrial"];
  const arByCustomerColors = ["#3b82f6", "#10b981", "#f59e0b"];

  // Outstanding invoices (sample data)
  const outstandingInvoices = [
    { id: "INV-1002", customer: "XYZ Industries", amount: 1800, dueDate: "Jun 25, 2023", status: "Current", age: 5 },
    { id: "INV-1003", customer: "123 Properties", amount: 3200, dueDate: "Jun 10, 2023", status: "Overdue", age: 20 },
    { id: "INV-1005", customer: "City Hospital", amount: 4100, dueDate: "Jun 15, 2023", status: "Overdue", age: 15 },
    { id: "INV-1008", customer: "Global Services", amount: 2500, dueDate: "May 28, 2023", status: "Overdue", age: 33 },
    { id: "INV-1010", customer: "Metro Retail", amount: 1200, dueDate: "May 15, 2023", status: "Overdue", age: 46 },
    { id: "INV-1012", customer: "Sunshine Apartments", amount: 3800, dueDate: "Apr 30, 2023", status: "Overdue", age: 61 },
    { id: "INV-1015", customer: "Downtown Office", amount: 4200, dueDate: "Apr 22, 2023", status: "Overdue", age: 69 },
  ];

  // Payment history (sample data)
  const paymentHistory = [
    { id: "PMT-1001", invoice: "INV-1001", customer: "Acme Corp", amount: 2500, date: "Jun 12, 2023", method: "Credit Card" },
    { id: "PMT-1002", invoice: "INV-1004", customer: "Global Services", amount: 950, date: "Jun 5, 2023", method: "Bank Transfer" },
    { id: "PMT-1003", invoice: "INV-1006", customer: "First Bank", amount: 1800, date: "Jun 8, 2023", method: "Check" },
    { id: "PMT-1004", invoice: "INV-1007", customer: "Tech Solutions", amount: 3200, date: "Jun 10, 2023", method: "Credit Card" },
    { id: "PMT-1005", invoice: "INV-1009", customer: "Green Energy", amount: 2100, date: "Jun 15, 2023", method: "Bank Transfer" },
  ];

  // Calculate aging totals
  const currentTotal = 42000;
  const days1to30Total = 28000;
  const days31to60Total = 15000;
  const days61PlusTotal = 8000;
  const totalOutstanding = currentTotal + days1to30Total + days31to60Total + days61PlusTotal;

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
            <h1 className="text-3xl font-bold">Accounts Receivable Aging</h1>
            <p className="text-gray-500 mt-1">Track and manage outstanding invoices</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
              <SelectItem value="thisyear">This Year</SelectItem>
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
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="invoices">Outstanding Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalOutstanding)}</h3>
                    <p className="text-sm text-orange-600 mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> {formatPercentage(totalOutstanding / (totalOutstanding + metrics.invoices.totalRevenue) * 100)} of total invoiced
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current (Not Due)</p>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(currentTotal)}</h3>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> {formatPercentage(currentTotal / totalOutstanding * 100)} of total
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
                    <p className="text-sm font-medium text-gray-500">1-30 Days Past Due</p>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(days1to30Total)}</h3>
                    <p className="text-sm text-blue-600 mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> {formatPercentage(days1to30Total / totalOutstanding * 100)} of total
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">31+ Days Past Due</p>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(days31to60Total + days61PlusTotal)}</h3>
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" /> {formatPercentage((days31to60Total + days61PlusTotal) / totalOutstanding * 100)} of total
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative">
              <SampleDataOverlay show={metrics.invoices.outstandingRevenue === 0} />
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
              <SampleDataOverlay show={metrics.invoices.outstandingRevenue === 0} />
              <DonutChart
                title="AR by Customer Type"
                description="Outstanding amounts by customer segment"
                data={arByCustomerData}
                labels={arByCustomerLabels}
                colors={arByCustomerColors}
                height={300}
              />
            </div>
          </div>

          {/* AR Aging Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Aging Summary</CardTitle>
              <CardDescription>Breakdown of outstanding invoices by age</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Aging Period</th>
                      <th className="text-right py-3 px-4">Amount</th>
                      <th className="text-right py-3 px-4">% of Total</th>
                      <th className="text-right py-3 px-4">Invoices</th>
                      <th className="text-center py-3 px-4">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">Current (Not Due)</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(currentTotal)}</td>
                      <td className="py-3 px-4 text-right">{formatPercentage(currentTotal / totalOutstanding * 100)}</td>
                      <td className="py-3 px-4 text-right">12</td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge variant="completed" size="sm">Low</StatusBadge>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">1-30 Days Past Due</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(days1to30Total)}</td>
                      <td className="py-3 px-4 text-right">{formatPercentage(days1to30Total / totalOutstanding * 100)}</td>
                      <td className="py-3 px-4 text-right">8</td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge variant="pending" size="sm">Medium</StatusBadge>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">31-60 Days Past Due</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(days31to60Total)}</td>
                      <td className="py-3 px-4 text-right">{formatPercentage(days31to60Total / totalOutstanding * 100)}</td>
                      <td className="py-3 px-4 text-right">5</td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge variant="overdue" size="sm">High</StatusBadge>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4">61+ Days Past Due</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(days61PlusTotal)}</td>
                      <td className="py-3 px-4 text-right">{formatPercentage(days61PlusTotal / totalOutstanding * 100)}</td>
                      <td className="py-3 px-4 text-right">3</td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge variant="overdue" size="sm">Critical</StatusBadge>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-gray-50 font-medium">
                      <td className="py-3 px-4">Total</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(totalOutstanding)}</td>
                      <td className="py-3 px-4 text-right">100%</td>
                      <td className="py-3 px-4 text-right">28</td>
                      <td className="py-3 px-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outstanding Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
              <CardDescription>Detailed list of unpaid invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Invoice #</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-right py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Due Date</th>
                      <th className="text-right py-3 px-4">Age (Days)</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outstandingInvoices.map((invoice, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4">{invoice.id}</td>
                        <td className="py-3 px-4">{invoice.customer}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(invoice.amount)}</td>
                        <td className="py-3 px-4">{invoice.dueDate}</td>
                        <td className="py-3 px-4 text-right">{invoice.age}</td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge
                            variant={invoice.status === 'Current' ? 'completed' : 
                              invoice.age <= 30 ? 'pending' : 'overdue'}
                            size="sm"
                          >
                            {invoice.status}
                          </StatusBadge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">View</Button>
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

        {/* Payment History Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>History of received payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Payment ID</th>
                      <th className="text-left py-3 px-4">Invoice #</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-right py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Method</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4">{payment.id}</td>
                        <td className="py-3 px-4">{payment.invoice}</td>
                        <td className="py-3 px-4">{payment.customer}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(payment.amount)}</td>
                        <td className="py-3 px-4">{payment.date}</td>
                        <td className="py-3 px-4">{payment.method}</td>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
