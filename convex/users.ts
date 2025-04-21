import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserRole = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    return userRole?.role ?? null;
  },
});

export const getUserRoleById = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Check if current user is admin
    const currentUserRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
      .unique();

    if (currentUserRole?.role !== "admin") {
      throw new Error("Only admins can view user roles");
    }

    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    return userRole?.role ?? null;
  },
});

export const setUserRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("technician"),
      v.literal("user")
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Check if current user is admin
    const currentUserRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
      .unique();

    if (currentUserRole?.role !== "admin") {
      throw new Error("Only admins can set user roles");
    }

    // Update or create role
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existingRole) {
      await ctx.db.patch(existingRole._id, { role: args.role });
    } else {
      await ctx.db.insert("userRoles", {
        userId: args.userId,
        role: args.role,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Check if current user is admin
    const currentUserRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
      .unique();

    if (currentUserRole?.role !== "admin") {
      throw new Error("Only admins can view all users");
    }

    // Get all users
    const users = await ctx.db.query("users").collect();

    // Get roles for all users
    const userRoles = await ctx.db.query("userRoles").collect();
    const roleMap = new Map();
    userRoles.forEach(userRole => {
      roleMap.set(userRole.userId, userRole.role);
    });

    // Combine user data with roles
    return users.map(user => ({
      ...user,
      role: roleMap.get(user._id.toString()) || "user",
    }));
  },
});

export const inviteUser = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("technician"),
      v.literal("user")
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Check if current user is admin
    const currentUserRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
      .unique();

    if (currentUserRole?.role !== "admin") {
      throw new Error("Only admins can invite users");
    }

    // Check if user with this email already exists
    const existingUser = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Set user role
    await ctx.db.insert("userRoles", {
      userId: userId.toString(),
      role: args.role,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // In a real implementation, you would send an invitation email here
    // using a service like Resend or SendGrid

    return { userId, success: true };
  },
});

export const removeUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Check if current user is admin
    const currentUserRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
      .unique();

    if (currentUserRole?.role !== "admin") {
      throw new Error("Only admins can remove users");
    }

    // Don't allow removing yourself
    if (args.userId === currentUserId) {
      throw new Error("You cannot remove yourself");
    }

    // Remove user role
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (userRole) {
      await ctx.db.delete(userRole._id);
    }

    // Remove user
    await ctx.db.delete(args.userId);

    return { success: true };
  },
});
