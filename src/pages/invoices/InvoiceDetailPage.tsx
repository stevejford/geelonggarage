import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Send, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  FileText,
  ClipboardList,
  Calendar
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
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

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State for confirmation dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  // Fetch invoice details
  const invoice = useQuery(api.invoices.getInvoice, { 
    id: id as any 
  });

  // Mutations
  const deleteInvoice = useMutation(api.invoices.deleteInvoice);
  const changeInvoiceStatus = useMutation(api.invoices.changeInvoiceStatus);

  // Handle invoice deletion
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteInvoice({ id: id as any });
      navigate("/invoices");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice. Please try again.");
    }
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!id || !newStatus) return;
    
    try {
      await changeInvoiceStatus({ 
        id: id as any, 
        status: newStatus 
      });
      setShowStatusDialog(false);
    } catch (error) {
      console.error("Error changing invoice status:", error);
      alert("Failed to update invoice status. Please try again.");
    }
  };

  // Open status change dialog
  const openStatusDialog = (status: string) => {
    setNewStatus(status);
    setShowStatusDialog(true);
  };

  // Generate PDF (placeholder for now)
  const generatePDF = () => {
    alert("PDF generation will be implemented in a future update.");
  };

  // Check if invoice is overdue
  const isOverdue = (invoice: any) => {
    if (invoice.status === "Paid" || invoice.status === "Void") {
      return false;
    }
    return invoice.dueDate < Date.now() && invoice.status === "Sent";
  };

  if (!invoice) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => navigate("/invoices")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Loading Invoice...</h1>
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

  // Get status badge
  const getStatusBadge = () => {
    // Check for overdue first
    if (isOverdue(invoice)) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          <AlertTriangle className="inline-block w-4 h-4 mr-1" />
          Overdue
        </span>
      );
    }

    switch (invoice.status) {
      case "Draft":
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            <FileText className="inline-block w-4 h-4 mr-1" />
            {invoice.status}
          </span>
        );
      case "Sent":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <Send className="inline-block w-4 h-4 mr-1" />
            {invoice.status}
          </span>
        );
      case "Paid":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="inline-block w-4 h-4 mr-1" />
            {invoice.status}
          </span>
        );
      case "Void":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircle className="inline-block w-4 h-4 mr-1" />
            {invoice.status}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            {invoice.status}
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => navigate("/invoices")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <p className="text-gray-500">
              {invoice.contact ? `${invoice.contact.firstName} ${invoice.contact.lastName}` : 'Unknown'} • 
              {invoice.account ? ` ${invoice.account.name}` : ''} • 
              {formatDate(invoice.issueDate)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {invoice.status === "Draft" && (
            <>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => openStatusDialog("Sent")}
              >
                <Send className="mr-2 h-4 w-4" /> Send Invoice
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(`/invoices/edit/${id}`)}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </>
          )}
          
          {invoice.status === "Sent" && (
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => openStatusDialog("Paid")}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
            </Button>
          )}
          
          {(invoice.status === "Draft" || invoice.status === "Sent") && (
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => openStatusDialog("Void")}
            >
              <XCircle className="mr-2 h-4 w-4" /> Void
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={generatePDF}
          >
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          
          <Button 
            variant="outline" 
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Invoice Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="mt-1">
                {getStatusBadge()}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Issue Date</p>
              <p className="font-medium">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className={`font-medium ${isOverdue(invoice) ? 'text-red-600' : ''}`}>
                {formatDate(invoice.dueDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(invoice.total)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Customer</h2>
          {invoice.contact && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">
                  {invoice.contact.firstName} {invoice.contact.lastName}
                </p>
                {invoice.contact.email && (
                  <p className="text-sm">{invoice.contact.email}</p>
                )}
                {invoice.contact.phone && (
                  <p className="text-sm">{invoice.contact.phone}</p>
                )}
              </div>
              {invoice.account && (
                <div>
                  <p className="text-sm text-gray-500">Account</p>
                  <p className="font-medium">{invoice.account.name}</p>
                  {invoice.account.address && (
                    <p className="text-sm">
                      {invoice.account.address}
                      {invoice.account.city && `, ${invoice.account.city}`}
                      {invoice.account.state && `, ${invoice.account.state}`}
                      {invoice.account.zip && ` ${invoice.account.zip}`}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Line Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.lineItems && invoice.lineItems.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-medium">
                  Subtotal:
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  {formatCurrency(invoice.subtotal)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-medium">
                  Tax:
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  {formatCurrency(invoice.tax)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-lg font-bold">
                  Total:
                </td>
                <td className="px-6 py-4 text-right text-lg font-bold">
                  {formatCurrency(invoice.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {invoice.notes && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Notes</h2>
          <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}

      {/* Related Work Order or Quote */}
      {(invoice.workOrder || invoice.quote) && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Related Documents</h2>
          
          {invoice.workOrder && (
            <div className="flex justify-between items-center mb-4 p-4 border rounded-md">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <p className="font-medium">Work Order: {invoice.workOrder.workOrderNumber}</p>
                  <p className="text-xs text-gray-500">
                    Completed on {invoice.workOrder.completedDate ? formatDate(invoice.workOrder.completedDate) : 'Unknown'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/work-orders/${invoice.workOrder._id}`)}
              >
                View Work Order
              </Button>
            </div>
          )}
          
          {invoice.quote && (
            <div className="flex justify-between items-center p-4 border rounded-md">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-medium">Quote: {invoice.quote.quoteNumber}</p>
                  <p className="text-xs text-gray-500">
                    Issued on {formatDate(invoice.quote.issueDate)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/quotes/${invoice.quote._id}`)}
              >
                View Quote
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the invoice "{invoice.invoiceNumber}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
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
              {newStatus === "Sent" && "Send Invoice"}
              {newStatus === "Paid" && "Mark as Paid"}
              {newStatus === "Void" && "Void Invoice"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus === "Sent" && 
                "This will mark the invoice as sent to the customer. You won't be able to edit it after this action."}
              {newStatus === "Paid" && 
                "This will mark the invoice as paid by the customer."}
              {newStatus === "Void" && 
                "This will void the invoice. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStatusChange}
              className={
                newStatus === "Paid" 
                  ? "bg-green-600 text-white hover:bg-green-700" 
                  : newStatus === "Void"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
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
