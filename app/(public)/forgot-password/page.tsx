import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-blue-700 text-xl font-bold text-white shadow-lg">
              SP
            </div>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            We'll send you a link to reset your password
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}