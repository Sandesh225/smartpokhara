'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- CATEGORY MANAGEMENT ---
export async function saveSecuritySettings(formData: FormData) {
  const supabase = await createClient();
  
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Parse Form Data
  const session_timeout = parseInt(formData.get("session_timeout") as string) || 30;
  const password_expiry = parseInt(formData.get("password_expiry") as string) || 90;
  const require_2fa = formData.get("require_2fa") === "on";

  // 3. Update Database
  const { error } = await supabase
    .from('system_configurations')
    .update({ 
      value: { 
        session_timeout, 
        password_expiry, 
        require_2fa 
      },
      updated_at: new Date().toISOString(),
      updated_by: user?.id
    })
    .eq('key', 'security_policy');

  if (error) throw new Error(`Failed to save security settings: ${error.message}`);
  revalidatePath('/admin/settings/system');
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('complaint_categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/settings/categories');
}

// --- MOCK SYSTEM ACTIONS (Since system_settings table wasn't in schema) ---
// In a real app, these would update a 'system_settings' table or Redis
export async function toggleMaintenanceMode(formData: FormData) {
  const supabase = await createClient();
  
  // 1. Get current user for the audit trail (updated_by)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Parse Form Data
  // Checkboxes usually return "on" if checked, or null if unchecked
  const enabled = formData.get("enabled") === "on";

  // 3. Update Database
  const { error } = await supabase
    .from('system_configurations')
    .update({ 
      value: { enabled }, // Saves as JSONB: {"enabled": true/false}
      updated_at: new Date().toISOString(),
      updated_by: user?.id
    })
    .eq('key', 'maintenance_mode');

  if (error) throw new Error(`Failed to toggle maintenance mode: ${error.message}`);
  revalidatePath('/admin/settings/system');
}
export async function updateSystemConfig(key: string, value: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from('system_configurations')
    .update({ 
      value, 
      updated_at: new Date().toISOString(),
      updated_by: user?.id 
    })
    .eq('key', key);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/settings/system');
}
export async function saveCategory(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const department_id = formData.get("department_id") as string;
  const sla_days = parseInt(formData.get("sla_days") as string);

  const data = {
    name,
    description,
    default_department_id: department_id || null,
    default_sla_days: sla_days,
    is_active: true
  };

  let error;
  if (id) {
    ({ error } = await supabase.from('complaint_categories').update(data).eq('id', id));
  } else {
    ({ error } = await supabase.from('complaint_categories').insert(data));
  }

  if (error) throw new Error(error.message);
  revalidatePath('/admin/settings/categories');
}