"use client";

import { useState } from "react";
import Link from "next/link";
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
      badge: { label: "New", className: "bg-primary text-primary-foreground border-primary" },
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
        ? { label: `${pendingBillsCount} pending`, className: "bg-destructive text-destructive-foreground border-destructive" }
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {actions.map((action, i) => {
        const Icon = action.icon;
        const isFocused = focused === action.id;

        return (
          <div
            key={action.id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <Link
              href={action.path}
              onMouseEnter={() => setFocused(action.id)}
              onMouseLeave={() => setFocused(null)}
              onFocus={() => setFocused(action.id)}
              className={cn(
                "group relative flex flex-col gap-4 p-5 sm:p-6 rounded-2xl border transition-all duration-200 outline-none",
                "bg-card shadow-sm overflow-hidden",
                isFocused
                  ? "border-primary/40 shadow-md -translate-y-0.5"
                  : "border-border hover:border-primary/30",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              )}
              aria-label={`${action.title}: ${action.description}`}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 border border-border/50",
                  isFocused 
                    ? "bg-primary text-primary-foreground scale-105" 
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                {action.featured && (
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                )}
              </div>

              <div className="space-y-1.5 flex-1 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground leading-none group-hover:text-primary transition-colors duration-200">
                    {action.title}
                  </p>
                  <ArrowUpRight
                    className={cn(
                      "w-4 h-4 shrink-0 transition-all duration-200",
                      isFocused ? "text-primary opacity-100" : "opacity-0"
                    )}
                    aria-hidden="true"
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {action.description}
                </p>
              </div>

              {(action.badge || action.meta) && (
                <div className="pt-2">
                  {action.badge ? (
                    <Badge className={cn(
                      "text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-lg border shadow-xs",
                      action.badge.className
                    )}>
                      {action.badge.label}
                    </Badge>
                  ) : action.meta ? (
                    <span className="text-xs font-medium text-muted-foreground">
                      {action.meta}
                    </span>
                  ) : null}
                </div>
              )}
            </Link>
          </div>
        );
      })}
    </div>
  );
}