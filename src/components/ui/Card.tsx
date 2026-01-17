"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-card shadow-subtle p-8 border-none",
          hoverable && "hover:-translate-y-1 transition-all duration-200 cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mb-4", className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("text-2xl font-heading font-extrabold text-secondary", className)}
        {...props}
      />
    );
  }
);

CardTitle.displayName = "CardTitle";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-secondary/70 font-body", className)}
        {...props}
      />
    );
  }
);

CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
