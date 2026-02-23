"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft, Building2, Calendar, CheckCircle2, Clock, FileText,
  Activity, User, AlertCircle, CheckCircle, XCircle, Eye, TrendingUp,
  Paperclip, BarChart3, FileCheck, Zap, BadgeCheck, Camera,
  Image as ImageIcon, Printer, RefreshCw, MessageSquare, MapPin, Shield,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useComplaint } from "@/features/complaints/hooks/useComplaint";
import { useCurrentUser } from "@/features/users/hooks/useCurrentUser";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import CitizenStaffCommunication from "../_components/CitizenStaffCommunication";
import StaffCommunication from "../_components/StaffCommunication";

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
    <div className={cn("bg-card border border-border rounded-xl overflow-hidden", className)}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border">
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
export default function ComplaintDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params.id as string;
  const supa    = createClient();

  const { data: user }      = useCurrentUser();
  const { data: complaint, isLoading, isRefetching, refetch } = useComplaint(id);

  useEffect(() => {
    if (complaint) {
      console.log("[DEBUG] Raw Complaint Record:", complaint);
      console.log("[DEBUG] assigned_staff_profile:", (complaint as any).assigned_staff_profile);
      console.log("[DEBUG] assigned_staff (direct join):", (complaint as any).assigned_staff);
      console.log("[DEBUG] assigned_staff_id:", (complaint as any).assigned_staff_id);
    }
  }, [complaint]);

  const [tab, setTab]                 = useState<"overview" | "timeline" | "communication">("overview");
  const [lightbox, setLightbox]       = useState<string | null>(null);

  // Real-time
  useEffect(() => {
    if (!id) return;
    const ch = supa.channel(`cd-${id}`)
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
          <div className="w-14 h-14 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Not Found</h2>
            <p className="text-sm text-muted-foreground mt-1">This complaint doesn't exist or was removed.</p>
          </div>
          <button onClick={() => router.push("/citizen/complaints")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const s = STATUS[complaint.status as keyof typeof STATUS] ?? { label: complaint.status ?? "Unknown", icon: AlertCircle, dot: "bg-muted-foreground", pill: "bg-muted text-muted-foreground", barCls: "bg-muted-foreground" };
  const p = PRIORITY[complaint.priority as keyof typeof PRIORITY] ?? { label: complaint.priority ?? "Normal", icon: AlertCircle, pill: "bg-muted text-muted-foreground border border-border" };
  const PIcon = p.icon;
  const staff = complaint.assigned_staff_profile;

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
    <div className="min-h-screen bg-background font-sans">

      {/* ── Nav Bar ── */}
      <header className=" top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Complaints
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} disabled={isRefetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-40">
              <RefreshCw className={cn("w-3.5 h-3.5", isRefetching && "animate-spin")} /> Refresh
            </button>
            <button onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-7 space-y-5">

          {/* Status + priority pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold", s.pill)}>
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
              {s.label}
            </span>
            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold", p.pill)}>
              <PIcon className="w-3 h-3 shrink-0" /> {p.label} Priority
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground leading-snug tracking-tight">
            {complaint.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-mono font-bold bg-muted px-2.5 py-1 rounded-lg border border-border text-foreground">
              <FileCheck className="w-3.5 h-3.5 text-primary" />
              {complaint.tracking_code}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {complaint.updated_at && !isNaN(new Date(complaint.updated_at).getTime())
                ? `Updated ${formatDistanceToNow(new Date(complaint.updated_at))} ago`
                : "Recently updated"}
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Live</span>
            </span>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {META.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3 bg-muted/40 border border-border rounded-xl px-4 py-3">
                <div className="p-1.5 rounded-lg bg-accent shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-foreground truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit mb-6 border border-border">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as any)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
                tab === id
                  ? "bg-card text-foreground border border-border shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Main */}
          <div className="xl:col-span-2 space-y-5">

            {/* OVERVIEW */}
            {tab === "overview" && <>

              {/* Description */}
              <Card icon={FileText} title="Description">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </Card>

              {/* Evidence */}
              {(complaint.attachments || []).length > 0 && (
                <Card icon={Paperclip} title="Evidence Photos" badge={(complaint.attachments || []).length}>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {complaint.attachments.map((f: any, i: number) => (
                      <button key={f.id} onClick={() => setLightbox(f.file_path)}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors">
                        <img src={f.file_path} alt={`Evidence ${i + 1}`} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/25 transition-colors flex items-center justify-center">
                          <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Work photos */}
              {workPhotos.length > 0 && (
                <Card icon={Camera} title="Staff Work Photos" badge={workPhotos.length}>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {workPhotos.map((url: string, i: number) => (
                      <button key={i} onClick={() => setLightbox(url)}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-secondary transition-colors">
                        <img src={url} alt={`Work ${i + 1}`} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/25 transition-colors flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* SLA */}
              {computed && (
                <Card icon={Clock} title="Resolution Timeline">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Due Date</span>
                      <span className="font-semibold text-foreground">{format(computed.due, "MMMM dd, yyyy")}</span>
                    </div>
                    {!computed.isResolved && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Time Remaining</span>
                        <span className={cn("font-bold",
                          computed.isOverdue ? "text-destructive" :
                          computed.days <= 2  ? "text-amber-600 dark:text-amber-400" :
                          "text-emerald-600 dark:text-emerald-400"
                        )}>
                          {computed.isOverdue ? "Overdue" : `${computed.days} days left`}
                        </span>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Progress value={computed.slaProgress} className="h-2 rounded-full" />
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <span>Submitted</span>
                        <span>{Math.round(computed.slaProgress)}% complete</span>
                        <span>Due</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </>}

            {/* TIMELINE */}
            {tab === "timeline" && (
              <Card icon={BarChart3} title="Status History">
                {(complaint.history || []).length === 0
                  ? <p className="text-sm text-muted-foreground text-center py-8">No history yet.</p>
                  : (complaint.history || []).map((h: any, i: number) => {
                    const isLast = i === (complaint.history?.length ?? 0) - 1;
                    const cfg = STATUS[h.new_status as keyof typeof STATUS] ?? { label: h.new_status, icon: Activity, barCls: "bg-muted-foreground" };
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className={cn(
                        "relative pl-10 pb-6",
                        !isLast && "before:absolute before:left-[15px] before:top-8 before:bottom-0 before:w-px before:bg-border"
                      )}>
                        <div className={cn("absolute left-0 top-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs", cfg.barCls)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex items-start justify-between pt-1">
                          <span className="font-semibold text-sm text-foreground capitalize">
                            {h.new_status.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border shrink-0 ml-3">
                            {format(new Date(h.created_at), "MMM dd · HH:mm")}
                          </span>
                        </div>
                        {h.note && (
                          <p className="mt-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border leading-relaxed">
                            {h.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </Card>
            )}

            {/* COMMUNICATION */}
            {tab === "communication" && (
              staff && user?.id ? (
                <div className="space-y-5">
                  <CitizenStaffCommunication
                    complaintId={id}
                    currentUserId={user.id}
                    userRole="citizen"
                    assignedStaffName={staff.full_name || "Assigned Staff"}
                    citizenName={complaint.citizen?.profile?.full_name || "Citizen"}
                  />
                  {complaint.assigned_department_id && (
                    <div className="pt-5 border-t border-dashed border-border">
                      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                        <Shield className="w-3.5 h-3.5" /> Department Communication
                      </p>
                      <StaffCommunication complaintId={id} currentUserId={user.id} isStaff={false} />
                    </div>
                  )}
                </div>
              ) : (
                <Card icon={MessageSquare} title="Communication">
                  <div className="py-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-semibold text-sm text-foreground">No Staff Assigned Yet</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Messaging will be available once a staff member is assigned.
                    </p>
                  </div>
                </Card>
              )
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Staff */}
            <Card icon={Shield} title="Assigned Staff">
              {staff ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-base font-bold shrink-0">
                      {staff.full_name?.charAt(0) ?? "S"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{staff.full_name ?? "Staff"}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <BadgeCheck className="w-3 h-3 text-primary" />
                        {staff.staff?.staff_role?.replace(/_/g, " ") ?? "Staff Member"}
                      </p>
                    </div>
                  </div>
                  {staff.staff?.staff_code && (
                    <div className="flex items-center justify-between bg-muted/50 border border-border rounded-lg px-3 py-2">
                      <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Staff ID</span>
                      <span className="font-mono font-bold text-sm text-foreground">{staff.staff.staff_code}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">No staff assigned yet</p>
                </div>
              )}
            </Card>

            {/* Details */}
            <Card icon={FileText} title="Details">
              <div className="divide-y divide-border -mx-5 -mb-5">
                {[
                  { label: "Category",   value: complaint.category?.name   ?? "—", icon: FileText  },
                  { label: "Department", value: complaint.department?.name  ?? "—", icon: Building2 },
                  { label: "Ward",       value: `Ward ${complaint.ward?.ward_number ?? "—"}`, icon: MapPin },
                  { label: "Filed",      value: format(new Date(complaint.submitted_at), "MMM dd, yyyy"), icon: Calendar },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 px-5 py-2.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-semibold text-muted-foreground w-20 shrink-0">{label}</span>
                    <span className="text-xs font-bold text-foreground truncate ml-auto text-right">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-6"
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)}
              className="absolute -top-9 right-0 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
            <img src={lightbox} alt="Preview" className="w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}