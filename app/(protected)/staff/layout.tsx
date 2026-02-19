import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isStaff, isAdmin } from "@/lib/auth/role-helpers";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  if (!isStaff(user) && !isAdmin(user)) {
    redirect("/citizen/dashboard");
  }

  return <>{children}</>;
}
