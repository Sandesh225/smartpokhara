
// ============================================================================
// FILE: app/api/auth/refresh/route.ts
// ============================================================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ session: data.session });
}