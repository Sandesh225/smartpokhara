// ============================================================================
// 4. app/(public)/login/page.tsx - UPDATED with role-based redirect
// ============================================================================

import { AuthForm } from '@/components/auth/AuthForm';
import { redirect } from 'next/navigation';
import { getCurrentUserWithRoles } from '@/lib/auth/session';
import { getDefaultDashboardPath } from '@/lib/auth/role-helpers';

export default async function LoginPage() {
  // Redirect if already authenticated
  const user = await getCurrentUserWithRoles();
  if (user) {
    const dashboardPath = getDefaultDashboardPath(user);
    redirect(dashboardPath);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm mode="login" />
    </div>
  );
}
