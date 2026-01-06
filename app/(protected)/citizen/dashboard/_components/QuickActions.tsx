"use client";

import { cn } from "@/lib/utils";
import {
  FileText,
  ClipboardList,
  DollarSign,
  Bell,
  Building,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  complaintsCount: number;
  pendingBillsCount: number;
}

export default function QuickActions({
  complaintsCount,
  pendingBillsCount,
}: QuickActionsProps) {
  const router = useRouter();
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const actions = [
    {
      id: "submit-complaint",
      title: "Submit Request",
      description: "Report an issue or request service",
      icon: FileText,
      color: "bg-primary",
      path: "/citizen/complaints/new",
      badge: "New",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
      hotkey: "C",
    },
    {
      id: "view-complaints",
      title: "Track Requests",
      description: "View all your submitted complaints",
      icon: ClipboardList,
      color: "bg-secondary",
      path: "/citizen/complaints",
      stats: complaintsCount,
    },
    {
      id: "pay-bills",
      title: "Pay Bills",
      description: "Pay taxes, fees, and charges online",
      icon: DollarSign,
      color: "bg-[rgb(var(--warning-amber))]",
      path: "/citizen/payments",
      badge: pendingBillsCount > 0 ? `${pendingBillsCount} Pending` : undefined,
      badgeColor:
        pendingBillsCount > 0
          ? "bg-amber-100 text-amber-800 border-amber-200"
          : "bg-muted text-muted-foreground",
      stats: pendingBillsCount,
      hotkey: "P",
    },
    {
      id: "view-notices",
      title: "View Notices",
      description: "Latest announcements and alerts",
      icon: Bell,
      color: "bg-[rgb(var(--info-blue))]",
      path: "/citizen/notices",
    },
    {
      id: "municipal-services",
      title: "City Services",
      description: "Access city services and applications",
      icon: Building,
      color: "bg-[rgb(var(--neutral-stone-600))]",
      path: "/citizen/services",
    },
    {
      id: "property-tax",
      title: "Property Tax",
      description: "Calculate and pay property taxes",
      icon: DollarSign,
      color: "bg-[rgb(var(--highlight-tech))]",
      path: "/citizen/services/property-tax",
    },
    {
      id: "ward-info",
      title: "Ward Office",
      description: "Your ward office details and contacts",
      icon: MapPin,
      color: "bg-primary",
      path: "/citizen/ward",
    },
    {
      id: "events-calendar",
      title: "Events",
      description: "Upcoming city events and meetings",
      icon: Calendar,
      color: "bg-[rgb(var(--success-green))]",
      path: "/citizen/events",
    },
  ];

  const handleActionClick = (action: (typeof actions)[0]) => {
    router.push(action.path);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-6">
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6"
          role="list"
          aria-label="Quick actions"
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            const isHovered = hoveredAction === action.id;

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
                whileHover={{
                  scale: 1.02,
                  y: -6,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setHoveredAction(action.id)}
                onHoverEnd={() => setHoveredAction(null)}
                className="relative"
                role="listitem"
              >
                <Card
                  className={cn(
                    "cursor-pointer overflow-hidden transition-all duration-300 h-full stone-card",
                    isHovered
                      ? "border-primary elevation-4"
                      : "elevation-1 hover:elevation-2"
                  )}
                  onClick={() => handleActionClick(action)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleActionClick(action);
                    }
                  }}
                  aria-label={`${action.title}: ${action.description}${action.stats ? `. Total: ${action.stats}` : ""}`}
                >
                  <CardContent className="p-5 relative">
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4 gap-2">
                        <motion.div
                          className={cn(
                            "p-3 rounded-xl shadow-sm",
                            action.color
                          )}
                          whileHover={{ scale: 1.08, rotate: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        </motion.div>
                        {action.badge && (
                          <Badge
                            className={cn(
                              "text-xs font-semibold px-2.5 py-1 border",
                              action.badgeColor
                            )}
                          >
                            {action.badge}
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-bold text-base mb-2 leading-tight text-balance">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                        {action.description}
                      </p>

                      {action.stats !== undefined && (
                        <p className="text-xs font-bold text-primary font-mono tabular-nums">
                          {action.stats}{" "}
                          {action.id === "view-complaints"
                            ? "requests"
                            : "pending"}
                        </p>
                      )}

                      {action.hotkey && (
                        <div className="absolute bottom-4 right-4">
                          <kbd className="px-2 py-1 text-[10px] font-bold bg-muted rounded border border-border shadow-sm font-mono">
                            {action.hotkey}
                          </kbd>
                        </div>
                      )}

                      {isHovered && (
                        <motion.div
                          className="absolute -right-2 -bottom-2"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-2.5 bg-primary rounded-full text-white shadow-lg elevation-3">
                            <ArrowRight
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
