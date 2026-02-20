"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageLoader } from "@/components/shared/loading-states";
import {
  REQUEST_CATEGORIES,
  REQUEST_STATUSES,
  REQUEST_PRIORITIES,
  type RequestCategory,
  type RequestStatus,
  type RequestPriority,
} from "@/lib/constants";
import { format } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { useAppLocale } from "@/lib/i18n";
import { ArrowLeft, CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const { locale } = useAppLocale();
  const dateLocale = locale === "it" ? it : enUS;

  const request = useQuery(
    api.maintenanceRequests.getRequestById,
    params.id
      ? { requestId: params.id as Id<"maintenanceRequests"> }
      : "skip"
  );

  const photoUrl = useQuery(
    api.files.getFileUrl,
    request?.photoStorageId
      ? { storageId: request.photoStorageId }
      : "skip"
  );

  if (request === undefined) return <PageLoader />;
  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("errors.requestNotFound")}</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.back")}
        </Button>
      </div>
    );
  }

  const cat = REQUEST_CATEGORIES[request.category as RequestCategory];
  const Icon = cat.icon;
  const statusConfig = REQUEST_STATUSES[request.status as RequestStatus];
  const priorityConfig = REQUEST_PRIORITIES[request.priority as RequestPriority];

  const timelineSteps = [
    { label: t("statuses.open"), time: request.createdAt, done: true, icon: Circle },
    {
      label: t("statuses.in_progress"),
      time: request.status !== "open" ? request.updatedAt : undefined,
      done: request.status === "in_progress" || request.status === "completed",
      icon: Clock,
    },
    {
      label: request.status === "rejected" ? t("statuses.rejected") : t("statuses.completed"),
      time: request.completedAt || (request.status === "rejected" ? request.updatedAt : undefined),
      done: request.status === "completed" || request.status === "rejected",
      icon: request.status === "rejected" ? XCircle : CheckCircle2,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.back")}
      </Button>

      <Card className="ios-card">
        <CardContent className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: cat.bgColor }}
            >
              <Icon className="h-6 w-6" style={{ color: cat.color }} />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {t(`categories.${request.category}`)}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("common.room")} {request.roomNumber}{request.building} &middot;{" "}
                {format(new Date(request.createdAt), "dd/MM/yyyy HH:mm", { locale: dateLocale })}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline" className="border-0" style={{
              backgroundColor: statusConfig.bgColor, color: statusConfig.color,
            }}>
              {t(`statuses.${request.status}`)}
            </Badge>
            <Badge variant="outline" className="border-0" style={{
              backgroundColor: priorityConfig.bgColor, color: priorityConfig.color,
            }}>
              {t(`priorities.${request.priority}`)}
            </Badge>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold mb-2">{t("common.description")}</h3>
            <p className="text-sm leading-relaxed">{request.description}</p>
          </div>

          {/* Photo */}
          {photoUrl && (
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("common.photo")}</h3>
              <img
                src={photoUrl}
                alt="Request photo"
                className="w-full rounded-xl object-cover max-h-80"
              />
            </div>
          )}

          {/* Rejection reason */}
          {request.status === "rejected" && request.rejectionReason && (
            <div className="bg-destructive/10 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-destructive mb-1">
                {t("requests.rejectionReason")}
              </h3>
              <p className="text-sm">{request.rejectionReason}</p>
            </div>
          )}

          <Separator />

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t("requests.statusTimeline")}</h3>
            <div className="space-y-4">
              {timelineSteps.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <StepIcon
                      className={`h-5 w-5 mt-0.5 shrink-0 ${
                        step.done ? "text-primary" : "text-muted-foreground/30"
                      }`}
                    />
                    <div>
                      <p className={`text-sm font-medium ${
                        step.done ? "text-foreground" : "text-muted-foreground/30"
                      }`}>
                        {step.label}
                      </p>
                      {step.time && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(step.time), "dd/MM/yyyy HH:mm", { locale: dateLocale })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
