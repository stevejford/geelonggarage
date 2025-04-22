import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "../../../convex/_generated/dataModel";
import AddressAutocomplete from "../common/AddressAutocomplete";
import DuplicateWarning from "../common/DuplicateWarning";

type LeadFormProps = {
  lead?: {
    _id: Id<"leads">;
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    status: string;
    notes?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    placeId?: string;
    formattedAddress?: string;
    latitude?: number;
    longitude?: number;
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
    unit: lead?.unit || "", // Unit/Suite/Floor number
    address: lead?.address || "",
    city: lead?.city || "",
    state: lead?.state || "",
    postcode: lead?.zip || "", // Using zip field for postcode
    country: lead?.country || "Australia", // Default to Australia
    placeId: lead?.placeId || "",
    formattedAddress: lead?.formattedAddress || "",
    latitude: lead?.latitude || 0,
    longitude: lead?.longitude || 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ignoreDuplicates, setIgnoreDuplicates] = useState(false);

  // Check for potential duplicates
  const checkDuplicates = useQuery(api.leads.checkDuplicateLeads,
    formData.name ? {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      placeId: formData.placeId || undefined,
      address: formData.formattedAddress || formData.address || undefined,
      excludeId: lead?._id.toString(),
    } : 'skip'
  );

  const [potentialDuplicates, setPotentialDuplicates] = useState<any[]>([]);

  // Update duplicates when check results change
  useEffect(() => {
    if (Array.isArray(checkDuplicates) && checkDuplicates.length > 0 && !lead) {
      setPotentialDuplicates(checkDuplicates);
    } else {
      setPotentialDuplicates([]);
    }
  }, [checkDuplicates, lead]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle address selection from Google Places
  const handleAddressChange = (addressData: any) => {
    setFormData(prev => ({
      ...prev,
      unit: addressData.unit || prev.unit, // Preserve unit if not provided
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      postcode: addressData.postcode,
      country: addressData.country,
      placeId: addressData.placeId,
      formattedAddress: addressData.formattedAddress,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check for duplicates before submitting
    if (potentialDuplicates.length > 0 && !ignoreDuplicates && !lead) {
      // Show duplicate warning - don't submit yet
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert postcode to zip for backend compatibility
      const submissionData = {
        ...formData,
        zip: formData.postcode, // Map postcode to zip for the backend
        postcode: undefined // Remove postcode as it's not in the schema
      };

      if (lead) {
        // Update existing lead
        await updateLead({
          id: lead._id,
          ...submissionData,
        });
      } else {
        // Create new lead
        await createLead(submissionData);
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

      {potentialDuplicates.length > 0 && !ignoreDuplicates && !lead && (
        <DuplicateWarning
          type="lead"
          duplicates={potentialDuplicates}
          onIgnore={() => setIgnoreDuplicates(true)}
        />
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

      {/* Address Autocomplete */}
      <div className="space-y-2">
        <AddressAutocomplete
          label="Address"
          value={{
            unit: formData.unit,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country,
            placeId: formData.placeId,
            formattedAddress: formData.formattedAddress,
            latitude: formData.latitude,
            longitude: formData.longitude,
          }}
          onChange={handleAddressChange}
          className="space-y-2"
        />
      </div>

      {/* Address fields are now included in the AddressAutocomplete component */}

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
