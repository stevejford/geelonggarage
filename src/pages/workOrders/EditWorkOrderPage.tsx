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
import {
  ArrowLeft,
  Plus,
  Save,
  Calendar,
  User
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function EditWorkOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for form fields
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch work order details
  const workOrder = useQuery(api.workOrders.getWorkOrder, {
    id: id as any
  });

  // Fetch contacts and accounts for dropdowns
  const contactsData = useQuery(api.contacts.getContacts);
  const accountsData = useQuery(api.accounts.getAccounts);
  
  // Fetch technicians
  const techniciansData = useQuery(api.users.getUsers, { role: "technician" });

  // Ensure data is always an array
  const contacts = Array.isArray(contactsData) ? contactsData : [];
  const accounts = Array.isArray(accountsData) ? accountsData : [];
  const technicians = Array.isArray(techniciansData) ? techniciansData : [];

  // Mutations
  const updateWorkOrder = useMutation(api.workOrders.updateWorkOrder);
  const assignTechnicians = useMutation(api.workOrders.assignTechnicians);

  // Initialize form with work order data
  useEffect(() => {
    if (workOrder) {
      setSelectedContactId(workOrder.contactId?.toString() || "");
      setSelectedAccountId(workOrder.accountId?.toString() || "");
      
      if (workOrder.scheduledDate) {
        const date = new Date(workOrder.scheduledDate);
        setScheduledDate(date.toISOString().split('T')[0]);
      }
      
      setNotes(workOrder.notes || "");
      
      // Set selected technicians if available
      if (workOrder.assignments && workOrder.assignments.length > 0) {
        const techIds = workOrder.assignments.map(a => a.technicianId).filter(Boolean);
        setSelectedTechnicianIds(techIds);
      }
      
      setIsLoading(false);
    }
  }, [workOrder]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !selectedContactId || !selectedAccountId) {
      toast({
        title: "Error",
        description: "Please select a contact and account",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update work order
      await updateWorkOrder({
        id: id as any,
        contactId: selectedContactId as any,
        accountId: selectedAccountId as any,
        scheduledDate: scheduledDate ? new Date(scheduledDate).getTime() : undefined,
        notes: notes || undefined,
      });
      
      // Update technician assignments
      if (selectedTechnicianIds.length > 0) {
        await assignTechnicians({
          workOrderId: id as any,
          technicianIds: selectedTechnicianIds,
        });
      }

      toast({
        title: "Success",
        description: "Work order updated successfully",
      });

      // Navigate back to the work order
      navigate(`/work-orders/${id}`);
    } catch (error) {
      console.error("Error updating work order:", error);
      toast({
        title: "Error",
        description: "Failed to update work order. Please try again.",
        variant: "destructive"
      });
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

  if (isLoading || !workOrder) {
    return (
      <Container padding="md">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => navigate(`/work-orders/${id}`)}
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
      </Container>
    );
  }

  return (
    <Container padding="md">
      <FormLayout
        title={`Edit Work Order ${workOrder.workOrderNumber}`}
        description="Update work order details"
        backLink={`/work-orders/${id}`}
        backLinkText="Back to Work Order"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/work-orders/${id}`)}
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
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
            </FormRow>

            <FormRow>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes or instructions"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </FormRow>
          </FormSection>

          <FormSection title="Assign Technicians">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technicians.map((technician) => (
                <Card
                  key={technician._id.toString()}
                  className={`cursor-pointer ${
                    selectedTechnicianIds.includes(technician._id.toString())
                      ? "border-2 border-blue-500"
                      : ""
                  }`}
                  onClick={() => handleTechnicianToggle(technician._id.toString())}
                >
                  <CardContent className="p-4 flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {technician.firstName} {technician.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {technician.role}
                      </p>
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
