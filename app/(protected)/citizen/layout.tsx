import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isCitizen } from "@/lib/auth/role-helpers";

export default async function CitizenLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserWithRoles();
  if (!user || !isCitizen(user)) {
     // If they are admin/staff/supervisor let them pass as they might be viewing citizen features
     if (!user?.roles.some(r => ["admin", "staff", "supervisor", "dept_head"].includes(r))) {
        redirect("/login");
     }
  }

  return <>{children}</>;
}
