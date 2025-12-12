"use client";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/tooltip";

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
  if (intensity === 0) return "bg-gray-100 border-gray-200 text-gray-400";
  if (intensity < 0.2) return "bg-blue-50 border-blue-100 text-blue-700";
  if (intensity < 0.4) return "bg-blue-100 border-blue-200 text-blue-800";
  if (intensity < 0.6) return "bg-blue-300 border-blue-400 text-blue-900";
  if (intensity < 0.8) return "bg-blue-500 border-blue-600 text-white";
  return "bg-blue-700 border-blue-800 text-white";
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
                    <p className="text-red-500">Overdue: {wardData.overdue_complaints}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-gray-500">
        <span>Low Activity</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-blue-50" />
          <div className="w-3 h-3 rounded-sm bg-blue-300" />
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <div className="w-3 h-3 rounded-sm bg-blue-700" />
        </div>
        <span>High Activity</span>
      </div>
    </div>
  );
}