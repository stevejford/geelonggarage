import { ReactNode } from "react";
import { useHasPermission, useHasRole } from "@/lib/rbac";
import AccessDenied from "./AccessDenied";

type PermissionGuardProps = {
  children: ReactNode;
  permission?: string;
  role?: string;
  fallback?: ReactNode;
  message?: string;
};

/**
 * Component that conditionally renders children based on user permissions or role
 * @param children Content to render if user has permission
 * @param permission Permission required to view content
 * @param role Role required to view content
 * @param fallback Optional content to render if user lacks permission (defaults to AccessDenied)
 * @param message Optional custom message to display in the AccessDenied component
 */
export default function PermissionGuard({
  children,
  permission,
  role,
  fallback,
  message
}: PermissionGuardProps) {
  // Check permission if specified
  const hasRequiredPermission = permission
    ? useHasPermission(permission)
    : true;

  // Check role if specified
  const hasRequiredRole = role
    ? useHasRole(role)
    : true;

  // User needs to satisfy both conditions if both are specified
  const hasAccess = hasRequiredPermission && hasRequiredRole;

  if (!hasAccess) {
    // Return fallback or AccessDenied component
    return fallback ? (
      <>{fallback}</>
    ) : (
      <AccessDenied message={
        message || (
          permission
            ? `You don't have the required permission: ${permission}`
            : `You need ${role} role or higher to access this content`
        )
      } />
    );
  }

  return <>{children}</>;
}
