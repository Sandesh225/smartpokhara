"use client";
import { MapPin, AlertTriangle, CalendarDays, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export function QuickActions() {
  const handleCheckIn = () => {
    // This will connect to the check-in RPC later
    toast.info("Checking location...", { description: "Verifying GPS coordinates." });
  };

  const actions = [
    { label: "Check In", icon: MapPin, color: "bg-blue-600", onClick: handleCheckIn },
    { label: "Queue", icon: ClipboardList, color: "bg-emerald-600", href: "/staff/queue" },
    { label: "Schedule", icon: CalendarDays, color: "bg-purple-600", href: "/staff/schedule" },
    { label: "Report", icon: AlertTriangle, color: "bg-orange-500", href: "/staff/help" },
  ];

  return (
    <div className="grid grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 my-6">
      {actions.map((a) => (
        a.href ? (
          <a key={a.label} href={a.href} className="flex flex-col items-center gap-2 group">
            <div className={`${a.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shadow-gray-200 group-active:scale-95 transition-transform`}>
              <a.icon className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{a.label}</span>
          </a>
        ) : (
          <button key={a.label} onClick={a.onClick} className="flex flex-col items-center gap-2 group">
            <div className={`${a.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shadow-gray-200 group-active:scale-95 transition-transform`}>
              <a.icon className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{a.label}</span>
          </button>
        )
      ))}
    </div>
  );
}