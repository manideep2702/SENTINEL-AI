# Gmail SMTP Setup via Supabase Edge Functions

This guide shows you how to send emails using Gmail SMTP through Supabase Edge Functions, which works perfectly on Vercel.

## Prerequisites

- Supabase account (already set up)
- Gmail account
- Supabase CLI installed

## Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase
```

## Step 2: Create Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Click **Select app** → Choose **Mail**
5. Click **Select device** → Choose **Other** → Enter "Sentinel AI"
6. Click **Generate**
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

## Step 3: Login to Supabase CLI

```bash
supabase login
```

This will open a browser for authentication.

## Step 4: Link Your Project

```bash
cd /Users/manideep/Documents/lkk
supabase link --project-ref vjscgwtpzoacwtjdyzep
```

## Step 5: Set Environment Secrets

```bash
# Set Gmail credentials as secrets
supabase secrets set GMAIL_USER=your-email@gmail.com
supabase secrets set GMAIL_APP_PASSWORD=abcdefghijklmnop
supabase secrets set APP_URL=https://your-vercel-app-url.vercel.app
```

**Important**: Remove spaces from the App Password when setting it!

## Step 6: Deploy the Edge Function

```bash
supabase functions deploy send-task-reminder
```

You should see output like:
```
Deploying function send-task-reminder...
Function send-task-reminder deployed successfully!
```

## Step 7: Test the Function

```bash
# Test with curl
curl -i --location --request POST \
  'https://vjscgwtpzoacwtjdyzep.supabase.co/functions/v1/send-task-reminder' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "to": "test@example.com",
    "userName": "Test User",
    "taskName": "Morning Workout",
    "taskTime": "06:00 AM",
    "minutesBefore": 5
  }'
```

## Step 8: Verify in Your App

1. Deploy your app to Vercel
2. Enable email reminders in settings
3. Set a task reminder
4. Check your email inbox

## Troubleshooting

### Function not found
```bash
# List all functions
supabase functions list

# Redeploy
supabase functions deploy send-task-reminder
```

### Secrets not set
```bash
# List secrets
supabase secrets list

# Set again
supabase secrets set GMAIL_USER=your-email@gmail.com
```

### Gmail blocking sign-in
- Make sure 2-Step Verification is enabled
- Use App Password, not your regular password
- Check https://myaccount.google.com/lesssecureapps (should be OFF)

### CORS errors
The function already has CORS headers configured. If you still see errors:
1. Check that your Supabase URL and key are correct in `.env.local`
2. Verify the function is deployed: `supabase functions list`

## Email Template Customization

To customize the email template, edit:
```
/Users/manideep/Documents/lkk/supabase/functions/send-task-reminder/index.ts
```

Then redeploy:
```bash
supabase functions deploy send-task-reminder
```

## Cost

Supabase Edge Functions:
- **Free tier**: 500,000 invocations/month
- **Pro tier**: 2 million invocations/month

This is more than enough for email reminders!

## Alternative: EmailJS

If you prefer not to use Supabase Edge Functions, you can use EmailJS instead. See `docs/EMAILJS_SETUP.md` for instructions.

## Monitoring

View function logs:
```bash
supabase functions logs send-task-reminder
```

Or in the Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/vjscgwtpzoacwtjdyzep
2. Click **Edge Functions**
3. Click **send-task-reminder**
4. View logs and metrics
