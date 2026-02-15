"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { StatusUpdater } from "./status-updater";
import { TableSkeleton } from "@/components/shared/loading-states";
import {
  REQUEST_CATEGORIES,
  REQUEST_STATUSES,
  REQUEST_PRIORITIES,
  type RequestStatus,
  type RequestCategory,
  type RequestPriority,
} from "@/lib/constants";
import { formatDistanceToNow, format } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { useAppLocale } from "@/lib/i18n";
import { Search, Eye, Mail } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export function RequestTable() {
  const t = useTranslations();
  const { locale } = useAppLocale();
  const dateLocale = locale === "it" ? it : enUS;

  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<RequestCategory | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | "all">("all");
  const [buildingFilter, setBuildingFilter] = useState<"A" | "B" | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<Id<"maintenanceRequests"> | null>(null);

  const requests = useQuery(api.maintenanceRequests.getAllRequests, {
    status: statusFilter === "all" ? undefined : statusFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
    building: buildingFilter === "all" ? undefined : buildingFilter,
    searchQuery: searchQuery || undefined,
  });

  const selectedRequest = useQuery(
    api.maintenanceRequests.getRequestById,
    selectedRequestId ? { requestId: selectedRequestId } : "skip"
  );

  const photoUrl = useQuery(
    api.files.getFileUrl,
    selectedRequest?.photoStorageId
      ? { storageId: selectedRequest.photoStorageId }
      : "skip"
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("common.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RequestStatus | "all")}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder={t("common.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {(Object.keys(REQUEST_STATUSES) as RequestStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{t(`statuses.${s}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as RequestCategory | "all")}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder={t("common.category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {(Object.keys(REQUEST_CATEGORIES) as RequestCategory[]).map((c) => (
              <SelectItem key={c} value={c}>{t(`categories.${c}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as RequestPriority | "all")}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder={t("common.priority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {(Object.keys(REQUEST_PRIORITIES) as RequestPriority[]).map((p) => (
              <SelectItem key={p} value={p}>{t(`priorities.${p}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={buildingFilter} onValueChange={(v) => setBuildingFilter(v as "A" | "B" | "all")}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder={t("common.building")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="A">{t("common.building")} A</SelectItem>
            <SelectItem value="B">{t("common.building")} B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {!requests ? (
        <TableSkeleton rows={8} />
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t("requests.noRequests")}
        </div>
      ) : (
        <div className="ios-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("requests.studentName")}</TableHead>
                  <TableHead>{t("common.room")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("common.category")}</TableHead>
                  <TableHead>{t("common.priority")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("common.date")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => {
                  const statusConfig = REQUEST_STATUSES[req.status as RequestStatus];
                  const priorityConfig = REQUEST_PRIORITIES[req.priority as RequestPriority];
                  const catConfig = REQUEST_CATEGORIES[req.category as RequestCategory];
                  const CatIcon = catConfig.icon;

                  return (
                    <TableRow key={req._id}>
                      <TableCell className="font-medium">
                        {req.studentName}
                      </TableCell>
                      <TableCell>
                        {req.roomNumber}{req.building}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <CatIcon className="h-3.5 w-3.5" style={{ color: catConfig.color }} />
                          <span className="text-sm">{t(`categories.${req.category}`)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-0 text-xs" style={{
                          backgroundColor: priorityConfig.bgColor,
                          color: priorityConfig.color,
                        }}>
                          {t(`priorities.${req.priority}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-0 text-xs" style={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.color,
                        }}>
                          {t(`statuses.${req.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(req.createdAt), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedRequestId(req._id as Id<"maintenanceRequests">)}
                          aria-label="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog
        open={!!selectedRequestId}
        onOpenChange={() => setSelectedRequestId(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest
                ? `${t("common.details")} - ${t(`categories.${selectedRequest.category}`)}`
                : t("common.details")}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <>

              <div className="space-y-4">
                {/* Student info */}
                <div className="bg-accent rounded-xl p-3">
                  <p className="text-sm font-semibold">{selectedRequest.studentName}</p>
                  <p className="text-xs text-muted-foreground">{selectedRequest.studentEmail}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("common.room")} {selectedRequest.roomNumber}{selectedRequest.building}
                  </p>
                  {selectedRequest.studentEmail && (
                    <Button asChild size="sm" variant="outline" className="mt-2 h-7 text-xs">
                      <a href={`mailto:${selectedRequest.studentEmail}`}>
                        <Mail className="h-3 w-3 mr-1" /> Email
                      </a>
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Request details */}
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-0" style={{
                    backgroundColor: REQUEST_STATUSES[selectedRequest.status as RequestStatus].bgColor,
                    color: REQUEST_STATUSES[selectedRequest.status as RequestStatus].color,
                  }}>
                    {t(`statuses.${selectedRequest.status}`)}
                  </Badge>
                  <Badge variant="outline" className="border-0" style={{
                    backgroundColor: REQUEST_PRIORITIES[selectedRequest.priority as RequestPriority].bgColor,
                    color: REQUEST_PRIORITIES[selectedRequest.priority as RequestPriority].color,
                  }}>
                    {t(`priorities.${selectedRequest.priority}`)}
                  </Badge>
                </div>

                <p className="text-sm leading-relaxed">{selectedRequest.description}</p>

                {photoUrl && (
                  <img
                    src={photoUrl}
                    alt="Request photo"
                    className="w-full rounded-xl object-cover max-h-64"
                  />
                )}

                {selectedRequest.rejectionReason && (
                  <div className="bg-destructive/10 rounded-xl p-3">
                    <p className="text-sm font-semibold text-destructive mb-1">
                      {t("requests.rejectionReason")}
                    </p>
                    <p className="text-sm">{selectedRequest.rejectionReason}</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedRequest.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: dateLocale,
                  })}
                </p>

                <Separator />

                <StatusUpdater
                  requestId={selectedRequestId!}
                  currentStatus={selectedRequest.status as RequestStatus}
                  onUpdated={() => setSelectedRequestId(null)}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
