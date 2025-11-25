
// ============================================================================
// FILE: components/navigation/StaffSidebar.tsx
// ============================================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CurrentUser } from '@/lib/types/auth';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar,
  Building2,
  BarChart3,
  User,
} from 'lucide-react';

interface StaffSidebarProps {
  user: CurrentUser;
}

const staffMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/staff/dashboard' },
  { icon: FileText, label: 'Complaints', href: '/staff/complaints' },
  { icon: CheckSquare, label: 'Tasks', href: '/staff/tasks' },
  { icon: Calendar, label: 'Work Log', href: '/staff/worklog' },
  { icon: Building2, label: 'Department', href: '/staff/department' },
  { icon: BarChart3, label: 'Reports', href: '/staff/reports' },
  { icon: User, label: 'Profile', href: '/staff/profile' },
];

export function StaffSidebar({ user }: StaffSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            SP
          </div>
          <div className="ml-3">
            <h2 className="text-gray-900 font-semibold">Staff Portal</h2>
            <p className="text-xs text-gray-500">Smart City Pokhara</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {staffMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">Signed in as</p>
          <p className="text-sm text-gray-900 font-medium truncate">{user.email}</p>
        </div>
      </div>
    </aside>
  );
}