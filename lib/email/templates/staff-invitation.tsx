

// lib/email/templates/staff-invitation.tsx
/**
 * React Email Template for Staff Invitation
 */
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface StaffInvitationEmailProps {
  recipientName: string;
  inviterName: string;
  role: string;
  invitationLink: string;
  expiresAt: Date;
}

export function StaffInvitationEmail({
  recipientName,
  inviterName,
  role,
  invitationLink,
  expiresAt,
}: StaffInvitationEmailProps) {
  const previewText = `You've been invited to join Smart City Pokhara as ${role}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>You're Invited! 🎉</Heading>
          </Section>
          
          <Section style={content}>
            <Text style={paragraph}>Dear {recipientName},</Text>
            
            <Text style={paragraph}>
              {inviterName} has invited you to join the Smart City Pokhara team.
            </Text>

            <Section style={roleBox}>
              <Text style={roleLabel}>Your Assigned Role:</Text>
              <Text style={roleValue}>{role}</Text>
            </Section>

            <Text style={paragraph}>
              To accept this invitation and create your account, please click the button below:
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={invitationLink}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={paragraph}>
              Or copy and paste this link into your browser:
            </Text>
            <Text style={link}>{invitationLink}</Text>

            <Hr style={hr} />

            <Text style={warning}>
              ⚠️ This invitation will expire on {expiresAt.toLocaleDateString()} at {expiresAt.toLocaleTimeString()}.
            </Text>

            <Text style={paragraph}>
              If you have any questions, please contact your administrator.
            </Text>

            <Text style={paragraph}>
              Best regards,<br />
              Smart City Pokhara Team
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Pokhara Metropolitan City | पोखरा महानगरपालिका
            </Text>
            <Text style={footerText}>
              This is an automated message. Please do not reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '40px 30px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  padding: '40px 30px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333333',
};

const roleBox = {
  background: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const roleLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 8px 0',
};

const roleValue = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#2563eb',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
};

const link = {
  color: '#2563eb',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
};

const warning = {
  fontSize: '14px',
  color: '#d97706',
  backgroundColor: '#fef3c7',
  padding: '12px',
  borderRadius: '6px',
};

const footer = {
  textAlign: 'center' as const,
  padding: '20px 30px',
};

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '4px 0',
};