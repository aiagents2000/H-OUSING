"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageLoader } from "@/components/shared/loading-states";
import { format } from "date-fns";
import { HelpCircle, FileText, Phone, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tn = useTranslations("nav");
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

  const infoLinks = [
    { href: "/info/faq", label: tn("faq"), icon: HelpCircle },
    { href: "/info/rules", label: tn("rules"), icon: FileText },
    { href: "/info/contacts", label: tn("contacts"), icon: Phone },
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

      {/* Info & Help section */}
      {currentUser.role === "student" && (
        <div className="mt-6">
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
    </div>
  );
}
