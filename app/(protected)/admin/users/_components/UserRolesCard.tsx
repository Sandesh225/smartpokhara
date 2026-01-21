

// ═══════════════════════════════════════════════════════════
// app/(protected)/admin/users/_components/UserRolesCard.tsx
// ═══════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
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
import {
  Trash2,
  ShieldCheck,
  Plus,
  Briefcase,
  MapPin,
  Shield,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Types ---
interface Role {
  id: string;
  name: string;
  role_type: string;
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
  is_primary?: boolean;
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

  const selectedRole = availableRoles.find((r) => r.id === selectedRoleId);

  const requiresDepartment =
    selectedRole?.role_type === "dept_head" ||
    selectedRole?.role_type === "dept_staff";

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

      // STEP 1: ASSIGN ROLE
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role_id: selectedRoleId,
        is_primary: true,
        assigned_by: assignedBy,
      });

      if (roleError) throw roleError;

      // STEP 2: CREATE/UPDATE STAFF PROFILE
      const isStaffRole = [
        "dept_head",
        "dept_staff",
        "ward_staff",
        "field_staff",
        "admin",
      ].includes(selectedRole?.role_type || "");

      if (isStaffRole) {
        const staffCode = `STF-${Math.floor(1000 + Math.random() * 9000)}`;

        const profileData: any = {
          user_id: user.id,
          staff_role: selectedRole?.role_type,
          is_active: true,
          is_supervisor:
            selectedRole?.role_type === "dept_head" ||
            selectedRole?.role_type === "admin",
          department_id: requiresDepartment ? selectedDeptId : null,
          ward_id: requiresWard ? selectedWardId : null,
          staff_code: staffCode,
        };

        const { error: profileError } = await supabase
          .from("staff_profiles")
          .upsert(profileData, { onConflict: "user_id" });

        if (profileError) {
          console.error("Staff Profile Error:", profileError);
          throw new Error(
            `Failed to create staff profile: ${profileError.message}`
          );
        }
      }

      // STEP 3: CREATE SUPERVISOR PROFILE IF NEEDED
      const isSupervisorRole =
        selectedRole?.role_type === "dept_head" ||
        selectedRole?.role_type === "admin";

      if (isSupervisorRole) {
        let supervisorLevel: "department" | "ward" | "senior" = "department";
        if (selectedRole?.role_type === "admin") {
          supervisorLevel = "senior";
        } else if (requiresWard) {
          supervisorLevel = "ward";
        }

        const assignedDepartments =
          requiresDepartment && selectedDeptId ? [selectedDeptId] : [];
        const assignedWards =
          requiresWard && selectedWardId ? [selectedWardId] : [];

        const supervisorData = {
          user_id: user.id,
          supervisor_level: supervisorLevel,
          assigned_departments: assignedDepartments,
          assigned_wards: assignedWards,
          can_assign_staff: true,
          can_escalate: true,
          can_close_complaints: true,
          can_create_tasks: true,
          can_approve_leave: isSupervisorRole,
          can_generate_reports: true,
        };

        const { error: supervisorError } = await supabase
          .from("supervisor_profiles")
          .upsert(supervisorData, { onConflict: "user_id" });

        if (supervisorError) {
          console.error("Supervisor Profile Error:", supervisorError);
          throw new Error(
            `Failed to create supervisor profile: ${supervisorError.message}`
          );
        }
      }

      toast.success(
        isSupervisorRole
          ? "Supervisor role and jurisdiction assigned successfully!"
          : "Role assigned successfully"
      );

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
    if (!confirm("Are you sure? This will revoke their portal access.")) return;

    setLoading(true);
    try {
      const roleToRemove = user.user_roles?.find((ur) => ur.role_id === roleId);
      const isSupervisor =
        roleToRemove?.role?.role_type === "dept_head" ||
        roleToRemove?.role?.role_type === "admin";

      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.id)
        .eq("role_id", roleId);

      if (roleError) throw roleError;

      if (isSupervisor) {
        await supabase
          .from("supervisor_profiles")
          .delete()
          .eq("user_id", user.id);
      }

      await supabase
        .from("staff_profiles")
        .update({ is_active: false })
        .eq("user_id", user.id);

      router.refresh();
      toast.success("Role removed successfully");
    } catch (error: any) {
      console.error("Failed to remove role:", error);
      toast.error(error.message || "Failed to remove role");
    } finally {
      setLoading(false);
    }
  };

  const assignedRoleIds = new Set(user.user_roles?.map((ur) => ur.role_id));
  const unassignedRoles = availableRoles.filter(
    (role) => !assignedRoleIds.has(role.id)
  );

  const currentStaffDetails = user.staff_profiles;
  const currentDepartment = departments.find(
    (d) => d.id === currentStaffDetails?.department_id
  );
  const currentWard = wards.find((w) => w.id === currentStaffDetails?.ward_id);

  const getRoleBadgeStyle = (roleType: string) => {
    const styles: Record<string, string> = {
      admin: "border-error-red/30 bg-error-red/10 text-error-red",
      dept_head: "border-primary/30 bg-primary/10 text-primary",
      ward_staff: "border-success-green/30 bg-success-green/10 text-success-green",
      dept_staff: "border-info-blue/30 bg-info-blue/10 text-info-blue",
      field_staff: "border-warning-amber/30 bg-warning-amber/10 text-warning-amber",
    };
    return styles[roleType] || "border-muted-foreground/30 bg-muted text-muted-foreground";
  };

  return (
    <div className="stone-card overflow-hidden">
      {/* HEADER */}
      <CardHeader className="border-b-2 border-border bg-muted/30 p-2 md:p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-base md:text-lg font-black text-foreground tracking-tight">
            Access & Roles
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 md:space-y-6 p-4 md:p-6">
        {/* CURRENT JURISDICTION */}
        {currentStaffDetails && (
          <div className="bg-info-blue/5 border-2 border-info-blue/20 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-info-blue" />
              <span className="text-[10px] md:text-[11px] font-bold text-info-blue uppercase tracking-wider">
                Current Jurisdiction
              </span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {currentDepartment && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {currentDepartment.name}
                  </span>
                </div>
              )}
              {currentWard && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-success-green/10">
                    <MapPin className="w-3.5 h-3.5 text-success-green" />
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    Ward {currentWard.ward_number}
                  </span>
                </div>
              )}
              {!currentDepartment && !currentWard && (
                <span className="text-xs text-muted-foreground italic">
                  No specific jurisdiction assigned
                </span>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE ROLES */}
        <div className="space-y-3">
          <Label className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Active Roles
          </Label>
          {user.user_roles && user.user_roles.length > 0 ? (
            <div className="space-y-2">
              {user.user_roles.map((ur) => (
                <div
                  key={ur.id}
                  className="flex items-center justify-between rounded-lg border-2 border-border p-3 md:p-4 bg-card hover:bg-accent/30 transition-all duration-200 group"
                >
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-black text-sm md:text-base text-foreground truncate">
                        {ur.role?.name ?? "Unknown role"}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold",
                          getRoleBadgeStyle(ur.role?.role_type || "")
                        )}
                      >
                        {ur.role?.role_type.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                      {ur.is_primary && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold border-warning-amber/30 bg-warning-amber/10 text-warning-amber"
                        >
                          PRIMARY
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-medium">
                      Assigned:{" "}
                      {ur.assigned_at
                        ? new Date(ur.assigned_at).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error-red hover:bg-error-red/10 hover:text-error-red h-8 w-8 p-0 flex-shrink-0 ml-2"
                    onClick={() => handleRemoveRole(ur.role_id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                <Shield className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                No roles assigned yet
              </p>
            </div>
          )}
        </div>

        <div className="border-t-2 border-border" />

        {/* ADD NEW ROLE */}
        <div className="space-y-4">
          <Label className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Assign New Role
          </Label>

          <div className="space-y-3">
            {/* Role Selection */}
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="w-full h-10 font-medium">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {unassignedRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <span>{role.name}</span>
                      {(role.role_type === "dept_head" ||
                        role.role_type === "admin") && (
                        <Badge className="text-[10px]" variant="secondary">
                          Supervisor
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department Selection */}
            {requiresDepartment && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <Select
                  value={selectedDeptId}
                  onValueChange={setSelectedDeptId}
                >
                  <SelectTrigger className="w-full h-10 border-2 border-primary/30 bg-primary/5">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
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

            {/* Ward Selection */}
            {requiresWard && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <Select
                  value={selectedWardId}
                  onValueChange={setSelectedWardId}
                >
                  <SelectTrigger className="w-full h-10 border-2 border-success-green/30 bg-success-green/5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-success-green" />
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
              className="w-full gap-2 font-bold"
              disabled={!selectedRoleId || loading}
            >
              {loading ? (
                "Assigning..."
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Assign Role & Jurisdiction
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          {selectedRole?.role_type === "dept_head" && (
            <div className="bg-warning-amber/5 border-2 border-warning-amber/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning-amber flex-shrink-0 mt-0.5" />
                <p className="text-xs text-warning-amber font-medium">
                  <strong>Note:</strong> Assigning Department Head will create a
                  supervisor profile with full department access.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
}