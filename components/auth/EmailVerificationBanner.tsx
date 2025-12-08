'use client';

/**
 * Email Verification Banner
 * Shows a banner when user's email is not verified
 */

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CurrentUser } from '@/lib/types/auth';
import { Alert } from '@/components/ui/alert';

interface EmailVerificationBannerProps {
  user: CurrentUser;
}

export function EmailVerificationBanner({ user }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = createClient();

  // Don't show banner if email is already verified
  if (user.email_verified_at) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsResending(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Verification email sent! Please check your inbox.',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to resend verification email',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-yellow-700">
              Your email address is not verified. Please check your inbox and click the
              verification link to access all features.
            </p>
            <div className="mt-3">
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="text-sm font-medium text-yellow-700 hover:text-yellow-600 underline disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="mt-2">
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        </div>
      )}
    </div>
  );
}