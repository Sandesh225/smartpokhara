// app/admin/complaints/[id]/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import { AdminComplaintDetailClient } from "@/components/admin/admin-complaint-detail-client";
import type {
  ComplaintFull,
  Department,
  StaffUser,
} from "@/lib/types/complaints";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  try {
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
  } catch (error) {
    return {
      title: "Complaint Details",
      description: "View and manage complaint details",
    };
  }
}

export default async function AdminComplaintPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUserWithRoles();

  if (!user || !isAdmin(user)) {
    redirect("/login");
  }

  const supabase = await createClient();

  try {
    // Fetch complaint with all related data
    const { data: complaintRaw, error } = await supabase
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

    if (error || !complaintRaw) {
      console.error(
        "Error fetching complaint:",
        error?.message || "Complaint not found"
      );
      redirect("/admin/complaints");
    }

    const complaint = complaintRaw as ComplaintFull;

    // Fetch departments and staff in parallel
    const [departmentsResult, staffResult] = await Promise.all([
      supabase
        .from("departments")
        .select("id, name, code, head_user_id")
        .eq("is_active", true),

      supabase.rpc("get_staff_users_with_roles"),
    ]);

    const departments = (departmentsResult.data ?? []) as Department[];
    const staffUsers = (staffResult.data ?? []) as StaffUser[];

    return (
      <AdminComplaintDetailClient
        complaint={complaint}
        departments={departments}
        staffUsers={staffUsers}
      />
    );
  } catch (error) {
    console.error("Error in admin complaint page:", error);
    redirect("/admin/complaints");
  }
}