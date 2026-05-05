"use client";

import { Check, X } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { MaintenanceActionCard } from "@/components/student/maintenance-action-card";
import type { ChatMessage } from "@/lib/chat-types";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onConfirmAction: (messageId: string) => Promise<void>;
  onCancelAction: (messageId: string) => void;
  isConfirming: boolean;
}

export function ChatMessageBubble({
  message,
  onConfirmAction,
  onCancelAction,
  isConfirming,
}: ChatMessageBubbleProps) {
  const t = useTranslations("chat");
  const isUser = message.role === "user";
  const time = format(new Date(message.timestamp), "HH:mm");

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%]">
          <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-right">{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
          {message.text && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          )}

          {/* Pending action — show confirmation card */}
          {message.pendingAction && !message.actionResult && (
            <MaintenanceActionCard
              action={message.pendingAction}
              onConfirm={() => onConfirmAction(message.id)}
              onCancel={() => onCancelAction(message.id)}
              isConfirming={isConfirming}
            />
          )}

          {/* Action result pill */}
          {message.actionResult && (
            <div className="mt-3">
              {message.actionResult.status === "confirmed" ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200">
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-medium text-green-700">{t("actionConfirmed")}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">{t("actionCancelledLabel")}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}
