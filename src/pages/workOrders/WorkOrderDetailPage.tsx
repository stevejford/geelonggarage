import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  User,
  Receipt
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for confirmation dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  // Fetch work order details
  const workOrder = useQuery(api.workOrders.getWorkOrder, {
    id: id as any
  });

  // Mutations
  const deleteWorkOrder = useMutation(api.workOrders.deleteWorkOrder);
  const changeWorkOrderStatus = useMutation(api.workOrders.changeWorkOrderStatus);

  // Handle work order deletion
  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteWorkOrder({ id: id as any });
      navigate("/work-orders");
    } catch (error) {
      console.error("Error deleting work order:", error);
      alert("Failed to delete work order. Please try again.");
    }
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!id || !newStatus) return;

    try {
      await changeWorkOrderStatus({
        id: id as any,
        status: newStatus
      });
      setShowStatusDialog(false);
    } catch (error) {
      console.error("Error changing work order status:", error);
      alert("Failed to update work order status. Please try again.");
    }
  };

  // Open status change dialog
  const openStatusDialog = (status: string) => {
    setNewStatus(status);
    setShowStatusDialog(true);
  };

  // Create invoice from work order
  const createInvoice = () => {
    alert("Invoice creation will be implemented in a future update.");
  };

  if (!workOrder) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => navigate("/work-orders")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Loading Work Order...</h1>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get status badge with icon
  const getStatusBadge = (status: string) => {
    let icon;
    switch (status) {
      case "Pending":
        icon = <Clock className="inline-block w-4 h-4 mr-1" />;
        break;
      case "Scheduled":
        icon = <Calendar className="inline-block w-4 h-4 mr-1" />;
        break;
      case "In Progress":
        icon = <Clock className="inline-block w-4 h-4 mr-1" />;
        break;
      case "Completed":
        icon = <CheckCircle className="inline-block w-4 h-4 mr-1" />;
        break;
      case "On Hold":
        icon = <AlertCircle className="inline-block w-4 h-4 mr-1" />;
        break;
      case "Cancelled":
        icon = <XCircle className="inline-block w-4 h-4 mr-1" />;
        break;
      default:
        icon = null;
        break;
    }

    // Import StatusBadge at the top of the file
    return (
      <StatusBadge status={status} size="lg" className="inline-flex items-center">
        {icon}
        {status}
      </StatusBadge>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate("/work-orders")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <PageHeader
        heading={workOrder.workOrderNumber}
        description={
          `${workOrder.contact ? `${workOrder.contact.firstName} ${workOrder.contact.lastName}` : 'Unknown'} • ${workOrder.account ? workOrder.account.name : ''}`
        }
      >
        {workOrder.status === "Pending" && (
          <Button
            onClick={() => openStatusDialog("Scheduled")}
          >
            <Calendar className="mr-2 h-4 w-4" /> Schedule
          </Button>
        )}

        {workOrder.status === "Scheduled" && (
          <Button
            variant="warning"
            onClick={() => openStatusDialog("In Progress")}
          >
            <Clock className="mr-2 h-4 w-4" /> Start Work
          </Button>
        )}

        {workOrder.status === "In Progress" && (
          <Button
            variant="success"
            onClick={() => openStatusDialog("Completed")}
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Complete
          </Button>
        )}

        {workOrder.status === "Completed" && (
          <Button
            onClick={createInvoice}
          >
            <Receipt className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        )}

        {(workOrder.status === "Pending" || workOrder.status === "Scheduled") && (
          <Button
            variant="outline"
            onClick={() => navigate(`/work-orders/edit/${id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
        )}

        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="mt-1">
                {getStatusBadge(workOrder.status)}
              </div>
            </div>
            {workOrder.scheduledDate && (
              <div>
                <p className="text-sm text-gray-500">Scheduled Date</p>
                <p className="font-medium">{formatDate(workOrder.scheduledDate)}</p>
              </div>
            )}
            {workOrder.completedDate && (
              <div>
                <p className="text-sm text-gray-500">Completed Date</p>
                <p className="font-medium">{formatDate(workOrder.completedDate)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium">{formatDate(workOrder.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            {workOrder.contact && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">
                    {workOrder.contact.firstName} {workOrder.contact.lastName}
                  </p>
                  {workOrder.contact.email && (
                    <p className="text-sm">{workOrder.contact.email}</p>
                  )}
                  {workOrder.contact.phone && (
                    <p className="text-sm">{workOrder.contact.phone}</p>
                  )}
                </div>
                {workOrder.account && (
                  <div>
                    <p className="text-sm text-gray-500">Account</p>
                    <p className="font-medium">{workOrder.account.name}</p>
                    {workOrder.account.address && (
                      <p className="text-sm">
                        {workOrder.account.address}
                        {workOrder.account.city && `, ${workOrder.account.city}`}
                        {workOrder.account.state && `, ${workOrder.account.state}`}
                        {workOrder.account.zip && ` ${workOrder.account.zip}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            {workOrder.assignments && workOrder.assignments.length > 0 ? (
              <div className="space-y-3">
                {workOrder.assignments.map((assignment, index) => (
                  <div key={index} className="flex items-center p-2 border rounded-md">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-medium">Technician {assignment.technicianId}</p>
                      <p className="text-xs text-gray-500">
                        Assigned {formatDate(assignment.assignedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No technicians assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {workOrder.notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line">{workOrder.notes}</p>
          </CardContent>
        </Card>
      )}

      {workOrder.quote && (
        <Card>
          <CardHeader>
            <CardTitle>Related Quote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{workOrder.quote.quoteNumber}</p>
                <p className="text-sm text-gray-500">
                  Issued on {formatDate(workOrder.quote.issueDate)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/quotes/${workOrder.quote._id}`)}
              >
                View Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the work order "{workOrder.workOrderNumber}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {newStatus === "Scheduled" && "Schedule Work Order"}
              {newStatus === "In Progress" && "Start Work"}
              {newStatus === "Completed" && "Complete Work Order"}
              {newStatus === "On Hold" && "Put Work Order On Hold"}
              {newStatus === "Cancelled" && "Cancel Work Order"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus === "Scheduled" &&
                "This will mark the work order as scheduled."}
              {newStatus === "In Progress" &&
                "This will mark the work order as in progress."}
              {newStatus === "Completed" &&
                "This will mark the work order as completed."}
              {newStatus === "On Hold" &&
                "This will put the work order on hold."}
              {newStatus === "Cancelled" &&
                "This will cancel the work order."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              className={
                newStatus === "Completed"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : newStatus === "Cancelled"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
