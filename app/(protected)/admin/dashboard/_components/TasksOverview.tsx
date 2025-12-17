import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskSummary } from "@/lib/types/admin";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { AlertOctagon, Clock, CheckSquare, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TasksOverview({ tasks }: { tasks: TaskSummary[] }) {
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-pink-50">
              <CheckSquare className="w-5 h-5 text-pink-600" />
            </div>
            Urgent Tasks
          </CardTitle>
          <Badge 
            variant={tasks.length > 0 ? "default" : "outline"} 
            className="text-xs font-semibold"
          >
            {tasks.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`
                  relative flex flex-col p-4 rounded-xl border-2 
                  transition-all duration-200
                  hover:shadow-md cursor-pointer
                  ${task.is_breached 
                    ? 'bg-red-50/50 border-red-200 hover:border-red-300' 
                    : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                  }
                `}
              >
                {/* Task Header */}
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 leading-snug">
                    {task.title}
                  </h4>
                  {task.is_breached && (
                    <Badge 
                      variant="destructive" 
                      className="text-[10px] px-2 py-0.5 h-5 gap-1 shrink-0 shadow-sm"
                    >
                      <AlertOctagon className="w-3 h-3" />
                      Overdue
                    </Badge>
                  )}
                </div>
                
                {/* Task Metadata */}
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-medium">{task.assignee}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className={`w-3.5 h-3.5 ${task.is_breached ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className={`font-medium ${task.is_breached ? 'text-red-700' : 'text-gray-600'}`}>
                      {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Urgency indicator bar */}
                {task.is_breached && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-red-400 to-red-600 rounded-b-xl" />
                )}
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No urgent tasks at the moment</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}