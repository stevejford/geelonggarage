import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection, FormRow, FormActions } from "@/components/ui/form-layout";
import { Id } from "../../../convex/_generated/dataModel";
import BusinessAutocomplete from "../common/BusinessAutocomplete";
import AddressAutocomplete from "../common/AddressAutocomplete";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    country?: string;
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
    address: account?.address || "",
    unit: account?.unit || "",
    city: account?.city || "",
    state: account?.state || "",
    zip: account?.zip || "",
    notes: account?.notes || "",
    placeId: account?.placeId || "",
    formattedAddress: account?.formattedAddress || "",
    latitude: account?.latitude || 0,
    longitude: account?.longitude || 0,
    country: account?.country || "Australia",
    // Additional business details
    businessCategory: account?.businessCategory || "",
    businessStatus: account?.businessStatus || "",
    phoneNumber: account?.phoneNumber || "",
    email: account?.email || "",
    website: account?.website || "",
    openingHours: account?.openingHours || [],
    isFranchise: account?.isFranchise || false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateAccount, setDuplicateAccount] = useState<any>(null);
  const [duplicateType, setDuplicateType] = useState<string>("");

  // Handle duplicate checking
  const handleDuplicateCheck = async (placeId: string, formattedAddress: string) => {
    try {
      const result = await checkDuplicateAccount({
        placeId,
        formattedAddress
      });

      if (result?.isDuplicate) {
        setDuplicateAccount(result.account);
        setDuplicateType(result.matchType);
      } else {
        setDuplicateAccount(null);
        setDuplicateType("");
      }
    } catch (err) {
      console.error("Error checking for duplicates:", err);
    }
  };

  // Call the duplicate check API
  const checkDuplicateAccount = useQuery(api.accounts.checkDuplicateAccount, {
    placeId: formData.placeId,
    formattedAddress: formData.formattedAddress
  });

  // Update duplicate state when the query result changes
  useEffect(() => {
    if (checkDuplicateAccount?.isDuplicate) {
      setDuplicateAccount(checkDuplicateAccount.account);
      setDuplicateType(checkDuplicateAccount.matchType);
    } else {
      setDuplicateAccount(null);
      setDuplicateType("");
    }
  }, [checkDuplicateAccount]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear duplicate warning when account type changes
    if (name === "type") {
      setDuplicateAccount(null);
      setDuplicateType("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Include all fields including Google Places data
      const submissionData = {
        name: formData.name,
        type: formData.type,
        address: formData.address,
        unit: formData.unit,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
        notes: formData.notes,
        // Google Places fields
        placeId: formData.placeId,
        formattedAddress: formData.formattedAddress,
        latitude: formData.latitude,
        longitude: formData.longitude,
        // Additional business details from Google Places
        businessCategory: formData.businessCategory,
        businessStatus: formData.businessStatus,
        isFranchise: formData.isFranchise,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        website: formData.website,
        openingHours: formData.openingHours,
      };

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

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/accounts");
      }
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

      <FormSection title="Account Information">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Account Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Select the type of account you want to create. Different account types use different search methods.
            </p>
          </div>

          {/* Show duplicate warning if a duplicate is found */}
          {duplicateAccount && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Duplicate Account Found</AlertTitle>
              <AlertDescription>
                An account with this {duplicateType === "placeId" ? "business" : "address"} already exists:
                <strong>{duplicateAccount.name}</strong> at {duplicateAccount.address}.
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/accounts/${duplicateAccount._id}`)}
                  >
                    View Existing Account
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Show different search components based on account type */}
          {(formData.type === "Commercial" || formData.type === "Industrial") ? (
            <div className="mt-4">
              <BusinessAutocomplete
                label="Business Name"
                required={true}
                value={{
                  name: formData.name,
                  unit: formData.unit,
                  address: formData.address,
                  city: formData.city,
                  state: formData.state,
                  postcode: formData.zip,
                  country: formData.country || "Australia",
                  placeId: formData.placeId,
                  formattedAddress: formData.formattedAddress,
                  latitude: formData.latitude,
                  longitude: formData.longitude,
                  // Additional business details
                  businessCategory: formData.businessCategory,
                  businessStatus: formData.businessStatus,
                  phoneNumber: formData.phoneNumber,
                  email: formData.email,
                  website: formData.website,
                  openingHours: formData.openingHours,
                  isFranchise: formData.isFranchise
                }}
                onChange={(businessData) => {
                  setFormData(prev => ({
                    ...prev,
                    name: businessData.name,
                    unit: businessData.unit,
                    address: businessData.address,
                    city: businessData.city,
                    state: businessData.state,
                    zip: businessData.postcode,
                    country: businessData.country,
                    placeId: businessData.placeId,
                    formattedAddress: businessData.formattedAddress,
                    latitude: businessData.latitude,
                    longitude: businessData.longitude,
                    // Additional business details
                    businessCategory: businessData.businessCategory || prev.businessCategory,
                    businessStatus: businessData.businessStatus || prev.businessStatus,
                    phoneNumber: businessData.phoneNumber || prev.phoneNumber,
                    email: businessData.email || prev.email,
                    website: businessData.website || prev.website,
                    openingHours: businessData.openingHours || prev.openingHours,
                    isFranchise: businessData.isFranchise || prev.isFranchise
                  }));
                }}
                onDuplicateCheck={handleDuplicateCheck}
                className="space-y-4"
              />
            </div>
          ) : (
            <div className="mt-4">
              <div className="space-y-2 mb-4">
                <Label htmlFor="name">Account Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter account name..."
                  required
                  className="text-base"
                />
                <p className="text-xs text-gray-500">
                  For residential accounts, this is typically the homeowner's name or family name.
                </p>
              </div>

              <AddressAutocomplete
                label="Address"
                required={true}
                value={{
                  unit: formData.unit,
                  address: formData.address,
                  city: formData.city,
                  state: formData.state,
                  postcode: formData.zip,
                  country: formData.country || "Australia",
                  placeId: formData.placeId,
                  formattedAddress: formData.formattedAddress,
                  latitude: formData.latitude,
                  longitude: formData.longitude
                }}
                onChange={(addressData) => {
                  setFormData(prev => ({
                    ...prev,
                    unit: addressData.unit,
                    address: addressData.address,
                    city: addressData.city,
                    state: addressData.state,
                    zip: addressData.postcode,
                    country: addressData.country,
                    placeId: addressData.placeId,
                    formattedAddress: addressData.formattedAddress,
                    latitude: addressData.latitude,
                    longitude: addressData.longitude
                  }));
                }}
                onDuplicateCheck={handleDuplicateCheck}
                className="space-y-4"
              />
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="Address Information" className="mt-6">
        {formData.address && (
          <div className="space-y-4">
            <div className="space-y-2 w-full">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                readOnly
                className="bg-gray-50 w-full text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  readOnly
                  className="bg-gray-50 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  readOnly
                  className="bg-gray-50 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">Postcode</Label>
                <Input
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  readOnly
                  className="bg-gray-50 text-base"
                />
              </div>
            </div>

            {formData.formattedAddress && (
              <div className="space-y-2 w-full">
                <Label htmlFor="formattedAddress">Formatted Address</Label>
                <Input
                  id="formattedAddress"
                  name="formattedAddress"
                  value={formData.formattedAddress}
                  readOnly
                  className="bg-gray-50 w-full text-base"
                />
              </div>
            )}
          </div>
        )}
      </FormSection>

      {/* Only show Contact Information for Commercial and Industrial accounts */}
      {(formData.type === "Commercial" || formData.type === "Industrial") && (
        <FormSection title="Contact Information" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.phoneNumber && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  readOnly
                  className="bg-gray-50 text-base"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter business email address..."
                className="text-base"
              />
            </div>
            {formData.website && (
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  readOnly
                  className="bg-gray-50 text-base"
                />
              </div>
            )}
          </div>
        </FormSection>
      )}

      <FormSection title="Additional Information" className="mt-6">
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter any additional notes about this account..."
          />
        </div>
      </FormSection>

      <FormActions>
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
      </FormActions>
    </form>
  );
}
