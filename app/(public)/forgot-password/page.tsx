// app/(public)/forgot-password/page.tsx - UPDATED
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Sending reset link...");

    try {
      // Use the new reset route for better handling
      const redirectUrl = `${window.location.origin}/auth/reset`;

      console.log(
        "Sending reset email to:",
        email,
        "redirect to:",
        redirectUrl
      );

      const { error, data } = await supabase.auth.resetPasswordForEmail(
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

      console.log("Reset email sent successfully:", data);

      toast.success(
        "If an account exists with this email, a password reset link has been sent. Please check your inbox and spam folder.",
        { id: toastId }
      );

      setIsSubmitted(true);
      setEmail(""); // Clear email for security
    } catch (err: any) {
      console.error("Password reset error:", err);
      toast.error(
        err.message || "Failed to send reset email. Please try again later.",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
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
              We've sent a password reset link to your email address. The link
              will expire in 24 hours.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  router.push("/login");
                }}
                className="w-full"
              >
                Back to Login
              </Button>
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
          /* Form */
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
              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
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

        {/* Additional Info */}
        <div className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The reset link expires in 24 hours. If you
              don't receive an email, check your spam/junk folder or try again
              later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
