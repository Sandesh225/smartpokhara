// components/auth/AuthForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const supabase = createClient();
  const isRegister = mode === "register";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName,
              phone: phone || null,
            },
          },
        }
      );

      if (signUpError) throw signUpError;

      if (authData.user) {
        if (authData.user.identities && authData.user.identities.length === 0) {
          setError("A user with this email already exists. Please sign in.");
          setLoading(false);
          return;
        }

        if (authData.session) {
          const { data: rolesData } = await supabase
            .from("user_roles")
            .select("role:roles(role_type, is_active)")
            .eq("user_id", authData.user.id)
            .eq("role.is_active", true);

          const roles =
            rolesData?.map((ur: any) => ur.role?.role_type).filter(Boolean) ||
            [];

          let dashboardPath = "/citizen/dashboard";
          if (roles.includes("admin") || roles.includes("dept_head")) {
            dashboardPath = "/admin/dashboard";
          } else if (
            roles.some((r: string) =>
              [
                "dept_staff",
                "ward_staff",
                "field_staff",
                "call_center",
              ].includes(r)
            )
          ) {
            dashboardPath = "/staff/dashboard";
          }

          router.push(dashboardPath);
          router.refresh();
        } else {
          setMessage(
            "Registration successful! Please check your email to verify your account."
          );
        }
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;

      if (data.user) {
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role:roles(role_type, is_active)")
          .eq("user_id", data.user.id)
          .eq("role.is_active", true);

        const roles =
          rolesData?.map((ur: any) => ur.role?.role_type).filter(Boolean) || [];

        let dashboardPath = "/citizen/dashboard";

        if (roles.includes("admin") || roles.includes("dept_head")) {
          dashboardPath = "/admin/dashboard";
        } else if (
          roles.some((r: string) =>
            ["dept_staff", "ward_staff", "field_staff", "call_center"].includes(
              r
            )
          )
        ) {
          dashboardPath = "/staff/dashboard";
        }

        router.push(dashboardPath);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div>
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            SP
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {isRegister ? "Create your account" : "Sign in to your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Register
              </Link>
            </>
          )}
        </p>
      </div>

      {/* Form */}
      <form
        className="mt-8 space-y-6"
        onSubmit={isRegister ? handleRegister : handleLogin}
      >
        <div className="space-y-4 rounded-lg shadow-sm">
          {isRegister && (
            <>
              <div>
                <label
                  htmlFor="full-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number (Optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="+977-XXXXXXXXX"
                />
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="email-address"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder={isRegister ? "Min. 8 characters" : "••••••••"}
              minLength={8}
            />
          </div>

          {isRegister && (
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Confirm your password"
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="rounded-lg bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center rounded-lg bg-linear-to-r from-blue-600 to-blue-700 py-3 px-4 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin-custom -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span>{isRegister ? "Create Account" : "Sign In"}</span>
          )}
        </button>

        {!isRegister && (
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
