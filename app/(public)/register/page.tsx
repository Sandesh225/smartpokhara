
// ============================================================================
// app/(public)/register/page.tsx
// ============================================================================

import { AuthForm } from '@/components/auth/AuthForm';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';

export default async function RegisterPage() {
  // Redirect if already authenticated
  const user = await getCurrentUser();
  if (user) {
    redirect('/citizen/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AuthForm mode="register" />
        
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> New accounts are automatically assigned the
            Citizen role. Staff and admin roles are assigned by administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
