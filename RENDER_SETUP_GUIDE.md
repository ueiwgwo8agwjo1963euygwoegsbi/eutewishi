---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022100f63a0a9bacb3ce5f491730bda1addc8821034d3cae8333f66a3eb79a29c5705302203da5a2d4815061e3961f1e35814502c3cd7fa6d5a3ff8579d93303416280c12b
    ReservedCode2: 3046022100c81c7fdb6e36341b39f8fa2c6496d61d245253399bafef5445ff5b23e481e93d022100b00a9af2220cb0ae2adb94c302be25f047f39061d3af54581862ae1f77b24cf0
---

# JRM FreeSMS - Render Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Prepare Your Repository
First, you need to create a GitHub repository for your project:

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" button in the top right corner
3. Select "New repository"
4. Name it `jrmfreesms` (or your preferred name)
5. Make it **Public** (free Render accounts only support public repos)
6. Click "Create repository"

### 2. Upload Your Files
You have two options:

#### Option A: Upload via GitHub Web Interface
1. In your new repository, click "uploading an existing file"
2. Upload these 3 files from your `jrmfreesms` folder:
   - `server.js`
   - `package.json`
   - `render.yaml`

#### Option B: Use Git Commands
```bash
git init
git add .
git commit -m "Initial commit - JRM FreeSMS API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jrmfreesms.git
git push -u origin main
```

### 3. Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up using your GitHub account (recommended)
3. Authorize Render to access your repositories

### 4. Create New Web Service
1. In your Render dashboard, click "New +"
2. Select "Web Service"
3. Choose "Build and deploy from a Git repository"
4. Find and select your `jrmfreesms` repository
5. Click "Connect"

### 5. Configure Service Settings
Fill in these details:

**Basic Settings:**
- **Name**: `jrmph-freesmsapi` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (use root)
- **Runtime**: `Node`

**Build and Deploy Settings:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 6. Environment Variables
Add these environment variables in the Render dashboard:

1. Scroll down to "Environment" section
2. Click "Add Environment Variable"
3. Add these variables:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Render will set this automatically |

**Note**: No API key required - the API is protected by domain-based access control.

### 7. Auto-Deploy Settings
- Enable "Auto-Deploy" if you want automatic deployments on code changes

### 8. Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Start your application
   - Provide you with a live URL

### 9. Get Your Live URL
After deployment completes (usually takes 2-3 minutes):
1. You'll see a green "Live" status
2. Your API will be available at: `https://your-service-name.onrender.com`
3. Documentation at: `https://your-service-name.onrender.com/docs`

### 10. Test Your Deployment
Test your API with curl or Postman:

```bash
# Test API health
curl https://jrmph-freesmsapi.onrender.com/

# Test SMS endpoint (no API key required)
curl -X POST https://jrmph-freesmsapi.onrender.com/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+639123456789",
    "message": "Test message from Render!"
  }'
```

## Important Notes

### Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Limited to 750 hours/month of uptime

### Security Features Included
- ✅ Host-based protection (only your domain works)
- ✅ CORS enabled for your official domain
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ No API key required (domain protection instead)
- ✅ Security headers via Helmet.js
- ✅ Input validation and sanitization
- ✅ Prevents API cloning/scraping

### API Documentation
Your embedded documentation will be available at:
- **Local**: `http://localhost:3000/docs`
- **Live**: `https://your-service-name.onrender.com/docs`

## Troubleshooting

### Common Issues:
1. **Build fails**: Check that all files are uploaded correctly
2. **Service won't start**: Verify `package.json` has correct scripts
3. **Domain protection**: Only requests to `jrm-fsms-api.onrender.com` will work
4. **CORS errors**: Make sure you're using the correct domain

### Getting Help:
- Check Render logs in the dashboard
- Test locally first: `npm start`
- Verify all environment variables are set

## Quick Commands Reference

```bash
# Local development
npm install
npm start

# Test SMS endpoint locally (no API key required)
curl -X POST http://localhost:3000/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{"to": "+639123456789", "message": "Hello World!"}'

# Test from your official domain
curl -X POST https://jrmph-freesmsapi.onrender.com/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{"to": "+639123456789", "message": "Hello World!"}'
```

### 11. Domain Protection Explained
Your API now has **host-based protection** that prevents cloning:

- ✅ **Only your domain works**: `https://jrm-fsms-api.onrender.com`
- ✅ **Blocks unauthorized hosts**: If someone copies your code and hosts it elsewhere, it won't work
- ✅ **Development friendly**: Works on `localhost` for testing
- ✅ **No API keys needed**: Protection is automatic based on domain

**How it works:**
- The API checks the incoming request's `Host` header
- Only requests to `jrmph-freesmsapi.onrender.com` are allowed
- All other domains get a "Access Denied" response
- This prevents API scraping and unauthorized hosting

**Example protection in action:**
```bash
# ✅ This works (your official domain)
curl https://jrmph-freesmsapi.onrender.com/api/send-sms

# ❌ This fails (someone hosting your code elsewhere)
curl https://someone-elses-api.onrender.com/api/send-sms
# Returns: {"error": "Access Denied", "message": "This API is only available from authorized domains."}
```

Your JRM FreeSMS API is now ready for production with full protection! 🚀