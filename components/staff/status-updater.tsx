"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/constants";
import { Id } from "@/convex/_generated/dataModel";

interface StatusUpdaterProps {
  requestId: Id<"maintenanceRequests">;
  currentStatus: RequestStatus;
  onUpdated?: () => void;
}

export function StatusUpdater({
  requestId,
  currentStatus,
  onUpdated,
}: StatusUpdaterProps) {
  const t = useTranslations();
  const updateStatus = useMutation(api.maintenanceRequests.updateRequestStatus);

  const [newStatus, setNewStatus] = useState<RequestStatus | "">("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!newStatus) return;
    setLoading(true);
    try {
      await updateStatus({
        requestId,
        status: newStatus,
        rejectionReason: newStatus === "rejected" ? rejectionReason : undefined,
      });
      toast.success(t("requests.statusUpdated"));
      setShowConfirm(false);
      setNewStatus("");
      setRejectionReason("");
      onUpdated?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Select
          value={newStatus}
          onValueChange={(v) => setNewStatus(v as RequestStatus)}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder={t("requests.changeStatus")} />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(REQUEST_STATUSES) as RequestStatus[])
              .filter((s) => s !== currentStatus)
              .map((status) => (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: REQUEST_STATUSES[status].color,
                      }}
                    />
                    {t(`statuses.${status}`)}
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          disabled={!newStatus}
          onClick={() => setShowConfirm(true)}
          className="ios-button h-9"
        >
          {t("common.confirm")}
        </Button>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("requests.confirmStatusChange")}</DialogTitle>
            <DialogDescription>
              {t("requests.confirmStatusChangeDesc")}{" "}
              <strong>{newStatus ? t(`statuses.${newStatus}`) : ""}</strong>?
            </DialogDescription>
          </DialogHeader>

          {newStatus === "rejected" && (
            <Textarea
              placeholder={t("requests.rejectionReasonPlaceholder")}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || (newStatus === "rejected" && !rejectionReason)}
              className="ios-button"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("common.confirm")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
