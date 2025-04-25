"use node";
import { httpAction } from "./_generated/server";
import { v } from "convex/values";

// Webhook endpoint for Resend
export const handler = httpAction(async (ctx, request) => {
  // Only accept POST requests
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get the raw body
    const rawBody = await request.text();

    // Parse the body
    const body = JSON.parse(rawBody);

    // Log the webhook event for debugging
    console.log("Received Resend webhook:", body);

    // Process the webhook based on the event type
    await processWebhook(ctx, body);

    // Return a success response
    return new Response("Webhook received", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
});

// Process the webhook based on the event type
async function processWebhook(ctx: any, webhook: any) {
  const { type, data } = webhook;

  console.log(`Processing webhook event type: ${type}`);
  console.log(`Event data:`, data);

  // Make sure we have the email ID
  if (!data || !data.email_id) {
    console.log("No email ID found in webhook data");
    return;
  }

  // Run a mutation to update our database based on the event type
  await ctx.runMutation(async ({ db }) => {
    // Find the email history record based on the email ID
    const emailHistories = await db
      .query("emailHistory")
      .withIndex("by_emailId", (q) => q.eq("emailId", data.email_id))
      .collect();

    if (emailHistories.length === 0) {
      console.log(`No email history found for email ID: ${data.email_id}`);
      return;
    }

    const emailHistory = emailHistories[0];
    console.log(`Found email history record: ${emailHistory._id}`);

    // Update the email history based on the event type
    switch (type) {
      case "email.sent":
        // Email was sent successfully
        console.log(`Updating email history to 'sent' status`);
        await db.patch(emailHistory._id, {
          status: "sent",
          lastUpdated: Date.now(),
        });
        break;

      case "email.delivered":
        // Email was delivered to the recipient's mail server
        console.log(`Updating email history to 'delivered' status`);
        await db.patch(emailHistory._id, {
          status: "delivered",
          deliveredAt: Date.now(),
          lastUpdated: Date.now(),
        });
        break;

      case "email.opened":
        // Email was opened by the recipient
        console.log(`Updating email history to 'opened' status`);
        await db.patch(emailHistory._id, {
          status: "opened",
          openedAt: Date.now(),
          lastUpdated: Date.now(),
        });
        break;

      case "email.clicked":
        // A link in the email was clicked
        console.log(`Updating email history to 'clicked' status`);
        await db.patch(emailHistory._id, {
          status: "clicked",
          clickedAt: Date.now(),
          lastUpdated: Date.now(),
        });
        break;

      case "email.bounced":
        // Email bounced (couldn't be delivered)
        console.log(`Updating email history to 'bounced' status`);
        await db.patch(emailHistory._id, {
          status: "bounced",
          bouncedAt: Date.now(),
          lastUpdated: Date.now(),
          errorMessage: data.reason || "Email bounced",
        });
        break;

      case "email.complained":
        // Recipient marked the email as spam
        console.log(`Updating email history to 'complained' status`);
        await db.patch(emailHistory._id, {
          status: "complained",
          complainedAt: Date.now(),
          lastUpdated: Date.now(),
        });
        break;

      case "email.delivery_delayed":
        // Email delivery was delayed
        console.log(`Updating email history to 'delayed' status`);
        await db.patch(emailHistory._id, {
          status: "delayed",
          delayedAt: Date.now(),
          lastUpdated: Date.now(),
        });
        break;

      default:
        console.log(`Unhandled webhook event type: ${type}`);
    }
  });
}
