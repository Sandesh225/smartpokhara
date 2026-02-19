// lib/types/auth.ts

/* -------------------------------------------------------------------------- */
/* CORE TYPES                                  */
/* -------------------------------------------------------------------------- */

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

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  full_name_nepali: string | null;
  ward_id: string | null;
  profile_photo_url: string | null;
  language_preference: "en" | "ne";
  // Simplified preferences for frontend usage
  notification_preferences?: {
    sms: boolean;
    email: boolean;
    in_app: boolean;
  };
}

export interface StaffProfile {
  staff_code: string;
  department_id: string | null;
  ward_id: string | null;
  staff_role: RoleType;
  is_supervisor: boolean;
  is_active: boolean;
}

/**
 * The main user object used throughout the application.
 * Calculated efficiently by session.ts
 */
export interface CurrentUser {
  id: string;
  email: string;
  phone?: string | null;

  // Authorization Data
  roles: RoleType[];
  primary_role: RoleType;

  // Profile Data
  profile: UserProfile | null;
  staff_profile?: StaffProfile | null;

  // Status
  is_active: boolean;
  is_verified?: boolean;
}

/* -------------------------------------------------------------------------- */
/* FORM TYPES                                  */
/* -------------------------------------------------------------------------- */

export type AuthMode =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password";

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone?: string;
  language_preference?: "en" | "ne";
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export type DashboardType = "admin" | "supervisor" | "staff" | "citizen";
