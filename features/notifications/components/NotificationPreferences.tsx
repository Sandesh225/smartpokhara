"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export type Preferences = {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  complaint_updates: boolean;
  new_bills: boolean;
  new_notices: boolean;
  digest_frequency: string;
};

interface NotificationPreferencesProps {
  preferences: Preferences | null;
  onPreferenceChange: (id: string, value: boolean) => void;
  onSave: () => void;
  isLoading: boolean;
}

export function NotificationPreferences({
  preferences,
  onPreferenceChange,
  onSave,
  isLoading,
}: NotificationPreferencesProps) {
  if (!preferences) return null;

  return (
    <Card className="border-0 shadow-2xl rounded-[3rem] bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 p-10 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-3xl font-black">Notification Rules</CardTitle>
        <CardDescription className="text-lg">
          Define how the Smart City Pokhara system should reach you.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-10 space-y-12">
        <section className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Delivery Channels
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "email_notifications",
                label: "Email Addresses",
                desc: "For official receipts and detailed summaries",
              },
              {
                id: "push_notifications",
                label: "Mobile Push",
                desc: "Instant alerts on your smartphone",
              },
              {
                id: "sms_notifications",
                label: "SMS Messages",
                desc: "Critical emergency alerts only",
              },
              {
                id: "in_app_notifications",
                label: "In-App Banner",
                desc: "Visual cues while using the portal",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-6 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900/50 transition-all"
              >
                <div className="space-y-1">
                  <Label className="text-lg font-black">{item.label}</Label>
                  <p className="text-sm text-slate-400 font-medium">{item.desc}</p>
                </div>
                <Switch
                  checked={(preferences as any)?.[item.id]}
                  onCheckedChange={(v) => onPreferenceChange(item.id, v)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Content Topics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: "complaint_updates", label: "Complaint Status" },
              { id: "new_bills", label: "Financial / Bills" },
              { id: "new_notices", label: "Public Notices" },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-6 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-800/50"
              >
                <Label className="font-bold">{item.label}</Label>
                <Switch
                  checked={(preferences as any)?.[item.id]}
                  onCheckedChange={(v) => onPreferenceChange(item.id, v)}
                />
              </div>
            ))}
          </div>
        </section>
      </CardContent>

      <CardFooter className="p-10 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-500" /> Advanced data encryption active
        </p>
        <Button
          size="lg"
          onClick={onSave}
          disabled={isLoading}
          className="rounded-2xl bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 h-14 px-10 font-black shadow-xl shadow-slate-200 dark:shadow-none"
        >
          {isLoading ? "Saving..." : "Save Configuration"}
        </Button>
      </CardFooter>
    </Card>
  );
}
