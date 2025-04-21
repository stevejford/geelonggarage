"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from 'resend';

const resend = new Resend('re_GbzVtNkN_PxAEhxPGks2mYtGYSF77p7Se');

export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const data = await resend.emails.send({
        from: 'onboarding@resend.dev', // Update this with your verified domain
        to: args.to,
        subject: args.subject,
        html: args.html,
      });
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  },
});
