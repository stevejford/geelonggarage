import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
});

/**
 * Get the currently logged in user
 */
export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

/**
 * Get the currently logged in user with their role
 */
export const loggedInUserWithRole = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get user
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    // Get user role
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    return {
      ...user,
      role: userRole?.role || "user",
    };
  },
});

/**
 * Get the authenticated user with role (utility function for internal use)
 */
export async function getAuthUserWithRole(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  // Get user
  const user = await ctx.db.get(userId);
  if (!user) return null;

  // Get user role
  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  return {
    ...user,
    role: userRole?.role || "user"
  };
}

/**
 * Check if the authenticated user has admin role
 */
export async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const user = await getAuthUserWithRole(ctx);
  return user?.role === "admin";
}

/**
 * Require admin role or throw an error
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getAuthUserWithRole(ctx);

  if (!user || user.role !== "admin") {
    throw new ConvexError("Only admins can perform this action");
  }

  return user;
}

/**
 * Check if the current user has a specific permission
 */
export const hasPermission = query({
  args: {
    permission: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    // Get user role
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const role = userRole?.role || "user";

    // Admin has all permissions
    if (role === "admin") {
      return true;
    }

    // Get role permissions
    const roleData = await ctx.db
      .query("roles")
      .filter(q => q.eq(q.field("name"), role))
      .first();

    if (!roleData) {
      return false;
    }

    // Check if role has the permission
    return roleData.permissions.includes(args.permission) || roleData.permissions.includes("*");
  },
});

/**
 * Check if the current user has a specific role or higher
 */
export const hasRole = query({
  args: {
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    // Get user role
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const role = userRole?.role || "user";

    // Define role hierarchy
    const roleHierarchy: Record<string, number> = {
      admin: 100,
      manager: 75,
      technician: 50,
      user: 25,
    };

    const userRoleLevel = roleHierarchy[role] || 0;
    const requiredRoleLevel = roleHierarchy[args.role] || 0;

    return userRoleLevel >= requiredRoleLevel;
  },
});
