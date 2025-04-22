import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Id } from "../../../convex/_generated/dataModel";
import AddressAutocomplete from "../common/AddressAutocomplete";
import BusinessSearch from "../common/BusinessSearch";
import DuplicateWarning from "../common/DuplicateWarning";

type ConvertLeadFormProps = {
  lead: {
    _id: Id<"leads">;
    name: string;
    email?: string;
    phone?: string;
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
  onSuccess: () => void;
  onCancel: () => void;
};

export default function ConvertLeadForm({
  lead,
  onSuccess,
  onCancel,
}: ConvertLeadFormProps) {
  const convertLead = useMutation(api.leads.convertLeadToContact);

  // Split the lead name into first and last name
  const nameParts = lead.name.split(" ");
  const lastName = nameParts.length > 1 ? nameParts.pop() || "" : "";
  const firstName = nameParts.join(" ");

  const [formData, setFormData] = useState({
    firstName,
    lastName,
    createAccount: false,
    accountName: "",
    accountType: "Residential",
    // Address fields
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
    // For account creation
    accountUnit: lead?.unit || "", // Unit/Suite/Floor number
    accountAddress: lead?.formattedAddress || lead?.address || "",
    accountCity: lead?.city || "",
    accountState: lead?.state || "",
    accountPostcode: lead?.zip || "", // Using zip field for postcode
    accountCountry: lead?.country || "Australia", // Default to Australia
    accountPlaceId: lead?.placeId || "",
    accountFormattedAddress: lead?.formattedAddress || "",
    accountLatitude: lead?.latitude || 0,
    accountLongitude: lead?.longitude || 0,
    isFranchise: false,
    parentAccountId: undefined as Id<"accounts"> | undefined,
    // We don't need business details for leads
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [potentialDuplicates, setPotentialDuplicates] = useState<any[]>([]);
  const [ignoreDuplicates, setIgnoreDuplicates] = useState(false);

  // Get all accounts for parent account selection
  const accounts = useQuery(api.accounts.getAccounts) || [];

  // Check for potential duplicate contacts
  const checkDuplicateContacts = useQuery(api.contacts.checkDuplicateContacts,
    formData.firstName && formData.lastName ? {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: lead.email || undefined,
      phone: lead.phone || undefined,
      placeId: formData.placeId || undefined,
      address: formData.formattedAddress || formData.address || undefined,
    } : 'skip'
  );

  // Update duplicates when check results change
  useEffect(() => {
    if (Array.isArray(checkDuplicateContacts) && checkDuplicateContacts.length > 0) {
      setPotentialDuplicates(checkDuplicateContacts);
    } else {
      setPotentialDuplicates([]);
    }
  }, [checkDuplicateContacts]);

  // Create a ref to track the previous account type
  const prevAccountTypeRef = useRef(formData.accountType);

  // Clear the account name field when switching between residential and commercial/industrial
  // This prevents confusion when the field label changes
  useEffect(() => {
    const isCommercial = formData.accountType === "Commercial" || formData.accountType === "Industrial";
    const wasCommercial = prevAccountTypeRef.current === "Commercial" || prevAccountTypeRef.current === "Industrial";

    // If switching between commercial and residential, clear the name field
    if (isCommercial !== wasCommercial) {
      setFormData(prev => ({
        ...prev,
        accountName: "",
      }));
    }

    // Update the previous type
    prevAccountTypeRef.current = formData.accountType;
  }, [formData.accountType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean, field: string = 'createAccount') => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  // Handle address selection from Google Places for contact
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

  // Handle address selection from Google Places for account
  const handleAccountAddressChange = (addressData: any) => {
    setFormData(prev => ({
      ...prev,
      accountUnit: addressData.unit || prev.accountUnit, // Preserve unit if not provided
      accountAddress: addressData.address,
      accountCity: addressData.city,
      accountState: addressData.state,
      accountPostcode: addressData.postcode,
      accountCountry: addressData.country,
      accountPlaceId: addressData.placeId,
      accountFormattedAddress: addressData.formattedAddress,
      accountLatitude: addressData.latitude,
      accountLongitude: addressData.longitude,
    }));
  };

  // Handle business selection from Google Places for account
  const handleAccountBusinessSelect = (businessData: any) => {
    setFormData(prev => ({
      ...prev,
      accountName: businessData.name, // Set the account name to the business name
      accountUnit: prev.accountUnit, // Preserve existing unit
      accountAddress: businessData.address,
      accountCity: businessData.city,
      accountState: businessData.state,
      accountPostcode: businessData.postcode,
      accountCountry: businessData.country,
      accountPlaceId: businessData.placeId,
      accountFormattedAddress: businessData.formattedAddress,
      accountLatitude: businessData.latitude,
      accountLongitude: businessData.longitude,
      // We don't need to store business details for leads
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
    if (potentialDuplicates.length > 0 && !ignoreDuplicates) {
      // Show duplicate warning - don't submit yet
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert postcode to zip for backend compatibility
      await convertLead({
        leadId: lead._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        // Contact address fields
        unit: formData.unit,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.postcode, // Map postcode to zip for the backend
        country: formData.country,
        placeId: formData.placeId,
        formattedAddress: formData.formattedAddress,
        latitude: formData.latitude,
        longitude: formData.longitude,
        // Account fields if creating an account
        accountName: formData.createAccount ? formData.accountName : undefined,
        accountType: formData.createAccount ? formData.accountType : undefined,
        accountUnit: formData.createAccount ? formData.accountUnit : undefined,
        accountAddress: formData.createAccount ? formData.accountAddress : undefined,
        accountCity: formData.createAccount ? formData.accountCity : undefined,
        accountState: formData.createAccount ? formData.accountState : undefined,
        accountPostcode: formData.createAccount ? formData.accountPostcode : undefined, // This will be mapped to accountZip in the backend
        accountCountry: formData.createAccount ? formData.accountCountry : undefined,
        accountPlaceId: formData.createAccount ? formData.accountPlaceId : undefined,
        accountFormattedAddress: formData.createAccount ? formData.accountFormattedAddress : undefined,
        accountLatitude: formData.createAccount ? formData.accountLatitude : undefined,
        accountLongitude: formData.createAccount ? formData.accountLongitude : undefined,
        // We don't need business details for leads
        // Franchise fields
        isFranchise: formData.createAccount ? formData.isFranchise : undefined,
        parentAccountId: formData.createAccount && formData.isFranchise ? formData.parentAccountId : undefined,
      });

      onSuccess();
    } catch (err) {
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

      {potentialDuplicates.length > 0 && !ignoreDuplicates && (
        <DuplicateWarning
          type="contact"
          duplicates={potentialDuplicates}
          onIgnore={() => setIgnoreDuplicates(true)}
        />
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contact Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="createAccount"
              checked={formData.createAccount}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="createAccount">
              Create an account/property for this contact
            </Label>
          </div>
        </div>

        {/* Contact Address Autocomplete */}
        <div className="space-y-2">
          <AddressAutocomplete
            label="Contact Address"
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

        {formData.createAccount && (
          <div className="space-y-4 mt-4 p-4 border rounded-md">
            <h3 className="text-lg font-medium">Account/Property Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">
                  {(formData.accountType === "Commercial" || formData.accountType === "Industrial")
                    ? "Business Name *"
                    : "Property Name *"}
                </Label>
                <Input
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  required={formData.createAccount}
                  placeholder={(formData.accountType === "Commercial" || formData.accountType === "Industrial")
                    ? "Search for business or enter manually"
                    : "Enter property name"}
                />
                {(formData.accountType === "Commercial" || formData.accountType === "Industrial") && (
                  <p className="text-xs text-gray-500 mt-1">
                    Search for a business below or enter the name manually
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type *</Label>
                <select
                  id="accountType"
                  name="accountType"
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.accountType}
                  onChange={handleChange}
                  required={formData.createAccount}
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
                onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, 'isFranchise')}
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
                  {accounts.map((a) => (
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
            {(formData.accountType === "Commercial" || formData.accountType === "Industrial") ? (
              <div className="space-y-4 mb-4">
                <BusinessSearch
                  label="Business Search"
                  onBusinessSelect={handleAccountBusinessSelect}
                  className="space-y-2"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <AddressAutocomplete
                label="Account Address"
                required={formData.createAccount}
                value={{
                  unit: formData.accountUnit,
                  address: formData.accountAddress,
                  city: formData.accountCity,
                  state: formData.accountState,
                  postcode: formData.accountPostcode,
                  country: formData.accountCountry,
                  placeId: formData.accountPlaceId,
                  formattedAddress: formData.accountFormattedAddress,
                  latitude: formData.accountLatitude,
                  longitude: formData.accountLongitude,
                }}
                onChange={handleAccountAddressChange}
                className="space-y-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Search for an address or enter manually. Format: Street number + street name (e.g., "10 Main Street")
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Converting..." : "Convert Lead"}
        </Button>
      </div>
    </form>
  );
}
