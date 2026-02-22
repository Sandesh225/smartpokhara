// ═══════════════════════════════════════════════════════════
// TASK STATUS UPDATER
// ═══════════════════════════════════════════════════════════

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskStatusUpdater({
  status,
  onUpdate,
}: {
  status: string;
  onUpdate: (s: string) => void;
}) {
  const steps = ["not_started", "in_progress", "completed"];
  const currentIdx = steps.indexOf(status);

  return (
    <div className="stone-card p-4 md:p-6">
      <h3 className="font-bold text-sm md:text-base mb-4">Task Progress</h3>

      {/* PROGRESS INDICATOR */}
      <div className="flex items-center justify-between relative mb-6">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-muted -translate-y-1/2" />
        {steps.map((step, idx) => (
          <div
            key={step}
            className="z-10 flex flex-col items-center bg-card px-2"
          >
            <div
              className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center transition-all",
                idx <= currentIdx
                  ? "bg-primary border-primary"
                  : "bg-card border-border"
              )}
            >
              {idx < currentIdx && (
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              )}
              {idx === currentIdx && (
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-primary-foreground" />
              )}
            </div>
            <span className="text-xs md:text-xs mt-2 capitalize font-medium text-center whitespace-nowrap">
              {step.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>

      {/* ACTION BUTTON */}
      <div className="space-y-2">
        {status !== "completed" && (
          <Button
            className="w-full"
            onClick={() => onUpdate(steps[currentIdx + 1])}
            size="lg"
          >
            Move to {steps[currentIdx + 1]?.replace("_", " ")}
          </Button>
        )}
        {status === "completed" && (
          <Badge className="w-full justify-center bg-success-green py-3 text-sm">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Task Completed
          </Badge>
        )}
      </div>
    </div>
  );
}
