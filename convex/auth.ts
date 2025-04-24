import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { UserIdentity } from "convex/server";

/**
 * Get the authenticated user ID from Clerk
 */
async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return identity.tokenIdentifier;
}

/**
 * Get the currently logged in user
 */
export const loggedInUser = query({
  handler: async (ctx) => {
    const clerkId = await getAuthUserId(ctx);
    if (!clerkId) {
      return null;
    }

    // Find user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

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
    const clerkId = await getAuthUserId(ctx);
    if (!clerkId) {
      return null;
    }

    // Get user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      return null;
    }

    // Get user role
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
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
  const clerkId = await getAuthUserId(ctx);
  if (!clerkId) return null;

  // Get user by clerkId
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .first();

  if (!user) return null;

  // Get user role
  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_userId", (q) => q.eq("userId", clerkId))
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
