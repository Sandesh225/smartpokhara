import { format } from "date-fns";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface Log {
  id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  total_hours_worked: number;
}

export function AttendanceHistoryList({ logs }: { logs: Log[] }) {
  if (logs.length === 0) return <div className="text-center py-10 text-gray-400">No history found.</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {logs.map((log) => (
          <div key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                 {log.check_in_time ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-400" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(log.date), "MMM d, yyyy")}
                </p>
                <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                  <span>In: {log.check_in_time ? format(new Date(log.check_in_time), "h:mm a") : "--"}</span>
                  <span>Out: {log.check_out_time ? format(new Date(log.check_out_time), "h:mm a") : "--"}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs font-mono font-medium text-gray-700">
                 <Clock className="w-3 h-3 text-gray-400" />
                 {log.total_hours_worked ? log.total_hours_worked.toFixed(1) + 'h' : '-'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}