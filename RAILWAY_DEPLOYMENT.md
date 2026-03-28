# Railway Deployment Guide

## Quick Setup

### 1. Connect Your Repository
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository: `kumar240520/Minor-project-1`

### 2. Configure Environment Variables
In Railway Dashboard → Your Project → Variables, add:

```env
VITE_SUPABASE_URL=https://acobfukuvqrehbrqnyxx.supabase.co
VITE_SUPABASE_PUBLIC_KEY=sb_publishable_riQhamrU4Pwjay2fdMMkmw_ymryt0zi
VITE_API_BASE_URL=${RAILWAY_PUBLIC_DOMAIN}/api
VITE_ENVIRONMENT=production
VITE_PLATFORM=railway
```

### 3. Update Supabase Settings
In Supabase Dashboard → Authentication → Settings:
- **Site URL**: `https://your-app-name.railway.app`
- **Redirect URLs**: Add `https://your-app-name.railway.app`

### 4. Deploy
- Railway will automatically detect and deploy your app
- Your app will be available at: `https://your-app-name.railway.app`

## OAuth Configuration
After deployment, update:
- **Google Cloud Console**: Add your Railway URL to authorized origins
- **Supabase**: Update redirect URLs with Railway domain

## Benefits of Railway
✅ **Automatic HTTPS** - SSL included  
✅ **Global CDN** - Fast worldwide  
✅ **Auto-scaling** - Handles traffic spikes  
✅ **GitHub integration** - Auto-deploy on push  
✅ **Environment variables** - Secure config  
✅ **Custom domains** - Use your own domain
