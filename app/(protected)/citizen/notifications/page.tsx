"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { 
  Bell, 
  Check, 
  Search, 
  ExternalLink, 
  Inbox, 
  Settings2, 
  ShieldCheck,
  Trash2,
  FilterX
} from "lucide-react"; // Added missing ExternalLink and premium icons
import { format } from "date-fns"; // FIXED: Added missing import
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Types ---
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
  digest_frequency: "immediate",
  quiet_hours_enabled: false,
  quiet_hours_start: "22:00",
  quiet_hours_end: "07:00",
};

export default function NotificationsPage() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
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
      if (view === "unread" && n.is_read) return false;
      if (priorityFilter !== "all" && n.priority !== priorityFilter) return false;
      if (!q) return true;
      const hay = `${n.title} ${n.message} ${n.type}`.toLowerCase();
      return hay.includes(q);
    });
  }, [notifications, query, view, priorityFilter]);

  const priorityBadgeClass: Record<string, string> = {
    low: "bg-emerald-100 text-emerald-800 border-emerald-200",
    normal: "bg-blue-100 text-blue-800 border-blue-200",
    high: "bg-amber-100 text-amber-800 border-amber-200",
    urgent: "bg-rose-100 text-rose-800 border-rose-200",
  };

  useEffect(() => {
    let channel: any = null;
    const boot = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const userId = session.user.id;
        await Promise.all([loadNotifications(userId), loadPreferences(userId)]);

        channel = supabase
          .channel(`notifications_page_${userId}`)
          .on("postgres_changes", {
              event: "*",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              if (payload.eventType === "INSERT") {
                setNotifications((prev) => [normalizeNotification(payload.new), ...prev]);
              } else if (payload.eventType === "UPDATE") {
                setNotifications((prev) =>
                  prev.map((n) => n.id === payload.new.id ? normalizeNotification(payload.new) : n)
                );
              } else if (payload.eventType === "DELETE") {
                setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
              }
            }
          ).subscribe();
      } catch (e) {
        toast.error("Sync Error", { description: "Real-time updates may be delayed." });
      } finally {
        setLoading(false);
      }
    };
    boot();
    return () => { if (channel) supabase.removeChannel(channel); };
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
    sent_at: row.sent_at ?? row.created_at ?? new Date().toISOString(),
  });

  const loadNotifications = async (userId: string) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Fetch Failed", { description: "Could not load your inbox." });
      return;
    }
    setNotifications((data ?? []).map(normalizeNotification));
  };

  const loadPreferences = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error) setPreferences(data ? { ...DEFAULT_PREFS, ...data } : DEFAULT_PREFS);
  };

  const markSelectedRead = async () => {
    if (selected.length === 0) return;
    setBulkLoading(true);
    const { error } = await supabase.from("notifications").update({ is_read: true }).in("id", selected);
    if (!error) {
      setNotifications((prev) => prev.map((n) => (selected.includes(n.id) ? { ...n, is_read: true } : n)));
      setSelected([]);
      toast.success("Inbox updated");
    }
    setBulkLoading(false);
  };

  const markAllRead = async () => {
    setBulkLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      if (!error) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        toast.success("All notifications read");
      }
    }
    setBulkLoading(false);
  };

  const savePreferences = async () => {
    if (!preferences) return;
    setSavingPrefs(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("user_notification_preferences")
        .upsert({ user_id: user.id, ...preferences, updated_at: new Date().toISOString() });
      if (!error) toast.success("Preferences Saved");
      else toast.error("Update Failed");
    }
    setSavingPrefs(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 animate-pulse">
        <div className="space-y-2"><Skeleton className="h-10 w-48 rounded-lg" /><Skeleton className="h-4 w-96" /></div>
        <Skeleton className="h-[500px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* --- Header Section --- */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="h-3 w-3" /> Digital Registry
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none">
            Notifications
          </h1>
          <p className="text-slate-500 font-medium">Stay updated with Pokhara Metropolitan announcements.</p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <Button variant="outline" size="sm" onClick={markSelectedRead} disabled={bulkLoading} className="rounded-xl border-slate-200 shadow-sm font-bold">
                  <Check className="mr-2 h-4 w-4" /> Mark Read ({selected.length})
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          {unreadCount > 0 && (
            <Button variant="default" size="sm" onClick={markAllRead} disabled={bulkLoading} className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold">
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200 inline-flex shadow-inner">
          <TabsTrigger value="notifications" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
            <Inbox className="h-4 w-4 mr-2" /> Inbox
            {unreadCount > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-md leading-none">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
            <Settings2 className="h-4 w-4 mr-2" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* --- INBOX TAB --- */}
        <TabsContent value="notifications" className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col lg:flex-row gap-4 justify-between bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex gap-2">
              <Select value={view} onValueChange={(v: any) => setView(v)}>
                <SelectTrigger className="w-[140px] rounded-xl border-slate-200 bg-white font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] rounded-xl border-slate-200 bg-white font-semibold">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="normal">🔵 Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by title or content..."
                className="pl-11 h-11 rounded-xl border-slate-200 focus:ring-4 focus:ring-blue-50 transition-all bg-white"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                   <FilterX className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Your inbox is clear</h3>
                <p className="text-slate-500 mt-1">No notifications match your current selection.</p>
              </div>
            ) : (
              filtered.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  className={cn(
                    "group relative flex items-start gap-4 p-5 rounded-[1.5rem] border transition-all duration-300",
                    !n.is_read 
                      ? "bg-white border-blue-200 shadow-xl shadow-blue-900/5 ring-1 ring-blue-50" 
                      : "bg-slate-50/40 border-slate-200 grayscale-[0.5] opacity-80"
                  )}
                >
                  <div className="pt-1.5">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                      checked={selected.includes(n.id)}
                      onChange={() => toggleSelected(n.id)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("font-bold text-lg tracking-tight", !n.is_read ? "text-slate-900" : "text-slate-600")}>
                          {n.title}
                        </span>
                        <Badge variant="outline" className={cn("text-[10px] px-2 py-0 h-5 font-black uppercase rounded-md border-2", priorityBadgeClass[n.priority])}>
                          {n.priority}
                        </Badge>
                        {!n.is_read && <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />}
                      </div>
                      <time className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border px-2 py-1 rounded-md shadow-sm">
                        {format(new Date(n.sent_at), "MMM d • h:mm a")}
                      </time>
                    </div>
                    <p className="text-slate-600 leading-relaxed max-w-3xl">{n.message}</p>
                    {n.action_url && (
                      <div className="pt-2">
                        <Button variant="secondary" size="sm" className="h-9 px-4 rounded-xl font-bold bg-white border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm group/btn" asChild>
                          <a href={n.action_url} className="flex items-center gap-2">
                            View details <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* --- SETTINGS TAB --- */}
        <TabsContent value="preferences" className="mt-8">
          <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white ring-1 ring-slate-900/5 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
              <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Communication Preferences</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Control how and when Pokhara City communicates with you.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: "email_enabled", label: "Email Alerts", desc: "Official documentation copies" },
                  { id: "push_enabled", label: "Mobile Push", desc: "Immediate status changes" },
                  { id: "in_app_enabled", label: "In-App Console", desc: "Live portal updates" }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-6 rounded-3xl border-2 border-slate-50 bg-slate-50/30 transition-all hover:border-blue-100 hover:bg-white group">
                    <div className="space-y-1">
                      <Label htmlFor={item.id} className="text-base font-bold text-slate-900">{item.label}</Label>
                      <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                    </div>
                    <Switch 
                      id={item.id} 
                      checked={(preferences as any)?.[item.id]} 
                      onCheckedChange={(v) => setPreferences(prev => prev ? {...prev, [item.id]: v} : null)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/80 backdrop-blur-sm border-t border-slate-100 p-8 flex justify-between items-center">
              <div className="text-xs text-slate-400 font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" /> End-to-end encrypted alerts
              </div>
              <Button onClick={savePreferences} disabled={savingPrefs} className="min-w-[160px] h-12 rounded-2xl bg-slate-900 hover:bg-black font-black text-white shadow-xl shadow-slate-200 transition-all active:scale-95">
                {savingPrefs ? "Synchronizing..." : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}