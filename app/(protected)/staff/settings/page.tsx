"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Palette, Save, Camera } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-complaints";
import { toast } from "sonner"; // Fixed: Using sonner instead of hooks/use-toast

export default function StaffSettingsPage() {
  const { user, loading } = useCurrentUser();

  const [notifications, setNotifications] = useState({
    newAssignment: true,
    statusChange: true,
    deadline: true,
    email: false,
    push: true,
  });

  const [appearance, setAppearance] = useState({
    theme: "system",
    compactMode: false,
  });

  const handleSave = () => {
    // Fixed: Standard Sonner implementation
    toast.success("Settings saved", {
      description: "Your preferences have been updated successfully.",
    });
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading settings...</div>;

  return (
    <div className="space-y-6 container-padding section-spacing max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and municipal workflow preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="glass p-1 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4 animate-in fade-in-50 duration-300">
          <Card className="stone-card">
            <CardHeader className="border-b bg-neutral-stone-50/50">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your identity details for official records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 card-padding">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                    <AvatarImage src={user?.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {user?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="secondary" className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 elevation-2">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{user?.full_name}</h4>
                  <p className="text-sm text-muted-foreground">Municipal Staff Member</p>
                  <Button variant="link" className="p-0 h-auto text-xs text-primary">Remove photo</Button>
                </div>
              </div>

              <Separator className="opacity-50" />

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold">Full Name</Label>
                  <Input
                    id="fullName"
                    className="bg-neutral-stone-50"
                    defaultValue={user?.full_name || ""}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                  <Input
                    id="email"
                    className="bg-neutral-stone-200/50 cursor-not-allowed"
                    type="email"
                    defaultValue={user?.email || ""}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">Contact Number</Label>
                  <Input
                    id="phone"
                    className="bg-neutral-stone-50"
                    type="tel"
                    placeholder="+977-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-semibold">Assigned Department</Label>
                  <Input
                    id="department"
                    className="bg-neutral-stone-200/50 cursor-not-allowed"
                    defaultValue={user?.department_name || "Municipal Operations"}
                    disabled
                  />
                </div>
              </div>

              <div className="stone-panel p-4 bg-primary/5 border-primary/20 flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-primary">System Authority</h4>
                  <p className="text-xs text-muted-foreground">Your permissions are managed by the Department Head</p>
                </div>
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  {user?.roles?.[0] || "Staff"}
                </Badge>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} className="rounded-xl px-8 elevation-3 hover:elevation-4 transition-all">
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
          <Card className="stone-card">
            <CardHeader className="border-b bg-neutral-stone-50/50">
              <CardTitle>Communication Preferences</CardTitle>
              <CardDescription>Configure how you receive work updates</CardDescription>
            </CardHeader>
            <CardContent className="card-padding space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div className="space-y-0.5">
                    <Label className="text-base">New Assignments</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts when new complaints are assigned</p>
                  </div>
                  <Switch
                    checked={notifications.newAssignment}
                    onCheckedChange={(checked) => setNotifications(n => ({ ...n, newAssignment: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Urgent Deadlines</Label>
                    <p className="text-sm text-muted-foreground">Alerts for tasks reaching SLA limits</p>
                  </div>
                  <Switch
                    checked={notifications.deadline}
                    onCheckedChange={(checked) => setNotifications(n => ({ ...n, deadline: checked }))}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-stone-100 border border-neutral-stone-200">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Delivery Channels</h4>
                <div className="grid gap-4">
                   <div className="flex items-center justify-between">
                    <Label>Email Digest</Label>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications(n => ({ ...n, email: checked }))}
                    />
                  </div>
                   <div className="flex items-center justify-between">
                    <Label>Web Push Notifications</Label>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications(n => ({ ...n, push: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="rounded-xl">
                  Update Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4 animate-in zoom-in-95 duration-300">
          <Card className="stone-card">
            <CardHeader className="border-b bg-neutral-stone-50/50">
              <CardTitle>Interface Customization</CardTitle>
              <CardDescription>Adjust the dashboard aesthetic to your comfort</CardDescription>
            </CardHeader>
            <CardContent className="card-padding space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Visual Theme</Label>
                <Select
                  value={appearance.theme}
                  onValueChange={(value) => setAppearance(a => ({ ...a, theme: value }))}
                >
                  <SelectTrigger className="w-full sm:w-[300px] rounded-xl bg-neutral-stone-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong rounded-xl">
                    <SelectItem value="light">Lakeside Light</SelectItem>
                    <SelectItem value="dark">Mountain Dark</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="opacity-50" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Compact Data View</Label>
                  <p className="text-sm text-muted-foreground">Reduce padding to show more information at once</p>
                </div>
                <Switch
                  checked={appearance.compactMode}
                  onCheckedChange={(checked) => setAppearance(a => ({ ...a, compactMode: checked }))}
                />
              </div>

              <div className="flex justify-end pt-6">
                <Button onClick={handleSave} className="rounded-xl">
                  Apply Appearance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}