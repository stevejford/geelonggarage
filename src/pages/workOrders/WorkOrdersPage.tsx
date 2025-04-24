import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, ClipboardList, Calendar, CheckCircle, Clock, AlertCircle, XCircle, Filter, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

  // Get status badge with icon
  const getStatusBadge = (status: string) => {
    let icon;
    switch (status) {
      case "Pending":
        icon = <Clock className="h-3 w-3 mr-1" />;
        break;
      case "Scheduled":
        icon = <Calendar className="h-3 w-3 mr-1" />;
        break;
      case "In Progress":
        icon = <Clock className="h-3 w-3 mr-1" />;
        break;
      case "Completed":
        icon = <CheckCircle className="h-3 w-3 mr-1" />;
        break;
      case "On Hold":
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        break;
      case "Cancelled":
        icon = <XCircle className="h-3 w-3 mr-1" />;
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
        heading="Work Orders"
        description="Manage service and installation jobs"
      >
        <Button
          onClick={handleCreateWorkOrder}
        >
          <Plus className="mr-2 h-4 w-4" /> New Work Order
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Filter work orders by status or search term</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search work orders..."
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
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        {workOrders.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Orders Yet</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Create your first work order to start tracking service and installation jobs.
            </p>
            <Button
              onClick={handleCreateWorkOrder}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Work Order
            </Button>
          </CardContent>
        ) : (
          <>
            <CardHeader className="pb-0">
              <CardTitle>All Work Orders</CardTitle>
              <CardDescription>View and manage all your work orders</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((workOrder) => (
                    <TableRow
                      key={workOrder._id.toString()}
                      className="cursor-pointer"
                      onClick={() => handleViewWorkOrder(workOrder._id.toString())}
                    >
                      <TableCell>
                        <div className="font-medium">{workOrder.workOrderNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {workOrder.contact ? `${workOrder.contact.firstName} ${workOrder.contact.lastName}` : 'Unknown'}
                        </div>
                        {workOrder.account && (
                          <div className="text-xs text-gray-500">
                            {workOrder.account.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-700">
                          {workOrder.scheduledDate ? formatDate(workOrder.scheduledDate) : 'Not scheduled'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(workOrder.status)}
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
                              handleViewWorkOrder(workOrder._id.toString());
                            }}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Work Order</DropdownMenuItem>
                            <DropdownMenuItem>Update Status</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Cancel Work Order</DropdownMenuItem>
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
