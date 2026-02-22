import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { staffApi } from "@/features/staff";
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  Hourglass,
  Palmtree,
} from "lucide-react";
import { differenceInDays, format, parseISO, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function LeaveDashboardPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // 1. Fetch Fresh Data (Parallel)
  const [balance, activeRequests, historyRequests] = await Promise.all([
    staffApi.getLeaveBalance(supabase, user.id),
    staffApi.getActiveRequests(supabase, user.id),
    staffApi.getRequestHistory(supabase, user.id),
  ]);

  // 2. Logic: Are we currently on an approved leave today?
  const today = new Date();
  const currentLeave = historyRequests.find(
    (r) =>
      r.status === "approved" &&
      isWithinInterval(today, {
        start: parseISO(r.start_date),
        end: parseISO(r.end_date),
      })
  );

  return (
    <div className="space-y-6 pb-24 max-w-[1600px] mx-auto p-4 md:p-6 animate-in fade-in duration-700">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground uppercase">
            Leave Management
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Check your remaining balance and application history.
          </p>
        </div>
        <Link
          href="/staff/leave/request"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95 text-xs"
        >
          <Plus className="w-5 h-5" /> Apply for Leave
        </Link>
      </div>

      {/* "On Leave" Banner */}
      {currentLeave && (
        <div className="bg-linear-to-r from-primary to-info-blue rounded-2xl p-6 md:p-8 text-primary-foreground shadow-xl flex items-center gap-5 border-b-4 border-black/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-white/5 skew-x-12 transition-transform group-hover:translate-x-10" />
          <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
            <Palmtree className="h-9 w-9 text-white animate-bounce" />
          </div>
          <div className="relative z-10">
            <h3 className="font-black text-xl uppercase tracking-tighter">
              Status: On Leave
            </h3>
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">
              You are currently on {currentLeave.type} leave. Return date:{" "}
              <span className="text-white bg-black/20 px-2 py-0.5 rounded ml-1">
                {format(parseISO(currentLeave.end_date), "EEEE, MMM do")}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Balance Cards (These will now update correctly due to the SQL Trigger) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <BalanceCard
          title="Casual Leave"
          total={balance.casual_allowed}
          used={balance.casual_used}
          color="blue"
        />
        <BalanceCard
          title="Sick Leave"
          total={balance.sick_allowed}
          used={balance.sick_used}
          color="emerald"
        />
        <BalanceCard
          title="Annual Leave"
          total={balance.annual_allowed}
          used={balance.annual_used}
          color="purple"
        />
      </div>

      {/* Request Tabs (Pending vs History) */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <Tabs defaultValue="active" className="w-full">
          <div className="bg-muted/30 px-4 py-3 border-b border-border">
            <TabsList className="bg-muted border border-border p-1">
              <TabsTrigger
                value="active"
                className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs font-bold text-xs uppercase tracking-widest"
              >
                <Hourglass className="w-3.5 h-3.5" /> Pending (
                {activeRequests.length})
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs font-bold text-xs uppercase tracking-widest"
              >
                <History className="w-3.5 h-3.5" /> History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="p-0 m-0">
            <RequestListUI
              requests={activeRequests}
              emptyMessage="No active pending requests."
            />
          </TabsContent>

          <TabsContent value="history" className="p-0 m-0">
            <RequestListUI
              requests={historyRequests}
              emptyMessage="No previous leave history found."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function RequestListUI({
  requests,
  emptyMessage,
}: {
  requests: any[];
  emptyMessage: string;
}) {
  if (requests.length === 0) {
    return (
      <div className="p-20 text-center text-muted-foreground/30 flex flex-col items-center gap-4">
        <Calendar className="w-16 h-16 opacity-10" />
        <p className="text-xs font-black uppercase tracking-widest italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {requests.map((req) => {
        const days =
          differenceInDays(parseISO(req.end_date), parseISO(req.start_date)) +
          1;
        return (
          <div
            key={req.id}
            className="p-6 sm:px-10 hover:bg-muted/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 group active:scale-[0.995]"
          >
            <div className="flex items-start gap-4">
              <StatusIcon status={req.status} />
              <div>
                <div className="flex items-center gap-3 mb-1">
                   <h4 className="font-black text-foreground uppercase text-xs tracking-tight">
                    {req.type} Leave
                  </h4>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-lg font-black uppercase tracking-tighter border border-primary/10">
                    {days} {days === 1 ? "Day" : "Days"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-tight">
                  {format(parseISO(req.start_date), "MMM d")} —{" "}
                  {format(parseISO(req.end_date), "MMM d, yyyy")}
                </p>
                {req.reason && (
                  <p className="text-xs text-muted-foreground/60 mt-2 italic border-l-2 border-border pl-3 line-clamp-1 group-hover:line-clamp-none transition-all">
                    "{req.reason}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 pt-4 sm:pt-0 border-border">
              <div className="text-right">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-current/10",
                    req.status === "approved"
                        ? "bg-success-green/10 text-success-green"
                        : req.status === "rejected"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning-amber/10 text-warning-amber"
                  )}
                >
                  {req.status}
                </span>
                <p className="text-xs text-muted-foreground mt-2 font-black uppercase tracking-widest opacity-40">
                  Updated:{" "}
                  {format(
                    parseISO(req.updated_at || req.created_at),
                    "MMM d, HH:mm"
                  )}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BalanceCard({ title, total, used, color }: any) {
  // Ensure we don't show negative numbers if data is weird
  const remaining = Math.max(0, total - used); 
  const percentage = Math.min(100, (used / total) * 100);

  const styles: any = {
    blue: {
      bar: "bg-info-blue",
      iconBg: "bg-info-blue/10",
      iconText: "text-info-blue",
    },
    emerald: {
      bar: "bg-success-green",
      iconBg: "bg-success-green/10",
      iconText: "text-success-green",
    },
    purple: {
      bar: "bg-primary",
      iconBg: "bg-primary/10",
      iconText: "text-primary",
    },
  };
  const theme = styles[color] || styles.blue;

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-xs relative group transition-all hover:shadow-md hover:border-border/80 active:scale-[0.99]">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-60">
          {title}
        </span>
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center ${theme.iconBg} group-hover:scale-110 transition-transform border border-current/10 shadow-inner`}
        >
          <Calendar className={`w-5 h-5 ${theme.iconText}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
          {remaining}
        </span>
        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-50">
          Days Left
        </span>
      </div>
      <div className="mt-5 h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
        <div
          className={`h-full rounded-full ${theme.bar} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-4 flex justify-between text-xs font-black text-muted-foreground uppercase tracking-widest opacity-50">
        <span>Used: {used}</span>
        <span>Total: {total}</span>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "approved")
    return (
      <div className="p-3 bg-success-green/10 rounded-2xl border border-success-green/20">
        <CheckCircle2 className="w-6 h-6 text-success-green" />
      </div>
    );
  if (status === "rejected")
    return (
      <div className="p-3 bg-destructive/10 rounded-2xl border border-destructive/20">
        <XCircle className="w-6 h-6 text-destructive" />
      </div>
    );
  return (
    <div className="p-3 bg-warning-amber/10 rounded-2xl border border-warning-amber/20">
      <Hourglass className="w-6 h-6 text-warning-amber animate-spin duration-3000" />
    </div>
  );
}