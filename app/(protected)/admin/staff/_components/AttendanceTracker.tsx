import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

export function AttendanceTracker({ logs }: { logs: any[] }) {
  return (
     <div className="bg-white rounded-lg border p-4 shadow-sm">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
           <CalendarDays className="w-4 h-4 text-blue-500"/> Recent Attendance
        </h3>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
           {logs.map((log) => (
              <div key={log.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                 <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{format(new Date(log.date), "EEE, MMM d")}</span>
                    <span className="text-xs text-gray-500">
                       In: {log.check_in_time ? format(new Date(log.check_in_time), "h:mm a") : '-'}
                    </span>
                 </div>
                 <div className="text-right">
                    <div className="font-mono font-bold text-slate-700">{log.total_hours_worked || 0} hrs</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${log.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                       {log.status}
                    </span>
                 </div>
              </div>
           ))}
           {logs.length === 0 && <p className="text-gray-500 text-sm py-4 text-center">No attendance records found.</p>}
        </div>
     </div>
  );
}