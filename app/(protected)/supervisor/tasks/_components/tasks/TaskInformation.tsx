import { MapPin, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { SLACountdown } from "@/components/supervisor/shared/SLACountdown";

export function TaskInformation({ task }: { task: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h2>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Assigned To</p>
              <p className="text-sm font-medium text-gray-900">{task.assignee?.name || "Unassigned"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Due Date</p>
              <p className="text-sm font-medium text-gray-900">{format(new Date(task.due_date), "PP p")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Time Remaining</p>
              <div className="mt-1">
                 <SLACountdown deadline={task.due_date} status={task.status} />
              </div>
            </div>
          </div>
          
          {/* Location Mock */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Location</p>
              <p className="text-sm font-medium text-gray-900">Ward {task.ward?.ward_number || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}