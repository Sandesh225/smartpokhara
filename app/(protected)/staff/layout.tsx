import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { enforceRole } from "@/lib/auth/require-role";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserWithRoles();
  enforceRole(user, ["admin", "dept_head", "dept_staff", "ward_staff", "field_staff", "call_center"]);

  return <>{children}</>;
}
