import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Link
            href="/"
            title="Back to homepage"
            className="inline-flex items-center justify-center mb-6 group"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-xl shadow-blue-600/20 transition-transform group-hover:scale-105">
              SP
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            Create Account
          </h1>
          <p className="text-slate-600">
            Join Smart City Pokhara digital services
          </p>
          {/* Anxiety Reduction */}
          <p className="text-xs text-slate-500 mt-1">
            Create your account in under 2 minutes
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
          <RegisterForm />
        </div>

        {/* Privacy & Terms Footer */}
        <div className="mt-8 text-center space-y-4">
          {/* Privacy Assurance */}
          <p className="text-xs text-slate-500 max-w-xs mx-auto flex items-center justify-center gap-1.5">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Your information is protected and used only for city services.
          </p>

          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            By registering, you agree to our{" "}
            <Link
              href="/terms"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
