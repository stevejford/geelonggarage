import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  ArrowLeft,
  Plus,
  Save,
  Calendar,
  User
} from "lucide-react";

export default function NewWorkOrderPage() {
  const navigate = useNavigate();
  const createWorkOrder = useMutation(api.workOrders.createWorkOrder);

  // Fetch contacts and accounts for dropdowns
  const contactsData = useQuery(api.contacts.getContacts);
  const accountsData = useQuery(api.accounts.getAccounts);

  // Ensure data is always an array
  const contacts = Array.isArray(contactsData) ? contactsData : [];
  const accounts = Array.isArray(accountsData) ? accountsData : [];

  // Form state
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>([]);

  // Fetch technicians (users with technician role)
  const technicians = [
    { id: "tech1", name: "John Technician" },
    { id: "tech2", name: "Jane Technician" },
    { id: "tech3", name: "Bob Technician" },
  ]; // This would ideally come from an API call

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContactId || !selectedAccountId) {
      alert("Please select a contact and account");
      return;
    }

    try {
      // Create work order
      const workOrderId = await createWorkOrder({
        contactId: selectedContactId as any,
        accountId: selectedAccountId as any,
        scheduledDate: scheduledDate ? new Date(scheduledDate).getTime() : undefined,
        notes: notes || undefined,
        technicianIds: selectedTechnicianIds.length > 0 ? selectedTechnicianIds : undefined,
      });

      // Navigate to the new work order
      navigate(`/work-orders/${workOrderId}`);
    } catch (error) {
      console.error("Error creating work order:", error);
      alert("Failed to create work order. Please try again.");
    }
  };

  // Handle technician selection
  const handleTechnicianToggle = (technicianId: string) => {
    setSelectedTechnicianIds(prev => {
      if (prev.includes(technicianId)) {
        return prev.filter(id => id !== technicianId);
      } else {
        return [...prev, technicianId];
      }
    });
  };

  return (
    <Container padding="md">
      <FormLayout
        title="New Work Order"
        description="Create a new work order for your customer"
        backLink="/work-orders"
        backLinkText="Back to Work Orders"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/work-orders")}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" /> Create Work Order
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
        <FormSection title="Work Order Information">
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

          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Scheduled Date</Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes or instructions..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </FormSection>

        <FormSection title="Assign Technicians" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(technicians) && technicians.map((technician) => (
              <Card
                key={technician.id}
                className={`cursor-pointer transition-colors ${
                  selectedTechnicianIds.includes(technician.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleTechnicianToggle(technician.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{technician.name}</p>
                      <p className="text-xs text-muted-foreground">Technician</p>
                    </div>
                    <div className="ml-auto">
                      <input
                        type="checkbox"
                        checked={selectedTechnicianIds.includes(technician.id)}
                        onChange={() => {}} // Handled by the div click
                        className="h-5 w-5 text-primary rounded border-input focus:ring-primary"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </FormSection>
      </form>
      </FormLayout>
    </Container>
  );
}
