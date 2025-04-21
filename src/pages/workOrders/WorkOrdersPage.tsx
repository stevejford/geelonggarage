import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, ClipboardList, Calendar, CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export default function WorkOrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Fetch work orders with optional filtering
  const workOrdersData = useQuery(api.workOrders.getWorkOrders, {
    search: search || undefined,
    status: statusFilter || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Ensure work orders is always an array
  const workOrders = Array.isArray(workOrdersData) ? workOrdersData : [];

  // Handle creating a new work order
  const handleCreateWorkOrder = () => {
    navigate("/work-orders/new");
  };

  // Handle viewing a work order
  const handleViewWorkOrder = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            <Clock className="inline-block w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case "Scheduled":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <Calendar className="inline-block w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case "In Progress":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock className="inline-block w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case "Completed":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="inline-block w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case "On Hold":
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
            <AlertCircle className="inline-block w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case "Cancelled":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <XCircle className="inline-block w-3 h-3 mr-1" />
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
          <h1 className="text-2xl font-bold">Work Orders</h1>
          <p className="text-gray-500 mt-1">Manage service and installation jobs</p>
        </div>
        <Button
          onClick={handleCreateWorkOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> New Work Order
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search work orders..."
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
            <option value="Pending">Pending</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {workOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Orders Yet</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Create your first work order to start tracking service and installation jobs.
            </p>
            <Button
              onClick={handleCreateWorkOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Work Order
            </Button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled Date
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
              {workOrders.map((workOrder) => (
                <tr
                  key={workOrder._id.toString()}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleViewWorkOrder(workOrder._id.toString())}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{workOrder.workOrderNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {workOrder.contact ? `${workOrder.contact.firstName} ${workOrder.contact.lastName}` : 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {workOrder.account ? workOrder.account.name : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {workOrder.scheduledDate ? formatDate(workOrder.scheduledDate) : 'Not scheduled'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(workOrder.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewWorkOrder(workOrder._id.toString());
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
