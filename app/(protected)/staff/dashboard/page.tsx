
// ============================================================================
// app/(protected)/staff/dashboard/page.tsx
// ============================================================================

import { redirect } from 'next/navigation';
import { getCurrentUserWithRoles } from '@/lib/auth/session';
import { isStaff, getUserDisplayName, getPrimaryRole } from '@/lib/auth/role-helpers';
import { RequireRole } from '@/components/guards/RequireRole';

export default async function StaffDashboard() {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect('/login');
  }

  if (!isStaff(user)) {
    redirect('/citizen/dashboard');
  }

  const primaryRole = getPrimaryRole(user);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Staff Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Welcome, {getUserDisplayName(user)} ({primaryRole})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Assigned Complaints"
          description="View complaints assigned to you"
          icon="📋"
          href="/staff/complaints"
          badge="12"
        />
        
        <DashboardCard
          title="My Tasks"
          description="Manage your task list"
          icon="✅"
          href="/staff/tasks"
          badge="5"
        />
        
        <DashboardCard
          title="Work Log"
          description="Record your daily activities"
          icon="📝"
          href="/staff/worklog"
        />
        
        <DashboardCard
          title="Department"
          description="Department information and staff"
          icon="🏢"
          href="/staff/department"
        />
        
        <DashboardCard
          title="Reports"
          description="View performance reports"
          icon="📊"
          href="/staff/reports"
        />
        
        <DashboardCard
          title="Profile"
          description="Manage your profile"
          icon="⚙️"
          href="/staff/profile"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Pending" value="8" color="yellow" />
        <StatCard label="In Progress" value="4" color="blue" />
        <StatCard label="Resolved Today" value="3" color="green" />
        <StatCard label="Overdue" value="2" color="red" />
      </div>
    </div>
  );
}