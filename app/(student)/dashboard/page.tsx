"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  ClipboardList,
  DoorOpen,
  FileText,
  Plus,
  Megaphone,
  AlertTriangle,
  MessageSquareDot,
  ChevronRight,
} from "lucide-react";
import { StatCard } from "@/components/student/dashboard-stats";
import { RequestCard } from "@/components/student/request-card";
import { RequestDetailModal } from "@/components/student/request-detail-modal";
import { CardSkeleton } from "@/components/shared/loading-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { useAppLocale } from "@/lib/i18n";

export default function StudentDashboard() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const ta = useTranslations("announcements");
  const { locale } = useAppLocale();
  const dateLocale = locale === "it" ? it : enUS;
  const currentUser = useQuery(api.users.getCurrentUser);
  const stats = useQuery(api.maintenanceRequests.getRequestStats);
  const requests = useQuery(api.maintenanceRequests.getRequestsByStudent, {});
  const announcements = useQuery(api.announcements.list);
  const [selectedRequest, setSelectedRequest] = useState<(typeof recentRequests)[number] | null>(null);

  const recentAnnouncements = announcements?.slice(0, 3) || [];

  const recentRequests = requests?.slice(0, 3) || [];

  if (!currentUser || stats === undefined) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-20 bg-muted rounded-xl animate-pulse" />
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

      <Link
        href="/chat"
        className="block ios-button rounded-2xl p-4 shadow-md text-white bg-gradient-to-br from-[#5856D6] to-[#7C3AED] active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <MessageSquareDot className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{t("chatCardTitle")}</p>
            <p className="text-xs text-white/80 truncate">{t("chatCardSubtitle")}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-white/70 shrink-0" />
        </div>
      </Link>

      {/* Stats grid - 2x2 square cards on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Row 1: Announcements + Your Room */}
        <StatCard
          icon={Megaphone}
          label={ta("title")}
          value={recentAnnouncements.length}
          sublabel={recentAnnouncements[0]?.title}
          color="#FF9500"
        />
        <StatCard
          icon={DoorOpen}
          label={t("yourRoom")}
          value={`${currentUser.roomNumber || "-"}`}
          sublabel={currentUser.building ? `${tc("building")} ${currentUser.building}` : undefined}
          color="#5856D6"
        />
        {/* Row 2: Active Requests + Total Requests */}
        <StatCard
          icon={ClipboardList}
          label={t("activeRequests")}
          value={stats && "active" in stats ? stats.active ?? 0 : 0}
          color="#007AFF"
        />
        <StatCard
          icon={FileText}
          label={t("totalRequests")}
          value={stats && "total" in stats ? stats.total ?? 0 : 0}
          color="#34C759"
        />
      </div>

      {/* Announcements detail (when there are announcements) */}
      {recentAnnouncements.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">{ta("title")}</h2>
          </div>
          {recentAnnouncements.map((a) => (
            <Card
              key={a._id}
              className={`ios-card ${a.priority === "important" ? "border-destructive/30" : ""}`}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  {a.priority === "important" && (
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {a.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {a.authorName} &middot;{" "}
                      {formatDistanceToNow(new Date(a.createdAt), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

      {/* Floating Action Button - mobile, positioned above bottom nav */}
      <Link
        href="/requests/new"
        className="fixed bottom-32 right-4 lg:bottom-6 lg:right-6 lg:hidden h-14 w-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
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
