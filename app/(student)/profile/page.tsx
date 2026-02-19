"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageLoader } from "@/components/shared/loading-states";
import { RequestCard } from "@/components/student/request-card";
import { RequestDetailModal } from "@/components/student/request-detail-modal";
import { format } from "date-fns";
import { HelpCircle, FileText, Phone, ChevronRight, Users, ClipboardList } from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tr = useTranslations("room");
  const tn = useTranslations("nav");
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

  const initials = currentUser.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const fields = [
    { label: t("fullName"), value: currentUser.fullName },
    { label: t("email"), value: currentUser.email },
    ...(currentUser.role === "student"
      ? [
          { label: t("studentId"), value: currentUser.studentId || "-" },
          { label: t("courseOfStudy"), value: currentUser.courseOfStudy || "-" },
          {
            label: t("room"),
            value: currentUser.roomNumber
              ? `${currentUser.roomNumber}`
              : "-",
          },
          { label: t("building"), value: currentUser.building || "-" },
        ]
      : []),
    {
      label: t("role"),
      value: currentUser.role === "student" ? "Student" : "Staff",
    },
    {
      label: t("memberSince"),
      value: format(new Date(currentUser.createdAt), "dd/MM/yyyy"),
    },
  ];

  const infoLinks = [
    { href: "/info/faq", label: tn("faq"), icon: HelpCircle },
    { href: "/info/rules", label: tn("rules"), icon: FileText },
    { href: "/info/contacts", label: tn("contacts"), icon: Phone },
  ];

  const otherRoommates = roommates?.filter(
    (r) => r && r._id !== currentUser._id
  ) || [];

  const activeRequests = roomRequests?.filter(
    (r) => r.status === "open" || r.status === "in_progress"
  ) || [];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Profile card */}
      <Card className="ios-card">
        <CardContent className="p-6">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-3">
              <AvatarImage src={currentUser.photoUrl} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{currentUser.fullName}</h2>
            <Badge variant="secondary" className="mt-1">
              {currentUser.role === "student" ? "Student" : "Staff"}
            </Badge>
          </div>

          <Separator className="mb-4" />

          <div className="space-y-4">
            {fields.map((field, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {field.label}
                </span>
                <span className="text-sm font-medium text-right">
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Room section - roommates */}
      {currentUser.role === "student" && currentUser.roomNumber && (
        <Card className="ios-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              {tr("roommates")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {otherRoommates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                {tr("noRoommates")}
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
      )}

      {/* Room section - active requests */}
      {currentUser.role === "student" && currentUser.roomNumber && (
        <Card className="ios-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              {tr("activeRequests")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                {tr("noActiveRequests")}
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
      )}

      {/* Info & Help section */}
      {currentUser.role === "student" && (
        <div>
          <h2 className="text-lg font-semibold mb-3">{t("infoHelp")}</h2>
          <Card className="ios-card">
            <CardContent className="p-0">
              {infoLinks.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent active:bg-accent"
                    style={i < infoLinks.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}
                  >
                    <Icon className="h-5 w-5 text-primary shrink-0" />
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      <RequestDetailModal
        request={selectedRequest as never}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
}
