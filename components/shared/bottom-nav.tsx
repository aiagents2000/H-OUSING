"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquareDot,
  Anchor,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/requests", label: t("requests"), icon: ClipboardList },
    { href: "/chat", label: t("aiAssistant"), icon: MessageSquareDot, isChat: true },
    { href: "/room", label: t("marinaServices"), icon: Anchor },
    { href: "/profile", label: t("profile"), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-border/50 lg:hidden pwa-safe-bottom">
      <div className="flex items-end justify-around px-2 pt-1.5 pb-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/")) ||
            (item.href === "/requests" && pathname.startsWith("/requests"));

          if (item.isChat) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center min-w-[56px]"
              >
                <div
                  className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center -mt-4 shadow-lg transition-all duration-200 active:scale-95",
                    isActive ? "bg-primary/90" : "bg-primary"
                  )}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span
                  className={cn(
                    "text-[10px] mt-0.5 leading-tight font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span
                className={cn(
                  "text-[10px] mt-0.5 leading-tight",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
