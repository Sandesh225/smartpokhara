"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast"; 
import { Loader2, Save } from "lucide-react";

interface Props {
  staff: any;
  departments: any[];
  wards: any[];
}

export default function StaffProfileForm({ staff, departments, wards }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [role, setRole] = useState(staff.staff_role || "dept_staff");
  const [deptId, setDeptId] = useState(staff.department_id || "");
  const [wardId, setWardId] = useState(staff.ward_id || "");
  const [isActive, setIsActive] = useState(staff.is_active);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("rpc_manage_staff_assignment", {
        p_user_id: staff.user_id,
        p_department_id: deptId || null,
        p_ward_id: wardId || null,
        p_staff_role: role,
        p_is_active: isActive
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Staff profile updated successfully",
      });
      
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role */}
        <div className="space-y-2">
          <Label>Staff Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dept_head">Department Head</SelectItem>
              <SelectItem value="dept_staff">Department Staff</SelectItem>
              <SelectItem value="ward_staff">Ward Staff</SelectItem>
              <SelectItem value="field_staff">Field Staff</SelectItem>
              <SelectItem value="call_center">Call Center</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Status */}
        <div className="space-y-2 flex flex-col justify-end">
          <div className="flex items-center justify-between border p-3 rounded-md">
            <Label className="cursor-pointer" htmlFor="active-switch">Account Active</Label>
            <Switch id="active-switch" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={deptId} onValueChange={setDeptId}>
            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ward (Optional) */}
        <div className="space-y-2">
          <Label>Ward (Optional)</Label>
          <Select value={wardId} onValueChange={setWardId}>
            <SelectTrigger><SelectValue placeholder="Select Ward" /></SelectTrigger>
            <SelectContent>
              {wards.map((w) => (
                <SelectItem key={w.id} value={w.id}>Ward {w.ward_number}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Update Assignment
        </Button>
      </div>
    </div>
  );
}