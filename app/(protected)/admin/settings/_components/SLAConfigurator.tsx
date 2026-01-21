// ═══════════════════════════════════════════════════════════
// _components/SLAConfigurator.tsx
// ═══════════════════════════════════════════════════════════

"use client";

import { Clock, AlertCircle, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SLAConfigurator() {
  const [values, setValues] = useState({
    critical: 24,
    high: 48,
    medium: 72,
    low: 120,
  });

  const priorities = [
    {
      level: "Critical",
      key: "critical",
      color: "border-error-red/30 bg-error-red/10 text-error-red",
      default: 24,
    },
    {
      level: "High",
      key: "high",
      color: "border-warning-amber/30 bg-warning-amber/10 text-warning-amber",
      default: 48,
    },
    {
      level: "Medium",
      key: "medium",
      color: "border-info-blue/30 bg-info-blue/10 text-info-blue",
      default: 72,
    },
    {
      level: "Low",
      key: "low",
      color: "border-muted-foreground/30 bg-muted text-muted-foreground",
      default: 120,
    },
  ];

  return (
    <div className="stone-card overflow-hidden">
      {/* HEADER */}
      <div className="p-4 md:p-6 border-b-2 border-border bg-muted/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-black text-base md:text-lg text-foreground">
            SLA Configuration
          </h3>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground font-medium">
          Set default resolution timeframes (in hours) based on priority
        </p>
      </div>

      {/* CONTENT */}
      <div className="p-4 md:p-6 space-y-6 md:space-y-8">
        {priorities.map((p) => (
          <div key={p.level} className="space-y-3">
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider",
                  p.color
                )}
              >
                {p.level}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={values[p.key as keyof typeof values]}
                  onChange={(e) =>
                    setValues({ ...values, [p.key]: parseInt(e.target.value) })
                  }
                  className="w-20 px-3 py-1.5 text-right border-2 border-border rounded-lg font-mono text-sm font-bold bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  min="1"
                  max="168"
                />
                <span className="text-xs text-muted-foreground font-bold">
                  hours
                </span>
              </div>
            </div>

            <div className="relative">
              <input
                type="range"
                min="1"
                max="168"
                value={values[p.key as keyof typeof values]}
                onChange={(e) =>
                  setValues({ ...values, [p.key]: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, rgb(var(--primary)) 0%, rgb(var(--primary)) ${(values[p.key as keyof typeof values] / 168) * 100}%, rgb(var(--muted)) ${(values[p.key as keyof typeof values] / 168) * 100}%, rgb(var(--muted)) 100%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-medium">
                <span>1h</span>
                <span>24h</span>
                <span>48h</span>
                <span>72h</span>
                <span>1 Week</span>
              </div>
            </div>
          </div>
        ))}

        {/* WARNING */}
        <div className="p-4 bg-warning-amber/5 border-2 border-warning-amber/20 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-warning-amber flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-foreground font-medium">
            <strong className="text-warning-amber">Important:</strong> Changing
            these values will only affect new complaints. Existing SLA timers
            will remain unchanged.
          </p>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end pt-4 border-t-2 border-border">
          <Button className="gap-2 font-bold">
            <Save className="w-4 h-4" />
            Save SLA Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
