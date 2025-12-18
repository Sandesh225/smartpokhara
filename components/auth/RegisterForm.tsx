// components/auth/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Loader2,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner"; // Swapped to Sonner

export function RegisterForm() {
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
        description: "Please check the highlighted fields.",
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
          toast.error("Account Exists", {
            id: toastId,
            description:
              "An account with this email already exists. Try logging in.",
          });
          setLoading(false);
          return;
        }
        toast.success("Account Created!", { id: toastId });
        setSuccess(true);
      }
    } catch (err: any) {
      toast.error("Registration Failed", {
        id: toastId,
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500 py-10">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <PartyPopper className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Verify your email
        </h3>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">
          We've sent a link to{" "}
          <span className="font-semibold text-slate-900">{formData.email}</span>
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
        >
          <ArrowRight className="h-4 w-4" /> Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleRegister}
      className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4"
    >
      <div className="space-y-1.5">
        <label
          htmlFor="fullName"
          className="text-sm font-medium text-slate-700"
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
            className={`w-full rounded-lg bg-slate-50 px-4 py-3.5 pl-11 ring-1 ${fieldErrors.fullName ? "ring-red-300" : "ring-slate-200 focus:ring-blue-600"}`}
            placeholder="John Doe"
          />
          <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
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
            className={`w-full rounded-lg bg-slate-50 px-4 py-3.5 pl-11 ring-1 ${fieldErrors.email ? "ring-red-300" : "ring-slate-200 focus:ring-blue-600"}`}
            placeholder="name@example.com"
          />
          <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-lg bg-slate-50 px-4 py-3.5 pl-11 ring-1 ${fieldErrors.password ? "ring-red-300" : "ring-slate-200"}`}
              placeholder="Min. 8 chars"
            />
            <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Confirm</label>
          <div className="relative">
            <input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full rounded-lg bg-slate-50 px-4 py-3.5 pl-11 ring-1 ${fieldErrors.confirmPassword ? "ring-red-300" : "ring-slate-200"}`}
              placeholder="Repeat"
            />
            <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3.5 text-white font-semibold hover:bg-blue-500 transition-all active:scale-[0.98]"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
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
          className="font-semibold text-blue-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
