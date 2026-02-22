"use client";

import { cn } from "@/lib/utils";

// Mock Schedule for demonstration
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHIFTS = [
  { day: 'Mon', type: 'working', label: '9:00 - 17:00' },
  { day: 'Tue', type: 'working', label: '9:00 - 17:00' },
  { day: 'Wed', type: 'working', label: '9:00 - 17:00' },
  { day: 'Thu', type: 'off', label: 'Off Duty' },
  { day: 'Fri', type: 'working', label: '9:00 - 17:00' },
  { day: 'Sat', type: 'on_call', label: 'On Call' },
  { day: 'Sun', type: 'leave', label: 'Annual Leave' },
];

export function ScheduleCalendar() {
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'working': return "bg-success-green/10 text-success-green border-success-green/20";
      case 'off': return "bg-muted text-muted-foreground border-border";
      case 'leave': return "bg-destructive/10 text-destructive border-destructive/20";
      case 'on_call': return "bg-warning-amber/10 text-warning-amber border-warning-amber/20";
      default: return "bg-muted/30";
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-xs p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">Upcoming Schedule</h3>
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground uppercase mb-2">
            {day}
          </div>
        ))}
        {SHIFTS.map((shift, i) => (
          <div key={i} className={cn(
            "p-2 rounded-lg border text-center flex flex-col items-center justify-center min-h-[80px]",
            getTypeColor(shift.type)
          )}>
            <span className="text-xs font-bold block mb-1">{shift.type.replace('_', ' ').toUpperCase()}</span>
            <span className="text-xs opacity-80">{shift.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}