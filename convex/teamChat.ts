import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get recent team chat messages
export const getMessages = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50; // Default to 50 messages

    // Get messages that don't have a specific group or receiver (general team chat)
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_timestamp")
      .filter(q =>
        q.and(
          q.eq(q.field("groupId"), undefined),
          q.eq(q.field("receiverId"), undefined)
        )
      )
      .order("desc")
      .take(limit);

    // Return in chronological order (oldest first)
    return messages.reverse();
  },
});

// Send a new team chat message
export const sendMessage = mutation({
  args: {
    senderId: v.string(),
    senderName: v.string(),
    senderAvatar: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { senderId, senderName, senderAvatar, content } = args;

    // Create the message in the general team chat (no specific group or receiver)
    const messageId = await ctx.db.insert("chatMessages", {
      senderId,
      senderName,
      senderAvatar,
      content,
      isRead: false,
      timestamp: Date.now(),
    });

    return messageId;
  },
});
