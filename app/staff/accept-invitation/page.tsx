// app/staff/accept-invitation/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Shield, ArrowRight, Loader2 } from "lucide-react";

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const supabase = createClient();

  const [invitationData, setInvitationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepting, setAccepting] = useState(false);

  // -----------------------------
  // VERIFY INVITATION
  // -----------------------------
  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }
    verifyInvitation();
  }, [token]);

  const verifyInvitation = async () => {
    try {
      const { data, error: verifyError } = await supabase.rpc("verify_staff_invitation", {
        p_token: token
      });

      if (verifyError) throw verifyError;

      if (!data.valid) {
        setError(data.message || "Invalid invitation");
        setLoading(false);
        return;
      }

      setInvitationData(data);
    } catch (err: any) {
      console.error("Error verifying invitation:", err);
      setError("Failed to verify invitation");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // ACCEPT INVITATION + SIGN UP
  // -----------------------------
  const handleAccept = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setAccepting(true);

    try {
      // STEP 1 → SIGN UP USER
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitationData.email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: invitationData.full_name,
            phone: invitationData.phone
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create account");

      console.log("✅ User created:", authData.user.id);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // STEP 2 → ACCEPT INVITATION & ASSIGN ROLE
      const { data: acceptData, error: acceptError } = await supabase.rpc("accept_staff_invitation", {
        p_token: token,
        p_user_id: authData.user.id
      });

      if (acceptError) throw acceptError;
      if (!acceptData?.success) {
        throw new Error(acceptData?.message || "Failed to accept invitation");
      }

      console.log("✅ Invitation accepted, role assigned:", acceptData.role_type);

      // STEP 3 → WAIT FOR DB CONSISTENCY
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // STEP 4 → VERIFY ROLE (RETRY 5 TIMES)
      let roleVerified = false;
      for (let attempt = 1; attempt <= 5; attempt++) {
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select(`role:roles!inner(role_type, is_active)`)
          .eq("user_id", authData.user.id)
          .eq("role.is_active", true)
          .maybeSingle();

        if (!roleError && roleData?.role) {
          console.log("✅ Role verified:", roleData.role.role_type);
          roleVerified = true;
          break;
        }

        console.log(`⏳ Role not visible yet (attempt ${attempt}/5)...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // STEP 5 → CREATE WELCOME NOTIFICATION
      try {
        await supabase.from("staff_notifications").insert({
          user_id: authData.user.id,
          type: "invitation",
          title: "Welcome to Smart City Pokhara!",
          message: `Your account has been activated as ${invitationData.role_type.replace("_", " ")}.`,
          action_url: "/staff/dashboard",
          is_read: false
        });
      } catch (notifErr) {
        console.warn("⚠️ Notification creation failed:", notifErr);
      }

      // STEP 6 → SIGN IN TO CREATE SESSION
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitationData.email,
        password
      });

      if (signInError) throw signInError;

      console.log("✅ Session fully established");

      await new Promise((resolve) => setTimeout(resolve, 500));

      // STEP 7 → ROLE-BASED REDIRECT
      let dashboardPath = "/staff/dashboard";

      if (["admin", "dept_head"].includes(invitationData.role_type)) {
        dashboardPath = "/admin/dashboard";
      }

      alert(
        `✅ Account created successfully! Welcome to the ${invitationData.role_type
          .replace("_", " ")
          .toUpperCase()} portal.`
      );

      window.location.href = dashboardPath;
    } catch (err: any) {
      console.error("❌ Error accepting invitation:", err);
      alert(err.message || "Failed to create account. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  // -----------------------------
  // UI STATES
  // -----------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Invalid Invitation</h1>
          <p className="mt-2 text-gray-600">{error || "This invitation link is invalid."}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------
  // MAIN FORM UI
  // -----------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Accept Staff Invitation</h1>
            <p className="mt-2 text-sm text-gray-600">Create your staff account to get started</p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{invitationData.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{invitationData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                {invitationData.role_type.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Re-enter your password"
              />
            </div>

            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {accepting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Creating Account...
                </>
              ) : (
                <>
                  Accept & Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> By creating an account, you confirm that you have been authorized
              by Pokhara Metropolitan City to access the staff portal.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
