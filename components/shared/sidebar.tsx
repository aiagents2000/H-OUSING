"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  DoorOpen,
  ClipboardList,
  HelpCircle,
  FileText,
  Phone,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface SidebarProps {
  role: "student" | "staff";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const stats = useQuery(api.maintenanceRequests.getRequestStats);
  const [infoOpen, setInfoOpen] = useState(false);

  const studentNav = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/profile", label: t("profile"), icon: User },
    { href: "/room", label: t("myRoom"), icon: DoorOpen },
    {
      href: "/requests",
      label: t("requests"),
      icon: ClipboardList,
      badge: stats && "active" in stats ? stats.active : undefined,
    },
  ];

  const studentInfoNav = [
    { href: "/info/faq", label: t("faq"), icon: HelpCircle },
    { href: "/info/rules", label: t("rules"), icon: FileText },
    { href: "/info/contacts", label: t("contacts"), icon: Phone },
  ];

  const staffNav = [
    { href: "/staff/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    {
      href: "/staff/requests",
      label: t("requests"),
      icon: ClipboardList,
      badge: stats && "open" in stats ? stats.open : undefined,
    },
    { href: "/staff/analytics", label: t("analytics"), icon: BarChart3 },
  ];

  const navItems = role === "staff" ? staffNav : studentNav;

  return (
    <nav className="h-full py-4 px-3 space-y-1" role="navigation" aria-label="Main navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 touch-target",
              isActive
                ? "bg-primary text-white"
                : "text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <Badge
                variant={isActive ? "secondary" : "default"}
                className="h-5 min-w-5 flex items-center justify-center text-xs px-1.5"
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}

      {role === "student" && (
        <div>
          <button
            onClick={() => setInfoOpen(!infoOpen)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-foreground hover:bg-accent transition-all duration-150 touch-target"
          >
            <HelpCircle className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left">{t("info")}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                infoOpen && "rotate-180"
              )}
            />
          </button>
          {infoOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {studentInfoNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                      isActive
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
