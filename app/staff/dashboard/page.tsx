"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Timer,
  AlertTriangle,
} from "lucide-react";
import { StaffStatCard } from "@/components/staff/staff-stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSkeleton } from "@/components/shared/loading-states";
import { REQUEST_STATUSES, REQUEST_CATEGORIES } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { useAppLocale } from "@/lib/i18n";

export default function StaffDashboard() {
  const t = useTranslations("dashboard");
  const tc = useTranslations();
  const { locale } = useAppLocale();
  const dateLocale = locale === "it" ? it : enUS;

  const stats = useQuery(api.maintenanceRequests.getRequestStats);
  const recentRequests = useQuery(api.maintenanceRequests.getAllRequests, {});

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const avgHours =
    "avgResolutionTimeMs" in stats
      ? Math.round((stats.avgResolutionTimeMs ?? 0) / (1000 * 60 * 60))
      : 0;

  const recent = recentRequests?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaffStatCard
          icon={ClipboardList}
          label={t("openRequests")}
          value={"open" in stats ? stats.open ?? 0 : 0}
          color="#007AFF"
        />
        <StaffStatCard
          icon={Clock}
          label={t("inProgressRequests")}
          value={"inProgress" in stats ? stats.inProgress ?? 0 : 0}
          color="#FF9500"
        />
        <StaffStatCard
          icon={CheckCircle2}
          label={t("completedThisWeek")}
          value={"completedThisWeek" in stats ? stats.completedThisWeek ?? 0 : 0}
          color="#34C759"
        />
        <StaffStatCard
          icon={Timer}
          label={t("avgResolution")}
          value={`${avgHours}h`}
          color="#5856D6"
        />
      </div>

      {/* Quick filters */}
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="ios-button">
          <Link href="/staff/requests">{tc("common.all")}</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="ios-button">
          <Link href="/staff/requests?status=open">{tc("statuses.open")}</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="ios-button">
          <Link href="/staff/requests?status=in_progress">{tc("statuses.in_progress")}</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="ios-button border-destructive/30 text-destructive">
          <Link href="/staff/requests?priority=urgent">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            {t("urgent")}
          </Link>
        </Button>
      </div>

      {/* Recent Activity */}
      <Card className="ios-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t("recentActivity")}</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs text-primary">
              <Link href="/staff/requests">{tc("common.viewAll")}</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {t("noRecentRequests")}
            </p>
          ) : (
            <div className="space-y-3">
              {recent.map((req) => {
                const statusConfig = REQUEST_STATUSES[req.status as keyof typeof REQUEST_STATUSES];
                const catConfig = REQUEST_CATEGORIES[req.category as keyof typeof REQUEST_CATEGORIES];
                const CatIcon = catConfig.icon;
                return (
                  <div
                    key={req._id}
                    className="flex items-center gap-3 py-2 border-b last:border-0"
                  >
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: catConfig.bgColor }}
                    >
                      <CatIcon className="h-4 w-4" style={{ color: catConfig.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {req.studentName} - {tc("common.room")} {req.roomNumber}{req.building}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {req.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="outline" className="border-0 text-xs" style={{
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                      }}>
                        {tc(`statuses.${req.status}`)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(req.createdAt), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
