"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Anchor, ShoppingBag, ExternalLink } from "lucide-react";

export default function MarinaServicesPage() {
  const t = useTranslations("marina");

  const services = [
    {
      icon: Anchor,
      title: t("bookServices"),
      description: t("bookServicesDesc"),
      url: "https://www.holidoit.com/embed/web/937c14a4-eddc-4a12-8d16-e67ec4c199f7?with_script=true&language_selector=true&holidoit_logo=true&partner_logo=true",
      color: "#007AFF",
    },
    {
      icon: ShoppingBag,
      title: t("marketplace"),
      description: t("marketplaceDesc"),
      url: "https://marina-marketplace.emergent.host/",
      color: "#5856D6",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Anchor className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{t("subtitle")}</p>

      <div className="space-y-4">
        {services.map((service, i) => {
          const Icon = service.icon;
          return (
            <a
              key={i}
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="ios-card active:scale-[0.98] transition-transform cursor-pointer">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${service.color}12` }}
                    >
                      <Icon
                        className="h-7 w-7"
                        style={{ color: service.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-base">{service.title}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {service.description}
                      </p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
}
