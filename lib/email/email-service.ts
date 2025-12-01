// lib/email/email-service.ts
export interface InvitationEmailData {
  recipientEmail: string;
  recipientName: string;
  inviterName: string;
  role: string;
  invitationLink: string;
  expiresAt: Date;
}

export class EmailService {
  private static async callEmailAPI(payload: any): Promise<boolean> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Email API call failed:', error);
      return false;
    }
  }

  static async sendInvitation(data: InvitationEmailData): Promise<boolean> {
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
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">You're Invited! 🎉</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 20px 0;">
                Dear <strong>${data.recipientName}</strong>,
              </p>
              
              <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 20px 0;">
                ${data.inviterName} has invited you to join the <strong>Smart City Pokhara</strong> team.
              </p>

              <!-- Role Box -->
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

              <!-- Button -->
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

              <!-- Warning Box -->
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

          <!-- Footer -->
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

    return await this.callEmailAPI({
      to: data.recipientEmail,
      subject: `You're invited to join Smart City Pokhara as ${data.role.replace(/_/g, ' ')}`,
      html: html,
      text: `Dear ${data.recipientName}, you've been invited to join Smart City Pokhara. Visit: ${data.invitationLink}`
    });
  }

  static async sendWelcome(data: {
    recipientEmail: string;
    recipientName: string;
    role: string;
  }): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">Welcome! 🎉</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
                Dear <strong>${data.recipientName}</strong>,
              </p>
              <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
                Your staff account has been successfully activated!
              </p>
              <table width="100%" cellpadding="20" style="background-color: #f3f4f6; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Your Role:</p>
                    <p style="margin: 8px 0 0 0; color: #2563eb; font-size: 20px; font-weight: bold;">
                      ${data.role.replace(/_/g, ' ').toUpperCase()}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="font-size: 16px; color: #333333;">
                You can now access the staff portal and start managing complaints.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/staff/dashboard" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold;">
                      Go to Staff Portal
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0 0; font-size: 16px; color: #333333;">
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
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return await this.callEmailAPI({
      to: data.recipientEmail,
      subject: 'Welcome to Smart City Pokhara Staff Portal',
      html: html,
      text: `Welcome ${data.recipientName}! Your staff account is now active. Role: ${data.role}`
    });
  }

  static async sendRoleChange(data: {
    recipientEmail: string;
    recipientName: string;
    oldRole: string;
    newRole: string;
    changedBy: string;
  }): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #2563eb; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">Role Updated</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 16px; color: #333333;">Dear <strong>${data.recipientName}</strong>,</p>
              <p style="font-size: 16px; color: #333333; margin: 20px 0;">
                Your role in the Smart City Pokhara system has been changed by ${data.changedBy}.
              </p>
              <table width="100%" cellpadding="20" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Previous Role:</p>
                    <p style="margin: 0 0 20px 0; padding: 8px 16px; background-color: #fef3c7; color: #92400e; border-radius: 12px; display: inline-block; font-size: 14px; font-weight: 600;">
                      ${data.oldRole.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">New Role:</p>
                    <p style="margin: 0; padding: 8px 16px; background-color: #dbeafe; color: #1e40af; border-radius: 12px; display: inline-block; font-size: 14px; font-weight: 600;">
                      ${data.newRole.replace(/_/g, ' ').toUpperCase()}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="font-size: 16px; color: #333333;">
                This change may affect your permissions and dashboard access. Please log in to view your updated portal.
              </p>
              <p style="margin: 30px 0 0 0; font-size: 16px; color: #333333;">
                Best regards,<br><strong>Smart City Pokhara Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center;">
              <p style="font-size: 12px; color: #6b7280; margin: 0;">Pokhara Metropolitan City</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return await this.callEmailAPI({
      to: data.recipientEmail,
      subject: 'Your Role Has Been Updated - Smart City Pokhara',
      html: html,
      text: `Your role has been changed from ${data.oldRole} to ${data.newRole} by ${data.changedBy}`
    });
  }
}