import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TestInquiryPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    
    try {
      // Get the webhook URL from the window location
      const protocol = window.location.protocol;
      const host = window.location.host;
      const webhookUrl = `${protocol}//${host}/api/wordpress-inquiry`;
      
      // Send the inquiry to the webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true });
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        setResult({ error: data.error || "An error occurred" });
      }
    } catch (error) {
      setResult({ error: "Failed to send inquiry" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Test WordPress Inquiry</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {result?.success && (
            <div className="bg-green-50 text-green-800 p-4 rounded-md mb-4">
              Inquiry sent successfully! A new lead has been created.
            </div>
          )}
          
          {result?.error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
              {result.error}
            </div>
          )}
          
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
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Inquiry"}
          </Button>
        </form>
      </div>
    </div>
  );
}
