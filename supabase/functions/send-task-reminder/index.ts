// Supabase Edge Function: send-task-reminder
// This function sends email reminders using Gmail SMTP
// Deploy with: supabase functions deploy send-task-reminder

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// Gmail SMTP Configuration
const GMAIL_USER = Deno.env.get("GMAIL_USER"); // Your Gmail address
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD"); // Gmail App Password

interface ReminderRequest {
    to: string;
    userName: string;
    taskName: string;
    taskTime: string;
    minutesBefore: number;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { to, userName, taskName, taskTime, minutesBefore }: ReminderRequest = await req.json();

        if (!to || !taskName || !taskTime) {
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
            console.error("Gmail credentials not configured");
            return new Response(
                JSON.stringify({ error: "Email service not configured" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Create beautiful HTML email
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Reminder - Sentinel AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0c;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0c; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0c 100%); border-radius: 16px; border: 1px solid rgba(168, 85, 247, 0.2); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 40px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <span style="font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">⚡ SENTINEL AI</span>
                                    </td>
                                    <td align="right">
                                        <span style="background: rgba(168, 85, 247, 0.2); color: #a855f7; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;">TASK REMINDER</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 48px 40px;">
                            <!-- Alert Icon -->
                            <div style="text-align: center; margin-bottom: 32px;">
                                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%); border-radius: 50%; line-height: 80px; font-size: 40px;">
                                    ⏰
                                </div>
                            </div>
                            
                            <!-- Greeting -->
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; text-align: center; margin: 0 0 16px 0;">
                                Hey ${userName}!
                            </h1>
                            
                            <p style="color: #94a3b8; font-size: 16px; text-align: center; margin: 0 0 40px 0; line-height: 1.6;">
                                Your next task is starting in <strong style="color: #a855f7;">${minutesBefore} minutes</strong>
                            </p>
                            
                            <!-- Task Card -->
                            <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 28px; margin-bottom: 32px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <p style="color: #a855f7; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                                                UPCOMING ACTIVITY
                                            </p>
                                            <h2 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">
                                                ${taskName}
                                            </h2>
                                            <p style="color: #64748b; font-size: 14px; margin: 0;">
                                                Scheduled for <strong style="color: #ffffff;">${taskTime}</strong>
                                            </p>
                                        </td>
                                        <td width="60" align="right" valign="top">
                                            <div style="width: 50px; height: 50px; background: rgba(168, 85, 247, 0.2); border-radius: 12px; text-align: center; line-height: 50px; font-size: 24px;">
                                                🎯
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Motivation Quote -->
                            <div style="background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; padding: 16px 20px; margin-bottom: 32px; border-radius: 0 8px 8px 0;">
                                <p style="color: #10b981; font-size: 14px; font-style: italic; margin: 0; line-height: 1.6;">
                                    "The only thing standing between you and your goals is the bullshit story you keep telling yourself."
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center;">
                                <a href="${Deno.env.get("APP_URL") || "https://your-app-url.com"}/verify" 
                                   style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);">
                                    Start Task Verification →
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.3);">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="color: #475569; font-size: 12px; margin: 0;">
                                            © 2025 Sentinel AI. All rights reserved.
                                        </p>
                                    </td>
                                    <td align="right">
                                        <p style="color: #475569; font-size: 12px; margin: 0;">
                                            <span style="display: inline-block; width: 6px; height: 6px; background: #10b981; border-radius: 50%; margin-right: 6px;"></span>
                                            System Online
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

        // Plain text version
        const textContent = `
Hey ${userName}!

⏰ TASK REMINDER

Your next task "${taskName}" is starting in ${minutesBefore} minutes at ${taskTime}.

Get ready and stay focused!

"The only thing standing between you and your goals is the bullshit story you keep telling yourself."

---
Sentinel AI - Where ambition becomes evidence.
        `;

        // Connect to Gmail SMTP and send email
        const client = new SmtpClient();

        await client.connectTLS({
            hostname: "smtp.gmail.com",
            port: 465,
            username: GMAIL_USER,
            password: GMAIL_APP_PASSWORD,
        });

        await client.send({
            from: GMAIL_USER,
            to: to,
            subject: `⏰ ${taskName} starts in ${minutesBefore} minutes!`,
            content: textContent,
            html: htmlContent,
        });

        await client.close();

        console.log(`✅ Email sent successfully to ${to}`);

        return new Response(
            JSON.stringify({ success: true, message: "Email sent successfully" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error in send-task-reminder:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
