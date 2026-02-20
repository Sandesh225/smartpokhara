"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string; // Text color class
  bg?: string; // Background color class for icon or card
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
  href?: string;
  className?: string; // Additional classes
  variant?: "default" | "compact" | "colorful"; // Default = Supervisor style, Compact = Staff style, Colorful = Staff style with full bg?
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
  className,
  variant = "default",
}: StatCardProps) {
  
  const CardContent = (
    <div className={cn(
      "relative overflow-hidden transition-all duration-300 group hover:-translate-y-1",
      variant === "default" ? "stone-card p-6 h-full group-hover:shadow-xl group-hover:scale-[1.02]" : "",
      variant === "compact" ? `bg-card rounded-xl border p-5 shadow-sm hover:shadow-md ${className}` : "",
      className
    )}>
      <div className="flex justify-between items-start">
        {/* Left Side: Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "uppercase tracking-widest font-bold mb-1 truncate",
            variant === "default" ? "text-[10px] text-muted-foreground" : "text-xs font-medium text-muted-foreground"
          )}>
            {label}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <h3 className={cn(
              "font-black text-foreground tracking-tight tabular-nums",
              variant === "default" ? "text-3xl" : "text-2xl"
            )}>
              {value}
            </h3>
            {trend && (
              <span className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center",
                trend.isPositive ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
              )}>
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-xs text-muted-foreground/70 mt-2 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Side: Icon */}
        <div className={cn(
          "flex items-center justify-center shrink-0 ml-4 transition-transform group-hover:rotate-6",
          variant === "default" ? "h-12 w-12 rounded-xl" : "p-2.5 rounded-lg",
          bg || "bg-primary/10",
          color || "text-primary"
        )}>
          <Icon className={cn(
            variant === "default" ? "h-6 w-6" : "w-5 h-5"
          )} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full group focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
