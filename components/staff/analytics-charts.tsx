"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { REQUEST_STATUSES, REQUEST_CATEGORIES, REQUEST_PRIORITIES } from "@/lib/constants";
import { useState } from "react";
import { CardSkeleton } from "@/components/shared/loading-states";

function ChartLegend({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
      {data.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">
            {entry.name}: <span className="font-semibold text-foreground">{entry.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsCharts() {
  const t = useTranslations();
  const [buildingFilter, setBuildingFilter] = useState<"A" | "B" | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const data = useQuery(api.maintenanceRequests.getAnalyticsData, {
    building: buildingFilter === "all" ? undefined : buildingFilter,
    category: categoryFilter === "all" ? undefined : (categoryFilter as "plumbing" | "electrical" | "cleaning" | "other"),
  });

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const statusData = Object.entries(data.byStatus).map(([key, value]) => ({
    name: t(`statuses.${key}`),
    value,
    color: REQUEST_STATUSES[key as keyof typeof REQUEST_STATUSES].color,
  }));

  const categoryData = Object.entries(data.byCategory).map(([key, value]) => ({
    name: t(`categories.${key}`),
    value,
    color: REQUEST_CATEGORIES[key as keyof typeof REQUEST_CATEGORIES].color,
  }));

  const buildingData = [
    { name: `${t("common.building")} A`, value: data.byBuilding.A, color: "#007AFF" },
    { name: `${t("common.building")} B`, value: data.byBuilding.B, color: "#5856D6" },
  ];

  const priorityData = Object.entries(data.byPriority).map(([key, value]) => ({
    name: t(`priorities.${key}`),
    value,
    color: REQUEST_PRIORITIES[key as keyof typeof REQUEST_PRIORITIES].color,
  }));

  const avgHours = Math.round(data.avgResolutionMs / (1000 * 60 * 60));

  // Filter out zero values for pie charts to avoid clutter
  const statusDataFiltered = statusData.filter((d) => d.value > 0);
  const priorityDataFiltered = priorityData.filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={buildingFilter} onValueChange={(v) => setBuildingFilter(v as "A" | "B" | "all")}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder={t("common.building")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="A">{t("common.building")} A</SelectItem>
            <SelectItem value="B">{t("common.building")} B</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder={t("common.category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {Object.keys(REQUEST_CATEGORIES).map((c) => (
              <SelectItem key={c} value={c}>{t(`categories.${c}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="ios-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t("analytics.totalRequests")}</p>
            <p className="text-3xl font-bold">{data.total}</p>
          </CardContent>
        </Card>
        <Card className="ios-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t("analytics.avgResolution")}</p>
            <p className="text-3xl font-bold">{avgHours}<span className="text-sm font-normal ml-1">{t("analytics.hours")}</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Status - Pie */}
        <Card className="ios-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("analytics.byStatus")}</CardTitle>
          </CardHeader>
          <CardContent>
            {statusDataFiltered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t("common.noResults")}</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={statusDataFiltered}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={70}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {statusDataFiltered.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #E5E5EA",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <ChartLegend data={statusData} />
              </>
            )}
          </CardContent>
        </Card>

        {/* By Category - Bar */}
        <Card className="ios-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("analytics.byCategory")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} margin={{ bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E5E5EA",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By Building - Bar */}
        <Card className="ios-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("analytics.byBuilding")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={buildingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E5E5EA",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                  {buildingData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By Priority - Pie */}
        <Card className="ios-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("analytics.byPriority")}</CardTitle>
          </CardHeader>
          <CardContent>
            {priorityDataFiltered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t("common.noResults")}</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={priorityDataFiltered}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={70}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {priorityDataFiltered.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #E5E5EA",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <ChartLegend data={priorityData} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend */}
      {data.trend.length > 0 && (
        <Card className="ios-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("analytics.trend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E5E5EA",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#007AFF"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#007AFF" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
