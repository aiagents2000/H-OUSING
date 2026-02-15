"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageLoader } from "@/components/shared/loading-states";
import { format } from "date-fns";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const currentUser = useQuery(api.users.getCurrentUser);

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

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>

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
    </div>
  );
}
