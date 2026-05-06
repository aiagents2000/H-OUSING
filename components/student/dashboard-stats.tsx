"use client";

import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}

export function StatCard({ icon: Icon, label, value, sublabel, color = "#007AFF" }: StatCardProps) {
  return (
    <Card className="ios-card hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150">
      {/* Mobile: square, vertical centered layout */}
      <CardContent className="p-4 sm:p-4">
        <div className="flex flex-col items-center justify-center text-center gap-2 aspect-square sm:aspect-auto sm:flex-row sm:text-left sm:items-center sm:gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {sublabel && (
              <p className="text-xs text-muted-foreground truncate">{sublabel}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
