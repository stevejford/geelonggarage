import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, Receipt, CheckCircle, Send, AlertTriangle, XCircle, FileText, Filter, ArrowUpDown, MoreHorizontal, PieChart, BarChart3, DollarSign, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import DonutChart from "@/components/charts/DonutChart";
import BarChart from "@/components/charts/BarChart";
import LineChart from "@/components/charts/LineChart";

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Fetch invoices with optional filtering
  const invoicesData = useQuery(api.invoices.getInvoices, {
    search: search || undefined,
    status: statusFilter || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Ensure invoices is always an array
  const invoices = Array.isArray(invoicesData) ? invoicesData : [];

  // Check if an invoice is overdue
  const isOverdue = (invoice: any) => {
    if (invoice.status === "Paid" || invoice.status === "Void") {
      return false;
    }
    return invoice.dueDate < Date.now() && invoice.status === "Sent";
  };

  // Calculate invoice status counts for the chart
  const statusCounts = {
    Draft: 0,
    Sent: 0,
    Paid: 0,
    Void: 0,
    Overdue: 0
  };

  // Calculate monthly invoice totals for the chart
  const monthlyTotals = {
    Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
    Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
  };

  // Calculate payment timeline data
  const paymentTimeline = {
    "0-15": 0,   // Paid within 15 days
    "16-30": 0,  // Paid within 16-30 days
    "31-60": 0,  // Paid within 31-60 days
    "60+": 0     // Paid after 60+ days
  };

  let totalInvoiceValue = 0;
  let totalPaidValue = 0;
  let totalOverdueValue = 0;
  let avgDaysToPayment = 0;
  let totalDaysToPayment = 0;
  let paidInvoicesCount = 0;

  invoices.forEach(invoice => {
    // Count by status
    if (isOverdue(invoice)) {
      statusCounts.Overdue++;
      totalOverdueValue += invoice.total;
    } else if (invoice.status in statusCounts) {
      statusCounts[invoice.status as keyof typeof statusCounts]++;
    }

    // Sum total invoice value
    totalInvoiceValue += invoice.total;

    // Sum total paid value
    if (invoice.status === "Paid") {
      totalPaidValue += invoice.total;

      // Calculate days to payment if paid
      if (invoice.paidDate && invoice.issueDate) {
        const daysToPayment = Math.floor((invoice.paidDate - invoice.issueDate) / (1000 * 60 * 60 * 24));
        totalDaysToPayment += daysToPayment;
        paidInvoicesCount++;

        // Add to payment timeline
        if (daysToPayment <= 15) {
          paymentTimeline["0-15"]++;
        } else if (daysToPayment <= 30) {
          paymentTimeline["16-30"]++;
        } else if (daysToPayment <= 60) {
          paymentTimeline["31-60"]++;
        } else {
          paymentTimeline["60+"]++;
        }
      }
    }

    // Add to monthly totals
    const month = new Date(invoice.issueDate).getMonth();
    const monthNames = Object.keys(monthlyTotals);
    monthlyTotals[monthNames[month]] += invoice.total;
  });

  // Calculate average days to payment
  avgDaysToPayment = paidInvoicesCount > 0 ? Math.round(totalDaysToPayment / paidInvoicesCount) : 0;

  // Prepare chart data
  const invoiceStatusData = [
    statusCounts.Draft,
    statusCounts.Sent,
    statusCounts.Paid,
    statusCounts.Void,
    statusCounts.Overdue
  ];

  const invoiceStatusLabels = ["Draft", "Sent", "Paid", "Void", "Overdue"];
  const invoiceStatusColors = ["#6b7280", "#3b82f6", "#10b981", "#ef4444", "#f59e0b"];

  const monthlyInvoiceData = [
    {
      name: "Invoice Value",
      data: Object.values(monthlyTotals)
    }
  ];

  const monthlyInvoiceCategories = Object.keys(monthlyTotals);

  const paymentTimelineData = [
    {
      name: "Payment Timeline",
      data: Object.values(paymentTimeline)
    }
  ];

  const paymentTimelineCategories = ["0-15 days", "16-30 days", "31-60 days", "60+ days"];

  // Handle creating a new invoice
  const handleCreateInvoice = () => {
    navigate("/invoices/new");
  };

  // Handle viewing an invoice
  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };



  // Get status badge color
  const getStatusBadge = (invoice: any) => {
    // Check for overdue first
    if (isOverdue(invoice)) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          <AlertTriangle className="inline-block w-3 h-3 mr-1" />
          Overdue
        </span>
      );
    }

    switch (invoice.status) {
      case "Draft":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            <FileText className="inline-block w-3 h-3 mr-1" />
            {invoice.status}
          </span>
        );
      case "Sent":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <Send className="inline-block w-3 h-3 mr-1" />
            {invoice.status}
          </span>
        );
      case "Paid":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="inline-block w-3 h-3 mr-1" />
            {invoice.status}
          </span>
        );
      case "Void":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <XCircle className="inline-block w-3 h-3 mr-1" />
            {invoice.status}
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {invoice.status}
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-500 mt-1">Manage customer billing and payments</p>
        </div>
        <Button onClick={handleCreateInvoice}>
          <Plus className="mr-2 h-4 w-4" /> New Invoice
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Outstanding</CardTitle>
            <CardDescription>Unpaid invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalInvoiceValue - totalPaidValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Overdue</CardTitle>
            <CardDescription>Past due invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{formatCurrency(totalOverdueValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Paid</CardTitle>
            <CardDescription>Collected revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatCurrency(totalPaidValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. Days to Pay</CardTitle>
            <CardDescription>Payment timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-3xl font-bold">{avgDaysToPayment}</span>
              <span className="ml-1 text-gray-500">days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DonutChart
          title="Invoice Status Distribution"
          description="Breakdown by status"
          data={invoiceStatusData}
          labels={invoiceStatusLabels}
          colors={invoiceStatusColors}
          height={300}
        />

        <BarChart
          title="Monthly Invoice Value"
          description="Invoice value by month"
          data={monthlyInvoiceData}
          categories={monthlyInvoiceCategories}
          colors={["#3b82f6"]}
          height={300}
        />
      </div>

      <BarChart
        title="Payment Timeline Analysis"
        description="How quickly invoices are paid"
        data={paymentTimelineData}
        categories={paymentTimelineCategories}
        colors={["#10b981"]}
        height={250}
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search invoices..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter || "all"}
              onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Void">Void</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Date (Newest)</DropdownMenuItem>
                <DropdownMenuItem>Date (Oldest)</DropdownMenuItem>
                <DropdownMenuItem>Amount (High to Low)</DropdownMenuItem>
                <DropdownMenuItem>Amount (Low to High)</DropdownMenuItem>
                <DropdownMenuItem>Due Date (Soonest)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Yet</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Create your first invoice to start billing your customers and tracking payments.
            </p>
            <Button onClick={handleCreateInvoice}>
              <Plus className="mr-2 h-4 w-4" /> Create Invoice
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-700 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span>Invoice #</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-700 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span>Customer</span>
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-700 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-700 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span>Due Date</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-700 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span>Amount</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-700 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                    </div>
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-gray-700 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice._id.toString()}
                    className="border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-blue-50 cursor-pointer"
                    onClick={() => handleViewInvoice(invoice._id.toString())}
                  >
                    <td className="p-4 align-middle">
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="font-medium">
                        {invoice.contact ? `${invoice.contact.firstName} ${invoice.contact.lastName}` : 'Unknown'}
                      </div>
                      {invoice.account && (
                        <div className="text-xs text-gray-500">
                          {invoice.account.name}
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="text-gray-700">{formatDate(invoice.issueDate)}</div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className={isOverdue(invoice) ? 'text-red-600 font-medium' : 'text-gray-700'}>
                        {formatDate(invoice.dueDate)}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="font-medium">{formatCurrency(invoice.total)}</div>
                    </td>
                    <td className="p-4 align-middle">
                      <StatusBadge status={isOverdue(invoice) ? "Overdue" : invoice.status} />
                    </td>
                    <td className="p-4 align-middle text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleViewInvoice(invoice._id.toString());
                          }}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Invoice</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Void Invoice</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
