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

type ContactFormProps = {
  contact?: {
    _id: Id<"contacts">;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    notes?: string;
    placeId?: string;
    formattedAddress?: string;
    latitude?: number;
    longitude?: number;
  };
  onSuccess?: () => void;
};

export default function ContactForm({ contact, onSuccess }: ContactFormProps) {
  const navigate = useNavigate();
  const createContact = useMutation(api.contacts.createContact);
  const updateContact = useMutation(api.contacts.updateContact);

  const [formData, setFormData] = useState({
    firstName: contact?.firstName || "",
    lastName: contact?.lastName || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    address: contact?.address || "",
    city: contact?.city || "",
    state: contact?.state || "",
    postcode: contact?.zip || "", // Using zip field for postcode
    country: contact?.country || "Australia", // Default to Australia
    notes: contact?.notes || "",
    placeId: contact?.placeId || "",
    formattedAddress: contact?.formattedAddress || "",
    latitude: contact?.latitude || 0,
    longitude: contact?.longitude || 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ignoreDuplicates, setIgnoreDuplicates] = useState(false);

  // Check for potential duplicates
  const checkDuplicates = useQuery(api.contacts.checkDuplicateContacts,
    formData.firstName && formData.lastName ? {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      placeId: formData.placeId || undefined,
      address: formData.formattedAddress || formData.address || undefined,
      excludeId: contact?._id.toString(),
    } : 'skip'
  );

  const [potentialDuplicates, setPotentialDuplicates] = useState<any[]>([]);

  // Update duplicates when check results change
  useEffect(() => {
    if (Array.isArray(checkDuplicates) && checkDuplicates.length > 0 && !contact) {
      setPotentialDuplicates(checkDuplicates);
    } else {
      setPotentialDuplicates([]);
    }
  }, [checkDuplicates, contact]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle address selection from Google Places
  const handleAddressChange = (addressData: any) => {
    setFormData(prev => ({
      ...prev,
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
    if (potentialDuplicates.length > 0 && !ignoreDuplicates && !contact) {
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

      if (contact) {
        // Update existing contact
        await updateContact({
          id: contact._id,
          ...submissionData,
        });
      } else {
        // Create new contact
        await createContact(submissionData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/contacts");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {potentialDuplicates.length > 0 && !ignoreDuplicates && !contact && (
        <DuplicateWarning
          type="contact"
          duplicates={potentialDuplicates}
          onIgnore={() => setIgnoreDuplicates(true)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
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
      </div>

      {/* Address Autocomplete */}
      <div className="space-y-2">
        <AddressAutocomplete
          label="Address"
          value={{
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
          onClick={() => navigate("/contacts")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : contact ? "Update Contact" : "Create Contact"}
        </Button>
      </div>
    </form>
  );
}
