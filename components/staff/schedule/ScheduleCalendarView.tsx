"use client";

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isSameMonth, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

interface ScheduleItem {
  id: string;
  date: Date;
  type: 'shift' | 'task' | 'leave' | 'training';
  title: string;
  time?: string;
  status?: string;
}

interface Props {
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day';
  items: ScheduleItem[];
  onItemClick?: (item: ScheduleItem) => void;
}

export function ScheduleCalendarView({ currentDate, viewMode, items, onItemClick }: Props) {
  
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-500">
            {day}
          </div>
        ))}
        {days.map(day => {
          const dayItems = items.filter(i => isSameDay(new Date(i.date), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "bg-white min-h-[100px] p-2 flex flex-col gap-1 transition-colors hover:bg-gray-50",
                !isCurrentMonth && "bg-gray-50/50 text-gray-400"
              )}
            >
              <span className={cn(
                "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                isToday ? "bg-blue-600 text-white" : "text-gray-700"
              )}>
                {format(day, 'd')}
              </span>
              
              <div className="space-y-1">
                {dayItems.slice(0, 3).map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => onItemClick?.(item)}
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer",
                      item.type === 'shift' ? "bg-green-100 text-green-800" :
                      item.type === 'leave' ? "bg-red-100 text-red-800" :
                      item.type === 'task' ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    )}
                  >
                    {item.title}
                  </div>
                ))}
                {dayItems.length > 3 && (
                  <span className="text-[10px] text-gray-400 pl-1">+{dayItems.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden h-[600px]">
        {days.map(day => {
          const dayItems = items.filter(i => isSameDay(new Date(i.date), day));
          const isToday = isSameDay(day, new Date());

          return (
             <div key={day.toISOString()} className="bg-white flex flex-col">
               <div className={cn("p-2 text-center border-b border-gray-100", isToday && "bg-blue-50")}>
                 <span className="text-xs font-semibold text-gray-500 block">{format(day, 'EEE')}</span>
                 <span className={cn("text-sm font-bold", isToday ? "text-blue-600" : "text-gray-900")}>
                   {format(day, 'd')}
                 </span>
               </div>
               <div className="flex-1 p-1 space-y-2 overflow-y-auto">
                 {dayItems.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => onItemClick?.(item)}
                      className={cn(
                        "p-2 rounded border text-xs cursor-pointer hover:opacity-80",
                        item.type === 'shift' ? "bg-green-50 border-green-100 text-green-900" :
                        item.type === 'leave' ? "bg-red-50 border-red-100 text-red-900" :
                        "bg-blue-50 border-blue-100 text-blue-900"
                      )}
                    >
                      <div className="font-semibold mb-0.5">{item.time || "All Day"}</div>
                      <div className="truncate">{item.title}</div>
                    </div>
                 ))}
               </div>
             </div>
          )
        })}
      </div>
    );
  };

  // Simplified Day View (List style for now)
  const renderDayView = () => {
    const dayItems = items.filter(i => isSameDay(new Date(i.date), currentDate));
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[500px]">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
           <h3 className="font-semibold text-gray-900">{format(currentDate, "EEEE, MMMM do")}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {dayItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No events scheduled for this day.</div>
          ) : (
            dayItems.map((item, idx) => (
               <div key={idx} className="p-4 flex gap-4 hover:bg-gray-50">
                  <div className="w-16 text-xs font-medium text-gray-500 pt-1">
                    {item.time || "All Day"}
                  </div>
                  <div className={cn(
                    "flex-1 p-3 rounded-lg border-l-4",
                    item.type === 'shift' ? "border-green-500 bg-green-50" :
                    item.type === 'leave' ? "border-red-500 bg-red-50" :
                    "border-blue-500 bg-blue-50"
                  )}>
                    <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 capitalize">{item.type} • {item.status || "Scheduled"}</p>
                  </div>
               </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
}