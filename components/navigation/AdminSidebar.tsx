// ============================================================================
// FILE: components/navigation/AdminSidebar.tsx
// ============================================================================

'use client';

import Link from 'next/link';

import { usePathname } from 'next/navigation';
import type { CurrentUser } from '@/lib/types/auth';
import {
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  BarChart3,
  Settings,
  Megaphone,
  FileEdit,
  Shield,
} from 'lucide-react';

interface AdminSidebarProps {
  user: CurrentUser;
}

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: FileText, label: 'Complaints', href: '/admin/complaints' },
  { icon: Building2, label: 'Departments', href: '/admin/departments' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Megaphone, label: 'Notices', href: '/admin/notices' },
  { icon: FileEdit, label: 'CMS', href: '/admin/cms' },
  { icon: Shield, label: 'Audit Logs', href: '/admin/audit' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-gray-900">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            SP
          </div>
          <div className="ml-3">
            <h2 className="text-white font-semibold">Admin Panel</h2>
            <p className="text-xs text-gray-400">Smart City Pokhara</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {adminMenuItems.map((item) => {
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
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-400">Signed in as</p>
          <p className="text-sm text-white font-medium truncate">{user.email}</p>
        </div>
      </div>
    </aside>
  );
}
