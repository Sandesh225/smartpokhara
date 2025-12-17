"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StaffLoad {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  current_workload: number;
  max_capacity: number;
  role?: string;
}

export function WorkloadDistributor({ staffList }: { staffList: any[] }) {
  const processedList: StaffLoad[] = staffList.map(s => ({
      user_id: s.user_id,
      full_name: s.full_name,
      avatar_url: s.avatar_url,
      current_workload: s.current_workload,
      max_capacity: s.max_concurrent_assignments || 10,
      role: s.staff_role
  })).sort((a, b) => {
     const availA = a.max_capacity - a.current_workload;
     const availB = b.max_capacity - b.current_workload;
     return availB - availA;
  });

  return (
    <Card>
       <CardHeader>
          <CardTitle>Workload Distribution</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
          {processedList.map((staff) => {
             const loadPct = (staff.current_workload / staff.max_capacity) * 100;
             const isOverloaded = loadPct > 90;
             
             return (
                <div key={staff.user_id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-slate-50 transition-colors group">
                   <Avatar className="h-10 w-10">
                      <AvatarImage src={staff.avatar_url} />
                      <AvatarFallback>{staff.full_name?.[0]}</AvatarFallback>
                   </Avatar>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                         <span className="font-medium text-sm truncate">{staff.full_name}</span>
                         {staff.role && <Badge variant="outline" className="text-[10px] h-5">{staff.role.replace('_', ' ')}</Badge>}
                      </div>
                      
                      <div className="w-full">
                         <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{staff.current_workload} Active Tasks</span>
                            <span>{Math.max(0, staff.max_capacity - staff.current_workload)} Open Slots</span>
                         </div>
                         <Progress 
                            value={loadPct} 
                            className={`h-2 ${isOverloaded ? "bg-red-100" : "bg-slate-100"}`}
                         />
                      </div>
                   </div>
                </div>
             );
          })}
       </CardContent>
    </Card>
  );
}