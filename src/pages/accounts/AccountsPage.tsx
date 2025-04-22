import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, Building2, Filter, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    { value: "all", label: "All Types" },
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
    { value: "Industrial", label: "Industrial" },
    { value: "Other", label: "Other" },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-gray-500 mt-1">Manage your customer properties and businesses</p>
        </div>
        <Button onClick={handleCreateAccount}>
          <Plus className="mr-2 h-4 w-4" /> New Account
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search accounts..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={typeFilter || "all"}
              onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.label} value={option.value}>
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
                <DropdownMenuItem>Type</DropdownMenuItem>
                <DropdownMenuItem>Date Added</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
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
                    <span>Type</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-700 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <span>Address</span>
                  </div>
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-gray-700 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <div className="flex flex-col items-center">
                      <Building2 className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 mb-1">No accounts found</p>
                      <p className="text-sm text-gray-400">Create your first account to get started</p>
                      <Button
                        className="mt-4"
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
                  className="border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-blue-50 cursor-pointer"
                  onClick={() => handleViewAccount(account._id.toString())}
                >
                  <td className="p-4 align-middle">
                    <div className="font-medium">{account.name}</div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="text-gray-700">{account.type}</div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="text-gray-700">
                      {account.address}
                      {account.city && `, ${account.city}`}
                      {account.state && `, ${account.state}`}
                      {account.zip && ` ${account.zip}`}
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
                          handleViewAccount(account._id.toString());
                        }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Account</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete Account</DropdownMenuItem>
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
