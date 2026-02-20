import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  backHref?: string;
  metadata?: React.ReactNode;
  sticky?: boolean;
  variant?: "default" | "glass" | "compact";
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  backHref,
  metadata,
  sticky,
  variant = "default",
  className,
  containerClassName,
  children,
}: PageHeaderProps) {
  const isGlass = variant === "glass";
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "w-full transition-all duration-300",
        sticky && "sticky top-0 z-40 backdrop-blur-xl",
        isGlass ? "glass border-b" : "bg-card border rounded-2xl shadow-sm",
        isCompact ? "p-4" : "p-6 sm:p-8",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6",
          containerClassName
        )}
      >
        <div className="flex items-start gap-3 sm:gap-5 min-w-0 flex-1">
          {backHref && (
            <Link
              href={backHref}
              className="shrink-0 p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-muted/20 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {badge && (
                <div className="shrink-0">
                  {typeof badge === "string" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {badge}
                    </span>
                  ) : (
                    badge
                  )}
                </div>
              )}
              <h1
                className={cn(
                  "font-black tracking-tight text-foreground truncate",
                  isCompact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"
                )}
              >
                {title}
              </h1>
            </div>

            {description && (
              <div
                className={cn(
                  "text-muted-foreground max-w-2xl leading-relaxed",
                  isCompact ? "text-xs" : "text-sm"
                )}
              >
                {description}
              </div>
            )}

            {metadata && (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {metadata}
              </div>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
