// app/(protected)/citizen/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  getMyNotifications,
  markNotificationsRead,
  markAllNotificationsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/app/actions/notification";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/ui/card";
import { Button } from "@/ui/button";/ui/
import { Badge } from "@/ui/badge";/ui/
import { Separator } from "@/ui//separator";
import { Switch } from "@/ui//switch";
import { Label } from "@/ui/label";/ui/
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";/ui/
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";/ui/
import {
  Bell,
  Check,
  Clock,
  AlertCircle,
  CheckCircle,
  Settings,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/ui/skeleton/ui/
import { Input } from "@/ui/input";/ui/

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  complaint_id: string | null;
  is_read: boolean;
  priority: string;
  action_url: string | null;
  sent_at: string;
};

type Preferences = {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  notify_on_complaint_received: boolean;
  notify_on_complaint_assigned: boolean;
  notify_on_complaint_in_progress: boolean;
  notify_on_complaint_resolved: boolean;
  notify_on_feedback_requested: boolean;
  digest_frequency: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifResult, prefResult] = await Promise.all([
        getMyNotifications(),
        getNotificationPreferences(),
      ]);

      if (notifResult.success) {
        setNotifications(notifResult.data || []);
      }

      if (prefResult.success) {
        setPreferences(prefResult.data);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (ids: string[]) => {
    const result = await markNotificationsRead(ids);
    if (result.success) {
      setNotifications((prev) =>
        prev.map((notif) =>
          ids.includes(notif.id) ? { ...notif, is_read: true } : notif
        )
      );
      setSelectedNotifications([]);
      toast.success("Marked as read");
    } else {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    const result = await markAllNotificationsRead();
    if (result.success) {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      toast.success("All notifications marked as read");
    } else {
      toast.error("Failed to mark all as read");
    }
  };

  const handleUpdatePreferences = async () => {
    if (!preferences) return;
    setSaving(true);
    try {
      const result = await updateNotificationPreferences(preferences);
      if (result.success) {
        toast.success("Preferences updated");
      } else {
        toast.error("Failed to update preferences");
      }
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id)
        ? prev.filter((notifId) => notifId !== id)
        : [...prev, id]
    );
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    normal: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  const NotificationItem = ({
    notification,
  }: {
    notification: Notification;
  }) => (
    <div
      className={`p-4 rounded-lg border ${
        notification.is_read ? "bg-background" : "bg-blue-50 border-blue-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selectedNotifications.includes(notification.id)}
          onChange={() => toggleNotificationSelection(notification.id)}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {!notification.is_read && (
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              )}
              <h4 className="font-semibold">{notification.title}</h4>
              <Badge className={priorityColors[notification.priority]}>
                {notification.priority}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {format(new Date(notification.sent_at), "PPp")}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">{notification.message}</p>
          {notification.action_url && (
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                <a href={notification.action_url}>View Details</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedNotifications.length > 0 && (
            <Button
              variant="outline"
              onClick={() => handleMarkAsRead(selectedNotifications)}
            >
              <Check className="mr-2 w-4 h-4" />
              Mark Selected as Read
            </Button>
          )}
          {unreadCount > 0 && (
            <Button variant="default" onClick={handleMarkAllRead}>
              <Check className="mr-2 w-4 h-4" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">
            Notifications ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="mr-2 w-4 h-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No notifications</h3>
                  <p className="text-muted-foreground">
                    You're all caught up! No notifications to display.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{unreadCount} unread</Badge>
                  <Badge variant="outline">{notifications.length} total</Badge>
                </div>
              </div>

              <div className="space-y-3">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Customize how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Channel Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Channels</h3>
                <div className="space-y-3">
                  {[
                    { key: "email_enabled", label: "Email Notifications" },
                    { key: "sms_enabled", label: "SMS Notifications" },
                    { key: "push_enabled", label: "Push Notifications" },
                    { key: "in_app_enabled", label: "In-App Notifications" },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <Label htmlFor={key}>{label}</Label>
                      <Switch
                        id={key}
                        checked={
                          preferences?.[key as keyof Preferences] as boolean
                        }
                        onCheckedChange={(checked) =>
                          setPreferences((prev) =>
                            prev ? { ...prev, [key]: checked } : null
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Event Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Event Notifications</h3>
                <div className="space-y-3">
                  {[
                    {
                      key: "notify_on_complaint_received",
                      label: "Complaint Received",
                    },
                    {
                      key: "notify_on_complaint_assigned",
                      label: "Complaint Assigned",
                    },
                    {
                      key: "notify_on_complaint_in_progress",
                      label: "Complaint In Progress",
                    },
                    {
                      key: "notify_on_complaint_resolved",
                      label: "Complaint Resolved",
                    },
                    {
                      key: "notify_on_feedback_requested",
                      label: "Feedback Requested",
                    },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <Label htmlFor={key}>{label}</Label>
                      <Switch
                        id={key}
                        checked={
                          preferences?.[key as keyof Preferences] as boolean
                        }
                        onCheckedChange={(checked) =>
                          setPreferences((prev) =>
                            prev ? { ...prev, [key]: checked } : null
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Frequency & Quiet Hours */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="digest_frequency">Digest Frequency</Label>
                  <Select
                    value={preferences?.digest_frequency || "instant"}
                    onValueChange={(value) =>
                      setPreferences((prev) =>
                        prev ? { ...prev, digest_frequency: value } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="quiet_hours">Quiet Hours</Label>
                      <p className="text-sm text-muted-foreground">
                        Pause notifications during specified hours
                      </p>
                    </div>
                    <Switch
                      id="quiet_hours"
                      checked={preferences?.quiet_hours_enabled || false}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) =>
                          prev
                            ? { ...prev, quiet_hours_enabled: checked }
                            : null
                        )
                      }
                    />
                  </div>

                  {preferences?.quiet_hours_enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quiet_hours_start">Start Time</Label>
                        <Input
                          id="quiet_hours_start"
                          type="time"
                          value={preferences.quiet_hours_start || "22:00"}
                          onChange={(e) =>
                            setPreferences((prev) =>
                              prev
                                ? { ...prev, quiet_hours_start: e.target.value }
                                : null
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quiet_hours_end">End Time</Label>
                        <Input
                          id="quiet_hours_end"
                          type="time"
                          value={preferences.quiet_hours_end || "07:00"}
                          onChange={(e) =>
                            setPreferences((prev) =>
                              prev
                                ? { ...prev, quiet_hours_end: e.target.value }
                                : null
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleUpdatePreferences} disabled={saving}>
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
