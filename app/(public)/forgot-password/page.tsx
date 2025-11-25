
// ============================================================================
// app/(public)/forgot-password/page.tsx
// ============================================================================

import { AuthForm } from '@/components/auth/AuthForm';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm mode="forgot-password" />
    </div>
  );
}
