import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "../../../convex/_generated/dataModel";

type LeadFormProps = {
  lead?: {
    _id: Id<"leads">;
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    status: string;
    notes?: string;
  };
  onSuccess?: () => void;
};

export default function LeadForm({ lead, onSuccess }: LeadFormProps) {
  const navigate = useNavigate();
  const createLead = useMutation(api.leads.createLead);
  const updateLead = useMutation(api.leads.updateLead);
  
  const [formData, setFormData] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    source: lead?.source || "",
    status: lead?.status || "New",
    notes: lead?.notes || "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (lead) {
        // Update existing lead
        await updateLead({
          id: lead._id,
          ...formData,
        });
      } else {
        // Create new lead
        await createLead(formData);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/leads");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const statusOptions = [
    { value: "New", label: "New" },
    { value: "Contacted", label: "Contacted" },
    { value: "Qualified", label: "Qualified" },
    { value: "Unqualified", label: "Unqualified" },
    { value: "Converted", label: "Converted" },
  ];
  
  const sourceOptions = [
    { value: "Website", label: "Website" },
    { value: "Referral", label: "Referral" },
    { value: "Social Media", label: "Social Media" },
    { value: "Email Campaign", label: "Email Campaign" },
    { value: "Phone Inquiry", label: "Phone Inquiry" },
    { value: "Other", label: "Other" },
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <select
            id="source"
            name="source"
            className="w-full border rounded-md px-3 py-2"
            value={formData.source}
            onChange={handleChange}
          >
            <option value="">Select a source</option>
            {sourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <select
            id="status"
            name="status"
            className="w-full border rounded-md px-3 py-2"
            value={formData.status}
            onChange={handleChange}
            required
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          value={formData.notes}
          onChange={handleChange}
        />
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/leads")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : lead ? "Update Lead" : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}
