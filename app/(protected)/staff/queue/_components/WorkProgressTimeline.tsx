import { CheckCircle2, Circle, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TimelineProps {
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export function WorkProgressTimeline({ created_at, started_at, completed_at }: TimelineProps) {
  const steps = [
    { label: "Assigned", date: created_at, done: true },
    { label: "Started", date: started_at, done: !!started_at },
    { label: "Completed", date: completed_at, done: !!completed_at },
  ];

  return (
    <div className="bg-card rounded-xl shadow-xs border border-border p-5">
      <h3 className="text-eyebrow text-muted-foreground mb-4">Progress</h3>
      <div className="space-y-6 relative pl-2">
        <div className="absolute left-[15px] top-2 bottom-4 w-0.5 bg-border" />
        
        {steps.map((step, i) => (
          <div key={step.label} className="relative flex items-center gap-4">
            <div className={cn(
              "relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2",
              step.done 
                ? "bg-primary/10 border-primary text-primary" 
                : "bg-card border-border text-muted-foreground"
            )}>
              {step.done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </div>
            
            <div>
              <p className={cn("text-sm transition-colors", step.done ? "text-foreground font-black tracking-tight" : "text-muted-foreground font-medium")}>
                {step.label}
              </p>
              {step.date && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(step.date), "MMM d, h:mm a")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}