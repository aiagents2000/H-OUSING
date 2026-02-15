"use client";

import { useTranslations } from "next-intl";
import { AnalyticsCharts } from "@/components/staff/analytics-charts";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const t = useTranslations("analytics");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>
      <AnalyticsCharts />
    </div>
  );
}
