import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Id } from "../../../convex/_generated/dataModel";
import AddressAutocomplete from "../common/AddressAutocomplete";
import BusinessSearch from "../common/BusinessSearch";
import DuplicateWarning from "../common/DuplicateWarning";

type AccountFormProps = {
  account?: {
    _id: Id<"accounts">;
    name: string;
    type: string;
    address: string;
    city?: string;
    state?: string;
    zip?: string;
    notes?: string;
    placeId?: string;
    formattedAddress?: string;
    latitude?: number;
    longitude?: number;
    isFranchise?: boolean;
    parentAccountId?: Id<"accounts">;
  };
  onSuccess?: () => void;
};

export default function AccountForm({ account, onSuccess }: AccountFormProps) {
  const navigate = useNavigate();
  const createAccount = useMutation(api.accounts.createAccount);
  const updateAccount = useMutation(api.accounts.updateAccount);

  const [formData, setFormData] = useState({
    name: account?.name || "",
    type: account?.type || "Residential",
    unit: account?.unit || "", // Unit/Suite/Floor number
    address: account?.address || "",
    city: account?.city || "",
    state: account?.state || "",
    postcode: account?.zip || "", // Using zip field for postcode
    country: account?.country || "Australia", // Default to Australia
    notes: account?.notes || "",
    placeId: account?.placeId || "",
    formattedAddress: account?.formattedAddress || "",
    latitude: account?.latitude || 0,
    longitude: account?.longitude || 0,
    isFranchise: account?.isFranchise || false,
    parentAccountId: account?.parentAccountId || undefined,
    // Additional business details
    businessCategory: account?.businessCategory || "",
    website: account?.website || "",
    phoneNumber: account?.phoneNumber || "",
    openingHours: account?.openingHours || [],
    businessStatus: account?.businessStatus || "",
    photoCount: account?.photoCount || 0,
    photoMetadata: account?.photoMetadata || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ignoreDuplicates, setIgnoreDuplicates] = useState(false);

  // Get all accounts for parent account selection
  const accounts = useQuery(api.accounts.getAccounts) || [];
  const filteredAccounts = accounts.filter(a =>
    !account || a._id.toString() !== account._id.toString()
  );

  // Check for potential duplicates
  const checkDuplicates = useQuery(api.accounts.checkDuplicateAccounts,
    formData.name ? {
      name: formData.name,
      placeId: formData.placeId || undefined,
      address: formData.formattedAddress || formData.address || undefined,
      excludeId: account?._id.toString(),
    } : 'skip'
  );

  const [potentialDuplicates, setPotentialDuplicates] = useState<any[]>([]);

  // Update duplicates when check results change
  useEffect(() => {
    if (Array.isArray(checkDuplicates) && checkDuplicates.length > 0 && !account) {
      setPotentialDuplicates(checkDuplicates);
    } else {
      setPotentialDuplicates([]);
    }
  }, [checkDuplicates, account]);

  // Create a ref to track the previous account type
  const prevTypeRef = useRef(formData.type);

  // Clear the name field when switching between residential and commercial/industrial
  // This prevents confusion when the field label changes
  useEffect(() => {
    // Only do this for new accounts, not when editing existing ones
    if (!account) {
      const isCommercial = formData.type === "Commercial" || formData.type === "Industrial";
      const wasCommercial = prevTypeRef.current === "Commercial" || prevTypeRef.current === "Industrial";

      // If switching between commercial and residential, clear the name field
      if (isCommercial !== wasCommercial) {
        setFormData(prev => ({
          ...prev,
          name: "",
        }));
      }

      // Update the previous type
      prevTypeRef.current = formData.type;
    }
  }, [formData.type, account]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isFranchise: checked }));
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

  // Handle business selection from Google Places
  const handleBusinessSelect = (businessData: any) => {
    setFormData(prev => ({
      ...prev,
      name: businessData.name, // Set the account name to the business name
      unit: prev.unit, // Preserve existing unit
      address: businessData.address,
      city: businessData.city,
      state: businessData.state,
      postcode: businessData.postcode,
      country: businessData.country,
      placeId: businessData.placeId,
      formattedAddress: businessData.formattedAddress,
      latitude: businessData.latitude,
      longitude: businessData.longitude,
      // Store additional business details
      businessCategory: businessData.businessCategory || prev.businessCategory,
      website: businessData.website || prev.website,
      phoneNumber: businessData.phoneNumber || prev.phoneNumber,
      openingHours: businessData.openingHours || prev.openingHours,
      businessStatus: businessData.businessStatus || prev.businessStatus,
      photoReferences: businessData.photoReferences || prev.photoReferences,
    }));
  };

  // Handle parent account selection
  const handleParentAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      parentAccountId: value ? value as any : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check for duplicates before submitting
    if (potentialDuplicates.length > 0 && !ignoreDuplicates && !account) {
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

      if (onSuccess) {
        // If a custom success handler is provided, use it
        if (account) {
          // Update existing account
          await updateAccount({
            id: account._id,
            ...submissionData,
          });
        } else {
          // Create new account
          await createAccount(submissionData);
        }
        onSuccess();
      } else {
        // Handle navigation based on create/update
        if (account) {
          // Update existing account and stay on the same page
          await updateAccount({
            id: account._id,
            ...submissionData,
          });
          navigate(`/accounts/${account._id}`);
        } else {
          // Create new account and navigate to the details page
          const result = await createAccount(submissionData);
          navigate(`/accounts/${result}`);
        }
      }
    } catch (err) {
      console.error("Error saving account:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountTypes = [
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
    { value: "Industrial", label: "Industrial" },
    { value: "Other", label: "Other" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {potentialDuplicates.length > 0 && !ignoreDuplicates && !account && (
        <DuplicateWarning
          type="account"
          duplicates={potentialDuplicates}
          onIgnore={() => setIgnoreDuplicates(true)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            {(formData.type === "Commercial" || formData.type === "Industrial")
              ? "Business Name *"
              : "Property Name *"}
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder={(formData.type === "Commercial" || formData.type === "Industrial")
              ? "Search for business or enter manually"
              : "Enter property name"}
          />
          {(formData.type === "Commercial" || formData.type === "Industrial") && (
            <p className="text-xs text-gray-500 mt-1">
              Search for a business above or enter the name manually
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Account Type *</Label>
          <select
            id="type"
            name="type"
            className="w-full border rounded-md px-3 py-2"
            value={formData.type}
            onChange={handleChange}
            required
          >
            {accountTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Franchise checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isFranchise"
          checked={formData.isFranchise}
          onCheckedChange={handleCheckboxChange}
        />
        <Label htmlFor="isFranchise">
          This is a franchise/branch location
        </Label>
      </div>

      {/* Parent account selection (only shown if franchise is checked) */}
      {formData.isFranchise && (
        <div className="space-y-2 p-4 border rounded-md">
          <Label htmlFor="parentAccountId">Parent Account/Business</Label>
          <select
            id="parentAccountId"
            name="parentAccountId"
            className="w-full border rounded-md px-3 py-2"
            value={formData.parentAccountId?.toString() || ""}
            onChange={handleParentAccountChange}
          >
            <option value="">Select a parent account</option>
            {filteredAccounts.map((a) => (
              <option key={a._id.toString()} value={a._id.toString()}>
                {a.name} ({a.address})
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Select the main business location this franchise belongs to
          </p>
        </div>
      )}

      {/* Business Search Section */}
      {(formData.type === "Commercial" || formData.type === "Industrial") ? (
        <div className="space-y-4 mb-4">
          <BusinessSearch
            label="Business Search"
            onBusinessSelect={handleBusinessSelect}
            className="space-y-2"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <AddressAutocomplete
          label="Address"
          required
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
        <p className="text-xs text-gray-500 mt-1">
          Search for an address or enter manually. Format: Street number + street name (e.g., "10 Main Street")
        </p>
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
          onClick={() => navigate("/accounts")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : account ? "Update Account" : "Create Account"}
        </Button>
      </div>
    </form>
  );
}
