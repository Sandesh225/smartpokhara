"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface WardHeatmapData {
  ward_number: number;
  ward_name?: string;
  total_complaints: number;
  overdue_complaints: number;
  intensity_score?: number; // 0-100
}

interface HeatmapChartProps {
  data: WardHeatmapData[];
  height?: number;
  className?: string;
  onWardClick?: (ward: number) => void;
}

// Generate color based on intensity (Blue scale)
const getIntensityColor = (count: number, max: number) => {
  const intensity = Math.min(Math.max(count / (max || 1), 0), 1);
  if (intensity === 0) return "bg-muted border-border text-muted-foreground";
  if (intensity < 0.2) return "bg-primary/5 border-primary/10 text-primary";
  if (intensity < 0.4) return "bg-primary/20 border-primary/30 text-primary";
  if (intensity < 0.6) return "bg-primary/40 border-primary/50 text-primary-foreground";
  if (intensity < 0.8) return "bg-primary/70 border-primary/80 text-primary-foreground";
  return "bg-primary border-primary text-primary-foreground";
};

export function HeatmapChart({
  data,
  height = 300,
  className,
  onWardClick
}: HeatmapChartProps) {
  // Assuming 33 wards for Pokhara
  const wards = Array.from({ length: 33 }, (_, i) => i + 1);
  const maxCount = Math.max(...data.map(d => d.total_complaints), 1);

  const getWardData = (wardNum: number) => 
    data.find(d => d.ward_number === wardNum) || { 
      ward_number: wardNum, 
      total_complaints: 0, 
      overdue_complaints: 0 
    };

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 gap-2">
        {wards.map((wardNum) => {
          const wardData = getWardData(wardNum);
          const colorClass = getIntensityColor(wardData.total_complaints, maxCount);

          return (
            <TooltipProvider key={wardNum}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onWardClick?.(wardNum)}
                    className={cn(
                      "aspect-square rounded-md border flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-md",
                      colorClass
                    )}
                  >
                    <span className="text-xs font-bold">{wardNum}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p className="font-bold">Ward {wardNum}</p>
                    <p>Total: {wardData.total_complaints}</p>
                    <p className="text-destructive font-semibold">Overdue: {wardData.overdue_complaints}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Low Activity</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-primary/5 border border-border" />
          <div className="w-3 h-3 rounded-sm bg-primary/40 border border-border" />
          <div className="w-3 h-3 rounded-sm bg-primary/70 border border-border" />
          <div className="w-3 h-3 rounded-sm bg-primary border border-border" />
        </div>
        <span>High Activity</span>
      </div>
    </div>
  );
}