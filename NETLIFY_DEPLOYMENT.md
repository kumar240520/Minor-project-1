# Netlify Deployment Guide for EduSure

## 🚀 Quick Setup

### 1. Environment Variables
Add these in Netlify Dashboard > Site Settings > Environment Variables:

```
VITE_SUPABASE_URL=https://acobfukuvqrehbrqnyxx.supabase.co
VITE_SUPABASE_PUBLIC_KEY=sb_publishable_riQhamrU4Pwjay2fdMMkmw_ymryt0zi
VITE_API_BASE_URL=https://your-server-url.com/api
VITE_ENVIRONMENT=production
VITE_PLATFORM=netlify
```

### 2. Build Settings
- **Base directory**: `client/`
- **Build command**: `npm run build:netlify`
- **Publish directory**: `dist`
- **Node version**: `18`

### 3. Server Deployment
Your backend server needs to be deployed separately (Render, Railway, etc.)
Update `VITE_API_BASE_URL` with your deployed server URL.

## 📋 Deployment Steps

1. **Push to GitHub** (already done)
2. **Connect Netlify** to your repository
3. **Configure Environment Variables** (step 1)
4. **Deploy** - Netlify will auto-deploy on push

## 🔧 Configuration Files

- `netlify.toml` - Build settings and redirects
- `client/vite.config.js` - Optimized build config
- `client/.env.production` - Production environment template

## 🌐 Features

✅ **SPA Routing** - All routes redirect to index.html
✅ **API Proxy** - API calls redirect to your server
✅ **Security Headers** - XSS protection, content security
✅ **Asset Caching** - Optimized static asset caching
✅ **Build Optimization** - Code splitting and chunking

## ⚠️ Important Notes

- Server must be deployed separately
- Update API URL in environment variables
- Supabase keys are exposed (public keys are safe)
- Build is optimized for production

## 🎯 Result

Your EduSure platform will be live at `https://your-site.netlify.app`
