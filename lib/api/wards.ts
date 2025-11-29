
// ============================================================================
// FILE: lib/api/wards.ts
// API for fetching wards
// ============================================================================

import { createClient } from "../supabase/client";

export async function getWards() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('wards')
    .select('*')
    .eq('is_active', true)
    .order('ward_number', { ascending: true });

  if (error) {
    console.error('Error fetching wards:', error);
    throw new Error(`Failed to fetch wards: ${error.message}`);
  }

  return data;
}