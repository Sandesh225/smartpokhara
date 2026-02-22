import { redirect } from "next/navigation";
import type { CurrentUser, RoleType } from "@/lib/types/auth";

/**
 * Server-only guard utility to enforce role-based access control.
 * This should be used in pages/layouts that already have the `CurrentUser` object
 * to prevent duplicate database calls for session resolution.
 *
 * @param user The current authenticated user object (from getCurrentUserWithRoles)
 * @param allowed Array of roles allowed to access the route
 * @param fallback Path to redirect to if access is denied
 */
export function enforceRole(
  user: CurrentUser | null,
  allowed: RoleType[],
  fallback = "/citizen/dashboard"
) {
  if (!user) redirect("/login");

  const hasAccess = user.roles.some((role) => allowed.includes(role));

  if (!hasAccess) redirect(fallback);
}
