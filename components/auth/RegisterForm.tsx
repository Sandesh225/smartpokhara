// components/auth/RegisterForm.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Loader2,
  User,
  Mail,
  Lock,
  ArrowRight,
  PartyPopper,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Track specific field errors for styling red borders
  const [fieldErrors, setFieldErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const errors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (formData.fullName.trim().length < 3) {
      errors.fullName = "Name must be at least 3 characters";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning("Validation Error", {
        description: "Please correct the highlighted fields.",
      });
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: formData.email,
          password: formData.password,
          options: {
            // This redirect URL must be set in your Supabase Dashboard -> Auth -> URL Configuration
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            // CRITICAL: This data is passed to the SQL Trigger to create the User Profile
            data: {
              full_name: formData.fullName,
              language: "en", // Default preference
            },
          },
        }
      );

      if (signUpError) throw signUpError;

      // Handle case where user exists but isn't verified, or exists entirely
      if (
        authData.user &&
        authData.user.identities &&
        authData.user.identities.length === 0
      ) {
        toast.error("Account Exists", {
          id: toastId,
          description:
            "An account with this email already exists. Please log in.",
        });
        return;
      }

      toast.success("Account Created!", { id: toastId });
      setSuccess(true);
    } catch (err: any) {
      toast.error("Registration Failed", {
        id: toastId,
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Success View (Email Verification Prompt)
  if (success) {
    return (
      <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500 py-10">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6 shadow-sm">
          <PartyPopper className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Verify your email
        </h3>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
          We've sent a verification link to <br />
          <span className="font-semibold text-slate-900">{formData.email}</span>
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowRight className="h-4 w-4" /> Back to Login
        </Link>
      </div>
    );
  }

  // Form View
  return (
    <form
      onSubmit={handleRegister}
      className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-5"
    >
      {/* Full Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="fullName"
          className="text-sm font-medium text-slate-700 ml-1"
        >
          Full Name
        </label>
        <div className="relative">
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full rounded-xl bg-slate-50 px-4 py-3.5 pl-11 outline-none transition-all border ${
              fieldErrors.fullName
                ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
            placeholder="John Doe"
          />
          <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
        </div>
        {fieldErrors.fullName && (
          <p className="text-xs text-red-500 ml-1">{fieldErrors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-slate-700 ml-1"
        >
          Email Address
        </label>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`w-full rounded-xl bg-slate-50 px-4 py-3.5 pl-11 outline-none transition-all border ${
              fieldErrors.email
                ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
            placeholder="name@example.com"
          />
          <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
        </div>
        {fieldErrors.email && (
          <p className="text-xs text-red-500 ml-1">{fieldErrors.email}</p>
        )}
      </div>

      {/* Passwords Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Password
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-xl bg-slate-50 px-4 py-3.5 pl-11 pr-10 outline-none transition-all border ${
                fieldErrors.password
                  ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
              placeholder="Min 8 chars"
            />
            <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">
            Confirm
          </label>
          <div className="relative">
            <input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full rounded-xl bg-slate-50 px-4 py-3.5 pl-11 outline-none transition-all border ${
                fieldErrors.confirmPassword
                  ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
              placeholder="Repeat"
            />
            <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3.5 text-white font-semibold hover:bg-blue-500 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          <span className="flex items-center justify-center gap-2">
            Create Account <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </button>

      <p className="text-center text-sm text-slate-500 mt-4">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}