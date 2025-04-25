import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { DatabaseWriter } from "./_generated/server";

const http = httpRouter();

// Simple HTTP route for testing
http.route({
  path: "/hello",
  method: "GET",
  handler: httpAction(async ({}, request) => {
    return new Response("Hello from Convex!", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }),
});

// Webhook endpoint for Resend
http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Get the signature from the headers
      const signature = request.headers.get("Resend-Signature");
      if (!signature) {
        console.log("No signature provided in webhook request");
        // We'll still process the webhook even without a signature
      } else {
        console.log("Received webhook with signature:", signature);
      }

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
  }),
});

// Note: We're not verifying the webhook signature in this implementation
// because we can't use the Node.js crypto module in the http.ts file.
// In a production environment, you would want to implement signature verification
// using a different approach or in a separate function file with the "use node" directive.

// Process the webhook based on the event type
async function processWebhook(ctx: any, webhook: { type: string; data: any }) {
  const { type, data } = webhook;

  console.log(`Processing webhook event type: ${type}`);
  console.log(`Event data:`, data);

  // Make sure we have the email ID
  if (!data || !data.email_id) {
    console.log("No email ID found in webhook data");
    return;
  }

  // Run a mutation to update our database based on the event type
  await ctx.runMutation(async ({ db }: { db: DatabaseWriter }) => {
    // Find the email history record based on the email ID
    const emailHistories = await db
      .query("emailHistory")
      .withIndex("by_emailId", (q: any) => q.eq("emailId", data.email_id))
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

export default http;
