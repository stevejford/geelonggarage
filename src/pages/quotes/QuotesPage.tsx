import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, FileText, Eye, Clipboard, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";

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

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            <Clipboard className="inline-block w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case "Presented":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <Eye className="inline-block w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case "Accepted":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <Check className="inline-block w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case "Declined":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <X className="inline-block w-3 h-3 mr-1" />
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quotes</h1>
          <p className="text-gray-500 mt-1">Manage customer quotes and estimates</p>
        </div>
        <Button
          onClick={handleCreateQuote}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> New Quote
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search quotes..."
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
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Presented">Presented</option>
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotes Yet</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Create your first quote to start tracking estimates and proposals for your customers.
            </p>
            <Button
              onClick={handleCreateQuote}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Quote
            </Button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quote #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotes.map((quote) => (
                <tr
                  key={quote._id.toString()}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleViewQuote(quote._id.toString())}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{quote.quoteNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {quote.contact ? `${quote.contact.firstName} ${quote.contact.lastName}` : 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {quote.account ? quote.account.name : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(quote.issueDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(quote.total)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(quote.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewQuote(quote._id.toString());
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


