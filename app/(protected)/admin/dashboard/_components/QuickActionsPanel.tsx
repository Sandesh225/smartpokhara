"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Users,
  FileBarChart,
  Megaphone,
  Settings,
  UserPlus,
  Zap,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function QuickActionsPanel() {
  const actions = [
    {
      label: "New Notice",
      icon: Megaphone,
      href: "/admin/content/notices/create",
      theme:
        "text-[rgb(var(--highlight-tech))] bg-[rgb(var(--highlight-tech))]/10",
      description: "Broadcast to citizens",
    },
    {
      label: "Add Staff",
      icon: UserPlus,
      href: "/admin/staff/create",
      theme: "text-primary bg-primary/10",
      description: "Onboard new unit",
    },
    {
      label: "Assign Task",
      icon: Plus,
      href: "/admin/complaints/assign",
      theme: "text-secondary bg-secondary/10",
      description: "Dispatch response",
    },
    {
      label: "Reports",
      icon: FileBarChart,
      href: "/admin/reports",
      theme: "text-purple-600 bg-purple-50",
      description: "Data analytics",
    },
    {
      label: "Manage Roles",
      icon: Users,
      href: "/admin/staff/roles",
      theme: "text-indigo-600 bg-indigo-50",
      description: "Permission logic",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
      theme: "text-muted-foreground bg-muted",
      description: "System config",
    },
  ];

  return (
    <Card className="stone-card  border-none transition-all duration-300 hover:elevation-4 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[rgb(var(--warning-amber))]/10 shadow-sm">
              <Zap className="w-5 h-5 text-[rgb(var(--warning-amber))]" />
            </div>
            Quick Ops
          </CardTitle>
          <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            CMD + K
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-2.5">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Button
                key={idx}
                variant="ghost"
                className={cn(
                  "group h-auto p-3 flex items-center justify-start gap-4",
                  "border border-border/40 bg-card/50 hover:bg-white hover:elevation-2",
                  "rounded-2xl transition-all duration-300 active:scale-[0.98]"
                )}
                asChild
              >
                <Link href={action.href}>
                  <div
                    className={cn(
                      "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-xs",
                      action.theme
                    )}
                  >
                    <Icon className="w-5 h-5 stroke-[2.5px]" />
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-bold text-foreground leading-none mb-1">
                      {action.label}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {action.description}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Decorative footer footer */}
        <div className="mt-6 pt-4 border-t border-dashed border-border flex justify-center">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Smart City Governance Portal
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
