"use client";

import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "input min-h-[120px] resize-y",
            error && "ring-2 ring-accent-error/20 border-accent-error",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-accent-error">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
