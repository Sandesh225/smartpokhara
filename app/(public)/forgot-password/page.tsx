"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Show error message if link expired
  useState(() => {
    if (error === "link_expired") {
      toast.error(
        "The password reset link has expired. Please request a new one."
      );
    }
  });

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Sending reset link...");

    try {
      // CRITICAL: Use reset-password page directly as redirect
      // Supabase will automatically add the recovery token
      const redirectUrl = `${window.location.origin}/reset-password`;

      console.log("📧 Sending password reset email");
      console.log("Redirect URL:", redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: redirectUrl,
        }
      );

      if (error) {
        if (error.message.toLowerCase().includes("rate limit")) {
          throw new Error(
            "Too many attempts. Please try again in a few minutes."
          );
        }
        throw error;
      }

      console.log("✅ Password reset email sent successfully");

      toast.success(
        "Password reset link sent! Check your email inbox and spam folder.",
        { id: toastId }
      );

      setIsSubmitted(true);
      setEmail("");
    } catch (err: any) {
      console.error("Password reset error:", err);
      toast.error(
        err.message || "Failed to send reset email. Please try again.",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {/* Show error alert if link expired */}
        {error === "link_expired" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Link Expired
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  The password reset link has expired. Please request a new one
                  below.
                </p>
              </div>
            </div>
          </div>
        )}

        {isSubmitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Check your email
            </h3>
            <p className="text-gray-600 mb-4">
              We've sent a password reset link to your email. The link will
              expire in 1 hour.
            </p>
            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full">Back to Login</Button>
              </Link>
              <p className="text-sm text-gray-500">
                Didn't receive the email?{" "}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </div>
          </form>
        )}

        <div className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The reset link expires in 1 hour. Check
              your spam/junk folder if you don't see the email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
