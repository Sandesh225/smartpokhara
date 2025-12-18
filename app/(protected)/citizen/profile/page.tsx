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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

// Sidebar Navigation Items
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
      <div className="flex h-screen w-full items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile || !userId) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Account Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile, security preferences, and notifications.
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-fit text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <nav className="flex flex-col gap-2 sticky top-6">
              <div className="rounded-xl border bg-white p-2 shadow-sm">
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
                        "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-primary" : "text-slate-400"
                        )}
                      />
                      <div className="flex flex-col items-start">
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Danger Zone - Separate for emphasis */}
              <div className="mt-6 rounded-xl border border-red-100 bg-red-50/50 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-3">
                  Danger Zone
                </h3>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:bg-red-100 hover:text-red-700 h-auto py-2 px-2"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span className="text-sm">Delete Account</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your citizen profile and
                        remove all related records. This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, delete account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
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
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">
                      Security Settings
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your password and account security preferences.
                    </p>
                  </div>
                  <ChangePasswordForm />
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="max-w-3xl">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">
                      Notification Preferences
                    </h2>
                    <p className="text-sm text-muted-foreground">
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