// app/(public)/login/page.tsx
import { AuthForm } from "@/components/auth/AuthForm";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { getDefaultDashboardPath } from "@/lib/auth/role-helpers";
import Link from "next/link";

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUserWithRoles();

  if (user) {
    const dashboardPath = getDefaultDashboardPath(user);
    redirect(dashboardPath);
  }

  // Get search params
  const params = await searchParams;
  const message = params.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Password Reset Success Message */}
        {message === "password_reset_success" && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="h-5 w-5 text-green-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Password Reset Successful
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  You can now sign in with your new password.
                </p>
              </div>
            </div>
          </div>
        )}

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
                  Access through invitation only. Contact your administrator for
                  access.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/register"
              className="block w-full text-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 px-4 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
            >
              Register as Citizen
            </Link>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Staff Access
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Staff Members:</strong> You'll receive an email
                invitation from your administrator with a link to create your
                account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}