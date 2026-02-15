"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { useAppLocale } from "@/lib/i18n";
import {
  REQUEST_CATEGORIES,
  REQUEST_STATUSES,
  REQUEST_PRIORITIES,
  type RequestCategory,
  type RequestStatus,
  type RequestPriority,
} from "@/lib/constants";

interface RequestCardProps {
  request: {
    _id: string;
    category: RequestCategory;
    priority: RequestPriority;
    status: RequestStatus;
    description: string;
    createdAt: number;
    roomNumber: string;
    building: string;
  };
  onClick?: () => void;
}

export function RequestCard({ request, onClick }: RequestCardProps) {
  const t = useTranslations();
  const { locale } = useAppLocale();
  const dateLocale = locale === "it" ? it : enUS;

  const cat = REQUEST_CATEGORIES[request.category];
  const Icon = cat.icon;
  const statusConfig = REQUEST_STATUSES[request.status];
  const priorityConfig = REQUEST_PRIORITIES[request.priority];

  return (
    <Card
      className="ios-card cursor-pointer active:scale-[0.98] transition-transform duration-150"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      aria-label={`${t(`categories.${request.category}`)} request - ${t(`statuses.${request.status}`)}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: cat.bgColor }}
            >
              <Icon className="h-4 w-4" style={{ color: cat.color }} />
            </div>
            <span className="text-sm font-medium">
              {t(`categories.${request.category}`)}
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-xs border-0 font-medium"
            style={{
              backgroundColor: priorityConfig.bgColor,
              color: priorityConfig.color,
            }}
          >
            {t(`priorities.${request.priority}`)}
          </Badge>
        </div>

        <p className="text-sm text-foreground mb-3 line-clamp-2">
          {request.description}
        </p>

        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="text-xs border-0 font-medium"
            style={{
              backgroundColor: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            {t(`statuses.${request.status}`)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(request.createdAt), {
              addSuffix: true,
              locale: dateLocale,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
