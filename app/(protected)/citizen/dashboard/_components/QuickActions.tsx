"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  ClipboardList,
  DollarSign,
  Bell,
  Building,
  MapPin,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface QuickActionsProps {
  complaintsCount: number;
  pendingBillsCount: number;
}

export default function QuickActions({ complaintsCount, pendingBillsCount }: QuickActionsProps) {
  const [focused, setFocused] = useState<string | null>(null);

  const actions = [
    {
      id: "submit-complaint",
      title: "Submit Request",
      description: "Report an issue or request a service",
      icon: FileText,
      path: "/citizen/complaints/new",
      badge: { label: "New", className: "bg-primary/10 text-primary border-primary/20" },
      featured: true,
    },
    {
      id: "view-complaints",
      title: "My Requests",
      description: "Track all your submissions",
      icon: ClipboardList,
      path: "/citizen/complaints",
      meta: complaintsCount > 0 ? `${complaintsCount} total` : undefined,
    },
    {
      id: "pay-bills",
      title: "Pay Bills",
      description: "Clear outstanding payments",
      icon: DollarSign,
      path: "/citizen/payments",
      badge: pendingBillsCount > 0
        ? { label: `${pendingBillsCount} pending`, className: "bg-destructive/10 text-destructive border-destructive/20" }
        : undefined,
    },
    {
      id: "notices",
      title: "Notices",
      description: "Announcements and alerts",
      icon: Bell,
      path: "/citizen/notices",
    },
    {
      id: "city-services",
      title: "City Services",
      description: "Applications and permits",
      icon: Building,
      path: "/citizen/services",
    },
    {
      id: "property-tax",
      title: "Property Tax",
      description: "Calculate and pay dues",
      icon: DollarSign,
      path: "/citizen/services/property-tax",
    },
    {
      id: "ward-office",
      title: "Ward Office",
      description: "Contacts and information",
      icon: MapPin,
      path: "/citizen/ward",
    },
    {
      id: "events",
      title: "Events",
      description: "Upcoming city events",
      icon: Calendar,
      path: "/citizen/events",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {actions.map((action, i) => {
        const Icon = action.icon;
        const isFocused = focused === action.id;

        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={action.path}
              onMouseEnter={() => setFocused(action.id)}
              onMouseLeave={() => setFocused(null)}
              onFocus={() => setFocused(action.id)}
              className={cn(
                "group relative flex flex-col gap-4 p-5 rounded-3xl border transition-all duration-500 outline-none",
                "bg-card/80 backdrop-blur-md shadow-inner-sm animate-fade-in overflow-hidden",
                isFocused
                  ? "border-primary/40 shadow-inner-lg -translate-y-1.5"
                  : "border-border/60 hover:border-primary/30",
                "focus-visible:ring-2 focus-visible:ring-primary/20"
              )}
              aria-label={`${action.title}: ${action.description}`}
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="flex items-start justify-between relative z-10">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 shadow-inner-sm border border-border/50",
                  isFocused 
                    ? "bg-primary text-primary-foreground scale-110 rotate-3" 
                    : "bg-background text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                )}>
                  <Icon className={cn("w-5 h-5 transition-transform duration-500", isFocused ? "scale-110" : "group-hover:scale-110")} aria-hidden="true" />
                </div>
                {action.featured && (
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                )}
              </div>

              <div className="space-y-1.5 flex-1 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-heading text-xs font-black uppercase tracking-widest text-foreground leading-none group-hover:text-primary transition-colors duration-300">
                    {action.title}
                  </p>
                  <ArrowUpRight
                    className={cn(
                      "w-4 h-4 shrink-0 transition-all duration-300 transform",
                      isFocused ? "text-primary opacity-100 translate-x-0.5 -translate-y-0.5" : "opacity-0"
                    )}
                    aria-hidden="true"
                  />
                </div>
                <p className="font-sans text-xs font-bold text-muted-foreground leading-relaxed line-clamp-2 uppercase tracking-tight opacity-70">
                  {action.description}
                </p>
              </div>

              {(action.badge || action.meta) && (
                <div className="pt-2">
                  {action.badge ? (
                    <Badge className={cn(
                      "font-sans text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg border shadow-inner-sm",
                      action.badge.className
                    )}>
                      {action.badge.label}
                    </Badge>
                  ) : action.meta ? (
                    <span className="font-sans text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                      {action.meta}
                    </span>
                  ) : null}
                </div>
              )}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}