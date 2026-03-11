"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  bg?: string;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
  delay?: number;
  variant?: "default" | "compact" | "colorful"; 
}

export function UniversalStatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  trend,
  subtitle,
  href,
  onClick,
  className,
  iconClassName,
  delay = 0,
  variant = "default",
}: StatCardProps) {
  
  const isClickable = !!(href || onClick);

  const CardContentWrapper = (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 group border-border/60",
        variant === "default" ? "bg-card/95 backdrop-blur-sm hover:border-primary/30 shadow-sm hover:shadow-md" : "",
        variant === "compact" ? "bg-card rounded-xl border shadow-sm hover:shadow-md" : "",
        isClickable && "cursor-pointer",
        className
      )}
    >
      <div className={cn(
        "relative z-10",
        variant === "default" ? "p-5 sm:p-6" : "p-5"
      )}>
        <div className="flex justify-between items-start">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "uppercase tracking-wider font-medium mb-1.5 transition-colors text-xs",
              variant === "default" 
                ? "text-muted-foreground group-hover:text-primary" 
                : "text-muted-foreground"
            )}>
              {label}
            </p>

            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-bold text-foreground tracking-tight tabular-nums",
                variant === "default" ? "text-2xl" : "text-xl"
              )}>
                {value}
              </h3>
              {trend && (
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full flex items-center",
                  trend.isPositive ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"
                )}>
                  {typeof trend.value === 'number' && trend.value > 0 ? "+" : ""}{trend.value}{typeof trend.value === 'number' ? '%' : ''}
                </span>
              )}
            </div>

            {subtitle && (
              <p className="text-xs text-muted-foreground/70 mt-1.5 truncate font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {/* Icon */}
          <div
            className={cn(
              "flex items-center justify-center shrink-0 ml-4 transition-all duration-200",
              variant === "default" ? "h-10 w-10 rounded-xl" : "h-9 w-9 rounded-lg",
              bg || "bg-primary/10",
              color || "text-primary",
              variant === "default" && "group-hover:bg-primary/20",
              iconClassName
            )}
          >
            <Icon className={cn(
              "transition-transform duration-200 group-hover:scale-110",
              "h-5 w-5"
            )} strokeWidth={2} />
          </div>
        </div>
      </div>
    </Card>
  );

  const wrapperClasses = cn(
    "animate-fade-in hover:-translate-y-0.5 transition-transform duration-200",
    href && "h-full"
  );

  if (href) {
    return (
      <div className={wrapperClasses} style={{ animationDelay: `${delay * 1000}ms` }}>
        <Link href={href} className="block h-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          {CardContentWrapper}
        </Link>
      </div>
    );
  }

  return (
    <div
      className={wrapperClasses}
      style={{ animationDelay: `${delay * 1000}ms` }}
      onClick={onClick}
    >
      {CardContentWrapper}
    </div>
  );
}
