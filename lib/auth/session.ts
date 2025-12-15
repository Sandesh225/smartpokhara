import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type {
  CurrentUser,
  UserProfile,
  UserRole,
  RoleType,
} from "@/lib/types/auth";

/**
 * Create a service role client that bypasses RLS
 * ONLY use this for initial user setup operations
 */
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Fetch the current user with profile AND staff profile
 * Fixed: Now fetches staff_profiles table to ensure isStaff checks pass
 */
export async function getCurrentUserWithRoles(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  try {
    // 1. Get authenticated user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) return null;

    const userId = authUser.id;

    // 2. Fetch user record
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    // Auto-create logic (Service Role)
    if (!userData) {
      const created = await createUserRecordServiceRole(authUser);
      if (!created) return null;
      // Recursively call to get fresh data
      return getCurrentUserWithRoles();
    }

    // 3. Fetch user profile
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profileData) {
      await createUserProfileServiceRole(userId, authUser.email || "User");
    }

    // 4. Fetch Staff Profile (CRITICAL ADDITION)
    const { data: staffProfileData } = await supabase
      .from("staff_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // 5. Fetch Roles
    const { data: userRolesData } = await supabase
      .from("user_roles")
      .select(
        `
        id, user_id, role_id, assigned_by, assigned_at, expires_at, created_at,
        role:roles(id, name, role_type, description, permissions, is_active)
      `
      )
      .eq("user_id", userId);

    // Filter active roles
    const activeRoles = ((userRolesData as any[]) || []).filter((ur) => {
      if (!ur.role) return false;
      if (!ur.role.is_active) return false;
      if (ur.expires_at && new Date(ur.expires_at) < new Date()) return false;
      return true;
    });

    // If no roles, assign default citizen
    if (
      activeRoles.length === 0 &&
      (!userRolesData || userRolesData.length === 0)
    ) {
      await assignDefaultCitizenRoleServiceRole(userId);
    }

    // 6. Build Object
    return buildCurrentUserObject(
      userId,
      userData,
      profileData,
      staffProfileData,
      activeRoles
    );
  } catch (error) {
    console.error("Unexpected error in getCurrentUserWithRoles:", error);
    return null;
  }
}

/**
 * Build CurrentUser object
 */
function buildCurrentUserObject(
  userId: string,
  userData: any,
  profileData: UserProfile | null,
  staffProfileData: any | null,
  userRoles: UserRole[] | null
): CurrentUser {
  const roles: RoleType[] = (userRoles || [])
    .filter((ur) => ur.role && ur.role.is_active)
    .map((ur) => ur.role!.role_type as RoleType);

  return {
    id: userData.id,
    email: userData.email,
    phone: userData.phone || null,
    is_active: userData.is_active,
    is_verified: userData.is_verified,
    email_verified_at: userData.email_verified_at || null,
    phone_verified_at: userData.phone_verified_at || null,
    last_login_at: userData.last_login_at || null,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    profile: profileData,
    staff_profile: staffProfileData || undefined, // Attached here
    roles,
    userRoles: userRoles || [],
  };
}

// --- Service Role Helpers (No changes needed here, keeping logic consistent) ---

async function createUserRecordServiceRole(authUser: any): Promise<boolean> {
  try {
    const serviceSupabase = getServiceClient();
    const { error } = await serviceSupabase.from("users").insert({
      id: authUser.id,
      email: authUser.email,
      external_auth_provider: "email",
      is_active: true,
      is_verified: !!authUser.email_confirmed_at,
      email_verified_at: authUser.email_confirmed_at || null,
    });
    if (error && error.code !== "23505") return false;
    return true;
  } catch {
    return false;
  }
}

async function createUserProfileServiceRole(
  userId: string,
  email: string
): Promise<boolean> {
  try {
    const serviceSupabase = getServiceClient();
    const { error } = await serviceSupabase.from("user_profiles").insert({
      user_id: userId,
      full_name: email.split("@")[0] || "User",
      language_preference: "en",
    });
    if (error && error.code !== "23505") return false;
    return true;
  } catch {
    return false;
  }
}

async function assignDefaultCitizenRoleServiceRole(
  userId: string
): Promise<boolean> {
  try {
    const serviceSupabase = getServiceClient();
    const { data: role } = await serviceSupabase
      .from("roles")
      .select("id")
      .eq("role_type", "citizen")
      .maybeSingle();
    if (!role) return false;
    const { error } = await serviceSupabase
      .from("user_roles")
      .insert({ user_id: userId, role_id: role.id, assigned_by: userId });
    return !error || error.code === "23505";
  } catch {
    return false;
  }
}

export function isEmailVerified(user: CurrentUser | null): boolean {
  return !!user?.is_verified;
}

export async function updateLastLogin(userId: string): Promise<void> {
  const supabase = await createClient();
  try {
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", userId);
  } catch (error) {
    console.error(error);
  }
}
