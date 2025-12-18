"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignmentEngine } from "@/lib/admin/assignment-engine";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { adminComplaintQueries } from "@/lib/supabase/queries/admin/complaints";

export function AssignmentEngine({ complaintId, currentAssignee, wardId, categoryId }: any) {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [suggestion, setSuggestion] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // Load suggestion and staff
    const load = async () => {
      const dept = await assignmentEngine.suggestDepartment(supabase, categoryId);
      setSuggestion(dept);
      
      const staff = await assignmentEngine.findAvailableStaff(supabase, wardId, dept?.id || null);
      setStaffList(staff);
    };
    if (wardId && categoryId) load();
  }, [wardId, categoryId]);

  const handleAssign = async () => {
     try {
       // In real app, get current admin ID from session
       const { data: { user } } = await supabase.auth.getUser();
       if(!user) return;
       
       await adminComplaintQueries.assignComplaint(supabase, complaintId, selectedStaff, user.id, "Manual Assignment via Admin Console");
       toast.success("Staff assigned successfully");
     } catch(e) {
       toast.error("Assignment failed");
     }
  };

  return (
    <Card className="border-blue-100 bg-blue-50/30">
      <CardHeader className="pb-2">
         <CardTitle className="text-sm font-medium uppercase text-blue-700">Assignment Console</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
         {currentAssignee ? (
            <div className="text-sm bg-white p-3 rounded border">
               <span className="text-gray-500 block text-xs">Currently Assigned To</span>
               <span className="font-medium">{currentAssignee.user?.profile?.full_name}</span>
               <div className="text-xs text-gray-400 mt-1">{currentAssignee.staff_code}</div>
            </div>
         ) : (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
               Unassigned
            </div>
         )}

         {suggestion && (
            <div className="text-xs text-gray-600">
               Suggested Department: <span className="font-semibold">{suggestion.name}</span>
            </div>
         )}

         <div className="flex gap-2">
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select Staff Member" />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((s) => (
                   <SelectItem key={s.user_id} value={s.user_id}>
                      {s.user?.profile?.full_name} (Load: {s.current_workload})
                   </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssign} disabled={!selectedStaff}>Assign</Button>
         </div>
      </CardContent>
    </Card>
  );
}