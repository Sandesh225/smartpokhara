// src/components/ui/SectionHeader.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center" | "right";
}

export const SectionHeader = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  className,
  align = "center",
}: SectionHeaderProps) => {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div className={cn("flex flex-col", alignmentClasses[align], className)}>
      {badge && (
        <span className="inline-flex items-center gap-2 text-primary dark:text-primary/90 font-bold tracking-wider uppercase text-xs sm:text-sm mb-3 sm:mb-4 px-4 py-1.5 bg-primary/10 dark:bg-primary/20 rounded-full">
          {BadgeIcon && <BadgeIcon className="w-4 h-4" />}
          {badge}
        </span>
      )}

      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground dark:text-foreground/95 mb-4 sm:mb-6 px-4 max-w-4xl">
        {title}
      </h2>

      {description && (
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground dark:text-muted-foreground/90 max-w-3xl px-4">
          {description}
        </p>
      )}
    </div>
  );
};