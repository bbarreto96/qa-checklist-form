# Vercel Deployment Guide - QA Checklist Form

## 🚀 Quick Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy the Application
```bash
vercel --prod
```

## 🔐 Environment Variables Setup

**CRITICAL**: You must set these environment variables in your Vercel dashboard before deployment:

### Required Environment Variables:
1. `GOOGLE_SHEETS_CLIENT_EMAIL` - Your Google Service Account email
2. `GOOGLE_SHEETS_PRIVATE_KEY` - Your Google Service Account private key
3. `GOOGLE_SHEETS_SPREADSHEET_ID` - Your Google Sheets spreadsheet ID
4. `GOOGLE_SHEETS_SHEET_NAME` - The sheet name (optional, defaults to "QA Reports")

### How to Set Environment Variables in Vercel:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add each variable:
   - **Name**: Variable name (e.g., `GOOGLE_SHEETS_CLIENT_EMAIL`)
   - **Value**: The actual value from your `.env.local` file
   - **Environment**: Select "Production", "Preview", and "Development"

### ⚠️ Security Notes:
- Never commit `.env.local` to git (already in .gitignore ✅)
- Copy values exactly from your local `.env.local` file
- For `GOOGLE_SHEETS_PRIVATE_KEY`, include the full key with quotes and newlines

## 📱 Mobile Optimization Features

This deployment includes:
- ✅ PWA (Progressive Web App) support
- ✅ Offline functionality with service worker
- ✅ Mobile-responsive design
- ✅ Touch-friendly interface (44px minimum touch targets)
- ✅ iOS/iPad optimization
- ✅ Background sync for offline form submissions

## 🔧 Deployment Configuration

The `vercel.json` file includes:
- Security headers (XSS protection, content type options)
- PWA optimization (service worker, manifest caching)
- API route configuration with 30-second timeout
- Mobile-optimized caching strategies

## 📊 Post-Deployment Checklist

After deployment:
1. ✅ Test the application on mobile devices
2. ✅ Verify offline functionality works
3. ✅ Test form submission to Google Sheets
4. ✅ Check PWA installation on iOS/Android
5. ✅ Verify all environment variables are working

## 🌐 Accessing the Application

Once deployed, your team can:
- Bookmark the Vercel URL for easy access
- Install as a PWA on their devices (Add to Home Screen)
- Use offline when internet connectivity is limited
- Sync data automatically when back online

## 🔄 Future Updates

To update the application:
```bash
git add .
git commit -m "Update description"
git push origin main
```

Vercel will automatically redeploy on git push to main branch.
