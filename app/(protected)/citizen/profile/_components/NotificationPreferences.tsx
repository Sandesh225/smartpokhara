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
import { createClient } from "@/lib/supabase/client";

import { userApi } from "@/features/users/api";
import type { UserPreferences } from "@/features/users/types";

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
  const supabase = createClient();

  const safePrefs: UserPreferences =
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
    setPreferences((prev) => (prev ? { ...prev, [key]: !prev[key] } : prev));
  };

  const handleSelect = (val: string) => {
    setPreferences((prev) =>
      prev ? { ...prev, digest_frequency: val as any } : prev
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { id, user_id, ...updates } = safePrefs;
      await userApi.updatePreferences(supabase, userId, updates);
      toast.success("Preferences updated", {
        description: "Your notification settings are now active.",
      });
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-3xl border bg-background text-foreground shadow-sm dark:shadow-none overflow-hidden">
      {/* ================= Header ================= */}
      <CardHeader className="border-b bg-muted/40 dark:bg-muted/20 card-padding">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
            <BellRing className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-tight">
              Alert Configuration
            </CardTitle>
            <CardDescription className="mt-1">
              Control how the municipality contacts you.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* ================= Content ================= */}
      <CardContent className="card-padding space-y-12">
        {/* Delivery Channels */}
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2 ml-1">
            <Globe className="h-3.5 w-3.5" /> Delivery Channels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChannelCard
              id="email"
              label="Email Notifications"
              desc="Official documents & records"
              icon={Mail}
              checked={safePrefs.email_notifications}
              onToggle={() => handleToggle("email_notifications")}
            />

            <ChannelCard
              id="sms"
              label="SMS Alerts"
              desc="Critical & time-sensitive alerts"
              icon={Smartphone}
              checked={safePrefs.sms_notifications}
              onToggle={() => handleToggle("sms_notifications")}
            />
          </div>
        </section>

        <Separator />

        {/* Topics */}
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2 ml-1">
            <MessageSquare className="h-3.5 w-3.5" /> Notification Topics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                key: "complaint_updates",
                label: "Complaint Updates",
                desc: "Status changes & staff notes",
              },
              {
                key: "new_bills",
                label: "New Bills",
                desc: "Taxes & utility invoices",
              },
              {
                key: "payment_reminders",
                label: "Payment Reminders",
                desc: "Before due date alerts",
              },
              {
                key: "new_notices",
                label: "Public Notices",
                desc: "Ward announcements",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-5 rounded-2xl border bg-muted/40 dark:bg-muted/20 hover:bg-muted transition-all"
              >
                <div className="space-y-1">
                  <Label className="font-bold">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={
                    safePrefs[item.key as keyof UserPreferences] as boolean
                  }
                  onCheckedChange={() =>
                    handleToggle(item.key as keyof UserPreferences)
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Digest */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl border bg-muted/30 dark:bg-muted/20">
          <div>
            <Label className="text-lg font-black">Digest Frequency</Label>
            <p className="text-xs text-muted-foreground mt-1">
              How often should we bundle non-urgent notifications?
            </p>
          </div>

          <Select
            value={safePrefs.digest_frequency}
            onValueChange={handleSelect}
          >
            <SelectTrigger className="w-full md:w-[240px] h-12 rounded-2xl bg-background">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Real-time</SelectItem>
              <SelectItem value="daily">Daily Summary</SelectItem>
              <SelectItem value="weekly">Weekly Digest</SelectItem>
            </SelectContent>
          </Select>
        </section>
      </CardContent>

      {/* ================= Footer ================= */}
      <CardFooter className="border-t bg-muted/50 dark:bg-muted/30 card-padding flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Encrypted
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-12 min-w-[180px] rounded-2xl font-black
                     bg-foreground text-background
                     hover:bg-foreground/90
                     active:scale-95"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

/* ================= Channel Card ================= */

function ChannelCard({ id, label, desc, icon: Icon, checked, onToggle }: any) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-6 rounded-3xl border transition-all",
        checked
          ? "bg-background border-primary ring-4 ring-primary/10"
          : "bg-muted/40 border-border opacity-70"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center",
            checked
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <Label className="font-bold">{label}</Label>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {desc}
          </p>
        </div>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}
