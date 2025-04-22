import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function CompanySettings() {
  // Mock company settings for development
  const defaultSettings = {
    companyName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
    email: "",
    website: "",
    taxId: "",
    logoUrl: "",
  };

  // Local state for form
  const [formData, setFormData] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Mock mutations for development

  // Handle form changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle logo upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let logoUrl = formData.logoUrl;

      // Simulate logo upload if a new one was selected
      if (logoFile) {
        // Simulate upload process
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real implementation, we would upload the file to storage
        // and get back a URL or storage ID
        logoUrl = URL.createObjectURL(logoFile);
      }

      // Simulate API call to update settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Company settings updated:", {
        ...formData,
        logoUrl,
      });

      toast.success("Company settings updated successfully");
    } catch (error) {
      console.error("Error updating company settings:", error);
      toast.error("Failed to update company settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Update your company details and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo</Label>
            <div className="flex items-center gap-4">
              {(formData.logoUrl || logoFile) && (
                <div className="h-16 w-16 rounded-md border overflow-hidden">
                  <img
                    src={logoFile ? URL.createObjectURL(logoFile) : formData.logoUrl}
                    alt="Company Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div>
                <Label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  {formData.logoUrl ? "Change Logo" : "Upload Logo"}
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended size: 200x200px. Max 2MB.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">Postcode</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => handleChange("zip", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => handleChange("country", value)}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => handleChange("taxId", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
