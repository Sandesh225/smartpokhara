"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Reset link sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center animate-[scaleIn_0.2s_ease-out]">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent text-primary mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Check your email</h3>
        <p className="text-muted-foreground text-sm mb-6">
          We've sent password reset instructions to <strong>{email}</strong>
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm font-medium text-primary hover:text-primary/80 underline transition-colors"
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email Address
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-muted border border-input px-4 py-3.5 pl-11 focus:ring-2 focus:ring-ring focus:border-transparent transition-all outline-none text-foreground placeholder:text-muted-foreground"
          />
          <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-3.5 text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          <span className="flex items-center justify-center gap-2">
            Send Reset Link <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </button>
    </form>
  );
}