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
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getDefaultDashboardPath } from "@/lib/auth/role-helpers";
import type { CurrentUser } from "@/lib/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  // Email validation
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

  // Password validation
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
        <Label htmlFor="email">Email Address</Label>
        <div className="relative group">
          <div
            className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-200 z-10 ${
              emailFocused || email
                ? "text-primary dark:text-primary/90"
                : "text-muted-foreground dark:text-muted-foreground/80"
            }`}
          >
            <Mail className="h-5 w-5" />
          </div>
          <Input
            id="email"
            type="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            className={`pl-10 ${
              emailError && !emailFocused
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }`}
            placeholder="name@example.com"
          />
          {email && !emailError && !emailFocused && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary dark:text-secondary/90" />
          )}
          {emailError && !emailFocused && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
          )}
        </div>
        {emailError && !emailFocused && (
          <p className="text-xs text-destructive ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
            {emailError}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary dark:text-primary/90 hover:text-secondary dark:hover:text-secondary/90 transition-colors hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative group">
          <div
            className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-200 z-10 ${
              passwordFocused || password
                ? "text-primary dark:text-primary/90"
                : "text-muted-foreground dark:text-muted-foreground/80"
            }`}
          >
            <Lock className="h-5 w-5" />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            className={`pl-10 pr-10 ${
              passwordError && !passwordFocused
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }`}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary transition-colors rounded-lg"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {passwordError && !passwordFocused && (
          <p className="text-xs text-destructive ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
            {passwordError}
          </p>
        )}
      </div>

      {/* Submit Button */}
      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full font-semibold"
        size="lg"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          <span className="flex items-center justify-center gap-2">
            Sign in <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>

      {/* Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border dark:border-border/50" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-sm font-medium text-muted-foreground dark:text-muted-foreground/80 bg-background dark:bg-background">
            New to Smart Pokhara?
          </span>
        </div>
      </div>

      {/* Register Link */}
      <Link
        href="/register"
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-border dark:border-border/50 hover:border-primary dark:hover:border-primary/80 bg-background dark:bg-card text-foreground dark:text-foreground/95 font-semibold hover:bg-accent dark:hover:bg-accent/80 transition-all active:scale-[0.98]"
      >
        Create an account
        <ArrowRight className="h-5 w-5" />
      </Link>
    </form>
  );
}