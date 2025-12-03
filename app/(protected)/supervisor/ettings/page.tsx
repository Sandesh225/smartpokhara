"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Palette, Save, Camera, Users } from "lucide-react"
import { useCurrentUser, useDepartments, useWards } from "@/lib/hooks/use-complaints"
import { useToast } from "@/hooks/use-toast"

export default function SupervisorSettingsPage() {
  const { user, loading } = useCurrentUser()
  const { departments } = useDepartments()
  const { wards } = useWards()
  const { toast } = useToast()

  const [notifications, setNotifications] = useState({
    newComplaint: true,
    urgentAlert: true,
    staffUpdate: true,
    overdueWarning: true,
    email: true,
    push: true,
  })

  const [teamSettings, setTeamSettings] = useState({
    autoAssign: false,
    maxWorkload: "10",
    escalationTime: "48",
    defaultPriority: "medium",
  })

  const [appearance, setAppearance] = useState({
    theme: "system",
    compactMode: false,
    showAnalytics: true,
  })

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account, team, and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="mr-2 h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">
                    {user?.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue={user?.full_name || ""} placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="Enter your phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" defaultValue={user?.department_name || ""} disabled />
                </div>
              </div>

              {/* Role Info */}
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Role & Permissions</h4>
                    <p className="text-sm text-muted-foreground">Supervisor access with team management capabilities</p>
                  </div>
                  <Badge variant="default">Supervisor</Badge>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Settings Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Management Settings</CardTitle>
              <CardDescription>Configure how complaints are assigned and escalated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Assignment</Label>
                  <p className="text-sm text-muted-foreground">Automatically assign new complaints based on workload</p>
                </div>
                <Switch
                  checked={teamSettings.autoAssign}
                  onCheckedChange={(checked) => setTeamSettings((s) => ({ ...s, autoAssign: checked }))}
                />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Max Workload per Staff</Label>
                  <Select
                    value={teamSettings.maxWorkload}
                    onValueChange={(value) => setTeamSettings((s) => ({ ...s, maxWorkload: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 complaints</SelectItem>
                      <SelectItem value="10">10 complaints</SelectItem>
                      <SelectItem value="15">15 complaints</SelectItem>
                      <SelectItem value="20">20 complaints</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Maximum active complaints per staff member</p>
                </div>
                <div className="space-y-2">
                  <Label>Escalation Time</Label>
                  <Select
                    value={teamSettings.escalationTime}
                    onValueChange={(value) => setTeamSettings((s) => ({ ...s, escalationTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="72">72 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Time before unresolved complaints are escalated</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Default Priority</Label>
                <Select
                  value={teamSettings.defaultPriority}
                  onValueChange={(value) => setTeamSettings((s) => ({ ...s, defaultPriority: value }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Default priority for new complaints without explicit priority
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Complaints</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new complaints are submitted</p>
                  </div>
                  <Switch
                    checked={notifications.newComplaint}
                    onCheckedChange={(checked) => setNotifications((n) => ({ ...n, newComplaint: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Urgent Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified for urgent priority complaints</p>
                  </div>
                  <Switch
                    checked={notifications.urgentAlert}
                    onCheckedChange={(checked) => setNotifications((n) => ({ ...n, urgentAlert: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Staff Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when staff complete or update complaints
                    </p>
                  </div>
                  <Switch
                    checked={notifications.staffUpdate}
                    onCheckedChange={(checked) => setNotifications((n) => ({ ...n, staffUpdate: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Overdue Warnings</Label>
                    <p className="text-sm text-muted-foreground">Get warned about complaints approaching deadline</p>
                  </div>
                  <Switch
                    checked={notifications.overdueWarning}
                    onCheckedChange={(checked) => setNotifications((n) => ({ ...n, overdueWarning: checked }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Delivery Methods</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications((n) => ({ ...n, email: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications((n) => ({ ...n, push: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={appearance.theme}
                  onValueChange={(value) => setAppearance((a) => ({ ...a, theme: value }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Select your preferred theme</p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Use smaller spacing and font sizes</p>
                </div>
                <Switch
                  checked={appearance.compactMode}
                  onCheckedChange={(checked) => setAppearance((a) => ({ ...a, compactMode: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Dashboard Analytics</Label>
                  <p className="text-sm text-muted-foreground">Display analytics widgets on dashboard</p>
                </div>
                <Switch
                  checked={appearance.showAnalytics}
                  onCheckedChange={(checked) => setAppearance((a) => ({ ...a, showAnalytics: checked }))}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
