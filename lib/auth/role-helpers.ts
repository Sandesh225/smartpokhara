import type { CurrentUser, RoleType, DashboardType } from "@/lib/types/auth";

/* ------------------------------------------------------------- 
 * BASIC ROLE CHECKERS (Client Safe)
 * ------------------------------------------------------------- */

export function hasRole(user: CurrentUser | null, roles: string[]): boolean {
  if (!user?.roles?.length) return false;
  return user.roles.some((role) => roles.includes(role));
}

export function hasExactRole(
  user: CurrentUser | null,
  role: RoleType
): boolean {
  if (!user?.roles) return false;
  return user.roles.includes(role);
}

export function isAdmin(user: CurrentUser | null): boolean {
  return hasExactRole(user, "admin");
}

export function isSupervisor(user: CurrentUser | null): boolean {
  if (!user) return false;
  if (user.staff_profile?.is_supervisor) return true;
  if (hasExactRole(user, "dept_head")) return true;
  if (isAdmin(user)) return true;
  return false;
}

export function isStaff(user: CurrentUser | null): boolean {
  if (!user) return false;
  
  // Primary check: Does user have an active staff profile?
  if (user.staff_profile?.is_active) return true;
  
  // Fallback: Check roles
  return hasRole(user, [
    "admin",
    "dept_head",
    "dept_staff",
    "ward_staff",
    "field_staff",
    "call_center",
  ]);
}

export function isCitizen(user: CurrentUser | null): boolean {
  return hasRole(user, ["citizen", "business_owner", "tourist"]);
}

/* ------------------------------------------------------------- 
 * SPECIFIC STAFF ROLE CHECKERS
 * ------------------------------------------------------------- */

export const isWardStaff = (u: CurrentUser | null) =>
  hasExactRole(u, "ward_staff");
export const isDeptStaff = (u: CurrentUser | null) =>
  hasExactRole(u, "dept_staff");
export const isFieldStaff = (u: CurrentUser | null) =>
  hasExactRole(u, "field_staff");
export const isHelpdesk = (u: CurrentUser | null) =>
  hasExactRole(u, "call_center");

/* ------------------------------------------------------------- 
 * ROLE HIERARCHY / PRIMARY ROLE
 * ------------------------------------------------------------- */

export function getPrimaryRole(user: CurrentUser | null): RoleType | null {
  if (!user?.roles?.length) return null;

  // Order matters: Higher priority first
  const ROLE_HIERARCHY: RoleType[] = [
    "admin",          // Highest
    "dept_head",
    "dept_staff",
    "ward_staff",
    "field_staff",
    "call_center",
    "business_owner",
    "citizen",
    "tourist",        // Lowest
  ];

  for (const role of ROLE_HIERARCHY) {
    if (user.roles.includes(role)) {
      return role;
    }
  }

  return user.roles[0] as RoleType;
}

/* ------------------------------------------------------------- 
 * DASHBOARD TYPE & ROUTING
 * ------------------------------------------------------------- */

export function getDashboardType(user: CurrentUser | null): DashboardType {
  if (!user?.roles?.length) return "citizen";

  // Strict check order: Admin -> Supervisor -> Staff -> Citizen
  if (isAdmin(user)) return "admin";
  if (isSupervisor(user)) return "supervisor";
  if (isStaff(user)) return "staff";
  
  return "citizen";
}

export function getDefaultDashboardPath(user: CurrentUser | null): string {
  const type = getDashboardType(user);

  const paths: Record<DashboardType, string> = {
    admin: "/admin/dashboard",
    supervisor: "/supervisor/dashboard",
    staff: "/staff/dashboard",
    citizen: "/citizen/dashboard",
  };

  return paths[type] ?? "/citizen/dashboard";
}

export function canAccessDashboard(
  user: CurrentUser | null,
  dashboard: DashboardType
): boolean {
  if (!user) return false;

  switch (dashboard) {
    case "admin":
      return isAdmin(user);
    case "supervisor":
      return isSupervisor(user);
    case "staff":
      return isStaff(user);
    case "citizen":
      return true; // Everyone is a citizen effectively
    default:
      return false;
  }
}

/* ------------------------------------------------------------- 
 * DISPLAY HELPERS
 * ------------------------------------------------------------- */

export function getUserDisplayName(user: CurrentUser | null): string {
  if (!user) return "Guest";
  if (user.profile?.full_name) return user.profile.full_name;
  if (user.email) return user.email.split("@")[0];
  return "User";
}

export function getRoleDisplayName(role: RoleType): string {
  const friendly: Record<RoleType, string> = {
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
  return friendly[role] ?? role;
}

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
  return colors[role] ?? "bg-gray-100 text-gray-800";
}

export function getAccessibleRoutes(user: CurrentUser | null): string[] {
  if (!user) return ["/login", "/register"];

  const routes = ["/dashboard"];

  if (isAdmin(user)) routes.push("/admin", "/supervisor", "/staff", "/citizen");
  else if (isSupervisor(user)) routes.push("/supervisor", "/staff", "/citizen");
  else if (isStaff(user)) routes.push("/staff", "/citizen");
  else routes.push("/citizen");

  return routes;
}