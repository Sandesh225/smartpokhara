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
    <Card className="border-0 shadow-2xl rounded-4xl bg-card ring-1 ring-border overflow-hidden">
      <CardHeader className="bg-muted/30 p-10 border-b border-border">
        <CardTitle className="text-3xl font-black">Notification Rules</CardTitle>
        <CardDescription className="text-lg">
          Define how the Smart City Pokhara system should reach you.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-10 space-y-12">
        <section className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
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
                className="flex items-center justify-between p-6 rounded-4xl border-2 border-border hover:border-primary/20 transition-all"
              >
                <div className="space-y-1">
                  <Label className="text-lg font-black">{item.label}</Label>
                  <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
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
          <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
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
                className="flex items-center justify-between p-6 rounded-2xl bg-muted/50"
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

      <CardFooter className="p-10 bg-muted/50 border-t border-border flex justify-between items-center">
        <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Advanced data encryption active
        </p>
        <Button
          size="lg"
          onClick={onSave}
          disabled={isLoading}
          className="rounded-2xl bg-primary hover:bg-primary/90 h-14 px-10 font-black shadow-xl shadow-primary/20"
        >
          {isLoading ? "Saving..." : "Save Configuration"}
        </Button>
      </CardFooter>
    </Card>
  );
}
