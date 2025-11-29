"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/shared/toast-service";

interface RoleRow {
  id: string;
  name: string;
  role_type: string;
}

interface DepartmentRow {
  id: string;
  name: string;
}

interface WardRow {
  id: string;
  ward_number: number;
  name: string;
}

interface UserRoleRow {
  id: string;
  role_id: string;
  assigned_at: string;
  role?: RoleRow | null;
}

interface AdminUser {
  id: string;
  user_roles?: UserRoleRow[] | null;
}

interface UserRolesCardProps {
  user: AdminUser;
  availableRoles: RoleRow[];
  departments: DepartmentRow[];
  wards: WardRow[];
}

export function UserRolesCard({
  user,
  availableRoles,
  departments,
  wards,
}: UserRolesCardProps) {
  const router = useRouter();
  const [showAddRole, setShowAddRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [assigning, setAssigning] = useState(false);

  const currentRoles = user.user_roles ?? [];

  const selectedRoleData = availableRoles.find((r) => r.id === selectedRole);
  const selectedRoleType = selectedRoleData?.role_type;

  const needsDepartment = ["dept_staff", "dept_head"].includes(
    selectedRoleType || ""
  );
  const needsWard = selectedRoleType === "ward_staff";

  const handleAssignRole = async () => {
    if (!selectedRole) return;

    setAssigning(true);
    const supabase = createClient();

    try {
      // Check if role already assigned
      const hasRole = currentRoles.some(
        (ur) => ur.role_id === selectedRole
      );

      if (hasRole) {
        showErrorToast("User already has this role.");
        return;
      }

      // Get current admin user (who assigns the role)
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      // Assign role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role_id: selectedRole,
        assigned_by: currentUser?.id,
      });

      if (roleError) throw roleError;

      // If it's a department staff role, assign to department
      if (needsDepartment && selectedDepartment) {
        const { error: deptError } = await supabase
          .from("department_staff")
          .insert({
            user_id: user.id,
            department_id: selectedDepartment,
          });

        // Ignore unique violation (user already in that department)
        if (deptError && deptError.code !== "23505") {
          throw deptError;
        }
      }

      // If it's ward staff, update profile with ward
      if (needsWard && selectedWard) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .update({ ward_id: selectedWard })
          .eq("user_id", user.id);

        if (profileError) throw profileError;
      }

      showSuccessToast("Role assigned successfully.");
      setShowAddRole(false);
      setSelectedRole("");
      setSelectedDepartment("");
      setSelectedWard("");
      router.refresh();
    } catch (error) {
      console.error("Error assigning role:", error);
      showErrorToast("Failed to assign role. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveRole = async (userRoleId: string) => {
    if (!window.confirm("Are you sure you want to remove this role?")) return;

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", userRoleId);

      if (error) throw error;

      showSuccessToast("Role removed successfully.");
      router.refresh();
    } catch (error) {
      console.error("Error removing role:", error);
      showErrorToast("Failed to remove role. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles &amp; Permissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Roles */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Current Roles
          </h4>
          <div className="space-y-2">
            {currentRoles.length === 0 ? (
              <p className="text-sm text-gray-500">No roles assigned</p>
            ) : (
              currentRoles.map((userRole) => (
                <div
                  key={userRole.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                  <div>
                    <Badge variant="outline" className="mb-1">
                      {userRole.role?.name ?? "Role"}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      Assigned{" "}
                      {new Date(userRole.assigned_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRole(userRole.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Role Section */}
        {showAddRole ? (
          <div className="space-y-3 border-t pt-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Select Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Choose a role...</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.role_type})
                  </option>
                ))}
              </select>
            </div>

            {needsDepartment && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Assign to Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Choose department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {needsWard && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Assign to Ward
                </label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Choose ward...</option>
                  {wards.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      Ward {ward.ward_number} - {ward.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAssignRole}
                disabled={
                  assigning ||
                  !selectedRole ||
                  (needsDepartment && !selectedDepartment) ||
                  (needsWard && !selectedWard)
                }
              >
                {assigning ? "Assigning..." : "Assign Role"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddRole(false);
                  setSelectedRole("");
                  setSelectedDepartment("");
                  setSelectedWard("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddRole(true)}
            className="w-full"
          >
            + Add Role
          </Button>
        )}

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Quick Promotions
          </h4>
          <div className="space-y-2">
            <QuickPromoteButton
              userId={user.id}
              roleType="dept_staff"
              label="Promote to Department Staff"
              availableRoles={availableRoles}
              currentRoles={currentRoles}
            />
            <QuickPromoteButton
              userId={user.id}
              roleType="ward_staff"
              label="Promote to Ward Staff"
              availableRoles={availableRoles}
              currentRoles={currentRoles}
            />
            <QuickPromoteButton
              userId={user.id}
              roleType="field_staff"
              label="Promote to Field Staff"
              availableRoles={availableRoles}
              currentRoles={currentRoles}
            />
            <QuickPromoteButton
              userId={user.id}
              roleType="call_center"
              label="Promote to Helpdesk"
              availableRoles={availableRoles}
              currentRoles={currentRoles}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickPromoteButtonProps {
  userId: string;
  roleType: string;
  label: string;
  availableRoles: RoleRow[];
  currentRoles: UserRoleRow[];
}

function QuickPromoteButton({
  userId,
  roleType,
  label,
  availableRoles,
  currentRoles,
}: QuickPromoteButtonProps) {
  const router = useRouter();
  const [promoting, setPromoting] = useState(false);

  const hasRole = currentRoles.some(
    (ur) => ur.role?.role_type === roleType
  );

  const handlePromote = async () => {
    setPromoting(true);
    const supabase = createClient();

    try {
      const role = availableRoles.find((r) => r.role_type === roleType);
      if (!role) {
        showErrorToast("Configured role not found.");
        return;
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role_id: role.id,
        assigned_by: currentUser?.id,
      });

      if (error) throw error;

      showSuccessToast("User promoted successfully.");
      router.refresh();
    } catch (error) {
      console.error("Error promoting user:", error);
      showErrorToast("Failed to promote user. Please try again.");
    } finally {
      setPromoting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePromote}
      disabled={promoting || hasRole}
      className="w-full justify-start"
    >
      {promoting ? "Promoting..." : hasRole ? `✓ ${label}` : label}
    </Button>
  );
}
