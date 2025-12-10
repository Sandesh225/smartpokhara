"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";/ui/
import { Button } from "@/ui/button";/ui/
import { Textarea } from "@/ui/textarea/ui/
import { Label } from "@/ui/label";/ui/
import { Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


interface StaffMember {
  user_id: string;
  full_name: string;
  staff_role: string;
  active_complaints: number;
}

interface Department {
  id: string;
  name: string;
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: string;
  currentDepartmentId?: string;
  currentWardId?: string;
  onSuccess: () => void;
}

export default function AssignmentModal({
  isOpen,
  onClose,
  complaintId,
  currentDepartmentId,
  currentWardId,
  onSuccess,
}: AssignmentModalProps) {
  const supabase = createClient();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetchingStaff, setFetchingStaff] = useState(false);
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  
  const [selectedDept, setSelectedDept] = useState<string>(currentDepartmentId || "");
  const [selectedStaff, setSelectedStaff] = useState<string>("unassigned");
  const [note, setNote] = useState("");

  // Fetch Departments on load
  useEffect(() => {
    async function fetchDepts() {
      const { data } = await supabase
        .from("departments")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (data) setDepartments(data);
    }
    if (isOpen) fetchDepts();
  }, [isOpen, supabase]);

  // Fetch Staff when Department changes
  useEffect(() => {
    async function fetchStaff() {
      if (!selectedDept) {
        setStaffList([]);
        return;
      }
      setFetchingStaff(true);
      
      const { data, error } = await supabase.rpc("rpc_get_assignable_staff", {
        p_department_id: selectedDept,
        // Optional: filter by ward if your logic requires keeping complaints in-ward
        // p_ward_id: currentWardId 
      });

      if (!error && data) {
        setStaffList(data);
      }
      setFetchingStaff(false);
    }

    fetchStaff();
  }, [selectedDept, currentWardId, supabase]);

  const handleAssign = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("rpc_supervisor_assign_complaint", {
        p_complaint_id: complaintId,
        p_department_id: selectedDept,
        p_staff_id: selectedStaff === "unassigned" ? null : selectedStaff,
        p_note: note
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Complaint successfully assigned.",
        variant: "default", // or "success" if you have that variant
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Complaint</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          
          {/* Department Selection */}
          <div className="grid gap-2">
            <Label htmlFor="department">Department</Label>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Staff Selection */}
          <div className="grid gap-2">
            <Label htmlFor="staff">Assign To Staff (Optional)</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff} disabled={!selectedDept || fetchingStaff}>
              <SelectTrigger>
                <SelectValue placeholder={fetchingStaff ? "Loading staff..." : "Select Staff Member"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned" className="font-semibold text-gray-500">
                  -- Leave Unassigned (Queue) --
                </SelectItem>
                {staffList.map((staff) => (
                  <SelectItem key={staff.user_id} value={staff.user_id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{staff.full_name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        staff.active_complaints < 3 ? 'bg-green-100 text-green-700' : 
                        staff.active_complaints < 7 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {staff.active_complaints} tasks
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Staff members are filtered by the selected department.
            </p>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="note">Instructions / Note</Label>
            <Textarea
              id="note"
              placeholder="Add instructions for the staff member..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedDept}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}