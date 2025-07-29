# Aethoria Deployment Guide

This guide covers deploying Aethoria to various platforms and environments.

## 🚀 Production Setup

### Prerequisites

1. **Node.js 18+** installed on your server
2. **OpenRouter API Key** for AI functionality
3. **Domain name** (optional but recommended)
4. **SSL certificate** (recommended for production)

### Environment Configuration

Create a `.env.production` file with the following variables:

```env
# AI Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here

# App Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Aethoria
NEXT_PUBLIC_APP_VERSION=1.0.0

# Database (if using cloud saves)
DATABASE_URL=your_database_url_here

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Build Process

1. **Install dependencies**
   ```bash
   npm ci --production
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start production server**
   ```bash
   npm start
   ```

## 🌐 Deployment Platforms

### Vercel (Recommended)

Vercel is the easiest platform for deploying Next.js applications.

#### Setup Steps:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Go to your Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add all variables from `.env.production`

#### Vercel Configuration

Create a `vercel.json` file for custom configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "OPENROUTER_API_KEY": "@openrouter_api_key"
  }
}
```

### Netlify

#### Setup Steps:

1. **Connect your repository** to Netlify
2. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. **Set environment variables** in Netlify dashboard
4. **Deploy**

#### Netlify Configuration

Create a `netlify.toml` file:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Railway

#### Setup Steps:

1. **Connect your GitHub repository** to Railway
2. **Add environment variables** in Railway dashboard
3. **Deploy automatically** on push to main branch

### Docker Deployment

#### Dockerfile

Create a `Dockerfile`:

```dockerfile
# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

#### Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  aethoria:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    restart: unless-stopped
```

#### Build and Run

```bash
# Build the Docker image
docker build -t aethoria .

# Run the container
docker run -p 3000:3000 -e OPENROUTER_API_KEY=your_key aethoria
```

## 🔧 Server Configuration

### Nginx Configuration

Create an Nginx configuration file:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static file caching
    location /_next/static/ {
        alias /app/.next/static/;
        expires 365d;
        access_log off;
    }
}
```

### PM2 Configuration

Create a `ecosystem.config.js` file for PM2:

```javascript
module.exports = {
  apps: [{
    name: 'aethoria',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

#### PM2 Commands

```bash
# Start the application
pm2 start ecosystem.config.js

# Monitor the application
pm2 monit

# View logs
pm2 logs aethoria

# Restart the application
pm2 restart aethoria

# Stop the application
pm2 stop aethoria
```

## 🔒 Security Configuration

### Environment Variables

Never commit sensitive information to your repository:

```bash
# Add to .gitignore
.env
.env.local
.env.production
.env.development
```

### API Key Security

1. **Rotate API keys** regularly
2. **Use environment variables** for all sensitive data
3. **Monitor API usage** to prevent abuse
4. **Implement rate limiting** if needed

### CORS Configuration

Configure CORS in your Next.js API routes:

```typescript
// pages/api/[...all].ts
import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_BASE_URL || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  // Your API logic here
}
```

## 📊 Monitoring and Analytics

### Application Monitoring

1. **Vercel Analytics** (if using Vercel)
2. **Google Analytics** for user behavior
3. **Sentry** for error tracking
4. **Uptime monitoring** with services like UptimeRobot

### Performance Monitoring

```typescript
// lib/analytics.ts
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, properties)
  }
}

export const trackError = (error: Error, context?: string) => {
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, {
      tags: { context }
    })
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
      env:
        OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **API Key Issues**
   - Verify environment variables are set correctly
   - Check API key permissions and quotas
   - Test API connectivity

3. **Performance Issues**
   - Enable gzip compression
   - Optimize images and static assets
   - Use CDN for static files
   - Monitor memory usage

4. **CORS Errors**
   - Verify CORS configuration
   - Check domain settings
   - Test API endpoints directly

### Debug Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Check for outdated packages
npm outdated

# Run type checking
npm run type-check

# Run linting
npm run lint

# Test build locally
npm run build && npm start
```

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Load Balancer** for multiple instances
2. **Database clustering** for high availability
3. **CDN** for static assets
4. **Redis** for session management

### Performance Optimization

1. **Image optimization** with Next.js Image component
2. **Code splitting** for smaller bundle sizes
3. **Caching strategies** for API responses
4. **Database indexing** for faster queries

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Monitoring set up
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] API key rotation scheduled
- [ ] Documentation updated
- [ ] Team access configured

---

For additional support, refer to the main [README.md](README.md) or contact the development team. 