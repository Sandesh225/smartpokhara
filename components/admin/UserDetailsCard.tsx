"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/shared/toast-service";

interface UserProfile {
  full_name?: string | null;
}

interface AdminUser {
  id: string;
  email: string;
  phone?: string | null;
  created_at?: string | null;
  last_login_at?: string | null;
  is_active?: boolean | null;
  is_verified?: boolean | null;
  user_profiles?: UserProfile | null;
}

interface UserDetailsCardProps {
  user: AdminUser;
}

export function UserDetailsCard({ user }: UserDetailsCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.user_profiles?.full_name || "",
    phone: user.phone || "",
    email: user.email,
  });

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    try {
      // Update user email/phone if changed
      if (formData.email !== user.email || formData.phone !== user.phone) {
        const { error: userError } = await supabase
          .from("users")
          .update({
            email: formData.email,
            phone: formData.phone,
          })
          .eq("id", user.id);

        if (userError) throw userError;
      }

      // Update profile (full_name)
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          full_name: formData.full_name,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      showSuccessToast("User details updated successfully.");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating user:", error);
      showErrorToast("Failed to update user details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("users")
        .update({ is_active: !user.is_active })
        .eq("id", user.id);

      if (error) throw error;

      showSuccessToast(
        `User has been ${!user.is_active ? "activated" : "deactivated"}.`
      );
      router.refresh();
    } catch (error) {
      console.error("Error toggling status:", error);
      showErrorToast("Failed to update user status. Please try again.");
    }
  };

  const createdAt = user.created_at ? new Date(user.created_at) : null;
  const lastLoginAt = user.last_login_at ? new Date(user.last_login_at) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Details</CardTitle>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            {isEditing ? (
              <Input
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">
                {user.user_profiles?.full_name || "Not set"}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
            {isEditing ? (
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            {isEditing ? (
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">
                {user.phone || "Not set"}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">User ID</label>
            <p className="mt-1 text-sm font-mono text-gray-900">{user.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t pt-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="mt-1">
              <Badge
                variant={user.is_active ? "default" : "secondary"}
                className="text-xs"
              >
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Verification
            </label>
            <div className="mt-1">
              <Badge
                variant={user.is_verified ? "default" : "secondary"}
                className="text-xs"
              >
                {user.is_verified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>

          <div className="ml-auto">
            <Button
              variant={user.is_active ? "destructive" : "default"}
              size="sm"
              onClick={toggleStatus}
            >
              {user.is_active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="font-medium">
                {createdAt
                  ? createdAt.toLocaleDateString()
                  : "Not available"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Last Login:</span>
              <p className="font-medium">
                {lastLoginAt
                  ? lastLoginAt.toLocaleDateString()
                  : "Never"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
