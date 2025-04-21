import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import LeadStatusBadge from "@/components/leads/LeadStatusBadge";

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
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-gray-500 mt-1">Manage your sales pipeline</p>
        </div>
        <Button onClick={handleCreateLead} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search leads..."
              className="pl-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter || ""}
            onChange={(e) => setStatusFilter(e.target.value || null)}
          >
            {statusOptions.map((option) => (
              <option key={option.label} value={option.value || ""}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center">
                    <Users className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-gray-500 mb-1">No leads found</p>
                    <p className="text-sm text-gray-400">Create your first lead to get started</p>
                    <Button
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
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
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleViewLead(lead._id.toString())}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {lead.email && (
                      <div className="flex items-center">
                        <span className="mr-1">📧</span> {lead.email}
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center">
                        <span className="mr-1">📱</span> {lead.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {lead.source ? (
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">{lead.source}</span>
                    ) : (
                      "—"
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewLead(lead._id.toString());
                    }}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
