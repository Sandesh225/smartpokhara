import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isSupervisor, isAdmin } from "@/lib/auth/role-helpers";

export default async function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  if (!isSupervisor(user) && !isAdmin(user)) {
    redirect("/citizen/dashboard");
  }

  return <>{children}</>;
}
