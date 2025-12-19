/**
 * Core Authentication Types matching Database Schema
 */

export type RoleType =
  | "admin"
  | "dept_head"
  | "dept_staff"
  | "ward_staff"
  | "field_staff"
  | "call_center"
  | "citizen"
  | "business_owner"
  | "tourist";

export type PortalType = "admin" | "supervisor" | "staff" | "citizen";

export type DashboardType = PortalType; // Alias for clarity

export interface UserRole {
  type: RoleType;
  name: string;
  is_primary: boolean;
}

export interface UserProfile {
  full_name: string;
  full_name_nepali: string | null;
  ward_id: string | null;
  profile_photo_url: string | null;
  language_preference: string;
}

export interface StaffProfile {
  staff_code: string;
  staff_role: RoleType;
  department_id: string | null;
  ward_id: string | null;
  is_supervisor: boolean;
  is_active: boolean;
}

export interface CurrentUser {
  id: string;
  email: string;
  phone: string | null;
  is_verified: boolean;
  last_login_at: string | null;
  profile: UserProfile;
  roles: UserRole[];
  staff_profile?: StaffProfile | null;
  primary_role: RoleType;
  default_portal: PortalType;
}

// Response structure from rpc_get_current_user
export interface AuthResponse {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    phone: string | null;
    is_verified: boolean;
    last_login_at: string | null;
  };
  profile?: UserProfile;
  roles?: UserRole[];
  staff_profile?: StaffProfile;
  primary_role?: RoleType;
  default_portal?: PortalType;
}