"use client";

import { useAppLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale } = useAppLocale();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "it" ? "en" : "it")}
      className="touch-target gap-1.5 text-xs font-semibold"
      aria-label={`Switch language to ${locale === "it" ? "English" : "Italiano"}`}
    >
      <Globe className="h-4 w-4" />
      {locale === "it" ? "EN" : "IT"}
    </Button>
  );
}
