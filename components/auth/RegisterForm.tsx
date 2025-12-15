// ============================================
// FILE: components/auth/RegisterForm.tsx
// ============================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrength } from "./PasswordStrength";

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

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Passwords do not match",
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Password must be at least 8 characters long",
      });
      setLoading(false);
      return;
    }

    try {
      // Sign Up
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
        // Check if identity exists
        if (authData.user.identities && authData.user.identities.length === 0) {
          toast({
            variant: "destructive",
            title: "Account Exists",
            description:
              "An account with this email already exists. Please sign in.",
          });
          setLoading(false);
          return;
        }

        // Handle success
        if (authData.session) {
          toast({
            variant: "success",
            title: "Account Created!",
            description: "Welcome to Smart Pokhara",
          });
          router.push("/citizen/dashboard");
          router.refresh();
        } else {
          setSuccess(true);
          toast({
            variant: "success",
            title: "Verification Email Sent",
            description: `Please check ${formData.email} to activate your account`,
          });
        }
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: err.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  // Success State
  if (success) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Verify your email
          </h3>
          <p className="text-gray-600 leading-relaxed">
            We've sent a verification link to{" "}
            <strong className="text-gray-900">{formData.email}</strong>
            <br />
            Please check your inbox to activate your account.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {/* Full Name */}
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            placeholder="Ram Bahadur"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            placeholder="name@example.com"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Phone Number{" "}
          <span className="text-gray-400 font-normal text-xs">(Optional)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            placeholder="+977 98XXXXXXXX"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            placeholder="Min. 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        <PasswordStrength password={formData.password} />
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            placeholder="Repeat password"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg transform hover:scale-[1.02]"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-500 font-medium">
            Already have an account?
          </span>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-blue-600 rounded-lg text-sm font-semibold text-blue-600 bg-white hover:bg-blue-50 transition-all transform hover:scale-[1.02]"
        >
          Sign in here
        </Link>
      </div>
    </form>
  );
}
