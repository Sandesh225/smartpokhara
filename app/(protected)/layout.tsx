// app/(protected)/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  // RETURN ONLY CHILDREN.
  // Do not add a Navbar here, or it will duplicate inside the Citizen Dashboard.
  return <>{children}</>;
}
