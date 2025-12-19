// Email Backend Server - Run with: node server/email-server.cjs
// This provides an API endpoint for sending emails from the frontend

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Gmail SMTP Configuration
const GMAIL_USER = process.env.GMAIL_USER || 'loomtechnologie@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'lezmmejziqlbwvxl';

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'SENTINEL AI Email Server' });
});

// Send task reminder endpoint
app.post('/api/send-reminder', async (req, res) => {
    const { to, userName, taskName, taskTime, minutesBefore } = req.body;

    if (!to || !taskName || !taskTime) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

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
                                        <span style="background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 600;">TASK REMINDER</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            <!-- Icon -->
                            <div style="text-align: center; margin-bottom: 24px;">
                                <span style="font-size: 48px;">⏰</span>
                            </div>
                            
                            <!-- Greeting -->
                            <h1 style="color: #1f2937; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 12px 0;">
                                Hey ${userName || 'there'}!
                            </h1>
                            
                            <p style="color: #4b5563; font-size: 16px; text-align: center; margin: 0 0 32px 0; line-height: 1.5;">
                                Your next task is starting in <strong style="color: #7c3aed;">${minutesBefore} minutes</strong>
                            </p>
                            
                            <!-- Task Card -->
                            <div style="background-color: #f3e8ff; border: 2px solid #c084fc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                                <p style="color: #7c3aed; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                                    UPCOMING ACTIVITY
                                </p>
                                <h2 style="color: #1f2937; font-size: 22px; font-weight: 700; margin: 0 0 8px 0;">
                                    ${taskName}
                                </h2>
                                <p style="color: #4b5563; font-size: 14px; margin: 0;">
                                    Scheduled for <strong style="color: #1f2937;">${taskTime}</strong>
                                </p>
                            </div>
                            
                            <!-- Quote -->
                            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                                <p style="color: #065f46; font-size: 14px; font-style: italic; margin: 0; line-height: 1.5;">
                                    "The only thing standing between you and your goals is the story you keep telling yourself."
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center;">
                                <a href="http://localhost:3000/verify" 
                                   style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                                    Start Task Verification →
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

    try {
        await transporter.sendMail({
            from: `"SENTINEL AI" <${GMAIL_USER}>`,
            to: to,
            subject: `⏰ ${taskName} starts in ${minutesBefore} minutes!`,
            html: htmlContent,
            text: `Hey ${userName}! Your task "${taskName}" starts in ${minutesBefore} minutes at ${taskTime}. Get ready!`
        });

        console.log(`✅ Email sent to ${to} for task: ${taskName}`);
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
});

// Send daily analysis email endpoint
app.post('/api/send-daily-analysis', async (req, res) => {
    const { to, userName, tasks, date } = req.body;

    if (!to || !tasks) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.verified).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const avgFocusScore = tasks.length > 0
        ? Math.round(tasks.reduce((sum, t) => sum + (t.focusScore || 0), 0) / tasks.length)
        : 0;

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
                    ${task.focusScore || 0}/10
                </span>
            </td>
        </tr>
    `).join('');

    // Determine performance message
    let performanceEmoji = '🔥';
    let performanceTitle = 'Outstanding Performance!';
    let performanceMessage = "You crushed it today! Keep this momentum going.";

    if (completionRate < 50) {
        performanceEmoji = '💪';
        performanceTitle = 'Room for Improvement';
        performanceMessage = "Tomorrow is a new opportunity to push harder. Don't give up!";
    } else if (completionRate < 80) {
        performanceEmoji = '⚡';
        performanceTitle = 'Good Progress!';
        performanceMessage = "Solid effort today. A few more tasks and you'll be unstoppable!";
    }

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
                            <!-- Icon -->
                            <div style="text-align: center; margin-bottom: 24px;">
                                <span style="font-size: 56px;">${performanceEmoji}</span>
                            </div>
                            
                            <!-- Greeting -->
                            <h1 style="color: #1f2937; font-size: 24px; font-weight: 700; text-align: center; margin: 0 0 8px 0;">
                                ${performanceTitle}
                            </h1>
                            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0 0 32px 0;">
                                ${date || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                            <div style="background-color: ${completionRate >= 80 ? '#ecfdf5' : completionRate >= 50 ? '#fef3c7' : '#fee2e2'}; border-left: 4px solid ${completionRate >= 80 ? '#10b981' : completionRate >= 50 ? '#d97706' : '#ef4444'}; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                                <p style="color: ${completionRate >= 80 ? '#065f46' : completionRate >= 50 ? '#92400e' : '#991b1b'}; font-size: 14px; margin: 0; line-height: 1.6;">
                                    <strong>Hey ${userName || 'there'}!</strong> ${performanceMessage}
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

    try {
        await transporter.sendMail({
            from: `"SENTINEL AI" <${GMAIL_USER}>`,
            to: to,
            subject: `📊 Your Daily Report: ${completionRate}% Completion - ${completedTasks}/${totalTasks} Tasks`,
            html: htmlContent,
            text: `
SENTINEL AI - Daily Report for ${date || new Date().toLocaleDateString()}

${performanceTitle}

Stats:
- Tasks Completed: ${completedTasks}/${totalTasks}
- Completion Rate: ${completionRate}%
- Average Focus Score: ${avgFocusScore}/10

${performanceMessage}

View full analytics at: http://localhost:3000/analytics

---
Sentinel AI - Where ambition becomes evidence.
            `
        });

        console.log(`✅ Daily analysis email sent to ${to}`);
        res.json({ success: true, message: 'Daily analysis email sent successfully' });
    } catch (error) {
        console.error('❌ Failed to send daily analysis email:', error.message);
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 SENTINEL AI Email Server running on http://localhost:${PORT}`);
    console.log(`📧 Using Gmail: ${GMAIL_USER}`);
    console.log(`\n📌 Endpoints:`);
    console.log(`   GET  /health              - Health check`);
    console.log(`   POST /api/send-reminder   - Send task reminder email`);
    console.log(`   POST /api/send-daily-analysis - Send daily analysis email`);
    console.log(`\n`);
});
