

// ============================================================================
// app/(protected)/admin/dashboard/page.tsx
// ============================================================================

import { redirect } from 'next/navigation';
import { getCurrentUserWithRoles } from '@/lib/auth/session';
import { isAdmin, getUserDisplayName } from '@/lib/auth/role-helpers';
import { DashboardCard } from '@/components/Dashboard/DashboardCard';
import { StatCard } from '@/components/Dashboard/StatCard';

export default async function AdminDashboard() {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect('/login');
  }

  if (!isAdmin(user)) {
    redirect('/citizen/dashboard');
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome, {getUserDisplayName(user)} - System Administrator
            </p>
          </div>
          <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            Admin Access
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="User Management"
          description="Manage users and roles"
          icon="👥"
          href="/admin/users"
        />
        
        <DashboardCard
          title="All Complaints"
          description="System-wide complaint overview"
          icon="📋"
          href="/admin/complaints"
          badge="156"
        />
        
        <DashboardCard
          title="Departments"
          description="Manage departments and staff"
          icon="🏢"
          href="/admin/departments"
        />
        
        <DashboardCard
          title="Analytics"
          description="View system analytics"
          icon="📊"
          href="/admin/analytics"
        />
        
        <DashboardCard
          title="CMS"
          description="Manage website content"
          icon="📄"
          href="/admin/cms"
        />
        
        <DashboardCard
          title="Notices"
          description="Create and manage notices"
          icon="📢"
          href="/admin/notices"
        />
        
        <DashboardCard
          title="System Config"
          description="System settings"
          icon="⚙️"
          href="/admin/config"
        />
        
        <DashboardCard
          title="Audit Logs"
          description="View system audit logs"
          icon="🔍"
          href="/admin/audit"
        />
      </div>

      {/* System Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">System Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value="1,234" color="blue" />
          <StatCard label="Active Complaints" value="87" color="yellow" />
          <StatCard label="Staff Members" value="45" color="green" />
          <StatCard label="Departments" value="7" color="purple" />
        </div>
      </div>
    </div>
  );
}