// ============================================
// FILE: app/(auth)/login/page.tsx
// ============================================
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthImageCarousel } from "@/components/auth/AuthImageCarousel";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image Carousel */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <AuthImageCarousel />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            {/* Logo & Branding */}
            <div className="flex justify-center mb-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-xl font-bold text-white shadow-lg group-hover:shadow-xl transition-shadow">
                  SP
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Smart Pokhara
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">
                    पोखरा महानगरपालिका
                  </p>
                </div>
              </Link>
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-sm">
                Sign in to your Smart City Pokhara account
              </p>
            </div>

            {/* Login Form Component */}
            <LoginForm />
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help?{" "}
              <Link
                href="/support"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
