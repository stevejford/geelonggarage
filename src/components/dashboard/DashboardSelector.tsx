import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Dashboard from "@/pages/Dashboard";
import OperationsManagerDashboard from "@/pages/dashboards/OperationsManagerDashboard";
import FinanceManagerDashboard from "@/pages/dashboards/FinanceManagerDashboard";

export default function DashboardSelector() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("general");

  // Check if user has specific roles
  // In a real application, you would check the user's roles from Clerk or your backend
  const hasOperationsRole = true; // For demo purposes, allowing all users to see all dashboards
  const hasFinanceRole = true;    // In production, you would check actual roles

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          {hasOperationsRole && (
            <TabsTrigger value="operations">Operations</TabsTrigger>
          )}
          {hasFinanceRole && (
            <TabsTrigger value="finance">Finance</TabsTrigger>
          )}
        </TabsList>
      </div>

      <TabsContent value="general" className="mt-0">
        <Dashboard />
      </TabsContent>

      {hasOperationsRole && (
        <TabsContent value="operations" className="mt-0">
          <OperationsManagerDashboard />
        </TabsContent>
      )}

      {hasFinanceRole && (
        <TabsContent value="finance" className="mt-0">
          <FinanceManagerDashboard />
        </TabsContent>
      )}
    </Tabs>
  );
}
