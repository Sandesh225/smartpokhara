import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { staffLeaveQueries } from "@/lib/supabase/queries/staff-leave";
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
import { format, differenceInDays, parseISO, isWithinInterval } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function LeaveDashboardPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // 1. Fetch Fresh Data (Parallel)
  const [balance, activeRequests, historyRequests] = await Promise.all([
    staffLeaveQueries.getMyBalance(supabase, user.id),
    staffLeaveQueries.getActiveRequests(supabase, user.id),
    staffLeaveQueries.getRequestHistory(supabase, user.id),
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
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto p-4 md:p-6 animate-in fade-in duration-700">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Leave Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Check your remaining balance and application history.
          </p>
        </div>
        <Link
          href="/staff/leave/request"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Apply for Leave
        </Link>
      </div>

      {/* "On Leave" Banner */}
      {currentLeave && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl flex items-center gap-5 border-b-4 border-emerald-800/20">
          <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Palmtree className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-xl uppercase tracking-wide">
              Status: On Leave
            </h3>
            <p className="text-emerald-50 text-sm opacity-90">
              You are currently on {currentLeave.type} leave. Return date:{" "}
              <strong>
                {format(parseISO(currentLeave.end_date), "EEEE, MMM do")}
              </strong>
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <Tabs defaultValue="active" className="w-full">
          <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200">
            <TabsList className="bg-white border border-gray-200 p-1">
              <TabsTrigger
                value="active"
                className="gap-2 px-4 data-[state=active]:bg-gray-100 data-[state=active]:text-blue-700"
              >
                <Hourglass className="w-4 h-4" /> Pending (
                {activeRequests.length})
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="gap-2 px-4 data-[state=active]:bg-gray-100 data-[state=active]:text-blue-700"
              >
                <History className="w-4 h-4" /> History
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
      <div className="p-16 text-center text-gray-400 flex flex-col items-center gap-3">
        <Calendar className="w-12 h-12 opacity-10" />
        <p className="text-sm italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {requests.map((req) => {
        const days =
          differenceInDays(parseISO(req.end_date), parseISO(req.start_date)) +
          1;
        return (
          <div
            key={req.id}
            className="p-5 sm:px-8 hover:bg-blue-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <StatusIcon status={req.status} />
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-gray-900 capitalize">
                    {req.type} Leave
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-black uppercase tracking-tighter border border-blue-100">
                    {days} {days === 1 ? "Day" : "Days"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  {format(parseISO(req.start_date), "MMM d")} —{" "}
                  {format(parseISO(req.end_date), "MMM d, yyyy")}
                </p>
                {req.reason && (
                  <p className="text-xs text-gray-400 mt-2 italic border-l-2 border-gray-200 pl-3">
                    "{req.reason}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 pt-4 sm:pt-0">
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest
                    ${
                      req.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : req.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                >
                  {req.status}
                </span>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">
                  Updated:{" "}
                  {format(
                    parseISO(req.updated_at || req.created_at),
                    "yyyy-MM-dd HH:mm"
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
      bar: "bg-blue-500",
      iconBg: "bg-blue-50",
      iconText: "text-blue-600",
    },
    emerald: {
      bar: "bg-emerald-500",
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
    },
    purple: {
      bar: "bg-purple-500",
      iconBg: "bg-purple-50",
      iconText: "text-purple-600",
    },
  };
  const theme = styles[color] || styles.blue;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group hover:border-blue-300 transition-all">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
          {title}
        </span>
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center ${theme.iconBg} group-hover:scale-110 transition-transform`}
        >
          <Calendar className={`w-5 h-5 ${theme.iconText}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-gray-900 tabular-nums">
          {remaining}
        </span>
        <span className="text-sm font-bold text-gray-400 uppercase tracking-tighter">
          Days Left
        </span>
      </div>
      <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${theme.bar} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-[10px] font-bold text-gray-400 uppercase">
        <span>Used: {used}</span>
        <span>Total: {total}</span>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "approved")
    return (
      <div className="p-2.5 bg-emerald-50 rounded-2xl">
        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
      </div>
    );
  if (status === "rejected")
    return (
      <div className="p-2.5 bg-red-50 rounded-2xl">
        <XCircle className="w-6 h-6 text-red-600" />
      </div>
    );
  return (
    <div className="p-2.5 bg-amber-50 rounded-2xl">
      <Hourglass className="w-6 h-6 text-amber-600 animate-pulse" />
    </div>
  );
}