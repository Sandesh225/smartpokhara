"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">New Password</label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="Min 8 chars"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 pl-11 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            />
            <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Confirm Password</label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 pl-11 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            />
            <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-green-600 py-3.5 text-white font-semibold hover:bg-green-500 transition-all shadow-lg shadow-green-600/20 disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          <span className="flex items-center justify-center gap-2">
            Update Password <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </button>
    </form>
  );
}