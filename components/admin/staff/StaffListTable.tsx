"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Shield, User, Building2, MapPin } from "lucide-react";

interface StaffMember {
  id: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  profile: {
    full_name: string;
    profile_photo_url: string | null;
  };
  roles: Array<{
    role_type: string;
    role_name: string;
  }>;
}

interface Props {
  onRefresh: () => void;
}

export function StaffListTable({ onRefresh }: Props) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    const supabase = createClient();
    
    // Get all users with staff roles
    const { data, error } = await supabase
      .from("user_roles")
      .select(`
        user:users!inner(
          id,
          email,
          phone,
          is_active,
          profile:user_profiles(
            full_name,
            profile_photo_url
          )
        ),
        role:roles!inner(
          role_type,
          name
        )
      `)
      .in("role.role_type", ["admin", "dept_head", "dept_staff", "ward_staff", "field_staff", "call_center"]);

    if (error) {
      console.error("Error loading staff:", error);
      setLoading(false);
      return;
    }

    // Group by user
    const staffMap = new Map<string, StaffMember>();
    
    data?.forEach((item: any) => {
      const userId = item.user.id;
      if (!staffMap.has(userId)) {
        staffMap.set(userId, {
          id: userId,
          email: item.user.email,
          phone: item.user.phone,
          is_active: item.user.is_active,
          profile: item.user.profile[0] || { full_name: "Unknown", profile_photo_url: null },
          roles: []
        });
      }
      
      staffMap.get(userId)!.roles.push({
        role_type: item.role.role_type,
        role_name: item.role.name
      });
    });

    setStaff(Array.from(staffMap.values()));
    setLoading(false);
  };

  const getRoleBadgeColor = (roleType: string) => {
    const colors: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800",
      dept_head: "bg-blue-100 text-blue-800",
      dept_staff: "bg-cyan-100 text-cyan-800",
      ward_staff: "bg-green-100 text-green-800",
      field_staff: "bg-orange-100 text-orange-800",
      call_center: "bg-indigo-100 text-indigo-800"
    };
    return colors[roleType] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members</h3>
        <p className="mt-1 text-sm text-gray-500">
          Invite staff members to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Staff Member
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Roles
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {staff.map((member) => (
            <tr key={member.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    {member.profile.profile_photo_url ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={member.profile.profile_photo_url}
                        alt=""
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {member.profile.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {member.roles.map((role, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeColor(role.role_type)}`}
                    >
                      {role.role_name}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.phone || "—"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {member.is_active ? (
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}