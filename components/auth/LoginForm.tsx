// components/auth/LoginForm.tsx
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
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner"; // Direct Sonner import
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
  const [rememberMe, setRememberMe] = useState(false);

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
    
    // Start premium loading state
    const toastId = toast.loading("Verifying credentials...");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
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

      const roles = rolesData?.map((ur: any) => ur.role?.role_type).filter(Boolean) ?? [];

      const mockUser: CurrentUser = {
        id: data.user.id,
        email: data.user.email ?? email,
        roles,
        profile: data.user.user_metadata?.profile ?? null,
      } as any;

      // Update loading toast to success
      toast.success("Welcome back!", {
        id: toastId,
        description: "Login successful. Loading your dashboard...",
      });

      const dashboardPath = getDefaultDashboardPath(mockUser);
      const finalDestination = redirectPath && redirectPath !== "/" ? redirectPath : dashboardPath;

      router.push(finalDestination);
      router.refresh();
    } catch (err: any) {
      // Update loading toast to error
      toast.error("Login Failed", {
        id: toastId,
        description: err.message || "Invalid email or password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email && password && !emailError && !passwordError;

  return (
    <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email Address</label>
        <div className="relative group">
          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-200 ${emailFocused || email ? "text-blue-600" : "text-slate-400"}`}>
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
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 bg-white transition-all duration-200 outline-none ${
              emailError && !emailFocused ? "border-red-300 focus:border-red-500" : email && !emailError ? "border-green-300 focus:border-green-500" : "border-slate-200 focus:border-blue-500"
            }`}
            placeholder="name@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
          <Link href="/forgot-password" size="xs" className="text-xs font-medium text-blue-600 hover:text-blue-700">Forgot password?</Link>
        </div>
        <div className="relative group">
          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-200 ${passwordFocused || password ? "text-blue-600" : "text-slate-400"}`}>
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
            className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 bg-white transition-all duration-200 outline-none ${
              passwordError && !passwordFocused ? "border-red-300 focus:border-red-500" : password && !passwordError ? "border-green-300 focus:border-green-500" : "border-slate-200 focus:border-blue-500"
            }`}
            placeholder="Enter your password"
          />
          <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700">
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="relative w-full group overflow-hidden rounded-xl bg-blue-600 p-[2px] transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/25 disabled:opacity-60"
      >
        <div className="relative flex items-center justify-center gap-2 bg-blue-600 rounded-[10px] px-6 py-3.5 text-white font-semibold group-hover:bg-blue-700">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Sign In</span>}
          {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
        </div>
      </button>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <div className="relative flex justify-center"><span className="px-4 text-sm font-medium text-slate-500 bg-white">New to Smart Pokhara?</span></div>
      </div>

      <Link href="/register" className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all">
        Create an account <ArrowRight className="h-5 w-5" />
      </Link>
    </form>
  );
}