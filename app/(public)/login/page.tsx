// app/(public)/login/page.tsx
import { AuthForm } from "@/components/auth/AuthForm";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { getDefaultDashboardPath } from "@/lib/auth/role-helpers";
import Link from "next/link";

export default async function LoginPage() {
  const user = await getCurrentUserWithRoles();

  if (user) {
    const dashboardPath = getDefaultDashboardPath(user);
    redirect(dashboardPath);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AuthForm mode="login" />

        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Account Types
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-gray-900">Citizen Accounts</h4>
                <p className="text-sm text-gray-600">
                  Submit complaints and track city services
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-gray-900">Staff Accounts</h4>
                <p className="text-sm text-gray-600">
                  Department heads, ward staff, field workers
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/register"
              className="block w-full text-center rounded-lg border border-gray-300 bg-white py-3 px-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Register as Citizen
            </Link>
            <Link
              href="/register/staff"
              className="block w-full text-center rounded-lg bg-linear-to-r from-green-600 to-green-700 py-3 px-4 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
            >
              Register as Staff
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
