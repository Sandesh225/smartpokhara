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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Progress</h3>
      <div className="space-y-6 relative pl-2">
        <div className="absolute left-[15px] top-2 bottom-4 w-0.5 bg-gray-100" />
        
        {steps.map((step, i) => (
          <div key={step.label} className="relative flex items-center gap-4">
            <div className={cn(
              "relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2",
              step.done 
                ? "bg-green-100 border-green-500 text-green-600" 
                : "bg-white border-gray-300 text-gray-300"
            )}>
              {step.done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </div>
            
            <div>
              <p className={cn("text-sm font-medium", step.done ? "text-gray-900" : "text-gray-400")}>
                {step.label}
              </p>
              {step.date && (
                <p className="text-xs text-gray-500 mt-0.5">
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