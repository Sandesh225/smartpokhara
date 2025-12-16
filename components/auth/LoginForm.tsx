"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { getDefaultDashboardPath } from "@/lib/auth/role-helpers";
import type { CurrentUser } from "@/lib/types/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const redirectPath = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      // UX: Role-aware clarity
      toast({
        title: "Welcome back!",
        description: "Login successful. Loading your dashboard...",
        variant: "success",
      });

      const dashboardPath = getDefaultDashboardPath(mockUser);
      const finalDestination =
        redirectPath && redirectPath !== "/" ? redirectPath : dashboardPath;

      router.push(finalDestination);
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      // UX: Normalized error message
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          disabled={loading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
          placeholder="name@example.com"
        />
        {/* UX: Helper text */}
        <p className="mt-1 text-xs text-slate-400">
          Use the email you registered with
        </p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            Password
          </label>
        </div>

        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pr-10 disabled:opacity-50"
            placeholder="••••••••"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => setShowPassword((prev) => !prev)}
            title={showPassword ? "Hide password" : "Show password"} // UX: Tooltip
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            {/* UX: Reassurance on slow networks */}
            <span className="truncate">
              Verifying... This may take a moment
            </span>
          </>
        ) : (
          "Sign In"
        )}
      </button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-slate-500">
            New to Smart Pokhara?
          </span>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
        >
          Create an account
        </Link>
      </div>
    </form>
  );
}
