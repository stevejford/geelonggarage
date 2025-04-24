import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, FileText, Eye, Clipboard, Check, X, Filter, ArrowUpDown, MoreHorizontal, PieChart, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
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
import { SampleDataOverlay } from "@/components/ui/sample-data-overlay";

export default function QuotesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Fetch quotes with optional filtering
  const quotesData = useQuery(api.quotes.getQuotes, {
    search: search || undefined,
    status: statusFilter || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Ensure quotes is always an array
  const quotes = Array.isArray(quotesData) ? quotesData : [];

  // Calculate quote status counts for the chart
  const statusCounts = {
    Draft: 0,
    Presented: 0,
    Accepted: 0,
    Declined: 0
  };

  // Calculate monthly quote totals for the chart
  const monthlyTotals = {
    Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
    Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
  };

  // Add some sample data for better visualization if no real data exists
  const currentMonth = new Date().getMonth();
  const monthNames = Object.keys(monthlyTotals);

  let totalQuoteValue = 0;
  let acceptanceRate = 0;
  let avgQuoteValue = 0;

  quotes.forEach(quote => {
    // Count by status
    if (quote.status in statusCounts) {
      statusCounts[quote.status as keyof typeof statusCounts]++;
    }

    // Sum total quote value
    totalQuoteValue += quote.total;

    // Add to monthly totals
    const month = new Date(quote.issueDate).getMonth();
    const monthNames = Object.keys(monthlyTotals);
    monthlyTotals[monthNames[month] as keyof typeof monthlyTotals] += quote.total;
  });

  // Calculate average quote value
  avgQuoteValue = quotes.length > 0 ? totalQuoteValue / quotes.length : 0;

  // Calculate acceptance rate
  const totalResponded = statusCounts.Accepted + statusCounts.Declined;
  acceptanceRate = totalResponded > 0 ? (statusCounts.Accepted / totalResponded) * 100 : 0;

  // If there's no real data at all, add sample data for better visualization
  const hasRealQuoteData = quotes.length > 0;
  const hasAnyStatusData = Object.values(statusCounts).some(count => count > 0);
  const hasAnyMonthlyData = Object.values(monthlyTotals).some(value => value > 0);

  if (!hasRealQuoteData && !hasAnyStatusData) {
    // Only add sample status counts if there's no real status data
    statusCounts.Draft = 3;
    statusCounts.Presented = 4;
    statusCounts.Accepted = 8;
    statusCounts.Declined = 2;
  }

  if (!hasRealQuoteData && !hasAnyMonthlyData) {
    // Only add sample monthly data if there's no real monthly data
    for (let i = 0; i < 12; i++) {
      // Create a bell curve-like distribution centered around current month
      const distanceFromCurrent = Math.abs(i - currentMonth);
      const factor = Math.max(0, 1 - (distanceFromCurrent / 6));
      const monthName = monthNames[i] as keyof typeof monthlyTotals;
      monthlyTotals[monthName] = Math.round(300 + (4000 * factor) + (Math.random() * 500));
    }
  }

  if (!hasRealQuoteData && totalQuoteValue === 0) {
    // Only set sample metrics if there are no real metrics
    totalQuoteValue = 4399.67;
    avgQuoteValue = 439.97;
    acceptanceRate = 80.0;
  }

  // Prepare chart data
  const quoteStatusData = [
    statusCounts.Draft,
    statusCounts.Presented,
    statusCounts.Accepted,
    statusCounts.Declined
  ];

  const quoteStatusLabels = ["Draft", "Presented", "Accepted", "Declined"];
  const quoteStatusColors = ["#6b7280", "#3b82f6", "#10b981", "#ef4444"];

  const monthlyQuoteData = [
    {
      name: "Quote Value",
      data: Object.values(monthlyTotals)
    }
  ];

  const monthlyQuoteCategories = Object.keys(monthlyTotals);

  // Handle creating a new quote
  const handleCreateQuote = () => {
    navigate("/quotes/new");
  };

  // Handle viewing a quote
  const handleViewQuote = (quoteId: string) => {
    navigate(`/quotes/${quoteId}`);
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Get status badge with icon
  const getStatusBadge = (status: string) => {
    let icon;
    switch (status) {
      case "Draft":
        icon = <Clipboard className="h-3 w-3 mr-1" />;
        break;
      case "Presented":
        icon = <Eye className="h-3 w-3 mr-1" />;
        break;
      case "Accepted":
        icon = <Check className="h-3 w-3 mr-1" />;
        break;
      case "Declined":
        icon = <X className="h-3 w-3 mr-1" />;
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
        heading="Quotes"
        description="Manage customer quotes and estimates"
      >
        <Button onClick={handleCreateQuote}>
          <Plus className="mr-2 h-4 w-4" /> New Quote
        </Button>
      </PageHeader>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Quotes</CardTitle>
            <CardDescription>All quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <AnimatedNumber
                value={quotes.length}
                formatFn={(val) => Math.round(val).toString()}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Value</CardTitle>
            <CardDescription>Sum of all quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <AnimatedNumber
                value={totalQuoteValue}
                delay={0} // First card
                formatFn={(val) => formatCurrency(val)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. Quote Value</CardTitle>
            <CardDescription>Average per quote</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <AnimatedNumber
                value={avgQuoteValue}
                delay={150} // Second card
                formatFn={(val) => formatCurrency(val)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Acceptance Rate</CardTitle>
            <CardDescription>Accepted vs declined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <AnimatedNumber
                value={acceptanceRate}
                delay={300} // Third card
                formatFn={(val) => `${val.toFixed(1)}%`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <SampleDataOverlay show={!hasRealQuoteData || !hasAnyStatusData} />
          <DonutChart
            title="Quote Status Distribution"
            description="Breakdown by status"
            data={quoteStatusData}
            labels={quoteStatusLabels}
            colors={quoteStatusColors}
            height={350} // Increased height to accommodate legend
          />
        </div>

        <div className="relative">
          <SampleDataOverlay show={!hasRealQuoteData || !hasAnyMonthlyData} />
          <BarChart
            title="Monthly Quote Value"
            description="Quote value by month"
            data={monthlyQuoteData}
            categories={monthlyQuoteCategories}
            colors={["#3b82f6"]}
            height={300}
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search quotes..."
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
                <SelectItem value="Presented">Presented</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        {quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotes Yet</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Create your first quote to start tracking estimates and proposals for your customers.
            </p>
            <Button onClick={handleCreateQuote}>
              <Plus className="mr-2 h-4 w-4" /> Create Quote
            </Button>
          </div>
        ) : (
          <>
            <CardHeader className="pb-0">
              <CardTitle>All Quotes</CardTitle>
              <CardDescription>View and manage all your quotes</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Quote #</span>
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
                {quotes.map((quote) => (
                  <TableRow
                    key={quote._id.toString()}
                    className="cursor-pointer"
                    onClick={() => handleViewQuote(quote._id.toString())}
                  >
                    <TableCell>
                      <div className="font-medium">{quote.quoteNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {quote.contact ? `${quote.contact.firstName} ${quote.contact.lastName}` : 'Unknown'}
                      </div>
                      {quote.account && (
                        <div className="text-xs text-gray-500">
                          {quote.account.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-700">{formatDate(quote.issueDate)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(quote.total)}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={quote.status} />
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
                            handleViewQuote(quote._id.toString());
                          }}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Quote</DropdownMenuItem>
                          <DropdownMenuItem>Convert to Invoice</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete Quote</DropdownMenuItem>
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




