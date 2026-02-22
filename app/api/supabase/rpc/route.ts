// FILE: app/api/supabase/rpc/route.ts
// FIXED: Properly handle RPC calls with consistent response format

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // FIXED: Accept both "function" and "functionName" for backward compatibility
    const functionName = body.function || body.functionName;
    const params = body.params || {};
    
    if (!functionName) {
      return NextResponse.json(
        { success: false, error: 'Function name is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('[RPC] Call:', { functionName, params, userId: user.id });
    
    // Call the RPC function
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) {
      console.error('[RPC] Error details:', { 
        functionName, 
        params, 
        error_message: error.message,
        error_details: error.details,
        error_hint: error.hint
      });
      return NextResponse.json(
        { 
          success: false,
          error: error.message, 
          details: error.details,
          hint: error.hint 
        },
        { status: 400 }
      );
    }
    
    console.log('[RPC] Success:', { 
      functionName, 
      dataType: Array.isArray(data) ? 'array' : typeof data,
      dataLength: JSON.stringify(data || {}).length 
    });
    
    // FIXED: Return consistent format
    // Always return {success: true, data: ...}
    return NextResponse.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
    
  } catch (error: any) {
    console.error('[RPC] Exception:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}