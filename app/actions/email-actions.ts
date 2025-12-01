// lib/actions/email-actions.ts
'use server';

import nodemailer from 'nodemailer';

export async function sendStaffInvitationEmail(data: {
  recipientEmail: string;
  recipientName: string;
  inviterName: string;
  role: string;
  invitationLink: string;
  expiresAt: Date;
}) {
  try {
    console.log('📧 Sending invitation email to:', data.recipientEmail);

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // HTML email template
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">You're Invited! 🎉</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 20px 0;">
                Dear <strong>${data.recipientName}</strong>,
              </p>
              
              <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 20px 0;">
                ${data.inviterName} has invited you to join the <strong>Smart City Pokhara</strong> team.
              </p>

              <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #f3f4f6; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">Your Assigned Role:</p>
                    <p style="font-size: 20px; font-weight: bold; color: #2563eb; margin: 0;">
                      ${data.role.replace(/_/g, ' ').toUpperCase()}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 20px 0;">
                To accept this invitation and create your account, click the button below:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${data.invitationLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; line-height: 20px; color: #666666; margin: 20px 0;">
                Or copy and paste this link:
              </p>
              <p style="font-size: 14px; color: #2563eb; word-break: break-all; margin: 0 0 30px 0;">
                ${data.invitationLink}
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #fef3c7; border-radius: 6px;">
                <tr>
                  <td style="font-size: 14px; color: #d97706;">
                    ⚠️ This invitation will expire on <strong>${data.expiresAt.toLocaleDateString()}</strong> at ${data.expiresAt.toLocaleTimeString()}.
                  </td>
                </tr>
              </table>

              <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong>Smart City Pokhara Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center;">
              <p style="font-size: 12px; color: #6b7280; margin: 0;">
                Pokhara Metropolitan City | पोखरा महानगरपालिका
              </p>
              <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">
                This is an automated message. Please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"Smart City Pokhara" <${process.env.SMTP_USER}>`,
      to: data.recipientEmail,
      subject: `You're invited to join Smart City Pokhara as ${data.role.replace(/_/g, ' ')}`,
      html: html,
      text: `Dear ${data.recipientName}, you've been invited to join Smart City Pokhara as ${data.role}. Visit: ${data.invitationLink}`,
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);

    return { success: true, messageId: info.messageId };

  } catch (error: any) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
}