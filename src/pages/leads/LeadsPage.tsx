import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users, Filter, ArrowUpDown, MoreHorizontal, PieChart, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DonutChart from "@/components/charts/DonutChart";

export default function LeadsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Fetch leads with optional filtering
  const leadsData = useQuery(api.leads.getLeads, {
    search: search || undefined,
    status: statusFilter || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Ensure leads is always an array
  const leads = Array.isArray(leadsData) ? leadsData : [];

  // Calculate lead status counts for the chart
  const statusCounts = {
    New: 0,
    Contacted: 0,
    Qualified: 0,
    Unqualified: 0,
    Converted: 0
  };

  leads.forEach(lead => {
    if (lead.status in statusCounts) {
      statusCounts[lead.status as keyof typeof statusCounts]++;
    }
  });

  const leadStatusData = [
    statusCounts.New,
    statusCounts.Contacted,
    statusCounts.Qualified,
    statusCounts.Unqualified,
    statusCounts.Converted
  ];

  const leadStatusLabels = ["New", "Contacted", "Qualified", "Unqualified", "Converted"];
  const leadStatusColors = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

  // Handle creating a new lead
  const handleCreateLead = () => {
    navigate("/leads/new");
  };

  // Handle viewing a lead
  const handleViewLead = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  // Status filter options
  const statusOptions = [
    { value: null, label: "All Statuses" },
    { value: "New", label: "New" },
    { value: "Contacted", label: "Contacted" },
    { value: "Qualified", label: "Qualified" },
    { value: "Unqualified", label: "Unqualified" },
    { value: "Converted", label: "Converted" },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-gray-500 mt-1">Manage your sales pipeline</p>
        </div>
        <Button onClick={handleCreateLead}>
          <Plus className="mr-2 h-4 w-4" /> New Lead
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Lead Status Distribution</CardTitle>
              <CardDescription>Overview of your leads by status</CardDescription>
            </CardHeader>
            <CardContent>
              <DonutChart
                title=""
                data={leadStatusData}
                labels={leadStatusLabels}
                colors={leadStatusColors}
                height={250}
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Lead Summary</CardTitle>
              <CardDescription>Quick stats about your leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Leads</span>
                  <span className="text-2xl font-bold">{leads.length}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  {leadStatusLabels.map((label, index) => (
                    <div key={label} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: leadStatusColors[index] }}></div>
                        <span className="text-sm">{label}</span>
                      </div>
                      <span className="font-medium">{leadStatusData[index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
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
                placeholder="Search leads..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter || ""}
              onValueChange={(value) => setStatusFilter(value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.label} value={option.value || ""}>
                    {option.label}
                  </SelectItem>
                ))}
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
                <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
                <DropdownMenuItem>Date (Newest)</DropdownMenuItem>
                <DropdownMenuItem>Date (Oldest)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <div className="rounded-md border">
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-700 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-700 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <span>Contact Info</span>
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-700 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <span>Source</span>
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-700 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-700 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-gray-700 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 mb-1">No leads found</p>
                      <p className="text-sm text-gray-400">Create your first lead to get started</p>
                      <Button
                        className="mt-4"
                        onClick={handleCreateLead}
                      >
                        <Plus className="mr-2 h-4 w-4" /> New Lead
                      </Button>
                    </div>
                  </td>
                </tr>
              )}

              {leads.map((lead) => (
                <tr
                  key={lead._id.toString()}
                  className="border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-blue-50 cursor-pointer"
                  onClick={() => handleViewLead(lead._id.toString())}
                >
                  <td className="p-4 align-middle">
                    <div className="font-medium">{lead.name}</div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="text-gray-500 space-y-1">
                      {lead.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400" /> {lead.email}
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400" /> {lead.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    {lead.source ? (
                      <Badge variant="secondary" className="font-normal">
                        {lead.source}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="p-4 align-middle">
                    <div className="text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
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
                          handleViewLead(lead._id.toString());
                        }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Lead</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete Lead</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
