// ==================== STAFF LIST COMPONENT ====================
// app/admin/departments/_components/DepartmentStaffList.tsx

import { Users, Mail } from "lucide-react";

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
    <div className="glass rounded-2xl p-6 border border-border elevation-1 sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Key Personnel
        </h4>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          {staff.length} Members
        </span>
      </div>

      {staff.length === 0 ? (
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-muted/30">
          <p className="text-sm text-muted-foreground italic">
            No staff assigned
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
          {staff.map((person) => (
            <div
              key={person.user_id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all group cursor-pointer border border-transparent hover:border-border"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                {person.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {person.name}
                </p>
                <p className="text-xs text-muted-foreground truncate capitalize">
                  {person.role.replace(/_/g, " ")}
                </p>
              </div>
              <Mail className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
