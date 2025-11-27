// app/(protected)/admin/complaints/[id]/page.tsx

import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import { AdminComplaintDetailClient } from "@/components/admin/admin-complaint-detail-client";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = params;
  const supabase = await createClient();

  const { data: complaint } = await supabase
    .from("complaints")
    .select("tracking_code, title")
    .eq("id", id)
    .single();

  return {
    title: complaint
      ? `${complaint.tracking_code} - ${complaint.title}`
      : "Complaint Details",
    description: "View and manage complaint details",
  };
}

export default async function AdminComplaintPage({ params }: PageProps) {
  const { id } = params;
  const user = await getCurrentUserWithRoles();

  if (!user || !isAdmin(user)) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Fetch complaint with all related data
  const { data: complaint, error } = await supabase
    .from("complaints")
    .select(
      `
      *,
      category:complaint_categories(*),
      subcategory:complaint_subcategories(*),
      ward:wards(*),
      department:departments(id, name, code),
      citizen:users!complaints_citizen_id_fkey(
        id,
        email,
        user_profiles(full_name, phone_number)
      ),
      assigned_staff:users!complaints_assigned_staff_id_fkey(
        id,
        email,
        user_profiles(full_name)
      ),
      attachments:complaint_attachments(
        id,
        file_name,
        file_url,
        file_type,
        uploaded_at
      ),
      status_history:complaint_status_history(
        id,
        old_status,
        new_status,
        note,
        changed_at,
        changed_by:users(id, email, user_profiles(full_name))
      ),
      escalations:complaint_escalations(
        id,
        reason,
        sla_breached,
        escalated_at,
        resolved_at,
        resolution_note,
        escalated_by_user:users!complaint_escalations_escalated_by_user_id_fkey(id, email, user_profiles(full_name)),
        escalated_to_user:users!complaint_escalations_escalated_to_user_id_fkey(id, email, user_profiles(full_name)),
        escalated_to_department:departments(name)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !complaint) {
    console.error("Error fetching complaint:", error);
    redirect("/admin/complaints");
  }

  // Fetch departments
  const { data: departments = [] } = await supabase
    .from("departments")
    .select("id, name, code, head_user_id")
    .eq("is_active", true);

  // Fetch staff users (admin, dept_head, dept_staff, field_staff)
  const { data: roles = [] } = await supabase
    .from("roles")
    .select("id")
    .in("role_type", ["admin", "dept_head", "dept_staff", "field_staff"]);

  const roleIds = roles.map((r) => r.id);

  const { data: userRoles = [] } = await supabase
    .from("user_roles")
    .select("user_id")
    .in("role_id", roleIds);

  const userIds = Array.from(new Set(userRoles.map((ur) => ur.user_id)));

  const { data: staffUsers = [] } = await supabase
    .from("users")
    .select("id, email, user_profiles(full_name)")
    .in("id", userIds);

  return (
    <AdminComplaintDetailClient
      complaint={complaint}
      departments={departments}
      staffUsers={staffUsers}
    />
  );
}
