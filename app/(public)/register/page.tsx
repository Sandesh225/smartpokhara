

// app/(public)/register/page.tsx
import { AuthForm } from "@/components/auth/AuthForm";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { getDefaultDashboardPath } from "@/lib/auth/role-helpers";

export default async function RegisterPage() {
  const user = await getCurrentUserWithRoles();

  if (user) {
    const dashboardPath = getDefaultDashboardPath(user);
    redirect(dashboardPath);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AuthForm mode="register" />

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> New accounts are automatically assigned the Citizen
            role. Staff and admin roles are assigned by administrators.
          </p>
        </div>
      </div>
    </div>
  );
}