'use client';

/**
 * Alternative Role Guard Pattern
 * Server-side version for use in server components
 */

import type { CurrentUser, RoleType } from '@/lib/types/auth';
import { hasRole } from '@/lib/auth/role-helpers';

interface RoleGuardProps {
  user: CurrentUser | null;
  allowedRoles: RoleType[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Simple role guard that shows/hides content
 * No redirects, just conditional rendering
 */
export function RoleGuard({
  user,
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  if (!user || !hasRole(user, allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * HOC version for wrapping components
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: RoleType[]
) {
  return function GuardedComponent(props: P & { user: CurrentUser | null }) {
    const { user, ...rest } = props;

    if (!user || !hasRole(user, allowedRoles)) {
      return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Access Denied</p>
          <p className="text-red-600 text-sm mt-2">
            You do not have permission to access this resource.
          </p>
        </div>
      );
    }

    return <Component {...(rest as P)} />;
  };
}