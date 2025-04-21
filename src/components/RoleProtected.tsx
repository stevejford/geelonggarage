import { ReactNode } from "react";
import { useUserRole } from "../hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { hasRole } from "@/lib/rbac";

type Props = {
  children: ReactNode;
  allowedRoles: Array<"admin" | "manager" | "technician" | "user">;
  redirectTo?: string;
};

/**
 * Component that protects routes based on user roles
 * @param children Content to render if user has the required role
 * @param allowedRoles Array of roles that are allowed to access the route
 * @param redirectTo Path to redirect to if user doesn't have the required role (defaults to /dashboard)
 */
export default function RoleProtected({
  children,
  allowedRoles,
  redirectTo = "/dashboard"
}: Props) {
  const role = useUserRole();

  // If user is not authenticated or role is not set
  if (!role) {
    return <Navigate to="/sign-in" replace />;
  }

  // Check if user has any of the allowed roles
  const hasAccess = allowedRoles.some(allowedRole => hasRole(role, allowedRole));

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
