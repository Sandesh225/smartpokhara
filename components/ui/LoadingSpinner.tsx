"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  variant?: "spinner" | "dots" | "pulse" | "ring" | "loader2";
  color?: string;
  thickness?: number;
  speed?: number;
  label?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "md",
  variant = "spinner",
  color,
  thickness = 3,
  speed = 1,
  label = "Loading...",
  message,
  fullScreen = false,
  className,
  ...props
}: LoadingSpinnerProps) {
  const sizeMap = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const sizeClass = typeof size === "number" ? "" : sizeMap[size] || sizeMap.md;
  const customSize =
    typeof size === "number" ? { width: size, height: size } : undefined;
  const colorClass = color || "text-primary";

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)} {...props}>
      {variant === "loader2" ? (
        <Loader2 className={cn("animate-spin", colorClass, sizeClass)} style={customSize} />
      ) : variant === "spinner" ? (
        <svg
          className={cn("animate-spin", colorClass, sizeClass)}
          style={{
            ...customSize,
            animationDuration: `${1 / speed}s`,
          }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={thickness}
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : variant === "ring" ? (
        <div
          className={cn(
            "animate-spin rounded-full border-t-transparent",
            colorClass,
            sizeClass
          )}
          style={{
            ...customSize,
            borderWidth: thickness,
            borderColor: "currentColor",
            borderTopColor: "transparent",
            animationDuration: `${1 / speed}s`,
          }}
        />
      ) : variant === "dots" ? (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn("rounded-full bg-current", colorClass)}
              style={{
                width: typeof size === "number" ? size / 4 : (size === "xs" ? 3 : 6),
                height: typeof size === "number" ? size / 4 : (size === "xs" ? 3 : 6),
                animation: `pulse ${1 / speed}s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "rounded-full animate-ping bg-current opacity-75",
            colorClass,
            sizeClass
          )}
          style={customSize}
        />
      )}
      {(message || label) && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {message || label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

