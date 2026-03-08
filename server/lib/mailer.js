// ============================================
// Email Utility — Nodemailer for OTP delivery
// ============================================

import nodemailer from 'nodemailer';

// Create transporter — uses SMTP config from env, falls back to console logging
let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    console.log('📧 Email transport configured via SMTP');
} else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
    console.log('📧 Email transport configured via Gmail');
} else {
    console.log('📧 No email config found — OTPs will be logged to console');
}

export async function sendOtpEmail(toEmail, otp) {
    // Always log to console for dev visibility
    console.log(`\n================================`);
    console.log(`VERIFICATION OTP FOR: ${toEmail}`);
    console.log(`OTP CODE: ${otp}`);
    console.log(`Expires in 10 minutes`);
    console.log(`================================\n`);

    if (!transporter) return; // No email config — console-only

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.GMAIL_USER || '"EduTracker" <noreply@edutracker.app>',
            to: toEmail,
            subject: `Your EduTracker Verification Code: ${otp}`,
            html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">EduTracker</h1>
            <p style="color: #666; font-size: 14px;">Verification Code</p>
          </div>
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 24px;">
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 10px 0;">Your verification code is:</p>
            <div style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; font-family: monospace;">${otp}</div>
          </div>
          <p style="color: #666; font-size: 13px; text-align: center; line-height: 1.5;">
            This code expires in <strong>10 minutes</strong>.<br>
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
        });
        console.log(`✅ OTP email sent successfully to ${toEmail}`);
    } catch (err) {
        console.error(`❌ Failed to send OTP email to ${toEmail}:`, err.message);
        // Don't throw — the console log is the fallback
    }
}
