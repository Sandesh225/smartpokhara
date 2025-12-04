// app/(protected)/citizen/layout.tsx - Fixed layout
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";

type CitizenLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CitizenLayout({ children }: CitizenLayoutProps) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  // Allow all authenticated users to access citizen portal
  // All users have at least citizen-level access

  return <div className="container mx-auto px-4 py-8">{children}</div>;
}
