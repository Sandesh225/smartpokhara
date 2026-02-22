import { format } from "date-fns";
import { Clock, MapPin } from "lucide-react";
import { PriorityIndicator } from "@/components/shared/PriorityIndicator";

interface Props {
  date: Date;
  items: any[];
}

export function DayScheduleView({ date, items }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 border-b border-border bg-muted/50">
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest">{format(date, "EEEE, MMMM do")}</h3>
      </div>
      
      <div className="divide-y divide-border">
        {items.length === 0 && (
           <div className="p-12 text-center text-muted-foreground/40 text-xs font-bold uppercase tracking-widest italic">No schedule for today.</div>
        )}
        
        {items.map((item, i) => (
          <div key={i} className="flex p-4 hover:bg-muted/30 transition-all group active:scale-[0.995]">
             <div className="w-20 pt-1 shrink-0 text-right pr-4 border-r border-border">
               <span className="text-xs font-black text-foreground block tracking-tighter">{item.time}</span>
               <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{item.type}</span>
             </div>
             
             <div className="flex-1 pl-4">
                <div className="flex items-center gap-2 mb-1">
                   {item.priority && <PriorityIndicator priority={item.priority} size="sm" showLabel={false} />}
                   <h4 className="text-sm font-bold text-foreground tracking-tight">{item.title}</h4>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold uppercase tracking-wide">
                   <div className="flex items-center gap-1">
                     <Clock className="w-3 h-3 text-info-blue" /> <span>{item.time || "All Day"}</span>
                   </div>
                   {item.location && (
                     <div className="flex items-center gap-1">
                       <MapPin className="w-3 h-3 text-destructive/70" /> <span>{item.location}</span>
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