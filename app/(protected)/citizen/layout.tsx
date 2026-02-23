import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { enforceRole } from "@/lib/auth/require-role";

export default async function CitizenLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserWithRoles();
  enforceRole(user, ["citizen", "business_owner", "tourist", "admin", "dept_head", "dept_staff", "ward_staff", "field_staff", "call_center"], "/login");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans animate-fade-in">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <main id="main-content" role="main">
        {children}
      </main>
    </div>
  );
}
