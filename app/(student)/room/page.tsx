"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Anchor, ShoppingBag, ExternalLink, ChevronRight } from "lucide-react";

type Service = {
  icon: typeof Anchor;
  title: string;
  description: string;
  href: string;
  external: boolean;
  color: string;
};

export default function MarinaServicesPage() {
  const t = useTranslations("marina");

  const services: Service[] = [
    {
      icon: Anchor,
      title: t("bookServices"),
      description: t("bookServicesDesc"),
      href: "/marina/book",
      external: false,
      color: "#007AFF",
    },
    {
      icon: ShoppingBag,
      title: t("marketplace"),
      description: t("marketplaceDesc"),
      href: "https://marina-marketplace.emergent.host/",
      external: true,
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
          const TrailingIcon = service.external ? ExternalLink : ChevronRight;
          const cardInner = (
            <Card className="ios-card active:scale-[0.98] transition-all cursor-pointer shadow-sm hover:shadow-md group">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-active:scale-95"
                    style={{ backgroundColor: `${service.color}12` }}
                  >
                    <Icon className="h-7 w-7" style={{ color: service.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-base">{service.title}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {service.description}
                    </p>
                  </div>
                  <TrailingIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          );

          return service.external ? (
            <a
              key={i}
              href={service.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {cardInner}
            </a>
          ) : (
            <Link key={i} href={service.href} className="block">
              {cardInner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
