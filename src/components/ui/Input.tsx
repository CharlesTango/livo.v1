"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "input",
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

Input.displayName = "Input";

export { Input };
