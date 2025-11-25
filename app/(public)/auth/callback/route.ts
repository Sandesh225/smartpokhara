
// ============================================================================
// 5. app/(public)/auth/callback/route.ts - UPDATED with role-based redirect
// ============================================================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // If there's a 'next' parameter, use it
      if (next) {
        return NextResponse.redirect(new URL(next, request.url));
      }

      // Otherwise, fetch user roles and redirect to appropriate dashboard
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userRolesData } = await supabase
          .from('user_roles')
          .select('role:roles(role_type)')
          .eq('user_id', user.id);

        const roles = userRolesData?.map((ur: any) => ur.role?.role_type).filter(Boolean) || [];

        let dashboardPath = '/citizen/dashboard';
        
        if (roles.includes('admin') || roles.includes('dept_head')) {
          dashboardPath = '/admin/dashboard';
        } else if (
          roles.includes('dept_staff') ||
          roles.includes('ward_staff') ||
          roles.includes('field_staff') ||
          roles.includes('call_center')
        ) {
          dashboardPath = '/staff/dashboard';
        }

        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url));
}