import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Calendar,
  ClipboardList
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function NewInvoicePage() {
  const navigate = useNavigate();
  const createInvoice = useMutation(api.invoices.createInvoice);

  // Fetch contacts and accounts for dropdowns
  const contactsData = useQuery(api.contacts.getContacts);
  const accountsData = useQuery(api.accounts.getAccounts);

  // Fetch completed work orders and accepted quotes
  const workOrdersData = useQuery(api.workOrders.getWorkOrders, { status: "Completed" });
  const quotesData = useQuery(api.quotes.getQuotes, { status: "Accepted" });

  // Ensure data is always an array
  const contacts = Array.isArray(contactsData) ? contactsData : [];
  const accounts = Array.isArray(accountsData) ? accountsData : [];
  const workOrders = Array.isArray(workOrdersData) ? workOrdersData : [];
  const quotes = Array.isArray(quotesData) ? quotesData : [];

  // Form state
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>("");
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");
  const [lineItems, setLineItems] = useState<Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>>([
    {
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ]);

  // Derived state
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  // Calculate totals when line items change
  useEffect(() => {
    const newSubtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const newTax = newSubtotal * 0.1; // Assuming 10% tax rate
    const newTotal = newSubtotal + newTax;

    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [lineItems]);

  // Update line item
  const updateLineItem = (
    index: number,
    field: "description" | "quantity" | "unitPrice",
    value: string | number
  ) => {
    const updatedItems = [...lineItems];

    if (field === "quantity" || field === "unitPrice") {
      const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
      updatedItems[index][field] = numValue;
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    } else {
      updatedItems[index][field] = value as string;
    }

    setLineItems(updatedItems);
  };

  // Add new line item
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const updatedItems = [...lineItems];
      updatedItems.splice(index, 1);
      setLineItems(updatedItems);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContactId || !selectedAccountId) {
      alert("Please select a contact and account");
      return;
    }

    try {
      // Format line items for API
      const formattedLineItems = lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      // Create invoice
      const invoiceId = await createInvoice({
        contactId: selectedContactId as any,
        accountId: selectedAccountId as any,
        workOrderId: selectedWorkOrderId ? selectedWorkOrderId as any : undefined,
        quoteId: selectedQuoteId ? selectedQuoteId as any : undefined,
        issueDate: new Date(issueDate).getTime(),
        dueDate: new Date(dueDate).getTime(),
        notes: notes || undefined,
        lineItems: formattedLineItems,
      });

      // Navigate to the new invoice
      navigate(`/invoices/${invoiceId}`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice. Please try again.");
    }
  };

  // Handle work order selection
  const handleWorkOrderSelect = (workOrderId: string) => {
    setSelectedWorkOrderId(workOrderId);

    if (workOrderId) {
      // Find the selected work order
      const workOrder = workOrders.find(wo => wo._id.toString() === workOrderId);
      if (workOrder) {
        // Set contact and account from work order
        setSelectedContactId(workOrder.contactId.toString());
        setSelectedAccountId(workOrder.accountId.toString());

        // If work order has a quote, populate line items from quote
        if (workOrder.quote) {
          setSelectedQuoteId(workOrder.quote._id.toString());

          if (workOrder.quote.lineItems) {
            const quoteItems = workOrder.quote.lineItems.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            }));
            setLineItems(quoteItems);
          }
        } else {
          // Create a default line item for the work order
          setLineItems([{
            description: `Work Order: ${workOrder.workOrderNumber}`,
            quantity: 1,
            unitPrice: 0,
            total: 0,
          }]);
        }
      }
    }
  };

  // Handle quote selection
  const handleQuoteSelect = (quoteId: string) => {
    setSelectedQuoteId(quoteId);

    if (quoteId) {
      // Find the selected quote
      const quote = quotes.find(q => q._id.toString() === quoteId);
      if (quote) {
        // Set contact and account from quote
        setSelectedContactId(quote.contactId.toString());
        setSelectedAccountId(quote.accountId.toString());

        // Populate line items from quote
        if (quote.lineItems) {
          const quoteItems = quote.lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          }));
          setLineItems(quoteItems);
        }
      }
    }
  };

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
        <h1 className="text-2xl font-bold">New Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Invoice Source</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="workOrder">From Work Order</Label>
              <select
                id="workOrder"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedWorkOrderId}
                onChange={(e) => handleWorkOrderSelect(e.target.value)}
              >
                <option value="">Select a work order</option>
                {Array.isArray(workOrders) && workOrders.map((workOrder) => (
                  <option key={workOrder._id.toString()} value={workOrder._id.toString()}>
                    {workOrder.workOrderNumber} - {workOrder.contact?.firstName} {workOrder.contact?.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="quote">From Quote</Label>
              <select
                id="quote"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedQuoteId}
                onChange={(e) => handleQuoteSelect(e.target.value)}
                disabled={!!selectedWorkOrderId}
              >
                <option value="">Select a quote</option>
                {Array.isArray(quotes) && quotes.map((quote) => (
                  <option key={quote._id.toString()} value={quote._id.toString()}>
                    {quote.quoteNumber} - {quote.contact?.firstName} {quote.contact?.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="text-lg font-medium mb-4">Invoice Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="contact">Customer Contact</Label>
              <select
                id="contact"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                required
              >
                <option value="">Select a contact</option>
                {Array.isArray(contacts) && contacts.map((contact) => (
                  <option key={contact._id.toString()} value={contact._id.toString()}>
                    {contact.firstName} {contact.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="account">Customer Account</Label>
              <select
                id="account"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                required
              >
                <option value="">Select an account</option>
                {Array.isArray(accounts) && accounts.map((account) => (
                  <option key={account._id.toString()} value={account._id.toString()}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes or terms..."
              className="mt-1"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Line Items</h2>
            <Button
              type="button"
              variant="outline"
              onClick={addLineItem}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.isArray(lineItems) && lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, "description", e.target.value)
                        }
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(index, "quantity", e.target.value)
                        }
                        className="text-right"
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(index, "unitPrice", e.target.value)
                        }
                        className="text-right"
                        required
                      />
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right font-medium">
                    Subtotal:
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(subtotal)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right font-medium">
                    Tax (10%):
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(tax)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right text-lg font-bold">
                    Total:
                  </td>
                  <td className="px-4 py-2 text-right text-lg font-bold">
                    {formatCurrency(total)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/invoices")}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="mr-2 h-4 w-4" /> Save Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
