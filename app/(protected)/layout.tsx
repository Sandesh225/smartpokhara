// ============================================================================
// app/(protected)/layout.tsx - Protected Layout Wrapper
// ============================================================================

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getCurrentUserWithRoles();

  // If unauthenticated, kick to login
  if (!user) {
    redirect("/login");
  }

  // Keep this wrapper minimal so nested layouts (e.g. AdminShell) can control UI
  return <>{children}</>;
}
