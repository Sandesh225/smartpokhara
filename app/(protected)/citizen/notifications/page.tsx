"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Search,
  Inbox,
  Settings2,
  ShieldCheck,
  FilterX,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Feature Components
import { NotificationItem, Notification } from "@/features/notifications/components/NotificationItem";
import { NotificationPreferences, Preferences } from "@/features/notifications/components/NotificationPreferences";

const DEFAULT_PREFS: Preferences = {
  email_notifications: true,
  sms_notifications: false,
  push_notifications: true,
  in_app_notifications: true,
  complaint_updates: true,
  new_bills: true,
  new_notices: true,
  digest_frequency: "immediate",
};

export default function NotificationsPage() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"all" | "unread">("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notifications.filter((n) => {
      const matchesView = view === "all" || !n.is_read;
      const matchesPriority =
        priorityFilter === "all" || n.priority === priorityFilter;
      const matchesSearch =
        !q || `${n.title} ${n.message}`.toLowerCase().includes(q);
      return matchesView && matchesPriority && matchesSearch;
    });
  }, [notifications, query, view, priorityFilter]);

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [notifsRes, prefsRes] = await Promise.all([
      supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (!notifsRes.error) setNotifications(notifsRes.data || []);
    if (!prefsRes.error)
      setPreferences(
        prefsRes.data ? { ...DEFAULT_PREFS, ...prefsRes.data } : DEFAULT_PREFS
      );

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
            toast.info("New notification received");
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === payload.new.id ? (payload.new as Notification) : n
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData, supabase]);

  const toggleSelected = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const markAsRead = async (ids: string[]) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", ids);
    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n))
      );
      setSelected([]);
      toast.success("Messages updated");
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await markAsRead(unreadIds);
  };

  const handlePreferenceChange = (id: string, value: boolean) => {
    setPreferences((prev) => (prev ? { ...prev, [id]: value } : null));
  };

  const savePreferences = async () => {
    if (!preferences) return;
    setSavingPrefs(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("user_notification_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (!error) toast.success("Settings Synchronized");
      else toast.error("Could not save preferences");
    }
    setSavingPrefs(false);
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between animate-fade-in">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
              <ShieldCheck className="h-3.5 w-3.5" /> Citizen Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Communications
            </h1>
            <p className="text-base text-muted-foreground max-w-xl">
              Stay updated with official metropolitan announcements, service alerts, and personalized messages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selected.length > 0 && (
              <div className="animate-fade-in">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => markAsRead(selected)}
                  className="rounded-xl border font-medium shadow-xs h-11 px-5 hover:bg-primary/5 transition-all duration-200"
                >
                  <Check className="mr-2 h-4 w-4" /> Mark Read ({selected.length})
                </Button>
              </div>
            )}
            <Button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="rounded-xl h-11 px-6 font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              Mark all read
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="bg-muted p-1 rounded-xl mb-8 border border-border">
            <TabsTrigger
              value="notifications"
              className="rounded-lg px-6 py-2.5 font-semibold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <Inbox className="h-4 w-4 mr-2" /> Activity
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="rounded-lg px-6 py-2.5 font-semibold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <Settings2 className="h-4 w-4 mr-2" /> Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6 outline-none">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 p-5 sm:p-6 bg-card rounded-2xl border border-border shadow-sm">
              <div className="flex gap-3">
                <Select value={view} onValueChange={(v: any) => setView(v)}>
                  <SelectTrigger className="w-[140px] h-11 rounded-xl border-border bg-muted/30 font-medium focus-visible:ring-ring">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="unread">Unread Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px] h-11 rounded-xl border-border bg-muted/30 font-medium focus-visible:ring-ring">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Any Priority</SelectItem>
                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="normal">🔵 Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communications..."
                  className="pl-10 h-11 rounded-xl border-border bg-muted/30 focus:bg-background transition-colors font-medium focus-visible:ring-ring"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Notifications List */}
            <div className="grid gap-4">
              {filtered.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border animate-fade-in">
                  <FilterX className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Nothing found
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or filters.
                  </p>
                </div>
              ) : (
                filtered.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    isSelected={selected.includes(n.id)}
                    onSelect={toggleSelected}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="outline-none">
            <NotificationPreferences
              preferences={preferences}
              onPreferenceChange={handlePreferenceChange}
              onSave={savePreferences}
              isLoading={savingPrefs}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="space-y-8 animate-pulse">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-12 w-80 rounded-2xl" />
          <Skeleton className="h-5 w-full max-w-xl rounded-full" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-11 w-48 rounded-xl" />
          <Skeleton className="h-11 w-48 rounded-xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
