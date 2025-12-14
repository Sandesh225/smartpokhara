"use client";

import { useState } from "react";
import { Loader2, BellRing, Mail, MessageSquare, Save } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/ui/card";
import { Switch } from "@/ui/switch";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Separator } from "@/ui/separator";

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, user_id, ...updates } = safePrefs;

    const result = await profileService.updatePreferences(userId, updates);
    setIsSaving(false);

    if (result.success) {
      toast.success("Preferences updated successfully");
    } else {
      toast.error("Failed to save preferences");
    }
  };

  return (
    <Card className="border-none shadow-md bg-white">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Communication Preferences</CardTitle>
            <CardDescription>
              Control how you receive updates from the municipality.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Communication Channels */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-500" /> Channels
          </h3>
          <div className="grid gap-4 pl-1">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="space-y-0.5">
                <Label htmlFor="email_notifs" className="text-base font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-slate-500">
                  Receive detailed updates and digests via email.
                </p>
              </div>
              <Switch
                id="email_notifs"
                checked={safePrefs.email_notifications}
                onCheckedChange={() => handleToggle("email_notifications")}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="space-y-0.5">
                <Label htmlFor="sms_notifs" className="text-base font-medium">
                  SMS Alerts
                </Label>
                <p className="text-sm text-slate-500">
                  Receive critical alerts and OTPs on your phone.
                </p>
              </div>
              <Switch
                id="sms_notifs"
                checked={safePrefs.sms_notifications}
                onCheckedChange={() => handleToggle("sms_notifications")}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Specific Updates */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-slate-500" /> Topics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "complaint_updates",
                label: "Complaint Status",
                desc: "When your reports are updated",
              },
              {
                id: "new_bills",
                label: "Tax & Bills",
                desc: "New tax assessments or bills",
              },
              {
                id: "payment_reminders",
                label: "Due Date Reminders",
                desc: "Before payments become overdue",
              },
              {
                id: "new_notices",
                label: "Public Notices",
                desc: "General announcements from ward",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm"
              >
                <div className="space-y-0.5">
                  <Label htmlFor={item.id} className="text-base">
                    {item.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
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
        </div>

        <Separator />

        {/* Frequency */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-base font-medium">Digest Frequency</Label>
              <p className="text-sm text-slate-500">
                How often do you want to receive non-critical summaries?
              </p>
            </div>
            <Select
              value={safePrefs.digest_frequency}
              onValueChange={handleSelect}
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Real-time (Immediate)</SelectItem>
                <SelectItem value="daily">Daily Digest (8:00 AM)</SelectItem>
                <SelectItem value="weekly">Weekly Summary (Fridays)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 border-t p-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
}