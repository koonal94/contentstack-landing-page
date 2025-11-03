# Fix: Published Content Not Showing on Launch Website

If you publish entries in Contentstack but don't see updates on your Launch website (https://contentstack-landing-page-prod.contentstackapps.com/), follow these steps.

## Root Causes

1. **CDN Caching**: Contentstack's CDN may cache API responses for a few minutes
2. **Browser Caching**: Your browser may cache old responses
3. **Environment Mismatch**: Launch environment variable doesn't match where you published
4. **Cache Policy**: The app wasn't bypassing Contentstack's CDN cache

## Solution Applied

The code has been updated to:
1. ✅ **Always disable caching** in Contentstack SDK
2. ✅ **Add cache-busting parameters** to all API requests
3. ✅ **Force fresh data** on every page load

## Immediate Fixes

### 1. Verify Environment Variable in Launch

Check that `VITE_CONTENTSTACK_ENVIRONMENT` matches where you published:

1. Go to **Contentstack Launch** → Your Project → **Settings** → **Environment Variables**
2. Check `VITE_CONTENTSTACK_ENVIRONMENT` value:
   - If you published to **"production"**, it should be `production`
   - If you published to **"development"**, it should be `development`
   - **Case-sensitive!** Must match exactly

3. If it doesn't match:
   - Update the environment variable in Launch
   - **Redeploy** (this requires a redeployment since it's a config change)

### 2. Verify Entry is Published to Correct Environment

In Contentstack:
1. Go to your **Homepage** entry
2. Check **Publishing Queue** or **Entry History**
3. Verify it's published to the environment matching `VITE_CONTENTSTACK_ENVIRONMENT`
4. If not, **publish it** to the correct environment

### 3. Clear Browser Cache

After publishing:
1. **Hard refresh** the page:
   - **Windows**: `Ctrl + Shift + R` or `Ctrl + F5`
   - **Mac**: `Cmd + Shift + R`
2. Or **open in incognito/private mode** to bypass cache

### 4. Wait for CDN Cache to Expire

Contentstack's CDN typically caches for:
- **2-5 minutes** for published content
- Sometimes up to **10 minutes** during high traffic

Wait 2-5 minutes after publishing and refresh the page.

### 5. Deploy Updated Code

The code has been updated with better cache-busting. To get the fix:

```bash
# 1. Commit the changes
git add .
git commit -m "Fix: Add cache-busting for production content updates"

# 2. Push to GitHub
git push origin main

# 3. Launch will auto-deploy (or manually redeploy)
```

## Verification Steps

### Step 1: Check Launch Environment Variables

1. Launch → Project → Settings → Environment Variables
2. Verify these match Contentstack:
   - `VITE_CONTENTSTACK_ENVIRONMENT` = `production` (or your environment)
   - `VITE_CONTENTSTACK_API_KEY` = Your API key
   - `VITE_CONTENTSTACK_DELIVERY_TOKEN` = Your delivery token

### Step 2: Check Contentstack Publishing

1. Contentstack → Homepage entry
2. Check **"Published to"** section
3. Verify it shows your environment (e.g., "production")
4. If not published, click **"Publish"** and select the environment

### Step 3: Test in Browser

1. Open your Launch URL: `https://contentstack-landing-page-prod.contentstackapps.com/`
2. Open **Developer Tools** (F12)
3. Go to **Network** tab
4. **Hard refresh** (Ctrl+Shift+R)
5. Look for API calls to `cdn.contentstack.io`
6. Check response - should contain your latest content

### Step 4: Check Browser Console

1. Open **Console** tab (F12)
2. Look for:
   - ✅ `[HOME] Added cache-busting params for production` - Good!
   - ❌ Errors about missing environment variables
   - ❌ Network errors to Contentstack

## Common Issues & Solutions

### Issue: "Still not seeing updates after publishing"

**Solutions:**
1. ✅ Wait 2-5 minutes (CDN cache)
2. ✅ Hard refresh browser (Ctrl+Shift+R)
3. ✅ Check environment variable matches published environment
4. ✅ Verify entry is actually published (check Publishing Queue)
5. ✅ Try incognito/private window
6. ✅ Check browser console for errors

### Issue: "Environment mismatch"

**Problem**: You published to "production" but Launch has `VITE_CONTENTSTACK_ENVIRONMENT=development`

**Solution:**
1. Update Launch environment variable to match
2. **Redeploy** (config change requires redeployment)

### Issue: "Entry not found"

**Problem**: Entry isn't published or wrong environment

**Solution:**
1. Publish entry to correct environment
2. Wait 2-3 minutes
3. Refresh page

### Issue: "Network errors in console"

**Problem**: API credentials or network issue

**Solution:**
1. Verify API key and delivery token in Launch
2. Check internet connection
3. Verify Contentstack stack is active

## How Cache-Busting Works

The updated code now:

1. **Disables SDK caching**: `stack.setCachePolicy(Contentstack.CachePolicy.IGNORE_CACHE)`
2. **Adds timestamp parameters**: `_cb`, `_t`, `_timestamp` to API requests
3. **Forces fresh data**: Every request gets a unique timestamp to bypass CDN cache

This ensures:
- ✅ Published content appears immediately (within 1-2 minutes)
- ✅ No stale cached data
- ✅ Fresh content on every page load

## Testing the Fix

1. **Make a small change** in Contentstack (e.g., change hero heading)
2. **Publish** to production environment
3. **Wait 1-2 minutes**
4. **Hard refresh** your Launch website (Ctrl+Shift+R)
5. **Verify** the change appears

If it doesn't appear after 2-3 minutes:
- Check environment variable
- Check Publishing Queue
- Check browser console for errors
- Try incognito window

## Long-Term Solution

After deploying the updated code:
- ✅ All requests will have cache-busting
- ✅ Contentstack CDN cache will be bypassed
- ✅ Published content will appear within 1-2 minutes (instead of 5-10 minutes)
- ✅ No code changes needed for future updates

## Summary

**Quick Fix (No Code Deploy):**
1. Verify environment variable in Launch matches published environment
2. Hard refresh browser (Ctrl+Shift+R)
3. Wait 2-5 minutes for CDN cache to expire

**Permanent Fix (Requires Code Deploy):**
1. Deploy the updated code (better cache-busting)
2. Future updates will appear faster (1-2 minutes instead of 5-10)

**Most Common Issue:**
Environment variable mismatch - check `VITE_CONTENTSTACK_ENVIRONMENT` in Launch matches where you published in Contentstack.

