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
  Check, 
  X, 
  FileText,
  ClipboardList
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

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State for confirmation dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  // Fetch quote details
  const quote = useQuery(api.quotes.getQuote, { 
    id: id as any 
  });

  // Mutations
  const deleteQuote = useMutation(api.quotes.deleteQuote);
  const changeQuoteStatus = useMutation(api.quotes.changeQuoteStatus);

  // Handle quote deletion
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteQuote({ id: id as any });
      navigate("/quotes");
    } catch (error) {
      console.error("Error deleting quote:", error);
      alert("Failed to delete quote. Please try again.");
    }
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!id || !newStatus) return;
    
    try {
      await changeQuoteStatus({ 
        id: id as any, 
        status: newStatus 
      });
      setShowStatusDialog(false);
    } catch (error) {
      console.error("Error changing quote status:", error);
      alert("Failed to update quote status. Please try again.");
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

  // Create work order from quote
  const createWorkOrder = () => {
    alert("Work order creation will be implemented in a future update.");
  };

  if (!quote) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => navigate("/quotes")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Loading Quote...</h1>
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => navigate("/quotes")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{quote.quoteNumber}</h1>
            <p className="text-gray-500">
              {quote.contact ? `${quote.contact.firstName} ${quote.contact.lastName}` : 'Unknown'} • 
              {quote.account ? ` ${quote.account.name}` : ''} • 
              {formatDate(quote.issueDate)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {quote.status === "Draft" && (
            <>
              <Button 
                variant="outline" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => openStatusDialog("Presented")}
              >
                <Send className="mr-2 h-4 w-4" /> Present
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(`/quotes/edit/${id}`)}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </>
          )}
          
          {quote.status === "Presented" && (
            <>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => openStatusDialog("Accepted")}
              >
                <Check className="mr-2 h-4 w-4" /> Accept
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => openStatusDialog("Declined")}
              >
                <X className="mr-2 h-4 w-4" /> Decline
              </Button>
            </>
          )}
          
          {quote.status === "Accepted" && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={createWorkOrder}
            >
              <ClipboardList className="mr-2 h-4 w-4" /> Create Work Order
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
          <h2 className="text-lg font-medium mb-4">Quote Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="mt-1">
                {quote.status === "Draft" && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    Draft
                  </span>
                )}
                {quote.status === "Presented" && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Presented
                  </span>
                )}
                {quote.status === "Accepted" && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Accepted
                  </span>
                )}
                {quote.status === "Declined" && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    Declined
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Issue Date</p>
              <p className="font-medium">{formatDate(quote.issueDate)}</p>
            </div>
            {quote.expiryDate && (
              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className="font-medium">{formatDate(quote.expiryDate)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(quote.total)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Customer</h2>
          {quote.contact && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">
                  {quote.contact.firstName} {quote.contact.lastName}
                </p>
                {quote.contact.email && (
                  <p className="text-sm">{quote.contact.email}</p>
                )}
                {quote.contact.phone && (
                  <p className="text-sm">{quote.contact.phone}</p>
                )}
              </div>
              {quote.account && (
                <div>
                  <p className="text-sm text-gray-500">Account</p>
                  <p className="font-medium">{quote.account.name}</p>
                  {quote.account.address && (
                    <p className="text-sm">
                      {quote.account.address}
                      {quote.account.city && `, ${quote.account.city}`}
                      {quote.account.state && `, ${quote.account.state}`}
                      {quote.account.zip && ` ${quote.account.zip}`}
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
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(quote.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(quote.total)}</span>
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
              {quote.lineItems && quote.lineItems.map((item, index) => (
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
                  {formatCurrency(quote.subtotal)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-medium">
                  Tax:
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  {formatCurrency(quote.tax)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-lg font-bold">
                  Total:
                </td>
                <td className="px-6 py-4 text-right text-lg font-bold">
                  {formatCurrency(quote.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {quote.notes && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Notes</h2>
          <p className="text-gray-700 whitespace-pre-line">{quote.notes}</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the quote "{quote.quoteNumber}". This action cannot be undone.
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
              {newStatus === "Presented" && "Present Quote"}
              {newStatus === "Accepted" && "Accept Quote"}
              {newStatus === "Declined" && "Decline Quote"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus === "Presented" && 
                "This will mark the quote as presented to the customer. You won't be able to edit it after this action."}
              {newStatus === "Accepted" && 
                "This will mark the quote as accepted by the customer."}
              {newStatus === "Declined" && 
                "This will mark the quote as declined by the customer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStatusChange}
              className={
                newStatus === "Accepted" 
                  ? "bg-green-600 text-white hover:bg-green-700" 
                  : newStatus === "Declined"
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
