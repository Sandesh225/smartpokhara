// lib/auth/portal-helpers.ts
import type { CurrentUser } from "@/lib/types/auth";
import { getPrimaryRole } from "./role-helpers";

export type PortalType = "citizen" | "staff" | "supervisor" | "admin";

export function getUserPortal(user: CurrentUser | null): PortalType {
  if (!user) return "citizen";
  
  const primaryRole = getPrimaryRole(user);
  
  switch (primaryRole) {
    case "admin":
      return "admin";
    case "dept_head":
      return "supervisor";
    case "dept_staff":
    case "ward_staff":
    case "field_staff":
    case "call_center":
      return "staff";
    default:
      return "citizen";
  }
}

export function getPortalName(portal: PortalType): string {
  const names: Record<PortalType, string> = {
    citizen: "Citizen Portal",
    staff: "Staff Portal",
    supervisor: "Supervisor Portal",
    admin: "Admin Portal"
  };
  return names[portal];
}

export function getPortalRoutes(portal: PortalType) {
  const baseRoutes: Record<PortalType, string[]> = {
    citizen: ["/citizen/dashboard", "/citizen/complaints", "/citizen/payments", "/citizen/profile"],
    staff: ["/staff/dashboard", "/staff/queue/ward", "/staff/queue/team", "/staff/queue/my-tasks"],
    supervisor: ["/supervisor/dashboard", "/supervisor/unassigned", "/supervisor/workload", "/supervisor/escalations"],
    admin: ["/admin/dashboard", "/admin/analytics", "/admin/staff", "/admin/settings"]
  };
  return baseRoutes[portal];
}

export function shouldRedirectToPortal(currentPath: string, user: CurrentUser | null): boolean {
  if (!user) return false;
  
  const userPortal = getUserPortal(user);
  const portalPath = `/${userPortal}`;
  
  // Check if user is trying to access a portal they shouldn't
  if (currentPath.startsWith("/citizen") && userPortal !== "citizen") return true;
  if (currentPath.startsWith("/staff") && userPortal !== "staff") return true;
  if (currentPath.startsWith("/supervisor") && userPortal !== "supervisor") return true;
  if (currentPath.startsWith("/admin") && userPortal !== "admin") return true;
  
  return false;
}