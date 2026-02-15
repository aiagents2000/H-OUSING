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
    <Card className="ios-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
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
