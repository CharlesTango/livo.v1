"use client";

import { cn } from "@/lib/utils";
import { Fragment, ReactNode } from "react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-secondary/40 backdrop-blur-md z-40"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={cn(
            "bg-white rounded-l shadow-subtle w-full max-w-lg max-h-[90vh] overflow-auto",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-neutral-light">
            <h2 className="text-2xl font-heading font-extrabold text-secondary">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
          {/* Content */}
          <div className="p-8">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}
