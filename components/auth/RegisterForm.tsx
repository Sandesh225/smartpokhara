"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The passwords you entered do not match.",
        variant: "warning",
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password too weak",
        description: "Please use at least 8 characters.",
        variant: "warning",
      });
      setLoading(false);
      return;
    }

    try {
      // 2. Sign Up
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: formData.fullName,
              phone: formData.phone || null,
            },
          },
        }
      );

      if (signUpError) throw signUpError;

      if (authData.user) {
        if (authData.user.identities && authData.user.identities.length === 0) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (authData.session) {
          // Auto-login scenario
          toast({
            title: "Account Created!",
            description: "Redirecting...",
            variant: "success",
          });
          router.push("/citizen/dashboard");
          router.refresh();
        } else {
          // Email verification scenario
          // Brief toast, let the screen explain
          toast({
            title: "Verification Sent",
            description: "Check your email.",
            variant: "success",
          });
          setSuccess(true);
        }
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      // UX: Safer error message
      toast({
        title: "Registration Failed",
        description: "We couldn't create your account right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Verify your email
          </h3>
          <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">
            We've sent a verification link to{" "}
            <span className="font-semibold text-slate-900">
              {formData.email}
            </span>
            . Please check your inbox to activate your account.
          </p>
          {/* UX: Time Expectation */}
          <p className="text-sm text-slate-500 mt-2">
            Email may take up to 2–3 minutes to arrive.
          </p>
        </div>
        
        {/* UX: Recovery options */}
        <div className="pt-2 space-y-4">
          <p className="text-sm text-slate-500">
            Didn't receive the email? Check spam or{" "}
            <button 
                onClick={() => window.location.reload()} 
                className="text-blue-600 hover:underline font-medium"
            >
                try again
            </button>.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors w-full"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleRegister}
      className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          disabled={loading}
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
          placeholder="e.g. Ram Bahadur"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Phone Number{" "}
          <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          disabled={loading}
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
          placeholder="+977 98XXXXXXXX"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={loading}
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
          placeholder="name@example.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              disabled={loading}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pr-10 disabled:opacity-50"
              placeholder="Min. 8 chars"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Confirm
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            disabled={loading}
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
            placeholder="Repeat password"
          />
        </div>
      </div>
      
      {/* UX: Password Helper Text */}
      <p className="text-xs text-slate-500">
        Use at least 8 characters with letters and numbers
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-2.5 px-4 mt-2 border border-transparent rounded-lg shadow-lg shadow-blue-600/20 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500">
            Already have an account?
          </span>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500 hover:underline underline-offset-4"
        >
          Sign in here
        </Link>
      </div>
    </form>
  );
}