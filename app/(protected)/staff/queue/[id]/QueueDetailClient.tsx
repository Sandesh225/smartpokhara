"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft, Building2, Calendar, CheckCircle2, Clock, FileText,
  Activity, User, AlertCircle, CheckCircle, XCircle, TrendingUp,
  Paperclip, BarChart3, Zap, MapPin, Phone, Mail, FileCheck, ExternalLink, Image as ImageIcon, Play, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UniversalMessaging } from "@/components/complaints/shared/UniversalMessaging";
import { TaskActionBar } from "../_components/TaskActionBar";

// ─── Config ──────────────────────────────────────────────────────────────────
const STATUS = {
  pending:      { label: "Pending",     icon: Clock,        dot: "bg-amber-500",            pill: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200" },
  not_started:  { label: "Not Started", icon: Clock,        dot: "bg-amber-500",            pill: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200" },
  in_progress:  { label: "In Progress", icon: Activity,     dot: "bg-primary",              pill: "bg-accent text-accent-foreground" },
  completed:    { label: "Completed",   icon: CheckCircle,  dot: "bg-emerald-500",          pill: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200" },
  cancelled:    { label: "Cancelled",   icon: XCircle,      dot: "bg-muted-foreground",     pill: "bg-muted text-muted-foreground" },
  rejected:     { label: "Rejected",    icon: XCircle,      dot: "bg-destructive",          pill: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200" },
} as const;

const PRIORITY = {
  low:    { label: "Low",    icon: TrendingUp,  pill: "bg-muted text-muted-foreground border border-border" },
  medium: { label: "Medium", icon: AlertCircle, pill: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800" },
  high:   { label: "High",   icon: Zap,         pill: "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800" },
  urgent: { label: "Urgent", icon: AlertCircle, pill: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800" },
} as const;

// ─── Micro Components ─────────────────────────────────────────────────────────
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

// ─── Page Client Component ────────────────────────────────────────────────────
interface QueueDetailClientProps {
  assignment: any;
  isAssignee: boolean;
  currentUserId: string;
}

export function QueueDetailClient({ assignment, isAssignee, currentUserId }: QueueDetailClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "timeline" | "communication">("overview");

  const s = STATUS[assignment.status?.toLowerCase() as keyof typeof STATUS] ?? { label: assignment.status ?? "Unknown", icon: AlertCircle, dot: "bg-muted-foreground", pill: "bg-muted text-muted-foreground" };
  const p = PRIORITY[assignment.priority?.toLowerCase() as keyof typeof PRIORITY] ?? { label: assignment.priority ?? "Normal", icon: AlertCircle, pill: "bg-muted text-muted-foreground border border-border" };
  const PIcon = p.icon;

  const realComplaintId = assignment.type === "complaint" ? assignment.complaint_id : null;
  const isComplaint = assignment.type === "complaint";

  const TABS = [
    { id: "overview",      label: "Overview",  icon: FileText    },
    { id: "timeline",      label: "Timeline",  icon: BarChart3   },
  ];
  if (isComplaint && realComplaintId) {
    TABS.push({ id: "communication", label: "Messages", icon: MessageSquare });
  }

  const META = [
    { label: "Assignment Type", value: isComplaint ? "Citizen Complaint" : "Internal Task", icon: FileText },
    { label: "Assigned By", value: assignment.assigned_by_name || "System", icon: User },
    { label: "Assigned On", value: format(new Date(assignment.assigned_at), "MMM dd, yyyy"), icon: Calendar },
    { label: "Ward Location", value: assignment.ward || "General", icon: MapPin },
  ];

  const dueTime = assignment.due_at ? new Date(assignment.due_at).getTime() : null;
  const isOverdue = dueTime ? Date.now() > dueTime : false;

  return (
    <div className="min-h-screen bg-background font-sans pb-12">
      {/* ── Nav Bar ── */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/staff/queue")}
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors py-2 pl-0 pr-4">
            <ArrowLeft className="w-4 h-4" /> Back to Queue
          </button>
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
            {assignment.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground py-2 font-medium">
            <span className="inline-flex items-center gap-1.5 font-mono font-black bg-muted px-3 py-1 rounded border border-border text-foreground tracking-tight">
              <FileCheck className="w-4 h-4 text-primary" />
              {assignment.tracking_code}
            </span>
            {assignment.started_at && (
                <span className="inline-flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-primary" />
                  Started {formatDistanceToNow(new Date(assignment.started_at))} ago
                </span>
            )}
            {assignment.completed_at && (
                <span className="inline-flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed {formatDistanceToNow(new Date(assignment.completed_at))} ago
                </span>
            )}
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
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as any)}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
                tab === id
                  ? "bg-card text-foreground border border-border shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* OVERVIEW TAB */}
            {tab === "overview" && <>
              <Card icon={FileText} title="Instructions & Details">
                {assignment.instructions && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-warning-amber uppercase mb-2 tracking-widest flex items-center gap-1.5">
                      <span className="w-1 h-3 bg-warning-amber rounded-full" />
                      Supervisor Instructions
                    </p>
                    <div className="text-sm text-foreground bg-warning-amber/5 p-4 rounded-xl border border-warning-amber/20 font-medium leading-relaxed italic">
                      "{assignment.instructions}"
                    </div>
                  </div>
                )}
                <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                  {assignment.description || "No detailed description provided."}
                </p>
                {assignment.location && (
                   <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                     <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                       <MapPin className="w-4 h-4 text-primary" />
                       <span className="truncate max-w-[300px]">{assignment.location}</span>
                     </div>
                     {assignment.coordinates && (
                         <button onClick={() => window.open(`https://www.google.com/maps?q=${assignment.coordinates.coordinates[1]},${assignment.coordinates.coordinates[0]}`, "_blank")} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-wider">
                            View Map <ArrowLeft className="w-3 h-3 rotate-135" />
                         </button>
                     )}
                   </div>
                )}
              </Card>

              {assignment.attachments && assignment.attachments.length > 0 && (
                <Card icon={ImageIcon} title="Attached Evidence" badge={assignment.attachments.length}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {assignment.attachments.map((f: any, i: number) => (
                      <a key={f.id} href={f.file_path} target="_blank" rel="noopener noreferrer"
                        className="group relative aspect-video rounded-xl overflow-hidden border border-border hover:border-primary transition-all shadow-xs block">
                        <img src={f.file_path} alt={`Evidence ${i + 1}`} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center">
                          <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                        </div>
                      </a>
                    ))}
                  </div>
                </Card>
              )}
            </>}

            {/* TIMELINE TAB */}
            {tab === "timeline" && (
                <Card icon={BarChart3} title="Work Progression">
                    <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
                        {[
                            { label: "Assigned", time: assignment.assigned_at, done: !!assignment.assigned_at, color: "bg-primary" },
                            { label: "Work Started", time: assignment.started_at, done: !!assignment.started_at, color: "bg-amber-500" },
                            { label: "Completed", time: assignment.completed_at, done: !!assignment.completed_at, color: "bg-emerald-500" }
                        ].map((node, i) => (
                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className={cn(
                                    "flex items-center justify-center w-5 h-5 rounded-full border-2 bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm",
                                    node.done ? cn("border-transparent", node.color) : "border-border"
                                )}>
                                    {node.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-card p-4 rounded-xl border border-border shadow-xs">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className={cn("font-black tracking-tight", node.done ? "text-foreground" : "text-muted-foreground")}>{node.label}</div>
                                    </div>
                                    <div className="text-eyebrow text-muted-foreground">
                                        {node.time ? format(new Date(node.time), "MMM dd, yyyy · h:mm a") : "Pending"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* MESSAGES TAB */}
            {tab === "communication" && isComplaint && realComplaintId && (
               <div className="h-[600px] border border-border bg-card rounded-xl overflow-hidden shadow-sm">
                   <UniversalMessaging
                       channelType="COMPLAINT_PUBLIC"
                       channelId={realComplaintId}
                       currentUserId={currentUserId}
                       currentUserRole="staff"
                       variant="default"
                       title="Public Discussion"
                       subtitle="Comments visible to citizen"
                       className="h-full border-0"
                   />
               </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            
            {/* SLA / Deadline */}
            {assignment.due_at && (
               <Card icon={Clock} title="Deadline Status">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="text-eyebrow text-muted-foreground">Due Date</span>
                    <span className="font-black text-foreground tracking-tight">{format(new Date(assignment.due_at), "MMM dd, yyyy")}</span>
                  </div>
                  {!assignment.completed_at && (
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-eyebrow text-muted-foreground">Status</span>
                      <span className={cn("font-black tracking-tight", isOverdue ? "text-destructive" : "text-amber-600")}>
                        {isOverdue ? "OVERDUE" : "Active"}
                      </span>
                    </div>
                  )}
               </Card>
            )}

            {/* Action Bar inside Sidebar */}
            <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Actions</span>
                </div>
                <div className="p-5">
                    <TaskActionBar
                        assignmentId={assignment.id}
                        status={assignment.status}
                        isAssignee={isAssignee}
                        assigneeId={assignment.staff_id}
                        staffId={currentUserId}
                    />
                </div>
            </div>

            {/* Citizen Info */}
            {isComplaint && assignment.citizen && (
                <Card icon={User} title="Citizen Contact">
                    <div className="flex items-center gap-4 border-b border-border pb-4 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg shrink-0">
                            {assignment.citizen.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="font-black text-base text-foreground truncate tracking-tight">{assignment.citizen.name}</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Complainant</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {assignment.citizen.phone && (
                            <a href={`tel:${assignment.citizen.phone}`} className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-primary" />
                            </div>
                            {assignment.citizen.phone}
                            </a>
                        )}
                        {assignment.citizen.email && (
                            <a href={`mailto:${assignment.citizen.email}`} className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors truncate">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-primary" />
                            </div>
                            <span className="truncate">{assignment.citizen.email}</span>
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
