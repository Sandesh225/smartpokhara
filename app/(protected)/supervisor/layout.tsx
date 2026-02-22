import type { ReactNode } from "react";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { enforceRole } from "@/lib/auth/require-role";

export default async function SupervisorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUserWithRoles();
  enforceRole(user, ["dept_head", "admin"]);

  return <>{children}</>;
}