/**
 * Admin Layout - Additional layout for admin pages
 * Adds admin-specific sidebar or additional features
 */
//app/(admin)/(protected)/admin/layout.tsx

import { redirect } from 'next/navigation';
import { getCurrentUserWithRoles } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/role-helpers';
import { AdminSidebar } from '@/components/navigation/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect('/login');
  }

  if (!isAdmin(user)) {
    redirect('/citizen/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar user={user} />
      
      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {children}
      </div>
    </div>
  );
}