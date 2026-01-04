# Environment Variables Template

Copy this to `.env.local` in your project root:

```bash
# Supabase Configuration
# Get these from: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Resend Email Service (for contact form notifications)
# Get API key from: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxx

# Email to receive contact form notifications
NOTIFICATION_EMAIL=steve@muniflow.io
```

⚠️ **Never commit `.env.local` to GitHub!** (It's already in .gitignore)

