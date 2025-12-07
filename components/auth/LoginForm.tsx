"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { getDefaultDashboardPath } from "@/lib/auth/role-helpers";
import type { CurrentUser } from "@/lib/types/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

      // 2. Fetch user roles from your bridge table
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role:roles(role_type)")
        .eq("user_id", data.user.id);

      if (rolesError) {
        console.error("Failed to fetch roles:", rolesError);
      }

      const roles =
        rolesData?.map((ur: any) => ur.role?.role_type).filter(Boolean) ?? [];

      // 3. Build a minimal CurrentUser-like object for helper functions
      const mockUser: CurrentUser = {
        id: data.user.id,
        email: data.user.email ?? email,
        roles,
        profile: data.user.user_metadata?.profile ?? null,
      } as any; // `as any` if your CurrentUser has more fields

      // 4. Get role-based default dashboard path
      const dashboardPath = getDefaultDashboardPath(mockUser);

      // 5. Final redirect destination:
      //    - If ?redirect=/something and not '/', honor it
      //    - Otherwise, go to the role-based dashboard
      const finalDestination =
        redirectPath && redirectPath !== "/" ? redirectPath : dashboardPath;

      router.push(finalDestination);
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="name@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="flex justify-end mt-1">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            New to Smart Pokhara?
          </span>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Create an account
        </Link>
      </div>
    </form>
  );
}
