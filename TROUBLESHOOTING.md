# Railway Deployment Troubleshooting Guide

## 🚨 If Your Railway Deployment Crashes

### Step 1: Check Railway Logs

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Deployments** tab
4. Click on the failed deployment
5. Check the **Build Logs** and **Deploy Logs**

### Step 2: Common Railway Deployment Issues

#### Issue 1: Port Binding Problems
**Symptoms**: `EADDRINUSE` or port-related errors
**Solution**: 
- Ensure server binds to `0.0.0.0` not `localhost`
- Use `process.env.PORT` for Railway's dynamic port assignment

```javascript
// ✅ Correct
app.listen(process.env.PORT || 3000, '0.0.0.0', callback);

// ❌ Wrong
app.listen(3000, 'localhost', callback);
```

#### Issue 2: File System Permissions
**Symptoms**: `EACCES` or file permission errors
**Solution**: 
- Use relative paths, not absolute paths
- Handle file system errors gracefully
- Railway has ephemeral file system

```javascript
// ✅ Correct - with error handling
try {
    fs.mkdirSync(dataDir, { recursive: true });
} catch (error) {
    console.error('Failed to create directory:', error);
    // Continue without failing
}
```

#### Issue 3: Missing Dependencies
**Symptoms**: `MODULE_NOT_FOUND` errors
**Solution**:
- Ensure all dependencies are in `package.json` under `dependencies` (not `devDependencies`)
- Run `npm install` locally to verify

#### Issue 4: Environment Variables
**Symptoms**: Configuration errors, missing environment values
**Solution**:
- Set `NODE_ENV=production` in Railway environment variables
- Check Railway environment variables are correctly set

#### Issue 5: Health Check Failures
**Symptoms**: Railway shows service as unhealthy
**Solution**:
- Ensure `/api/health` endpoint responds quickly
- Check `railway.toml` health check configuration

### Step 3: Use Enhanced Logging

The server now includes comprehensive logging. Look for these messages in Railway logs:

```
🔍 Starting server initialization...
📍 Current working directory: /app
📍 __dirname: /app
🌍 Environment: production
🚪 Port: [DYNAMIC_PORT]
📁 Checking data directory: /app/data
✅ Data directory already exists
📄 Checking interns file: /app/data/interns.json
✅ Interns file already exists
🔧 Setting up middleware...
✅ Helmet security middleware configured
✅ CORS middleware configured
✅ Body parser middleware configured
✅ Morgan logging middleware configured
📁 Setting up static file serving...
✅ Static file serving configured
🔌 Setting up API routes...
✅ API routes configured successfully
✅ Server successfully started!
🎯 Server ready to handle requests
```

### Step 4: Verify Your Configuration Files

#### `package.json` must have:
```json
{
  "engines": {
    "node": "18.x",
    "npm": ">=8.0.0"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

#### `railway.toml` should contain:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node server.js"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 2
```

### Step 5: Test Locally First

Before deploying, run these tests:

1. **Startup Test**:
   ```bash
   node startup-test.js
   ```

2. **Production Test**:
   ```bash
   NODE_ENV=production node server.js
   ```

3. **Health Check Test**:
   ```bash
   curl http://localhost:3000/api/health
   ```

### Step 6: Debugging Specific Errors

#### Error: "Cannot find module"
```bash
# Check if all dependencies are installed
npm ls
# Install missing dependencies
npm install [missing-package]
```

#### Error: "Permission denied"
```bash
# Check file permissions locally
ls -la
# Ensure files are readable
chmod 644 *.js *.json
```

#### Error: "Port already in use"
- This error in production means Railway is trying to bind to an occupied port
- Ensure you're using `process.env.PORT`

#### Error: "Health check failed"
- Check if `/api/health` endpoint is accessible
- Verify response time is under 30 seconds
- Check network configuration

### Step 7: Railway-Specific Environment Variables

Railway automatically sets these variables:
- `PORT` - Dynamic port number
- `RAILWAY_PUBLIC_DOMAIN` - Your app's public domain
- `RAILWAY_PRIVATE_DOMAIN` - Internal domain
- `NODE_ENV` - Set this to `production` manually

### Step 8: Monitor After Deployment

1. **Check Health Endpoint**:
   ```
   https://your-app.railway.app/api/health
   ```

2. **Monitor Logs**:
   - Go to Railway dashboard → Your service → Observability
   - Watch for error patterns

3. **Test API Endpoints**:
   ```
   https://your-app.railway.app/api/interns
   https://your-app.railway.app/api/dashboard/stats
   ```

### Step 9: Emergency Rollback

If deployment fails:
1. Go to Railway dashboard
2. Click **Deployments**
3. Find last working deployment
4. Click **Redeploy**

### Step 10: Get Additional Help

If issues persist:

1. **Run Local Diagnosis**:
   ```bash
   node startup-test.js
   ```

2. **Check Railway Status**:
   - Visit [Railway Status Page](https://railway.app/status)

3. **Railway Discord/Support**:
   - Join Railway Discord for community support
   - Check Railway documentation

## 🔧 Quick Fix Checklist

Before redeploying, verify:

- [ ] `NODE_ENV=production` set in Railway environment variables
- [ ] All dependencies in `package.json` under `dependencies`
- [ ] Server binds to `0.0.0.0:process.env.PORT`
- [ ] `/api/health` endpoint responds quickly
- [ ] No hardcoded file paths or localhost references
- [ ] All required files committed to repository
- [ ] Railway.toml configuration is correct

## 📊 Expected Successful Deployment Output

```
✅ Build completed successfully
✅ Service started successfully
✅ Health check passed
🌐 Service is live at: https://your-app.railway.app
```

Your enhanced server configuration should now deploy successfully on Railway! 🚀