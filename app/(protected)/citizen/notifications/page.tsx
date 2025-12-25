"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
  Check,
  Search,
  ExternalLink,
  Inbox,
  Settings2,
  ShieldCheck,
  FilterX,
  FileText,
  CreditCard,
  Megaphone,
  AlertTriangle,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type NotificationType =
  | "complaint_status"
  | "bill_generated"
  | "new_notice"
  | "system_announcement"
  | "general";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  complaint_id: string | null;
  bill_id: string | null;
  notice_id: string | null;
  is_read: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  action_url: string | null;
  created_at: string;
};

type Preferences = {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  complaint_updates: boolean;
  new_bills: boolean;
  new_notices: boolean;
  digest_frequency: string;
};

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

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "complaint_status":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "bill_generated":
        return <CreditCard className="h-5 w-5 text-emerald-500" />;
      case "new_notice":
        return <Megaphone className="h-5 w-5 text-amber-500" />;
      case "system_announcement":
        return <AlertTriangle className="h-5 w-5 text-rose-500" />;
      default:
        return <Info className="h-5 w-5 text-slate-400" />;
    }
  };

  const priorityBadgeClass = {
    low: "bg-slate-100 text-slate-600 border-slate-200",
    normal: "bg-blue-50 text-blue-700 border-blue-100",
    high: "bg-orange-50 text-orange-700 border-orange-100",
    urgent: "bg-red-50 text-red-700 border-red-100",
  };

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
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 text-blue-700 text-[11px] font-black uppercase tracking-widest border border-blue-200">
            <ShieldCheck className="h-3 w-3" /> Citizen Hub
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900">
            Inbox
          </h1>
          <p className="text-slate-500 text-lg">
            Manage your metropolitan communications and alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => markAsRead(selected)}
                  className="rounded-2xl border-slate-200 font-bold shadow-sm h-14 px-6"
                >
                  <Check className="mr-2 h-5 w-5" /> Mark Read (
                  {selected.length})
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            onClick={markAllAsRead}
            className="rounded-2xl bg-blue-600 hover:bg-blue-700 h-14 px-8 font-black shadow-xl shadow-blue-200 transition-all active:scale-95"
          >
            Mark all as read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-3xl mb-8">
          <TabsTrigger
            value="notifications"
            className="rounded-2xl px-10 py-3 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
          >
            <Inbox className="h-4 w-4 mr-2" /> Activity
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-blue-600 hover:bg-blue-600">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="rounded-2xl px-10 py-3 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
          >
            <Settings2 className="h-4 w-4 mr-2" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6 outline-none">
          <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex gap-2">
              <Select value={view} onValueChange={(v: any) => setView(v)}>
                <SelectTrigger className="w-[160px] h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[160px] h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="normal">🔵 Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search messages..."
                className="pl-12 h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100"
                >
                  <FilterX className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-slate-900">
                    No results found
                  </h3>
                  <p className="text-slate-500">
                    Try adjusting your filters or search keywords.
                  </p>
                </motion.div>
              ) : (
                filtered.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "group relative flex items-start gap-5 p-6 rounded-[2rem] border transition-all duration-300",
                      !n.is_read
                        ? "bg-white border-blue-200 shadow-xl shadow-blue-900/5 ring-1 ring-blue-50"
                        : "bg-slate-50/50 border-slate-200 opacity-75"
                    )}
                  >
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        className="h-6 w-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selected.includes(n.id)}
                        onChange={() => toggleSelected(n.id)}
                      />
                    </div>

                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getNotificationIcon(n.type)}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <h3
                            className={cn(
                              "text-xl font-black tracking-tight",
                              !n.is_read ? "text-slate-900" : "text-slate-600"
                            )}
                          >
                            {n.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-black uppercase px-2 rounded-lg border-2",
                              priorityBadgeClass[n.priority]
                            )}
                          >
                            {n.priority}
                          </Badge>
                          {!n.is_read && (
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                          )}
                        </div>
                        <time className="text-xs font-bold text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm">
                          {format(
                            new Date(n.created_at),
                            "MMM d, yyyy • h:mm a"
                          )}
                        </time>
                      </div>

                      <p className="text-slate-600 text-lg leading-relaxed">
                        {n.message}
                      </p>

                      {n.action_url && (
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            className="rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all group/btn bg-transparent"
                            asChild
                          >
                            <a href={n.action_url}>
                              View Application{" "}
                              <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="outline-none">
          <Card className="border-0 shadow-2xl rounded-[3rem] bg-white ring-1 ring-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 p-10 border-b border-slate-100">
              <CardTitle className="text-3xl font-black">
                Notification Rules
              </CardTitle>
              <CardDescription className="text-lg">
                Define how the Smart City Pokhara system should reach you.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-10 space-y-12">
              <section className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Delivery Channels
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: "email_notifications",
                      label: "Email Addresses",
                      desc: "For official receipts and detailed summaries",
                    },
                    {
                      id: "push_notifications",
                      label: "Mobile Push",
                      desc: "Instant alerts on your smartphone",
                    },
                    {
                      id: "sms_notifications",
                      label: "SMS Messages",
                      desc: "Critical emergency alerts only",
                    },
                    {
                      id: "in_app_notifications",
                      label: "In-App Banner",
                      desc: "Visual cues while using the portal",
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-6 rounded-[2rem] border-2 border-slate-50 hover:border-blue-100 transition-all"
                    >
                      <div className="space-y-1">
                        <Label className="text-lg font-black">
                          {item.label}
                        </Label>
                        <p className="text-sm text-slate-400 font-medium">
                          {item.desc}
                        </p>
                      </div>
                      <Switch
                        checked={(preferences as any)?.[item.id]}
                        onCheckedChange={(v) =>
                          setPreferences((prev) =>
                            prev ? { ...prev, [item.id]: v } : null
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Content Topics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: "complaint_updates", label: "Complaint Status" },
                    { id: "new_bills", label: "Financial / Bills" },
                    { id: "new_notices", label: "Public Notices" },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-6 rounded-[1.5rem] bg-slate-50/50"
                    >
                      <Label className="font-bold">{item.label}</Label>
                      <Switch
                        checked={(preferences as any)?.[item.id]}
                        onCheckedChange={(v) =>
                          setPreferences((prev) =>
                            prev ? { ...prev, [item.id]: v } : null
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>
            </CardContent>

            <CardFooter className="p-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-500" /> Advanced data
                encryption active
              </p>
              <Button
                size="lg"
                onClick={savePreferences}
                disabled={savingPrefs}
                className="rounded-2xl bg-slate-900 hover:bg-black h-14 px-10 font-black shadow-xl shadow-slate-200"
              >
                {savingPrefs ? "Saving..." : "Save Configuration"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-8 animate-pulse">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-16 w-64 rounded-xl" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-14 w-40 rounded-2xl" />
        <Skeleton className="h-14 w-40 rounded-2xl" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
        ))}
      </div>
    </div>
  );
}
