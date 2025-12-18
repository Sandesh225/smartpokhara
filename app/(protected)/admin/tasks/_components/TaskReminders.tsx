"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Mail } from "lucide-react";
import { toast } from "sonner";

export function TaskReminders() {
  const [settings, setSettings] = useState({
    emailOneDayBefore: true,
    smsOnCreation: false,
    appPushOverdue: true
  });
  
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call to save preferences
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success("Reminder settings updated");
    setLoading(false);
  };

  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm space-y-6">
      <h3 className="font-semibold flex items-center gap-2 text-gray-800">
        <Bell className="w-4 h-4 text-blue-500" /> Notifications & Reminders
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Clock className="w-4 h-4" />
             </div>
             <div className="space-y-0.5">
                <Label className="text-sm font-medium">Deadline Warning</Label>
                <p className="text-xs text-gray-500">Email assignee 24 hours before due date</p>
             </div>
          </div>
          <Switch 
            checked={settings.emailOneDayBefore} 
            onCheckedChange={(c) => setSettings(p => ({...p, emailOneDayBefore: c}))} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Mail className="w-4 h-4" />
             </div>
             <div className="space-y-0.5">
                <Label className="text-sm font-medium">Assignment Alert</Label>
                <p className="text-xs text-gray-500">Send SMS immediately upon assignment</p>
             </div>
          </div>
          <Switch 
            checked={settings.smsOnCreation} 
            onCheckedChange={(c) => setSettings(p => ({...p, smsOnCreation: c}))} 
          />
        </div>
      </div>

      <div className="pt-2">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}