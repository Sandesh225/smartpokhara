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
  id?: string; // Optional, maps to profile ID
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

const DEFAULT_PREFERENCES: UserPreferences = {
  user_id: "",
  email_notifications: true,
  sms_notifications: true,
  in_app_notifications: true,
  push_notifications: false,
  complaint_updates: true,
  new_bills: true,
  payment_reminders: true,
  new_notices: true,
  digest_frequency: "immediate",
};

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
        // PGRST116 means no rows returned, which is expected if profile isn't created yet
        if (profileError.code !== "PGRST116") {
          console.error("Profile fetch error:", profileError);
        }
        return null;
      }

      // Fetch user account data
      const { data: userAccount, error: userError } = await supabase
        .from("users")
        .select("email, phone, is_verified")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("User account fetch error:", userError);
        // Continue with just profile data if user fetch fails, though unlikely
      }

      // Extract ward info
      const wardInfo = profile.wards as any;

      return {
        ...profile,
        email: userAccount?.email || "",
        phone: userAccount?.phone || null,
        is_verified: userAccount?.is_verified || false,
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

  // 4. Get Notification Preferences (FIXED: Uses user_profiles JSONB column)
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, notification_preferences")
        .eq("user_id", userId)
        .single();

      if (error) {
        // If profile doesn't exist yet, return defaults
        if (error.code === "PGRST116") {
          return { ...DEFAULT_PREFERENCES, user_id: userId };
        }
        console.error("Preferences fetch error:", error);
        throw error;
      }

      // Retrieve stored JSON or empty object
      const storedPrefs = (data?.notification_preferences ||
        {}) as Partial<UserPreferences>;

      // Merge defaults with stored preferences
      return {
        ...DEFAULT_PREFERENCES,
        ...storedPrefs,
        id: data.id, // Use profile ID as key if needed
        user_id: userId,
      };
    } catch (error: any) {
      console.error("Error fetching preferences:", error.message || error);
      return null;
    }
  },

  // 5. Update Notification Preferences (FIXED: Updates user_profiles JSONB column)
  async updatePreferences(userId: string, updates: Partial<UserPreferences>) {
    try {
      const supabase = createClient();

      // 1. Fetch current to merge
      const { data: currentData } = await supabase
        .from("user_profiles")
        .select("notification_preferences")
        .eq("user_id", userId)
        .single();

      const currentPrefs = (currentData?.notification_preferences ||
        {}) as UserPreferences;

      // 2. Merge updates
      const newPrefs = { ...currentPrefs, ...updates };

      // Clean up fields we don't want in the JSON blob
      delete (newPrefs as any).id;
      delete (newPrefs as any).user_id;

      // 3. Save back to user_profiles
      const { error } = await supabase
        .from("user_profiles")
        .update({ notification_preferences: newPrefs })
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

  // Deprecated: createDefaultPreferences
  // No longer needed as we merge defaults in getUserPreferences
};