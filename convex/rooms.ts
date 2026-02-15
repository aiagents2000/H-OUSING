import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const seedRooms = mutation({
  args: {},
  handler: async (ctx) => {
    const existingRooms = await ctx.db.query("rooms").take(1);
    if (existingRooms.length > 0) {
      return { message: "Rooms already seeded" };
    }

    const buildings = ["A", "B"] as const;
    for (const building of buildings) {
      for (let i = 1; i <= 40; i++) {
        await ctx.db.insert("rooms", {
          roomNumber: String(i),
          building,
          occupants: [],
          createdAt: Date.now(),
        });
      }
    }
    return { message: "80 rooms seeded successfully" };
  },
});

export const getRoomByNumberAndBuilding = query({
  args: {
    roomNumber: v.string(),
    building: v.union(v.literal("A"), v.literal("B")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_room_and_building", (q) =>
        q.eq("roomNumber", args.roomNumber).eq("building", args.building)
      )
      .unique();
  },
});

export const getRoommates = query({
  args: {
    roomNumber: v.string(),
    building: v.union(v.literal("A"), v.literal("B")),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_and_building", (q) =>
        q.eq("roomNumber", args.roomNumber).eq("building", args.building)
      )
      .unique();

    if (!room) return [];

    const occupants = await Promise.all(
      room.occupants.map((id) => ctx.db.get(id))
    );
    return occupants.filter(Boolean);
  },
});

export const addOccupant = mutation({
  args: {
    roomNumber: v.string(),
    building: v.union(v.literal("A"), v.literal("B")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_and_building", (q) =>
        q.eq("roomNumber", args.roomNumber).eq("building", args.building)
      )
      .unique();

    if (!room) {
      throw new Error("Room not found");
    }

    if (!room.occupants.includes(args.userId)) {
      await ctx.db.patch(room._id, {
        occupants: [...room.occupants, args.userId],
      });
    }
  },
});

export const removeOccupant = mutation({
  args: {
    roomNumber: v.string(),
    building: v.union(v.literal("A"), v.literal("B")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_and_building", (q) =>
        q.eq("roomNumber", args.roomNumber).eq("building", args.building)
      )
      .unique();

    if (!room) return;

    await ctx.db.patch(room._id, {
      occupants: room.occupants.filter((id) => id !== args.userId),
    });
  },
});
