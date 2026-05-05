export type RequestCategory = "plumbing" | "electrical" | "cleaning" | "boiler" | "other";
export type RequestPriority = "low" | "medium" | "high" | "urgent";
export type RequestStatus = "open" | "in_progress" | "completed" | "rejected";
export type ProposedActionType = "create" | "update" | "complete";

export interface ProposedAction {
  actionType: ProposedActionType;
  // For create
  category?: RequestCategory;
  priority?: RequestPriority;
  description?: string;
  // For update/complete
  requestId?: string;
  newStatus?: RequestStatus;
  rejectionReason?: string;
  // Always present
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  pendingAction?: ProposedAction;
  actionResult?: {
    status: "confirmed" | "cancelled";
    convexId?: string;
  };
  timestamp: number;
}

export interface ChatRequestBody {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  userMessage: string;
  userContext: {
    name: string;
    roomNumber: string | null;
    building: string | null;
    activeRequests: Array<{
      id: string;
      category: RequestCategory;
      priority: RequestPriority;
      status: RequestStatus;
      description: string;
      createdAt: number;
    }>;
  };
}

export interface ChatResponseBody {
  text: string;
  pendingAction?: ProposedAction;
}
