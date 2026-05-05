"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatInterface } from "@/components/student/chat-interface";
import { CardSkeleton } from "@/components/shared/loading-states";
import type { RequestCategory, RequestPriority, RequestStatus } from "@/lib/chat-types";

export default function ChatPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const requests = useQuery(api.maintenanceRequests.getRequestsByStudent, {});

  if (!currentUser || requests === undefined) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const activeRequests = requests
    .filter((r) => r.status === "open" || r.status === "in_progress")
    .map((r) => ({
      _id: r._id as string,
      category: r.category as RequestCategory,
      priority: r.priority as RequestPriority,
      status: r.status as RequestStatus,
      description: r.description,
      createdAt: r.createdAt,
    }));

  return (
    <ChatInterface
      currentUser={{
        fullName: currentUser.fullName ?? "Student",
        roomNumber: currentUser.roomNumber ?? null,
        building: currentUser.building ?? null,
      }}
      activeRequests={activeRequests}
    />
  );
}
