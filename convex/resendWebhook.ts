"use node";
import { httpAction } from "./_generated/server";
import { v } from "convex/values";
import crypto from "crypto";

// Resend webhook secret for verifying webhook signatures
// Get the webhook secret from environment variables
const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || "whsec_your_webhook_secret_here";

// Webhook endpoint for Resend
export const handler = httpAction(async (ctx, request) => {
  // Only accept POST requests
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get the signature from the headers
    const signature = request.headers.get("Resend-Signature");
    if (!signature) {
      return new Response("No signature provided", { status: 401 });
    }

    // Get the raw body
    const rawBody = await request.text();

    // Verify the signature
    if (!verifySignature(signature, rawBody)) {
      return new Response("Invalid signature", { status: 401 });
    }

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

// Verify the webhook signature
function verifySignature(signature: string, payload: string): boolean {
  try {
    // Extract timestamp and signatures from the header
    const [timestamp, signatures] = signature.split(",");
    const timestampValue = timestamp.split("=")[1];
    const signaturesValue = signatures.split("=")[1];

    // Create the signature
    const hmac = crypto.createHmac("sha256", RESEND_WEBHOOK_SECRET);
    const signedPayload = `${timestampValue}.${payload}`;
    const expectedSignature = hmac.update(signedPayload).digest("hex");

    // Compare the signatures
    return crypto.timingSafeEqual(
      Buffer.from(signaturesValue),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

// Process the webhook based on the event type
async function processWebhook(ctx: any, webhook: any) {
  const { type, data } = webhook;

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

    // Update the email history based on the event type
    switch (type) {
      case "email.sent":
        // Email was sent successfully
        await db.patch(emailHistory._id, {
          status: "sent",
          lastUpdated: Date.now(),
        });
        break;

      case "email.delivered":
        // Email was delivered to the recipient's mail server
        await db.patch(emailHistory._id, {
          status: "delivered",
          deliveredAt: Date.now(),
          lastUpdated: Date.now(),
        });
        break;

      case "email.opened":
        // Email was opened by the recipient
        await db.patch(emailHistory._id, {
          status: "opened",
          openedAt: Date.now(),
          lastUpdated: Date.now(),
        });
        break;

      case "email.clicked":
        // A link in the email was clicked
        await db.patch(emailHistory._id, {
          status: "clicked",
          clickedAt: Date.now(),
          lastUpdated: Date.now(),
        });
        break;

      case "email.bounced":
        // Email bounced (couldn't be delivered)
        await db.patch(emailHistory._id, {
          status: "bounced",
          bouncedAt: Date.now(),
          lastUpdated: Date.now(),
          errorMessage: data.reason || "Email bounced",
        });
        break;

      case "email.complained":
        // Recipient marked the email as spam
        await db.patch(emailHistory._id, {
          status: "complained",
          complainedAt: Date.now(),
          lastUpdated: Date.now(),
        });
        break;

      case "email.delivery_delayed":
        // Email delivery was delayed
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
