"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("🔍 Checking session for password reset...");

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Session check error:", error);
          setIsValidSession(false);
          setCheckingSession(false);
          return;
        }

        if (session) {
          console.log("✅ Valid session found for password reset");
          console.log("Session user:", session.user.email);
          setIsValidSession(true);
        } else {
          console.log("❌ No active session - invalid or expired link");
          setIsValidSession(false);
        }
      } catch (err) {
        console.error("❌ Exception checking session:", err);
        setIsValidSession(false);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();

    // Listen for auth state changes (when user clicks reset link)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔔 Auth state changed:", event);

      if (event === "PASSWORD_RECOVERY") {
        console.log("✅ Password recovery event detected");
        setIsValidSession(true);
        setCheckingSession(false);
      } else if (event === "SIGNED_OUT") {
        console.log("🚪 User signed out");
        setIsValidSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const validatePassword = () => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password)) return "Must contain a lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Must contain an uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Must contain a number";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const validationError = validatePassword();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating your password...");

    try {
      console.log("🔐 Updating password...");

      const { data, error } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (error) {
        console.error("❌ Password update error:", error);

        if (error.message.toLowerCase().includes("session")) {
          throw new Error("Session expired. Please request a new reset link.");
        }
        throw error;
      }

      console.log("✅ Password updated successfully");

      // Log the password reset in the database
      try {
        if (data.user) {
          await supabase.rpc("log_password_reset", {
            p_user_id: data.user.id,
          });
          console.log("✅ Password reset logged");
        }
      } catch (logError) {
        console.error("⚠️ Failed to log password reset:", logError);
        // Don't fail the whole operation if logging fails
      }

      toast.success("Password changed successfully! Redirecting to login...", {
        id: toastId,
      });

      // Sign out the user after password reset
      await supabase.auth.signOut();
      console.log("✅ User signed out");

      // Redirect to login with success message
      setTimeout(() => {
        router.push("/login?message=password_reset_success");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error("❌ Password reset error:", err);
      toast.error(
        err.message || "Failed to update password. Please try again.",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading/checking state
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid session
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

  // Valid session - show reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
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
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
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
                  tabIndex={-1}
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
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !password || password !== confirmPassword}
          >
            {loading ? "Updating Password..." : "Set New Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
