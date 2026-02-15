"use client";

import { RequestForm } from "@/components/student/request-form";
import { useTranslations } from "next-intl";

export default function NewRequestPage() {
  const t = useTranslations("requests");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("new")}</h1>
      <RequestForm />
    </div>
  );
}
