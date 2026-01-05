import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DepartmentTable({ data }: { data: any[] }) {
  if (!data?.length)
    return (
      <div className="p-8 text-center text-muted-foreground">
        No departments found.
      </div>
    );

  return (
    <div className="stone-card card-padding overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-stone-50 text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3 pl-2">Code</th>
              <th className="py-3">Name</th>
              <th className="py-3">Head of Dept</th>
              <th className="py-3 text-right">Staff</th>
              <th className="py-3 text-center">Status</th>
              <th className="py-3 pr-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((dept) => (
              <tr key={dept.id} className="hover:bg-neutral-stone-50">
                <td className="py-4 pl-2 font-mono text-xs font-bold text-primary">
                  {dept.code}
                </td>
                <td className="py-4 font-semibold">{dept.name}</td>
                <td className="py-4 text-muted-foreground">
                  {dept.head_name || "Vacant"}
                </td>
                <td className="py-4 text-right">{dept.staff_count}</td>
                <td className="py-4 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      dept.is_active
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {dept.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-4 pr-2 text-right">
                  <Link
                    href={`/admin/departments/${dept.id}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-stone-200"
                  >
                    <ArrowRight className="w-4 h-4" />
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
