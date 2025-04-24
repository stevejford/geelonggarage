import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

/**
 * Component that syncs the Clerk user with Convex
 * This ensures that when a user signs in with Clerk, their information is properly stored in Convex
 */
export default function ClerkConvexSync() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const syncUser = useMutation(api.users.syncClerkUser);
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false);

  useEffect(() => {
    // Only sync when the user is signed in and Clerk is loaded
    if (isLoaded && isSignedIn && !hasAttemptedSync) {
      const handleSync = async () => {
        try {
          // First, check if we can get a token with the convex template
          try {
            const token = await getToken({ template: 'convex' });
            console.log("Successfully retrieved Convex JWT token");
          } catch (tokenError) {
            console.error("Error getting Convex JWT token:", tokenError);
            toast.error('JWT template error. Please check Clerk configuration.');
            setHasAttemptedSync(true);
            return; // Don't proceed if we can't get a token
          }

          // Sync the user with Convex
          const result = await syncUser();
          console.log("User synced successfully with Convex:", result);

          if (result?.isNew) {
            toast.success('Welcome! Your account has been created.');
          }
        } catch (error) {
          console.error('Error syncing user with Convex:', error);

          if (String(error).includes("Not authenticated")) {
            console.warn("Authentication error with Convex. This may be due to JWT configuration issues.");
            toast.error('Authentication error. Please sign out and sign in again.');
          } else if (String(error).includes("Could not find public function")) {
            console.warn("Convex function not found. Please run 'npx convex dev' or 'npx convex deploy' to deploy your functions.");
            toast.warning('Convex functions need to be deployed. Run "npx convex dev" or "npx convex deploy"');
          } else {
            toast.error('Failed to sync user data');
          }
        } finally {
          setHasAttemptedSync(true);
        }
      };

      handleSync();
    }
  }, [isSignedIn, isLoaded, syncUser, hasAttemptedSync, getToken]);

  // This component doesn't render anything
  return null;
}
