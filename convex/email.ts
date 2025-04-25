"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from 'resend';

const resend = new Resend('re_RchKUyzV_Fyhkb89U61ePe746UTAVrzua');

export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const data = await resend.emails.send({
        from: 'Geelong Garage <admin@geelonggaragedoors.com.au>',
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
