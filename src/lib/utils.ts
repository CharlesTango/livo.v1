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
  open: "bg-primary/20 text-secondary",
  "in-progress": "bg-primary-yellow/20 text-secondary",
  "pending-review": "bg-accent-success/10 text-accent-success",
  closed: "bg-neutral-medium/20 text-secondary/60",
};

export const priorityColors: Record<string, string> = {
  low: "bg-neutral-medium/20 text-secondary/60",
  medium: "bg-primary/20 text-secondary",
  high: "bg-primary-yellow/20 text-secondary",
  urgent: "bg-accent-error/10 text-accent-error",
};
