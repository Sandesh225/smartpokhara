"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    if (email && !emailFocused) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    }
  }, [email, emailFocused]);

  useEffect(() => {
    if (password && !passwordFocused && password.length > 0) {
      if (password.length < 6) {
        setPasswordError("Password seems too short");
      } else {
        setPasswordError("");
      }
    }
  }, [password, passwordFocused]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Verifying credentials...");

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;
      if (!data.user) throw new Error("Unable to sign in.");

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role:roles(role_type)")
        .eq("user_id", data.user.id);

      if (rolesError) console.error("Failed to fetch roles:", rolesError);

      const roles =
        rolesData?.map((ur: any) => ur.role?.role_type).filter(Boolean) ?? [];

      const mockUser: CurrentUser = {
        id: data.user.id,
        email: data.user.email ?? email,
        roles,
        profile: data.user.user_metadata?.profile ?? null,
      } as any;

      toast.success("Welcome back!", {
        id: toastId,
        description: "Login successful. Loading your dashboard...",
      });

      const dashboardPath = getDefaultDashboardPath(mockUser);
      const finalDestination =
        redirectPath && redirectPath !== "/" ? redirectPath : dashboardPath;

      router.push(finalDestination);
      router.refresh();
    } catch (err: any) {
      toast.error("Login Failed", {
        id: toastId,
        description:
          err.message || "Invalid email or password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email && password && !emailError && !passwordError;

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      {/* Email Field */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-foreground"
        >
          Email Address
        </label>
        <div className="relative group">
          <div
            className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-200 ${
              emailFocused || email ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Mail className="h-5 w-5" />
          </div>
          <input
            id="email"
            type="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 bg-background dark:bg-card transition-all duration-200 outline-none text-foreground placeholder:text-muted-foreground ${
              emailError && !emailFocused
                ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10"
                : email && !emailError
                  ? "border-secondary focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                  : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
            }`}
            placeholder="name@example.com"
          />
          {email && !emailError && !emailFocused && (
            <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
          )}
        </div>
        {emailError && (
          <p className="text-xs text-destructive ml-1 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
            {emailError}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-foreground"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary hover:text-secondary transition-colors hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative group">
          <div
            className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-200 ${
              passwordFocused || password
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Lock className="h-5 w-5" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 bg-background dark:bg-card transition-all duration-200 outline-none text-foreground placeholder:text-muted-foreground ${
              passwordError && !passwordFocused
                ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10"
                : password && !passwordError
                  ? "border-secondary focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                  : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
            }`}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-accent"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {passwordError && (
          <p className="text-xs text-destructive ml-1 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
            {passwordError}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="relative w-full group overflow-hidden rounded-xl bg-primary hover:bg-secondary transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 dark:hover:shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-[0.98]"
      >
        <div className="relative flex items-center justify-center gap-2 px-6 py-3.5 text-primary-foreground font-semibold">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </div>
      </button>

      {/* Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-sm font-medium text-muted-foreground bg-background dark:bg-[rgb(15,20,25)]">
            New to Smart Pokhara?
          </span>
        </div>
      </div>

      {/* Register Link */}
      <Link
        href="/register"
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-border hover:border-primary bg-background dark:bg-card text-foreground font-semibold hover:bg-accent transition-all active:scale-[0.98]"
      >
        Create an account
        <ArrowRight className="h-5 w-5" />
      </Link>
    </form>
  );
}