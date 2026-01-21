// ═══════════════════════════════════════════════════════════
// SKELETON COMPONENT - Enhanced with Design System
// ═══════════════════════════════════════════════════════════

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  circle?: boolean;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl";
  width?: string;
  height?: string;
  variant?: "default" | "shimmer" | "pulse";
}

function Skeleton({
  circle,
  rounded = "md",
  width,
  height,
  variant = "shimmer",
  className,
  ...props
}: SkeletonProps) {
  const radiusMap = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
  };

  const radius = circle ? "rounded-full" : radiusMap[rounded];

  const variantClasses = {
    default: "bg-muted",
    pulse: "animate-pulse bg-muted",
    shimmer:
      "relative overflow-hidden bg-muted before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading..."
      className={cn(variantClasses[variant], radius, width, height, className)}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Shimmer animation for CSS
const skeletonStyles = `
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;

export { Skeleton, skeletonStyles };
