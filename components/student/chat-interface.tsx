"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { Bot, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessageBubble } from "@/components/student/chat-message-bubble";
import type {
  ChatMessage,
  ChatRequestBody,
  ChatResponseBody,
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "@/lib/chat-types";

interface ActiveRequest {
  _id: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  description: string;
  createdAt: number;
}

interface ChatInterfaceProps {
  currentUser: {
    fullName: string;
    roomNumber: string | null;
    building: string | null;
  };
  activeRequests: ActiveRequest[];
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatInterface({ currentUser, activeRequests }: ChatInterfaceProps) {
  const t = useTranslations("chat");
  const te = useTranslations("errors");

  const createRequest = useMutation(api.maintenanceRequests.createRequest);
  const updateRequestStatus = useMutation(api.maintenanceRequests.updateRequestStatus);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: t("welcomeMessage"),
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmingMessageId, setConfirmingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessageRef = useRef<(text: string) => Promise<void>>(() => Promise.resolve());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsLoading(true);

      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.text }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            userMessage: text.trim(),
            userContext: {
              name: currentUser.fullName,
              roomNumber: currentUser.roomNumber,
              building: currentUser.building,
              activeRequests: activeRequests.map((r) => ({
                id: r._id,
                category: r.category,
                priority: r.priority,
                status: r.status,
                description: r.description,
                createdAt: r.createdAt,
              })),
            },
          } satisfies ChatRequestBody),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          console.error("[chat] API error", res.status, errBody);
          throw new Error(String(errBody.error ?? "API error"));
        }
        const data: ChatResponseBody = await res.json();

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: data.text,
          pendingAction: data.pendingAction,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        toast.error(t("errorMessage"));
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, currentUser, activeRequests, t]
  );

  // Keep ref in sync so handleConfirmAction always calls the latest sendMessage
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const handleConfirmAction = useCallback(
    async (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg?.pendingAction) return;

      const action = msg.pendingAction;

      // Security: verify requestId belongs to user's own requests
      if (
        (action.actionType === "update" || action.actionType === "complete") &&
        action.requestId
      ) {
        const owned = activeRequests.some((r) => r._id === action.requestId);
        if (!owned) {
          toast.error(te("generic"));
          return;
        }
      }

      setConfirmingMessageId(messageId);

      try {
        let convexId: string | undefined;

        if (action.actionType === "create") {
          const id = await createRequest({
            category: action.category!,
            priority: action.priority!,
            description: action.description!,
          });
          convexId = id as string;
          toast.success(t("requestCreated"));
        } else if (action.actionType === "update" || action.actionType === "complete") {
          const targetStatus =
            action.actionType === "complete" ? "completed" : action.newStatus!;
          await updateRequestStatus({
            requestId: action.requestId! as Id<"maintenanceRequests">,
            status: targetStatus,
            rejectionReason: action.rejectionReason,
          });
          convexId = action.requestId;
          toast.success(t("statusUpdated"));
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, actionResult: { status: "confirmed", convexId } }
              : m
          )
        );

        const followUp = t("actionCompleted", { id: convexId ?? "unknown" });
        await sendMessageRef.current(followUp);
      } catch {
        toast.error(te("generic"));
      } finally {
        setConfirmingMessageId(null);
      }
    },
    [messages, activeRequests, createRequest, updateRequestStatus, t, te]
  );

  const handleCancelAction = useCallback(
    (messageId: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, actionResult: { status: "cancelled" } } : m
        )
      );
      toast.info(t("actionCancelled"));
    },
    [t]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-5rem)] lg:h-[calc(100dvh-3.5rem-2rem)]">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold">{t("title")}</h1>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pb-2 min-h-0">
        {messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            onConfirmAction={handleConfirmAction}
            onCancelAction={handleCancelAction}
            isConfirming={confirmingMessageId === msg.id}
          />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips — only on first turn */}
      {messages.length === 1 && !isLoading && (
        <div className="shrink-0 pb-2 -mx-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-1">
            {(["quietHours", "reportIssue", "guestPolicy", "marinaServices"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => sendMessage(t(`suggestionPrompts.${key}`))}
                className="shrink-0 px-3 py-1.5 rounded-full bg-card border border-border/50 text-xs font-medium text-foreground hover:bg-accent ios-button"
              >
                {t(`suggestions.${key}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 pt-3 border-t border-border/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputValue);
          }}
          className="flex gap-2 items-end"
        >
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("inputPlaceholder")}
            rows={1}
            className="flex-1 resize-none rounded-2xl border-border/50 bg-card min-h-[44px] max-h-[120px]"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputValue.trim()}
            className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 ios-button shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
