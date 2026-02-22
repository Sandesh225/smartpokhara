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
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-black uppercase tracking-widest border border-primary/20">
            <ShieldCheck className="h-4 w-4" /> Citizen Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Communications
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Stay updated with official metropolitan announcements, service alerts, and personalized messages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => markAsRead(selected)}
                  className="rounded-2xl border-2 font-bold shadow-sm h-14 px-6 hover:bg-primary/5 transition-all"
                >
                  <Check className="mr-2 h-5 w-5" /> Mark Read ({selected.length})
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="rounded-2xl bg-primary hover:bg-primary/90 h-14 px-8 font-black shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            Mark all read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="bg-muted p-1.5 rounded-3xl mb-8 border-2 border-border/50">
          <TabsTrigger
            value="notifications"
            className="rounded-2xl px-8 md:px-12 py-3 font-black text-sm data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all"
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
            className="rounded-2xl px-8 md:px-12 py-3 font-black text-sm data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all"
          >
            <Settings2 className="h-4 w-4 mr-2" /> Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6 outline-none">
          <div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-[2rem] border-2 border-border shadow-sm">
            <div className="flex gap-2">
              <Select value={view} onValueChange={(v: any) => setView(v)}>
                <SelectTrigger className="w-[140px] md:w-[160px] h-12 rounded-2xl border-2 border-border bg-muted/30 font-bold focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] md:w-[160px] h-12 rounded-2xl border-2 border-border bg-muted/30 font-bold focus:ring-primary/20">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Any Priority</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="normal">🔵 Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search communications..."
                className="pl-12 h-12 rounded-2xl border-2 border-border bg-muted/30 focus:bg-background transition-all font-medium focus:ring-primary/20"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-32 bg-muted/30 rounded-[3rem] border-4 border-dashed border-muted"
                >
                  <FilterX className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-foreground">
                    Nothing found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters.
                  </p>
                </motion.div>
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
            </AnimatePresence>
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
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-10 animate-pulse max-w-5xl">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-16 w-96 rounded-2xl" />
        <Skeleton className="h-6 w-full max-w-xl rounded-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-14 w-64 rounded-3xl" />
        <Skeleton className="h-14 w-64 rounded-3xl" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-[2.5rem]" />
        ))}
      </div>
    </div>
  );
}
