import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Migration to update accounts with photoReferences to use photoCount and photoMetadata
export const migratePhotoReferences = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all accounts
    const accounts = await ctx.db.query("accounts").collect();

    // Track migration results
    const results = {
      total: accounts.length,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    // Process each account
    for (const account of accounts) {
      try {
        // Check if the account has photoReferences
        if ('photoReferences' in account) {
          // Cast to any to access the photoReferences field
          const accountAny = account as any;
          const photoReferences = Array.isArray(accountAny.photoReferences) ? accountAny.photoReferences : [];

          // Create photoMetadata from photoReferences
          const photoMetadata = photoReferences.map((photo: any, index: number) => ({
            width: photo.width || 0,
            height: photo.height || 0,
            attribution: photo.attribution || '',
            index: index,
          }));

          // First, add the new fields
          await ctx.db.patch(account._id, {
            photoCount: photoReferences.length,
            photoMetadata: photoMetadata,
          });

          // Then, use a separate call to remove the old field
          // We need to use the internal _removeField method
          // @ts-ignore - Using internal method
          await ctx.db.patch(account._id, { photoReferences: undefined });

          results.updated++;
        } else {
          results.skipped++;
        }
      } catch (error) {
        console.error(`Error migrating account ${account._id}:`, error);
        results.errors++;
      }
    }

    return results;
  },
});
