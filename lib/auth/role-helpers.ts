import type { CurrentUser, RoleType, DashboardType } from "@/lib/types/auth";

/* -------------------------------------------------------------
 * BASIC ROLE CHECKERS
 * ------------------------------------------------------------- */

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
 * Check if user is a SYSTEM admin (IT/System configuration)
 * NOTE: dept_head is intentionally NOT included here
 */
export function isAdmin(user: CurrentUser | null): boolean {
  return hasExactRole(user, "admin");
}

/**
 * Check if user is a Supervisor (Department Head)
 * Primary “owner” of supervisor dashboard
 */
export function isSupervisor(user: CurrentUser | null): boolean {
  return hasExactRole(user, "dept_head");
}

/**
 * Check if user is staff (any staff-level role)
 * Includes admin & dept_head so they can access staff views,
 * but they are still **routed** separately at dashboard level.
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
 * Check if user is a citizen
 */
export function isCitizen(user: CurrentUser | null): boolean {
  return hasRole(user, ["citizen", "business_owner", "tourist"]);
}

/* -------------------------------------------------------------
 * SPECIFIC STAFF ROLE CHECKERS
 * ------------------------------------------------------------- */

export function isWardStaff(user: CurrentUser | null): boolean {
  return hasExactRole(user, "ward_staff");
}

export function isDeptStaff(user: CurrentUser | null): boolean {
  return hasExactRole(user, "dept_staff");
}

export function isFieldStaff(user: CurrentUser | null): boolean {
  return hasExactRole(user, "field_staff");
}

export function isHelpdesk(user: CurrentUser | null): boolean {
  return hasExactRole(user, "call_center");
}

/* -------------------------------------------------------------
 * ROLE HIERARCHY / PRIMARY ROLE
 * ------------------------------------------------------------- */

export function getPrimaryRole(user: CurrentUser | null): RoleType | null {
  if (!user || !user.roles || user.roles.length === 0) return null;

  const ROLE_HIERARCHY: RoleType[] = [
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

  let highestRole: RoleType | null = null;
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

/* -------------------------------------------------------------
 * DASHBOARD TYPE & ROUTING
 * ------------------------------------------------------------- */

/**
 * Determine which dashboard to show based on role precedence
 * Priority: admin > supervisor (dept_head) > staff > citizen
 */
export function getDashboardType(user: CurrentUser | null): DashboardType {
  if (!user || !user.roles || user.roles.length === 0) return "citizen";

  // 1. System Admin (Top Priority)
  if (user.roles.includes("admin")) {
    return "admin";
  }

  // 2. Department Head (Supervisor Dashboard)
  if (user.roles.includes("dept_head")) {
    return "supervisor";
  }

  // 3. General Staff
  const staffRoles: RoleType[] = [
    "dept_staff",
    "ward_staff",
    "field_staff",
    "call_center",
  ];
  if (user.roles.some((r) => staffRoles.includes(r))) {
    return "staff";
  }

  // 4. Default to Citizen
  return "citizen";
}

/**
 * Get the default dashboard path for a user
 * dept_head → /supervisor/dashboard
 * admin     → /admin/dashboard
 */
export function getDefaultDashboardPath(user: CurrentUser | null): string {
  const dashboardType = getDashboardType(user);

  const paths: Record<DashboardType, string> = {
    admin: "/admin/dashboard",
    supervisor: "/supervisor/dashboard",
    staff: "/staff/dashboard",
    citizen: "/citizen/dashboard",
  };

  return paths[dashboardType] ?? "/citizen/dashboard";
}

/**
 * Check if user can access a specific dashboard
 * (Authorization, not default routing)
 */
export function canAccessDashboard(
  user: CurrentUser | null,
  dashboard: DashboardType
): boolean {
  if (!user) return false;

  switch (dashboard) {
    case "admin":
      // Only System Admin
      return isAdmin(user);
    case "supervisor":
      // Department Head primary; admin can also access supervisor tools
      return isSupervisor(user) || isAdmin(user);
    case "staff":
      // Any staff-level role, including admin & dept_head
      return isStaff(user);
    case "citizen":
      // Everyone (including guests) can view citizen-facing UI
      return true;
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

  return roleNames[role] ?? role;
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

/* -------------------------------------------------------------
 * ACCESSIBLE ROUTES
 * ------------------------------------------------------------- */

/**
 * Get accessible top-level routes based on user role
 * NOTE: This is more like “menu visibility”, not exact RLS.
 */
export function getAccessibleRoutes(user: CurrentUser | null): string[] {
  if (!user) return ["/login", "/register"];

  const routes = ["/dashboard"];

  if (isAdmin(user)) {
    routes.push("/admin", "/supervisor", "/staff", "/citizen");
  } else if (isSupervisor(user)) {
    routes.push("/supervisor", "/staff", "/citizen");
  } else if (isStaff(user)) {
    routes.push("/staff", "/citizen");
  } else {
    routes.push("/citizen");
  }

  return routes;
}
