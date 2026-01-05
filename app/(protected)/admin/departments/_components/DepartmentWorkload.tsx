export default function DepartmentWorkload() {
  return (
    <div className="stone-panel p-6 h-full">
      <h4 className="font-bold text-foreground mb-6">Current Workload</h4>
      <div className="flex items-end justify-between h-32 gap-2">
        {/* Mock Bars */}
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => {
          const height = [40, 70, 50, 85, 60][i];
          return (
            <div
              key={day}
              className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div
                className={`w-full rounded-t-lg transition-all duration-300 group-hover:bg-primary ${
                  i === 3
                    ? "bg-primary shadow-lg shadow-primary/20"
                    : "bg-neutral-stone-200"
                }`}
                style={{ height: `${height}%` }}
              ></div>
              <span className="text-xs font-mono text-muted-foreground group-hover:text-primary">
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
