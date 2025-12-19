# Email Reminders Setup Guide

This guide explains how to set up email reminders for SENTINEL AI.

---

## 🚀 Quick Setup (EmailJS - Recommended)

EmailJS allows sending emails directly from the browser - no backend server needed!

### Step 1: Create EmailJS Account

1. Go to [emailjs.com](https://www.emailjs.com/) and sign up (free tier: 200 emails/month)
2. Click **"Add New Service"**
3. Select **"Gmail"** and connect your Gmail account
4. Copy your **Service ID** (e.g., `service_abc123`)

### Step 2: Create Email Template

1. Go to **Email Templates** → **Create New Template**
2. Use this template:

**Subject:**
```
⏰ {{task_name}} starts in {{minutes_before}} minutes!
```

**Body (HTML):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; padding: 40px; border-radius: 12px;">
  <h1 style="color: #a855f7; margin: 0;">⚡ SENTINEL AI</h1>
  
  <h2 style="color: #ffffff; margin-top: 30px;">Hey {{to_name}}! 👋</h2>
  
  <p style="color: #94a3b8; font-size: 16px;">
    Your next task is starting in <strong style="color: #a855f7;">{{minutes_before}} minutes</strong>
  </p>
  
  <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
    <p style="color: #a855f7; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase;">UPCOMING ACTIVITY</p>
    <h3 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">{{task_name}}</h3>
    <p style="color: #64748b; margin: 0;">Scheduled for <strong style="color: #ffffff;">{{task_time}}</strong></p>
  </div>
  
  <div style="background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; padding: 16px; margin: 24px 0;">
    <p style="color: #10b981; font-style: italic; margin: 0;">
      "The only thing standing between you and your goals is the story you keep telling yourself."
    </p>
  </div>
  
  <a href="{{app_url}}/verify" style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; margin-top: 16px;">
    Start Task Verification →
  </a>
  
  <p style="color: #475569; font-size: 12px; margin-top: 40px;">
    © 2025 Sentinel AI. All rights reserved.
  </p>
</div>
```

3. Copy your **Template ID** (e.g., `template_xyz789`)

### Step 3: Get Public Key

1. Go to **Account** → **API Keys**
2. Copy your **Public Key**

### Step 4: Add to `.env.local`

Copy `.env.example` to `.env.local` and fill in:

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### Step 5: Restart Dev Server

```bash
# Stop the running server (Ctrl+C) and restart
npm run dev
```

---

## ✅ That's It!

Now when you're logged in:

1. **Reminders are automatically scheduled** for all upcoming tasks
2. **5 minutes before each task** (configurable in settings):
   - 🔔 Browser notification appears
   - 📧 Email is sent to your account email

---

## ⚙️ User Settings

Users can configure reminders from:

1. Click profile dropdown (top right)
2. Select **"Notification Settings"**
3. Configure:
   - Email reminders on/off
   - Browser notifications on/off
   - Reminder timing (5, 10, 15, or 30 minutes)

---

## 🔧 Alternative: Gmail SMTP

If you prefer Gmail SMTP, you'll need a backend server because SMTP credentials cannot be exposed in the browser. The EmailJS approach above is recommended for simplicity.

---

## 📋 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_EMAILJS_SERVICE_ID` | EmailJS Service ID | Yes (for emails) |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS Template ID | Yes (for emails) |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS Public Key | Yes (for emails) |
| `VITE_APP_URL` | Your app URL | Optional |
| `GEMINI_API_KEY` | Gemini AI API Key | Yes |

---

## 🐛 Troubleshooting

### Emails not sending
- Check browser console for errors
- Verify EmailJS credentials are correct
- Make sure the email template variables match

### Browser notifications not working
- Check if permission was granted
- Some browsers block notifications in incognito

### Settings not saving
- Run the SQL in `supabase-setup.sql` to create the `notification_preferences` table
