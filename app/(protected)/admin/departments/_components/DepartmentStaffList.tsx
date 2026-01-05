import { MoreVertical } from "lucide-react";

interface StaffMember {
  user_id: string;
  name: string;
  role: string;
  initials: string;
}

export default function DepartmentStaffList({
  staff,
}: {
  staff: StaffMember[];
}) {
  return (
    <div className="stone-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-foreground">Key Personnel</h4>
        <span className="text-xs font-semibold text-muted-foreground">
          {staff.length} Members
        </span>
      </div>

      {staff.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No staff assigned.
        </p>
      ) : (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {staff.map((person) => (
            <div
              key={person.user_id}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
                  {person.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {person.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate capitalize">
                    {person.role.replace("_", " ")}
                  </p>
                </div>
              </div>
              <button className="text-neutral-stone-400 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
