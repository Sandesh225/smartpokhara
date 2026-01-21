// ==================== DEPARTMENT PERFORMANCE COMPONENT ====================
// app/admin/departments/_components/DepartmentPerformance.tsx

import { TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface Props {
  total: number;
  resolved: number;
  open: number;
  overdue: number;
}

export default function DepartmentPerformance({
  total,
  resolved,
  open,
  overdue,
}: Props) {
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="glass rounded-2xl p-6 border border-border elevation-1">
      <h4 className="font-bold text-xl mb-6 text-primary flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Performance Metrics
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-xl bg-gradient-to-br from-[rgb(var(--success-green))]/10 to-[rgb(var(--success-green))]/5 border-2 border-[rgb(var(--success-green))]/20 hover:border-[rgb(var(--success-green))]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle2 className="w-8 h-8 text-[rgb(var(--success-green))]" />
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground tabular-nums">
                {resolutionRate}%
              </div>
            </div>
          </div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">
            Resolution Rate
          </p>
          <p className="text-xs text-[rgb(var(--success-green))] font-medium">
            {resolved} cases resolved
          </p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-[rgb(var(--info-blue))]/10 to-[rgb(var(--info-blue))]/5 border-2 border-[rgb(var(--info-blue))]/20 hover:border-[rgb(var(--info-blue))]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-[rgb(var(--info-blue))]" />
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground tabular-nums">
                {open}
              </div>
            </div>
          </div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">
            Active Cases
          </p>
          <p className="text-xs text-[rgb(var(--info-blue))] font-medium">
            Currently in progress
          </p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-[rgb(var(--error-red))]/10 to-[rgb(var(--error-red))]/5 border-2 border-[rgb(var(--error-red))]/20 hover:border-[rgb(var(--error-red))]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-8 h-8 text-[rgb(var(--error-red))]" />
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground tabular-nums">
                {overdue}
              </div>
            </div>
          </div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">
            SLA Breaches
          </p>
          <p className="text-xs text-[rgb(var(--error-red))] font-medium">
            Requires attention
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold text-foreground">
            Overall Efficiency
          </span>
          <span className="text-primary font-bold tabular-nums text-lg">
            {resolutionRate}%
          </span>
        </div>
        <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700 ease-out shadow-lg"
            style={{ width: `${resolutionRate}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
