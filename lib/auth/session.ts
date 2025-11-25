/**
 * Session management and user data fetching
 * 
 * ✅ PERMANENT FIX: Uses service role for initial setup to bypass RLS
 * ✅ Handles new users reliably
 * ✅ No duplicate key errors
 */

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import type { 
  CurrentUser, 
  UserProfile, 
  UserRole, 
  RoleType
} from '@/lib/types/auth';

/**
 * Create a service role client that bypasses RLS
 * ONLY use this for initial user setup operations
 */
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Add this to .env.local
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

/**
 * Fetch the current user with profile and roles
 * This is the primary function to get authenticated user context
 * 
 * ✅ FIXED: Uses service role for missing data creation
 * ✅ No more duplicate key errors
 * ✅ No more RLS violations
 */
export async function getCurrentUserWithRoles(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  try {
    // Step 1: Get authenticated user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      console.log('getCurrentUserWithRoles: User not authenticated');
      return null;
    }

    const userId = authUser.id;

    // Step 2: Fetch user record from public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user data:', userError.message);
      return null;
    }

    // If no user record exists, create it using service role
    if (!userData) {
      console.log('User record missing, creating with service role...');
      const created = await createUserRecordServiceRole(authUser);
      if (!created) return null;
      
      // Fetch the newly created record
      const { data: newUserData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!newUserData) return null;
      
      // Continue with the new user data
      return buildUserWithMissingData(supabase, userId, newUserData, authUser);
    }

    // Step 3: Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.warn('Error fetching profile:', profileError.message);
    }

    // If no profile exists, create it using service role
    if (!profileData) {
      console.log('Profile missing, creating with service role...');
      await createUserProfileServiceRole(userId, authUser.email || 'User');
      
      // Fetch the newly created profile
      const { data: newProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      return buildUserWithProfile(supabase, userId, userData, newProfile);
    }

    // Step 4: Fetch user roles with role details
    const { data: userRolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select(
        `
        id,
        user_id,
        role_id,
        assigned_by,
        assigned_at,
        expires_at,
        created_at,
        role:roles(id, name, role_type, description, permissions, is_active)
      `
      )
      .eq('user_id', userId);

    if (rolesError) {
      console.error('Error fetching roles:', rolesError.message);
    }

    // If no roles exist, assign citizen role using service role
    if (!userRolesData || userRolesData.length === 0) {
      console.log('No roles found, assigning citizen role with service role...');
      await assignDefaultCitizenRoleServiceRole(userId);
      
      // Fetch roles again
      const { data: newRoles } = await supabase
        .from('user_roles')
        .select(
          `
          id,
          user_id,
          role_id,
          assigned_by,
          assigned_at,
          expires_at,
          created_at,
          role:roles(id, name, role_type, description, permissions, is_active)
        `
        )
        .eq('user_id', userId);
      
      return buildCurrentUserObject(
        userId,
        userData,
        profileData,
        newRoles as UserRole[] | null
      );
    }

    // Filter out expired roles and inactive role definitions
    const activeRoles = (userRolesData as UserRole[]).filter((ur) => {
      if (!ur.role) return false;
      if (!ur.role.is_active) return false;
      if (ur.expires_at && new Date(ur.expires_at) < new Date()) return false;
      return true;
    });

    return buildCurrentUserObject(userId, userData, profileData, activeRoles);
  } catch (error) {
    console.error('Unexpected error in getCurrentUserWithRoles:', error);
    return null;
  }
}

/**
 * Helper to build user when initial data is missing
 */
async function buildUserWithMissingData(
  supabase: any,
  userId: string,
  userData: any,
  authUser: any
): Promise<CurrentUser | null> {
  // Create profile if missing
  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!profileData) {
    await createUserProfileServiceRole(userId, authUser.email || 'User');
  }

  // Assign citizen role if missing
  await assignDefaultCitizenRoleServiceRole(userId);

  // Fetch everything again and build the object
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: roles } = await supabase
    .from('user_roles')
    .select(
      `
      id,
      user_id,
      role_id,
      assigned_by,
      assigned_at,
      expires_at,
      created_at,
      role:roles(id, name, role_type, description, permissions, is_active)
    `
    )
    .eq('user_id', userId);

  return buildCurrentUserObject(userId, userData, profile, roles);
}

/**
 * Helper to build user when only profile is missing
 */
async function buildUserWithProfile(
  supabase: any,
  userId: string,
  userData: any,
  profileData: any
): Promise<CurrentUser | null> {
  // Check roles
  const { data: userRolesData } = await supabase
    .from('user_roles')
    .select(
      `
      id,
      user_id,
      role_id,
      assigned_by,
      assigned_at,
      expires_at,
      created_at,
      role:roles(id, name, role_type, description, permissions, is_active)
    `
    )
    .eq('user_id', userId);

  if (!userRolesData || userRolesData.length === 0) {
    await assignDefaultCitizenRoleServiceRole(userId);
    
    const { data: newRoles } = await supabase
      .from('user_roles')
      .select(
        `
        id,
        user_id,
        role_id,
        assigned_by,
        assigned_at,
        expires_at,
        created_at,
        role:roles(id, name, role_type, description, permissions, is_active)
      `
      )
      .eq('user_id', userId);
    
    return buildCurrentUserObject(userId, userData, profileData, newRoles);
  }

  return buildCurrentUserObject(userId, userData, profileData, userRolesData);
}

/**
 * Build CurrentUser object from fetched data
 */
function buildCurrentUserObject(
  userId: string,
  userData: any,
  profileData: UserProfile | null,
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
    roles,
    userRoles: userRoles || [],
  };
}

/**
 * Create missing user record using service role (bypasses RLS)
 */
async function createUserRecordServiceRole(authUser: any): Promise<boolean> {
  try {
    const serviceSupabase = getServiceClient();
    
    const { error } = await serviceSupabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        phone: null,
        external_auth_provider: 'email',
        is_active: true,
        is_verified: !!authUser.email_confirmed_at,
        email_verified_at: authUser.email_confirmed_at || null,
        phone_verified_at: null,
        last_login_at: authUser.last_sign_in_at || null,
      });

    if (error) {
      // Ignore duplicate key errors - means record was created by trigger
      if (error.code === '23505') {
        console.log('User record already exists (created by trigger)');
        return true;
      }
      console.error('Error creating user record:', error.message);
      return false;
    }

    console.log('✅ User record created via service role:', authUser.id);
    return true;
  } catch (err) {
    console.error('Exception creating user record:', err);
    return false;
  }
}

/**
 * Create missing user profile using service role (bypasses RLS)
 */
async function createUserProfileServiceRole(
  userId: string,
  email: string
): Promise<boolean> {
  try {
    const serviceSupabase = getServiceClient();
    
    const { error } = await serviceSupabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        full_name: email.split('@')[0] || 'User',
        language_preference: 'en',
        notification_preferences: {
          sms: true,
          email: true,
          in_app: true,
        },
      });

    if (error) {
      // Ignore duplicate key errors
      if (error.code === '23505') {
        console.log('Profile already exists (created by trigger)');
        return true;
      }
      console.error('Error creating user profile:', error.message);
      return false;
    }

    console.log('✅ User profile created via service role:', userId);
    return true;
  } catch (err) {
    console.error('Exception creating user profile:', err);
    return false;
  }
}

/**
 * Assign default citizen role using service role (bypasses RLS)
 */
async function assignDefaultCitizenRoleServiceRole(userId: string): Promise<boolean> {
  try {
    const serviceSupabase = getServiceClient();
    
    // Get citizen role
    const { data: roleData, error: roleError } = await serviceSupabase
      .from('roles')
      .select('id')
      .eq('role_type', 'citizen')
      .eq('is_active', true)
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('Citizen role not found');
      return false;
    }

    // Assign it using service role
    const { error: assignError } = await serviceSupabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleData.id,
        assigned_by: userId, // Self-assigned
      });

    if (assignError) {
      // Ignore duplicate key errors
      if (assignError.code === '23505') {
        console.log('Citizen role already assigned');
        return true;
      }
      console.error('Error assigning citizen role:', assignError.message);
      return false;
    }

    console.log('✅ Citizen role assigned via service role:', userId);
    return true;
  } catch (err) {
    console.error('Exception assigning citizen role:', err);
    return false;
  }
}

/**
 * Check if user's email is verified
 */
export function isEmailVerified(user: CurrentUser | null): boolean {
  return !!(user?.is_verified);
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const supabase = await createClient();

  try {
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}