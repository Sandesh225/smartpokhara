import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-xl font-bold text-white shadow-lg">
              SP
            </div>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your Smart City Pokhara account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Need help?{" "}
          <Link
            href="#"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
