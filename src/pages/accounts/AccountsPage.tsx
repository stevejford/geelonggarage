import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function AccountsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  // Fetch accounts with optional filtering
  const accountsData = useQuery(api.accounts.getAccounts, {
    type: typeFilter || undefined,
    search: search || undefined,
    sortBy: "name",
    sortOrder: "asc",
  });

  // Ensure accounts is always an array
  const accounts = Array.isArray(accountsData) ? accountsData : [];

  // Handle creating a new account
  const handleCreateAccount = () => {
    navigate("/accounts/new");
  };

  // Handle viewing an account
  const handleViewAccount = (accountId: string) => {
    navigate(`/accounts/${accountId}`);
  };

  // Account type filter options
  const typeOptions = [
    { value: null, label: "All Types" },
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
    { value: "Industrial", label: "Industrial" },
    { value: "Other", label: "Other" },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-gray-500 mt-1">Manage your customer properties and businesses</p>
        </div>
        <Button onClick={handleCreateAccount} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Account
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search accounts..."
              className="pl-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={typeFilter || ""}
            onChange={(e) => setTypeFilter(e.target.value || null)}
          >
            {typeOptions.map((option) => (
              <option key={option.label} value={option.value || ""}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accounts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center">
                    <Building2 className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-gray-500 mb-1">No accounts found</p>
                    <p className="text-sm text-gray-400">Create your first account to get started</p>
                    <Button
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleCreateAccount}
                    >
                      <Plus className="mr-2 h-4 w-4" /> New Account
                    </Button>
                  </div>
                </td>
              </tr>
            )}

            {accounts.map((account) => (
              <tr
                key={account._id.toString()}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleViewAccount(account._id.toString())}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{account.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{account.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {account.address}
                    {account.city && `, ${account.city}`}
                    {account.state && `, ${account.state}`}
                    {account.zip && ` ${account.zip}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewAccount(account._id.toString());
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
