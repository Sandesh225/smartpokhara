// ============================================================================
// app/(protected)/citizen/layout.tsx
// ============================================================================

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { CitizenNavbar } from "@/components/citizen/navbar";

type CitizenLayoutProps = {
  children: ReactNode;
};

export default async function CitizenLayout({ children }: CitizenLayoutProps) {
  const user = await getCurrentUserWithRoles();

  // If unauthenticated, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Optional: Add role check if needed
  // if (!user.roles.includes("citizen")) {
  //   redirect("/unauthorized");
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <CitizenNavbar
        userName={user.profile?.full_name}
        userEmail={user.email}
        unreadNotifications={0} // TODO: Fetch real notification count
      />
      <main>{children}</main>
    </div>
  );
}
