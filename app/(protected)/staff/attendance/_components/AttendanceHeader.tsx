import { Briefcase, Clock4 } from "lucide-react";

export function AttendanceHeader({
  stats,
  todayStatus,
}: {
  stats: any;
  todayStatus: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Days Worked */}
      <StatCard
        icon={<Briefcase className="text-primary" />}
        label="Days Worked"
        value={stats?.daysWorked ?? 0}
        subText="Current Month"
      />

      {/* Total Hours */}
      <StatCard
        icon={<Clock4 className="text-secondary" />}
        label="Total Hours"
        value={Math.round(Number(stats?.totalHours ?? 0))}
        subText="Productivity"
      />

      {/* Today Status */}
      <StatCard
        icon={<Clock4 className="text-secondary" />}
        label="Today Status"
        value={todayStatus || "Absent"}
        subText="Live Attendance"
        isStatus
      />

    </div>
  );
}

function StatCard({ icon, label, value, subText, isStatus }: any) {
  return (
    <div className="stone-card p-6 flex items-center gap-5">
      <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
          {label}
        </p>

        <p
          className={`text-2xl font-bold tracking-tighter ${
            isStatus ? "capitalize" : ""
          }`}
        >
          {value}
        </p>

        <p className="text-[10px] text-muted-foreground">
          {subText}
        </p>
      </div>
    </div>
  );
}
