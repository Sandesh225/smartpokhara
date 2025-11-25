// lib/types/auth.ts

import type { Enums, Tables } from './database.types';

/**
 * Role type from DB enum
 */
export type RoleType = Enums<'user_role'>;

export interface Role {
  id: string;
  name: string;
  role_type: RoleType;
  description: string | null;
  permissions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by: string | null;
  assigned_at: string;
  expires_at: string | null;
  created_at: string;
  role?: Role;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  full_name_nepali: string | null;
  date_of_birth: string | null;
  gender: string | null;
  citizenship_number: string | null;
  ward_id: string | null;
  address_line1: string | null;
  address_line2: string | null;
  landmark: string | null;
  profile_photo_url: string | null;
  language_preference: string;
  notification_preferences: {
    sms: boolean;
    email: boolean;
    in_app: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Current user with full context
 * (hydrated from get_current_user_with_roles RPC + extra queries if needed)
 */
export interface CurrentUser extends AuthUser {
  profile: UserProfile | null;
  /**
   * Flat list of role types (for quick checks)
   */
  roles: RoleType[];
  /**
   * Full role assignments (if you hydrate them from /roles + /user_roles)
   */
  userRoles: UserRole[];
}

/**
 * Dashboard types based on role precedence
 */
export type DashboardType = 'admin' | 'staff' | 'citizen';

/**
 * Auth form modes
 */
export type AuthMode =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password';

/**
 * Registration form data
 */
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone?: string;
  language_preference?: 'en' | 'ne';
}

/**
 * Login form data
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Password reset request data
 */
export interface ForgotPasswordFormData {
  email: string;
}

/**
 * Password reset confirmation data
 */
export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

/* -------------------------------------------------------------------------- */
/*                          Frontend Helper Types                             */
/* -------------------------------------------------------------------------- */

/**
 * Shape returned by get_current_user_with_roles() RPC
 * (matches Database['public']['Functions']['get_current_user_with_roles'])
 */
export interface RpcCurrentUserRow {
  user_id: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  full_name: string | null;
  profile_photo_url: string | null;
  language_preference: string | null;
  roles:
    | {
        role_type: RoleType;
        role_name: string;
        permissions: Record<string, any>;
      }[]
    | null;
  primary_role: RoleType | null;
}

/**
 * Role precedence mapping – must match SQL ORDER BY in fn_get_user_roles & RPC
 * Lower index = higher precedence
 */
export const ROLE_PRECEDENCE: RoleType[] = [
  'admin',
  'dept_head',
  'dept_staff',
  'ward_staff',
  'field_staff',
  'call_center',
  'citizen',
  'business_owner',
  'tourist',
];

/* -------------------------------------------------------------------------- */
/*                         Utility / Guard Helper Fns                         */
/* -------------------------------------------------------------------------- */

/**
 * Extract primary role from a list of role types according to precedence.
 */
export function getPrimaryRoleFromList(roles: RoleType[]): RoleType | null {
  if (!roles.length) return null;
  const ordered = [...roles].sort(
    (a, b) => ROLE_PRECEDENCE.indexOf(a) - ROLE_PRECEDENCE.indexOf(b)
  );
  return ordered[0] ?? null;
}

/**
 * Check if user has at least one of the allowed roles.
 */
export function hasRole(
  user: Pick<CurrentUser, 'roles'> | { roles?: RoleType[] } | null | undefined,
  allowed: RoleType[]
): boolean {
  if (!user || !user.roles || user.roles.length === 0) return false;
  return user.roles.some((r) => allowed.includes(r));
}

export function isAdmin(user: CurrentUser | null | undefined): boolean {
  return hasRole(user, ['admin', 'dept_head']);
}

export function isStaff(user: CurrentUser | null | undefined): boolean {
  return hasRole(user, [
    'admin',
    'dept_head',
    'dept_staff',
    'ward_staff',
    'field_staff',
    'call_center',
  ]);
}

export function isCitizenOnly(user: CurrentUser | null | undefined): boolean {
  if (!user || !user.roles?.length) return false;
  return (
    user.roles.includes('citizen') &&
    !hasRole(user, [
      'admin',
      'dept_head',
      'dept_staff',
      'ward_staff',
      'field_staff',
      'call_center',
    ])
  );
}

/**
 * Map a user's roles to a dashboard type used in routing.
 */
export function getDashboardType(user: CurrentUser | null): DashboardType {
  if (isAdmin(user) || hasRole(user, ['dept_staff', 'ward_staff', 'field_staff', 'call_center'])) {
    return 'admin'; // you can keep 'admin' for top-level management dashboard
  }

  if (isStaff(user)) {
    return 'staff';
  }

  return 'citizen';
}

/**
 * Default dashboard URL for a user.
 * Used after login / redirect logic.
 */
export function getDefaultDashboardPath(user: CurrentUser | null): string {
  const dashboard = getDashboardType(user);

  if (dashboard === 'admin') return '/admin/dashboard';
  if (dashboard === 'staff') return '/staff/dashboard';
  return '/citizen/dashboard';
}

/**
 * Simple email verification helper
 */
export function isEmailVerified(user: CurrentUser | null): boolean {
  return !!user?.is_verified;
}

/* -------------------------------------------------------------------------- */
/*          Mapper: from RPC row -> CurrentUser (used in session.ts)         */
/* -------------------------------------------------------------------------- */

/**
 * Map the get_current_user_with_roles RPC row + raw DB rows into a CurrentUser.
 *
 * You can use this in your `getCurrentUserWithRoles()` server util, e.g.:
 *
 * const { data } = await supabase.rpc('get_current_user_with_roles');
 * const row = data?.[0];
 * const currentUser = row ? mapRpcUserToCurrentUser(row, profileRow, userRow) : null;
 */
export function mapRpcUserToCurrentUser(args: {
  rpcRow: RpcCurrentUserRow;
  userRow: Tables<'users'>;
  profileRow: Tables<'user_profiles'> | null;
  userRoles?: (Tables<'user_roles'> & { role?: Tables<'roles'> })[];
}): CurrentUser {
  const { rpcRow, userRow, profileRow, userRoles = [] } = args;

  const rolesFromRpc = (rpcRow.roles ?? []).map((r) => r.role_type);
  const uniqueRoles = Array.from(new Set<RoleType>(rolesFromRpc));

  const profile: UserProfile | null = profileRow
    ? {
        id: profileRow.id,
        user_id: profileRow.user_id,
        full_name: profileRow.full_name,
        full_name_nepali: profileRow.full_name_nepali,
        date_of_birth: profileRow.date_of_birth,
        gender: profileRow.gender,
        citizenship_number: profileRow.citizenship_number,
        ward_id: profileRow.ward_id,
        address_line1: profileRow.address_line1,
        address_line2: profileRow.address_line2,
        landmark: profileRow.landmark,
        profile_photo_url: profileRow.profile_photo_url,
        language_preference: profileRow.language_preference,
        notification_preferences: profileRow
          .notification_preferences as UserProfile['notification_preferences'],
        created_at: profileRow.created_at,
        updated_at: profileRow.updated_at,
      }
    : null;

  return {
    id: userRow.id,
    email: userRow.email,
    phone: userRow.phone,
    is_active: userRow.is_active,
    is_verified: userRow.is_verified,
    email_verified_at: userRow.email_verified_at,
    phone_verified_at: userRow.phone_verified_at,
    last_login_at: userRow.last_login_at,
    created_at: userRow.created_at,
    updated_at: userRow.updated_at,
    profile,
    roles: uniqueRoles,
    userRoles: userRoles.map((ur) => ({
      id: ur.id,
      user_id: ur.user_id,
      role_id: ur.role_id,
      assigned_by: ur.assigned_by,
      assigned_at: ur.assigned_at,
      expires_at: ur.expires_at,
      created_at: ur.created_at,
      role: (ur as any).role ?? undefined,
    })),
  };
}
