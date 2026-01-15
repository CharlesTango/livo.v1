import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: number | Date): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: number | Date): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const matterStatusColors: Record<string, string> = {
  open: "bg-accent text-primary",
  "in-progress": "bg-blue-100 text-blue-800",
  "pending-review": "bg-yellow-100 text-yellow-800",
  closed: "bg-secondary text-primary/60",
};

export const priorityColors: Record<string, string> = {
  low: "bg-secondary text-primary/60",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};
