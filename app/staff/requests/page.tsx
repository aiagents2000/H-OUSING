"use client";

import { useTranslations } from "next-intl";
import { RequestTable } from "@/components/staff/request-table";

export default function StaffRequestsPage() {
  const t = useTranslations("requests");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("allTitle")}</h1>
      <RequestTable />
    </div>
  );
}
