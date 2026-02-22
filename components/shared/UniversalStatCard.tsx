"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string; // Icon/Text color class (e.g., 'text-primary')
  bg?: string; // Icon background color class (e.g., 'bg-primary/10')
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
        "relative overflow-hidden transition-all duration-500 group border-border/60",
        variant === "default" ? "bg-card/95 backdrop-blur-sm hover:border-primary/40 shadow-inner-sm hover:shadow-inner-lg" : "",
        variant === "compact" ? "bg-card rounded-xl border shadow-sm hover:shadow-md" : "",
        isClickable && "cursor-pointer",
        className
      )}
    >
      {/* Premium Hover Gradient (Default variant only) */}
      {variant === "default" && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary)_0%,transparent_50%)] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
      )}

      <div className={cn(
        "relative z-10",
        variant === "default" ? "p-6" : "p-5"
      )}>
        <div className="flex justify-between items-start">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "uppercase tracking-widest font-bold mb-2 transition-colors",
              variant === "default" 
                ? "text-[10px] text-muted-foreground/80 group-hover:text-primary" 
                : "text-[10px] text-muted-foreground"
            )}>
              {label}
            </p>

            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-black text-foreground tracking-tighter tabular-nums drop-shadow-sm",
                variant === "default" ? "text-3xl" : "text-2xl"
              )}>
                {value}
              </h3>
              {trend && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-inner-sm",
                  trend.isPositive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
                )}>
                  {typeof trend.value === 'number' && trend.value > 0 ? "+" : ""}{trend.value}{typeof trend.value === 'number' ? '%' : ''}
                </span>
              )}
            </div>

            {subtitle && (
              <p className="text-[10px] text-muted-foreground/70 mt-2 truncate font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            className={cn(
              "flex items-center justify-center shrink-0 ml-4 transition-all duration-300 shadow-inner-sm",
              variant === "default" ? "h-12 w-12 rounded-2xl" : "h-10 w-10 rounded-xl",
              bg || "bg-primary/10",
              color || "text-primary",
              variant === "default" && "group-hover:bg-primary/20",
              iconClassName
            )}
          >
            <Icon className={cn(
              "transition-transform duration-300 group-hover:scale-110",
              variant === "default" ? "h-5 w-5" : "h-5 w-5"
            )} strokeWidth={2.5} />
          </motion.div>
        </div>
        
        {/* Pulse dot if no trend */}
        {!trend && variant === "default" && (
           <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-primary/20 group-hover:bg-primary animate-pulse transition-colors" />
        )}
      </div>
    </Card>
  );

  if (href) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
        whileHover={{ y: -4, scale: 1.02 }}
        className="h-full"
      >
        <Link href={href} className="block h-full group focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl">
          {CardContentWrapper}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
    >
      {CardContentWrapper}
    </motion.div>
  );
}
