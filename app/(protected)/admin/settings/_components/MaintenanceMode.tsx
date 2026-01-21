// ═══════════════════════════════════════════════════════════
// _components/MaintenanceMode.tsx
// ═══════════════════════════════════════════════════════════

"use client";

import { AlertTriangle, Loader2, Shield, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { updateSystemConfig } from "../actions";
import { cn } from "@/lib/utils";

export default function MaintenanceMode({ enabled }: { enabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(enabled);

  const handleToggle = async () => {
    setLoading(true);
    const newState = !isEnabled;
    setIsEnabled(newState);
    await updateSystemConfig("maintenance_mode", { enabled: newState });
    setLoading(false);
  };

  return (
    <div
      className={cn(
        "stone-card overflow-hidden transition-all duration-300",
        isEnabled && "border-error-red/30"
      )}
    >
      {/* HEADER */}
      <div
        className={cn(
          "p-4 md:p-6 border-b-2 transition-colors",
          isEnabled
            ? "border-error-red/30 bg-error-red/5"
            : "border-warning-amber/30 bg-warning-amber/5"
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-2 rounded-lg flex-shrink-0",
              isEnabled ? "bg-error-red/10" : "bg-warning-amber/10"
            )}
          >
            <AlertTriangle
              className={cn(
                "w-6 h-6 md:w-7 md:h-7",
                isEnabled ? "text-error-red" : "text-warning-amber"
              )}
            />
          </div>
          <div className="flex-1">
            <h3
              className={cn(
                "font-black text-base md:text-lg mb-1",
                isEnabled ? "text-error-red" : "text-warning-amber"
              )}
            >
              Maintenance Mode
            </h3>
            <p
              className={cn(
                "text-xs md:text-sm font-medium",
                isEnabled ? "text-error-red/80" : "text-warning-amber/80"
              )}
            >
              {isEnabled
                ? "🔴 System is currently LOCKED. Only admins can access."
                : "✅ System is running normally. Citizens can access all features."}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 md:p-6">
        <div
          className={cn(
            "p-4 rounded-lg border-2 mb-4",
            isEnabled
              ? "bg-error-red/5 border-error-red/20"
              : "bg-info-blue/5 border-info-blue/20"
          )}
        >
          <p className="text-xs md:text-sm text-foreground font-medium">
            {isEnabled
              ? "When maintenance mode is active, the Citizen Portal displays a maintenance page. Only admin users can access the system. This is useful during system updates or critical fixes."
              : "Activating maintenance mode will immediately lock the Citizen Portal. Public users will see a maintenance page with information about when the system will be available again."}
          </p>
        </div>

        {/* TOGGLE */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border-2 border-border">
          <div className="flex items-center gap-3">
            {isEnabled ? (
              <Shield className="w-5 h-5 text-error-red" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-success-green" />
            )}
            <div>
              <p className="text-sm font-bold text-foreground">System Status</p>
              <p className="text-xs text-muted-foreground">
                Currently {isEnabled ? "locked" : "operational"}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle}
            disabled={loading}
            className="relative inline-flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div
              className={cn(
                "w-14 h-7 rounded-full transition-all duration-300",
                isEnabled
                  ? "bg-error-red"
                  : "bg-muted-foreground/30 group-hover:bg-muted-foreground/40"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-all duration-300 shadow-md",
                  isEnabled ? "translate-x-7" : "translate-x-0"
                )}
              ></div>
            </div>
            <span
              className={cn(
                "ml-3 text-sm font-bold",
                isEnabled ? "text-error-red" : "text-muted-foreground"
              )}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEnabled ? (
                "Enabled"
              ) : (
                "Disabled"
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
