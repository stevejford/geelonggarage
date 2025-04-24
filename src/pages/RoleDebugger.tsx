import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function RoleDebugger() {
  const { user } = useUser();
  const userRole = useUserRole();
  const convexRole = useQuery(api.users.getUserRole);
  const setAdminInConvex = useMutation(api.adminRole.setCurrentUserAsAdmin);

  // Function to update role in Clerk
  const updateRoleInClerk = async () => {
    try {
      await user?.update({
        publicMetadata: { role: "admin" },
      });

      // Reload the page to apply changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating role in Clerk:", error);
      alert("Failed to update role in Clerk. See console for details.");
    }
  };

  // Function to update role in Convex
  const updateRoleInConvex = async () => {
    try {
      const result = await setAdminInConvex();
      alert(result.message);
    } catch (error) {
      console.error("Error updating role in Convex:", error);
      alert("Failed to update role in Convex. See console for details.");
    }
  };

  // Function to update role in both Clerk and Convex
  const updateRoleEverywhere = async () => {
    try {
      // Update in Clerk
      await user?.update({
        publicMetadata: { role: "admin" },
      });

      // Update in Convex
      await setAdminInConvex();

      alert("Admin role set successfully in both Clerk and Convex!");

      // Reload the page to apply changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role. See console for details.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Role Debugger</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Details about your current user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">User ID:</p>
              <p className="text-gray-600">{user?.id || "Not available"}</p>
            </div>
            <div>
              <p className="font-medium">Name:</p>
              <p className="text-gray-600">{user?.fullName || "Not available"}</p>
            </div>
            <div>
              <p className="font-medium">Email:</p>
              <p className="text-gray-600">{user?.primaryEmailAddress?.emailAddress || "Not available"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
            <CardDescription>Your current role in the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Role from useUserRole hook:</p>
              <p className="text-gray-600">{userRole || "No role assigned"}</p>
            </div>
            <div>
              <p className="font-medium">Role from Clerk metadata:</p>
              <p className="text-gray-600">{user?.publicMetadata?.role as string || "No role in metadata"}</p>
            </div>
            <div>
              <p className="font-medium">Role from Convex:</p>
              <p className="text-gray-600">{convexRole || "No role in Convex"}</p>
            </div>

            <div className="pt-4 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button onClick={updateRoleInClerk} variant="outline">
                  Set Admin in Clerk Only
                </Button>
                <Button onClick={updateRoleInConvex} variant="outline">
                  Set Admin in Convex Only
                </Button>
              </div>
              <Button onClick={updateRoleEverywhere} className="w-full">
                Set Admin Role Everywhere
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Public Metadata</CardTitle>
            <CardDescription>Raw public metadata from Clerk</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              {JSON.stringify(user?.publicMetadata, null, 2) || "No metadata"}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
