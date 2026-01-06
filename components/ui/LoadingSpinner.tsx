"use client";

import * as React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | number; // px size or preset
  color?: string; // Tailwind color or hex
  thickness?: number; // stroke width
  speed?: number; // rotations per second
  label?: string; // accessible label
}

export function LoadingSpinner({
  size = "md",
  color = "text-blue-600",
  thickness = 4,
  speed = 1,
  label = "Loading...",
}: LoadingSpinnerProps) {
  // Map preset sizes to Tailwind classes
  const sizeClasses: Record<string, string> = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const spinnerSize =
    typeof size === "number"
      ? `${size}px`
      : sizeClasses[size] || sizeClasses.md;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="flex items-center justify-center"
    >
      <svg
        className={`animate-spin ${color}`}
        style={{
          width: spinnerSize,
          height: spinnerSize,
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
    </div>
  );
}
