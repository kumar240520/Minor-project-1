# EduSure - Educational Platform

A modern educational platform with gamified learning, community features, and resource marketplace.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Git

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd edusure
   npm install
   cd client && npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   cp client/.env.example client/.env
   # Update with your Supabase credentials
   ```

3. **Database Setup**
   - Create Supabase project
   - Run SQL scripts from `server/models/`:
     - `community-posts.sql`
     - `community-replies.sql`
     - `fix-community-posts.sql`

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📁 Project Structure

```
edusure/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utilities
│   ├── dist/              # Build output
│   └── package.json
├── api/                   # Serverless functions
│   ├── rewards/           # Reward system APIs
│   └── package.json
├── server/               # Legacy Express server
├── vercel.json          # Vercel config
├── netlify.toml         # Netlify config
└── package.json         # Root package.json
```

## 🎯 Features

### 🎓 Learning Management
- Course materials upload/download
- Previous year questions (PYQs)
- Placement resources
- Progress tracking

### 🏆 Gamification
- Edu Coins virtual currency
- Daily login rewards
- Achievement system
- Leaderboards

### 💬 Community
- Discussion forums
- Q&A sections
- Peer-to-peer learning
- Expert answers

### 📊 Analytics
- User engagement metrics
- Content performance
- Learning progress
- Revenue tracking

### 🔐 User Management
- Role-based access (Student/Admin)
- Authentication with Supabase
- Profile management
- Permission controls

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Supabase** - Backend services

### Backend (Serverless)
- **Node.js 18** - Runtime
- **Supabase** - Database & Auth
- **Vercel/Netlify Functions** - Serverless

### Database
- **PostgreSQL** - Primary database
- **Supabase** - Managed service
- **RLS Policies** - Row-level security

## 🔧 Development

### Available Scripts
```bash
# Development
npm run dev              # Start dev server
npm run client           # Frontend only

# Building
npm run build            # Production build
npm run build:vercel     # Vercel build
npm run build:netlify    # Netlify build

# Utilities
npm run lint             # ESLint check
npm run preview          # Preview build
```

### API Services
```javascript
import { rewardsAPI } from './src/services/api';

// Daily login reward
await rewardsAPI.claimDailyLogin(userId);

// Get user wallet
await rewardsAPI.getWallet(userId);

// Download resource
await rewardsAPI.downloadResource(resourceId, userId);
```

### Environment Variables
```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLIC_KEY=your_supabase_key

# API (serverless)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interfaces
- Progressive Web App ready

## 🔒 Security

- Row Level Security (RLS)
- JWT authentication
- CORS protection
- Input validation
- Environment variable security

## 📈 Performance

- Code splitting
- Lazy loading
- Image optimization
- CDN distribution
- Serverless scaling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests if needed
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- Review troubleshooting section
- Create an issue on GitHub
- Contact development team

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Video conferencing integration
- [ ] Advanced analytics dashboard
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Offline mode
- [ ] AI-powered recommendations