# Environment Setup Instructions

## Create these files manually:

### 1. Root `.env` file (in project root)
```bash
# Supabase Configuration
SUPABASE_URL=https://acobfukuvqrehbrqnyxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_ueiE8mTqtqNZlyupZ1WPsg_0srZk_ym

# Frontend Environment Variables
VITE_SUPABASE_URL=https://acobfukuvqrehbrqnyxx.supabase.co
VITE_SUPABASE_PUBLIC_KEY=sb_publishable_riQhamrU4Pwjay2fdMMkmw_ymryt0zi

# Legacy API Configuration (set to false for serverless)
ENABLE_LEGACY_REWARDS_API=false

# Development (optional)
NODE_ENV=development
```

### 2. Client `.env` file (in client/ folder)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://acobfukuvqrehbrqnyxx.supabase.co
VITE_SUPABASE_PUBLIC_KEY=sb_publishable_riQhamrU4Pwjay2fdMMkmw_ymryt0zi

# API Configuration (for development)
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. SMTP variables for bulk email
Add these to the root `.env` or `server/.env` file:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-google-app-password
EMAIL_FROM=EduSure <your-gmail-address@gmail.com>
```

### 4. Supabase Auth URL allowlist
In Supabase Dashboard > Authentication > URL Configuration, set:
```bash
Site URL=https://edusure-five.vercel.app
```

Add these Redirect URLs:
```bash
https://edusure-five.vercel.app/auth/callback
https://edusure-five.vercel.app/reset-password-otp
http://localhost:5173/auth/callback
http://localhost:5173/reset-password-otp
```

## How to create:
1. Copy the content above
2. Create `.env` file in project root
3. Create `client/.env` file in client folder
4. Paste the respective content

## Already configured:
✅ .env.example (template)
✅ client/.env.example (template)
✅ netlify.toml (production)
✅ vercel.json (production)
