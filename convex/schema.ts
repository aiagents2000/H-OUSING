import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    fullName: v.string(),
    role: v.union(v.literal("student"), v.literal("staff")),
    photoUrl: v.optional(v.string()),
    roomNumber: v.optional(v.string()),
    building: v.optional(v.union(v.literal("A"), v.literal("B"))),
    courseOfStudy: v.optional(v.string()),
    studentId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  rooms: defineTable({
    roomNumber: v.string(),
    building: v.union(v.literal("A"), v.literal("B")),
    occupants: v.array(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_room_number", ["roomNumber"])
    .index("by_building", ["building"])
    .index("by_room_and_building", ["roomNumber", "building"]),

  maintenanceRequests: defineTable({
    studentId: v.id("users"),
    roomNumber: v.string(),
    building: v.union(v.literal("A"), v.literal("B")),
    category: v.union(
      v.literal("plumbing"),
      v.literal("electrical"),
      v.literal("cleaning"),
      v.literal("boiler"),
      v.literal("other")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    description: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("rejected")
    ),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_student", ["studentId"])
    .index("by_status", ["status"])
    .index("by_room", ["roomNumber"])
    .index("by_building", ["building"])
    .index("by_created", ["createdAt"])
    .index("by_status_and_building", ["status", "building"]),

  announcements: defineTable({
    authorId: v.id("users"),
    title: v.string(),
    message: v.string(),
    priority: v.union(v.literal("normal"), v.literal("important")),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"]),

  notifications: defineTable({
    userId: v.id("users"),
    requestId: v.id("maintenanceRequests"),
    type: v.union(v.literal("status_change"), v.literal("new_request")),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"]),
});
