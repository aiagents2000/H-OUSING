"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone as PhoneIcon, Mail, Clock, Shield, Heart, Wrench } from "lucide-react";

export default function ContactsPage() {
  const t = useTranslations("info.contacts");

  const contacts = [
    {
      icon: Wrench,
      title: t("maintenance"),
      phone: t("maintenancePhone"),
      color: "#FF3B30",
      badge: "24/7",
    },
    {
      icon: PhoneIcon,
      title: t("reception"),
      phone: t("receptionPhone"),
      subtitle: t("receptionHours"),
      color: "#007AFF",
    },
    {
      icon: Mail,
      title: t("email"),
      email: t("emailAddress"),
      color: "#5856D6",
    },
    {
      icon: Heart,
      title: t("medical"),
      phone: t("medicalNumber"),
      color: "#FF3B30",
      badge: "SOS",
    },
    {
      icon: Shield,
      title: t("security"),
      subtitle: t("securityExt"),
      color: "#FF9500",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <PhoneIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <div className="space-y-4">
        {contacts.map((contact, i) => {
          const Icon = contact.icon;
          return (
            <Card key={i} className="ios-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${contact.color}15` }}
                  >
                    <Icon
                      className="h-6 w-6"
                      style={{ color: contact.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">
                        {contact.title}
                      </h3>
                      {contact.badge && (
                        <Badge
                          variant="destructive"
                          className="text-xs h-5 px-1.5"
                        >
                          {contact.badge}
                        </Badge>
                      )}
                    </div>
                    {contact.subtitle && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {contact.subtitle}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      {contact.phone && (
                        <Button
                          asChild
                          size="sm"
                          className="ios-button h-9"
                        >
                          <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                            <PhoneIcon className="h-3.5 w-3.5 mr-1.5" />
                            {t("call")}
                          </a>
                        </Button>
                      )}
                      {contact.email && (
                        <Button
                          asChild
                          size="sm"
                          className="ios-button h-9"
                        >
                          <a href={`mailto:${contact.email}`}>
                            <Mail className="h-3.5 w-3.5 mr-1.5" />
                            {t("sendEmail")}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
