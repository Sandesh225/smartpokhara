/**
 * Citizen Layout - No additional sidebar, uses main navbar
 */

import { redirect } from 'next/navigation';
import { getCurrentUserWithRoles } from '@/lib/auth/session';

export default async function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect('/login');
  }

  // Everyone can access citizen dashboard
  return <>{children}</>;
}