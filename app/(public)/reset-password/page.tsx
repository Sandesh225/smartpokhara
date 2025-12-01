// app/(public)/reset-password/page.tsx - UPDATED VERSION
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<null | boolean>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check if user already has a valid session
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        console.log("User already has a valid session");
        setIsValidSession(true);
        return;
      }

      // Check for token in URL (from email link)
      const urlToken = searchParams.get("token");
      const type = searchParams.get("type");
      const verified = searchParams.get("verified");

      console.log("URL params:", { urlToken, type, verified });

      if (verified === "true" && urlToken && type === "recovery") {
        // Token was already verified by the server route
        setToken(urlToken);
        setIsValidSession(true);
        return;
      }

      // If no session and no verified token, check for direct token
      if (urlToken && type === "recovery") {
        setToken(urlToken);
        await verifyToken(urlToken);
      } else {
        // No valid session or token found
        toast.error("Invalid or missing reset link.");
        setIsValidSession(false);
      }
    };

    checkSession();
  }, [searchParams, supabase.auth]);

  const verifyToken = async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "recovery",
      });

      if (error) {
        if (
          error.message.includes("expired") ||
          error.message.includes("invalid")
        ) {
          toast.error(
            "This password reset link has expired or is invalid. Please request a new one."
          );
        } else {
          toast.error("Invalid reset link. Please try again.");
        }
        setIsValidSession(false);
      } else {
        // Success! Token is valid
        setIsValidSession(true);
        console.log("Token verified successfully");
      }
    } catch (err) {
      console.error("Token verification error:", err);
      toast.error("Failed to validate reset link.");
      setIsValidSession(false);
    }
  };

  const validatePassword = () => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password)) return "Must contain a lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Must contain an uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Must contain a number";
    if (!/(?=.*[@$!%*?&])/.test(password))
      return "Must contain a special character (@$!%*?&)";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate password strength
    const validationError = validatePassword();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating your password...");

    try {
      // Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (updateError) {
        if (updateError.message.toLowerCase().includes("reauth")) {
          throw new Error("Session expired. Please request a new reset link.");
        }
        throw updateError;
      }

      // Optional: Log password reset event
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // First, let's check if the function exists
          const { error: rpcError } = await supabase.rpc("log_password_reset", {
            p_user_id: user.id,
          });

          if (rpcError) {
            console.warn(
              "Failed to log password reset (function may not exist):",
              rpcError
            );
          }
        }
      } catch (logError) {
        console.warn("Failed to log password reset:", logError);
      }

      toast.success("Password changed successfully! Redirecting to login...", {
        id: toastId,
      });

      // Success → redirect after short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      toast.error(
        err.message || "Failed to update password. Please try again.",
        { id: toastId }
      );
      console.error("Reset error:", err);
    } finally {
      setLoading(false);
      setPassword("");
      setConfirmPassword("");
    }
  };

  // Show loading while validating token
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid session → show error screen
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Invalid or Expired Link
          </h2>
          <p className="text-gray-600">
            This password reset link is no longer valid or has already been
            used.
          </p>
          <div className="space-y-3 mt-6">
            <Button
              onClick={() => router.push("/forgot-password")}
              className="w-full"
            >
              Request New Reset Link
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/login")}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Valid session → show reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <Lock className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create a strong, unique password for your account
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <p className="font-medium text-gray-900">Password must contain:</p>
            <ul className="space-y-1 text-gray-600">
              <li className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${password.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}
                />
                At least 8 characters
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${/[a-z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                />
                One lowercase letter
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${/[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                />
                One uppercase letter
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${/\d/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                />
                One number
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${/[@$!%*?&]/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                />
                One special character (@$!%*?&)
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading || !password || password !== confirmPassword}
          >
            {loading ? "Updating Password..." : "Set New Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
