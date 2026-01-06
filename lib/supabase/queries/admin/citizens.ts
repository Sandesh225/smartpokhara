import { SupabaseClient } from '@supabase/supabase-js';
import { CitizenProfile, ComplaintHistoryItem, PaymentHistoryItem } from '@/types/admin-citizens';

export const citizenQueries = {
  // Fetch list of all citizens
  async getCitizens(
    client: SupabaseClient,
    search?: string,
    page = 1,
    limit = 10
  ) {
    let query = client
      .from("users")
      .select(
        `
        id, email, phone, is_active, is_verified, created_at,
        profile:user_profiles!user_id(
            full_name, 
            citizenship_number,
            ward:wards(ward_number) 
        )
      `
      )
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Note: Search logic remains the same
    if (search) {
      query = query.ilike("email", `%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  // Fetch single citizen details
  async getCitizenDetails(
    client: SupabaseClient,
    userId: string
  ): Promise<CitizenProfile | null> {
    const { data, error } = await client
      .from("users")
      .select(
        `
        id, email, phone, is_active, is_verified, created_at,
        profile:user_profiles!user_id(*, ward:wards(ward_number)) 
      `
      )
      .eq("id", userId)
      .single();

    if (error) return null;

    return {
      user_id: data.id,
      email: data.email,
      phone: data.phone,
      is_active: data.is_active,
      is_verified: data.is_verified,
      created_at: data.created_at,
      ...data.profile, // Flattens profile data
    };
  },

  // Fetch complaints for a specific citizen
  async getCitizenComplaints(
    client: SupabaseClient,
    userId: string
  ): Promise<ComplaintHistoryItem[]> {
    const { data, error } = await client
      .from("complaints")
      .select(
        `
        id, tracking_code, title, status, priority, submitted_at,
        category:complaint_categories(name)
      `
      )
      .eq("citizen_id", userId)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Fetch payments for a specific citizen
  async getCitizenPayments(
    client: SupabaseClient,
    userId: string
  ): Promise<PaymentHistoryItem[]> {
    const { data, error } = await client
      .from("bills")
      .select(
        `
        id, bill_number, bill_type, total_amount, status, generated_date, paid_date
      `
      )
      .eq("citizen_id", userId)
      .order("generated_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },
};