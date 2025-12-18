import { format } from "date-fns";
import { Clock, MapPin } from "lucide-react";
import { PriorityIndicator } from "@/components/staff/shared/PriorityIndicator";

interface Props {
  date: Date;
  items: any[];
}

export function DayScheduleView({ date, items }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-bold text-gray-900">{format(date, "EEEE, MMMM do")}</h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {items.length === 0 && (
           <div className="p-12 text-center text-gray-400 text-sm">No schedule for today.</div>
        )}
        
        {items.map((item, i) => (
          <div key={i} className="flex p-4 hover:bg-gray-50 transition-colors group">
             <div className="w-20 pt-1 shrink-0 text-right pr-4 border-r border-gray-100">
               <span className="text-xs font-bold text-gray-900 block">{item.time}</span>
               <span className="text-[10px] text-gray-500 uppercase">{item.type}</span>
             </div>
             
             <div className="flex-1 pl-4">
                <div className="flex items-center gap-2 mb-1">
                   {item.priority && <PriorityIndicator priority={item.priority} size="sm" showLabel={false} />}
                   <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                   <div className="flex items-center gap-1">
                     <Clock className="w-3 h-3" /> <span>{item.time || "All Day"}</span>
                   </div>
                   {item.location && (
                     <div className="flex items-center gap-1">
                       <MapPin className="w-3 h-3" /> <span>{item.location}</span>
                     </div>
                   )}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}