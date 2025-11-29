// ============================================================================
// FILE: lib/api/categories.ts
// API for fetching categories and subcategories
// ============================================================================
import { createClient } from '@/lib/supabase/client';

export async function getComplaintCategories() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('complaint_categories')
    .select(`
      *,
      complaint_subcategories(*)
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return data;
}
