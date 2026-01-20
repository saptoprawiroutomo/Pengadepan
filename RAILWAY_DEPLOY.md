gw# Railway Deployment Guide

## 1. Persiapan
1. Daftar di https://railway.app dengan GitHub
2. Connect repository Pengadepan

## 2. Deploy Database
1. Klik "New Project" → "Deploy MongoDB"
2. Copy connection string yang diberikan

## 3. Deploy App
1. Klik "New Project" → "Deploy from GitHub"
2. Pilih repository "Pengadepan"
3. Set root directory: "inter-media-app"

## 4. Environment Variables
Set di Railway dashboard:
- MONGODB_URI=<railway-mongodb-connection-string>
- NEXTAUTH_SECRET=your-secret-key-here-2026-inter-media-app
- NEXTAUTH_URL=https://your-app-name.up.railway.app

## 5. Build Settings
Railway auto-detect Next.js, tapi pastikan:
- Build Command: npm run build
- Start Command: npm start
- Node Version: 18+

## 6. Custom Domain (Optional)
1. Go to Settings → Domains
2. Add custom domain atau gunakan railway subdomain
