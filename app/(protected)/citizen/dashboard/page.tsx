
// ============================================================================
// app/(protected)/citizen/dashboard/page.tsx
// ============================================================================

import { redirect } from 'next/navigation';
import { getCurrentUserWithRoles } from '@/lib/auth/session';
import { isCitizen, getUserDisplayName } from '@/lib/auth/role-helpers';
import { DashboardCard } from '@/components/Dashboard/DashboardCard';

export default async function CitizenDashboard() {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect('/login');
  }

  // Citizens can always access this dashboard
  // Staff/admin can also see it if they want

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {getUserDisplayName(user)}!
        </h1>
        <p className="mt-2 text-gray-600">
          Citizen Dashboard - Smart City Pokhara Portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <DashboardCard
          title="Submit Complaint"
          description="Report an issue in your area"
          icon="📝"
          href="/citizen/complaints/new"
        />
        
        <DashboardCard
          title="My Complaints"
          description="View and track your complaints"
          icon="📋"
          href="/citizen/complaints"
        />
        
        <DashboardCard
          title="Bills & Payments"
          description="View and pay your bills"
          icon="💳"
          href="/citizen/payments"
        />
        
        <DashboardCard
          title="Notices"
          description="View public announcements"
          icon="📢"
          href="/citizen/notices"
        />
        
        <DashboardCard
          title="Ward Information"
          description="Learn about your ward"
          icon="🏘️"
          href="/citizen/ward"
        />
        
        <DashboardCard
          title="Profile Settings"
          description="Manage your account"
          icon="⚙️"
          href="/citizen/profile"
        />
      </div>

      {!user.is_verified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Please verify your email address to access all features.
            Check your inbox for the verification link.
          </p>
        </div>
      )}
    </div>
  );
}
