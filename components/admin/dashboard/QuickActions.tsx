"use client";

import Link from "next/link";
import { 
  PlusCircle, 
  Megaphone, 
  FileDown, 
  UserPlus, 
  MapPin, 
  ShieldAlert 
} from "lucide-react";

const actions = [
  {
    title: "Create Task",
    desc: "Assign internal work",
    icon: PlusCircle,
    href: "/admin/tasks/new",
    color: "text-blue-600",
    bg: "bg-blue-50 hover:bg-blue-100",
  },
  {
    title: "Post Notice",
    desc: "Public announcement",
    icon: Megaphone,
    href: "/admin/cms/notices/new",
    color: "text-purple-600",
    bg: "bg-purple-50 hover:bg-purple-100",
  },
  {
    title: "Register Staff",
    desc: "Add new employee",
    icon: UserPlus,
    href: "/admin/users/staff/new",
    color: "text-emerald-600",
    bg: "bg-emerald-50 hover:bg-emerald-100",
  },
  {
    title: "Export Data",
    desc: "Download reports",
    icon: FileDown,
    href: "/admin/settings/export",
    color: "text-amber-600",
    bg: "bg-amber-50 hover:bg-amber-100",
  },
  {
    title: "Ward Map",
    desc: "View heatmap",
    icon: MapPin,
    href: "/admin/maps",
    color: "text-indigo-600",
    bg: "bg-indigo-50 hover:bg-indigo-100",
  },
  {
    title: "Escalations",
    desc: "View urgent issues",
    icon: ShieldAlert,
    href: "/admin/complaints?filter=escalated",
    color: "text-rose-600",
    bg: "bg-rose-50 hover:bg-rose-100",
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {actions.map((action, index) => (
        <Link 
          key={index} 
          href={action.href}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 ${action.bg} border border-transparent hover:border-gray-200`}
        >
          <div className={`p-2 rounded-full bg-white shadow-sm mb-2`}>
            <action.icon className={`w-5 h-5 ${action.color}`} />
          </div>
          <span className="font-semibold text-sm text-gray-900">{action.title}</span>
          <span className="text-xs text-gray-500 mt-0.5">{action.desc}</span>
        </Link>
      ))}
    </div>
  );
}