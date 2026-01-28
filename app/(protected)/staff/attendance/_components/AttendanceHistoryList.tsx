import { CalendarDays, MapPinned, Timer } from "lucide-react";
import { format } from "date-fns";

export function AttendanceHistoryList({ logs }: { logs: any[] }) {
  if (logs.length === 0) {
    return (
      <div className="stone-card p-12 text-center text-muted-foreground">
        No attendance records found for this period.
      </div>
    );
  }

  return (
    <div className="stone-card overflow-hidden">
      <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center gap-2">
        <CalendarDays size={18} className="text-primary" />
        <h3 className="font-bold text-sm uppercase tracking-wider">
          Recent Logs
        </h3>
      </div>
      <div className="divide-y divide-border/60">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-6 hover:bg-muted/10 transition-colors flex flex-wrap items-center justify-between gap-4"
          >
            <div className="min-w-[120px]">
              <p className="font-bold text-lg">
                {format(new Date(log.date), "MMM dd")}
              </p>
              <p className="text-xs text-muted-foreground uppercase">
                {format(new Date(log.date), "eeee")}
              </p>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  In
                </p>
                <p className="font-mono text-sm">
                  {log.check_in_time
                    ? format(new Date(log.check_in_time), "HH:mm")
                    : "--:--"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Out
                </p>
                <p className="font-mono text-sm">
                  {log.check_out_time
                    ? format(new Date(log.check_out_time), "HH:mm")
                    : "--:--"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
              <Timer size={14} className="text-primary" />
              <p className="font-bold text-sm text-primary">
                {log.total_hours || 0} hrs
              </p>
            </div>

            <div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  log.status === "late"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {log.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
