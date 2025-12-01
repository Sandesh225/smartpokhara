// emails/PasswordResetEmail.tsx
interface PasswordResetEmailProps {
  resetLink: string;
  userName?: string;
}

export function PasswordResetEmail({ resetLink, userName }: PasswordResetEmailProps) {
  const year = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Smart City Pokhara</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="text-align: center; padding: 32px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 12px; border-radius: 12px;">
            <span style="color: white; font-weight: bold; font-size: 24px;">SP</span>
          </div>
          <h1 style="margin: 24px 0 8px 0; color: #111827; font-size: 24px; font-weight: bold;">
            Smart City Pokhara
          </h1>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Municipal Services Portal
          </p>
        </div>

        <!-- Main Content -->
        <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: bold;">
            Reset Your Password
          </h2>
          
          ${userName ? `<p style="margin: 0 0 16px 0; color: #374151;">Hello ${userName},</p>` : ''}
          
          <p style="margin: 0 0 24px 0; color: #374151; line-height: 1.6;">
            We received a request to reset your password for your Smart City Pokhara account. 
            Click the button below to create a new password:
          </p>

          <!-- Reset Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
                      color: white; text-decoration: none; font-weight: 600; padding: 16px 32px; 
                      border-radius: 12px; font-size: 16px;">
              Reset Password
            </a>
          </div>

          <!-- Alternative Link -->
          <p style="margin: 24px 0; color: #6b7280; font-size: 14px; text-align: center;">
            Or copy and paste this link in your browser:<br>
            <a href="${resetLink}" style="color: #3b82f6; word-break: break-all;">
              ${resetLink}
            </a>
          </p>

          <!-- Security Notice -->
          <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin-top: 32px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Important:</strong> This link will expire in 24 hours. 
              If you didn't request this password reset, you can safely ignore this email.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 32px 0; color: #6b7280; font-size: 14px;">
          <p style="margin: 0 0 8px 0;">
            Smart City Pokhara Municipal Services Portal
          </p>
          <p style="margin: 0;">
            Pokhara Metropolitan City, Gandaki Province, Nepal
          </p>
          <p style="margin: 16px 0 0 0; color: #9ca3af;">
            © ${year} Smart City Pokhara. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}