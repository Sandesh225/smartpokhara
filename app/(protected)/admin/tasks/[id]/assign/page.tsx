"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { adminStaffQueries } from "@/lib/supabase/queries/admin/staff";
import { adminTaskQueries } from "@/lib/supabase/queries/admin/tasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AssignTaskPage() {
  const { id } = useParams();
  const [staff, setStaff] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    adminStaffQueries.getAllStaff(supabase).then(setStaff);
  }, []);

  const handleAssign = async (staffId: string) => {
     try {
       await adminTaskQueries.assignTask(supabase, id as string, staffId);
       toast.success("Reassigned successfully");
       router.push(`/admin/tasks/${id}`);
     } catch (e) {
       toast.error("Failed to reassign");
     }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <h1 className="text-2xl font-bold">Reassign Task</h1>
       <div className="grid grid-cols-1 gap-4">
          {staff.map((s) => (
             <Card key={s.user_id} className="cursor-pointer hover:border-blue-500 transition-colors" onClick={() => handleAssign(s.user_id)}>
                <CardContent className="flex items-center gap-4 p-4">
                   <Avatar>
                      <AvatarImage src={s.avatar_url} />
                      <AvatarFallback>{s.full_name[0]}</AvatarFallback>
                   </Avatar>
                   <div className="flex-1">
                      <h4 className="font-bold">{s.full_name}</h4>
                      <p className="text-xs text-gray-500">{s.staff_role} • {s.department_name}</p>
                   </div>
                   <div className="text-right text-xs text-gray-500">
                      <div>Load: {s.current_workload}</div>
                      <div className={s.availability_status === 'available' ? 'text-green-600' : 'text-amber-600'}>
                         {s.availability_status}
                      </div>
                   </div>
                </CardContent>
             </Card>
          ))}
       </div>
    </div>
  );
}