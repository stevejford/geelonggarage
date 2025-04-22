import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Id } from "../../../convex/_generated/dataModel";

type ConvertLeadFormProps = {
  lead: {
    _id: Id<"leads">;
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
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
    accountAddress: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, createAccount: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await convertLead({
        leadId: lead._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        accountName: formData.createAccount ? formData.accountName : undefined,
        accountType: formData.createAccount ? formData.accountType : undefined,
        accountAddress: formData.createAccount ? formData.accountAddress : undefined,
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
        
        {formData.createAccount && (
          <div className="space-y-4 mt-4 p-4 border rounded-md">
            <h3 className="text-lg font-medium">Account/Property Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account/Property Name *</Label>
                <Input
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  required={formData.createAccount}
                />
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
            
            <div className="space-y-2">
              <Label htmlFor="accountAddress">Address *</Label>
              <Input
                id="accountAddress"
                name="accountAddress"
                value={formData.accountAddress}
                onChange={handleChange}
                required={formData.createAccount}
              />
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
