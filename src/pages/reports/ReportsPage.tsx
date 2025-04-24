import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Clock,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Search,
  ArrowRight,
  Star,
  Truck,
  Wrench,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Report categories
  const categories = [
    { id: "all", name: "All Reports" },
    { id: "sales", name: "Sales" },
    { id: "finance", name: "Finance" },
    { id: "operations", name: "Operations" },
    { id: "customers", name: "Customers" }
  ];

  // Report definitions
  const reports = [
    {
      id: "sales-performance",
      name: "Sales Performance",
      description: "Revenue, orders, and sales team metrics",
      icon: <BarChart3 className="h-10 w-10 text-blue-600" />,
      category: "sales",
      path: "/reports/sales-performance",
      popular: true
    },
    {
      id: "ar-aging",
      name: "Accounts Receivable Aging",
      description: "Track outstanding invoices by age",
      icon: <Clock className="h-10 w-10 text-orange-600" />,
      category: "finance",
      path: "/reports/accounts-receivable",
      popular: true
    },
    {
      id: "customer-acquisition",
      name: "Customer Acquisition",
      description: "Lead sources and conversion rates",
      icon: <Users className="h-10 w-10 text-green-600" />,
      category: "customers",
      path: "/reports/customer-acquisition",
      popular: false
    },
    {
      id: "quote-analysis",
      name: "Quote Analysis",
      description: "Quote acceptance rates and trends",
      icon: <FileText className="h-10 w-10 text-purple-600" />,
      category: "sales",
      path: "/reports/quote-analysis",
      popular: false
    },
    {
      id: "revenue-forecast",
      name: "Revenue Forecast",
      description: "Projected revenue based on pipeline",
      icon: <TrendingUp className="h-10 w-10 text-indigo-600" />,
      category: "finance",
      path: "/reports/revenue-forecast",
      popular: true
    },
    {
      id: "technician-efficiency",
      name: "Technician Efficiency",
      description: "Job completion times and ratings",
      icon: <Wrench className="h-10 w-10 text-cyan-600" />,
      category: "operations",
      path: "/reports/technician-efficiency",
      popular: false
    },
    {
      id: "customer-satisfaction",
      name: "Customer Satisfaction",
      description: "Feedback scores and trends",
      icon: <Star className="h-10 w-10 text-yellow-600" />,
      category: "customers",
      path: "/reports/customer-satisfaction",
      popular: false
    },
    {
      id: "inventory-management",
      name: "Inventory Management",
      description: "Stock levels and usage trends",
      icon: <Truck className="h-10 w-10 text-gray-600" />,
      category: "operations",
      path: "/reports/inventory-management",
      popular: false
    },
    {
      id: "profit-loss",
      name: "Profit & Loss",
      description: "Comprehensive P&L statement",
      icon: <PieChart className="h-10 w-10 text-green-600" />,
      category: "finance",
      path: "/reports/profit-loss",
      popular: true
    }
  ];

  // Filter reports based on search query and active tab
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === "all" || report.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  // Get popular reports
  const popularReports = reports.filter(report => report.popular);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-gray-500 mt-1">Access and generate business reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Reports
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Create Custom Report
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Search reports..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Report Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All Reports Tab */}
        <TabsContent value="all" className="mt-6">
          {searchQuery === "" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Popular Reports</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {popularReports.map(report => (
                  <Link to={report.path} key={report.id}>
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="mb-4">{report.icon}</div>
                        <h3 className="font-medium text-lg mb-1">{report.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                        <div className="mt-auto flex items-center text-blue-600 text-sm font-medium">
                          View Report <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}

          <h2 className="text-xl font-semibold mb-4">{searchQuery ? "Search Results" : "All Reports"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(report => (
              <Link to={report.path} key={report.id}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-4">{report.icon}</div>
                    <h3 className="font-medium text-lg mb-1">{report.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                    <div className="mt-auto flex items-center text-blue-600 text-sm font-medium">
                      View Report <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        {/* Category-specific Tabs */}
        {categories.slice(1).map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map(report => (
                <Link to={report.path} key={report.id}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="mb-4">{report.icon}</div>
                      <h3 className="font-medium text-lg mb-1">{report.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                      <div className="mt-auto flex items-center text-blue-600 text-sm font-medium">
                        View Report <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
