# 🚀 Quick Deploy to Railway

## Deploy Steps:

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit with SEO optimization"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/inter-media-app.git
git push -u origin main
```

### 2. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set environment variables:
   - `MONGODB_URI`: mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0
   - `NEXTAUTH_SECRET`: inter-media-nextauth-secret-2024-strong-key
   - `NEXTAUTH_URL`: https://your-app.railway.app

### 3. Alternative: Deploy to Render
1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Create Web Service
4. Set environment variables same as above

## 🎯 Expected Result:
- ✅ Website live with 105 products
- ✅ All data preserved (same database)
- ✅ SEO optimization active
- ✅ Admin login works immediately

## 🔧 If you prefer local testing:
```bash
npm run dev
# Visit: http://localhost:3000
```

**Data is 100% safe - using cloud database!** 🛡️
