import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    priority: v.union(v.literal("normal"), v.literal("important")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "staff") {
      throw new Error("Only staff can create announcements");
    }

    return await ctx.db.insert("announcements", {
      authorId: user._id,
      title: args.title,
      message: args.message,
      priority: args.priority,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_created")
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      announcements.map(async (a) => {
        const author = await ctx.db.get(a.authorId);
        return {
          ...a,
          authorName: author?.fullName ?? "Staff",
        };
      })
    );

    return enriched;
  },
});

export const remove = mutation({
  args: {
    announcementId: v.id("announcements"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "staff") {
      throw new Error("Only staff can delete announcements");
    }

    await ctx.db.delete(args.announcementId);
  },
});
