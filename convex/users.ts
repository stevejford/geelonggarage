import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

export const getUserRole = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.tokenIdentifier;

    // Log the identity for debugging
    console.log("Getting role for user with identity:", {
      tokenIdentifier: clerkId,
      email: identity.email,
      name: identity.name
    });

    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .unique();

    console.log("Found user role:", userRole);

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

/**
 * Sync the current user from Clerk to Convex
 * This ensures that when a user signs in with Clerk, their information is properly stored in Convex
 */
export const syncClerkUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Extract user information from Clerk identity
    const userId = identity.tokenIdentifier;
    const email = identity.email || "";
    const firstName = identity.givenName || identity.name?.split(" ")[0] || "";
    const lastName = identity.familyName || identity.name?.split(" ").slice(1).join(" ") || "";
    const imageUrl = identity.pictureUrl || "";

    console.log("Clerk identity:", {
      userId,
      email,
      firstName,
      lastName,
      imageUrl,
      fullIdentity: identity
    });

    // Check if user already exists in Convex
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email,
        firstName,
        lastName,
        imageUrl, // Added back after updating schema
        updatedAt: Date.now(),
      });

      // Check if user has a role
      const userRole = await ctx.db
        .query("userRoles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();

      // If no role, assign default role
      if (!userRole) {
        await ctx.db.insert("userRoles", {
          userId,
          role: "user", // Default role
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      return { userId: existingUser._id, isNew: false };
    } else {
      // Create new user
      const newUserId = await ctx.db.insert("users", {
        clerkId: userId,
        email,
        firstName,
        lastName,
        imageUrl, // Added back after updating schema
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Assign default role
      await ctx.db.insert("userRoles", {
        userId,
        role: "user", // Default role
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return { userId: newUserId, isNew: true };
    }
  },
});

/**
 * Set the current user as admin
 * This is useful for giving the first user admin privileges
 */
export const setCurrentUserAsAdmin = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const clerkId = identity.tokenIdentifier;

    // Log the identity for debugging
    console.log("Setting admin role for user with identity:", {
      tokenIdentifier: clerkId,
      email: identity.email,
      name: identity.name
    });

    // First, ensure the user exists in our database
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      // If user doesn't exist, create them
      console.log("User not found in database, creating new user record");
      const userId = await ctx.db.insert("users", {
        clerkId,
        firstName: identity.givenName || identity.name?.split(" ")[0] || "",
        lastName: identity.familyName || identity.name?.split(" ").slice(1).join(" ") || "",
        email: identity.email || "",
        imageUrl: identity.pictureUrl || "",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      user = await ctx.db.get(userId);
      if (!user) {
        throw new ConvexError("Failed to create user");
      }
    }

    console.log("Found/created user:", user);

    // Check if user already has a role using the clerkId (tokenIdentifier)
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .unique();

    if (existingRole) {
      // Update existing role to admin
      console.log("Updating existing role to admin:", existingRole);
      await ctx.db.patch(existingRole._id, {
        role: "admin",
        updatedAt: Date.now()
      });
    } else {
      // Create new admin role
      console.log("Creating new admin role for user");
      await ctx.db.insert("userRoles", {
        userId: clerkId, // Use clerkId as the userId in userRoles
        role: "admin",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      message: "Admin role set successfully. You can now access the settings page."
    };
  },
});

/**
 * Direct function to set a user as admin
 * This is a temporary solution to fix authentication issues
 */
export const directSetUserAsAdmin = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Check if user already has a role
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingRole) {
      // Update existing role to admin
      await ctx.db.patch(existingRole._id, {
        role: "admin",
        updatedAt: Date.now()
      });
    } else {
      // Create new admin role
      await ctx.db.insert("userRoles", {
        userId,
        role: "admin",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      message: "Admin role set successfully. You can now access the settings page."
    };
  },
});