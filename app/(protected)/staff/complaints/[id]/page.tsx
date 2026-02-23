"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft, Building2, Calendar, CheckCircle2, Clock, FileText,
  Activity, User, AlertCircle, CheckCircle, XCircle, Eye, TrendingUp,
  Paperclip, BarChart3, Zap, BadgeCheck, Camera,
  Image as ImageIcon, Printer, RefreshCw, MessageSquare, MapPin, Shield, Phone, Mail, FileCheck
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useComplaint } from "@/features/complaints/hooks/useComplaint";
import { useCurrentUser } from "@/features/users/hooks/useCurrentUser";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { UniversalMessaging } from "@/components/complaints/shared/UniversalMessaging";

// ─── Config ──────────────────────────────────────────────────────────────────
const STATUS = {
  pending:      { label: "Pending Review", icon: Clock,        dot: "bg-amber-500",            pill: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",        barCls: "bg-amber-500"        },
  in_progress:  { label: "In Progress",   icon: Activity,     dot: "bg-primary",              pill: "bg-accent text-accent-foreground",                                             barCls: "bg-primary"          },
  under_review: { label: "Under Review",  icon: Eye,          dot: "bg-violet-500",           pill: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200",    barCls: "bg-violet-500"       },
  assigned:     { label: "Assigned",      icon: User,         dot: "bg-indigo-500",           pill: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",   barCls: "bg-indigo-500"       },
  resolved:     { label: "Resolved",      icon: CheckCircle,  dot: "bg-emerald-500",          pill: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",barCls: "bg-emerald-500"      },
  closed:       { label: "Closed",        icon: CheckCircle2, dot: "bg-muted-foreground",     pill: "bg-muted text-muted-foreground",                                               barCls: "bg-muted-foreground" },
  rejected:     { label: "Rejected",      icon: XCircle,      dot: "bg-destructive",          pill: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",                barCls: "bg-destructive"      },
} as const;

const PRIORITY = {
  low:    { label: "Low",    icon: TrendingUp,  pill: "bg-muted text-muted-foreground border border-border" },
  medium: { label: "Medium", icon: AlertCircle, pill: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800" },
  high:   { label: "High",   icon: Zap,         pill: "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800" },
  urgent: { label: "Urgent", icon: AlertCircle, pill: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800" },
} as const;

// ─── Micro Components ─────────────────────────────────────────────────────────
function SkeletonBox({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} />;
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 bg-card border-b border-border" />
      <div className="bg-card border-b border-border px-6 py-8 space-y-4">
        <div className="flex gap-2"><SkeletonBox className="h-6 w-28" /><SkeletonBox className="h-6 w-20" /></div>
        <SkeletonBox className="h-7 w-2/3" />
        <div className="grid grid-cols-4 gap-3 pt-1">
          {[...Array(4)].map((_, i) => <SkeletonBox key={i} className="h-16" />)}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-6 grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <SkeletonBox className="h-10 w-60" />
          <SkeletonBox className="h-36" />
          <SkeletonBox className="h-56" />
        </div>
        <div className="space-y-4">
          <SkeletonBox className="h-36" />
          <SkeletonBox className="h-28" />
        </div>
      </div>
    </div>
  );
}

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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StaffComplaintDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params.id as string;
  const supa    = createClient();

  const { data: user }      = useCurrentUser();
  const { data: complaint, isLoading, isRefetching, refetch } = useComplaint(id);

  const [tab, setTab]                 = useState<"overview" | "timeline" | "communication">("overview");
  const [lightbox, setLightbox]       = useState<string | null>(null);

  // Real-time
  useEffect(() => {
    if (!id) return;
    const ch = supa.channel(`cd-${id}-staff`)
      .on("postgres_changes", { event: "UPDATE",  schema: "public", table: "complaints",              filter: `id=eq.${id}` },             () => { toast.info("Complaint updated"); refetch(); })
      .on("postgres_changes", { event: "INSERT",  schema: "public", table: "complaint_comments",      filter: `complaint_id=eq.${id}` },  () => { toast.success("New message"); refetch(); })
      .on("postgres_changes", { event: "INSERT",  schema: "public", table: "complaint_status_history",filter: `complaint_id=eq.${id}` },  () => { refetch(); })
      .subscribe();
    return () => { supa.removeChannel(ch); };
  }, [id, refetch, supa]);

  const computed = useMemo(() => {
    if (!complaint) return null;
    const isResolved  = ["resolved", "closed"].includes(complaint.status);
    const submitted   = new Date(complaint.submitted_at).getTime();
    const due         = complaint.sla_due_at ? new Date(complaint.sla_due_at).getTime() : submitted + 7 * 86400000;
    const resolvedAt  = isResolved ? new Date(complaint.resolved_at || complaint.updated_at).getTime() : Date.now();
    const slaProgress = Math.min(Math.max(((resolvedAt - submitted) / (due - submitted)) * 100, 0), 100);
    const isOverdue   = Date.now() > due && !isResolved;
    const days        = Math.max(0, Math.ceil((due - Date.now()) / 86400000));
    return { isResolved, isOverdue, slaProgress, due, days };
  }, [complaint]);

  const workPhotos = useMemo(() =>
    complaint?.workLogs ? (complaint.workLogs as any[]).flatMap(l => l.photo_urls || []) : [],
    [complaint]
  );

  if (isLoading) return <DetailSkeleton />;

  if (!complaint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-xl p-10 text-center max-w-sm space-y-4">
          <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Complaint Not Found</h2>
            <p className="text-sm text-muted-foreground mt-1">This complaint doesn't exist or you lack permission to view it.</p>
          </div>
          <button onClick={() => router.push("/staff/dashboard")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const s = STATUS[complaint.status as keyof typeof STATUS] ?? { label: complaint.status ?? "Unknown", icon: AlertCircle, dot: "bg-muted-foreground", pill: "bg-muted text-muted-foreground", barCls: "bg-muted-foreground" };
  const p = PRIORITY[complaint.priority as keyof typeof PRIORITY] ?? { label: complaint.priority ?? "Normal", icon: AlertCircle, pill: "bg-muted text-muted-foreground border border-border" };
  const PIcon = p.icon;
  const staff = complaint.assigned_staff_profile;
  const citizen = complaint.citizen?.profile;

  const TABS = [
    { id: "overview",      label: "Overview",  icon: FileText    },
    { id: "timeline",      label: "Timeline",  icon: BarChart3   },
    { id: "communication", label: "Messages",  icon: MessageSquare },
  ] as const;

  const META = [
    { label: "Category",   value: complaint.category?.name  ?? "Uncategorized",                          icon: FileText  },
    { label: "Department", value: complaint.department?.name ?? "Unassigned",                             icon: Building2 },
    { label: "Submitted",  value: format(new Date(complaint.submitted_at), "MMM dd, yyyy"),               icon: Calendar  },
    { label: "Ward",       value: `Ward ${complaint.ward?.ward_number ?? "N/A"}`,                         icon: MapPin    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans pb-12">

      {/* ── Nav Bar ── */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors py-2 pl-0 pr-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => refetch()} disabled={isRefetching}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-40 shadow-xs">
              <RefreshCw className={cn("w-3.5 h-3.5", isRefetching && "animate-spin")} /> Refresh
            </button>
            <button onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-xs">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="bg-card border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

          {/* Status + priority pills */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-border", s.pill)}>
              <span className={cn("w-2 h-2 rounded-full shrink-0", s.dot)} />
              {s.label}
            </span>
            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider", p.pill)}>
              <PIcon className="w-3.5 h-3.5 shrink-0" /> {p.label} Priority
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-foreground leading-tight tracking-tight">
            {complaint.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground py-2 font-medium">
            <span className="inline-flex items-center gap-1.5 font-mono font-black bg-muted px-3 py-1 rounded border border-border text-foreground tracking-tight">
              <FileCheck className="w-4 h-4 text-primary" />
              {complaint.tracking_code}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {complaint.updated_at && !isNaN(new Date(complaint.updated_at).getTime())
                ? `Updated ${formatDistanceToNow(new Date(complaint.updated_at))} ago`
                : "Recently updated"}
            </span>
            <span className="ml-auto inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Live View</span>
            </span>
          </div>

          {/* Quick stats grid */}
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

        {/* Tab bar */}
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

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* OVERVIEW */}
            {tab === "overview" && <>
              {/* Description */}
              <Card icon={FileText} title="Complaint Details">
                <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>
                {complaint.location_point && (
                   <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                     <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                       <MapPin className="w-4 h-4 text-primary" />
                       <span className="truncate max-w-[200px]">{complaint.address_text || "Location attached"}</span>
                     </div>
                     <button onClick={() => window.open(`https://www.google.com/maps?q=${complaint.location_point.coordinates[1]},${complaint.location_point.coordinates[0]}`, "_blank")} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-wider">
                       View Map <ArrowLeft className="w-3 h-3 rotate-135" />
                     </button>
                   </div>
                )}
              </Card>

              {/* Citizen Evidence */}
              {(complaint.attachments || []).length > 0 && (
                <Card icon={Paperclip} title="Citizen Evidence" badge={(complaint.attachments || []).length}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {complaint.attachments.map((f: any, i: number) => (
                      <button key={f.id} onClick={() => setLightbox(f.file_path)}
                        className="group relative aspect-video rounded-xl overflow-hidden border border-border hover:border-primary transition-all shadow-xs">
                        <img src={f.file_path} alt={`Evidence ${i + 1}`} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Staff Work Logs */}
              {workPhotos.length > 0 && (
                <Card icon={Camera} title="Field Work Photos" badge={workPhotos.length}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {workPhotos.map((url: string, i: number) => (
                      <button key={i} onClick={() => setLightbox(url)}
                        className="group relative aspect-video rounded-xl overflow-hidden border border-border hover:border-primary transition-all shadow-xs">
                        <img src={url} alt={`Work ${i + 1}`} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </>}

            {/* TIMELINE */}
            {tab === "timeline" && (
              <Card icon={BarChart3} title="Complaint Tracking History">
                {(complaint.history || []).length === 0
                  ? <p className="text-sm font-medium text-muted-foreground text-center py-10">No history available yet.</p>
                  : (complaint.history || []).map((h: any, i: number) => {
                    const isLast = i === (complaint.history?.length ?? 0) - 1;
                    const cfg = STATUS[h.new_status as keyof typeof STATUS] ?? { label: h.new_status, icon: Activity, barCls: "bg-muted-foreground" };
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className={cn(
                        "relative pl-12 pb-8",
                        !isLast && "before:absolute before:left-[19px] before:top-10 before:bottom-0 before:w-0.5 before:bg-border"
                      )}>
                        <div className={cn("absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm shadow-sm", cfg.barCls)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1.5 mb-2">
                          <span className="font-black text-base text-foreground tracking-tight capitalize">
                            {h.new_status.replace(/_/g, " ")}
                          </span>
                          <span className="text-eyebrow text-muted-foreground bg-muted px-2.5 py-1 rounded border border-border w-fit">
                            {format(new Date(h.created_at), "MMM dd, yyyy · h:mm a")}
                          </span>
                        </div>
                        {h.note && (
                          <p className="mt-2 text-sm text-foreground bg-muted/40 rounded-xl px-4 py-3 border border-border leading-relaxed font-medium">
                            "{h.note}"
                          </p>
                        )}
                      </div>
                    );
                  })}
              </Card>
            )}

            {/* COMMUNICATION */}
            {tab === "communication" && user?.id && (
              <div className="space-y-6">
                <Card icon={MessageSquare} title="Public Citizen Discussion">
                  <div className="h-[500px] flex flex-col -m-5">
                    <UniversalMessaging
                        channelType="COMPLAINT_PUBLIC"
                        channelId={id}
                        currentUserId={user.id}
                        currentUserRole="staff"
                        variant="default"
                        title=""
                        subtitle=""
                        className="h-full border-0 rounded-none bg-transparent"
                    />
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

             {/* SLA Card */}
            {computed && (
              <Card icon={Clock} title="Resolution SLA Timeline">
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="text-eyebrow text-muted-foreground">Due Date</span>
                    <span className="font-black text-foreground tracking-tight">{format(computed.due, "MMM dd, yyyy")}</span>
                  </div>
                  {!computed.isResolved && (
                    <div className="flex items-center justify-between">
                      <span className="text-eyebrow text-muted-foreground">Time Remaining</span>
                      <span className={cn("font-black tracking-tight",
                        computed.isOverdue ? "text-destructive" :
                        computed.days <= 2  ? "text-amber-600 dark:text-amber-400" :
                        "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {computed.isOverdue ? "Overdue" : `${computed.days} Days`}
                      </span>
                    </div>
                  )}
                  <div className="space-y-2 pt-2">
                    <Progress value={computed.slaProgress} className="h-2 rounded-full" />
                    <div className="flex justify-between text-eyebrow text-muted-foreground">
                      <span>Submitted</span>
                      <span>{Math.round(computed.slaProgress)}%</span>
                      <span>Due</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Citizen Panel */}
            <Card icon={User} title="Citizen Contact">
              {citizen ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xl shrink-0">
                      {citizen.full_name?.charAt(0).toUpperCase() ?? "C"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-base text-foreground truncate tracking-tight">{citizen.full_name ?? "Citizen"}</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Complainant</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border space-y-3">
                     {citizen.phone && (
                       <a href={`tel:${citizen.phone}`} className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                         <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                           <Phone className="w-4 h-4 text-primary" />
                         </div>
                         {citizen.phone}
                       </a>
                     )}
                     {citizen.email && (
                       <a href={`mailto:${citizen.email}`} className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors truncate">
                         <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                           <Mail className="w-4 h-4 text-primary" />
                         </div>
                         <span className="truncate">{citizen.email}</span>
                       </a>
                     )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Anonymous Citizen</p>
                </div>
              )}
            </Card>

            {/* Assigned Staff */}
            <Card icon={Shield} title="Assigned Handling Staff">
              {staff ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-black shadow-xs shrink-0">
                      {staff.full_name?.charAt(0) ?? "S"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-base text-foreground truncate tracking-tight">{staff.full_name ?? "Staff Member"}</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 mt-0.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                        {staff.staff?.staff_role?.replace(/_/g, " ") ?? "Assigned Staff"}
                      </p>
                    </div>
                  </div>
                  {staff.staff?.staff_code && (
                    <div className="flex items-center justify-between bg-muted border border-border rounded-lg px-4 py-3">
                      <span className="text-eyebrow text-muted-foreground">Staff Code</span>
                      <span className="font-mono font-black text-sm text-foreground">{staff.staff.staff_code}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Pending Assignment</p>
                </div>
              )}
            </Card>

          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-6"
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)}
              className="absolute -top-12 right-0 text-muted-foreground hover:text-foreground transition-colors bg-card rounded-full p-2 border border-border">
              <XCircle className="w-6 h-6" />
            </button>
            <img src={lightbox} alt="Full screen preview" className="w-full max-h-[85vh] object-contain rounded-2xl shadow-xl ring-1 ring-border" />
          </div>
        </div>
      )}
    </div>
  );
}
