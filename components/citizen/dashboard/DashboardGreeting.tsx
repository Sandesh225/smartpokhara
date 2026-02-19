"use client";

import { useMemo } from "react";
import { Sun, Moon, RefreshCw, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DashboardGreetingProps {
  name: string;
  wardName?: string;
  wardNumber?: number | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function DashboardGreeting({
  name,
  wardName,
  wardNumber,
  onRefresh,
  isRefreshing,
}: DashboardGreetingProps) {
  const currentTime = new Date();

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();

    if (hour < 12) {
      return {
        icon: <Sun className="w-6 h-6 text-yellow-500 animate-pulse" />,
        text: "Good Morning",
      };
    }
    if (hour < 18) {
      return {
        icon: <Sun className="w-6 h-6 text-orange-500" />,
        text: "Good Afternoon",
      };
    }
    return {
      icon: <Moon className="w-6 h-6 text-indigo-400" />,
      text: "Good Evening",
    };
  }, [currentTime]);

  return (
    <motion.header
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="stone-card bg-card/40 backdrop-blur-2xl border border-border/40 rounded-[32px] p-8 sm:p-10 shadow-2xl relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {greeting.icon}
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                  {greeting.text}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-tight">
                Welcome back, <span className="text-primary">{name}</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mt-3 px-0.5">
                Pokhara Metropolitan • Citizen Command Center
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge
              variant="outline"
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-border/30 bg-muted/20 backdrop-blur-md rounded-xl"
            >
              <MapPin className="w-3.5 h-3.5 mr-2 text-primary" />
              {wardName
                ? `${wardName} · Ward ${wardNumber}`
                : "District Center"}
            </Badge>
            <Badge
              variant="outline"
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-border/30 bg-muted/20 backdrop-blur-md rounded-xl"
            >
              <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
              {format(currentTime, "MMM d, yyyy")}
            </Badge>
            <Badge
              variant="outline"
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-border/30 bg-muted/20 backdrop-blur-md rounded-xl tabular-nums shadow-inner"
            >
              {format(currentTime, "hh:mm:ss a")}
            </Badge>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRefresh}
          disabled={isRefreshing}
          className="group h-12 px-8 flex items-center gap-3 bg-muted/20 border border-border/30 hover:bg-muted/30 rounded-2xl transition-all duration-500 font-bold uppercase tracking-widest text-[10px] disabled:opacity-50"
        >
          <RefreshCw
            className={cn(
              "w-4 h-4 text-primary transition-transform duration-700",
              isRefreshing ? "animate-spin" : "group-hover:rotate-180"
            )}
          />
          System Sync
        </motion.button>
      </div>
    </motion.header>
  );
}
