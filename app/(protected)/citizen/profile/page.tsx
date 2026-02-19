"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Loader2, User, Shield, Bell, LogOut, Trash2 } from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import ProfileView from "./_components/ProfileView";
import ProfileEditForm from "./_components/ProfileEditForm";
import ChangePasswordForm from "./_components/ChangePasswordForm";
import NotificationPreferences from "./_components/NotificationPreferences";

import { userApi } from "@/features/users/api";
import type { UserProfile, UserPreferences, Ward } from "@/features/users/types";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);

  const [isEditing, setIsEditing] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch Data
  // ---------------------------------------------------------------------------
  const fetchAllData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);

      const [profileData, prefsData, wardsList] = await Promise.all([
        userApi.getProfile(supabase, user.id),
        userApi.getPreferences(supabase, user.id),
        userApi.getWards(supabase),
      ]);

      if (!profileData) {
        toast.error("Unable to load profile data.");
        return;
      }

      setProfile(profileData);
      setPreferences(prefsData);
      setWards(wardsList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load account information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ---------------------------------------------------------------------------
  // Auth Actions
  // ---------------------------------------------------------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/auth/login");
  };

  const handleDeleteAccount = () => {
    toast.error("Delete your account?", {
      description:
        "This will permanently remove your citizen profile and related records.",
      action: {
        label: "Confirm",
        onClick: () =>
          toast.error("Account deletion requires administrative approval."),
      },
      duration: 10000,
    });
  };

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary-brand" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading your profile…
          </p>
        </div>
      </div>
    );
  }

  if (!profile || !userId) return null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-10 space-y-10">
        {/* ================= Header ================= */}
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Citizen Profile
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your personal details, security, and notifications.
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="h-12 rounded-2xl px-6 font-bold text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </header>

        {/* ================= Profile Section ================= */}
        <section className="stone-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <User className="h-5 w-5 text-primary-brand" />
              Profile Information
            </h2>
          </div>

          {isEditing ? (
            <ProfileEditForm
              profile={profile}
              wards={wards}
              onCancel={() => setIsEditing(false)}
              onSave={() => {
                setIsEditing(false);
                fetchAllData();
              }}
            />
          ) : (
            <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />
          )}
        </section>

        {/* ================= Security Section ================= */}
        <section className="stone-card p-6 max-w-3xl">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-brand" />
            Security
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Change your password and protect your account.
          </p>

          <div className="mt-6">
            <ChangePasswordForm />
          </div>
        </section>

        {/* ================= Notifications Section ================= */}
        <section className="stone-card p-6 max-w-4xl">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-brand" />
            Notification Preferences
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose how and when you receive updates.
          </p>

          <div className="mt-6">
            <NotificationPreferences
              userId={userId}
              initialPreferences={preferences}
            />
          </div>
        </section>

        {/* ================= Danger Zone ================= */}
        <section className="rounded-3xl border border-red-500/30 bg-red-500/5 p-6 max-w-3xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-500 mb-4">
            Danger Zone
          </h3>
          <Button
            variant="ghost"
            onClick={handleDeleteAccount}
            className="justify-start rounded-xl font-bold text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </section>
      </div>
    </div>
  );
}
