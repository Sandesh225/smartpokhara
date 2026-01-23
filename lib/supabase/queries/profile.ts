// ============================================================================
// FILE: lib/supabase/queries/profile.ts
// ============================================================================
import { createClient } from "../client";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  full_name_nepali: string | null;
  email: string;
  phone: string | null;
  ward_id: string | null;
  ward_number: number | null;
  ward_name: string | null;
  ward_name_nepali: string | null;
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
  // 1. Get Full User Profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const supabase = createClient();

      // Fetch profile with ward information
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select(
          `
          *,
          wards:ward_id (
            id,
            ward_number,
            name,
            name_nepali
          )
        `
        )
        .eq("user_id", userId)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      // Fetch user account data
      const { data: userAccount, error: userError } = await supabase
        .from("users")
        .select("email, phone, is_verified")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("User account fetch error:", userError);
        throw userError;
      }

      // Extract ward info
      const wardInfo = profile.wards as any;

      return {
        ...profile,
        email: userAccount.email,
        phone: userAccount.phone,
        is_verified: userAccount.is_verified,
        ward_number: wardInfo?.ward_number || null,
        ward_name: wardInfo?.name || null,
        ward_name_nepali: wardInfo?.name_nepali || null,
        wards: undefined, // Remove the nested object
      };
    } catch (error: any) {
      console.error("Error fetching profile:", error.message || error);
      return null;
    }
  },

  // 2. Update Profile Details
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const supabase = createClient();

      // Separate profile fields from user account fields
      const {
        email,
        phone,
        is_verified,
        ward_number,
        ward_name,
        ward_name_nepali,
        ...profileUpdates
      } = updates;

      // Update phone in users table if provided
      if (phone !== undefined) {
        const { error: phoneError } = await supabase
          .from("users")
          .update({ phone })
          .eq("id", userId);

        if (phoneError) {
          console.error("Phone update error:", phoneError);
        }
      }

      // Update profile
      const { data, error } = await supabase
        .from("user_profiles")
        .update(profileUpdates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Profile update error:", error);
        throw error;
      }

      return { success: true, data };
    } catch (error: any) {
      console.error("Error updating profile:", error.message || error);
      return { success: false, error: error.message };
    }
  },

  // 3. Upload Profile Photo
  async uploadProfilePhoto(userId: string, file: File) {
    try {
      const supabase = createClient();

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Photo upload error:", uploadError);
        throw uploadError;
      }

      // Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(filePath);

      // Update Profile Record
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ profile_photo_url: publicUrl })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Photo URL update error:", updateError);
        throw updateError;
      }

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error("Error uploading photo:", error.message || error);
      return { success: false, error: error.message };
    }
  },

  // 4. Get Notification Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Preferences fetch error:", error);
        throw error;
      }

      // If no preferences exist, create default
      if (!data) {
        return await this.createDefaultPreferences(userId);
      }

      return data;
    } catch (error: any) {
      console.error("Error fetching preferences:", error.message || error);
      return null;
    }
  },

  // Helper: Create default preferences
  async createDefaultPreferences(
    userId: string
  ): Promise<UserPreferences | null> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("user_notification_preferences")
        .insert({
          user_id: userId,
          email_notifications: true,
          sms_notifications: true,
          in_app_notifications: true,
          push_notifications: true,
          complaint_updates: true,
          new_bills: true,
          payment_reminders: true,
          new_notices: true,
          digest_frequency: "immediate",
        })
        .select()
        .single();

      if (error) {
        console.error("Create preferences error:", error);
        return null;
      }

      return data;
    } catch (error: any) {
      console.error(
        "Error creating default preferences:",
        error.message || error
      );
      return null;
    }
  },

  // 5. Update Notification Preferences
  async updatePreferences(userId: string, updates: Partial<UserPreferences>) {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("user_notification_preferences")
        .update(updates)
        .eq("user_id", userId);

      if (error) {
        console.error("Preferences update error:", error);
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error updating preferences:", error.message || error);
      return { success: false, error: error.message };
    }
  },
};
