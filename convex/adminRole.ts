import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Sets the current user's role to admin in the Convex database
 * This is a utility function to help with setting up admin access
 */
export const setCurrentUserAsAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user already has a role
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingRole) {
      // Update existing role to admin
      await ctx.db.patch(existingRole._id, { role: "admin" });
    } else {
      // Create new admin role
      await ctx.db.insert("userRoles", {
        userId,
        role: "admin",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true, message: "You are now an admin in Convex" };
  },
});
