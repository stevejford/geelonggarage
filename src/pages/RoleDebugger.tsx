import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function RoleDebugger() {
  // React hooks - keep these in a consistent order
  const { user } = useUser();
  const { getToken } = useAuth();
  const userRole = useUserRole();

  // State hooks
  const [jwtTemplateExists, setJwtTemplateExists] = useState<boolean | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [decodedJwt, setDecodedJwt] = useState<any>(null);
  const [isCheckingJwt, setIsCheckingJwt] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [convexFunctionsDeployed, setConvexFunctionsDeployed] = useState<boolean | null>(null);

  // Convex hooks - these must come after all other hooks
  const convexRole = useQuery(api.users.getUserRole);
  const setAdminInConvex = useMutation(api.users.setCurrentUserAsAdmin);

  // Check if Convex functions are deployed
  useEffect(() => {
    const checkConvexFunctions = async () => {
      try {
        // Try to call a Convex function
        await setAdminInConvex();
        setConvexFunctionsDeployed(true);
      } catch (error) {
        console.error("Error checking Convex functions:", error);
        if (String(error).includes("Could not find public function")) {
          setConvexFunctionsDeployed(false);
        } else {
          // If we get a different error, the function exists but might have other issues
          setConvexFunctionsDeployed(true);
        }
      }
    };

    if (jwtTemplateExists) {
      checkConvexFunctions();
    }
  }, [jwtTemplateExists, setAdminInConvex]);

  // Check if the JWT template exists
  useEffect(() => {
    const checkJwtTemplate = async () => {
      if (!user) return;

      setIsCheckingJwt(true);
      try {
        // Try to get a token with the 'convex' template
        const token = await getToken({ template: 'convex' });
        setJwtToken(token);
        setJwtTemplateExists(true);
        setErrorMessage(null);
        console.log("JWT token retrieved successfully");

        // Decode the JWT token
        try {
          // Split the token and decode the payload (middle part)
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            setDecodedJwt(payload);
            console.log("Decoded JWT payload:", payload);
          }
        } catch (decodeError) {
          console.error("Error decoding JWT:", decodeError);
        }
      } catch (error) {
        console.error("JWT template check error:", error);
        setJwtTemplateExists(false);
        if (String(error).includes("No JWT template exists with name: convex")) {
          setErrorMessage("The 'convex' JWT template does not exist in your Clerk account. Please create it in the Clerk Dashboard.");
        } else {
          setErrorMessage(String(error));
        }
      } finally {
        setIsCheckingJwt(false);
      }
    };

    checkJwtTemplate();
  }, [user, getToken]);

  // Function to update role in Clerk
  const updateRoleInClerk = async () => {
    try {
      if (!user) {
        throw new Error("No user is signed in");
      }

      // Try to update the user's metadata using unsafeMetadata
      // This is the recommended approach based on current Clerk documentation
      try {
        await user.update({
          unsafeMetadata: { role: "admin" },
        });
        console.log("Role updated in Clerk unsafeMetadata");
      } catch (unsafeError) {
        console.error("Error updating unsafeMetadata:", unsafeError);

        // If that fails, try the publicMetadata approach
        try {
          // @ts-ignore - publicMetadata might not be in the type definitions
          await user.update({
            publicMetadata: { role: "admin" },
          });
          console.log("Role updated in Clerk publicMetadata");
        } catch (publicError) {
          console.error("Error updating publicMetadata:", publicError);
          throw new Error("Could not update user metadata using any method");
        }
      }

      // Reload the page to apply changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating role in Clerk:", error);
      alert(`Failed to update role in Clerk: ${error instanceof Error ? error.message : String(error)}`);
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
      // Update in Clerk using the same approach as updateRoleInClerk
      if (!user) {
        throw new Error("No user is signed in");
      }

      // Try to update the user's metadata using unsafeMetadata first
      let clerkUpdateSuccessful = false;
      try {
        await user.update({
          unsafeMetadata: { role: "admin" },
        });
        console.log("Role updated in Clerk unsafeMetadata");
        clerkUpdateSuccessful = true;
      } catch (unsafeError) {
        console.error("Error updating unsafeMetadata:", unsafeError);

        // If that fails, try the publicMetadata approach
        try {
          // @ts-ignore - publicMetadata might not be in the type definitions
          await user.update({
            publicMetadata: { role: "admin" },
          });
          console.log("Role updated in Clerk publicMetadata");
          clerkUpdateSuccessful = true;
        } catch (publicError) {
          console.error("Error updating publicMetadata:", publicError);
          throw new Error("Could not update user metadata in Clerk using any method");
        }
      }

      // Update in Convex
      const convexResult = await setAdminInConvex();
      console.log("Role updated in Convex:", convexResult);

      alert(`Admin role set successfully in ${clerkUpdateSuccessful ? 'both Clerk and ' : ''}Convex!`);

      // Reload the page to apply changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating role:", error);
      alert(`Failed to update role: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Role Debugger</h1>

      {/* JWT Template Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>JWT Template Status</CardTitle>
          <CardDescription>
            Checking if the required JWT template exists in your Clerk account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCheckingJwt ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <p>Checking JWT template...</p>
            </div>
          ) : jwtTemplateExists === true ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">JWT Template Found</AlertTitle>
              <AlertDescription className="text-green-700">
                The 'convex' JWT template exists in your Clerk account.
              </AlertDescription>
            </Alert>
          ) : jwtTemplateExists === false ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>JWT Template Missing or Invalid</AlertTitle>
              <AlertDescription>
                {errorMessage || "There was an error checking the JWT template."}
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        {jwtToken && (
          <CardFooter>
            <div className="w-full">
              <p className="font-medium mb-2">JWT Token Preview:</p>
              <div className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                {jwtToken.substring(0, 50)}...
              </div>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Convex Functions Deployment Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Convex Functions Status</CardTitle>
          <CardDescription>
            Checking if the required Convex functions are deployed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {convexFunctionsDeployed === null ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <p>Checking Convex functions...</p>
            </div>
          ) : convexFunctionsDeployed === true ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Convex Functions Deployed</AlertTitle>
              <AlertDescription className="text-green-700">
                The required Convex functions are deployed and available.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Convex Functions Not Deployed</AlertTitle>
              <AlertDescription>
                The required Convex functions are not deployed. Please run one of the following commands:
                <div className="mt-2 space-y-2">
                  <div className="bg-gray-100 p-2 rounded font-mono text-sm">npx convex dev</div>
                  <p className="text-xs">or</p>
                  <div className="bg-gray-100 p-2 rounded font-mono text-sm">npx convex deploy</div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

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
              <p className="font-medium">Role from Clerk publicMetadata:</p>
              <p className="text-gray-600">{user?.publicMetadata?.role as string || "No role in publicMetadata"}</p>
            </div>
            <div>
              <p className="font-medium">Role from Clerk unsafeMetadata:</p>
              <p className="text-gray-600">{user?.unsafeMetadata?.role as string || "No role in unsafeMetadata"}</p>
            </div>
            <div>
              <p className="font-medium">Role from Convex:</p>
              <p className="text-gray-600">{convexRole || "No role in Convex"}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-blue-600 hover:underline mt-1"
              >
                Refresh to check latest role
              </button>
            </div>

            <div className="pt-4 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button onClick={updateRoleInClerk} variant="outline">
                  Set Admin in Clerk Only
                </Button>
                <Button
                  onClick={updateRoleInConvex}
                  variant="outline"
                  disabled={!jwtTemplateExists}
                  title={!jwtTemplateExists ? "JWT template issue must be fixed first" : ""}
                >
                  Set Admin in Convex Only
                </Button>
              </div>
              <Button
                onClick={updateRoleEverywhere}
                className="w-full"
                disabled={!jwtTemplateExists}
                title={!jwtTemplateExists ? "JWT template issue must be fixed first" : ""}
              >
                Set Admin Role Everywhere
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Public Metadata</CardTitle>
            <CardDescription>Raw public metadata from Clerk</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-80">
              {JSON.stringify(user?.publicMetadata, null, 2) || "No metadata"}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unsafe Metadata</CardTitle>
            <CardDescription>Raw unsafe metadata from Clerk</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-80">
              {JSON.stringify(user?.unsafeMetadata, null, 2) || "No metadata"}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clerk Identity</CardTitle>
            <CardDescription>User identity information from Clerk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="font-medium">Token Identifier:</p>
                <p className="text-gray-600 text-sm break-all">{user?.id}</p>
              </div>
              <div>
                <p className="font-medium">Email:</p>
                <p className="text-gray-600">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <div>
                <p className="font-medium">Name:</p>
                <p className="text-gray-600">{user?.fullName}</p>
              </div>
              <div>
                <p className="font-medium">First Name:</p>
                <p className="text-gray-600">{user?.firstName}</p>
              </div>
              <div>
                <p className="font-medium">Last Name:</p>
                <p className="text-gray-600">{user?.lastName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-1 gap-6">
        {decodedJwt && (
          <Card>
            <CardHeader>
              <CardTitle>Decoded JWT Token</CardTitle>
              <CardDescription>Contents of the Convex JWT template</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-80">
                {JSON.stringify(decodedJwt, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
