import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Id } from "../../../convex/_generated/dataModel";

type AccountLinkFormProps = {
  contactId: Id<"contacts">;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function AccountLinkForm({
  contactId,
  onSuccess,
  onCancel,
}: AccountLinkFormProps) {
  const linkContactToAccount = useMutation(api.accounts.linkContactToAccount);
  const accounts = useQuery(api.accounts.getAccounts) || [];
  
  const [formData, setFormData] = useState({
    accountId: "",
    relationship: "",
    isPrimary: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPrimary: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId) {
      setError("Please select an account");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await linkContactToAccount({
        contactId,
        accountId: formData.accountId as any,
        relationship: formData.relationship || undefined,
        isPrimary: formData.isPrimary,
      });
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const relationshipOptions = [
    { value: "", label: "Select a relationship (optional)" },
    { value: "Owner", label: "Owner" },
    { value: "Tenant", label: "Tenant" },
    { value: "Manager", label: "Manager" },
    { value: "Employee", label: "Employee" },
    { value: "Other", label: "Other" },
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accountId">Select Account *</Label>
          <select
            id="accountId"
            name="accountId"
            className="w-full border rounded-md px-3 py-2"
            value={formData.accountId}
            onChange={handleChange}
            required
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account._id.toString()} value={account._id.toString()}>
                {account.name} ({account.address})
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship</Label>
          <select
            id="relationship"
            name="relationship"
            className="w-full border rounded-md px-3 py-2"
            value={formData.relationship}
            onChange={handleChange}
          >
            {relationshipOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPrimary"
            checked={formData.isPrimary}
            onCheckedChange={handleCheckboxChange}
          />
          <Label htmlFor="isPrimary">
            Set as primary contact for this account
          </Label>
        </div>
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
          {isSubmitting ? "Linking..." : "Link Account"}
        </Button>
      </div>
    </form>
  );
}
