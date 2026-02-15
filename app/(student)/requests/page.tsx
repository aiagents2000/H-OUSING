"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestCard } from "@/components/student/request-card";
import { RequestDetailModal } from "@/components/student/request-detail-modal";
import { RequestCardSkeleton } from "@/components/shared/loading-states";
import { Plus, Search, ClipboardList } from "lucide-react";
import { type RequestStatus } from "@/lib/constants";

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

      {/* Filters */}
      <div className="space-y-3">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as RequestStatus | "all")}
        >
          <TabsList className="w-full flex overflow-x-auto">
            <TabsTrigger value="all" className="flex-1">
              {tc("all")}
            </TabsTrigger>
            <TabsTrigger value="open" className="flex-1">
              {ts("open")}
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="flex-1">
              {ts("in_progress")}
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              {ts("completed")}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1">
              {ts("rejected")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

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

      {/* FAB mobile */}
      <Link
        href="/requests/new"
        className="fixed bottom-6 right-6 sm:hidden h-14 w-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
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
