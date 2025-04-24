import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AdminAccess() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  // Direct database mutation to set admin role
  const directSetAdmin = useMutation(api.users.directSetUserAsAdmin);

  const handleSetAdmin = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      // Call the direct mutation
      const response = await directSetAdmin({
        userId: user.id,
      });
      
      setResult(`Success! You are now an admin. Please navigate to the Settings page.`);
    } catch (error: any) {
      console.error("Error setting admin role:", error);
      setResult(`Error: ${error.message || "Unknown error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Access Utility</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Set Admin Role</CardTitle>
          <CardDescription>
            This utility will directly set your user account as an admin in the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Current User:</p>
              <p className="text-gray-600">{user?.fullName || "Not signed in"}</p>
            </div>
            <div>
              <p className="font-medium">User ID:</p>
              <p className="text-gray-600">{user?.id || "Not available"}</p>
            </div>
            
            <Button 
              onClick={handleSetAdmin} 
              disabled={isLoading || !user}
              className="w-full"
            >
              {isLoading ? "Setting Admin Role..." : "Set Me As Admin"}
            </Button>
            
            {result && (
              <div className={`p-4 rounded-md ${result.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                {result}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
