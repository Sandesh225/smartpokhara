"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  DollarSign,
  Bell,
  ClipboardList,
  Phone,
  HelpCircle,
  Download,
  MapPin,
  Calendar,
  Building,
  Sparkles,
  ArrowRight,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"

interface QuickActionsProps {
  complaintsCount: number
  pendingBillsCount: number
  noticesCount: number
}

export default function QuickActions({ complaintsCount, pendingBillsCount, noticesCount }: QuickActionsProps) {
  const router = useRouter()
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  const complaintsLabel =
    complaintsCount === 0 ? "No Complaints" : complaintsCount === 1 ? "1 Complaint" : `${complaintsCount} Complaints`

  const billsLabel =
    pendingBillsCount === 0
      ? "No Pending Bills"
      : pendingBillsCount === 1
        ? "1 Pending Bill"
        : `${pendingBillsCount} Pending Bills`

  const noticesLabel = noticesCount === 0 ? "No Notices" : noticesCount === 1 ? "1 Notice" : `${noticesCount} Notices`

  const actions = [
    {
      id: "submit-complaint",
      title: "Submit Complaint",
      description: "Report an issue or request service",
      icon: FileText,
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
      path: "/citizen/complaints/new",
      badge: "New",
      badgeColor: "bg-blue-100 text-blue-800",
      hotkey: "C",
    },
    {
      id: "view-complaints",
      title: "View Complaints",
      description: "Track all your submitted complaints",
      icon: ClipboardList,
      color: "bg-gradient-to-br from-emerald-500 to-teal-500",
      path: "/citizen/complaints",
      stats: complaintsLabel,
    },
    {
      id: "pay-bills",
      title: "Pay Bills",
      description: "Pay taxes, fees, and charges online",
      icon: DollarSign,
      color: "bg-gradient-to-br from-amber-500 to-orange-500",
      path: "/citizen/payments",
      badge: pendingBillsCount > 0 ? `${pendingBillsCount} Pending` : undefined,
      badgeColor: pendingBillsCount > 0 ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground",
      stats: billsLabel,
      hotkey: "P",
    },
    {
      id: "view-notices",
      title: "View Notices",
      description: "Latest announcements and alerts",
      icon: Bell,
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      path: "/citizen/notices",
      badge: noticesCount > 0 ? `${noticesCount} new` : undefined,
      badgeColor: "bg-emerald-100 text-emerald-800",
      stats: noticesLabel,
    },
    {
      id: "municipal-services",
      title: "Services",
      description: "Access city services and applications",
      icon: Building,
      color: "bg-gradient-to-br from-gray-600 to-gray-800",
      path: "/citizen/services",
    },
    {
      id: "property-tax",
      title: "Property Tax",
      description: "Calculate and pay property taxes",
      icon: DollarSign,
      color: "bg-gradient-to-br from-rose-500 to-red-500",
      path: "/citizen/services/property-tax",
    },
    {
      id: "ward-info",
      title: "Ward Info",
      description: "Your ward office details and contacts",
      icon: MapPin,
      color: "bg-gradient-to-br from-indigo-500 to-blue-500",
      path: "/citizen/ward",
    },
    {
      id: "events-calendar",
      title: "Events Calendar",
      description: "Upcoming city events and meetings",
      icon: Calendar,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      path: "/citizen/events",
    },
  ]

  const supportActions = [
    {
      id: "help-center",
      title: "Help Center",
      description: "Get help and FAQs",
      icon: HelpCircle,
      path: "/help",
      color: "bg-slate-100",
      textColor: "text-slate-700",
    },
    {
      id: "contact",
      title: "Contact Us",
      description: "Reach our support team",
      icon: Phone,
      path: "/contact",
      color: "bg-slate-100",
      textColor: "text-slate-700",
    },
    {
      id: "downloads",
      title: "Downloads",
      description: "Forms and documents",
      icon: Download,
      path: "/downloads",
      color: "bg-slate-100",
      textColor: "text-slate-700",
    },
  ]

  const handleActionClick = (action: (typeof actions)[number]) => {
    router.push(action.path)
    toast.success(`Opening ${action.title}`, {
      description: action.description,
      icon: <Sparkles className="h-4 w-4" />,
    })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" role="list" aria-label="Quick actions">
          {actions.map((action, index) => {
            const Icon = action.icon
            const isHovered = hoveredAction === action.id

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{
                  scale: 1.03,
                  y: -6,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.97 }}
                onHoverStart={() => setHoveredAction(action.id)}
                onHoverEnd={() => setHoveredAction(null)}
                className="relative"
                role="listitem"
              >
                <Card
                  className={`cursor-pointer border-2 overflow-hidden transition-all duration-200 ${
                    isHovered
                      ? "border-primary shadow-xl"
                      : "border-border hover:border-primary/50 shadow-sm hover:shadow-md"
                  }`}
                  onClick={() => handleActionClick(action)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleActionClick(action)
                    }
                  }}
                  aria-label={`${action.title}: ${action.description}`}
                >
                  <CardContent className="p-4 sm:p-5">
                    <motion.div
                      className={`absolute inset-0 ${action.color} opacity-5`}
                      animate={isHovered ? { opacity: 0.12 } : { opacity: 0.05 }}
                      transition={{ duration: 0.3 }}
                    />

                    <div className="relative z-10">
                      {/* Icon + Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`p-2.5 rounded-xl ${action.color} shadow-md group-hover:shadow-lg transition-shadow`}
                        >
                          <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                        </div>
                        {action.badge && (
                          <Badge className={`text-xs font-medium px-2 ${action.badgeColor}`}>{action.badge}</Badge>
                        )}
                      </div>

                      <h3 className="font-bold mb-1 leading-tight text-balance">{action.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{action.description}</p>

                      {action.stats && <p className="mt-2 text-xs font-semibold text-primary">{action.stats}</p>}

                      {action.hotkey && (
                        <div className="absolute bottom-3 right-3">
                          <kbd className="px-2 py-1 text-xs font-bold bg-muted rounded border border-border shadow-sm">
                            {action.hotkey}
                          </kbd>
                        </div>
                      )}

                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, x: -10, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -10, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute -right-2 -bottom-2"
                          >
                            <div className="p-2 bg-primary rounded-full text-primary-foreground shadow-lg">
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>

                {action.stats && action.id === "view-complaints" && complaintsCount > 0 && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-primary text-primary-foreground text-xs shadow-md">{complaintsCount}</Badge>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3" role="list" aria-label="Support actions">
          {supportActions.map((action, index) => {
            const Icon = action.icon

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                whileHover={{ x: 4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                role="listitem"
              >
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 bg-transparent hover:bg-muted/80 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  asChild
                >
                  <Link href={action.path}>
                    <div className={`p-2 rounded-lg ${action.color} mr-3 flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${action.textColor}`} aria-hidden="true" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-semibold text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{action.description}</div>
                    </div>
                  </Link>
                </Button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
