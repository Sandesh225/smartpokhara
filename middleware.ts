// ============================================================================
// middleware.ts - COMPLETE FIXED VERSION
// ============================================================================
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Update session (handles token refresh)
  let response = await updateSession(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  const isProtectedRoute =
    pathname.startsWith('/citizen') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/admin');

  // Redirect unauthenticated users to login for protected routes
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Helper function to get user roles
  async function getUserRoles(userId: string): Promise<string[]> {
    const { data: userRolesData } = await supabase
      .from('user_roles')
      .select(`
        role:roles!inner(
          role_type,
          is_active
        )
      `)
      .eq('user_id', userId)
      .eq('role.is_active', true);

    if (!userRolesData || userRolesData.length === 0) {
      return [];
    }

    return userRolesData
      .map((ur: any) => ur.role?.role_type)
      .filter(Boolean);
  }

  // For authenticated users on auth pages, redirect to their dashboard
  if (user && isAuthPage) {
    const roles = await getUserRoles(user.id);

    // Determine dashboard based on roles (priority order)
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

  // Check role-based access for protected routes
  if (user && isProtectedRoute) {
    const roles = await getUserRoles(user.id);

    // Check admin routes - MUST have admin or dept_head role
    if (pathname.startsWith('/admin')) {
      const hasAdminAccess = roles.includes('admin') || roles.includes('dept_head');
      
      if (!hasAdminAccess) {
        // Redirect based on their actual role
        const dashboardPath = roles.some(r => 
          ['dept_staff', 'ward_staff', 'field_staff', 'call_center'].includes(r)
        ) ? '/staff/dashboard' : '/citizen/dashboard';
        
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
    }

    // Check staff routes - need staff-level roles
    if (pathname.startsWith('/staff')) {
      const hasStaffAccess = roles.some(r =>
        ['admin', 'dept_head', 'dept_staff', 'ward_staff', 'field_staff', 'call_center'].includes(r)
      );
      
      if (!hasStaffAccess) {
        return NextResponse.redirect(new URL('/citizen/dashboard', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};