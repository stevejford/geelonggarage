import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";

/**
 * Hook to get the current user's role
 * @returns The user's role or null if not authenticated
 */
export function useUserRole() {
  // First try to get the role from Convex
  const convexRole = useQuery(api.users.getUserRole);

  // If Convex role is available, use it
  if (convexRole !== undefined) {
    return convexRole;
  }

  // Fallback to Clerk metadata
  const { user } = useUser();
  return user?.publicMetadata?.role as string || null;
}
