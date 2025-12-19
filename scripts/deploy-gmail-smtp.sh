#!/bin/bash

# SENTINEL AI - Gmail SMTP Setup Script
# This script helps you deploy the Supabase Edge Function for email reminders

echo "🚀 SENTINEL AI - Gmail SMTP Setup"
echo "=================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Install it with:"
    echo "  brew install supabase/tap/supabase"
    echo "  OR"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if logged in
echo "📝 Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Not logged in to Supabase"
    echo "Running: supabase login"
    supabase login
fi

echo "✅ Logged in to Supabase"
echo ""

# Link project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref vjscgwtpzoacwtjdyzep

echo ""
echo "📧 Gmail Configuration"
echo "======================"
echo ""
echo "Before deploying, you need to set up Gmail App Password:"
echo "1. Go to: https://myaccount.google.com/security"
echo "2. Enable 2-Step Verification (if not already)"
echo "3. Go to App passwords"
echo "4. Create new app password for 'Sentinel AI'"
echo "5. Copy the 16-character password"
echo ""

read -p "Enter your Gmail address: " GMAIL_USER
read -p "Enter your Gmail App Password (no spaces): " GMAIL_APP_PASSWORD
read -p "Enter your Vercel app URL: " APP_URL

echo ""
echo "🔐 Setting secrets..."
supabase secrets set GMAIL_USER="$GMAIL_USER"
supabase secrets set GMAIL_APP_PASSWORD="$GMAIL_APP_PASSWORD"
supabase secrets set APP_URL="$APP_URL"

echo ""
echo "🚀 Deploying Edge Function..."
supabase functions deploy send-task-reminder

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📧 Testing email function..."
echo "You can test it with:"
echo ""
echo "curl -i --location --request POST \\"
echo "  'https://vjscgwtpzoacwtjdyzep.supabase.co/functions/v1/send-task-reminder' \\"
echo "  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \\"
echo "  --header 'Content-Type: application/json' \\"
echo "  --data '{"
echo "    \"to\": \"$GMAIL_USER\","
echo "    \"userName\": \"Test User\","
echo "    \"taskName\": \"Morning Workout\","
echo "    \"taskTime\": \"06:00 AM\","
echo "    \"minutesBefore\": 5"
echo "  }'"
echo ""
echo "🎉 All done! Email reminders are now enabled on Vercel!"
