"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getAssignedStaffProfile(assignedStaffId: string) {
  if (!assignedStaffId) return null;
  
  const supabase = createAdminClient();
  
  const { data: userProfile, error: upErr } = await supabase
    .from("user_profiles")
    .select("user_id, full_name, profile_photo_url")
    .eq("user_id", assignedStaffId)
    .single();
    
  if (upErr) return null;
  
  const { data: staffProfile, error: spErr } = await supabase
    .from("staff_profiles")
    .select("staff_code, staff_role")
    .eq("user_id", assignedStaffId)
    .single();
    
  return {
    user_id: userProfile.user_id,
    full_name: userProfile.full_name,
    profile_photo_url: userProfile.profile_photo_url,
    staff: spErr || !staffProfile ? undefined : {
      staff_code: staffProfile.staff_code,
      staff_role: staffProfile.staff_role
    }
  };
}
