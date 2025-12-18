import { AdminTask } from "@/types/admin-tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { format, isPast } from "date-fns";

interface TasksTableProps {
  data: AdminTask[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export function TasksTable({ data, onStatusChange, onDelete }: TasksTableProps) {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
          <tr>
            <th className="px-6 py-3">Task</th>
            <th className="px-6 py-3">Assignee</th>
            <th className="px-6 py-3">Priority</th>
            <th className="px-6 py-3">Deadline</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((task) => {
             const isOverdue = isPast(new Date(task.due_date)) && task.status !== 'completed';
             return (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{task.title}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">{task.description}</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-1">{task.tracking_code}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee?.avatar_url} />
                      <AvatarFallback>{task.assignee?.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[120px]">{task.assignee?.full_name || "Unassigned"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <BadgePriority priority={task.priority} />
                </td>
                <td className="px-6 py-4">
                   <div className={isOverdue ? "text-red-600 font-bold" : "text-gray-700"}>
                      {format(new Date(task.due_date), "MMM d, yyyy")}
                   </div>
                </td>
                <td className="px-6 py-4">
                   <Select 
                     defaultValue={task.status} 
                     onValueChange={(val) => onStatusChange(task.id, val)}
                   >
                      <SelectTrigger className="h-8 w-[130px] bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                   </Select>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                   <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/tasks/${task.id}`}><Eye className="h-4 w-4 text-gray-500" /></Link>
                   </Button>
                   <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                   </Button>
                </td>
              </tr>
             )
          })}
        </tbody>
      </table>
      {data.length === 0 && <div className="p-8 text-center text-gray-500">No tasks found.</div>}
    </div>
  );
}

function BadgePriority({ priority }: { priority: string }) {
   const styles: any = {
      critical: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-blue-50 text-blue-800 border-blue-200",
      low: "bg-gray-100 text-gray-800 border-gray-200"
   };
   return <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${styles[priority]}`}>{priority}</span>;
}