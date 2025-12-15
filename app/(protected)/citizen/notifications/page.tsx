// app/(protected)/citizen/notifications/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// If you have typed DB, uncomment these 2 lines and adjust the import path:
// import type { Database } from "@/lib/supabase/database.types";
// const supabase = createClientComponentClient<Database>();
const supabase = createClientComponentClient();

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Settings, Search, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  complaint_id: string | null;
  is_read: boolean;
  priority: "low" | "normal" | "high" | "urgent" | string;
  action_url: string | null;
  sent_at: string; // ISO
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

  digest_frequency: "instant" | "hourly" | "daily" | "weekly" | string;

  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null; // "HH:mm"
  quiet_hours_end: string | null; // "HH:mm"
};

const DEFAULT_PREFS: Preferences = {
  email_enabled: true,
  sms_enabled: false,
  push_enabled: true,
  in_app_enabled: true,

  notify_on_complaint_received: true,
  notify_on_complaint_assigned: true,
  notify_on_complaint_in_progress: true,
  notify_on_complaint_resolved: true,
  notify_on_feedback_requested: true,

  digest_frequency: "instant",

  quiet_hours_enabled: false,
  quiet_hours_start: "22:00",
  quiet_hours_end: "07:00",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [view, setView] = useState<"all" | "unread">("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "normal" | "high" | "urgent"
  >("all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return notifications.filter((n) => {
      if (view === "unread" && n.is_read) return false;
      if (priorityFilter !== "all" && n.priority !== priorityFilter) return false;

      if (!q) return true;

      const hay = `${n.title} ${n.message} ${n.type} ${n.priority}`.toLowerCase();
      return hay.includes(q);
    });
  }, [notifications, query, view, priorityFilter]);

  const priorityBadgeClass: Record<string, string> = {
    low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    normal: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const boot = async () => {
      setLoading(true);
      try {
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userRes.user) {
          toast.error("You are not logged in.");
          setLoading(false);
          return;
        }

        await Promise.all([loadNotifications(), loadPreferences(userRes.user.id)]);

        // Realtime: listen only to notifications for this user (requires column user_id)
        channel = supabase
          .channel("citizen_notifications_rt")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${userRes.user.id}`,
            },
            (payload) => {
              // insert/update/delete handling
              if (payload.eventType === "INSERT") {
                const row = payload.new as any;
                setNotifications((prev) => [
                  normalizeNotification(row),
                  ...prev,
                ]);
              } else if (payload.eventType === "UPDATE") {
                const row = payload.new as any;
                setNotifications((prev) =>
                  prev.map((n) => (n.id === row.id ? normalizeNotification(row) : n))
                );
              } else if (payload.eventType === "DELETE") {
                const row = payload.old as any;
                setNotifications((prev) => prev.filter((n) => n.id !== row.id));
                setSelected((prev) => prev.filter((id) => id !== row.id));
              }
            }
          )
          .subscribe();
      } catch (e) {
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    boot();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeNotification = (row: any): Notification => ({
    id: String(row.id),
    type: row.type ?? "general",
    title: row.title ?? "Notification",
    message: row.message ?? "",
    complaint_id: row.complaint_id ?? null,
    is_read: Boolean(row.is_read),
    priority: row.priority ?? "normal",
    action_url: row.action_url ?? null,
    sent_at: row.sent_at ?? new Date().toISOString(),
  });

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("id,type,title,message,complaint_id,is_read,priority,action_url,sent_at")
      .order("sent_at", { ascending: false })
      .limit(200);

    if (error) {
      toast.error("Failed to load notifications");
      return;
    }

    setNotifications((data ?? []).map(normalizeNotification));
  };

  const loadPreferences = async (userId: string) => {
    // expects a table like: notification_preferences (user_id PK/unique)
    const { data, error } = await supabase
      .from("notification_preferences")
      .select(
        "email_enabled,sms_enabled,push_enabled,in_app_enabled,notify_on_complaint_received,notify_on_complaint_assigned,notify_on_complaint_in_progress,notify_on_complaint_resolved,notify_on_feedback_requested,digest_frequency,quiet_hours_enabled,quiet_hours_start,quiet_hours_end"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load preferences");
      setPreferences(DEFAULT_PREFS);
      return;
    }

    // If no row exists yet, use defaults (and you can optionally upsert on save)
    setPreferences(
      data
        ? {
            email_enabled: !!data.email_enabled,
            sms_enabled: !!data.sms_enabled,
            push_enabled: !!data.push_enabled,
            in_app_enabled: !!data.in_app_enabled,

            notify_on_complaint_received: !!data.notify_on_complaint_received,
            notify_on_complaint_assigned: !!data.notify_on_complaint_assigned,
            notify_on_complaint_in_progress: !!data.notify_on_complaint_in_progress,
            notify_on_complaint_resolved: !!data.notify_on_complaint_resolved,
            notify_on_feedback_requested: !!data.notify_on_feedback_requested,

            digest_frequency: data.digest_frequency ?? "instant",

            quiet_hours_enabled: !!data.quiet_hours_enabled,
            quiet_hours_start: data.quiet_hours_start ?? "22:00",
            quiet_hours_end: data.quiet_hours_end ?? "07:00",
          }
        : DEFAULT_PREFS
    );
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const markSelectedRead = async () => {
    if (selected.length === 0) return;
    setBulkLoading(true);
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", selected);

      if (error) {
        toast.error("Failed to mark selected as read");
        return;
      }

      setNotifications((prev) =>
        prev.map((n) => (selected.includes(n.id) ? { ...n, is_read: true } : n))
      );
      setSelected([]);
      toast.success("Marked selected as read");
    } finally {
      setBulkLoading(false);
    }
  };

  const markAllRead = async () => {
    setBulkLoading(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) {
        toast.error("You are not logged in.");
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) {
        toast.error("Failed to mark all as read");
        return;
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setSelected([]);
      toast.success("All notifications marked as read");
    } finally {
      setBulkLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setSavingPrefs(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) {
        toast.error("You are not logged in.");
        return;
      }

      // Upsert by user_id
      const { error } = await supabase
        .from("notification_preferences")
        .upsert(
          {
            user_id: user.id,
            ...preferences,
          },
          { onConflict: "user_id" }
        );

      if (error) {
        toast.error("Failed to update preferences");
        return;
      }

      toast.success("Preferences updated");
    } finally {
      setSavingPrefs(false);
    }
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div
      className={[
        "p-4 rounded-lg border transition-colors",
        notification.is_read
          ? "bg-background"
          : "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/60",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected.includes(notification.id)}
          onChange={() => toggleSelected(notification.id)}
          className="mt-1 h-4 w-4"
        />

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {!notification.is_read && <span className="w-2 h-2 rounded-full bg-blue-600" />}
              <h4 className="font-semibold">{notification.title}</h4>

              <Badge className={priorityBadgeClass[notification.priority] ?? priorityBadgeClass.normal}>
                {notification.priority}
              </Badge>
            </div>

            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Manage your notifications and preferences</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={loadNotifications} disabled={bulkLoading}>
            <RefreshCcw className="mr-2 w-4 h-4" />
            Refresh
          </Button>

          {selected.length > 0 && (
            <Button variant="outline" onClick={markSelectedRead} disabled={bulkLoading}>
              <Check className="mr-2 w-4 h-4" />
              Mark Selected as Read
            </Button>
          )}

          {unreadCount > 0 && (
            <Button variant="default" onClick={markAllRead} disabled={bulkLoading}>
              <Check className="mr-2 w-4 h-4" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications ({notifications.length})</TabsTrigger>
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
                  <p className="text-muted-foreground">You're all caught up! No notifications to display.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{unreadCount} unread</Badge>
                  <Badge variant="outline">{notifications.length} total</Badge>

                  <Select value={view} onValueChange={(v) => setView(v as any)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative w-full md:w-[320px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search notifications..."
                    className="pl-9"
                  />
                </div>
              </div>

              {/* List */}
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    No notifications match your filters.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filtered.map((n) => (
                    <NotificationItem key={n.id} notification={n} />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Customize how and when you receive notifications</CardDescription>
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
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key}>{label}</Label>
                      <Switch
                        id={key}
                        checked={Boolean(preferences?.[key as keyof Preferences])}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => (prev ? { ...prev, [key]: checked } : prev))
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
                    { key: "notify_on_complaint_received", label: "Complaint Received" },
                    { key: "notify_on_complaint_assigned", label: "Complaint Assigned" },
                    { key: "notify_on_complaint_in_progress", label: "Complaint In Progress" },
                    { key: "notify_on_complaint_resolved", label: "Complaint Resolved" },
                    { key: "notify_on_feedback_requested", label: "Feedback Requested" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key}>{label}</Label>
                      <Switch
                        id={key}
                        checked={Boolean(preferences?.[key as keyof Preferences])}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => (prev ? { ...prev, [key]: checked } : prev))
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
                    value={preferences?.digest_frequency ?? "instant"}
                    onValueChange={(value) =>
                      setPreferences((prev) => (prev ? { ...prev, digest_frequency: value } : prev))
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
                      checked={Boolean(preferences?.quiet_hours_enabled)}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => (prev ? { ...prev, quiet_hours_enabled: checked } : prev))
                      }
                    />
                  </div>

                  {preferences?.quiet_hours_enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quiet_hours_start">Start Time</Label>
                        <Input
                          id="quiet_hours_start"
                          type="time"
                          value={preferences.quiet_hours_start ?? "22:00"}
                          onChange={(e) =>
                            setPreferences((prev) =>
                              prev ? { ...prev, quiet_hours_start: e.target.value } : prev
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quiet_hours_end">End Time</Label>
                        <Input
                          id="quiet_hours_end"
                          type="time"
                          value={preferences.quiet_hours_end ?? "07:00"}
                          onChange={(e) =>
                            setPreferences((prev) =>
                              prev ? { ...prev, quiet_hours_end: e.target.value } : prev
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
              <Button onClick={savePreferences} disabled={savingPrefs || !preferences}>
                {savingPrefs ? "Saving..." : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
