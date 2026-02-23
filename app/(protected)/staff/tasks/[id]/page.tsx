// app/(protected)/staff/tasks/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft, Building2, Calendar, CheckCircle2, Clock, FileText,
  Activity, User, AlertCircle, CheckCircle, XCircle, TrendingUp,
  BarChart3, Zap, MapPin, Phone, Mail, FileCheck, ExternalLink, Image as ImageIcon, Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ─── Config ──────────────────────────────────────────────────────────────────
const STATUS = {
  open:         { label: "Open",        icon: Clock,        dot: "bg-amber-500",            pill: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200" },
  in_progress:  { label: "In Progress", icon: Activity,     dot: "bg-primary",              pill: "bg-accent text-accent-foreground" },
  completed:    { label: "Completed",   icon: CheckCircle,  dot: "bg-emerald-500",          pill: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200" },
  on_hold:      { label: "On Hold",     icon: AlertCircle,  dot: "bg-orange-500",           pill: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200" },
  cancelled:    { label: "Cancelled",   icon: XCircle,      dot: "bg-muted-foreground",     pill: "bg-muted text-muted-foreground" },
} as const;

const PRIORITY = {
  low:      { label: "Low",      icon: TrendingUp,  pill: "bg-muted text-muted-foreground border border-border" },
  medium:   { label: "Medium",   icon: AlertCircle, pill: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800" },
  high:     { label: "High",     icon: Zap,         pill: "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800" },
  critical: { label: "Critical", icon: AlertCircle, pill: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800" },
} as const;

function Card({ icon: Icon, title, badge, children, className }: {
  icon: any; title: string; badge?: string | number; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("bg-card border border-border rounded-xl overflow-hidden shadow-xs", className)}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/30">
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <span className="font-semibold text-sm text-foreground">{title}</span>
        {badge !== undefined && (
          <span className="ml-auto text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [tab, setTab] = useState<"overview" | "timeline">("overview");

  useEffect(() => {
    loadTaskDetails();
  }, [params.id]);

  async function loadTaskDetails() {
    const supabase = createClient();
    try {
      const { data: taskData, error: taskError } = await supabase
        .from("supervisor_tasks")
        .select(`
          *,
          related_complaint:complaints(
            id, tracking_code, title, description, location_point, address_text,
            citizen:users!complaints_citizen_id_fkey(phone, email, profile:user_profiles(full_name))
          ),
          assignee:users!supervisor_tasks_primary_assigned_to_fkey(user_profiles(full_name, phone)),
          supervisor:users!supervisor_tasks_supervisor_id_fkey(user_profiles(full_name)),
          ward:wards(ward_number, name),
          assigned_department:departments(name)
        `)
        .eq("id", params.id)
        .single();

      if (taskError) throw taskError;
      setTask(taskData);

      const { data: activityData, error: activityError } = await supabase
        .from("internal_notes")
        .select(`
          *,
          author:users!internal_notes_supervisor_id_fkey(user_profiles(full_name))
        `)
        .eq("task_id", params.id)
        .order("created_at", { ascending: false });

      if (activityError) throw activityError;
      setActivities(activityData || []);
    } catch (error) {
      console.error("Error loading task details:", error);
    } finally {
      setLoading(false);
    }
  }

  const updateTaskStatus = async (newStatus: string) => {
    setUpdating(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("supervisor_tasks")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", params.id);

      if (error) throw error;
      
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("internal_notes").insert({
        task_id: params.id,
        supervisor_id: user?.id,
        content: `Status changed to ${STATUS[newStatus as keyof typeof STATUS]?.label || newStatus}`,
        is_private: false
      });

      await loadTaskDetails();
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status");
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("internal_notes")
        .insert({
          task_id: params.id,
          supervisor_id: user?.id,
          content: newNote,
          is_private: false
        });

      if (error) throw error;
      setNewNote("");
      await loadTaskDetails();
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Activity className="w-8 h-8 text-primary animate-pulse" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading task details...</p>
    </div>
  );

  if (!task) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card border border-border p-8 rounded-xl text-center max-w-sm w-full mx-4 shadow-sm">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Task Not Found</h1>
            <p className="text-muted-foreground mb-6">The task you are looking for does not exist or has been removed.</p>
            <Link href="/staff/tasks" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:brightness-110 transition-all inline-block">Return to Tasks</Link>
        </div>
    </div>
  );

  const s = STATUS[task.status?.toLowerCase() as keyof typeof STATUS] ?? { label: task.status ?? "Unknown", icon: AlertCircle, dot: "bg-muted-foreground", pill: "bg-muted text-muted-foreground" };
  const p = PRIORITY[task.priority?.toLowerCase() as keyof typeof PRIORITY] ?? { label: task.priority ?? "Normal", icon: AlertCircle, pill: "bg-muted text-muted-foreground border border-border" };
  const PIcon = p.icon;

  const META = [
    { label: "Assigned By", value: task.supervisor?.user_profiles?.full_name || "System", icon: User },
    { label: "Assigned On", value: format(new Date(task.created_at), "MMM dd, yyyy"), icon: Calendar },
    { label: "Department", value: task.assigned_department?.name || "General", icon: Building2 },
    { label: "Ward", value: task.ward ? `Ward ${task.ward.ward_number}` : "General", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-background font-sans pb-12">
      {/* ── Nav Bar ── */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/staff/tasks" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Tasks
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="bg-card border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-border", s.pill)}>
              <span className={cn("w-2 h-2 rounded-full shrink-0", s.dot)} />
              {s.label}
            </span>
            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider", p.pill)}>
              <PIcon className="w-3.5 h-3.5 shrink-0" /> {p.label} Priority
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-foreground leading-tight tracking-tight">
            {task.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground py-2 font-medium">
            <span className="inline-flex items-center gap-1.5 font-mono font-black bg-muted px-3 py-1 rounded border border-border text-foreground tracking-tight">
              <FileCheck className="w-4 h-4 text-primary" />
              {task.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1.5">
               <Clock className="w-4 h-4" /> Last updated {formatDistanceToNow(new Date(task.updated_at))} ago
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {META.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-4 bg-muted/30 border border-border rounded-xl px-5 py-4 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-eyebrow text-muted-foreground mb-1">{label}</p>
                  <p className="text-sm font-bold text-foreground truncate tracking-tight">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 bg-muted p-1.5 rounded-xl w-fit mb-8 border border-border">
          <button onClick={() => setTab("overview")} className={cn("inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300", tab === "overview" ? "bg-card text-foreground border border-border shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-muted/80")}>
            <FileText className="w-4 h-4" /> Overview
          </button>
          <button onClick={() => setTab("timeline")} className={cn("inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300", tab === "timeline" ? "bg-card text-foreground border border-border shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-muted/80")}>
            <BarChart3 className="w-4 h-4" /> Timeline & Notes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* OVERVIEW TAB */}
            {tab === "overview" && <>
              <Card icon={FileText} title="Task Description">
                <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                  {task.description || "No detailed description provided."}
                </p>
                {(task.location_point || task.address_text) && (
                   <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                     <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                       <MapPin className="w-4 h-4 text-primary" />
                       <span className="truncate max-w-[300px]">{task.address_text || "Pinned location"}</span>
                     </div>
                     {task.location_point && (
                         <button onClick={() => window.open(`https://www.google.com/maps?q=${task.location_point.coordinates[1]},${task.location_point.coordinates[0]}`, "_blank")} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-wider">
                            View Map <ArrowLeft className="w-3 h-3 rotate-135" />
                         </button>
                     )}
                   </div>
                )}
              </Card>

              {task.related_complaint && (
                <Card icon={AlertCircle} title="Related Complaint Context">
                    <div className="bg-muted/30 border border-border rounded-lg p-5">
                       <div className="flex items-start justify-between">
                            <div>
                                <Link href={`/staff/complaints/${task.related_complaint.id}`} className="text-sm font-bold text-primary hover:underline hover:text-blue-600 transition-colors flex items-center gap-2">
                                  {task.related_complaint.tracking_code} <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                                <h4 className="text-base font-black text-foreground mt-1 mb-2">{task.related_complaint.title}</h4>
                                <p className="text-sm text-muted-foreground font-medium line-clamp-2">{task.related_complaint.description}</p>
                            </div>
                       </div>
                    </div>
                </Card>
              )}
            </>}

            {/* TIMELINE TAB */}
            {tab === "timeline" && (
                <Card icon={BarChart3} title="Activity Timeline & Notes">
                    {/* Add Note */}
                    <form onSubmit={addNote} className="mb-8 bg-muted/30 border border-border rounded-xl p-4">
                        <label htmlFor="note" className="block text-eyebrow text-muted-foreground mb-2">Add Internal Note</label>
                        <textarea
                            id="note" rows={3}
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                            placeholder="Type progress update or note here..."
                            value={newNote} onChange={(e) => setNewNote(e.target.value)}
                        />
                        <div className="flex justify-end mt-3">
                            <button type="submit" disabled={!newNote.trim()} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md shadow-primary/20">
                                <Send className="w-4 h-4" /> Save Note
                            </button>
                        </div>
                    </form>

                    <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
                        {[...activities].map((node, i) => (
                            <div key={node.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                </div>
                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-card p-4 rounded-xl border border-border shadow-xs">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-bold text-foreground text-sm flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                                                {(node.author?.user_profiles?.full_name || "S")[0]}
                                            </div>
                                            {node.author?.user_profiles?.full_name || "System"}
                                        </div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">
                                            {formatDistanceToNow(new Date(node.created_at))} ago
                                        </div>
                                    </div>
                                    <div className="text-sm text-foreground bg-muted/30 p-3 rounded-lg border border-border font-medium leading-relaxed">
                                        {node.content}
                                    </div>
                                    <div className="text-xs text-muted-foreground font-medium mt-2 text-right">
                                        {format(new Date(node.created_at), "h:mm a")}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            
            <Card icon={Zap} title="Task Actions">
                <div className="space-y-4">
                    <div>
                        <label className="text-eyebrow text-muted-foreground mb-2 block">Update Status</label>
                        <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(e.target.value)}
                            disabled={updating}
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                        >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on_hold">On Hold</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {task.status === "open" && (
                        <button onClick={() => updateTaskStatus("in_progress")} disabled={updating} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-md shadow-primary/20 active:scale-95 disabled:opacity-50">
                            Start Processing
                        </button>
                    )}
                    {task.status === "in_progress" && (
                        <button onClick={() => updateTaskStatus("completed")} disabled={updating} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50">
                            <CheckCircle2 className="w-5 h-5" /> Mark Completed
                        </button>
                    )}
                </div>
            </Card>

            {task.due_date && (
               <Card icon={Clock} title="Deadline">
                  <div className="flex items-center justify-between">
                    <span className="text-eyebrow text-muted-foreground">Due Date</span>
                    <span className="font-black text-foreground tracking-tight">{format(new Date(task.due_date), "MMM dd, yyyy")}</span>
                  </div>
               </Card>
            )}

            {/* Assignment Info */}
            <Card icon={User} title="Assignment Information">
                <div className="space-y-4">
                    <div>
                        <span className="text-eyebrow text-muted-foreground block mb-1">Primary Assignee</span>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                {(task.assignee?.user_profiles?.full_name || "U")[0]}
                            </div>
                            <div>
                                <span className="font-bold text-sm text-foreground block">{task.assignee?.user_profiles?.full_name || "Unassigned"}</span>
                                {task.assignee?.user_profiles?.phone && <span className="text-xs text-muted-foreground">{task.assignee.user_profiles.phone}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Citizen Info Context (from related complaint) */}
            {task.related_complaint?.citizen && (
                <Card icon={User} title="Citizen Context">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-2">From Related Complaint</p>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-lg shrink-0">
                            {task.related_complaint.citizen.profile?.full_name?.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div className="min-w-0">
                            <p className="font-black text-base text-foreground truncate tracking-tight">{task.related_complaint.citizen.profile?.full_name || "Unknown Citizen"}</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {task.related_complaint.citizen.phone && (
                            <a href={`tel:${task.related_complaint.citizen.phone}`} className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-primary" />
                            </div>
                            {task.related_complaint.citizen.phone}
                            </a>
                        )}
                        {task.related_complaint.citizen.email && (
                            <a href={`mailto:${task.related_complaint.citizen.email}`} className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors truncate">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-primary" />
                            </div>
                            <span className="truncate">{task.related_complaint.citizen.email}</span>
                            </a>
                        )}
                    </div>
                </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}