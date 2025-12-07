// components/ui/skeleton.tsx
import * as React from "react";
import { cn } from "@/lib/utils"; // Assuming you have a utility function for Tailwind class merging

/**
 * A reusable component to display a placeholder for content being loaded.
 * It mimics the shape of the final content with a pulsating animation.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200", // Base styling: rounded corners, gray color, and pulse animation
        className // Allows overriding or extending styles via props
      )}
      {...props}
    />
  );
}

export { Skeleton };