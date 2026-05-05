"use client";

import {
  ClipboardList,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { REQUEST_CATEGORIES, REQUEST_PRIORITIES, REQUEST_STATUSES } from "@/lib/constants";
import type { ProposedAction } from "@/lib/chat-types";

interface MaintenanceActionCardProps {
  action: ProposedAction;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isConfirming: boolean;
}

const ACTION_ICONS = {
  create: ClipboardList,
  update: RefreshCw,
  complete: CheckCircle2,
} as const;

export function MaintenanceActionCard({
  action,
  onConfirm,
  onCancel,
  isConfirming,
}: MaintenanceActionCardProps) {
  const t = useTranslations("chat");

  const ActionIcon = ACTION_ICONS[action.actionType];

  const actionLabel =
    action.actionType === "create"
      ? t("actionTypeCreate")
      : action.actionType === "update"
        ? t("actionTypeUpdate")
        : t("actionTypeComplete");

  return (
    <div className="mt-3 ios-card border-l-4 border-l-primary p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ActionIcon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold">{t("proposedAction")}</span>
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#007AFF15", color: "#007AFF" }}
        >
          {actionLabel}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-foreground">{action.summary}</p>

      {/* Details grid */}
      <div className="space-y-1.5">
        {action.category && (
          <DetailRow
            label="Category"
            value={action.category}
            color={REQUEST_CATEGORIES[action.category].color}
            bgColor={REQUEST_CATEGORIES[action.category].bgColor}
          />
        )}
        {action.priority && (
          <DetailRow
            label="Priority"
            value={action.priority}
            color={REQUEST_PRIORITIES[action.priority].color}
            bgColor={REQUEST_PRIORITIES[action.priority].bgColor}
          />
        )}
        {action.description && (
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 w-20">Description</span>
            <span className="line-clamp-2 text-foreground">{action.description}</span>
          </div>
        )}
        {action.requestId && (
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 w-20">Request ID</span>
            <span className="font-mono text-foreground truncate">{action.requestId.slice(-8)}</span>
          </div>
        )}
        {action.newStatus && (
          <DetailRow
            label="New Status"
            value={action.newStatus.replace("_", " ")}
            color={REQUEST_STATUSES[action.newStatus].color}
            bgColor={REQUEST_STATUSES[action.newStatus].bgColor}
          />
        )}
        {action.rejectionReason && (
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 w-20">Reason</span>
            <span className="text-foreground">{action.rejectionReason}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isConfirming}
          className="flex-1 ios-button"
        >
          {t("cancelAction")}
        </Button>
        <Button
          size="sm"
          onClick={onConfirm}
          disabled={isConfirming}
          className="flex-1 ios-button bg-primary text-white"
        >
          {isConfirming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("confirmAction")
          )}
        </Button>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground shrink-0 w-20">{label}</span>
      <span
        className="px-2 py-0.5 rounded-full font-medium capitalize"
        style={{ color, backgroundColor: bgColor }}
      >
        {value}
      </span>
    </div>
  );
}
