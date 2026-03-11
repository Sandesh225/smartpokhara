import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { enforceRole } from "@/lib/auth/require-role";

export default async function CitizenLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserWithRoles();
  enforceRole(user, ["citizen", "business_owner", "tourist", "admin", "dept_head", "dept_staff", "ward_staff", "field_staff", "call_center"], "/login");

  return (
    // ✅ Make sure this allows the main content to flex-1 and fill the width
    <div className="flex min-h-screen w-full bg-background text-foreground font-sans animate-fade-in">
      <main id="main-content" role="main" className="flex-1 flex flex-col w-full">
        {children}
      </main>
    </div>
  );
}