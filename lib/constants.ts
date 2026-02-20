import { Droplet, Zap, Sparkles, Flame, MoreHorizontal, type LucideIcon } from "lucide-react";

export const BUILDINGS = ["A", "B"] as const;
export type Building = (typeof BUILDINGS)[number];

export const ROOMS_PER_BUILDING = 40;

export function getRoomNumbers(): string[] {
  const rooms: string[] = [];
  for (let i = 1; i <= ROOMS_PER_BUILDING; i++) {
    rooms.push(String(i));
  }
  return rooms;
}

export const REQUEST_CATEGORIES = {
  plumbing: { icon: Droplet, color: "#007AFF", bgColor: "#007AFF15" },
  electrical: { icon: Zap, color: "#FF9500", bgColor: "#FF950015" },
  cleaning: { icon: Sparkles, color: "#34C759", bgColor: "#34C75915" },
  boiler: { icon: Flame, color: "#FF3B30", bgColor: "#FF3B3015" },
  other: { icon: MoreHorizontal, color: "#8E8E93", bgColor: "#8E8E9315" },
} as const;

export type RequestCategory = keyof typeof REQUEST_CATEGORIES;

export const REQUEST_PRIORITIES = {
  low: { color: "#8E8E93", bgColor: "#8E8E9315" },
  medium: { color: "#007AFF", bgColor: "#007AFF15" },
  high: { color: "#FF9500", bgColor: "#FF950015" },
  urgent: { color: "#FF3B30", bgColor: "#FF3B3015", pulse: true },
} as const;

export type RequestPriority = keyof typeof REQUEST_PRIORITIES;

export const REQUEST_STATUSES = {
  open: { color: "#007AFF", bgColor: "#007AFF15" },
  in_progress: { color: "#FF9500", bgColor: "#FF950015" },
  completed: { color: "#34C759", bgColor: "#34C75915" },
  rejected: { color: "#FF3B30", bgColor: "#FF3B3015" },
} as const;

export type RequestStatus = keyof typeof REQUEST_STATUSES;

export const ITEMS_PER_PAGE = 20;
