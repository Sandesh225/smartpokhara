import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "md",
  className,
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2
        className={cn(
          "animate-spin text-blue-600",
          sizeClasses[size],
          className
        )}
      />
      {message && (
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}