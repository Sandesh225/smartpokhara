import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileBarChart, Megaphone, Settings, UserPlus, Zap } from "lucide-react";
import Link from "next/link";

export function QuickActionsPanel() {
  const actions = [
    { 
      label: "New Notice", 
      icon: Megaphone, 
      href: "/admin/content/notices/create", 
      colorClasses: {
        icon: "text-orange-600",
        bg: "bg-orange-50",
        hover: "hover:bg-orange-100",
        border: "hover:border-orange-300"
      }
    },
    { 
      label: "Add Staff", 
      icon: UserPlus, 
      href: "/admin/staff/create", 
      colorClasses: {
        icon: "text-blue-600",
        bg: "bg-blue-50",
        hover: "hover:bg-blue-100",
        border: "hover:border-blue-300"
      }
    },
    { 
      label: "Assign Task", 
      icon: Plus, 
      href: "/admin/complaints/assign", 
      colorClasses: {
        icon: "text-green-600",
        bg: "bg-green-50",
        hover: "hover:bg-green-100",
        border: "hover:border-green-300"
      }
    },
    { 
      label: "Reports", 
      icon: FileBarChart, 
      href: "/admin/reports", 
      colorClasses: {
        icon: "text-purple-600",
        bg: "bg-purple-50",
        hover: "hover:bg-purple-100",
        border: "hover:border-purple-300"
      }
    },
    { 
      label: "Manage Roles", 
      icon: Users, 
      href: "/admin/staff/roles", 
      colorClasses: {
        icon: "text-indigo-600",
        bg: "bg-indigo-50",
        hover: "hover:bg-indigo-100",
        border: "hover:border-indigo-300"
      }
    },
    { 
      label: "Settings", 
      icon: Settings, 
      href: "/admin/settings", 
      colorClasses: {
        icon: "text-gray-600",
        bg: "bg-gray-50",
        hover: "hover:bg-gray-100",
        border: "hover:border-gray-300"
      }
    },
  ];

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-50">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Button
                key={idx}
                variant="outline"
                className={`
                  h-auto py-4 flex flex-col gap-2.5 items-center justify-center 
                  border-2 border-gray-100 ${action.colorClasses.border}
                  shadow-sm hover:shadow-md
                  transition-all duration-200
                  active:scale-95
                  group
                `}
                asChild
              >
                <Link href={action.href}>
                  <div 
                    className={`
                      p-2.5 rounded-xl ${action.colorClasses.bg} ${action.colorClasses.hover}
                      ring-2 ring-transparent group-hover:ring-current group-hover:ring-opacity-20
                      transition-all duration-200
                    `}
                  >
                    <Icon className={`w-5 h-5 ${action.colorClasses.icon}`} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {action.label}
                  </span>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}