// lib/auth/session.ts
import { createClient } from "@/lib/supabase/server";
import type { CurrentUser, RoleType } from "@/lib/types/auth";
import { cache } from "react";

/**
 * Fetch the current user with full profile, staff context, and roles.
 * Wrapped in React.cache() to ensure it only hits the database ONCE per request lifecycle,
 * even if called across multiple layouts and pages concurrently.
 */
export const getCurrentUserWithRoles = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();

  try {
    // 1. Get the authenticated Auth User (lightweight check)
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) return null;

    const userId = authUser.id;

    // 2. Fetch all related data in PARALLEL to minimize loading time
    // We trust the SQL Triggers to have already created these records.
    const [userRes, profileRes, staffRes, rolesRes] = await Promise.all([
      // A. Public User Status
      supabase
        .from("users")
        .select("is_active, is_verified, phone")
        .eq("id", userId)
        .maybeSingle(),

      // B. User Profile (Name, Ward, etc.)
      supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),

      // C. Staff Profile (Only exists for staff)
      supabase
        .from("staff_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),

      // D. Assigned Roles
      supabase
        .from("user_roles")
        .select(
          `
        is_primary,
        role:roles!inner (
          role_type,
          is_active
        )
      `
        )
        .eq("user_id", userId),
    ]);

    // 3. Process Roles
    // Flatten the nested structure from Supabase
    const activeRoles = (rolesRes.data || [])
      .filter((r: any) => r.role?.is_active)
      .map((r: any) => r.role.role_type as RoleType);

    // 4. Determine Primary Role
    // Priority: 1. Metadata (synced by trigger, used by middleware) -> 2. Calculated from List -> 3. Fallback
    let primaryRole = authUser.user_metadata?.primary_role as RoleType;

    // Safety check: If metadata is stale or missing, default to first active role or citizen
    if (!primaryRole || !activeRoles.includes(primaryRole)) {
      primaryRole = activeRoles[0] || "citizen";
    }

    // Ensure primary role is in the roles list
    if (!activeRoles.includes(primaryRole)) {
      activeRoles.push(primaryRole);
    }

    // 5. Build and Return the CurrentUser object
    return {
      id: userId,
      email: authUser.email!,
      phone: userRes.data?.phone || authUser.phone || null,

      roles: activeRoles,
      primary_role: primaryRole,

      // Profiles
      profile: profileRes.data || null,
      staff_profile: staffRes.data || null, // Will be null for citizens

      // Status
      is_active: userRes.data?.is_active ?? true,
      is_verified: userRes.data?.is_verified ?? false,
    };
  } catch (error) {
    console.error("Unexpected error in getCurrentUserWithRoles:", error);
    return null;
  }
});

/**
 * Helper to check if a user needs to verify their email
 */
export function isEmailVerified(user: CurrentUser | null): boolean {
  return !!user?.is_verified;
}

/**
 * Update the last_login_at timestamp
 * Call this once on successful dashboard load
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const supabase = await createClient();
  // Fire and forget - don't await this in the main UI thread
  supabase
    .from("users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", userId)
    .then(({ error }) => {
      if (error) console.error("Failed to update last login:", error);
    });
}
