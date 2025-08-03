# Railway Deployment Guide

This application is optimized for Railway.app deployment. Follow these steps to deploy successfully:

## 🚀 Deployment Steps

### 1. Repository Setup
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit - Railway deployment ready"

# Push to your Git repository (GitHub, GitLab, etc.)
git remote add origin https://github.com/yourusername/intern-dashboard.git
git push -u origin main
```

### 2. Railway Project Setup
1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your intern-dashboard repository

### 3. Environment Configuration
Set these environment variables in Railway:
- `NODE_ENV=production`
- `PORT` (Railway sets this automatically)

### 4. Deployment Configuration
The app includes these Railway-ready files:
- ✅ `railway.toml` - Railway configuration
- ✅ `Procfile` - Process definition
- ✅ `package.json` - Dependencies and scripts
- ✅ `.gitignore` - Excludes unnecessary files

## 🔧 Key Deployment Features

### Automatic File System Setup
The server automatically creates necessary directories and files:
```javascript
// Creates data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Creates default intern data if file doesn't exist
if (!fs.existsSync(internsFile)) {
    // Creates interns.json with sample data
}
```

### Production-Ready Configuration
- ✅ Proper port binding (`0.0.0.0:PORT`)
- ✅ Environment-based CORS configuration
- ✅ Security headers with Helmet
- ✅ Graceful shutdown handling
- ✅ Error logging and monitoring
- ✅ Health check endpoints

### Health Check Endpoints
- `GET /api/health` - Server health status
- `GET /api/status` - API status information

## 🛠️ Deployment Troubleshooting

### Common Issues and Solutions

#### 1. Port Binding Issues
**Problem**: Server can't bind to port
**Solution**: The app uses `process.env.PORT || 3000` and binds to `0.0.0.0`

#### 2. File System Issues
**Problem**: Data files not found
**Solution**: Server automatically creates data directory and default files

#### 3. CORS Issues
**Problem**: Frontend can't connect to API
**Solution**: CORS is configured for Railway domains:
```javascript
origin: process.env.NODE_ENV === 'production' 
    ? ['https://intern-dashboard-production.up.railway.app', /\.railway\.app$/]
    : true
```

#### 4. Build Issues
**Problem**: Build fails during deployment
**Solution**: The app doesn't require a build step - it's a pure Node.js application

### Checking Deployment Status

1. **View Logs**: Check Railway project logs for startup messages
2. **Test Health Check**: Visit `https://your-app.railway.app/api/health`
3. **Test Dashboard**: Visit `https://your-app.railway.app/`

## 📊 Expected Startup Output

When successfully deployed, you should see:
```
🚀 Intern Dashboard Server is running on port [PORT]
🌐 Environment: production
📊 Dashboard: https://your-app.railway.app
🔍 Health Check: https://your-app.railway.app/api/health
📈 API Status: https://your-app.railway.app/api/status
📁 Data directory: /app/data
📄 Interns file: /app/data/interns.json
```

## 🔄 Updating Your Deployment

To update your deployed application:
```bash
git add .
git commit -m "Update: description of changes"
git push
```

Railway will automatically redeploy when you push to your main branch.

## 🌐 Custom Domain (Optional)

1. Go to your Railway project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update CORS configuration if needed

## 📝 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes (set to `production`) |
| `PORT` | Server port | `3000` | No (Railway sets automatically) |

## 🔍 Monitoring

### Health Checks
- Railway automatically monitors `/api/health`
- Returns server status, uptime, and environment info
- Configure custom health check timeout in `railway.toml`

### Logs
- View real-time logs in Railway dashboard
- Logs include request tracking and error reporting
- Production logs use 'combined' format for better analysis

## 🚨 If Deployment Fails

1. **Check the build logs** in Railway dashboard
2. **Verify all files are committed** to your repository
3. **Test locally** with `NODE_ENV=production npm start`
4. **Check Node.js version** (requires Node.js ≥18.0.0)
5. **Review error messages** in Railway logs
6. **Contact support** if issues persist

Your intern dashboard should now be successfully deployed on Railway! 🎉