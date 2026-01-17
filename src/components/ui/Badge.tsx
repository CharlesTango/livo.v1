"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-neutral-medium/20 text-secondary/70",
      success: "bg-accent-success/10 text-accent-success",
      warning: "bg-primary-yellow/20 text-secondary",
      error: "bg-accent-error/10 text-accent-error",
      info: "bg-primary/20 text-secondary",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-4 py-1.5 rounded-pill text-xs font-body font-bold",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
