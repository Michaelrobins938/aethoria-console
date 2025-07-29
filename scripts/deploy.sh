#!/bin/bash

echo "🚀 Deploying Aethoria Console..."

# Build frontend
echo "📦 Building frontend..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

# Deploy backend to Railway
echo "🔧 Deploying backend to Railway..."
cd api
railway up

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Your Aethoria Console is now live!"
echo "Frontend: https://your-app.vercel.app"
echo "Backend: https://your-app.railway.app"
echo ""
echo "Don't forget to:"
echo "1. Set up your environment variables in Railway"
echo "2. Configure your domain in Vercel"
echo "3. Test the WebSocket connection" 