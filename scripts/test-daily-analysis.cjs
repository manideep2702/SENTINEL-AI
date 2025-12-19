// Test Daily Analysis Email - Run with: node scripts/test-daily-analysis.cjs
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Gmail SMTP Configuration
const GMAIL_USER = 'loomtechnologie@gmail.com';
const GMAIL_APP_PASSWORD = 'lezmmejziqlbwvxl';

// Recipient
const TO_EMAIL = 'manideepx@gmail.com';
const USER_NAME = 'Manideep Pasumarthi';

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
    }
});

// Read and encode profile image as base64
const imagePath = path.join(__dirname, '..', 'manideep.png');
let profileImageBase64 = '';
try {
    const imageBuffer = fs.readFileSync(imagePath);
    profileImageBase64 = imageBuffer.toString('base64');
    console.log('✅ Profile image loaded successfully');
} catch (err) {
    console.log('⚠️ Could not load profile image:', err.message);
}

// Sample tasks data
const tasks = [
    { name: 'Morning Workout', time: '05:00 - 07:30', verified: true, focusScore: 9 },
    { name: 'Class / Lecture', time: '08:30 - 10:00', verified: true, focusScore: 8 },
    { name: 'Deep Study Session 1', time: '11:00 - 13:30', verified: true, focusScore: 7 },
    { name: 'Study Session 2', time: '15:00 - 18:00', verified: true, focusScore: 8 },
    { name: 'Park Walk / Decompress', time: '18:00 - 19:00', verified: true, focusScore: 10 },
    { name: 'Study Session 3', time: '19:00 - 20:30', verified: true, focusScore: 6 }
];

// Calculate statistics
const totalTasks = tasks.length;
const completedTasks = tasks.filter(t => t.verified).length;
const completionRate = Math.round((completedTasks / totalTasks) * 100);
const avgFocusScore = Math.round(tasks.reduce((sum, t) => sum + t.focusScore, 0) / tasks.length);

// Generate task rows HTML
const taskRowsHtml = tasks.map(task => `
    <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #1f2937;">${task.name}</strong>
            <br>
            <span style="color: #6b7280; font-size: 12px;">${task.time}</span>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${task.verified
        ? '<span style="color: #10b981; font-weight: 600;">✅ Verified</span>'
        : '<span style="color: #ef4444; font-weight: 600;">❌ Missed</span>'}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            <span style="background-color: ${task.focusScore >= 7 ? '#ecfdf5' : task.focusScore >= 4 ? '#fef3c7' : '#fee2e2'}; color: ${task.focusScore >= 7 ? '#065f46' : task.focusScore >= 4 ? '#92400e' : '#991b1b'}; padding: 4px 12px; border-radius: 12px; font-weight: 600; font-size: 13px;">
                ${task.focusScore}/10
            </span>
        </td>
    </tr>
`).join('');

const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #7c3aed; padding: 24px 32px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <span style="font-size: 22px; font-weight: 700; color: #ffffff;">⚡ SENTINEL AI</span>
                                    </td>
                                    <td align="right">
                                        <span style="background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 600;">DAILY REPORT</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            <!-- Profile Section -->
                            <div style="text-align: center; margin-bottom: 24px;">
                                <img src="cid:profileImage" alt="${USER_NAME}" style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid #7c3aed; object-fit: cover;">
                            </div>
                            
                            <!-- Greeting -->
                            <h1 style="color: #1f2937; font-size: 24px; font-weight: 700; text-align: center; margin: 0 0 8px 0;">
                                🔥 Outstanding Performance!
                            </h1>
                            <p style="color: #7c3aed; font-size: 16px; font-weight: 600; text-align: center; margin: 0 0 4px 0;">
                                ${USER_NAME}
                            </p>
                            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0 0 32px 0;">
                                ${date}
                            </p>
                            
                            <!-- Stats Cards -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td width="33%" style="padding: 0 8px 0 0;">
                                        <div style="background-color: #f3e8ff; border-radius: 12px; padding: 20px; text-align: center;">
                                            <p style="color: #7c3aed; font-size: 28px; font-weight: 700; margin: 0;">${completedTasks}/${totalTasks}</p>
                                            <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0 0;">Tasks Done</p>
                                        </div>
                                    </td>
                                    <td width="33%" style="padding: 0 8px;">
                                        <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; text-align: center;">
                                            <p style="color: #10b981; font-size: 28px; font-weight: 700; margin: 0;">${completionRate}%</p>
                                            <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0 0;">Completion</p>
                                        </div>
                                    </td>
                                    <td width="33%" style="padding: 0 0 0 8px;">
                                        <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px; text-align: center;">
                                            <p style="color: #d97706; font-size: 28px; font-weight: 700; margin: 0;">${avgFocusScore}/10</p>
                                            <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0 0;">Avg Focus</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Task Breakdown -->
                            <h2 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">📋 Task Breakdown</h2>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                                <tr style="background-color: #e5e7eb;">
                                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 600;">ACTIVITY</th>
                                    <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: #6b7280; font-weight: 600;">STATUS</th>
                                    <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: #6b7280; font-weight: 600;">FOCUS</th>
                                </tr>
                                ${taskRowsHtml}
                            </table>
                            
                            <!-- Performance Message -->
                            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                                <p style="color: #065f46; font-size: 14px; margin: 0; line-height: 1.6;">
                                    <strong>Hey ${USER_NAME.split(' ')[0]}!</strong> You crushed it today! Keep this momentum going. 💪
                                </p>
                            </div>
                            
                            <!-- Quote -->
                            <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                                <p style="color: #4b5563; font-size: 14px; font-style: italic; margin: 0; line-height: 1.6;">
                                    "Success is the sum of small efforts, repeated day in and day out."
                                </p>
                                <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">— Robert Collier</p>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center;">
                                <a href="http://localhost:3000/analytics" 
                                   style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                                    View Full Analytics →
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

// Email options with embedded image
const mailOptions = {
    from: `"SENTINEL AI" <${GMAIL_USER}>`,
    to: TO_EMAIL,
    subject: `📊 Daily Report for ${USER_NAME}: ${completionRate}% Completion - ${completedTasks}/${totalTasks} Tasks`,
    html: htmlContent,
    attachments: profileImageBase64 ? [
        {
            filename: 'profile.png',
            content: profileImageBase64,
            encoding: 'base64',
            cid: 'profileImage' // Same cid as used in the html img src
        }
    ] : [],
    text: `
SENTINEL AI - Daily Report for ${USER_NAME}
${date}

Outstanding Performance!

Stats:
- Tasks Completed: ${completedTasks}/${totalTasks}
- Completion Rate: ${completionRate}%
- Average Focus Score: ${avgFocusScore}/10

Hey ${USER_NAME.split(' ')[0]}! You crushed it today! Keep this momentum going.

View full analytics at: http://localhost:3000/analytics

---
Sentinel AI - Where ambition becomes evidence.
    `
};

// Send email
async function sendTestEmail() {
    console.log(`📊 Sending daily analysis email for: ${USER_NAME}`);
    console.log('📧 To:', TO_EMAIL);
    console.log('📤 From:', GMAIL_USER);

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('\n✅ Daily analysis email sent successfully!');
        console.log('📬 Message ID:', info.messageId);
        console.log('\n🎉 Check your inbox at:', TO_EMAIL);
    } catch (error) {
        console.error('\n❌ Failed to send email:', error.message);
    }
}

sendTestEmail();
