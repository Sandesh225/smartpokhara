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
import { useCurrentUser } from "@/features/users";
import { toast } from "sonner"; // Fixed: Using sonner instead of hooks/use-toast

export default function StaffSettingsPage() {
  const { data: user, isLoading: loading } = useCurrentUser() as any;

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
    <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-foreground flex items-center gap-3 uppercase tracking-tight">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
            <Palette className="w-5 h-5" />
          </div>
          System Preferences
        </h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 pl-0.5">
          Manage your account and municipal workflow settings.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="bg-muted p-1 rounded-2xl border border-border">
          <TabsTrigger value="profile" className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Interface
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4 animate-in fade-in-50 duration-500">
          <Card className="bg-card border-border shadow-xs rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20 p-6">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                 <User className="w-4 h-4 text-primary" />
                 Profile Information
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
                Update your identity details for official records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center gap-8 bg-muted/30 p-6 rounded-2xl border border-border">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-[6px] border-card shadow-xl ring-1 ring-border group-hover:scale-105 transition-transform">
                    <AvatarImage src={user?.profile_photo_url || undefined} />
                    <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-black">
                      {user?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 rounded-full h-10 w-10 shadow-lg border-2 border-card hover:scale-110 active:scale-95 transition-all">
                    <Camera className="h-5 w-5" />
                  </Button>
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <h4 className="font-black text-xl uppercase tracking-tighter text-foreground">{user?.full_name}</h4>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                     <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-black uppercase tracking-widest px-3">Municipal Staff</Badge>
                     {user?.roles?.map((role: string) => (
                        <Badge key={role} variant="outline" className="text-xs font-bold uppercase tracking-widest border-border opacity-50">{role}</Badge>
                     ))}
                  </div>
                  <Button variant="link" className="p-0 h-auto text-xs font-bold uppercase tracking-widest text-destructive hover:text-destructive/80 transition-colors">Reset Profile Image</Button>
                </div>
              </div>

              <Separator className="opacity-50" />

              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 pl-1">Full Name</Label>
                  <Input
                    id="fullName"
                    className="bg-muted/30 border-border h-11 rounded-xl text-xs font-bold uppercase tracking-tight"
                    defaultValue={user?.full_name || ""}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 pl-1">Email Address</Label>
                  <Input
                    id="email"
                    className="bg-muted border-border cursor-not-allowed h-11 rounded-xl text-xs font-bold uppercase tracking-tight opacity-50"
                    type="email"
                    defaultValue={user?.email || ""}
                    disabled
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 pl-1">Contact Number</Label>
                  <Input
                    id="phone"
                    className="bg-muted/30 border-border h-11 rounded-xl text-xs font-bold uppercase tracking-tight"
                    type="tel"
                    placeholder="+977-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="department" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 pl-1">Assigned Department</Label>
                  <Input
                    id="department"
                    className="bg-muted border-border cursor-not-allowed h-11 rounded-xl text-xs font-bold uppercase tracking-tight opacity-50"
                    defaultValue={user?.department_name || "Municipal Operations"}
                    disabled
                  />
                </div>
              </div>

              <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between group shadow-inner">
                <div className="space-y-1">
                  <h4 className="font-black text-xs text-primary uppercase tracking-widest">System Authority</h4>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter opacity-70">Your permissions are managed by the Department Head</p>
                </div>
                <Badge className="bg-primary text-primary-foreground px-4 py-1.5 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">
                  {user?.roles?.[0] || "Staff"}
                </Badge>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button onClick={handleSave} className="rounded-xl px-10 h-12 text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                  <Save className="mr-3 h-4 w-4" />
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4 animate-in slide-in-from-bottom-8 duration-500">
          <Card className="bg-card border-border shadow-xs rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20 p-6">
               <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                 <Bell className="w-4 h-4 text-primary" />
                 Communication Preferences
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Configure how you receive work updates</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between group p-4 rounded-2xl hover:bg-muted/30 transition-all border border-transparent hover:border-border">
                  <div className="space-y-1">
                    <Label className="text-sm font-black uppercase tracking-widest">New Assignments</Label>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight opacity-60">Receive alerts when new complaints are assigned</p>
                  </div>
                  <Switch
                    checked={notifications.newAssignment}
                    onCheckedChange={(checked) => setNotifications(n => ({ ...n, newAssignment: checked }))}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <Separator className="opacity-50" />
                <div className="flex items-center justify-between group p-4 rounded-2xl hover:bg-muted/30 transition-all border border-transparent hover:border-border">
                  <div className="space-y-1">
                    <Label className="text-sm font-black uppercase tracking-widest">Urgent Deadlines</Label>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight opacity-60">Alerts for tasks reaching SLA limits</p>
                  </div>
                  <Switch
                    checked={notifications.deadline}
                    onCheckedChange={(checked) => setNotifications(n => ({ ...n, deadline: checked }))}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-muted/30 border border-border shadow-inner">
                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground/70 mb-8 flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Delivery Channels
                </h4>
                <div className="grid gap-6">
                   <div className="flex items-center justify-between bg-card p-5 rounded-2xl border border-border shadow-xs">
                    <Label className="text-sm font-black uppercase tracking-widest">Email Digest</Label>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications(n => ({ ...n, email: checked }))}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                   <div className="flex items-center justify-between bg-card p-5 rounded-2xl border border-border shadow-xs">
                    <Label className="text-sm font-black uppercase tracking-widest">Web Push Notifications</Label>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications(n => ({ ...n, push: checked }))}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button onClick={handleSave} className="rounded-xl px-10 h-11 text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                  Update Broadcasts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4 animate-in zoom-in-95 duration-500">
          <Card className="bg-card border-border shadow-xs rounded-2xl overflow-hidden">
             <CardHeader className="border-b border-border bg-muted/20 p-6">
               <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                 <Palette className="w-4 h-4 text-primary" />
                 Interface Customization
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Adjust the dashboard aesthetic to your comfort</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 pl-1">Visual Theme</Label>
                <Select
                  value={appearance.theme}
                  onValueChange={(value) => setAppearance(a => ({ ...a, theme: value }))}
                >
                  <SelectTrigger className="w-full sm:w-[320px] rounded-2xl bg-muted/30 border-border h-12 text-xs font-black uppercase tracking-widest focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border shadow-2xl rounded-2xl">
                    <SelectItem value="light" className="text-xs font-black uppercase tracking-widest focus:bg-primary/10 transition-colors">Lakeside Light</SelectItem>
                    <SelectItem value="dark" className="text-xs font-black uppercase tracking-widest focus:bg-primary/10 transition-colors">Mountain Dark</SelectItem>
                    <SelectItem value="system" className="text-xs font-black uppercase tracking-widest focus:bg-primary/10 transition-colors">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="opacity-50" />

              <div className="flex items-center justify-between group p-4 rounded-2xl hover:bg-muted/30 transition-all border border-transparent hover:border-border">
                <div className="space-y-1">
                  <Label className="text-sm font-black uppercase tracking-widest">Compact Data View</Label>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight opacity-60">Reduce padding to show more information at once</p>
                </div>
                <Switch
                  checked={appearance.compactMode}
                  onCheckedChange={(checked) => setAppearance(a => ({ ...a, compactMode: checked }))}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button onClick={handleSave} className="rounded-xl px-10 h-11 text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                  Apply Visual Mapping
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}