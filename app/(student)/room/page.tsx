"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageLoader } from "@/components/shared/loading-states";
import { RequestCard } from "@/components/student/request-card";
import { RequestDetailModal } from "@/components/student/request-detail-modal";
import { DoorOpen, Users, ClipboardList } from "lucide-react";
import { REQUEST_STATUSES } from "@/lib/constants";
import { useState } from "react";

export default function RoomPage() {
  const t = useTranslations("room");
  const tc = useTranslations();
  const currentUser = useQuery(api.users.getCurrentUser);

  const roommates = useQuery(
    api.rooms.getRoommates,
    currentUser?.roomNumber && currentUser?.building
      ? {
          roomNumber: currentUser.roomNumber,
          building: currentUser.building as "A" | "B",
        }
      : "skip"
  );

  const roomRequests = useQuery(
    api.maintenanceRequests.getRequestsByRoom,
    currentUser?.roomNumber && currentUser?.building
      ? {
          roomNumber: currentUser.roomNumber,
          building: currentUser.building as "A" | "B",
        }
      : "skip"
  );

  const [selectedRequest, setSelectedRequest] = useState<NonNullable<typeof roomRequests>[number] | null>(null);

  if (!currentUser) return <PageLoader />;

  const activeRequests = roomRequests?.filter(
    (r) => r.status === "open" || r.status === "in_progress"
  ) || [];

  const otherRoommates = roommates?.filter(
    (r) => r && r._id !== currentUser._id
  ) || [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <DoorOpen className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <Card className="ios-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {currentUser.roomNumber}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {tc("common.room")} {currentUser.roomNumber}
              </h2>
              <Badge variant="secondary" className="mt-1">
                {tc("common.building")} {currentUser.building}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roommates */}
      <Card className="ios-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("roommates")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {otherRoommates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              {t("noRoommates")}
            </p>
          ) : (
            <div className="space-y-3">
              {otherRoommates.map((mate) =>
                mate ? (
                  <div key={mate._id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={mate.photoUrl} />
                      <AvatarFallback className="bg-secondary/10 text-secondary text-sm">
                        {mate.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{mate.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {mate.courseOfStudy}
                      </p>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Requests */}
      <Card className="ios-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            {t("activeRequests")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              {t("noActiveRequests")}
            </p>
          ) : (
            <div className="space-y-3">
              {activeRequests.map((req) => (
                <RequestCard
                  key={req._id}
                  request={req}
                  onClick={() => setSelectedRequest(req)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RequestDetailModal
        request={selectedRequest as never}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
}
