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
  Check,
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

  const [focusedField, setFocusedField] = useState<string | null>(null);

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
        <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center mb-6 shadow-lg ring-4 ring-secondary/20">
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
          <ArrowRight className="h-4 w-4 group-hover:-translate-x-1 transition-transform rotate-180" />
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

    const colors = [
      "bg-destructive",
      "bg-amber-500", // Hardcoded standard Tailwind color is fine here for unique warnings
      "bg-secondary",
      "bg-green-500", // Hardcoded standard Tailwind color is fine here for success states
    ];
    const labels = ["Weak", "Fair", "Good", "Strong"];

    return {
      strength: Math.min(strength - 1, 3),
      color: colors[Math.min(strength - 1, 3)] || colors[0],
      label: labels[Math.min(strength - 1, 3)] || labels[0],
    };
  };

  const passwordStrength = getPasswordStrength();

  const getPasswordRequirements = () => {
    const { password } = formData;
    return [
      { met: password.length >= 8, label: "At least 8 characters" },
      { met: /[a-z]/.test(password) && /[A-Z]/.test(password), label: "Upper & lowercase" },
      { met: /\d/.test(password), label: "Contains number" },
      { met: /[^a-zA-Z0-9]/.test(password), label: "Special character" },
    ];
  };

  return (
    <form
      onSubmit={handleRegister}
      className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-5"
    >
      {/* Full Name */}
      <div className="space-y-2">
        <label
          htmlFor="fullName"
          className="text-sm font-semibold text-foreground"
        >
          Full Name
        </label>
        <div className="relative">
          <div
            className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-200 ${
              focusedField === "fullName" || formData.fullName
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <User className="h-5 w-5" />
          </div>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={handleChange}
            onFocus={() => setFocusedField("fullName")}
            onBlur={() => setFocusedField(null)}
            className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 bg-background transition-all duration-200 outline-none text-foreground placeholder:text-muted-foreground ${
              fieldErrors.fullName && focusedField !== "fullName"
                ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/20"
                : formData.fullName.length >= 3
                  ? "border-secondary focus:border-secondary focus:ring-4 focus:ring-secondary/20"
                  : "border-border focus:border-primary focus:ring-4 focus:ring-primary/20"
            }`}
            placeholder="John Doe"
          />
          {formData.fullName.length >= 3 && !fieldErrors.fullName && (
            <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
          )}
          {fieldErrors.fullName && focusedField !== "fullName" && (
            <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
          )}
        </div>
        {fieldErrors.fullName && focusedField !== "fullName" && (
          <p className="text-xs text-destructive ml-1 flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
            {fieldErrors.fullName}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-semibold text-foreground"
        >
          Email Address
        </label>
        <div className="relative">
          <div
            className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-200 ${
              focusedField === "email" || formData.email
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Mail className="h-5 w-5" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 bg-background transition-all duration-200 outline-none text-foreground placeholder:text-muted-foreground ${
              fieldErrors.email && focusedField !== "email"
                ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/20"
                : formData.email && !fieldErrors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                  ? "border-secondary focus:border-secondary focus:ring-4 focus:ring-secondary/20"
                  : "border-border focus:border-primary focus:ring-4 focus:ring-primary/20"
            }`}
            placeholder="name@example.com"
          />
          {formData.email && !fieldErrors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
            <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
          )}
          {fieldErrors.email && focusedField !== "email" && (
            <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
          )}
        </div>
        {fieldErrors.email && focusedField !== "email" && (
          <p className="text-xs text-destructive ml-1 flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Password
        </label>
        <div className="relative">
          <div
            className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-200 ${
              focusedField === "password" || formData.password
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Lock className="h-5 w-5" />
          </div>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 bg-background transition-all duration-200 outline-none text-foreground placeholder:text-muted-foreground ${
              fieldErrors.password && focusedField !== "password"
                ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/20"
                : formData.password.length >= 8
                  ? "border-secondary focus:border-secondary focus:ring-4 focus:ring-secondary/20"
                  : "border-border focus:border-primary focus:ring-4 focus:ring-primary/20"
            }`}
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-muted-foreground hover:text-primary transition-colors rounded-lg p-1 hover:bg-accent"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Password Strength & Requirements */}
        {formData.password && (
          <div className="space-y-3 mt-3 p-3 rounded-lg bg-muted/50 border border-border">
            {passwordStrength && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i <= passwordStrength.strength ? passwordStrength.color : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-foreground font-medium">
                  Strength: <span>{passwordStrength.label}</span>
                </p>
              </div>
            )}
            
            <div className="space-y-1.5">
              {getPasswordRequirements().map((req, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-xs transition-colors ${
                    req.met ? "text-secondary" : "text-muted-foreground"
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    req.met
                      ? "bg-secondary border-secondary"
                      : "border-border"
                  }`}>
                    {req.met && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                  </div>
                  {req.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Confirm Password
        </label>
        <div className="relative">
          <div
            className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-200 ${
              focusedField === "confirmPassword" || formData.confirmPassword
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Lock className="h-5 w-5" />
          </div>
          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            onFocus={() => setFocusedField("confirmPassword")}
            onBlur={() => setFocusedField(null)}
            className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 bg-background transition-all duration-200 outline-none text-foreground placeholder:text-muted-foreground ${
              fieldErrors.confirmPassword && focusedField !== "confirmPassword"
                ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/20"
                : formData.confirmPassword && formData.password === formData.confirmPassword
                  ? "border-secondary focus:border-secondary focus:ring-4 focus:ring-secondary/20"
                  : "border-border focus:border-primary focus:ring-4 focus:ring-primary/20"
            }`}
            placeholder="Repeat your password"
          />
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
          )}
          {fieldErrors.confirmPassword && focusedField !== "confirmPassword" && (
            <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
          )}
        </div>
        {fieldErrors.confirmPassword && focusedField !== "confirmPassword" && (
          <p className="text-xs text-destructive ml-1 flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary hover:bg-primary/90 py-3.5 text-primary-foreground font-semibold transition-all active:scale-[0.98] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg mt-2"
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