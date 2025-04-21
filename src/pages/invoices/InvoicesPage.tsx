import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, Receipt, CheckCircle, Send, AlertTriangle, XCircle, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";

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

  // Handle creating a new invoice
  const handleCreateInvoice = () => {
    navigate("/invoices/new");
  };

  // Handle viewing an invoice
  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  // Check if an invoice is overdue
  const isOverdue = (invoice: any) => {
    if (invoice.status === "Paid" || invoice.status === "Void") {
      return false;
    }
    return invoice.dueDate < Date.now() && invoice.status === "Sent";
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
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-gray-500 mt-1">Manage customer billing and payments</p>
        </div>
        <Button
          onClick={handleCreateInvoice}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> New Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search invoices..."
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
            <option value="Sent">Sent</option>
            <option value="Paid">Paid</option>
            <option value="Void">Void</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Yet</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Create your first invoice to start billing your customers and tracking payments.
            </p>
            <Button
              onClick={handleCreateInvoice}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Invoice
            </Button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
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
              {invoices.map((invoice) => (
                <tr
                  key={invoice._id.toString()}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleViewInvoice(invoice._id.toString())}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.contact ? `${invoice.contact.firstName} ${invoice.contact.lastName}` : 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {invoice.account ? invoice.account.name : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(invoice.issueDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isOverdue(invoice) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {formatDate(invoice.dueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.total)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewInvoice(invoice._id.toString());
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
