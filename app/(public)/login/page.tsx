import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Link
            href="/"
            title="Back to homepage" // UX: Tooltip
            className="inline-flex items-center justify-center mb-6 group"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-xl shadow-blue-600/20 transition-transform group-hover:scale-105">
              SP
            </div>
          </Link>

          {/* Trust Signal */}
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
            Official Digital Services Platform of Pokhara Metropolitan City
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            Welcome Back
          </h1>

          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-600">
              Sign in to access your digital citizen services
            </p>
            {/* Audience Clarification */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Citizen, Staff & Official Access
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
          <LoginForm />
        </div>

        {/* Improved Support Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-slate-500">Can't access your account?</p>
          <div className="flex justify-center gap-4 text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Reset Password
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              href="/support"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
