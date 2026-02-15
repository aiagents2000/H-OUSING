"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardList, DoorOpen, FileText, Plus } from "lucide-react";
import { StatCard } from "@/components/student/dashboard-stats";
import { RequestCard } from "@/components/student/request-card";
import { RequestDetailModal } from "@/components/student/request-detail-modal";
import { CardSkeleton, RequestCardSkeleton } from "@/components/shared/loading-states";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function StudentDashboard() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const currentUser = useQuery(api.users.getCurrentUser);
  const stats = useQuery(api.maintenanceRequests.getRequestStats);
  const requests = useQuery(api.maintenanceRequests.getRequestsByStudent, {});
  const [selectedRequest, setSelectedRequest] = useState<(typeof recentRequests)[number] | null>(null);

  const recentRequests = requests?.slice(0, 3) || [];

  if (!currentUser || stats === undefined) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">
          {t("welcome", { name: currentUser.fullName?.split(" ")[0] || "" })}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={ClipboardList}
          label={t("activeRequests")}
          value={stats && "active" in stats ? stats.active : 0}
          color="#007AFF"
        />
        <StatCard
          icon={DoorOpen}
          label={t("yourRoom")}
          value={`${currentUser.roomNumber || "-"}`}
          sublabel={currentUser.building ? `${tc("building")} ${currentUser.building}` : undefined}
          color="#5856D6"
        />
        <StatCard
          icon={FileText}
          label={t("totalRequests")}
          value={stats && "total" in stats ? stats.total : 0}
          color="#34C759"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t("recentRequests")}</h2>
          {recentRequests.length > 0 && (
            <Link
              href="/requests"
              className="text-sm text-primary font-medium hover:underline"
            >
              {tc("viewAll")}
            </Link>
          )}
        </div>

        {recentRequests.length === 0 ? (
          <div className="text-center py-12 ios-card rounded-xl">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">{t("noRecentRequests")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("createFirst")}</p>
            <Button asChild className="mt-4 ios-button">
              <Link href="/requests/new">
                <Plus className="h-4 w-4 mr-2" />
                {tc("submit")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentRequests.map((req) => (
              <RequestCard
                key={req._id}
                request={req}
                onClick={() => setSelectedRequest(req)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button - mobile */}
      <Link
        href="/requests/new"
        className="fixed bottom-6 right-6 lg:hidden h-14 w-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
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
