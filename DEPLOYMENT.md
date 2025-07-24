# 🚀 Deployment Guide - Aethoria Console

## Step 1: Create GitHub Repository

1. **Go to GitHub.com** and create a new repository
2. **Name it**: `aethoria-console`
3. **Make it public** (for Vercel deployment)
4. **Don't initialize** with README (we already have one)

## Step 2: Initialize Git and Push to GitHub

Run these commands in your project directory:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Aethoria Console - Universal AI Gaming Platform"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/aethoria-console.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import** your `aethoria-console` repository
5. **Configure project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. **Click "Deploy"**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Step 4: Configure Environment Variables

In your Vercel dashboard:

1. **Go to your project settings**
2. **Navigate to "Environment Variables"**
3. **Add these variables**:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend-url.railway.app/ws/game
```

## Step 5: Deploy Backend (Optional)

For the backend, you can deploy to Railway:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Deploy backend
cd api
railway init
railway up
```

## Step 6: Test Your Deployment

1. **Visit your Vercel URL** (e.g., `https://aethoria-console.vercel.app`)
2. **Test the application**:
   - Select a game cartridge
   - Try voice input
   - Check if chat works
   - Verify UI responsiveness

## Step 7: Custom Domain (Optional)

1. **In Vercel dashboard**, go to "Domains"
2. **Add your custom domain** (e.g., `aethoria.com`)
3. **Configure DNS** as instructed by Vercel

## 🎉 Success!

Your Aethoria Console is now live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app` (if deployed)

## 🔧 Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are in `package.json`
2. **Environment variables**: Make sure they're set in Vercel dashboard
3. **API errors**: Verify backend URL is correct
4. **WebSocket issues**: Check if backend supports WSS (secure WebSocket)

### Debug Commands:

```bash
# Test build locally
npm run build

# Check for TypeScript errors
npm run type-check

# Run linting
npm run lint
```

## 📈 Next Steps

1. **Set up analytics** (Google Analytics, Vercel Analytics)
2. **Configure monitoring** (Sentry, LogRocket)
3. **Add SEO meta tags** for better discoverability
4. **Set up CI/CD** for automatic deployments
5. **Configure custom domain** and SSL

## 🚀 Launch Checklist

- [ ] GitHub repository created and pushed
- [ ] Vercel deployment successful
- [ ] Environment variables configured
- [ ] Backend deployed (if needed)
- [ ] Custom domain configured (optional)
- [ ] Analytics set up
- [ ] Social media accounts created
- [ ] Launch announcement ready

**Your AI gaming platform is now live! 🎮** 