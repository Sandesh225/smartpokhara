"use client";
import { Clock } from "lucide-react";
import { getTimeRemaining, isOverdue } from "@/lib/utils/time-helpers";
import { cn } from "@/lib/utils";

interface Props {
  deadline: string;
  className?: string;
}

export function CountdownTimer({ deadline, className }: Props) {
  const overdue = isOverdue(deadline);
  const text = getTimeRemaining(deadline);

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs font-medium",
      overdue ? "text-red-600" : "text-gray-500",
      className
    )}>
      <Clock className="w-3.5 h-3.5" />
      <span>{text}</span>
    </div>
  );
}