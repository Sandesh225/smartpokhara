// lib/auth/role-helpers.ts
import type { CurrentUser, RoleType, DashboardType } from "@/lib/types/auth";

/* -------------------------------------------------------------
 * 1. BASIC ROLE CHECKERS
 * Used by components to show/hide buttons or sections
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
  if (hasExactRole(user, "dept_head")) return true;
  return isAdmin(user);
}

export function isStaff(user: CurrentUser | null): boolean {
  if (!user) return false;
  if (user.staff_profile?.is_active) return true;
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
 * 2. PRIMARY ROLE HELPER (FIXED)
 * ------------------------------------------------------------- */

/**
 * Returns the user's primary role for display and logic.
 * This relies on session.ts having already calculated the primary_role.
 */
export function getPrimaryRole(user: CurrentUser | null): RoleType | null {
  return user?.primary_role ?? null;
}

/* -------------------------------------------------------------
 * 3. DASHBOARD ROUTING LOGIC
 * ------------------------------------------------------------- */

export function getDashboardType(user: CurrentUser | null): DashboardType {
  if (!user?.roles?.length) return "citizen";
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

/* -------------------------------------------------------------
 * 4. UI DISPLAY HELPERS
 * ------------------------------------------------------------- */

export function getUserDisplayName(user: CurrentUser | null): string {
  if (!user) return "Guest";
  if (user.profile?.full_name) return user.profile.full_name;
  if (user.email) return user.email.split("@")[0];
  return "User";
}

export function getRoleDisplayName(role: RoleType): string {
  const friendly: Record<RoleType, string> = {
    admin: "System Admin",
    dept_head: "Department Head",
    dept_staff: "Department Staff",
    ward_staff: "Ward Staff",
    field_staff: "Field Technician",
    call_center: "Helpdesk",
    citizen: "Citizen",
    business_owner: "Business Owner",
    tourist: "Tourist",
  };
  return friendly[role] ?? role;
}

export function getRoleBadgeColor(role: RoleType): string {
  // Uses design system tokens defined in globals.css
  const colors: Record<RoleType, string> = {
    admin: "bg-destructive/10 text-destructive border-destructive/20",
    dept_head: "bg-primary/10 text-primary border-primary/20",
    dept_staff: "bg-secondary/10 text-secondary border-secondary/20",
    ward_staff: "bg-secondary/10 text-secondary border-secondary/20",
    field_staff: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
    call_center: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400",
    citizen: "bg-muted text-foreground border-border/50",
    business_owner: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    tourist: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  };
  return colors[role] ?? "bg-muted text-muted-foreground border-border";
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
