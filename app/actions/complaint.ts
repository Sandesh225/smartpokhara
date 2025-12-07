"use server";

import { createClient } from "@/lib/supabase/server";

interface GetComplaintsParams {
  status?: string[];
}

export async function getMyComplaints({ status }: GetComplaintsParams = {}) {
  const supabase = await createClient();

  try {
    // 1. Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: "Not authenticated" };
    }

    // 2. Build Query
    let query = supabase
      .from("complaints")
      .select(
        `
        *,
        category:complaint_categories(name),
        subcategory:complaint_subcategories(name),
        ward:wards(ward_number, name),
        department:departments(name)
      `
      )
      .eq("citizen_id", user.id)
      .order("submitted_at", { ascending: false });

    // 3. Apply Filters
    if (status && status.length > 0) {
      query = query.in("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching complaints:", error);
      return { data: [], error: error.message };
    }

    // 4. Transform data for UI (Flatten nested objects)
    const formattedData = data.map((complaint: any) => ({
      ...complaint,
      category_name: complaint.category?.name,
      subcategory_name: complaint.subcategory?.name,
      ward_number: complaint.ward?.ward_number,
      department_name: complaint.department?.name,
      // Ensure boolean flags are present
      is_overdue:
        complaint.sla_due_at &&
        new Date(complaint.sla_due_at) < new Date() &&
        !["resolved", "closed"].includes(complaint.status),
    }));

    return { data: formattedData };
  } catch (error) {
    console.error("Unexpected error in getMyComplaints:", error);
    return { data: [], error: "Internal Server Error" };
  }
}