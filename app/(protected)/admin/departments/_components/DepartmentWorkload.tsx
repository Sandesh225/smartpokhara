// ==================== DEPARTMENT WORKLOAD COMPONENT ====================
// app/admin/departments/_components/DepartmentWorkload.tsx

import { BarChart3 } from "lucide-react";

interface WorkloadData {
  date: string;
  count: number;
}

export default function DepartmentWorkload({ data }: { data: WorkloadData[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="glass rounded-2xl p-6 border border-border elevation-1 h-full flex flex-col">
      <h4 className="font-bold text-foreground mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-secondary" />
        Weekly Workload
      </h4>

      <div className="flex items-end justify-between h-48 gap-3 flex-1">
        {data.map((item, i) => {
          const height = (item.count / maxCount) * 100;
          const isToday = i === data.length - 1;

          return (
            <div
              key={item.date}
              className="flex-1 flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="relative w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t-xl transition-all duration-500 ${
                    isToday
                      ? "bg-gradient-to-t from-primary to-secondary shadow-xl"
                      : "bg-muted group-hover:bg-primary/50"
                  }`}
                  style={{ height: `${height}%`, minHeight: "8px" }}
                >
                  {item.count > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="px-2 py-1 bg-foreground text-background text-xs font-bold rounded shadow-lg">
                        {item.count}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <span
                className={`text-xs font-mono font-semibold transition-colors ${
                  isToday
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary"
                }`}
              >
                {item.date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
