// ==================== DEPARTMENTS TABLE COMPONENT ====================
// app/admin/departments/_components/DepartmentsTable.tsx

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

export default function DepartmentTable({ data }: { data: any[] }) {
  if (!data?.length) {
    return (
      <div className="glass rounded-2xl p-12 text-center border border-border">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-40" />
        <p className="text-lg font-semibold text-foreground mb-2">
          No Departments Found
        </p>
        <p className="text-sm text-muted-foreground">
          Create your first department to get started
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl border border-border elevation-1 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-4 px-6 text-sm font-bold text-foreground">
                Code
              </th>
              <th className="text-left py-4 px-6 text-sm font-bold text-foreground">
                Department
              </th>
              <th className="text-left py-4 px-6 text-sm font-bold text-foreground">
                Head Official
              </th>
              <th className="text-right py-4 px-6 text-sm font-bold text-foreground">
                Staff
              </th>
              <th className="text-center py-4 px-6 text-sm font-bold text-foreground">
                Status
              </th>
              <th className="text-right py-4 px-6 text-sm font-bold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((dept) => (
              <tr
                key={dept.id}
                className="hover:bg-muted/30 transition-colors group"
              >
                <td className="py-4 px-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground font-mono font-bold text-sm shadow-sm">
                    {dept.code}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <p className="font-semibold text-foreground text-base mb-0.5">
                      {dept.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {dept.name_nepali}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {dept.head_name ? (
                      <>
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                          {dept.head_name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {dept.head_name}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Vacant Position
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2.5rem] h-9 px-3 rounded-lg bg-accent/10 text-accent-foreground font-semibold text-sm tabular-nums">
                    {dept.staff_count}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
                      dept.is_active
                        ? "bg-[rgb(var(--success-green))]/10 text-[rgb(var(--success-green))] border-[rgb(var(--success-green))]/30"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {dept.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <Link
                    href={`/admin/departments/${dept.id}`}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all group-hover:scale-110 group-hover:shadow-lg"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
