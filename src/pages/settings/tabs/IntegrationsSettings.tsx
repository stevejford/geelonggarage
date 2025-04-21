import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import {
  CreditCard,
  Mail,
  Calendar,
  MessageSquare,
  FileText,
  Database,
  Link as LinkIcon,
  Unlink
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  apiKey?: string;
  webhookUrl?: string;
}

export default function IntegrationsSettings() {
  // Mock integration settings for development
  const defaultSettings = {
    stripe: { enabled: false, apiKey: "" },
    mailchimp: { enabled: false, apiKey: "" },
    googleCalendar: { enabled: false, apiKey: "" },
    slack: { enabled: false, webhookUrl: "" },
    quickbooks: { enabled: false, apiKey: "" },
    mcp: { enabled: false, servers: [] }
  };

  // Local state for form
  const [formData, setFormData] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);

  // Mock mutation for development

  // Handle form changes
  const handleChange = (integration: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration as keyof typeof prev],
        [field]: value
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (integration: string) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`${integration} settings updated:`, formData[integration as keyof typeof formData]);

      toast.success(`${integration.charAt(0).toUpperCase() + integration.slice(1)} settings updated successfully`);
      setActiveIntegration(null);
    } catch (error) {
      console.error(`Error updating ${integration} settings:`, error);
      toast.error(`Failed to update ${integration} settings`);
    } finally {
      setIsLoading(false);
    }
  };

  // Integration list
  const integrations: Integration[] = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Payment processing integration",
      icon: <CreditCard className="h-6 w-6 text-purple-600" />,
      isConnected: formData.stripe.enabled,
      apiKey: formData.stripe.apiKey
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Email marketing automation",
      icon: <Mail className="h-6 w-6 text-yellow-600" />,
      isConnected: formData.mailchimp.enabled,
      apiKey: formData.mailchimp.apiKey
    },
    {
      id: "googleCalendar",
      name: "Google Calendar",
      description: "Calendar and scheduling",
      icon: <Calendar className="h-6 w-6 text-blue-600" />,
      isConnected: formData.googleCalendar.enabled,
      apiKey: formData.googleCalendar.apiKey
    },
    {
      id: "slack",
      name: "Slack",
      description: "Team communication",
      icon: <MessageSquare className="h-6 w-6 text-green-600" />,
      isConnected: formData.slack.enabled,
      webhookUrl: formData.slack.webhookUrl
    },
    {
      id: "quickbooks",
      name: "QuickBooks",
      description: "Accounting and invoicing",
      icon: <FileText className="h-6 w-6 text-red-600" />,
      isConnected: formData.quickbooks.enabled,
      apiKey: formData.quickbooks.apiKey
    },
    {
      id: "mcp",
      name: "Model Context Protocol",
      description: "AI model integrations",
      icon: <Database className="h-6 w-6 text-indigo-600" />,
      isConnected: formData.mcp.enabled
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect your application with external services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-gray-100">
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{integration.name}</h3>
                    <p className="text-sm text-gray-500">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    integration.isConnected
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {integration.isConnected ? "Connected" : "Not Connected"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveIntegration(integration.id)}
                  >
                    {integration.isConnected ? "Configure" : "Connect"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stripe Configuration */}
      {activeIntegration === "stripe" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <CardTitle>Stripe Configuration</CardTitle>
            </div>
            <CardDescription>
              Connect your Stripe account for payment processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="stripeEnabled">Enable Stripe Integration</Label>
                <p className="text-sm text-gray-500">
                  Allow the application to process payments through Stripe
                </p>
              </div>
              <Switch
                id="stripeEnabled"
                checked={formData.stripe.enabled}
                onCheckedChange={(checked) => handleChange("stripe", "enabled", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripeApiKey">Stripe API Key</Label>
              <Input
                id="stripeApiKey"
                type="password"
                value={formData.stripe.apiKey}
                onChange={(e) => handleChange("stripe", "apiKey", e.target.value)}
                placeholder="sk_test_..."
              />
              <p className="text-xs text-gray-500">
                Find your API keys in the Stripe Dashboard under Developers &gt; API keys
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveIntegration(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit("stripe")}
              disabled={isLoading}
            >
              {formData.stripe.enabled ? (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Connection"}
                </>
              ) : (
                <>
                  <Unlink className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Disconnect"}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Mailchimp Configuration */}
      {activeIntegration === "mailchimp" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-yellow-600" />
              <CardTitle>Mailchimp Configuration</CardTitle>
            </div>
            <CardDescription>
              Connect your Mailchimp account for email marketing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mailchimpEnabled">Enable Mailchimp Integration</Label>
                <p className="text-sm text-gray-500">
                  Allow the application to sync contacts with Mailchimp
                </p>
              </div>
              <Switch
                id="mailchimpEnabled"
                checked={formData.mailchimp.enabled}
                onCheckedChange={(checked) => handleChange("mailchimp", "enabled", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mailchimpApiKey">Mailchimp API Key</Label>
              <Input
                id="mailchimpApiKey"
                type="password"
                value={formData.mailchimp.apiKey}
                onChange={(e) => handleChange("mailchimp", "apiKey", e.target.value)}
                placeholder="abc123def456..."
              />
              <p className="text-xs text-gray-500">
                Find your API key in your Mailchimp account under Account &gt; Extras &gt; API keys
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveIntegration(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit("mailchimp")}
              disabled={isLoading}
            >
              {formData.mailchimp.enabled ? (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Connection"}
                </>
              ) : (
                <>
                  <Unlink className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Disconnect"}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* MCP Configuration */}
      {activeIntegration === "mcp" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              <CardTitle>Model Context Protocol Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure MCP servers to expand AI capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mcpEnabled">Enable MCP Integration</Label>
                <p className="text-sm text-gray-500">
                  Allow the application to use Model Context Protocol servers
                </p>
              </div>
              <Switch
                id="mcpEnabled"
                checked={formData.mcp.enabled}
                onCheckedChange={(checked) => handleChange("mcp", "enabled", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>MCP Servers</Label>
              <div className="border rounded-md p-4 space-y-4">
                {formData.mcp.servers && formData.mcp.servers.map((server: any, index: number) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="space-y-2">
                      <Label htmlFor={`serverName-${index}`}>Server Name</Label>
                      <Input
                        id={`serverName-${index}`}
                        value={server.name}
                        onChange={(e) => {
                          const updatedServers = [...formData.mcp.servers];
                          updatedServers[index].name = e.target.value;
                          handleChange("mcp", "servers", updatedServers);
                        }}
                        placeholder="e.g., context7"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`serverCommand-${index}`}>Command</Label>
                      <Input
                        id={`serverCommand-${index}`}
                        value={server.command}
                        onChange={(e) => {
                          const updatedServers = [...formData.mcp.servers];
                          updatedServers[index].command = e.target.value;
                          handleChange("mcp", "servers", updatedServers);
                        }}
                        placeholder="e.g., npx -y @upstash/context7-mcp@latest"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          const updatedServers = [...formData.mcp.servers];
                          updatedServers.splice(index, 1);
                          handleChange("mcp", "servers", updatedServers);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => {
                    const updatedServers = [...(formData.mcp.servers || [])];
                    updatedServers.push({ name: "", command: "" });
                    handleChange("mcp", "servers", updatedServers);
                  }}
                >
                  Add Server
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Configure Model Context Protocol servers to expand AI capabilities with external tools and data sources
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveIntegration(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit("mcp")}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Configuration"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
