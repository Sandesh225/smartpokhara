// ============================================================================
// FILE: app/(protected)/citizen/profile/page.tsx
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  User,
  Shield,
  Bell,
  LogOut,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import ProfileView from "./_components/ProfileView";
import ProfileEditForm from "./_components/ProfileEditForm";
import ChangePasswordForm from "./_components/ChangePasswordForm";
import NotificationPreferences from "./_components/NotificationPreferences";

import {
  profileService,
  type UserProfile,
  type UserPreferences,
} from "@/lib/supabase/queries/profile";
import { complaintsService } from "@/lib/supabase/queries/complaints";

const navItems = [
  {
    id: "profile",
    label: "Profile Details",
    icon: User,
    description: "Manage your personal information",
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    description: "Password and account security",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Email and SMS preferences",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [wards, setWards] = useState<
    { id: string; name: string; ward_number: number }[]
  >([]);

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

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
        profileService.getUserProfile(user.id),
        profileService.getUserPreferences(user.id),
        complaintsService.getWards(),
      ]);

      if (!profileData) {
        toast.error("Could not load profile data. Please try again.");
        return;
      }

      setProfile(profileData);
      setPreferences(prefsData);
      setWards(wardsList as any);
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    toast.success("Logged out successfully");
  };

  const handleDeleteAccount = () => {
    toast.error("Delete your account?", {
      description:
        "This will permanently remove your citizen profile and all related records.",
      action: {
        label: "Confirm",
        onClick: () => {
          toast.error(
            "Account deletion requires administrative approval. Please contact support."
          );
        },
      },
      cancel: {
        label: "Cancel",
      },
      duration: 10000,
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary-brand" />
          <p className="text-sm font-mono text-foreground animate-pulse">
            Loading your profile…
          </p>
        </div>
      </div>
    );
  }

  if (!profile || !userId) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-primary-brand-dark dark:text-foreground">
              Account Settings
            </h1>
            <p className="mt-2 text-muted-foreground font-medium">
              Manage your profile, security preferences, and notifications.
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="rounded-2xl h-12 px-6 font-bold text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <nav className="flex flex-col gap-3 sticky top-6">
              <div className="stone-card p-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (item.id !== "profile") setIsEditing(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all",
                        isActive
                          ? "bg-primary-brand text-white shadow-lg"
                          : "text-muted-foreground hover:bg-muted hover:text-primary-brand"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                      {isActive && (
                        <ChevronRight className="ml-auto h-4 w-4 opacity-80" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Danger Zone */}
              <div className="mt-4 rounded-3xl border-2 border-red-500/20 bg-red-500/5 p-6">
                <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-red-500">
                  Danger Zone
                </h3>

                <Button
                  variant="ghost"
                  onClick={handleDeleteAccount}
                  className="w-full justify-start h-auto py-3 px-3 rounded-xl font-bold text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </nav>
          </aside>

          {/* Main */}
          <main className="lg:col-span-9 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "profile" && (
              <>
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
                  <ProfileView
                    profile={profile}
                    onEdit={() => setIsEditing(true)}
                  />
                )}
              </>
            )}

            {activeTab === "security" && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-black text-primary-brand-dark dark:text-foreground">
                  Security Settings
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Manage your password and account security preferences.
                </p>
                <ChangePasswordForm />
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="max-w-3xl">
                <h2 className="text-2xl font-black text-primary-brand-dark dark:text-foreground">
                  Notification Preferences
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose what updates you want to receive and how.
                </p>
                <NotificationPreferences
                  userId={userId}
                  initialPreferences={preferences}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
