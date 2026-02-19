import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { 
    UserProfile, 
    UserPreferences, 
    DEFAULT_PREFERENCES,
    CitizenProfile,
    ComplaintHistoryItem,
    PaymentHistoryItem,
    Ward
} from "./types";

export const userApi = {
  // ==========================================
  // USER PROFILE
  // ==========================================

  /**
   * Get Full User Profile
   */
  async getProfile(client: SupabaseClient<Database>, userId: string) {
    const { data, error } = await (client as any)
      .from("user_profiles")
      .select(`
        *,
        ward:wards!ward_id (id, ward_number, name, name_nepali)
      `)
      .eq("user_id", userId)
      .single();

    if (error) {
       if (error.code === "PGRST116") return null;
       throw error;
    }

    // Fetch user account data (email/phone/verified)
    const { data: userAccount } = await (client as any)
      .from("users") 
      .select("email, phone, is_verified, is_active")
      .eq("id", userId)
      .single();

    return {
        ...data,
        email: (userAccount as any)?.email,
        phone: (userAccount as any)?.phone,
        is_verified: (userAccount as any)?.is_verified,
        is_active: (userAccount as any)?.is_active,
        ward_number: (data as any).ward?.ward_number,
        ward_name: (data as any).ward?.name,
        ward_name_nepali: (data as any).ward?.name_nepali
    } as UserProfile;
  },

  /**
   * Update Profile
   */
  async updateProfile(client: SupabaseClient<Database>, userId: string, updates: Partial<UserProfile>) {
      const { phone, ...profileUpdates } = updates;

      if (phone !== undefined) {
          await (client as any).from("users").update({ phone }).eq("id", userId);
      }

      // Filter out non-profile fields nicely
      const { 
          email, 
          is_verified, 
          ward_number, 
          ward_name, 
          ward_name_nepali, 
          ...cleanUpdates 
      } = profileUpdates as any;

      const { data, error } = await (client as any)
        .from("user_profiles")
        .update(cleanUpdates)
        .eq("user_id", userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
  },

  /**
   * Upload Profile Photo
   */
  async uploadProfilePhoto(client: SupabaseClient<Database>, userId: string, file: File) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await (client as any).storage
        .from("profile-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = (client as any).storage.from("profile-photos").getPublicUrl(filePath);

      const { error: updateError } = await (client as any)
        .from("user_profiles")
        .update({ profile_photo_url: (publicUrl as any).publicUrl })
        .eq("user_id", userId);

      if (updateError) throw updateError;
      return (publicUrl as any).publicUrl;
  },

  /**
   * Get Wards List
   */
  async getWards(client: SupabaseClient<Database>) {
      const { data, error } = await (client as any)
        .from("wards")
        .select("id, ward_number, name, name_nepali")
        .eq("is_active", true)
        .order("ward_number");
      
      if (error) throw error;
      return data as Ward[];
  },

  // ==========================================
  // PREFERENCES
  // ==========================================

  async getPreferences(client: SupabaseClient<Database>, userId: string) {
      const { data, error } = await (client as any)
        .from("user_profiles")
        .select("notification_preferences")
        .eq("user_id", userId)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      
      const stored = (data as any)?.notification_preferences || {};
      return { ...DEFAULT_PREFERENCES, ...stored, user_id: userId } as UserPreferences;
  },

  async updatePreferences(client: SupabaseClient<Database>, userId: string, updates: Partial<UserPreferences>) {
      const current = await this.getPreferences(client, userId);
      const { user_id, id, ...rest } = current as any; 
      const newPrefs = { ...rest, ...updates };

      // Remove keys that shouldn't be in JSON
      delete (newPrefs as any).id;
      delete (newPrefs as any).user_id;

      const { error } = await (client as any)
        .from("user_profiles")
        .update({ notification_preferences: newPrefs })
        .eq("user_id", userId);

      if (error) throw error;
  },

  // ==========================================
  // ADMIN: CITIZEN DIRECTORY
  // ==========================================

  async getCitizens(client: SupabaseClient<Database>, search?: string, page = 1, limit = 10) {
    let query = (client as any)
      .from("users")
      .select(`
        id, email, phone, is_active, is_verified, created_at,
        profile:user_profiles!user_id(
            full_name, 
            citizenship_number,
            full_name_nepali,
            ward:wards(ward_number, name, name_nepali) 
        )
      `, { count: 'exact' })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.ilike("email", `%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const mapped = (data || []).map((u: any) => ({
        user_id: u.id,
        email: u.email,
        phone: u.phone,
        is_active: u.is_active,
        is_verified: u.is_verified,
        created_at: u.created_at,
        full_name: u.profile?.full_name || "Unknown",
        full_name_nepali: u.profile?.full_name_nepali,
        citizenship_number: u.profile?.citizenship_number,
        ward_number: u.profile?.ward?.ward_number,
        ward_name: u.profile?.ward?.name,
        ward_name_nepali: u.profile?.ward?.name_nepali,
        // Fill other UserProfile fields with null if missing from quick verify select
        address_line1: null,
        address_line2: null,
        landmark: null,
        profile_photo_url: null,
        ward_id: null,
        id: u.profile?.id
    }));

    return { data: mapped, count };
  },

  async getCitizenDetails(client: SupabaseClient<Database>, userId: string) {
    const { data, error } = await (client as any)
      .from("users")
      .select(`
        id, email, phone, is_active, is_verified, created_at,
        profile:user_profiles!user_id(*, ward:wards(ward_number, name, name_nepali)) 
      `)
      .eq("id", userId)
      .single();

    if (error) return null;

    return {
      user_id: (data as any).id,
      email: (data as any).email,
      phone: (data as any).phone,
      is_active: (data as any).is_active,
      is_verified: (data as any).is_verified,
      created_at: (data as any).created_at,
      ...(data as any).profile, 
      ward_number: (data as any).profile?.ward?.ward_number,
      ward_name: (data as any).profile?.ward?.name,
      ward_name_nepali: (data as any).profile?.ward?.name_nepali
    } as CitizenProfile;
  },

  async getCitizenComplaints(client: SupabaseClient<Database>, userId: string) {
    const { data, error } = await (client as any)
      .from("complaints")
      .select(`
        id, tracking_code, title, status, priority, submitted_at,
        category:complaint_categories(name)
      `)
      .eq("citizen_id", userId)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return data as unknown as ComplaintHistoryItem[];
  },

  async getCitizenPayments(client: SupabaseClient<Database>, userId: string) {
    const { data, error } = await (client as any)
      .from("bills")
      .select(`
        id, bill_number, bill_type, total_amount, status, generated_date, due_date, paid_date
      `)
      .eq("citizen_id", userId)
      .order("generated_date", { ascending: false });

    if (error) throw error;
    return data as PaymentHistoryItem[];
  },

  // ==========================================
  // ADMIN: USER ROLE MANAGEMENT
  // ==========================================

  /**
   * Get Admin User Details
   */
  async getAdminUserDetails(client: SupabaseClient<Database>, userId: string) {
      const { data, error } = await (client as any)
        .from("users")
        .select(`
          *,
          user_profiles(*),
          user_roles!user_roles_user_id_fkey(
            id, role_id, assigned_by, assigned_at, is_primary,
            role:roles(*)
          ),
          staff_profiles(*)
        `)
        .eq("id", userId)
        .single();
      
      if (error) throw error;
      return data;
  },

  /**
   * Assign User Role
   */
  async assignUserRole(
    client: SupabaseClient<Database>, 
    params: {
      userId: string;
      roleId: string;
      roleType: string;
      assignedBy: string;
      departmentId?: string;
      wardId?: string;
    }
  ) {
    const { userId, roleId, roleType, assignedBy, departmentId, wardId } = params;

    // 1. Assign role in user_roles
    const { error: roleError } = await (client as any)
      .from("user_roles")
      .insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy
      });

    if (roleError) throw roleError;

    // 2. If staff/supervisor role, update staff_profiles
    if (["dept_head", "dept_staff", "ward_staff", "field_staff", "admin"].includes(roleType)) {
       // Check if staff profile exists
       const { data: existingStaff } = await (client as any)
         .from("staff_profiles")
         .select("id")
         .eq("user_id", userId)
         .single();

       const staffData: any = {
           department_id: departmentId || null,
           ward_id: wardId || null,
       };

       if (existingStaff) {
           const { error: staffError } = await (client as any)
             .from("staff_profiles")
             .update(staffData)
             .eq("user_id", userId);
           if (staffError) throw staffError;
       } else {
           const { error: staffError } = await (client as any)
             .from("staff_profiles")
             .insert({
                 user_id: userId,
                 ...staffData
             });
           if (staffError) throw staffError;
       }
    }
  },

  /**
   * Remove User Role
   */
  async removeUserRole(client: SupabaseClient<Database>, userId: string, roleId: string, roleType: string) {
      // 1. Remove from user_roles
      const { error: roleError } = await (client as any)
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role_id", roleId);
      
      if (roleError) throw roleError;
  }
};
