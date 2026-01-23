"use client";

import type React from "react";

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
  CheckCircle2,
  AlertCircle,
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
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: formData.fullName,
              language: "en",
            },
          },
        }
      );

      if (signUpError) throw signUpError;

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

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        // Email confirmation required
        toast.success("Account Created!", { id: toastId });
        setSuccess(true);
      } else if (authData.session) {
        // Auto logged in (no email confirmation needed)
        toast.success("Account Created!", { id: toastId });
        // Redirect to profile setup
        window.location.href = "/setup-profile";
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
        <div className="h-20 w-20 rounded-full bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center mb-6 shadow-lg ring-4 ring-secondary/20">
          <PartyPopper className="h-10 w-10 text-secondary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Verify your email
        </h3>
        <p className="text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed">
          We've sent a verification link to <br />
          <span className="font-semibold text-foreground">
            {formData.email}
          </span>
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors group"
        >
          <ArrowRight className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Login
        </Link>
      </div>
    );
  }

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return null;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const colors = ["bg-destructive", "bg-warning-amber", "bg-secondary", "bg-success-green"];
    const labels = ["Weak", "Fair", "Good", "Strong"];
    
    return {
      strength: Math.min(strength - 1, 3),
      color: colors[Math.min(strength - 1, 3)] || colors[0],
      label: labels[Math.min(strength - 1, 3)] || labels[0]
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <form
      onSubmit={handleRegister}
      className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-5"
    >
      {/* Full Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="fullName"
          className="text-sm font-medium text-foreground ml-1"
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
            className={`w-full rounded-xl bg-background dark:bg-card px-4 py-3.5 pl-11 outline-none transition-all border-2 text-foreground placeholder:text-muted-foreground ${
              fieldErrors.fullName
                ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10"
                : formData.fullName.length >= 3
                  ? "border-secondary focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                  : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
            }`}
            placeholder="John Doe"
          />
          <User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
          {formData.fullName.length >= 3 && !fieldErrors.fullName && (
            <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
          )}
        </div>
        {fieldErrors.fullName && (
          <p className="text-xs text-destructive ml-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {fieldErrors.fullName}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-foreground ml-1"
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
            className={`w-full rounded-xl bg-background dark:bg-card px-4 py-3.5 pl-11 outline-none transition-all border-2 text-foreground placeholder:text-muted-foreground ${
              fieldErrors.email
                ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10"
                : formData.email && !fieldErrors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                  ? "border-secondary focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                  : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
            }`}
            placeholder="name@example.com"
          />
          <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
          {formData.email && !fieldErrors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
            <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
          )}
        </div>
        {fieldErrors.email && (
          <p className="text-xs text-destructive ml-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Passwords Grid */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground ml-1">
            Password
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-xl bg-background dark:bg-card px-4 py-3.5 pl-11 pr-10 outline-none transition-all border-2 text-foreground placeholder:text-muted-foreground ${
                fieldErrors.password
                  ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10"
                  : formData.password.length >= 8
                    ? "border-secondary focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                    : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
              }`}
              placeholder="Min 8 characters"
            />
            <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-muted-foreground hover:text-primary transition-colors rounded-lg p-1 hover:bg-accent"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {formData.password && passwordStrength && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i <= passwordStrength.strength ? passwordStrength.color : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground ml-1">
                Password strength: <span className="font-medium">{passwordStrength.label}</span>
              </p>
            </div>
          )}
          {fieldErrors.password && (
            <p className="text-xs text-destructive ml-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground ml-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full rounded-xl bg-background dark:bg-card px-4 py-3.5 pl-11 outline-none transition-all border-2 text-foreground placeholder:text-muted-foreground ${
                fieldErrors.confirmPassword
                  ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10"
                  : formData.confirmPassword && formData.password === formData.confirmPassword
                    ? "border-secondary focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                    : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
              }`}
              placeholder="Repeat password"
            />
            <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
            )}
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-destructive ml-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary hover:bg-secondary py-3.5 text-primary-foreground font-semibold transition-all active:scale-[0.98] shadow-lg shadow-primary/20 dark:shadow-primary/30 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-lg mt-2"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          <span className="flex items-center justify-center gap-2">
            Create Account <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </button>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-secondary hover:underline transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}