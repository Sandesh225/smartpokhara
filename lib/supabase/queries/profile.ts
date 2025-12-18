import { supabase } from "../client";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  full_name_nepali: string | null;
  email: string;
  phone: string | null;
  ward_id: string | null;
  address_line1: string | null;
  address_line2: string | null;
  landmark: string | null;
  profile_photo_url: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  in_app_notifications: boolean;
  push_notifications: boolean;
  complaint_updates: boolean;
  new_bills: boolean;
  payment_reminders: boolean;
  new_notices: boolean;
  digest_frequency: "immediate" | "daily" | "weekly";
}

export const profileService = {
  // 1. Get Full User Profile (Joins auth.users via public.users proxy if needed, or just profiles)
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Fetch core profile data
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;

      // Fetch user account data (email, phone, verification status)
      const { data: userAccount, error: userError } = await supabase
        .from("users")
        .select("email, phone, is_verified")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      return {
        ...profile,
        email: userAccount.email,
        phone: userAccount.phone,
        is_verified: userAccount.is_verified,
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  },

  // 2. Update Profile Details
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      // Separate profile fields from user account fields
      const { email, phone, is_verified, ...profileUpdates } = updates;

      const { data, error } = await supabase
        .from("user_profiles")
        .update(profileUpdates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }
  },

  // 3. Upload Profile Photo
  async uploadProfilePhoto(userId: string, file: File) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      // Update Profile Record
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ profile_photo_url: publicUrl })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      return { success: false, error: error.message };
    }
  },

  // 4. Get Notification Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error; // Ignore "Row not found"
      
      // If no preferences exist, create default
      if (!data) {
        return await this.createDefaultPreferences(userId);
      }

      return data;
    } catch (error) {
      console.error("Error fetching preferences:", error);
      return null;
    }
  },

  // Helper: Create default preferences
  async createDefaultPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from("user_notification_preferences")
      .insert({ user_id: userId })
      .select()
      .single();
    
    if (error) return null;
    return data;
  },

  // 5. Update Notification Preferences
  async updatePreferences(userId: string, updates: Partial<UserPreferences>) {
    try {
      const { error } = await supabase
        .from("user_notification_preferences")
        .update(updates)
        .eq("user_id", userId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};