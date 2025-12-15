// ============================================
// FILE: components/auth/LoginForm.tsx
// ============================================
"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, AlertCircle, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getDefaultDashboardPath } from "@/lib/auth/role-helpers";
import type { CurrentUser } from "@/lib/types/auth";
import { useToast } from "@/hooks/use-toast";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const redirectPath = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Sign in with Supabase
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;
      if (!data.user) {
        throw new Error("Unable to sign in. Please try again.");
      }

      // 2. Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role:roles(role_type)")
        .eq("user_id", data.user.id);

      if (rolesError) {
        console.error("Failed to fetch roles:", rolesError);
      }

      const roles =
        rolesData?.map((ur: any) => ur.role?.role_type).filter(Boolean) ?? [];

      // 3. Build minimal CurrentUser object
      const mockUser: CurrentUser = {
        id: data.user.id,
        email: data.user.email ?? email,
        roles,
        profile: data.user.user_metadata?.profile ?? null,
      } as any;

      // 4. Get role-based dashboard
      const dashboardPath = getDefaultDashboardPath(mockUser);
      const finalDestination =
        redirectPath && redirectPath !== "/" ? redirectPath : dashboardPath;

      // 5. Success toast
      toast({
        variant: "success",
        title: "Welcome back!",
        description: `Signed in as ${data.user.email}`,
      });

      router.push(finalDestination);
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.message || "Invalid email or password";
      setError(errorMessage);

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            placeholder="name@example.com"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="flex justify-end mt-2">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg transform hover:scale-[1.02]"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-500 font-medium">
            New to Smart Pokhara?
          </span>
        </div>
      </div>

      {/* Register Link */}
      <div className="text-center">
        <Link
          href="/register"
          className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-blue-600 rounded-lg text-sm font-semibold text-blue-600 bg-white hover:bg-blue-50 transition-all transform hover:scale-[1.02]"
        >
          Create an account
        </Link>
      </div>
    </form>
  );
}
