# EmailJS Setup Guide for SENTINEL AI

## Why EmailJS?
EmailJS allows sending emails directly from the browser without a backend server, making it perfect for Vercel deployments.

## Setup Steps

### 1. Create EmailJS Account
1. Go to [https://www.emailjs.com](https://www.emailjs.com)
2. Sign up for a free account (200 emails/month free)
3. Verify your email

### 2. Add Email Service
1. Go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose **Gmail** (or your preferred provider)
4. Connect your Gmail account
5. Copy the **Service ID** (e.g., `service_abc123`)

### 3. Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', -apple-system, sans-serif; background: #0a0a0c; color: #fff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%); border-radius: 16px; border: 1px solid rgba(168, 85, 247, 0.2); overflow: hidden; }
        .header { background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 32px; }
        .task-card { background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0; }
        .task-name { font-size: 24px; font-weight: 700; color: #a855f7; margin-bottom: 8px; }
        .task-time { font-size: 18px; color: #94a3b8; }
        .cta { text-align: center; margin: 32px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .footer { text-align: center; padding: 24px; color: #64748b; font-size: 14px; border-top: 1px solid rgba(255,255,255,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Task Reminder</h1>
        </div>
        <div class="content">
            <p>Hi {{to_name}},</p>
            <p>Your task is starting in <strong>{{minutes_before}} minutes</strong>!</p>
            
            <div class="task-card">
                <div class="task-name">{{task_name}}</div>
                <div class="task-time">📅 Starts at {{task_time}}</div>
            </div>
            
            <p>Get ready to crush it! 💪</p>
            
            <div class="cta">
                <a href="{{app_url}}" class="button">Open SENTINEL AI →</a>
            </div>
        </div>
        <div class="footer">
            <p>SENTINEL AI - Your Accountability Partner</p>
            <p>Stay focused. Stay accountable. Stay winning.</p>
        </div>
    </div>
</body>
</html>
```

4. Set the **Subject** to: `⏰ Task Reminder: {{task_name}}`
5. Copy the **Template ID** (e.g., `template_xyz789`)

### 4. Get Public Key
1. Go to **Account** → **General**
2. Find your **Public Key** (e.g., `abc123XYZ`)

### 5. Configure Environment Variables

Add these to your `.env.local` file:

```bash
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=abc123XYZ
```

### 6. Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the same three variables:
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`
4. Redeploy your app

## Testing

1. Go to your deployed app
2. Enable email reminders in settings
3. Set a task reminder
4. Check your email inbox

## Troubleshooting

- **No emails received**: Check spam folder
- **EmailJS quota exceeded**: Upgrade plan or wait for monthly reset
- **Template not working**: Verify variable names match exactly
- **Service not connected**: Reconnect Gmail in EmailJS dashboard

## Alternative: Supabase Edge Functions

If you prefer a backend solution, you can use Supabase Edge Functions (already set up in `/supabase/functions/send-task-reminder/`). However, this requires additional Supabase configuration.
