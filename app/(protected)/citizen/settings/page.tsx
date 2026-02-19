"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  User, 
  MapPin, 
  Camera, 
  Save, 
  Loader2, 
  Building2,
  Phone, 
  Mail, 
  Lock, 
  LogOut, 
  Bell, 
  Smartphone, 
  Info,
  Shield
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

import { userApi } from "@/features/users/api";
import { UserProfile, UserPreferences } from "@/features/users/types";

// --- VALIDATION SCHEMAS ---
const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  full_name_nepali: z.string().optional().nullable(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number too long").optional().nullable(),
  ward_id: z.string().min(1, "Please select a ward").optional().nullable(),
  address_line1: z.string().min(3, "Address is required").optional().nullable(),
  gender: z.string().optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [wards, setWards] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }
        setUserId(user.id);

        // Fetch data directly where service might fail
        const [profileData, prefsData, wardsRes] = await Promise.all([
          userApi.getProfile(supabase, user.id),
          userApi.getPreferences(supabase, user.id),
          userApi.getWards(supabase)
        ]);

        if (profileData) {
            setUserProfile(profileData);
            reset({
                full_name: profileData.full_name || "",
                full_name_nepali: profileData.full_name_nepali || "",
                phone: profileData.phone || "",
                ward_id: profileData.ward_id || "",
                address_line1: profileData.address_line1 || "",
                gender: profileData.gender || "other",
            });
        }
        
        if (prefsData) {
            setPreferences(prefsData);
        }

        if (wardsRes) {
            setWards(wardsRes);
        }

      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [reset, router, supabase]);

  // --- HANDLERS ---
  
  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!userId) return;
    setSavingProfile(true);
    try {
      const result = await userApi.updateProfile(supabase, userId, data);
      
      toast.success("Profile updated successfully");
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    setUploading(true);
    try {
      const url = await userApi.uploadProfilePhoto(supabase, userId, file);
      setUserProfile(prev => prev ? { ...prev, profile_photo_url: url } : null);
      toast.success("Profile photo updated");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const updatePreference = async (key: keyof UserPreferences, value: boolean | string) => {
      if (!userId || !preferences) return;
      
      // Optimistic update
      setPreferences(prev => prev ? { ...prev, [key]: value } : null);
      
      // We don't block UI but we show saving state if needed
      try {
          await userApi.updatePreferences(supabase, userId, { [key]: value });
      } catch (error) {
          setPreferences(preferences);
          toast.error("Failed to update preference");
      }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Helper to find current ward object
  const currentWard = wards.find(w => w.id === watch("ward_id"));

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 text-lg">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Profile</TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Preferences</TabsTrigger>
        </TabsList>

        {/* --- PROFILE TAB --- */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                  <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-2 ring-slate-100 transition-all group-hover:ring-blue-200">
                      <AvatarImage src={userProfile?.profile_photo_url || undefined} className="object-cover" />
                      <AvatarFallback className="text-4xl bg-slate-100 text-slate-400 font-semibold">
                        {userProfile?.full_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                      {uploading ? (
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      ) : (
                        <div className="flex flex-col items-center">
                            <Camera className="h-6 w-6 text-white mb-1" />
                            <span className="text-[10px] text-white font-medium">Change</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-medium text-slate-700">Profile Photo</p>
                    <p className="text-[10px] text-slate-500 max-w-[150px] mx-auto leading-tight">
                        JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                <div className="hidden md:block w-px bg-slate-200 self-stretch mx-2" />

                {/* Form Section */}
                <form id="profile-form" onSubmit={handleSubmit(onProfileSubmit)} className="flex-1 space-y-5 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input id="full_name" className="pl-9 bg-slate-50/50 focus:bg-white transition-colors" {...register("full_name")} />
                      </div>
                      {errors.full_name && <p className="text-xs text-red-500 font-medium mt-1">{errors.full_name.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="full_name_nepali">Name (Nepali)</Label>
                      <Input id="full_name_nepali" {...register("full_name_nepali")} placeholder="नेपाली नाम" className="bg-slate-50/50 focus:bg-white transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input id="email" value={userProfile?.email || ""} disabled className="pl-9 bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1.5 px-1">
                        <Lock className="h-3 w-3" />
                        Email cannot be changed directly
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input id="phone" className="pl-9 bg-slate-50/50 focus:bg-white transition-colors" {...register("phone")} placeholder="98XXXXXXXX" />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500 font-medium mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select 
                           value={watch("gender") || ""} 
                           onValueChange={(val) => setValue("gender", val, { shouldDirty: true })}
                        >
                           <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors">
                              <SelectValue placeholder="Select gender" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="ward">Ward</Label>
                        <Select 
                           value={watch("ward_id") || ""} 
                           onValueChange={(val) => setValue("ward_id", val, { shouldDirty: true })}
                        >
                           <SelectTrigger className="pl-9 relative bg-slate-50/50 focus:bg-white transition-colors">
                              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                              {/* Display Name Override */}
                              <SelectValue placeholder="Select your ward">
                                 {currentWard ? `Ward ${currentWard.ward_number} - ${currentWard.name}` : "Select your ward"}
                              </SelectValue>
                           </SelectTrigger>
                           <SelectContent className="max-h-[200px]">
                              {wards.map((ward) => (
                                 <SelectItem key={ward.id} value={ward.id}>
                                    Ward {ward.ward_number} - {ward.name}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                        {errors.ward_id && <p className="text-xs text-red-500 font-medium mt-1">{errors.ward_id.message}</p>}
                     </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Residential Address</Label>
                    <div className="relative">
                       <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                       <Input id="address" className="pl-9 bg-slate-50/50 focus:bg-white transition-colors" {...register("address_line1")} placeholder="e.g. Khudi, Talchowk, Pokhara-30" />
                    </div>
                    {errors.address_line1 && <p className="text-xs text-red-500 font-medium mt-1">{errors.address_line1.message}</p>}
                  </div>
                </form>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t bg-slate-50/50 p-6 gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-2 bg-blue-50/50 px-3 py-2 rounded-md border border-blue-100 w-full sm:w-auto">
                  <Info className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>Some fields may require verification to change later.</span>
              </div>
              <Button 
                type="submit" 
                form="profile-form" 
                disabled={savingProfile || !isDirty} 
                className="w-full sm:w-auto min-w-[140px] bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-red-100 shadow-sm overflow-hidden">
             <div className="h-1 bg-red-500/20" />
             <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5" /> Danger Zone
                </CardTitle>
                <CardDescription>Actions that affect your account access and security.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-red-50/50 rounded-lg border border-red-100">
                    <div className="text-sm text-slate-700">
                        <p className="font-medium">Sign Out</p>
                        <p className="text-slate-500">Sign out from all devices securely.</p>
                    </div>
                    <Button variant="destructive" onClick={handleSignOut} className="w-full sm:w-auto shadow-sm">
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        {/* --- PREFERENCES TAB --- */}
        <TabsContent value="preferences" className="space-y-6 mt-6">
          {preferences ? (
             <div className="grid gap-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-indigo-600" /> Notifications
                        </CardTitle>
                        <CardDescription>Choose how and when you want to be notified.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-0 divide-y divide-slate-100">
                        <div className="flex items-center justify-between py-4">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium text-slate-900">Email Notifications</Label>
                                <p className="text-sm text-slate-500">Receive updates via your registered email.</p>
                            </div>
                            <Switch 
                                checked={preferences.email_notifications}
                                onCheckedChange={(c) => updatePreference('email_notifications', c)}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between py-4">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium text-slate-900">SMS Notifications</Label>
                                <p className="text-sm text-slate-500">Receive urgent updates via SMS.</p>
                            </div>
                            <Switch 
                                checked={preferences.sms_notifications}
                                onCheckedChange={(c) => updatePreference('sms_notifications', c)}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between py-4">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium text-slate-900">Push Notifications</Label>
                                <p className="text-sm text-slate-500">Receive instant alerts on your device.</p>
                            </div>
                            <Switch 
                                checked={preferences.push_notifications}
                                onCheckedChange={(c) => updatePreference('push_notifications', c)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-indigo-600" /> Alert Types
                        </CardTitle>
                        <CardDescription>Select which events trigger a notification.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-0 divide-y divide-slate-100">
                        <div className="flex items-center justify-between py-4">
                            <div className="flex flex-col">
                                <Label className="font-medium text-slate-900">Complaint Updates</Label>
                                <span className="text-xs text-slate-500">Status changes and new comments</span>
                            </div>
                            <Switch 
                                checked={preferences.complaint_updates}
                                onCheckedChange={(c) => updatePreference('complaint_updates', c)}
                            />
                        </div>
                        <div className="flex items-center justify-between py-4">
                            <div className="flex flex-col">
                                <Label className="font-medium text-slate-900">New Bills</Label>
                                <span className="text-xs text-slate-500">Tax invoices and utility bills</span>
                            </div>
                            <Switch 
                                checked={preferences.new_bills}
                                onCheckedChange={(c) => updatePreference('new_bills', c)}
                            />
                        </div>
                        <div className="flex items-center justify-between py-4">
                            <div className="flex flex-col">
                                <Label className="font-medium text-slate-900">Public Notices</Label>
                                <span className="text-xs text-slate-500">General announcements and ward news</span>
                            </div>
                            <Switch 
                                checked={preferences.new_notices}
                                onCheckedChange={(c) => updatePreference('new_notices', c)}
                            />
                        </div>
                    </CardContent>
                </Card>
             </div>
          ) : (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-slate-300" />
                  Loading preferences...
              </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsSkeleton() {
   return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
         <div className="space-y-3">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-64" />
         </div>
         <div className="space-y-6">
            <Skeleton className="h-12 w-[300px] rounded-lg" />
            <div className="border rounded-xl p-8 space-y-10 bg-white shadow-sm">
               <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-4">
                      <Skeleton className="h-32 w-32 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="space-y-6 flex-1">
                     <div className="grid grid-cols-2 gap-6">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                     </div>
                     <Skeleton className="h-12 w-full" />
                     <Skeleton className="h-12 w-full" />
                  </div>
               </div>
               <Skeleton className="h-12 w-full" />
            </div>
         </div>
      </div>
   )
}