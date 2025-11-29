// lib/auth/role-helpers.ts - ENHANCED
import type { CurrentUser, RoleType, DashboardType } from "@/lib/types/auth";

/**
 * Check if user has any of the specified roles
 */
export function hasRole(user: CurrentUser | null, roles: string[]): boolean {
  if (!user || !user.roles || user.roles.length === 0) return false;
  return user.roles.some((userRole) => roles.includes(userRole));
}

/**
 * Check if user has a specific role
 */
export function hasExactRole(
  user: CurrentUser | null,
  role: RoleType
): boolean {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
}

/**
 * Check if user is an admin (admin or dept_head)
 */
export function isAdmin(user: CurrentUser | null): boolean {
  return hasRole(user, ["admin", "dept_head"]);
}

/**
 * Check if user is staff (any staff-level role)
 */
export function isStaff(user: CurrentUser | null): boolean {
  return hasRole(user, [
    "admin",
    "dept_head",
    "dept_staff",
    "ward_staff",
    "field_staff",
    "call_center",
  ]);
}

/**
 * Check if user is a citizen (citizen, business_owner, or tourist)
 */
export function isCitizen(user: CurrentUser | null): boolean {
  return hasRole(user, ["citizen", "business_owner", "tourist"]);
}

/**
 * Staff role specific checkers
 */
export function isWardStaff(user: CurrentUser | null): boolean {
  return hasExactRole(user, "ward_staff");
}

export function isDeptStaff(user: CurrentUser | null): boolean {
  return hasExactRole(user, "dept_staff");
}

export function isFieldStaff(user: CurrentUser | null): boolean {
  return hasExactRole(user, "field_staff");
}

export function isSupervisor(user: CurrentUser | null): boolean {
  return hasRole(user, ["dept_head", "admin"]);
}

export function isHelpdesk(user: CurrentUser | null): boolean {
  return hasExactRole(user, "call_center");
}

/**
 * Get the highest precedence role for the user
 */
export function getPrimaryRole(user: CurrentUser | null): string | null {
  if (!user || !user.roles || user.roles.length === 0) return null;

  const ROLE_HIERARCHY = [
    "tourist",
    "business_owner",
    "citizen",
    "call_center",
    "field_staff",
    "ward_staff",
    "dept_staff",
    "dept_head",
    "admin",
  ];

  let highestRole: string | null = null;
  let highestIndex = -1;

  for (const role of user.roles) {
    const index = ROLE_HIERARCHY.indexOf(role);
    if (index > highestIndex) {
      highestIndex = index;
      highestRole = role;
    }
  }

  return highestRole;
}

/**
 * Determine which dashboard to show based on role precedence
 * Admin > Staff > Citizen
 */
export function getDashboardType(
  user: CurrentUser | null
): "admin" | "staff" | "citizen" {
  if (!user) return "citizen";

  const adminRoles = ["admin", "dept_head"];
  const staffRoles = ["dept_staff", "ward_staff", "field_staff", "call_center"];

  if (user.roles.some((r) => adminRoles.includes(r))) {
    return "admin";
  }

  if (user.roles.some((r) => staffRoles.includes(r))) {
    return "staff";
  }

  return "citizen";
}

/**
 * Get the default dashboard path for a user
 */
export function getDefaultDashboardPath(user: CurrentUser | null): string {
  const dashboardType = getDashboardType(user);

  const paths = {
    admin: "/admin/dashboard",
    staff: "/staff/dashboard",
    citizen: "/citizen/dashboard",
  };

  return paths[dashboardType];
}

/**
 * Check if user can access a specific dashboard
 */
export function canAccessDashboard(
  user: CurrentUser | null,
  dashboard: DashboardType
): boolean {
  if (!user) return false;

  switch (dashboard) {
    case "admin":
      return user.roles.includes("admin") || user.roles.includes("dept_head");
    case "staff":
      return (
        user.roles.includes("admin") ||
        user.roles.includes("dept_head") ||
        user.roles.includes("dept_staff") ||
        user.roles.includes("ward_staff") ||
        user.roles.includes("field_staff") ||
        user.roles.includes("call_center")
      );
    case "citizen":
      return true; // Everyone can access citizen dashboard
    default:
      return false;
  }
}

/**
 * Get user's full name or email fallback
 */
export function getUserDisplayName(user: CurrentUser | null): string {
  if (!user) return "Guest";
  if (user.profile?.full_name) return user.profile.full_name;
  return user.email.split("@")[0];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: RoleType): string {
  const roleNames: Record<RoleType, string> = {
    admin: "System Administrator",
    dept_head: "Department Head",
    dept_staff: "Department Staff",
    ward_staff: "Ward Staff",
    field_staff: "Field Technician",
    call_center: "Helpdesk Staff",
    citizen: "Citizen",
    business_owner: "Business Owner",
    tourist: "Tourist",
  };

  return roleNames[role] || role;
}

// Get role badge color
export function getRoleBadgeColor(role: RoleType): string {
  const colors: Record<RoleType, string> = {
    admin: "bg-purple-100 text-purple-800",
    dept_head: "bg-blue-100 text-blue-800",
    dept_staff: "bg-cyan-100 text-cyan-800",
    ward_staff: "bg-green-100 text-green-800",
    field_staff: "bg-orange-100 text-orange-800",
    call_center: "bg-indigo-100 text-indigo-800",
    citizen: "bg-gray-100 text-gray-800",
    business_owner: "bg-amber-100 text-amber-800",
    tourist: "bg-pink-100 text-pink-800",
  };

  return colors[role] || "bg-gray-100 text-gray-800";
}

/**
 * Get accessible routes based on user role
 */
export function getAccessibleRoutes(user: CurrentUser | null): string[] {
  if (!user) return ["/login", "/register"];

  const routes = ["/dashboard"];

  if (isAdmin(user)) {
    routes.push("/admin", "/staff", "/citizen");
  } else if (isStaff(user)) {
    routes.push("/staff", "/citizen");
  } else {
    routes.push("/citizen");
  }

  return routes;
}
