"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Trash2, ShieldCheck, Plus, Briefcase, MapPin } from "lucide-react";
import { toast } from "sonner"; // Assuming you use sonner, otherwise use alert

// --- Types ---
interface Role {
  id: string;
  name: string;
  role_type: string; // 'admin' | 'dept_head' | 'dept_staff' | 'ward_staff' | 'field_staff'
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Ward {
  id: string;
  ward_number: number;
  name: string;
}

interface UserRole {
  id: string;
  role_id: string;
  assigned_at: string;
  role: Role;
}

interface StaffProfile {
  department_id?: string | null;
  ward_id?: string | null;
  staff_code?: string;
}

interface UserWithRoles {
  id: string;
  email: string;
  user_roles: UserRole[];
  staff_profiles?: StaffProfile | null;
}

interface Props {
  user: UserWithRoles;
  availableRoles: Role[];
  departments: Department[];
  wards: Ward[];
}

export function UserRolesCard({
  user,
  availableRoles,
  departments,
  wards,
}: Props) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedWardId, setSelectedWardId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // --- Derived State for Conditional UI ---
  const selectedRole = availableRoles.find((r) => r.id === selectedRoleId);

  // Logic: Department Head OR Dept Staff needs a Department
  const requiresDepartment =
    selectedRole?.role_type === "dept_head" ||
    selectedRole?.role_type === "dept_staff";

  // Logic: Ward Staff needs a Ward
  const requiresWard = selectedRole?.role_type === "ward_staff";

  const handleAddRole = async () => {
    if (!selectedRoleId) return;

    // Validation
    if (requiresDepartment && !selectedDeptId) {
      toast.error("Please select a Department for this role.");
      return;
    }
    if (requiresWard && !selectedWardId) {
      toast.error("Please select a Ward for this role.");
      return;
    }

    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const assignedBy = authData.user?.id ?? null;

      // 1. Assign the Role in user_roles table
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role_id: selectedRoleId,
        is_primary: true, // Mark new assignments as primary to force portal switch
        assigned_by: assignedBy,
      });

      if (roleError) throw roleError;

      // 2. Upsert Staff Profile (This links them to the Dept/Ward Portal Data)
      // We only do this for staff-type roles
      if (
        [
          "dept_head",
          "dept_staff",
          "ward_staff",
          "field_staff",
          "admin",
        ].includes(selectedRole?.role_type || "")
      ) {
        // Generate a temp staff code if needed
        const staffCode = `STF-${Math.floor(1000 + Math.random() * 9000)}`;

        const profileData: any = {
          user_id: user.id,
          staff_role: selectedRole?.role_type,
          is_active: true,
          // Determine Supervisor Status
          is_supervisor:
            selectedRole?.role_type === "dept_head" ||
            selectedRole?.role_type === "admin",
          // Link Jurisdiction
          department_id: requiresDepartment ? selectedDeptId : null,
          ward_id: requiresWard ? selectedWardId : null,
        };

        // We use upsert to create or update existing staff profile
        const { error: profileError } = await supabase
          .from("staff_profiles")
          .upsert(profileData, { onConflict: "user_id" });

        if (profileError) throw profileError;
      }

      toast.success("Role and Jurisdiction assigned successfully");

      // Reset form
      setSelectedRoleId("");
      setSelectedDeptId("");
      setSelectedWardId("");

      router.refresh();
    } catch (error: any) {
      console.error("Failed to assign role:", error);
      toast.error(error.message || "Failed to assign role");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!confirm("Are you sure? This may revoke their portal access.")) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.id)
        .eq("role_id", roleId);

      if (error) throw error;

      // Optional: We don't delete the staff_profile immediately to preserve history,
      // but we could set is_active = false if needed.

      router.refresh();
      toast.success("Role removed");
    } catch (error) {
      toast.error("Failed to remove role");
    }
  };

  // Filter out roles user already has
  const assignedRoleIds = new Set(user.user_roles?.map((ur) => ur.role_id));
  const unassignedRoles = availableRoles.filter(
    (role) => !assignedRoleIds.has(role.id)
  );

  // Determine current context for display
  const currentStaffDetails = user.staff_profiles;
  const currentDepartment = departments.find(
    (d) => d.id === currentStaffDetails?.department_id
  );
  const currentWard = wards.find((w) => w.id === currentStaffDetails?.ward_id);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          Access & Roles
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* --- Current Context Display --- */}
        {currentStaffDetails && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm flex gap-4">
            {currentDepartment && (
              <div className="flex items-center gap-2 text-blue-700">
                <Briefcase className="h-4 w-4" />
                <span className="font-semibold">{currentDepartment.name}</span>
              </div>
            )}
            {currentWard && (
              <div className="flex items-center gap-2 text-blue-700">
                <MapPin className="h-4 w-4" />
                <span className="font-semibold">
                  Ward {currentWard.ward_number}
                </span>
              </div>
            )}
            {!currentDepartment && !currentWard && (
              <span className="text-blue-600 italic">
                No specific jurisdiction assigned.
              </span>
            )}
          </div>
        )}

        {/* --- Active Roles List --- */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Active Roles
          </Label>
          {user.user_roles && user.user_roles.length > 0 ? (
            user.user_roles.map((ur) => (
              <div
                key={ur.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {ur.role?.name ?? "Unknown role"}
                    </span>
                    {ur.role?.role_type === "admin" && (
                      <Badge className="bg-slate-900">Admin</Badge>
                    )}
                    {ur.role?.role_type === "dept_head" && (
                      <Badge className="bg-purple-600">Head</Badge>
                    )}
                    {ur.role?.role_type === "ward_staff" && (
                      <Badge className="bg-green-600">Ward</Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Assigned:{" "}
                    {ur.assigned_at
                      ? new Date(ur.assigned_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 hover:text-red-700 h-8 w-8 p-0"
                  onClick={() => handleRemoveRole(ur.role_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 italic">
              No roles assigned yet.
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 my-4" />

        {/* --- Add New Role Form --- */}
        <div className="space-y-4">
          <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Assign New Role
          </Label>

          <div className="grid grid-cols-1 gap-3">
            {/* 1. Select Role */}
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {unassignedRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 2. Conditional: Select Department (For Heads/Staff) */}
            {requiresDepartment && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <Select
                  value={selectedDeptId}
                  onValueChange={setSelectedDeptId}
                >
                  <SelectTrigger className="w-full h-10 border-blue-200 bg-blue-50/50">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-500" />
                      <SelectValue placeholder="Select Department" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 3. Conditional: Select Ward (For Ward Staff) */}
            {requiresWard && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <Select
                  value={selectedWardId}
                  onValueChange={setSelectedWardId}
                >
                  <SelectTrigger className="w-full h-10 border-green-200 bg-green-50/50">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <SelectValue placeholder="Select Ward" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        Ward {ward.ward_number} - {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleAddRole}
              className="w-full"
              disabled={!selectedRoleId || loading}
            >
              {loading ? (
                "Assigning..."
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" /> Assign Role & Access
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}