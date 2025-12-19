// Demo Email Script - Run with: node scripts/send-demo-email.cjs
const nodemailer = require('nodemailer');

// Gmail SMTP Configuration
const GMAIL_USER = 'loomtechnologie@gmail.com';
const GMAIL_APP_PASSWORD = 'lezmmejziqlbwvxl';

// Recipient
const TO_EMAIL = 'manideepx@gmail.com';

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
    }
});

// Beautiful HTML email template with LIGHT THEME for maximum visibility
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header with Purple Background -->
                    <tr>
                        <td style="background-color: #7c3aed; padding: 24px 32px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <span style="font-size: 22px; font-weight: 700; color: #ffffff;">⚡ SENTINEL AI</span>
                                    </td>
                                    <td align="right">
                                        <span style="background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 600;">DEMO EMAIL</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            <!-- Success Icon -->
                            <div style="text-align: center; margin-bottom: 24px;">
                                <span style="font-size: 56px;">✅</span>
                            </div>
                            
                            <!-- Greeting -->
                            <h1 style="color: #1f2937; font-size: 26px; font-weight: 700; text-align: center; margin: 0 0 16px 0;">
                                Email Setup Successful! 🎉
                            </h1>
                            
                            <p style="color: #4b5563; font-size: 16px; text-align: center; margin: 0 0 32px 0; line-height: 1.6;">
                                Your Gmail SMTP is working perfectly. You'll now receive task reminders like this:
                            </p>
                            
                            <!-- Sample Task Card -->
                            <div style="background-color: #f3e8ff; border: 2px solid #c084fc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <p style="color: #7c3aed; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                                                SAMPLE REMINDER
                                            </p>
                                            <h2 style="color: #1f2937; font-size: 22px; font-weight: 700; margin: 0 0 8px 0;">
                                                Morning Workout
                                            </h2>
                                            <p style="color: #4b5563; font-size: 14px; margin: 0;">
                                                Starting in <strong style="color: #7c3aed;">5 minutes</strong> at <strong style="color: #1f2937;">05:00</strong>
                                            </p>
                                        </td>
                                        <td width="60" align="right" valign="top">
                                            <span style="font-size: 32px;">💪</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Features List -->
                            <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
                                <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">📬 What you'll receive:</h3>
                                <ul style="color: #4b5563; font-size: 14px; margin: 0; padding-left: 20px; line-height: 2;">
                                    <li>Email reminders 5 minutes before each task</li>
                                    <li>Beautiful branded notifications</li>
                                    <li>Direct links to verify your tasks</li>
                                    <li>Motivational quotes to keep you going</li>
                                </ul>
                            </div>
                            
                            <!-- Motivation Quote -->
                            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                                <p style="color: #065f46; font-size: 14px; font-style: italic; margin: 0; line-height: 1.6;">
                                    "The only thing standing between you and your goals is the story you keep telling yourself."
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center;">
                                <a href="http://localhost:3000" 
                                   style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                                    Open SENTINEL AI →
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                            © 2025 Sentinel AI. All rights reserved.
                                        </p>
                                    </td>
                                    <td align="right">
                                        <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                            🟢 System Online
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Email options
const mailOptions = {
    from: `"SENTINEL AI" <${GMAIL_USER}>`,
    to: TO_EMAIL,
    subject: '✅ SENTINEL AI - Email Setup Successful!',
    html: htmlContent,
    text: `
SENTINEL AI - Email Setup Successful! 🎉

Your Gmail SMTP is working perfectly. You'll now receive task reminders before each scheduled activity.

Features:
- Email reminders 5 minutes before each task
- Beautiful branded notifications
- Direct links to verify your tasks
- Motivational quotes to keep you going

Visit: http://localhost:3000

---
Sentinel AI - Where ambition becomes evidence.
    `
};

// Send email
async function sendDemoEmail() {
    console.log('📧 Sending demo email to:', TO_EMAIL);
    console.log('📤 From:', GMAIL_USER);

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('\n✅ Email sent successfully!');
        console.log('📬 Message ID:', info.messageId);
        console.log('\n🎉 Check your inbox at:', TO_EMAIL);
    } catch (error) {
        console.error('\n❌ Failed to send email:', error.message);

        if (error.message.includes('Invalid login')) {
            console.log('\n💡 Tips:');
            console.log('1. Make sure 2-Step Verification is enabled in Google Account');
            console.log('2. Generate an App Password at: https://myaccount.google.com/apppasswords');
            console.log('3. Use the App Password (16 characters) instead of your regular password');
        }
    }
}

sendDemoEmail();
