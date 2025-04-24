import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get all chat groups for a user
export const getUserGroups = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Get all groups the user is a member of
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (memberships.length === 0) {
      return [];
    }

    // Get the group details
    const groupIds = memberships.map((m) => m.groupId);
    const groups = await Promise.all(
      groupIds.map(async (groupId) => {
        const group = await ctx.db.get(groupId);
        if (!group) return null;

        // Count members
        const members = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (q) => q.eq("groupId", groupId))
          .collect();
        const memberCount = members.length;

        // Count unread messages
        const lastRead = await ctx.db
          .query("lastReadMessages")
          .withIndex("by_user_group", (q) =>
            q.eq("userId", userId).eq("groupId", groupId)
          )
          .first();

        const lastReadTimestamp = lastRead?.lastReadTimestamp || 0;

        const unreadMessages = await ctx.db
          .query("chatMessages")
          .withIndex("by_group", (q) =>
            q.eq("groupId", groupId).gt("timestamp", lastReadTimestamp)
          )
          .filter((q) => q.neq(q.field("senderId"), userId))
          .collect();
        const unreadCount = unreadMessages.length;

        return {
          ...group,
          memberCount,
          unreadCount,
        };
      })
    );

    // Filter out null values and sort by updated time
    return groups
      .filter(Boolean)
      .sort((a, b) => b!.updatedAt - a!.updatedAt);
  },
});

// Get direct message conversations for a user
export const getDirectMessages = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Get all messages where the user is either sender or receiver
    const sentMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_direct_message")
      .filter((q) => q.eq(q.field("senderId"), userId))
      .collect();

    const receivedMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_receiver")
      .filter((q) => q.eq(q.field("receiverId"), userId))
      .collect();

    // Combine and get unique conversation partners
    const allMessages = [...sentMessages, ...receivedMessages];
    const conversationPartners = new Set();

    allMessages.forEach((msg) => {
      if (msg.senderId === userId && msg.receiverId) {
        conversationPartners.add(msg.receiverId);
      } else if (msg.receiverId === userId && msg.senderId) {
        conversationPartners.add(msg.senderId);
      }
    });

    // Get details for each conversation partner
    const conversations = await Promise.all(
      Array.from(conversationPartners).map(async (partnerId) => {
        // Get user status
        const status = await ctx.db
          .query("userChatStatus")
          .withIndex("by_userId")
          .filter((q) => q.eq(q.field("userId"), partnerId as string))
          .first();

        // Get last read timestamp
        const lastRead = await ctx.db
          .query("lastReadMessages")
          .withIndex("by_user_direct")
          .filter((q) =>
            q.and(
              q.eq(q.field("userId"), userId),
              q.eq(q.field("otherUserId"), partnerId as string)
            )
          )
          .first();

        const lastReadTimestamp = lastRead?.lastReadTimestamp || 0;

        // Count unread messages
        const unreadMessages = await ctx.db
          .query("chatMessages")
          .filter((q) =>
            q.and(
              q.eq(q.field("senderId"), partnerId as string),
              q.eq(q.field("receiverId"), userId),
              q.gt(q.field("timestamp"), lastReadTimestamp)
            )
          )
          .collect();
        const unreadCount = unreadMessages.length;

        // Get the most recent message for preview
        const recentMessages = await ctx.db
          .query("chatMessages")
          .filter((q) =>
            q.or(
              q.and(
                q.eq(q.field("senderId"), userId),
                q.eq(q.field("receiverId"), partnerId as string)
              ),
              q.and(
                q.eq(q.field("senderId"), partnerId as string),
                q.eq(q.field("receiverId"), userId)
              )
            )
          )
          .order("desc")
          .take(1);

        const latestMessage = recentMessages[0];

        // For a real app, you would get the user details from your user table
        // This is a simplified version
        return {
          userId: partnerId as string,
          name: latestMessage?.senderName || "Unknown User",
          avatar: latestMessage?.senderAvatar || "",
          online: status?.isOnline || false,
          lastSeen: status?.lastSeen || 0,
          unreadCount,
          latestMessage: latestMessage ? {
            content: latestMessage.content,
            timestamp: latestMessage.timestamp,
          } : null,
        };
      })
    );

    // Sort by latest message time
    return conversations.sort((a, b) => {
      if (!a.latestMessage) return 1;
      if (!b.latestMessage) return -1;
      return b.latestMessage.timestamp - a.latestMessage.timestamp;
    });
  },
});

// Get messages for a group
export const getGroupMessages = query({
  args: {
    groupId: v.id("chatGroups"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { groupId, limit = 50 } = args;

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .order("desc")
      .take(limit);

    // Return in chronological order (oldest first)
    return messages.reverse();
  },
});

// Get direct messages between two users
export const getDirectMessageHistory = query({
  args: {
    userId: v.string(),
    otherUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, otherUserId, limit = 50 } = args;

    const sentMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_direct_message")
      .filter((q) =>
        q.and(
          q.eq(q.field("senderId"), userId),
          q.eq(q.field("receiverId"), otherUserId)
        )
      )
      .collect();

    const receivedMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_receiver")
      .filter((q) =>
        q.and(
          q.eq(q.field("receiverId"), userId),
          q.eq(q.field("senderId"), otherUserId)
        )
      )
      .collect();

    // Combine, sort by timestamp, and limit
    const allMessages = [...sentMessages, ...receivedMessages]
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);

    return allMessages;
  },
});

// Send a message to a group
export const sendGroupMessage = mutation({
  args: {
    groupId: v.id("chatGroups"),
    senderId: v.string(),
    senderName: v.string(),
    senderAvatar: v.optional(v.string()),
    content: v.string(),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { groupId, senderId, senderName, senderAvatar, content, attachments } = args;

    // Verify the user is a member of the group
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", groupId).eq("userId", senderId)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this group");
    }

    // Create the message
    const messageId = await ctx.db.insert("chatMessages", {
      groupId,
      senderId,
      senderName,
      senderAvatar,
      content,
      attachments,
      isRead: false,
      timestamp: Date.now(),
    });

    // Update the group's last updated time
    await ctx.db.patch(groupId, {
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

// Send a direct message
export const sendDirectMessage = mutation({
  args: {
    senderId: v.string(),
    senderName: v.string(),
    senderAvatar: v.optional(v.string()),
    receiverId: v.string(),
    content: v.string(),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { senderId, senderName, senderAvatar, receiverId, content, attachments } = args;

    // Create the message
    const messageId = await ctx.db.insert("chatMessages", {
      senderId,
      receiverId,
      senderName,
      senderAvatar,
      content,
      attachments,
      isRead: false,
      timestamp: Date.now(),
    });

    return messageId;
  },
});

// Create a new chat group
export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(),
    isPrivate: v.boolean(),
    initialMembers: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { name, description, createdBy, isPrivate, initialMembers } = args;

    // Create the group
    const now = Date.now();
    const groupId = await ctx.db.insert("chatGroups", {
      name,
      description,
      createdBy,
      isPrivate,
      createdAt: now,
      updatedAt: now,
    });

    // Add the creator as admin
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: createdBy,
      role: "admin",
      joinedAt: now,
    });

    // Add initial members
    for (const memberId of initialMembers) {
      if (memberId !== createdBy) {
        await ctx.db.insert("groupMembers", {
          groupId,
          userId: memberId,
          role: "member",
          joinedAt: now,
        });
      }
    }

    return groupId;
  },
});

// Add a member to a group
export const addGroupMember = mutation({
  args: {
    groupId: v.id("chatGroups"),
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
    addedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const { groupId, userId, role, addedBy } = args;

    // Check if the group exists
    const group = await ctx.db.get(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Check if the user adding has admin rights
    const adminMember = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", groupId).eq("userId", addedBy)
      )
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first();

    if (!adminMember) {
      throw new Error("Only admins can add members");
    }

    // Check if the user is already a member
    const existingMember = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", groupId).eq("userId", userId)
      )
      .first();

    if (existingMember) {
      // If already a member, update their role if needed
      if (existingMember.role !== role) {
        await ctx.db.patch(existingMember._id, { role });
      }
      return existingMember._id;
    }

    // Add the new member
    const memberId = await ctx.db.insert("groupMembers", {
      groupId,
      userId,
      role,
      joinedAt: Date.now(),
    });

    return memberId;
  },
});

// Mark messages as read
export const markMessagesAsRead = mutation({
  args: {
    userId: v.string(),
    groupId: v.optional(v.id("chatGroups")),
    otherUserId: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, groupId, otherUserId, timestamp } = args;

    if (groupId) {
      // Update or create last read record for group
      const existing = await ctx.db
        .query("lastReadMessages")
        .withIndex("by_user_group", (q) =>
          q.eq("userId", userId).eq("groupId", groupId)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          lastReadTimestamp: timestamp,
        });
      } else {
        await ctx.db.insert("lastReadMessages", {
          userId,
          groupId,
          lastReadTimestamp: timestamp,
        });
      }
    } else if (otherUserId) {
      // Update or create last read record for direct message
      const existing = await ctx.db
        .query("lastReadMessages")
        .withIndex("by_user_direct", (q) =>
          q.eq("userId", userId).eq("otherUserId", otherUserId)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          lastReadTimestamp: timestamp,
        });
      } else {
        await ctx.db.insert("lastReadMessages", {
          userId,
          otherUserId,
          lastReadTimestamp: timestamp,
        });
      }
    }

    return true;
  },
});

// Update user online status
export const updateUserStatus = mutation({
  args: {
    userId: v.string(),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId, isOnline } = args;

    const existing = await ctx.db
      .query("userChatStatus")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isOnline,
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert("userChatStatus", {
        userId,
        isOnline,
        lastSeen: Date.now(),
      });
    }

    return true;
  },
});
