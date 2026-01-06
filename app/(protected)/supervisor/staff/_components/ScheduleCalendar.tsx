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
      case 'working': return "bg-green-100 text-green-700 border-green-200";
      case 'off': return "bg-gray-100 text-gray-500 border-gray-200";
      case 'leave': return "bg-red-100 text-red-700 border-red-200";
      case 'on_call': return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Upcoming Schedule</h3>
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 uppercase mb-2">
            {day}
          </div>
        ))}
        {SHIFTS.map((shift, i) => (
          <div key={i} className={cn(
            "p-2 rounded-lg border text-center flex flex-col items-center justify-center min-h-[80px]",
            getTypeColor(shift.type)
          )}>
            <span className="text-xs font-bold block mb-1">{shift.type.replace('_', ' ').toUpperCase()}</span>
            <span className="text-[10px] opacity-80">{shift.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}