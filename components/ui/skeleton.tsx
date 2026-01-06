"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  circle?: boolean;
  rounded?: "sm" | "md" | "lg" | "xl";
  width?: string;
  height?: string;
}

function Skeleton({
  circle,
  rounded = "md",
  width = "w-full",
  height = "h-4",
  className,
  ...props
}: SkeletonProps) {
  const radius = circle ? "rounded-full" : `rounded-${rounded}`;
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200",
        radius,
        width,
        height,
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
