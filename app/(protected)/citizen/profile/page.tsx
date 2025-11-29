/**
 * Citizen profile settings page
 * Manage account information and preferences
 */

"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CurrentUser } from "@/lib/types/auth";
import { showSuccessToast, showErrorToast } from "@/lib/shared/toast-service";

interface ProfileFormData {
  full_name: string;
  phone: string;
  ward_id: string;
  address_line1: string;
  address_line2: string;
  landmark: string;
  language_preference: "en" | "ne";
}

interface Ward {
  id: string;
  ward_number: number;
  name: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wards, setWards] = useState<Ward[]>([]);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    phone: "",
    ward_id: "",
    address_line1: "",
    address_line2: "",
    landmark: "",
    language_preference: "en",
  });

  const supabase = createClient();

  useEffect(() => {
    loadUserData();
    loadWards();
  }, []);

  const loadUserData = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      // Fetch user profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .single();

      // Fetch user data
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profile && userData) {
        setUser({
          ...userData,
          profile,
          roles: [],
          userRoles: [],
        });

        setFormData({
          full_name: profile.full_name || "",
          phone: userData.phone || "",
          ward_id: profile.ward_id || "",
          address_line1: profile.address_line1 || "",
          address_line2: profile.address_line2 || "",
          landmark: profile.landmark || "",
          language_preference:
            (profile.language_preference as "en" | "ne") || "en",
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      showErrorToast("Error", "Failed to load your profile");
    } finally {
      setLoading(false);
    }
  };

  const loadWards = async () => {
    try {
      const { data } = await supabase
        .from("wards")
        .select("id, ward_number, name")
        .eq("is_active", true)
        .order("ward_number");

      if (data) {
        setWards(data);
      }
    } catch (error) {
      console.error("Error loading wards:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      // Update user phone
      const { error: userError } = await supabase
        .from("users")
        .update({ phone: formData.phone })
        .eq("id", authUser.id);

      if (userError) throw userError;

      // Update user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          full_name: formData.full_name,
          ward_id: formData.ward_id || null,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          landmark: formData.landmark,
          language_preference: formData.language_preference,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", authUser.id);

      if (profileError) throw profileError;

      showSuccessToast(
        "Profile updated",
        "Your information has been saved successfully."
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      showErrorToast("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account information and preferences.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="ward_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ward
              </label>
              <select
                id="ward_id"
                value={formData.ward_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ward_id: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Ward</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    Ward {ward.ward_number} - {ward.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="language_preference"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Language Preference
              </label>
              <select
                id="language_preference"
                value={formData.language_preference}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    language_preference: e.target.value as "en" | "ne",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="ne">नेपाली (Nepali)</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="address_line1"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address Line 1
            </label>
            <input
              type="text"
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  address_line1: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="address_line2"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address Line 2
            </label>
            <input
              type="text"
              id="address_line2"
              value={formData.address_line2}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  address_line2: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="landmark"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Landmark
            </label>
            <input
              type="text"
              id="landmark"
              value={formData.landmark}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, landmark: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nearby landmarks for easy identification"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email Address</dt>
            <dd className="text-sm text-gray-900">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Account Status
            </dt>
            <dd className="text-sm text-gray-900">
              {user?.is_verified ? "Verified" : "Not Verified"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Member Since</dt>
            <dd className="text-sm text-gray-900">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Login</dt>
            <dd className="text-sm text-gray-900">
              {user?.last_login_at
                ? new Date(user.last_login_at).toLocaleDateString()
                : "N/A"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
