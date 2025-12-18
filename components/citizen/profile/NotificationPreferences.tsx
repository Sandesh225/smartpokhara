"use client";

import { useState } from "react";
import {
  Loader2,
  BellRing,
  Mail,
  MessageSquare,
  Save,
  Globe,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  profileService,
  type UserPreferences,
} from "@/lib/supabase/queries/profile";

interface NotificationPreferencesProps {
  userId: string;
  initialPreferences: UserPreferences | null;
}

export default function NotificationPreferences({
  userId,
  initialPreferences,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(
    initialPreferences
  );
  const [isSaving, setIsSaving] = useState(false);

  const safePrefs =
    preferences ||
    ({
      email_notifications: true,
      sms_notifications: true,
      in_app_notifications: true,
      push_notifications: false,
      complaint_updates: true,
      new_bills: true,
      payment_reminders: true,
      new_notices: true,
      digest_frequency: "immediate",
    } as UserPreferences);

  const handleToggle = (key: keyof UserPreferences) => {
    setPreferences((prev) => (prev ? { ...prev, [key]: !prev[key] } : null));
  };

  const handleSelect = (val: string) => {
    setPreferences((prev) =>
      prev ? { ...prev, digest_frequency: val as any } : null
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { id, user_id, ...updates } = safePrefs;
    const result = await profileService.updatePreferences(userId, updates);
    setIsSaving(false);

    if (result.success) {
      toast.success("Preferences Synchronized", {
        description: "Your notification settings are now live.",
      });
    } else {
      toast.error("Failed to save preferences");
    }
  };

  return (
    <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white ring-1 ring-slate-900/5 overflow-hidden">
      <CardHeader className="p-8 md:p-10 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <BellRing className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-tight text-slate-900">
              Alert Configuration
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Manage your connection with municipal digital services.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 md:p-10 space-y-12">
        {/* Communication Channels */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2 ml-1">
            <Globe className="h-3 w-3" /> Delivery Channels
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChannelCard
              id="email_notifs"
              label="Email Services"
              desc="Official documents & records"
              icon={Mail}
              checked={safePrefs.email_notifications}
              onToggle={() => handleToggle("email_notifications")}
            />
            <ChannelCard
              id="sms_notifs"
              label="SMS Direct"
              desc="Critical alerts & security"
              icon={Smartphone}
              checked={safePrefs.sms_notifications}
              onToggle={() => handleToggle("sms_notifications")}
            />
          </div>
        </section>

        <Separator className="bg-slate-100" />

        {/* Specific Updates */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2 ml-1">
            <MessageSquare className="h-3 w-3" /> Subscription Topics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                id: "complaint_updates",
                label: "Complaint Lifecycle",
                desc: "Status changes & staff notes",
              },
              {
                id: "new_bills",
                label: "Financial Records",
                desc: "New taxes & utility assessments",
              },
              {
                id: "payment_reminders",
                label: "Due Reminders",
                desc: "72h before payment deadlines",
              },
              {
                id: "new_notices",
                label: "Ward Bulletins",
                desc: "Local announcements & tenders",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-5 rounded-[1.5rem] border-2 border-slate-50 bg-slate-50/30 transition-all hover:bg-white hover:border-emerald-100 group"
              >
                <div className="space-y-0.5">
                  <Label
                    htmlFor={item.id}
                    className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors"
                  >
                    {item.label}
                  </Label>
                  <p className="text-[10px] font-medium text-slate-400">
                    {item.desc}
                  </p>
                </div>
                <Switch
                  id={item.id}
                  checked={
                    safePrefs[item.id as keyof UserPreferences] as boolean
                  }
                  onCheckedChange={() =>
                    handleToggle(item.id as keyof UserPreferences)
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <Separator className="bg-slate-100" />

        {/* Frequency */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-blue-50/30 p-8 rounded-3xl border border-blue-100/50">
          <div className="space-y-1">
            <Label className="text-lg font-bold text-slate-900">
              Digest Frequency
            </Label>
            <p className="text-xs text-slate-500 font-medium">
              How should we bundle non-urgent system updates?
            </p>
          </div>
          <Select
            value={safePrefs.digest_frequency}
            onValueChange={handleSelect}
          >
            <SelectTrigger className="w-full md:w-[240px] h-12 rounded-2xl border-slate-200 bg-white font-bold shadow-sm">
              <SelectValue placeholder="Select logic" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
              <SelectItem value="immediate" className="font-medium">
                Real-time (Standard)
              </SelectItem>
              <SelectItem value="daily" className="font-medium">
                Daily Summary (08:00)
              </SelectItem>
              <SelectItem value="weekly" className="font-medium">
                Weekly Digest (Fri)
              </SelectItem>
            </SelectContent>
          </Select>
        </section>
      </CardContent>

      <CardFooter className="bg-slate-50/80 backdrop-blur-sm border-t border-slate-100 p-8 flex justify-between items-center">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <ShieldCheck className="h-4 w-4 text-blue-500" /> AES-256 Encrypted
          Preferences
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-[180px] h-12 rounded-2xl bg-slate-900 hover:bg-black font-black text-white shadow-xl shadow-slate-200 transition-all active:scale-95"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> Sync Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Sub-component for Channels
function ChannelCard({ id, label, desc, icon: Icon, checked, onToggle }: any) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300",
        checked
          ? "bg-white border-blue-600 shadow-xl shadow-blue-900/5 ring-4 ring-blue-50"
          : "bg-slate-50/50 border-slate-100 opacity-60"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
            checked ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-0.5">
          <Label
            htmlFor={id}
            className="text-base font-bold text-slate-900 cursor-pointer"
          >
            {label}
          </Label>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            {desc}
          </p>
        </div>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}