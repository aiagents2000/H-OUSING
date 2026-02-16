"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequestCard } from "@/components/student/request-card";
import { RequestDetailModal } from "@/components/student/request-detail-modal";
import { RequestCardSkeleton } from "@/components/shared/loading-states";
import { Plus, Search, ClipboardList } from "lucide-react";
import { type RequestStatus, REQUEST_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function RequestsPage() {
  const t = useTranslations("requests");
  const tc = useTranslations("common");
  const ts = useTranslations("statuses");

  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<NonNullable<typeof requests>[number] | null>(null);

  const requests = useQuery(api.maintenanceRequests.getRequestsByStudent, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const filteredRequests = requests?.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  });

  const filterOptions: { value: RequestStatus | "all"; label: string }[] = [
    { value: "all", label: tc("all") },
    ...(Object.keys(REQUEST_STATUSES) as RequestStatus[]).map((s) => ({
      value: s,
      label: ts(s),
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button asChild className="ios-button hidden sm:flex">
          <Link href="/requests/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("new")}
          </Link>
        </Button>
      </div>

      {/* Filters - horizontally scrollable pills */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all",
                "shrink-0 active:scale-95",
                statusFilter === option.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-accent text-muted-foreground hover:bg-accent/80"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={tc("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Request list */}
      {!filteredRequests ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <RequestCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">{t("noRequests")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("noRequestsDesc")}
          </p>
          <Button asChild className="mt-4 ios-button">
            <Link href="/requests/new">
              <Plus className="h-4 w-4 mr-2" />
              {t("new")}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => (
            <RequestCard
              key={req._id}
              request={req}
              onClick={() => setSelectedRequest(req)}
            />
          ))}
        </div>
      )}

      {/* FAB mobile - positioned above bottom nav */}
      <Link
        href="/requests/new"
        className="fixed bottom-24 right-4 sm:hidden h-14 w-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
        aria-label="New request"
      >
        <Plus className="h-6 w-6" />
      </Link>

      <RequestDetailModal
        request={selectedRequest as never}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
}
