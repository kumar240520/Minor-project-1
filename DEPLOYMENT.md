# EduSure - Serverless Deployment Guide

This guide covers deploying EduSure to Vercel and Netlify using serverless functions.

## 🏗️ Project Structure

```
edusure/
├── client/                 # React frontend (Vite)
│   ├── src/
│   ├── dist/              # Build output
│   └── package.json
├── api/                   # Serverless functions
│   ├── rewards/
│   │   ├── daily-login.js
│   │   ├── wallet/[userId].js
│   │   ├── download/[resourceId].js
│   │   ├── accept-answer.js
│   │   ├── attend-event.js
│   │   └── fiat-webhook.js
│   └── package.json
├── server/               # Legacy Express server (deprecated)
├── vercel.json          # Vercel configuration
├── netlify.toml         # Netlify configuration
└── package.json         # Root package.json
```

## 🚀 Vercel Deployment

### Prerequisites
- Vercel account
- Supabase project
- Node.js 18+

### Setup Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Environment Variables**
   Set these in Vercel dashboard under Project Settings → Environment Variables:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ENABLE_LEGACY_REWARDS_API=false
   ```

3. **Deploy to Vercel**
   ```bash
   # Link to Vercel
   vercel link
   
   # Deploy
   vercel --prod
   ```

4. **Custom Domain (Optional)**
   ```bash
   vercel domains add yourdomain.com
   ```

### Vercel Configuration
- `vercel.json` handles routing and build configuration
- API routes: `/api/*` → serverless functions
- Static assets: `/client/dist/*`
- SPA fallback: All routes → `index.html`

## 🚀 Netlify Deployment

### Prerequisites
- Netlify account
- Supabase project
- Node.js 18+

### Setup Steps

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Environment Variables**
   Set these in Netlify dashboard under Site settings → Build & deploy → Environment:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Deploy to Netlify**
   ```bash
   # Login to Netlify
   netlify login
   
   # Initialize site
   netlify init
   
   # Deploy
   netlify deploy --prod
   ```

4. **Custom Domain (Optional)**
   Configure in Netlify dashboard under Domain settings.

### Netlify Configuration
- `netlify.toml` handles build and routing
- API routes: `/api/*` → `/.netlify/functions/*`
- SPA fallback: All routes → `index.html`

## 🔧 Environment Setup

### 1. Supabase Setup
```sql
-- Run these SQL scripts in Supabase SQL Editor:
-- 1. server/models/community-posts.sql
-- 2. server/models/community-replies.sql
-- 3. server/models/fix-community-posts.sql
```

### 2. Local Development
```bash
# Install dependencies
npm install
cd client && npm install
cd ../api && npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 3. Environment Variables
Copy the example files:
```bash
cp .env.example .env
cp client/.env.example client/.env
```

Update with your actual values.

## 📦 Build Process

### Vercel Build
```bash
cd client
npm run build:vercel
```

### Netlify Build
```bash
cd client
npm run build:netlify
```

### Build Output
- Static files in `client/dist/`
- Serverless functions in `api/`
- Optimized chunks with code splitting

## 🔄 API Migration

### From Express to Serverless

**Before (Express):**
```javascript
// server.js
app.use('/api/rewards', rewardRoutes);
```

**After (Serverless):**
```javascript
// api/rewards/daily-login.js
exports.handler = async (event, context) => {
  // Handle CORS, routing, and response
}
```

### API Usage in Frontend
```javascript
// src/services/api.js
import { rewardsAPI } from '../services/api';

// Use serverless API
const result = await rewardsAPI.claimDailyLogin(userId);
```

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CORS headers are set in serverless functions
   - Check environment variables

2. **Build Failures**
   - Verify Node.js version (18+)
   - Check dependency installation
   - Review build logs

3. **API Routes Not Working**
   - Verify function file names match routes
   - Check environment variables
   - Review function logs

4. **Static Assets 404**
   - Verify build output directory
   - Check routing configuration
   - Review asset paths

### Debugging

**Vercel:**
```bash
vercel logs
```

**Netlify:**
```bash
netlify functions:serve
netlify logs
```

## 📊 Performance Optimization

### Frontend
- Code splitting with manual chunks
- Lazy loading components
- Optimized bundle size

### Backend
- Serverless functions scale automatically
- Cold start optimization
- Database connection pooling

### Caching
- Static assets cached for 1 year
- API responses cached when appropriate
- CDN distribution

## 🔒 Security

### Environment Variables
- Never commit `.env` files
- Use platform-specific env vars
- Rotate keys regularly

### CORS
- Configured for production domains
- Development allows localhost
- API endpoints properly secured

### Database
- Use Supabase RLS policies
- Service role key limited to server
- Validate all inputs

## 📈 Monitoring

### Vercel
- Built-in analytics
- Function logs
- Performance metrics

### Netlify
- Function logs
- Build monitoring
- Error tracking

### Recommended Tools
- Sentry for error tracking
- Vercel/Netlify analytics
- Custom monitoring dashboard

## 🔄 CI/CD Integration

### GitHub Actions (Vercel)
```yaml
name: Deploy to Vercel
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: vercel/action@v20
```

### GitHub Actions (Netlify)
```yaml
name: Deploy to Netlify
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: netlify/actions/build@master
```

## 📞 Support

For deployment issues:
1. Check platform documentation
2. Review function logs
3. Verify environment variables
4. Test locally first

## 🎯 Next Steps

After successful deployment:
1. Set up custom domain
2. Configure monitoring
3. Set up CI/CD
4. Optimize performance
5. Add error tracking
