# RENDER.COM - GRATIS SELAMANYA

## Keunggulan Render
✅ Gratis 750 jam/bulan (25 hari full uptime)
✅ Auto-sleep hemat jam (bangun otomatis saat ada request)
✅ PostgreSQL gratis 1GB
✅ Custom domain gratis
✅ SSL otomatis
✅ TIDAK ADA MASA EXPIRED

## Cara Deploy ke Render
1. Daftar di https://render.com
2. Connect GitHub repository
3. Create PostgreSQL database (gratis)
4. Create Web Service untuk Next.js app
5. Set environment variables
6. Deploy otomatis dari GitHub

## Environment Variables untuk Render
DATABASE_URL=postgresql://user:pass@host:port/dbname
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.onrender.com

## Migration Script (MongoDB → PostgreSQL)
Perlu buat script untuk migrasi data dari MongoDB ke PostgreSQL
- Users table
- Products table  
- Orders table
- Chat table
- dll

## Build Settings Render
Build Command: npm run build
Start Command: npm start
Node Version: 18
Root Directory: inter-media-app
