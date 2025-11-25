/**
 * Staff Layout - Additional layout for staff pages
 */

import { redirect } from 'next/navigation';
import { getCurrentUserWithRoles } from '@/lib/auth/session';
import { isStaff } from '@/lib/auth/role-helpers';
import { StaffSidebar } from '@/components/navigation/StaffSidebar';

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect('/login');
  }

  if (!isStaff(user)) {
    redirect('/citizen/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Staff Sidebar */}
      <StaffSidebar user={user} />
      
      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {children}
      </div>
    </div>
  );
}