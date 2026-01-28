import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { staffLeaveQueries } from "@/lib/supabase/queries/staff-leave";
import { Plus, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

export const dynamic = "force-dynamic";

export default async function LeaveDashboardPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Parallel data fetching for performance
  const [balance, requests] = await Promise.all([
    staffLeaveQueries.getMyBalance(supabase, user.id),
    staffLeaveQueries.getMyRequests(supabase, user.id),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground mt-1">
            Track your available days and submit time-off requests.
          </p>
        </div>

        <Link
          href="/staff/leave/request"
          className="btn-gov btn-gov-primary flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Request History List */}
      <div className="stone-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Request History</h3>
        </div>

        <div className="divide-y divide-border/60">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="w-6 h-6 opacity-50" />
              </div>
              <p>No leave requests found.</p>
            </div>
          ) : (
            requests.map((req: any) => {
               // Calculate days for display (End - Start + 1)
               const days = differenceInDays(parseISO(req.end_date), parseISO(req.start_date)) + 1;

               return (
                <div
                  key={req.id}
                  className="p-4 sm:px-6 hover:bg-muted/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <StatusIcon status={req.status} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold capitalize text-foreground">
                          {req.type} Leave
                        </h4>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-md font-medium border border-border">
                          {days} {days === 1 ? "Day" : "Days"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(parseISO(req.start_date), "MMM d, yyyy")} -{" "}
                        {format(parseISO(req.end_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className={`font-bold uppercase text-xs tracking-wider ${getStatusColor(req.status)}`}>
                        {req.status}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Applied {format(parseISO(req.created_at), "MMM d")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function BalanceCard({ title, total, used, color }: { title: string; total: number; used: number; color: string }) {
  const remaining = Math.max(0, total - used);
  const percentage = Math.min(100, (used / total) * 100);

  const colors: any = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  };

  const progressColors: any = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="stone-card p-6 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold tabular-nums">
            {remaining}
          </h3>
        </div>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colors[color]}`}>
          <Calendar className="w-5 h-5 opacity-80" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${progressColors[color]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>Used: {used}</span>
          <span>Total: {total}</span>
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full"><CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>;
    case "rejected":
      return <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"><XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /></div>;
    default:
      return <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full"><Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "approved": return "text-emerald-600 dark:text-emerald-400";
    case "rejected": return "text-red-600 dark:text-red-400";
    default: return "text-amber-600 dark:text-amber-400";
  }
}