"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface WardStats {
  ward_number: number;
  complaint_count: number;
}

export function WardHeatmap({ data }: { data: WardStats[] }) {
  // Pokhara's 33 administrative wards
  const wards = Array.from({ length: 33 }, (_, i) => {
    const wardNum = i + 1;
    const stats = data.find((d) => d.ward_number === wardNum);
    return {
      ward: wardNum,
      count: stats?.complaint_count || 0,
    };
  });

  const maxCount = Math.max(...wards.map((w) => w.count), 1);

  // Intensity logic using Machhapuchhre Modern Design System Variables
  const getIntensityStyles = (count: number) => {
    const ratio = count / maxCount;
    if (count === 0)
      return "bg-muted text-muted-foreground/40 border-transparent";

    // Gradient scale from Lakeside Teal to Phewa Deep Blue
    if (ratio < 0.25)
      return "bg-secondary/20 text-secondary border-secondary/20 hover:bg-secondary/30";
    if (ratio < 0.5)
      return "bg-secondary/50 text-white border-secondary/30 hover:bg-secondary/60";
    if (ratio < 0.75)
      return "bg-primary/70 text-white border-primary/20 hover:bg-primary/80";
    return "bg-primary text-white border-primary/40 shadow-sm ring-1 ring-primary/20";
  };

  return (
    <Card className="stone-card border-none  transition-all duration-500 hover:elevation-3">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-secondary/10 shadow-sm">
                <Map className="w-5 h-5 text-secondary" />
              </div>
              Geographic Intensity
            </CardTitle>
            <p className="text-xs font-medium text-muted-foreground ml-12">
              Distribution across Pokhara Metropolitan City
            </p>
          </div>

          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="glass-strong max-w-[200px]">
                <p className="text-[10px] leading-tight font-medium">
                  Wards are shaded based on relative complaint volume. Darker
                  blue indicates higher activity.
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent>
        {/* Responsive Grid representing the city wards */}
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 gap-2.5">
          <TooltipProvider delayDuration={0}>
            {wards.map((w) => (
              <UITooltip key={w.ward}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "aspect-square rounded-xl flex items-center justify-center text-[10px] font-mono font-bold cursor-pointer transition-all duration-300 border-2",
                      "hover:scale-110 hover:elevation-4 active:scale-95",
                      getIntensityStyles(w.count)
                    )}
                  >
                    {w.ward}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="glass-strong border-white/20 p-3 elevation-5"
                >
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Ward Unit
                    </p>
                    <p className="text-lg font-mono font-bold text-primary leading-none">
                      #{w.ward.toString().padStart(2, "0")}
                    </p>
                    <div className="h-px bg-border w-full my-2" />
                    <p className="text-[10px] font-medium text-foreground">
                      Total Complaints:{" "}
                      <span className="font-bold text-primary">{w.count}</span>
                    </p>
                  </div>
                </TooltipContent>
              </UITooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Legend - Administrative Style */}
        <div className="flex flex-wrap items-center gap-6 mt-8 py-3 px-4 rounded-2xl bg-muted/30 border border-border/40">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-auto">
            Activity Legend
          </span>
          <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md bg-muted border border-border"></div>{" "}
              Empty
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md bg-secondary/30 border border-secondary/20"></div>{" "}
              Low
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md bg-secondary/60 border border-secondary/30"></div>{" "}
              Mid
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md bg-primary border border-primary/40 shadow-sm"></div>{" "}
              Peak
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
