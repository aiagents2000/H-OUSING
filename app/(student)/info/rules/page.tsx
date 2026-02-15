"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";

export default function RulesPage() {
  const t = useTranslations("info.rules");

  const sections = Array.from({ length: 7 }, (_, i) => ({
    title: t(`section${i + 1}Title`),
    content: t(`section${i + 1}Content`),
  }));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <Card className="ios-card">
        <CardContent className="p-6">
          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={i}>
                {i > 0 && <Separator className="mb-6" />}
                <h2 className="text-base font-semibold mb-3">
                  {i + 1}. {section.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
