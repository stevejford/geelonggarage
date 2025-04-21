import { useUserRole } from "@/hooks/useUserRole";

// Define role hierarchy
const roleHierarchy: Record<string, number> = {
  admin: 100,
  manager: 75,
  technician: 50,
  user: 25,
};

// Define permissions for each role
const rolePermissions: Record<string, string[]> = {
  admin: ["*"], // Admin has all permissions
  manager: [
    "leads:read", "leads:write",
    "contacts:read", "contacts:write",
    "accounts:read", "accounts:write",
    "quotes:read", "quotes:write",
    "workOrders:read", "workOrders:write",
    "invoices:read", "invoices:write",
  ],
  technician: [
    "contacts:read",
    "accounts:read",
    "workOrders:read", "workOrders:write",
  ],
  user: [
    "leads:read",
    "contacts:read",
    "accounts:read",
    "quotes:read",
    "workOrders:read",
    "invoices:read",
  ],
};

/**
 * Check if a user has a specific permission
 * @param userRole The user's role
 * @param permission The permission to check
 * @returns Boolean indicating if the user has the permission
 */
export function hasPermission(userRole: string | null, permission: string): boolean {
  if (!userRole) return false;
  
  // Admin has all permissions
  if (userRole === "admin") return true;
  
  // Check if the role has the specific permission
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Check if a user has a specific role or higher
 * @param userRole The user's role
 * @param requiredRole The minimum role required
 * @returns Boolean indicating if the user has the required role or higher
 */
export function hasRole(userRole: string | null, requiredRole: string): boolean {
  if (!userRole) return false;
  
  const userRoleLevel = roleHierarchy[userRole] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
  
  return userRoleLevel >= requiredRoleLevel;
}

/**
 * React hook to check if the current user has a specific permission
 * @param permission The permission to check
 * @returns Boolean indicating if the user has the permission
 */
export function useHasPermission(permission: string): boolean {
  const userRole = useUserRole();
  return hasPermission(userRole, permission);
}

/**
 * React hook to check if the current user has a specific role or higher
 * @param requiredRole The minimum role required
 * @returns Boolean indicating if the user has the required role or higher
 */
export function useHasRole(requiredRole: string): boolean {
  const userRole = useUserRole();
  return hasRole(userRole, requiredRole);
}
