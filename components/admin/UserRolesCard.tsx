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
import { Trash2, ShieldCheck, Plus } from "lucide-react";

interface Role {
  id: string;
  name: string;
  role_type: string; // e.g. "admin", "staff", "citizen"
}

interface UserRole {
  id: string;
  role_id: string;
  assigned_at: string;
  role: Role;
}

interface UserWithRoles {
  id: string;
  email: string;
  user_roles: UserRole[];
}

interface Props {
  user: UserWithRoles;
  availableRoles: Role[];
}

export function UserRolesCard({ user, availableRoles }: Props) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAddRole = async () => {
    if (!selectedRoleId) return;

    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const assignedBy = authData.user?.id ?? null;

      const { error } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role_id: selectedRoleId,
        is_primary: false,
        assigned_by: assignedBy,
      });

      if (error) throw error;

      setSelectedRoleId("");
      router.refresh();
    } catch (error) {
      console.error("Failed to assign role:", error);
      alert("Failed to assign role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this role?"
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.id)
        .eq("role_id", roleId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Failed to remove role:", error);
      alert("Failed to remove role. Please try again.");
    }
  };

  const assignedRoleIds = new Set(user.user_roles?.map((ur) => ur.role_id));
  const unassignedRoles = availableRoles.filter(
    (role) => !assignedRoleIds.has(role.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-gray-500" />
          System Roles
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active Roles */}
        <div className="space-y-3">
          {user.user_roles && user.user_roles.length > 0 ? (
            user.user_roles.map((ur) => (
              <div
                key={ur.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {ur.role?.name ?? "Unknown role"}
                    </span>

                    {ur.role?.role_type === "admin" && (
                      <Badge variant="outline" className="text-xs">
                        Admin
                      </Badge>
                    )}
                    {ur.role?.role_type === "staff" && (
                      <Badge variant="secondary" className="text-xs">
                        Staff
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Assigned:{" "}
                    {ur.assigned_at
                      ? new Date(ur.assigned_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleRemoveRole(ur.role_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No roles assigned yet.</p>
          )}
        </div>

        {/* Add Role */}
        <div className="flex gap-2">
          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role to assign" />
            </SelectTrigger>
            <SelectContent>
              {unassignedRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
              {unassignedRoles.length === 0 && (
                <SelectItem value="__none" disabled>
                  All available roles already assigned
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Button
            onClick={handleAddRole}
            disabled={!selectedRoleId || selectedRoleId === "__none" || loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "Adding..." : "Add"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
