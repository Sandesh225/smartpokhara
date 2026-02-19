import {
  LayoutDashboard, FileText, CheckSquare, Users, Briefcase, 
  Settings, Vote, CreditCard, Megaphone, User, BarChart2, 
  MessageSquare, Calendar, Phone, BookOpen, ShieldCheck,
  Activity, ClipboardList, GraduationCap, Bell, Globe, 
  Building2, Map, Search, HelpCircle, Inbox, Clock, PieChart
} from "lucide-react";
import { DashboardType } from "@/lib/types/auth";

export interface NavItem {
  name: string;
  href: string;
  icon: any;
  badgeKey?: string;
  children?: NavItem[];
}

export const ROLE_NAVIGATION: Record<DashboardType, NavItem[]> = {
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Complaints", href: "/admin/complaints", icon: FileText },
    { name: "Tasks", href: "/admin/tasks", icon: CheckSquare },
    { name: "Participatory Budget", href: "/admin/participatory-budgeting", icon: Vote },
    { name: "Staff", href: "/admin/staff", icon: Briefcase },
    { name: "Citizens", href: "/admin/citizens", icon: User },
    { name: "System Users", href: "/admin/users", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
    { name: "Departments", href: "/admin/departments", icon: Building2 },
    { name: "Content (CMS)", href: "/admin/content", icon: Megaphone, children: [
      { name: "Pages", href: "/admin/content/pages", icon: FileText },
      { name: "Notices", href: "/admin/content/notices", icon: Megaphone },
    ]},
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
  supervisor: [
    { name: "Dashboard", href: "/supervisor/dashboard", icon: LayoutDashboard },
    { name: "Complaints", href: "/supervisor/complaints", icon: FileText, children: [
      { name: "All Complaints", href: "/supervisor/complaints", icon: FileText },
      { name: "Unassigned", href: "/supervisor/complaints/unassigned", icon: Inbox },
      { name: "Overdue", href: "/supervisor/complaints/overdue", icon: Clock },
    ]},
    { name: "Budget Proposals", href: "/supervisor/participatory-budgeting", icon: Vote, children: [
      { name: "Vetting Inbox", href: "/supervisor/participatory-budgeting", icon: Inbox },
    ]},
    { name: "Staff", href: "/supervisor/staff", icon: Users },
    { name: "Tasks", href: "/supervisor/tasks", icon: CheckSquare },
    { name: "Analytics", href: "/supervisor/analytics", icon: BarChart2 },
    { name: "Messages", href: "/supervisor/messages", icon: MessageSquare, badgeKey: "messages" },
    { name: "Reports", href: "/supervisor/reports", icon: PieChart },
    { name: "Calendar", href: "/supervisor/calendar", icon: Calendar },
    { name: "Settings", href: "/supervisor/settings", icon: Settings },
  ],
  staff: [
    { name: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { name: "My Queue", href: "/staff/queue", icon: Inbox },
    { name: "Attendance", href: "/staff/attendance", icon: Activity },
    { name: "Schedule", href: "/staff/schedule", icon: Calendar },
    { name: "Performance", href: "/staff/performance", icon: BarChart2 },
    { name: "Messages", href: "/staff/messages", icon: MessageSquare },
    { name: "Team", href: "/staff/team", icon: Users }, // (Dept Staff/Head only - logic handled in component if needed)
    { name: "Leave", href: "/staff/leave", icon: Calendar },
    { name: "Training", href: "/staff/training", icon: GraduationCap },
    { name: "Resources", href: "/staff/resources", icon: BookOpen },
    { name: "Helpdesk", href: "/staff/helpdesk", icon: Phone }, // (Call Center only)
    { name: "Settings", href: "/staff/settings", icon: Settings },
  ],
  citizen: [
    { name: "Dashboard", href: "/citizen/dashboard", icon: LayoutDashboard },
    { name: "Ward Notices", href: "/citizen/notices", icon: Megaphone },
    { name: "My Complaints", href: "/citizen/complaints", icon: FileText, badgeKey: "complaints" },
    { name: "Budgeting", href: "/citizen/participatory-budgeting", icon: Vote },
    { name: "Bills & Payments", href: "/citizen/payments", icon: CreditCard },
    { name: "Request Service", href: "/citizen/services", icon: Briefcase },
    { name: "Profile", href: "/citizen/profile", icon: User },
    { name: "Settings", href: "/citizen/settings", icon: Settings },
  ]
};
