---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 304502202d2690fd3482cca04a725614186b1b491d1dc6180f8765e993004113bdf7cbc9022100c0ef325b1276dd8d9d9a6901050def51846bec2765650c8d2df492e27b854721
    ReservedCode2: 304502210085f4b9980a8b4d9e5a5c66f1ec786aca046cc82d5bf493a1a9bf1f655b40961302207e61e3b3741caf9944499ba0ef04aa3dc343d103e3d73264fd9087b91d51fd4c
---

# JRM FreeSMS API - Complete Render Deployment Guide

## 📋 What You'll Need
- GitHub account
- Render account (free)
- Your SMS API files ready
- 10-15 minutes for setup

## 🚀 Step-by-Step Deployment Process

### STEP 1: Create GitHub Repository

1. **Go to GitHub**
   - Visit [GitHub.com](https://github.com) and sign in
   - If you don't have account, create one (free)

2. **Create New Repository**
   - Click the green "New" button or "+" icon in top right
   - Select "New repository"
   - Repository name: `jrmfreesms` (or any name you prefer)
   - Description: "JRM FreeSMS API - Secure SMS service"
   - Set to **Public** (required for free Render hosting)
   - ✅ Check "Add a README file"
   - Click "Create repository"

### STEP 2: Upload Your API Files

**You need to upload these 3 files from your `jrmfreesms` folder:**

1. **server.js** - Main API application
2. **package.json** - Dependencies configuration  
3. **render.yaml** - Render deployment configuration

**Upload Method A: GitHub Web Interface (Easiest)**

1. In your new repository, click "uploading an existing file" link
2. Drag and drop all 3 files or click "choose your files"
3. Add commit message: "Initial commit - JRM FreeSMS API with host protection"
4. Click "Commit changes"

**Upload Method B: Git Commands (Advanced)**
```bash
git clone https://github.com/YOUR_USERNAME/jrmfreesms.git
cd jrmfreesms
# Copy your 3 files here
git add .
git commit -m "Initial commit - JRM FreeSMS API with host protection"
git push origin main
```

### STEP 3: Create Render Account

1. **Go to Render**
   - Visit [Render.com](https://render.com)
   - Click "Sign Up"

2. **Choose GitHub Sign Up** (Recommended)
   - Click "Continue with GitHub"
   - Authorize Render to access your GitHub account
   - Grant access to repositories when prompted

### STEP 4: Connect Your Repository

1. **Create Web Service**
   - In Render dashboard, click "New +"
   - Select "Web Service"

2. **Connect Repository**
   - Choose "Build and deploy from a Git repository"
   - Find your `jrmfreesms` repository in the list
   - Click "Connect" next to it

### STEP 5: Configure Service Settings

**Fill out these exact settings:**

**Basic Configuration:**
- **Name**: `jrmph-freesmsapi` (this will be part of your URL)
- **Region**: Select closest to your location (Singapore/Tokyo recommended for PH)
- **Branch**: `main`
- **Root Directory**: Leave EMPTY
- **Runtime**: `Node`

**Build and Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Auto-Deploy:**
- ✅ Enable "Auto-Deploy" (recommended for updates)

### STEP 6: Add Environment Variables

1. **Scroll to Environment Section**
2. **Click "Add Environment Variable"** for each:

| Variable Name | Value | Purpose |
|---------------|-------|---------|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Port (Render sets this automatically) |

3. **Click "Add" for each variable**

### STEP 7: Deploy!

1. **Click "Create Web Service"** at the bottom
2. **Wait for Build Process** (2-3 minutes)
   - You'll see real-time logs
   - Green progress bar shows build status

3. **Deployment Complete** ✅
   - Status changes from "Building..." to "Live"
   - You'll get your live URL

### STEP 8: Get Your Live URL

**Your API will be available at:**
- Base URL: `https://jrmph-freesmsapi.onrender.com`
- API Docs: `https://jrmph-freesmsapi.onrender.com/docs`
- Health Check: `https://jrmph-freesmsapi.onrender.com/health`

## 🧪 Testing Your Deployment

### Test 1: Basic Health Check
```bash
curl https://jrmph-freesmsapi.onrender.com/health
```
**Expected Response:** `{"status":"API is running","timestamp":"2025-12-11T10:18:33.000Z"}`

### Test 2: API Documentation
- Visit `https://jrmph-freesmsapi.onrender.com/docs` in your browser
- You should see interactive API documentation

### Test 3: Send SMS
```bash
curl -X POST https://jrmph-freesmsapi.onrender.com/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+639123456789",
    "message": "Hello from my deployed API!"
  }'
```

## 🔒 Security Features Active

Your API now has these protections:

✅ **Host-Based Protection**
- Only `jrmph-freesmsapi.onrender.com` works
- Blocks unauthorized hosting/clone attempts

✅ **CORS Security**
- Only your official domain allowed
- Prevents cross-origin attacks

✅ **Rate Limiting**
- 100 requests per 15 minutes per IP
- Prevents abuse and spam

✅ **Input Validation**
- Phone number format validation
- Message content sanitization
- SQL injection protection

✅ **Security Headers**
- XSS protection
- Clickjacking prevention
- Content type validation

## 🚨 Important Notes

### Free Tier Limitations
- **Sleep Mode**: Service sleeps after 15 minutes of inactivity
- **Wake Up Time**: First request after sleep takes ~30 seconds
- **Monthly Hours**: Limited to 750 hours uptime per month
- **Bandwidth**: 100GB per month

### Domain Protection How It Works
Your API checks every incoming request's **Host header**:

```javascript
// ✅ This works (your official domain)
https://jrmph-freesmsapi.onrender.com/api/send-sms

// ❌ This fails (if someone clones your code)
https://any-other-domain.com/api/send-sms
// Returns: {"error": "Access Denied", "message": "This API is only available from authorized domains."}
```

## 🛠️ Troubleshooting

### Build Fails
**Problem**: "Build failed" message
**Solution**: 
- Check that all 3 files are uploaded: `server.js`, `package.json`, `render.yaml`
- Verify `package.json` has correct structure
- Check build logs for specific errors

### Service Won't Start
**Problem**: "Service crashed" or won't start
**Solution**:
- Verify `Start Command` is `npm start`
- Check that `package.json` has `"start": "node server.js"` script
- Review runtime logs in Render dashboard

### API Returns "Access Denied"
**Problem**: Getting access denied error
**Solution**:
- Make sure you're using the correct domain: `jrmph-freesmsapi.onrender.com`
- Check that the service is "Live" status (not sleeping)
- Verify Host header is being sent correctly

### Sleep Mode Issues
**Problem**: First request takes long time
**Solution**: This is normal for free tier. Consider upgrading to paid plan for always-on service.

## 📞 Quick Commands Reference

### Local Testing
```bash
# Install dependencies
npm install

# Start locally
npm start

# Test locally
curl http://localhost:3000/health
```

### Production Testing
```bash
# Test your deployed API
curl https://jrmph-freesmsapi.onrender.com/health

# Send SMS via your API
curl -X POST https://jrmph-freesmsapi.onrender.com/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{"to": "+639123456789", "message": "Test message!"}'
```

## 🔄 Updating Your API

**For future updates:**

1. Make changes to your local files
2. Upload updated files to GitHub (same process as Step 2)
3. Render will automatically detect changes and redeploy
4. Check "Auto-Deploy" is enabled for automatic updates

## 🎯 Success Checklist

- [ ] GitHub repository created and public
- [ ] All 3 files uploaded (server.js, package.json, render.yaml)
- [ ] Render account connected to GitHub
- [ ] Web service created with correct settings
- [ ] Environment variables added (NODE_ENV=production)
- [ ] Service shows "Live" status
- [ ] Health check returns success
- [ ] API documentation accessible
- [ ] SMS sending works from your domain
- [ ] Access denied message for unauthorized domains

## 🚀 You're All Set!

Your JRM FreeSMS API is now live and protected at:
**https://jrmph-freesmsapi.onrender.com**

The API will only work from your official domain, preventing unauthorized cloning and use. Users can access your API documentation at `/docs` endpoint for complete usage instructions.

**Need help?** Check the Render dashboard logs or contact support!