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

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <main id="main-content" role="main">
        {children}
      </main>
    </div>
  );
}