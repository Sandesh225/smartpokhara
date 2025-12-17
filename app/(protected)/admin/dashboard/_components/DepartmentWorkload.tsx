import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepartmentWorkload as DeptType } from "@/lib/types/admin";
import { Building2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DepartmentWorkload({ data }: { data: DeptType[] }) {
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            Department Workload
          </CardTitle>
          <Badge variant="outline" className="text-xs font-medium">
            {data.length} Departments
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {data.map((dept) => {
          const total = dept.active_count + dept.overdue_count;
          const activePct = total > 0 ? (dept.active_count / total) * 100 : 0;
          const overduePct = total > 0 ? (dept.overdue_count / total) * 100 : 0;
          const hasOverdue = dept.overdue_count > 0;
          
          return (
            <div 
              key={dept.id} 
              className="
                space-y-3 p-4 rounded-xl border border-gray-100 
                bg-linear-to-br from-white to-gray-50/30
                hover:border-gray-200 hover:shadow-sm
                transition-all duration-300
              "
            >
              {/* Department Header */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                    {dept.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {total} total {total === 1 ? 'complaint' : 'complaints'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 font-semibold rounded-md">
                    {dept.active_count} Active
                  </span>
                  {hasOverdue && (
                    <span className="px-2 py-1 bg-red-50 text-red-700 font-semibold rounded-md flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {dept.overdue_count} Overdue
                    </span>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full flex">
                    {/* Active Bar */}
                    <div 
                      style={{ width: `${activePct}%` }} 
                      className="bg-linear-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out"
                      aria-label={`${dept.active_count} active complaints`}
                    />
                    {/* Overdue Bar */}
                    {hasOverdue && (
                      <div 
                        style={{ width: `${overduePct}%` }} 
                        className="bg-linear-to-r from-red-500 to-red-600 h-full transition-all duration-500 ease-out"
                        aria-label={`${dept.overdue_count} overdue complaints`}
                      />
                    )}
                  </div>
                </div>
                
                {/* Percentage Labels (optional, shows on hover) */}
                {total > 0 && (
                  <div className="absolute -top-6 left-0 right-0 flex justify-between text-[10px] font-medium text-gray-400 opacity-0 hover:opacity-100 transition-opacity">
                    <span>{activePct.toFixed(0)}%</span>
                    {hasOverdue && <span>{overduePct.toFixed(0)}%</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {data.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No department data available</p>
            <p className="text-xs text-gray-400 mt-1">Data will appear here once departments are active</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}