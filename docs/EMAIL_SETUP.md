# Email Reminders Setup

SENTINEL AI supports email reminders for your tasks. You have **two options** for sending emails:

## 🎯 Recommended: Gmail SMTP via Supabase Edge Functions

**Best for**: Production deployment on Vercel

### Pros:
- ✅ Works perfectly on Vercel (serverless)
- ✅ Uses your own Gmail account
- ✅ Beautiful HTML email templates
- ✅ Free (500K emails/month on Supabase)
- ✅ No third-party service needed

### Setup (5 minutes):

**Quick Setup:**
```bash
./scripts/deploy-gmail-smtp.sh
```

**Manual Setup:**
See detailed guide: [`docs/GMAIL_SMTP_SETUP.md`](./GMAIL_SMTP_SETUP.md)

---

## 🔄 Alternative: EmailJS

**Best for**: Quick setup without CLI

### Pros:
- ✅ No CLI needed
- ✅ Works from browser
- ✅ Easy setup (web dashboard)
- ❌ Limited to 200 emails/month (free tier)
- ❌ Requires third-party service

### Setup (5 minutes):

See guide: [`docs/EMAILJS_SETUP.md`](./EMAILJS_SETUP.md)

---

## 📊 Comparison

| Feature | Gmail SMTP (Supabase) | EmailJS |
|---------|----------------------|---------|
| **Free Tier** | 500,000 emails/month | 200 emails/month |
| **Setup** | CLI required | Web dashboard |
| **Vercel Support** | ✅ Yes | ✅ Yes |
| **Custom Domain** | ✅ Yes | ❌ No |
| **HTML Templates** | ✅ Full control | ⚠️ Limited |
| **Privacy** | ✅ Your Gmail | ⚠️ Third-party |

---

## 🚀 Quick Start

### Option 1: Gmail SMTP (Recommended)

1. Install Supabase CLI:
   ```bash
   brew install supabase/tap/supabase
   ```

2. Run deployment script:
   ```bash
   ./scripts/deploy-gmail-smtp.sh
   ```

3. Done! Emails will work on Vercel.

### Option 2: EmailJS

1. Sign up at [emailjs.com](https://www.emailjs.com)
2. Connect your Gmail
3. Create template (see `docs/EMAILJS_SETUP.md`)
4. Add env vars to Vercel:
   ```
   VITE_EMAILJS_SERVICE_ID=service_xxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxx
   VITE_EMAILJS_PUBLIC_KEY=xxx
   ```

---

## 🧪 Testing

After setup, test email reminders:

1. Deploy to Vercel
2. Go to Settings → Enable email reminders
3. Set a task reminder for 5 minutes from now
4. Check your email inbox

---

## 🐛 Troubleshooting

### No emails received?

1. **Check spam folder**
2. **Verify Gmail App Password** (not regular password!)
3. **Check Supabase logs**:
   ```bash
   supabase functions logs send-task-reminder
   ```
4. **Test the function** (see `docs/GMAIL_SMTP_SETUP.md`)

### Still not working?

- Check browser console for errors
- Verify environment variables in Vercel
- Ensure Supabase Edge Function is deployed

---

## 📝 Notes

- **Browser notifications** always work (no setup needed)
- **Email reminders** are optional but recommended
- You can use **both** Gmail SMTP and EmailJS (failover)

---

## 🔐 Security

- Gmail App Passwords are stored as Supabase secrets
- Never commit `.env.local` to git
- Use environment variables in Vercel dashboard

---

Need help? Check the detailed guides:
- [Gmail SMTP Setup](./GMAIL_SMTP_SETUP.md)
- [EmailJS Setup](./EMAILJS_SETUP.md)
