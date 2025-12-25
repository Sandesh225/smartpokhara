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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

import ProfileView from "@/components/citizen/profile/ProfileView";
import ProfileEditForm from "@/components/citizen/profile/ProfileEditForm";
import ChangePasswordForm from "@/components/citizen/profile/ChangePasswordForm";
import NotificationPreferences from "@/components/citizen/profile/NotificationPreferences";

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

      setProfile(profileData);
      setPreferences(prefsData);
      setWards(wardsList as any);
    } catch (error) {
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

  const handleDeleteAccount = async () => {
    toast.error(
      "Account deletion requires administrative approval. Please contact support."
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[rgb(244,245,247)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[rgb(43,95,117)]" />
          <p className="text-sm font-mono text-[rgb(26,32,44)] animate-pulse">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile || !userId) return null;

  return (
    <div className="min-h-screen bg-[rgb(244,245,247)]">
      <div className="container-padding section-spacing max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[rgb(26,32,44)] leading-tight">
              Account Settings
            </h1>
            <p className="text-[rgb(26,32,44)]/60 mt-2 font-medium leading-relaxed">
              Manage your profile, security preferences, and notifications.
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-fit text-[rgb(26,32,44)]/60 hover:text-red-600 hover:bg-red-50 transition-colors rounded-2xl h-12 px-6 font-bold"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <nav className="flex flex-col gap-3 sticky top-6">
              <div className="rounded-3xl border-2 border-slate-100 bg-white p-3 elevation-1">
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
                        "flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-200",
                        isActive
                          ? "bg-[rgb(43,95,117)] text-white elevation-2"
                          : "text-[rgb(26,32,44)]/60 hover:bg-[rgb(244,245,247)] hover:text-[rgb(43,95,117)]"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <ChevronRight className="ml-auto h-4 w-4 opacity-80" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-3xl border-2 border-[rgb(229,121,63)]/20 bg-[rgb(229,121,63)]/5 p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[rgb(229,121,63)] mb-4">
                  Danger Zone
                </h3>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[rgb(229,121,63)] hover:bg-[rgb(229,121,63)]/10 hover:text-[rgb(229,121,63)] h-auto py-3 px-3 rounded-xl font-bold"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span className="text-sm">Delete Account</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-black">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-base leading-relaxed">
                        This will permanently delete your citizen profile and
                        remove all related records. This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-2xl font-bold">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-[rgb(229,121,63)] hover:bg-[rgb(229,121,63)]/90 rounded-2xl font-bold"
                      >
                        Yes, delete account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </nav>
          </aside>

          <main className="lg:col-span-9">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-[rgb(26,32,44)]">
                      Security Settings
                    </h2>
                    <p className="text-sm text-[rgb(26,32,44)]/60 mt-2 font-medium leading-relaxed">
                      Manage your password and account security preferences.
                    </p>
                  </div>
                  <ChangePasswordForm />
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="max-w-3xl">
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-[rgb(26,32,44)]">
                      Notification Preferences
                    </h2>
                    <p className="text-sm text-[rgb(26,32,44)]/60 mt-2 font-medium leading-relaxed">
                      Choose what updates you want to receive and how.
                    </p>
                  </div>
                  <NotificationPreferences
                    userId={userId}
                    initialPreferences={preferences}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
