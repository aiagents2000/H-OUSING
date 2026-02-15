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
import { Search, Eye, Mail, X, Filter } from "lucide-react";
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

  const hasActiveFilters =
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    priorityFilter !== "all" ||
    buildingFilter !== "all" ||
    searchQuery !== "";

  const activeFilterChips: { label: string; onClear: () => void }[] = [];
  if (statusFilter !== "all") {
    activeFilterChips.push({
      label: `${t("common.status")}: ${t(`statuses.${statusFilter}`)}`,
      onClear: () => setStatusFilter("all"),
    });
  }
  if (categoryFilter !== "all") {
    activeFilterChips.push({
      label: `${t("common.category")}: ${t(`categories.${categoryFilter}`)}`,
      onClear: () => setCategoryFilter("all"),
    });
  }
  if (priorityFilter !== "all") {
    activeFilterChips.push({
      label: `${t("common.priority")}: ${t(`priorities.${priorityFilter}`)}`,
      onClear: () => setPriorityFilter("all"),
    });
  }
  if (buildingFilter !== "all") {
    activeFilterChips.push({
      label: `${t("common.building")}: ${buildingFilter}`,
      onClear: () => setBuildingFilter("all"),
    });
  }
  if (searchQuery) {
    activeFilterChips.push({
      label: `${t("common.search").replace("...", "")}: "${searchQuery}"`,
      onClear: () => setSearchQuery(""),
    });
  }

  const clearAllFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setBuildingFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="ios-card rounded-xl p-3 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          {t("common.filters")}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <div className="relative col-span-2 sm:col-span-3 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RequestStatus | "all")}>
            <SelectTrigger className="h-9">
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
            <SelectTrigger className="h-9">
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
            <SelectTrigger className="h-9">
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
            <SelectTrigger className="h-9">
              <SelectValue placeholder={t("common.building")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="A">{t("common.building")} A</SelectItem>
              <SelectItem value="B">{t("common.building")} B</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">{t("common.activeFilters")}:</span>
            {activeFilterChips.map((chip, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-xs gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                onClick={chip.onClear}
              >
                {chip.label}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground px-2"
              onClick={clearAllFilters}
            >
              {t("common.clearAll")}
            </Button>
          </div>
        )}
      </div>

      {/* Results count */}
      {requests && (
        <p className="text-xs text-muted-foreground px-1">
          {t("common.resultsCount", { count: requests.length })}
        </p>
      )}

      {/* Table (desktop) / Cards (mobile) */}
      {!requests ? (
        <TableSkeleton rows={8} />
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t("requests.noRequests")}
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="block lg:hidden space-y-2">
            {requests.map((req) => {
              const statusConfig = REQUEST_STATUSES[req.status as RequestStatus];
              const priorityConfig = REQUEST_PRIORITIES[req.priority as RequestPriority];
              const catConfig = REQUEST_CATEGORIES[req.category as RequestCategory];
              const CatIcon = catConfig.icon;

              return (
                <div
                  key={req._id}
                  className="ios-card rounded-xl p-3 space-y-2 cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => setSelectedRequestId(req._id as Id<"maintenanceRequests">)}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{req.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("common.room")} {req.roomNumber}{req.building}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(req.createdAt), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CatIcon className="h-3.5 w-3.5 shrink-0" style={{ color: catConfig.color }} />
                    <span className="text-xs">{t(`categories.${req.category}`)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-0 text-xs" style={{
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color,
                    }}>
                      {t(`statuses.${req.status}`)}
                    </Badge>
                    <Badge variant="outline" className="border-0 text-xs" style={{
                      backgroundColor: priorityConfig.bgColor,
                      color: priorityConfig.color,
                    }}>
                      {t(`priorities.${req.priority}`)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table view */}
          <div className="hidden lg:block ios-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("requests.studentName")}</TableHead>
                    <TableHead>{t("common.room")}</TableHead>
                    <TableHead>{t("common.category")}</TableHead>
                    <TableHead>{t("common.priority")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("common.date")}</TableHead>
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
                        <TableCell>
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
                        <TableCell className="text-sm text-muted-foreground">
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
        </>
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
