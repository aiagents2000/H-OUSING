"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
        <CardContent className="p-3 sm:p-6">
          <Accordion type="multiple" className="w-full">
            {sections.map((section, i) => (
              <AccordionItem key={i} value={`section-${i}`}>
                <AccordionTrigger className="text-sm sm:text-base font-semibold text-left px-1 py-4 hover:no-underline">
                  {i + 1}. {section.title}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground px-1 pb-4 leading-relaxed">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
