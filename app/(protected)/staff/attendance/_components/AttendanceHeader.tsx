import { Briefcase, Clock4, Star } from "lucide-react";

export function AttendanceHeader({
  stats,
  todayStatus,
}: {
  stats: any;
  todayStatus: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        icon={<Briefcase className="text-primary" />}
        label="Days Worked"
        value={stats.daysWorked}
        subText="Current Month"
      />
      <StatCard
        icon={<Clock4 className="text-secondary" />}
        label="Total Hours"
        value={Math.round(stats.totalHours)}
        subText="Productivity"
      />
      <StatCard
        icon={<Star className="text-amber-500" />}
        label="Status"
        value={todayStatus.replace("_", " ")}
        subText="Real-time"
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
          className={`text-2xl font-bold tracking-tighter ${isStatus ? "capitalize" : ""}`}
        >
          {value}
        </p>
        <p className="text-[10px] text-muted-foreground">{subText}</p>
      </div>
    </div>
  );
}
