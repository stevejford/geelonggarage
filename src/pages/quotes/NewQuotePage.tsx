import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableFooter } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormLayout, FormSection, FormRow, FormActions } from "@/components/ui/form-layout";
import { Container } from "@/components/ui/container";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function NewQuotePage() {
  const navigate = useNavigate();
  const createQuote = useMutation(api.quotes.createQuote);

  // Fetch contacts and accounts for dropdowns
  const contactsData = useQuery(api.contacts.getContacts);
  const accountsData = useQuery(api.accounts.getAccounts);

  // Ensure data is always an array
  const contacts = Array.isArray(contactsData) ? contactsData : [];
  const accounts = Array.isArray(accountsData) ? accountsData : [];

  // Form state
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [expiryDate, setExpiryDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Fetch contact details when a contact is selected
  const selectedContact = useQuery(
    api.contacts.getContact,
    selectedContactId ? { id: selectedContactId as any } : "skip"
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

  // Auto-select primary account when contact is selected
  useEffect(() => {
    if (selectedContact && selectedContact.accounts && selectedContact.accounts.length > 0) {
      // First try to find the primary account
      const primaryAccount = selectedContact.accounts.find(account => account.isPrimary);

      if (primaryAccount) {
        setSelectedAccountId(primaryAccount._id.toString());
      } else if (selectedContact.accounts[0]) {
        // If no primary account, select the first account
        setSelectedAccountId(selectedContact.accounts[0]._id.toString());
      }
    }
  }, [selectedContact]);

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

      // Create quote
      const quoteId = await createQuote({
        contactId: selectedContactId as any,
        accountId: selectedAccountId as any,
        issueDate: new Date(issueDate).getTime(),
        expiryDate: expiryDate ? new Date(expiryDate).getTime() : undefined,
        notes: notes || undefined,
        lineItems: formattedLineItems,
      });

      // Navigate to the new quote
      navigate(`/quotes/${quoteId}`);
    } catch (error) {
      console.error("Error creating quote:", error);
      alert("Failed to create quote. Please try again.");
    }
  };

  return (
    <Container padding="md">
      <FormLayout
        title="New Quote"
        description="Create a new quote for your customer"
        backLink="/quotes"
        backLinkText="Back to Quotes"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/quotes")}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" /> Save Quote
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <FormSection title="Quote Information">
            <FormRow>
              <div className="space-y-2">
                <Label htmlFor="contact">Customer Contact</Label>
                <Select
                  value={selectedContactId}
                  onValueChange={(contactId) => {
                    setSelectedContactId(contactId);
                    // The account will be auto-selected by the useEffect
                  }}
                  required
                >
                  <SelectTrigger id="contact">
                    <SelectValue placeholder="Select a contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(contacts) && contacts.map((contact) => (
                      <SelectItem key={contact._id.toString()} value={contact._id.toString()}>
                        {contact.firstName} {contact.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    {Array.isArray(accounts) && accounts.map((account) => (
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
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </FormRow>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes or terms..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </FormSection>

          <FormSection
            title="Line Items"
            className="mt-8"
          >
            <div className="flex justify-end mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={addLineItem}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24 text-right">Qty</TableHead>
                    <TableHead className="w-32 text-right">Unit Price</TableHead>
                    <TableHead className="w-32 text-right">Total</TableHead>
                    <TableHead className="w-16 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(lineItems) && lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(index, "description", e.target.value)
                          }
                          required
                        />
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Subtotal:
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(subtotal)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Tax (10%):
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(tax)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right text-lg font-bold">
                      Total:
                    </TableCell>
                    <TableCell className="text-right text-lg font-bold">
                      {formatCurrency(total)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </FormSection>
        </form>
      </FormLayout>
    </Container>
  );
}
