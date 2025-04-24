import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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

export default http;
