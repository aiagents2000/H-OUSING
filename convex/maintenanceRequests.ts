import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createRequest = mutation({
  args: {
    category: v.union(
      v.literal("plumbing"),
      v.literal("electrical"),
      v.literal("cleaning"),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");
    if (!user.roomNumber || !user.building) {
      throw new Error("User has no room assigned");
    }

    const now = Date.now();
    const requestId = await ctx.db.insert("maintenanceRequests", {
      studentId: user._id,
      roomNumber: user.roomNumber,
      building: user.building as "A" | "B",
      category: args.category,
      priority: args.priority,
      description: args.description,
      photoStorageId: args.photoStorageId,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    // Notify all staff about new request
    const staffUsers = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "staff"))
      .collect();

    for (const staff of staffUsers) {
      await ctx.db.insert("notifications", {
        userId: staff._id,
        requestId,
        type: "new_request",
        message: `New ${args.priority} ${args.category} request from Room ${user.roomNumber}${user.building}`,
        read: false,
        createdAt: now,
      });
    }

    return requestId;
  },
});

export const getRequestsByStudent = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("open"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("rejected")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    let requests = await ctx.db
      .query("maintenanceRequests")
      .withIndex("by_student", (q) => q.eq("studentId", user._id))
      .order("desc")
      .collect();

    if (args.status) {
      requests = requests.filter((r) => r.status === args.status);
    }

    return requests;
  },
});

export const getAllRequests = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("open"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("rejected")
      )
    ),
    category: v.optional(
      v.union(
        v.literal("plumbing"),
        v.literal("electrical"),
        v.literal("cleaning"),
        v.literal("other")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    building: v.optional(v.union(v.literal("A"), v.literal("B"))),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let requests = await ctx.db
      .query("maintenanceRequests")
      .order("desc")
      .collect();

    if (args.status) {
      requests = requests.filter((r) => r.status === args.status);
    }
    if (args.category) {
      requests = requests.filter((r) => r.category === args.category);
    }
    if (args.priority) {
      requests = requests.filter((r) => r.priority === args.priority);
    }
    if (args.building) {
      requests = requests.filter((r) => r.building === args.building);
    }

    // Enrich with student info
    const enriched = await Promise.all(
      requests.map(async (request) => {
        const student = await ctx.db.get(request.studentId);
        return {
          ...request,
          studentName: student?.fullName ?? "Unknown",
          studentEmail: student?.email ?? "",
        };
      })
    );

    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      return enriched.filter(
        (r) =>
          r.studentName.toLowerCase().includes(query) ||
          r.roomNumber.includes(query) ||
          r.description.toLowerCase().includes(query)
      );
    }

    return enriched;
  },
});

export const getRequestById = query({
  args: { requestId: v.id("maintenanceRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return null;

    const student = await ctx.db.get(request.studentId);

    return {
      ...request,
      studentName: student?.fullName ?? "Unknown",
      studentEmail: student?.email ?? "",
      studentPhone: "",
    };
  },
});

export const updateRequestStatus = mutation({
  args: {
    requestId: v.id("maintenanceRequests"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("rejected")
    ),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    const now = Date.now();
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: now,
    };

    if (args.status === "completed") {
      updates.completedAt = now;
    }
    if (args.status === "rejected" && args.rejectionReason) {
      updates.rejectionReason = args.rejectionReason;
    }

    await ctx.db.patch(args.requestId, updates);

    // Notify the student
    const statusLabels: Record<string, string> = {
      open: "reopened",
      in_progress: "being worked on",
      completed: "completed",
      rejected: "rejected",
    };

    await ctx.db.insert("notifications", {
      userId: request.studentId,
      requestId: args.requestId,
      type: "status_change",
      message: `Your ${request.category} request is now ${statusLabels[args.status]}`,
      read: false,
      createdAt: now,
    });
  },
});

export const getRequestStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    if (user.role === "student") {
      const allRequests = await ctx.db
        .query("maintenanceRequests")
        .withIndex("by_student", (q) => q.eq("studentId", user._id))
        .collect();

      return {
        total: allRequests.length,
        active: allRequests.filter(
          (r) => r.status === "open" || r.status === "in_progress"
        ).length,
        completed: allRequests.filter((r) => r.status === "completed").length,
      };
    }

    // Staff stats
    const allRequests = await ctx.db
      .query("maintenanceRequests")
      .collect();

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const completedRequests = allRequests.filter(
      (r) => r.status === "completed" && r.completedAt
    );
    const completedThisWeek = completedRequests.filter(
      (r) => r.completedAt! > weekAgo
    );

    let avgResolutionTime = 0;
    if (completedRequests.length > 0) {
      const totalTime = completedRequests.reduce(
        (sum, r) => sum + (r.completedAt! - r.createdAt),
        0
      );
      avgResolutionTime = totalTime / completedRequests.length;
    }

    return {
      total: allRequests.length,
      open: allRequests.filter((r) => r.status === "open").length,
      inProgress: allRequests.filter((r) => r.status === "in_progress").length,
      completedThisWeek: completedThisWeek.length,
      avgResolutionTimeMs: avgResolutionTime,
    };
  },
});

export const getAnalyticsData = query({
  args: {
    building: v.optional(v.union(v.literal("A"), v.literal("B"))),
    category: v.optional(
      v.union(
        v.literal("plumbing"),
        v.literal("electrical"),
        v.literal("cleaning"),
        v.literal("other")
      )
    ),
  },
  handler: async (ctx, args) => {
    let requests = await ctx.db
      .query("maintenanceRequests")
      .collect();

    if (args.building) {
      requests = requests.filter((r) => r.building === args.building);
    }
    if (args.category) {
      requests = requests.filter((r) => r.category === args.category);
    }

    // By status
    const byStatus = {
      open: requests.filter((r) => r.status === "open").length,
      in_progress: requests.filter((r) => r.status === "in_progress").length,
      completed: requests.filter((r) => r.status === "completed").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    };

    // By category
    const byCategory = {
      plumbing: requests.filter((r) => r.category === "plumbing").length,
      electrical: requests.filter((r) => r.category === "electrical").length,
      cleaning: requests.filter((r) => r.category === "cleaning").length,
      other: requests.filter((r) => r.category === "other").length,
    };

    // By building
    const byBuilding = {
      A: requests.filter((r) => r.building === "A").length,
      B: requests.filter((r) => r.building === "B").length,
    };

    // By priority
    const byPriority = {
      low: requests.filter((r) => r.priority === "low").length,
      medium: requests.filter((r) => r.priority === "medium").length,
      high: requests.filter((r) => r.priority === "high").length,
      urgent: requests.filter((r) => r.priority === "urgent").length,
    };

    // Last 30 days trend
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const recentRequests = requests.filter((r) => r.createdAt > thirtyDaysAgo);

    const dailyCounts: Record<string, number> = {};
    for (const r of recentRequests) {
      const date = new Date(r.createdAt).toISOString().split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    }

    const trend = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Avg resolution time
    const completed = requests.filter(
      (r) => r.status === "completed" && r.completedAt
    );
    const avgResolutionMs =
      completed.length > 0
        ? completed.reduce((s, r) => s + (r.completedAt! - r.createdAt), 0) /
          completed.length
        : 0;

    return {
      byStatus,
      byCategory,
      byBuilding,
      byPriority,
      trend,
      avgResolutionMs,
      total: requests.length,
    };
  },
});

export const getRequestsByRoom = query({
  args: {
    roomNumber: v.string(),
    building: v.union(v.literal("A"), v.literal("B")),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("maintenanceRequests")
      .withIndex("by_room", (q) => q.eq("roomNumber", args.roomNumber))
      .order("desc")
      .collect();

    return requests.filter((r) => r.building === args.building);
  },
});
