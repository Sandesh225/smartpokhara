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
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      glowColor: "group-hover:shadow-primary/20",
      borderColor: "border-primary/20",
      path: "/citizen/complaints/new",
      badge: "New",
      badgeColor: "bg-primary/10 text-primary border-primary/30",
      hotkey: "C",
      priority: true,
    },
    {
      id: "view-complaints",
      title: "Track Requests",
      description: "View all your submitted complaints",
      icon: ClipboardList,
      color: "bg-secondary",
      glowColor: "group-hover:shadow-secondary/20",
      borderColor: "border-secondary/20",
      path: "/citizen/complaints",
      stats: complaintsCount,
    },
    {
      id: "pay-bills",
      title: "Pay Bills",
      description: "Pay taxes, fees, and charges online",
      icon: DollarSign,
      color: "bg-amber-500",
      glowColor: "group-hover:shadow-amber-500/20",
      borderColor: "border-amber-500/20",
      path: "/citizen/payments",
      badge: pendingBillsCount > 0 ? `${pendingBillsCount} Due` : undefined,
      badgeColor:
        pendingBillsCount > 0
          ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
          : "bg-muted text-muted-foreground border-border",
      stats: pendingBillsCount,
      hotkey: "P",
      priority: pendingBillsCount > 0,
    },
    {
      id: "view-notices",
      title: "View Notices",
      description: "Latest announcements and alerts",
      icon: Bell,
      color: "bg-blue-500",
      glowColor: "group-hover:shadow-blue-500/20",
      borderColor: "border-blue-500/20",
      path: "/citizen/notices",
    },
    {
      id: "municipal-services",
      title: "City Services",
      description: "Access city services and applications",
      icon: Building,
      color: "bg-slate-600",
      glowColor: "group-hover:shadow-slate-600/20",
      borderColor: "border-slate-600/20",
      path: "/citizen/services",
    },
    {
      id: "property-tax",
      title: "Property Tax",
      description: "Calculate and pay property taxes",
      icon: DollarSign,
      color: "bg-emerald-500",
      glowColor: "group-hover:shadow-emerald-500/20",
      borderColor: "border-emerald-500/20",
      path: "/citizen/services/property-tax",
    },
    {
      id: "ward-info",
      title: "Ward Office",
      description: "Your ward office details and contacts",
      icon: MapPin,
      color: "bg-primary",
      glowColor: "group-hover:shadow-primary/20",
      borderColor: "border-primary/20",
      path: "/citizen/ward",
    },
    {
      id: "events-calendar",
      title: "Events",
      description: "Upcoming city events and meetings",
      icon: Calendar,
      color: "bg-green-500",
      glowColor: "group-hover:shadow-green-500/20",
      borderColor: "border-green-500/20",
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5"
          role="list"
          aria-label="Quick actions"
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            const isHovered = hoveredAction === action.id;

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.25, ease: "easeOut" },
                }}
                whileTap={{ scale: 0.97 }}
                onHoverStart={() => setHoveredAction(action.id)}
                onHoverEnd={() => setHoveredAction(null)}
                className="relative group"
                role="listitem"
              >
                <Card
                  className={cn(
                    "cursor-pointer overflow-hidden transition-all duration-300 h-full border-2",
                    "bg-card hover:bg-accent/5",
                    isHovered
                      ? `${action.borderColor} elevation-3 shadow-lg ${action.glowColor}`
                      : "border-border/60 elevation-1",
                    action.priority &&
                      "ring-2 ring-primary/10 ring-offset-2 ring-offset-background"
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
                  aria-label={`${action.title}: ${action.description}${action.stats !== undefined ? `. Total: ${action.stats}` : ""}`}
                >
                  {/* Gradient Background Accent */}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      "bg-gradient-to-br from-transparent via-transparent to-primary/5"
                    )}
                  />

                  <CardContent className="p-6 relative">
                    <div className="relative z-10 space-y-4">
                      {/* Icon and Badge Row */}
                      <div className="flex items-start justify-between gap-3">
                        <motion.div
                          className={cn(
                            "relative p-3.5 rounded-xl shadow-sm transition-all duration-300",
                            action.color,
                            "group-hover:shadow-lg"
                          )}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                          }}
                        >
                          <Icon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />

                          {/* Priority Indicator */}
                          {action.priority && (
                            <motion.div
                              className="absolute -top-1 -right-1"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <div className="h-2.5 w-2.5 rounded-full bg-white shadow-lg" />
                            </motion.div>
                          )}
                        </motion.div>

                        {action.badge && (
                          <Badge
                            className={cn(
                              "text-xs font-bold px-3 py-1 border shadow-sm",
                              action.badgeColor
                            )}
                          >
                            {action.badge}
                          </Badge>
                        )}
                      </div>

                      {/* Text Content */}
                      <div className="space-y-2">
                        <h3
                          className={cn(
                            "font-black text-base leading-tight text-balance transition-colors",
                            isHovered && "text-primary"
                          )}
                        >
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {action.description}
                        </p>
                      </div>

                      {/* Stats Display */}
                      {action.stats !== undefined && (
                        <div className="flex items-center gap-2 pt-1">
                          <div
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              action.stats > 0
                                ? action.color
                                : "bg-muted-foreground/30"
                            )}
                          />
                          <p
                            className={cn(
                              "text-sm font-bold font-mono tabular-nums",
                              action.stats > 0
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {action.stats}{" "}
                            <span className="text-xs font-normal">
                              {action.id === "view-complaints"
                                ? action.stats === 1
                                  ? "request"
                                  : "requests"
                                : action.stats === 1
                                  ? "bill"
                                  : "pending"}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Hotkey Badge */}
                      {action.hotkey && (
                        <div className="absolute top-6 right-6">
                          <kbd
                            className={cn(
                              "px-2.5 py-1 text-[10px] font-black rounded-md border-2 shadow-sm font-mono transition-all",
                              "bg-muted/50 border-border/60 text-muted-foreground",
                              isHovered &&
                                "bg-primary/10 border-primary/30 text-primary scale-110"
                            )}
                          >
                            {action.hotkey}
                          </kbd>
                        </div>
                      )}

                      {/* Arrow Indicator on Hover */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            className="absolute -bottom-3 -right-3"
                            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 20,
                            }}
                          >
                            <div
                              className={cn(
                                "p-3 rounded-full text-white shadow-2xl elevation-3",
                                action.color
                              )}
                            >
                              <ArrowRight
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>

                {/* Hover Glow Effect */}
                <div
                  className={cn(
                    "absolute inset-0 -z-10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    action.color.replace("bg-", "bg-"),
                    "scale-95"
                  )}
                  style={{
                    background: `radial-gradient(circle at center, ${action.color.replace("bg-", "rgb(var(--")})}, transparent)`,
                    opacity: isHovered ? 0.15 : 0,
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}