"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataCardProps {
  title: string;
  titleIcon?: LucideIcon;
  description?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
  delay?: number;
}

export function DataCard({
  title,
  titleIcon: TitleIcon,
  description,
  headerAction,
  footer,
  children,
  className,
  contentClassName,
  noPadding = false,
  delay = 0,
}: DataCardProps) {
  return (
    <div
      className={cn("bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-fade-in", className)}
      style={{ animationDelay: `${delay * 1000}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
        <div className="flex items-center gap-3">
          {TitleIcon && (
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TitleIcon className="w-5 h-5 text-primary" />
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground font-medium mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
        {headerAction && (
          <div className="shrink-0">{headerAction}</div>
        )}
      </div>

      {/* Content */}
      <div className={cn(noPadding ? "" : "p-5 sm:p-6", contentClassName)}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-border p-4 bg-muted/30">
          {footer}
        </div>
      )}
    </div>
  );
}
