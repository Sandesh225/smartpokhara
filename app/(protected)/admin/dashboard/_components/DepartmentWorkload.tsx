import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepartmentWorkload as DeptType } from "@/lib/types/admin";
import { Building2, AlertTriangle, ChevronRight, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Enhanced Admin Workload Component
 * Focused on high-density data and Pokhara-inspired "Stone & Glass" aesthetic.
 */
export function DepartmentWorkload({ data }: { data: DeptType[] }) {
  return (
    <Card className="stone-card border-none transition-all duration-300 hover:elevation-4">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 shadow-sm">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              Workload Analysis
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium ml-12">
              Cross-departmental performance metrics
            </p>
          </div>
          <Badge
            variant="secondary"
            className="glass px-3 py-1 text-xs font-mono font-bold border-primary/10"
          >
            {data.length} UNITS
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {data.map((dept) => {
          const total = dept.active_count + dept.overdue_count;
          const activePct = total > 0 ? (dept.active_count / total) * 100 : 0;
          const overduePct = total > 0 ? (dept.overdue_count / total) * 100 : 0;
          const isCritical = dept.overdue_count > 5; // Admin threshold

          return (
            <div
              key={dept.id}
              className="group relative p-5 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-all duration-300 cursor-pointer"
            >
              {/* Layout: Info Top, Progress Middle, Meta Bottom */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isCritical
                        ? "bg-destructive/10 text-destructive"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {dept.name}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                      ID: {dept.id.toString().slice(0, 8)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-mono font-bold leading-none">
                      {total}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                      Total
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Stacked Progress Bar (Admin Style) */}
              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] font-bold text-primary tracking-wide">
                    ACTIVE: {dept.active_count}
                  </span>
                  {dept.overdue_count > 0 && (
                    <span className="text-[10px] font-bold text-destructive flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> OVERDUE:{" "}
                      {dept.overdue_count}
                    </span>
                  )}
                </div>

                <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex shadow-inner border border-border/50">
                  <div
                    style={{ width: `${activePct}%` }}
                    className="bg-primary transition-all duration-700 ease-in-out relative group/bar"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse opacity-0 group-hover/bar:opacity-100" />
                  </div>
                  <div
                    style={{ width: `${overduePct}%` }}
                    className="bg-destructive transition-all duration-700 ease-in-out relative"
                  >
                    <div className="absolute inset-0 bg-black/10 shadow-[inset_1px_0_4px_rgba(0,0,0,0.1)]" />
                  </div>
                </div>
              </div>

              {/* Quick Admin Footer Info */}
              <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-muted-foreground italic">
                  Last updated: Just now
                </p>
                <button className="text-[10px] font-bold text-primary uppercase hover:underline">
                  View Detail Report
                </button>
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-muted rounded-3xl">
            <Building2 className="w-12 h-12 text-muted/30 mb-4" />
            <p className="text-sm font-bold text-muted-foreground">
              No Units Registered
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}