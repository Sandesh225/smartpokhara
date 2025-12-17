"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminStaffQueries } from "@/lib/supabase/queries/admin/staff";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function StaffWorkload() {
  const [data, setData] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
     adminStaffQueries.getStaffWorkload(supabase).then(setData);
  }, []);

  return (
    <Card className="border border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
         <div className="flex justify-between items-center">
             <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600"/> Current Load
             </CardTitle>
             <Badge variant="outline" className="bg-white text-[10px] text-slate-500">Top 5</Badge>
         </div>
         <CardDescription className="text-xs text-slate-500">
            Staff with highest active assignments
         </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
         <div className="divide-y divide-slate-50">
             {data.slice(0, 5).map((staff, i) => {
                const load = staff.current_workload;
                const max = staff.max_concurrent_assignments || 10;
                const pct = (load / max) * 100;
                
                return (
                   <div key={staff.user_id} className="p-4 hover:bg-blue-50/20 transition-colors flex items-center gap-3 group">
                      <div className="text-xs font-bold text-slate-300 w-4 group-hover:text-blue-400">0{i + 1}</div>
                      <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-blue-100 transition-all">
                         <AvatarFallback className="text-xs bg-slate-100 text-slate-600 font-medium">
                             {staff.full_name?.[0]}
                         </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center mb-1.5">
                             <span className="text-xs font-medium text-slate-700 truncate block max-w-[100px]">{staff.full_name}</span>
                             <span className="text-[10px] font-medium text-slate-400">
                                {load}/{max}
                             </span>
                         </div>
                         {/* Blue Progress Bar */}
                         <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div 
                                className="h-full rounded-full bg-blue-500"
                                style={{ 
                                    width: `${Math.min(pct, 100)}%`,
                                    opacity: Math.max(0.6, pct/100) // Darker blue as it gets full
                                }} 
                             />
                         </div>
                      </div>
                   </div>
                )
             })}
             {data.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                     <Users className="w-8 h-8 text-slate-200 mb-2" />
                     <p className="text-xs text-slate-400">No active workload data available.</p>
                 </div>
             )}
         </div>
      </CardContent>
    </Card>
  );
}