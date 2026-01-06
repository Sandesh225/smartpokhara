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
    <Card className="border-0 elevation-3 rounded-3xl bg-white ring-1 ring-slate-900/5 overflow-hidden">
      <CardHeader className="card-padding bg-[rgb(244,245,247)]/50 border-b-2 border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[rgb(43,95,117)] to-[rgb(95,158,160)] flex items-center justify-center text-white elevation-2">
            <BellRing className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-tight text-[rgb(26,32,44)]">
              Alert Configuration
            </CardTitle>
            <CardDescription className="font-medium text-[rgb(26,32,44)]/60 mt-1">
              Manage your connection with municipal digital services.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="card-padding space-y-12">
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[rgb(43,95,117)] flex items-center gap-2 ml-1">
            <Globe className="h-3.5 w-3.5" /> Delivery Channels
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

        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[rgb(95,158,160)] flex items-center gap-2 ml-1">
            <MessageSquare className="h-3.5 w-3.5" /> Subscription Topics
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
                className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 bg-[rgb(244,245,247)]/30 transition-all hover:bg-white hover:border-[rgb(95,158,160)]/20 group"
              >
                <div className="space-y-1">
                  <Label
                    htmlFor={item.id}
                    className="text-sm font-bold text-[rgb(26,32,44)] group-hover:text-[rgb(95,158,160)] transition-colors"
                  >
                    {item.label}
                  </Label>
                  <p className="text-xs font-medium text-[rgb(26,32,44)]/50">
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

        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[rgb(43,95,117)]/5 p-8 rounded-3xl border-2 border-[rgb(43,95,117)]/10">
          <div className="space-y-1">
            <Label className="text-lg font-black text-[rgb(26,32,44)]">
              Digest Frequency
            </Label>
            <p className="text-xs text-[rgb(26,32,44)]/60 font-medium leading-relaxed">
              How should we bundle non-urgent system updates?
            </p>
          </div>
          <Select
            value={safePrefs.digest_frequency}
            onValueChange={handleSelect}
          >
            <SelectTrigger className="w-full md:w-[240px] h-12 rounded-2xl border-2 border-slate-200 bg-white font-bold elevation-1">
              <SelectValue placeholder="Select logic" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl elevation-3 border-2 border-slate-100">
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

      <CardFooter className="bg-[rgb(244,245,247)]/80 backdrop-blur-sm border-t-2 border-slate-100 card-padding flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[rgb(26,32,44)]/40">
          <ShieldCheck className="h-4 w-4 text-[rgb(43,95,117)]" /> AES-256
          Encrypted
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-[180px] h-12 rounded-2xl bg-[rgb(26,32,44)] hover:bg-black font-black text-white elevation-2 transition-all active:scale-95"
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

function ChannelCard({ id, label, desc, icon: Icon, checked, onToggle }: any) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300",
        checked
          ? "bg-white border-[rgb(43,95,117)] elevation-2 ring-4 ring-[rgb(43,95,117)]/10"
          : "bg-[rgb(244,245,247)]/50 border-slate-100 opacity-60"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
            checked
              ? "bg-[rgb(43,95,117)] text-white"
              : "bg-slate-200 text-[rgb(26,32,44)]/40"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <Label
            htmlFor={id}
            className="text-base font-bold text-[rgb(26,32,44)] cursor-pointer"
          >
            {label}
          </Label>
          <p className="text-xs font-medium text-[rgb(26,32,44)]/50 uppercase tracking-wider">
            {desc}
          </p>
        </div>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}
