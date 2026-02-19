"use client";

import {
  MapPin,
  ClipboardList,
  CalendarDays,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "@/features/staff"; // Updated
import { getCurrentLocation } from "@/lib/utils/location-helpers"; // Ensure this util exists

export function QuickActions() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleCheckIn = async () => {
    setLoading(true);
    const tid = toast.loading("Acquiring GPS signal...");
    
    try {
      const coords = await getCurrentLocation(); // Returns {lat, lng}
      if (!coords) throw new Error("Location permission denied");

      // Pass lat/lng individually as per your RPC signature
      await staffApi.checkIn(supabase, coords.lat, coords.lng);
      
      toast.success("Attendance recorded successfully!", { id: tid });

      startTransition(() => {
        router.refresh();
      });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Check-in failed. Try again.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    {
      label: "Check In",
      icon: MapPin,
      color: "bg-blue-600",
      onClick: handleCheckIn, // Direct handler
    },
    {
      label: "My Queue",
      icon: ClipboardList,
      color: "bg-emerald-600",
      href: "/staff/queue",
    },
    {
      label: "Schedule",
      icon: CalendarDays,
      color: "bg-purple-600",
      href: "/staff/schedule",
    },
    {
      label: "Escalate",
      icon: AlertTriangle,
      color: "bg-orange-500",
      href: "/staff/escalate", // Fixed route
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 my-6">
      {actions.map((a) => (
        <button
          key={a.label}
          disabled={loading || isPending}
          onClick={() => (a.href ? router.push(a.href) : a.onClick?.())}
          className="flex flex-col items-center gap-2 group disabled:opacity-50 transition-all hover:-translate-y-1"
        >
          <div
            className={`${a.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shadow-gray-200 dark:shadow-none transition-all active:scale-95 group-hover:brightness-110`}
          >
            {loading && !a.href ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <a.icon className="h-6 w-6" />
            )}
          </div>
          <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight text-center">
            {a.label}
          </span>
        </button>
      ))}
    </div>
  );
}