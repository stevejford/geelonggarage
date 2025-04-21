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
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate("/work-orders")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">New Work Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Work Order Information</h2>

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
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes or instructions..."
              className="mt-1"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Assign Technicians</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(technicians) && technicians.map((technician) => (
              <div
                key={technician.id}
                className={`border rounded-md p-4 cursor-pointer transition-colors ${
                  selectedTechnicianIds.includes(technician.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleTechnicianToggle(technician.id)}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{technician.name}</p>
                    <p className="text-xs text-gray-500">Technician</p>
                  </div>
                  <div className="ml-auto">
                    <input
                      type="checkbox"
                      checked={selectedTechnicianIds.includes(technician.id)}
                      onChange={() => {}} // Handled by the div click
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/work-orders")}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="mr-2 h-4 w-4" /> Create Work Order
          </Button>
        </div>
      </form>
    </div>
  );
}
