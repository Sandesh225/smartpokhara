// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as nodemailer from 'nodemailer';

// Force dynamic route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json();

    console.log('📧 Attempting to send email to:', to);

    // Validate environment variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP credentials not configured');
    }

    // Create Gmail transporter - Fix for Turbopack
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // Send email
    const info = await transporter.sendMail({
      from: `"Smart City Pokhara" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Response:', info.response);

    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      response: info.response 
    });

  } catch (error: any) {
    console.error('❌ Email send error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });

    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to send email',
      details: error.code 
    }, { status: 500 });
  }
}