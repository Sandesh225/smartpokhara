"use client";

import { useState, useEffect } from "react";
import { Loader2, Bell, Save } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/ui/card";
import { Switch } from "@/ui//switch";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { profileService, type UserPreferences } from "@/lib/supabase/queries/profile";

interface NotificationPreferencesProps {
  userId: string;
  initialPreferences: UserPreferences | null;
}

export default function NotificationPreferences({ userId, initialPreferences }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  // Fallback default state if initial is null
  const safePrefs = preferences || {
    email_notifications: true,
    sms_notifications: true,
    in_app_notifications: true,
    push_notifications: false,
    complaint_updates: true,
    new_bills: true,
    payment_reminders: true,
    new_notices: true,
    digest_frequency: "immediate"
  } as UserPreferences;

  const handleToggle = (key: keyof UserPreferences) => {
    setPreferences(prev => prev ? ({ ...prev, [key]: !prev[key] }) : null);
  };

  const handleSelect = (val: string) => {
    setPreferences(prev => prev ? ({ ...prev, digest_frequency: val as any }) : null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, user_id, ...updates } = safePrefs; // strip IDs
    
    const result = await profileService.updatePreferences(userId, updates);
    setIsSaving(false);

    if (result.success) {
      toast.success("Preferences saved");
    } else {
      toast.error("Failed to save preferences");
    }
  };

  return (
    <Card className="border-border shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Manage how and when you receive alerts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Channels */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Channels</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch 
              checked={safePrefs.email_notifications} 
              onCheckedChange={() => handleToggle("email_notifications")} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-xs text-muted-foreground">Critical alerts via SMS</p>
            </div>
            <Switch 
              checked={safePrefs.sms_notifications} 
              onCheckedChange={() => handleToggle("sms_notifications")} 
            />
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Alert Types</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between border p-3 rounded-lg">
              <Label className="cursor-pointer" htmlFor="complaint">Complaint Updates</Label>
              <Switch id="complaint" checked={safePrefs.complaint_updates} onCheckedChange={() => handleToggle("complaint_updates")} />
            </div>
            <div className="flex items-center justify-between border p-3 rounded-lg">
              <Label className="cursor-pointer" htmlFor="bills">New Bills</Label>
              <Switch id="bills" checked={safePrefs.new_bills} onCheckedChange={() => handleToggle("new_bills")} />
            </div>
            <div className="flex items-center justify-between border p-3 rounded-lg">
              <Label className="cursor-pointer" htmlFor="reminders">Payment Reminders</Label>
              <Switch id="reminders" checked={safePrefs.payment_reminders} onCheckedChange={() => handleToggle("payment_reminders")} />
            </div>
            <div className="flex items-center justify-between border p-3 rounded-lg">
              <Label className="cursor-pointer" htmlFor="notices">Public Notices</Label>
              <Switch id="notices" checked={safePrefs.new_notices} onCheckedChange={() => handleToggle("new_notices")} />
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Frequency */}
        <div className="space-y-3">
          <Label>Email Digest Frequency</Label>
          <Select value={safePrefs.digest_frequency} onValueChange={handleSelect}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Summary</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Controls how often you receive non-critical email summaries.</p>
        </div>

      </CardContent>
      <CardFooter className="bg-muted/10 border-t py-4">
        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
}