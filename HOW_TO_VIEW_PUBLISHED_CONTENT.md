# How to See Published Content on Launch Website

This guide explains how to view the content you publish in Contentstack on your Launch hosted website.

## Quick Checklist

1. ✅ **Publish Entry in Contentstack** - Make sure your entry is published to the correct environment
2. ✅ **Verify Environment Variable** - Check that Launch environment variable matches your publish environment
3. ✅ **Wait for CDN Cache** - Contentstack CDN may cache for 1-5 minutes
4. ✅ **Hard Refresh Browser** - Clear browser cache to see updates

---

## Step-by-Step Guide

### Step 1: Publish Your Entry in Contentstack

1. Go to **Contentstack** → **Entries** → Select your entry (Homepage, Login, Get Started, etc.)
2. Click **"Publish"** button
3. **Select the environment** you want to publish to:
   - `production` (most common)
   - `development`
   - `staging` (if you have one)
4. Click **"Publish"** to confirm
5. Wait for the publish to complete (you'll see a success message)

**Important:** Note which environment you published to - you'll need this in Step 2!

---

### Step 2: Verify Environment Variable in Launch

The Launch website must be configured to fetch from the **same environment** you published to.

1. Go to **Contentstack Launch** → Your Project
2. Click **"Settings"** → **"Environment Variables"**
3. Find `VITE_CONTENTSTACK_ENVIRONMENT`
4. **Verify the value matches** where you published:
   - If you published to `production` → should be `production`
   - If you published to `development` → should be `development`
   - **Case-sensitive!** Must match exactly

**If it doesn't match:**
1. Update the environment variable value
2. **Redeploy your website** (environment variables require a redeployment)
3. Wait for deployment to complete

---

### Step 3: Check Your Launch Website

1. Open your Launch website URL (e.g., `https://your-site.contentstackapps.com`)
2. **Hard refresh** the page to clear browser cache:
   - **Windows**: `Ctrl + Shift + R` or `Ctrl + F5`
   - **Mac**: `Cmd + Shift + R`
3. Or open in **Incognito/Private mode** to bypass cache

---

### Step 4: Wait for CDN Cache (if needed)

Contentstack's CDN may cache responses for **1-5 minutes**. If you don't see updates immediately:

1. Wait 2-5 minutes
2. Hard refresh again
3. The cache-busting code in the app will help, but CDN cache may still apply

---

## Troubleshooting

### Content Still Not Showing?

#### Check 1: Verify Entry is Published
- Go to Contentstack → Your Entry
- Check **"Publishing Queue"** or **"Entry History"**
- Confirm it shows as published to the correct environment

#### Check 2: Verify Environment Variable
- Launch → Settings → Environment Variables
- `VITE_CONTENTSTACK_ENVIRONMENT` must match publish environment
- If changed, **redeploy** the website

#### Check 3: Check Browser Console
- Open browser DevTools (F12)
- Go to **Console** tab
- Look for errors like:
  - `422` errors (entry doesn't exist)
  - `401` errors (authentication issue)
  - Network errors

#### Check 4: Verify API Credentials
- Launch → Settings → Environment Variables
- Ensure these are set correctly:
  - `VITE_CONTENTSTACK_API_KEY`
  - `VITE_CONTENTSTACK_DELIVERY_TOKEN`
  - `VITE_CONTENTSTACK_ENVIRONMENT`

#### Check 5: Check Content Type UID
- Make sure your content type UID matches:
  - Homepage: `homepage`
  - Login: `login`
  - Get Started: `get_started`

---

## How It Works

1. **Contentstack** → You publish entry to an environment (e.g., `production`)
2. **Launch Website** → Uses `VITE_CONTENTSTACK_ENVIRONMENT` to fetch from that environment
3. **Delivery API** → Fetches published entries (not drafts)
4. **Cache-Busting** → Code adds timestamps to ensure fresh data
5. **Browser** → Displays the content

---

## Important Notes

- **Draft entries** will NOT show on Launch website (only in Live Preview)
- **Unpublished entries** will NOT show on Launch website
- **Environment must match** - if you publish to `production`, Launch must use `production`
- **Redeploy required** - if you change environment variables, you must redeploy
- **CDN Cache** - Contentstack CDN may cache for 1-5 minutes

---

## Quick Reference

| What You Did | What to Check |
|-------------|---------------|
| Published to `production` | Launch env var = `production` |
| Published to `development` | Launch env var = `development` |
| Changed env var | **Redeploy website** |
| Still not showing | Wait 2-5 min, hard refresh |
| 422 error | Entry not published or wrong environment |

---

## Need Help?

If content still doesn't show after following these steps:

1. Check browser console for errors
2. Verify all environment variables in Launch
3. Confirm entry is published (not just saved)
4. Ensure environment names match exactly
5. Try publishing to a different environment and updating Launch env var

