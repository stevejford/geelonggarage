import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, Building, Database, Shield } from "lucide-react";
import GeneralSettings from "./tabs/GeneralSettings";
import UserManagement from "./tabs/UserManagement";
import CompanySettings from "./tabs/CompanySettings";
import IntegrationsSettings from "./tabs/IntegrationsSettings";
import RolesPermissions from "./tabs/RolesPermissions";
import AccessDenied from "@/components/AccessDenied";
import PermissionGuard from "@/components/PermissionGuard";

export default function SettingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("general");

  // Use the PermissionGuard component to check for admin role
  return (
    <PermissionGuard role="admin" message="You need administrator privileges to access settings.">
      <SettingsContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </PermissionGuard>
  );
}

// Separate component for the settings content
function SettingsContent({
  activeTab,
  setActiveTab
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void
}) {

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your application settings</p>
        </div>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Roles & Permissions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <CompanySettings />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <IntegrationsSettings />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RolesPermissions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
