import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, Receipt, CheckCircle, Send, AlertTriangle, XCircle, FileText, Filter, ArrowUpDown, MoreHorizontal, PieChart, BarChart3, DollarSign, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import DonutChart from "@/components/charts/DonutChart";
import BarChart from "@/components/charts/BarChart";
import LineChart from "@/components/charts/LineChart";
import { SampleDataOverlay } from "@/components/ui/sample-data-overlay";

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

  // Add some sample data for better visualization if no real data exists
  const currentMonth = new Date().getMonth();
  const monthNames = Object.keys(monthlyTotals);

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
      if (invoice.status === "Paid" && invoice.issueDate) {
        const daysToPayment = Math.floor((invoice.updatedAt - invoice.issueDate) / (1000 * 60 * 60 * 24));
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
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
    monthlyTotals[monthNames[month] as keyof typeof monthlyTotals] += invoice.total;
  });

  // Calculate average days to payment
  avgDaysToPayment = paidInvoicesCount > 0 ? Math.round(totalDaysToPayment / paidInvoicesCount) : 0;

  // If there's no real data at all, add sample data for better visualization
  const hasRealInvoiceData = invoices.length > 0;
  const hasAnyStatusData = Object.values(statusCounts).some(count => count > 0);
  const hasAnyMonthlyData = Object.values(monthlyTotals).some(value => value > 0);
  const hasAnyTimelineData = Object.values(paymentTimeline).some(count => count > 0);

  if (!hasRealInvoiceData && !hasAnyStatusData) {
    // Only add sample status counts if there's no real status data
    statusCounts.Draft = 2;
    statusCounts.Sent = 3;
    statusCounts.Paid = 5;
    statusCounts.Void = 1;
    statusCounts.Overdue = 2;
  }

  if (!hasRealInvoiceData && !hasAnyMonthlyData) {
    // Only add sample monthly data if there's no real monthly data
    for (let i = 0; i < 12; i++) {
      // Create a bell curve-like distribution centered around current month
      const distanceFromCurrent = Math.abs(i - currentMonth);
      const factor = Math.max(0, 1 - (distanceFromCurrent / 6));
      const month = monthNames[i] as keyof typeof monthlyTotals;
      monthlyTotals[month] = Math.round(500 + (1500 * factor) + (Math.random() * 300));
    }
  }

  if (!hasRealInvoiceData && !hasAnyTimelineData) {
    // Only add sample payment timeline data if there's no real timeline data
    paymentTimeline["0-15"] = 3;
    paymentTimeline["16-30"] = 2;
    paymentTimeline["31-60"] = 1;
    paymentTimeline["60+"] = 1;
  }

  if (!hasRealInvoiceData && totalInvoiceValue === 0 && totalPaidValue === 0) {
    // Only set sample metrics if there are no real metrics
    totalInvoiceValue = 4500;
    totalPaidValue = 2500;
    totalOverdueValue = 1200;
    avgDaysToPayment = 18;
  }

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



  // Get status badge with icon
  const getStatusBadge = (invoice: any) => {
    let icon;
    let status = isOverdue(invoice) ? "Overdue" : invoice.status;

    switch (status) {
      case "Draft":
        icon = <FileText className="h-3 w-3 mr-1" />;
        break;
      case "Sent":
        icon = <Send className="h-3 w-3 mr-1" />;
        break;
      case "Paid":
        icon = <CheckCircle className="h-3 w-3 mr-1" />;
        break;
      case "Void":
        icon = <XCircle className="h-3 w-3 mr-1" />;
        break;
      case "Overdue":
        icon = <AlertTriangle className="h-3 w-3 mr-1" />;
        break;
      default:
        icon = null;
        break;
    }

    return (
      <StatusBadge status={status} className="inline-flex items-center">
        {icon}
        {status}
      </StatusBadge>
    );
  };

  return (
    <Container size="xl" padding="md" className="space-y-6">
      <PageHeader
        heading="Invoices"
        description="Manage customer billing and payments"
      >
        <Button onClick={handleCreateInvoice}>
          <Plus className="mr-2 h-4 w-4" /> New Invoice
        </Button>
      </PageHeader>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Outstanding</CardTitle>
            <CardDescription>Unpaid invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <AnimatedNumber
                value={totalInvoiceValue - totalPaidValue}
                delay={0} // First card
                formatFn={(val) => formatCurrency(val)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Overdue</CardTitle>
            <CardDescription>Past due invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              <AnimatedNumber
                value={totalOverdueValue}
                delay={150} // Second card
                formatFn={(val) => formatCurrency(val)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Paid</CardTitle>
            <CardDescription>Collected revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              <AnimatedNumber
                value={totalPaidValue}
                delay={300} // Third card
                formatFn={(val) => formatCurrency(val)}
              />
            </div>
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
              <span className="text-3xl font-bold">
                <AnimatedNumber
                  value={avgDaysToPayment}
                  delay={450} // Fourth card
                  formatFn={(val) => Math.round(val).toString()}
                />
              </span>
              <span className="ml-1 text-gray-500">days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <SampleDataOverlay show={!hasRealInvoiceData || !hasAnyStatusData} />
          <DonutChart
            title="Invoice Status Distribution"
            description="Breakdown by status"
            data={invoiceStatusData}
            labels={invoiceStatusLabels}
            colors={invoiceStatusColors}
            height={350} // Increased height to accommodate legend
          />
        </div>

        <div className="relative">
          <SampleDataOverlay show={!hasRealInvoiceData || !hasAnyMonthlyData} />
          <BarChart
            title="Monthly Invoice Value"
            description="Invoice value by month"
            data={monthlyInvoiceData}
            categories={monthlyInvoiceCategories}
            colors={["#3b82f6"]}
            height={300}
          />
        </div>
      </div>

      <div className="relative">
        <SampleDataOverlay show={!hasRealInvoiceData || !hasAnyTimelineData} />
        <BarChart
          title="Payment Timeline Analysis"
          description="How quickly invoices are paid"
          data={paymentTimelineData}
          categories={paymentTimelineCategories}
          colors={["#10b981"]}
          height={250}
        />
      </div>

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
          <>
            <CardHeader className="pb-0">
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>View and manage all your invoices</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Invoice #</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Customer</span>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Due Date</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Amount</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow
                    key={invoice._id.toString()}
                    className="cursor-pointer"
                    onClick={() => handleViewInvoice(invoice._id.toString())}
                  >
                    <TableCell>
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {invoice.contact ? `${invoice.contact.firstName} ${invoice.contact.lastName}` : 'Unknown'}
                      </div>
                      {invoice.account && (
                        <div className="text-xs text-gray-500">
                          {invoice.account.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-700">{formatDate(invoice.issueDate)}</div>
                    </TableCell>
                    <TableCell>
                      <div className={isOverdue(invoice) ? 'text-red-600 font-medium' : 'text-gray-700'}>
                        {formatDate(invoice.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(invoice.total)}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={isOverdue(invoice) ? "Overdue" : invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          </>
        )}
      </Card>
    </Container>
  );
}



