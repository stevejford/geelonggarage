import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Container } from "@/components/ui/container";
import { FormLayout, FormSection, FormRow, FormActions } from "@/components/ui/form-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableFooter } from "@/components/ui/table";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Calendar
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function InvoiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for form fields
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch invoice details
  const invoice = useQuery(api.invoices.getInvoice, {
    id: id as any
  });

  // Fetch contacts and accounts for dropdowns
  const contactsData = useQuery(api.contacts.getContacts);
  const accountsData = useQuery(api.accounts.getAccounts);

  // Ensure data is always an array
  const contacts = Array.isArray(contactsData) ? contactsData : [];
  const accounts = Array.isArray(accountsData) ? accountsData : [];

  // Mutations
  const updateInvoice = useMutation(api.invoices.updateInvoice);
  const updateInvoiceLineItems = useMutation(api.invoices.updateInvoiceLineItems);

  // Initialize form with invoice data
  useEffect(() => {
    if (invoice) {
      setSelectedContactId(invoice.contactId?.toString() || "");
      setSelectedAccountId(invoice.accountId?.toString() || "");
      
      if (invoice.issueDate) {
        const date = new Date(invoice.issueDate);
        setIssueDate(date.toISOString().split('T')[0]);
      }
      
      if (invoice.dueDate) {
        const date = new Date(invoice.dueDate);
        setDueDate(date.toISOString().split('T')[0]);
      }
      
      setNotes(invoice.notes || "");
      
      // Set line items if available
      if (invoice.lineItems && invoice.lineItems.length > 0) {
        setLineItems(invoice.lineItems.map(item => ({
          id: item._id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })));
      }
      
      setIsLoading(false);
    }
  }, [invoice]);

  // Add a new line item
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0
      }
    ]);
  };

  // Remove a line item
  const removeLineItem = (index: number) => {
    const updatedItems = [...lineItems];
    
    // If the item has an ID, mark it for deletion
    if (updatedItems[index].id) {
      updatedItems[index]._delete = true;
    } else {
      // Otherwise, remove it from the array
      updatedItems.splice(index, 1);
    }
    
    setLineItems(updatedItems.filter(item => !item._delete));
  };

  // Update a line item
  const updateLineItem = (index: number, field: string, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;
    
    // Recalculate total
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setLineItems(updatedItems);
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // Calculate tax
  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // Assuming 10% tax rate
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedContactId || !selectedAccountId || !issueDate || !dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update invoice
      await updateInvoice({
        id: id as any,
        contactId: selectedContactId as any,
        accountId: selectedAccountId as any,
        issueDate: new Date(issueDate).getTime(),
        dueDate: new Date(dueDate).getTime(),
        notes: notes || undefined,
      });
      
      // Update line items
      await updateInvoiceLineItems({
        invoiceId: id as any,
        lineItems: lineItems.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          _delete: item._delete
        }))
      });

      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });

      // Navigate back to the invoice
      navigate(`/invoices/${id}`);
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading || !invoice) {
    return (
      <Container padding="md">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => navigate(`/invoices/${id}`)}
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
      </Container>
    );
  }

  // Check if invoice is editable
  if (invoice.status !== "Draft") {
    return (
      <Container padding="md">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => navigate(`/invoices/${id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Cannot Edit Invoice</h1>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-center text-red-600 mb-4">
            This invoice cannot be edited because it is not in Draft status.
          </p>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate(`/invoices/${id}`)}
            >
              Return to Invoice
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container padding="md">
      <FormLayout
        title={`Edit Invoice ${invoice.invoiceNumber}`}
        description="Update invoice details"
        backLink={`/invoices/${id}`}
        backLinkText="Back to Invoice"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/invoices/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <FormSection title="Invoice Information">
            <FormRow>
              <div className="space-y-2">
                <Label htmlFor="contact">Customer Contact</Label>
                <Select
                  value={selectedContactId}
                  onValueChange={setSelectedContactId}
                  required
                >
                  <SelectTrigger id="contact">
                    <SelectValue placeholder="Select a contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact._id.toString()} value={contact._id.toString()}>
                        {contact.firstName} {contact.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormRow>
            
            <FormRow>
              <div className="space-y-2">
                <Label htmlFor="account">Customer Account</Label>
                <Select
                  value={selectedAccountId}
                  onValueChange={setSelectedAccountId}
                  required
                >
                  <SelectTrigger id="account">
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account._id.toString()} value={account._id.toString()}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormRow>
            
            <FormRow>
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="issueDate"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </FormRow>
          </FormSection>
          
          <FormSection title="Line Items">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-24 text-right">Quantity</TableHead>
                      <TableHead className="w-32 text-right">Unit Price</TableHead>
                      <TableHead className="w-32 text-right">Total</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(index, "description", e.target.value)}
                            placeholder="Description"
                            required
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value) || 0)}
                            min="1"
                            step="1"
                            className="text-right"
                            required
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="text-right"
                            required
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {lineItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          No line items added yet. Click "Add Item" to add one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Subtotal:
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(calculateSubtotal())}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Tax (10%):
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(calculateTax())}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(calculateTotal())}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
            
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={addLineItem}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
          </FormSection>
          
          <FormSection title="Notes">
            <FormRow>
              <div className="space-y-2 w-full">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any additional notes or payment terms"
                  rows={4}
                />
              </div>
            </FormRow>
          </FormSection>
        </form>
      </FormLayout>
    </Container>
  );
}
