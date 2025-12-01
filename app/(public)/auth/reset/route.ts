// app/(public)/auth/reset/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');

  console.log('Reset route called with:', { token, type });

  if (!token || type !== 'recovery') {
    console.error('Missing or invalid token/type');
    redirect('/forgot-password?error=invalid_link');
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify the recovery token
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });

    if (error) {
      console.error('Token verification failed:', error.message);
      redirect('/forgot-password?error=invalid_or_expired');
    }

    // Success! Redirect to the reset password page with a success flag
    redirect(`/reset-password?verified=true&token=${encodeURIComponent(token)}&type=${type}`);
  } catch (error) {
    console.error('Error in reset route:', error);
    redirect('/forgot-password?error=server_error');
  }
}