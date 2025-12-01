// components/admin/staff/ChangeRoleDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Shield, AlertTriangle } from "lucide-react";

interface ChangeRoleDialogProps {
  userId: string;
  currentRoles: string[];
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangeRoleDialog({
  userId,
  currentRoles,
  userName,
  onClose,
  onSuccess
}: ChangeRoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("roles")
      .select("*")
      .in("role_type", ["admin", "dept_head", "dept_staff", "ward_staff", "field_staff", "call_center"])
      .eq("is_active", true)
      .order("role_type");

    if (data) setRoles(data);
  };

  const handleRoleToggle = (roleType: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleType)
        ? prev.filter(r => r !== roleType)
        : [...prev, roleType]
    );
  };

  const handleSubmit = async () => {
    if (selectedRoles.length === 0) {
      alert("User must have at least one role");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // Get current role assignments
      const { data: currentAssignments } = await supabase
        .from("user_roles")
        .select(`
          id,
          role:roles(role_type)
        `)
        .eq("user_id", userId);

      const currentRoleTypes = currentAssignments?.map(a => a.role.role_type) || [];

      // Roles to add
      const rolesToAdd = selectedRoles.filter(r => !currentRoleTypes.includes(r));

      // Roles to remove
      const rolesToRemove = currentRoleTypes.filter(r => !selectedRoles.includes(r));

      // Add new roles
      for (const roleType of rolesToAdd) {
        const { error } = await supabase.rpc("assign_role_to_user", {
          p_user_id: userId,
          p_role_type: roleType as any
        });

        if (error) throw error;
      }

      // Remove old roles
      for (const roleType of rolesToRemove) {
        const { error } = await supabase.rpc("remove_role_from_user", {
          p_user_id: userId,
          p_role_type: roleType as any
        });

        if (error) throw error;
      }

      // Send notification about role change
      const oldRolesList = currentRoleTypes.join(", ");
      const newRolesList = selectedRoles.join(", ");

      await supabase.rpc("create_staff_notification", {
        p_user_id: userId,
        p_type: "role_changed",
        p_title: "Your Roles Have Been Updated",
        p_message: `Your roles have been changed from ${oldRolesList} to ${newRolesList}`,
        p_action_url: "/staff/profile",
        p_metadata: {
          old_roles: currentRoleTypes,
          new_roles: selectedRoles
        }
      });

      alert(`Roles updated successfully for ${userName}`);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating roles:", error);
      alert(error.message || "Failed to update roles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="absolute right-4 top-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-blue-100 p-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Change Roles</h3>
                <p className="text-sm text-gray-500">{userName}</p>
              </div>
            </div>

            <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Important</p>
                  <p className="mt-1">
                    Changing roles will affect the user's permissions and dashboard access. 
                    The user will be notified of this change.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Roles (can select multiple)
              </label>
              
              {roles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.role_type)}
                    onChange={() => handleRoleToggle(role.role_type)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{role.name}</p>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || selectedRoles.length === 0}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Roles"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Update StaffListTable.tsx to include role change action
// Add this to the Actions column:

function StaffActionsMenu({ staff, onRefresh }: any) {
  const [showChangeRole, setShowChangeRole] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  setShowChangeRole(true);
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Change Roles
              </button>
              <button
                onClick={() => {
                  // Handle deactivate
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Deactivate
              </button>
            </div>
          </div>
        )}
      </div>

      {showChangeRole && (
        <ChangeRoleDialog
          userId={staff.id}
          currentRoles={staff.roles.map((r: any) => r.role_type)}
          userName={staff.profile.full_name}
          onClose={() => setShowChangeRole(false)}
          onSuccess={() => {
            setShowChangeRole(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}