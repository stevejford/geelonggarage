import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Webhook endpoint for WordPress inquiries
http.route({
  path: "/wordpress-inquiry",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Parse the request body
      const body = await request.json();
      
      // Validate required fields
      if (!body.name) {
        return new Response(
          JSON.stringify({ error: "Name is required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      // Create a lead from the inquiry
      const leadId = await ctx.runMutation(internal.leads.createLeadFromInquiry, {
        name: body.name,
        email: body.email,
        phone: body.phone,
        message: body.message,
        source: "WordPress",
      });
      
      // Return success response
      return new Response(
        JSON.stringify({ success: true, leadId }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error processing WordPress inquiry:", error);
      
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

export default http;
