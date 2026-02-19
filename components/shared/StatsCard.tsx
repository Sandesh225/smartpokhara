"use client";

import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    positive?: boolean;
  };
  delay?: number;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  delay = 0,
  onClick,
  className,
  iconClassName,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Card
        className={cn(
          "surface-elevated border-2 border-border hover:border-primary/40 transition-all duration-300 overflow-hidden relative shadow-sm hover:shadow-xl",
          onClick && "cursor-pointer",
          className
        )}
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={cn(
                "h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors",
                iconClassName
              )}
            >
              <Icon className="w-6 h-6 text-primary" strokeWidth={2.5} />
            </motion.div>
            {trend ? (
              <span
                className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-full",
                  trend.positive
                    ? "bg-success/15 text-success"
                    : "bg-destructive/15 text-destructive"
                )}
              >
                {trend.value}
              </span>
            ) : (
              <div className="h-2 w-2 rounded-full bg-primary/20 group-hover:bg-primary animate-pulse" />
            )}
          </div>
          <p className="stat-label mb-2">{label}</p>
          <p className="stat-value text-foreground">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
