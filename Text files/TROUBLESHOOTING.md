# Troubleshooting Guide

## "base is not defined" Error

This error is from **browser cache** - the file has been fixed but your browser is running old code.

### Solution 1: Hard Refresh (Recommended)
1. **Windows/Linux**: Press `Ctrl + Shift + R` or `Ctrl + F5`
2. **Mac**: Press `Cmd + Shift + R`
3. This forces the browser to reload all files from the server

### Solution 2: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or go to Application → Storage → Clear site data

### Solution 3: Restart Dev Server
1. Stop the dev server (Ctrl+C)
2. Delete `.vite` cache folder (if exists)
3. Run `npm run dev` again

## "Cannot call a class as a function" Error

This was fixed by removing the problematic Query.find() fallback. The pages now only fetch when an entry UID is provided.

### If pages show no content:
- Create and publish entries in Contentstack for Login and Get Started pages
- Or set environment variables:
  - `VITE_CONTENTSTACK_LOGIN_ENTRY_UID=<your-login-entry-uid>`
  - `VITE_CONTENTSTACK_GET_STARTED_ENTRY_UID=<your-get-started-entry-uid>`

## Live Preview Not Working

### 401 socket-auth error:
- This is a Live Preview authentication issue
- **Does NOT prevent content from loading**
- Only affects real-time Live Edit updates
- Content still loads and publishes correctly

### Edit buttons not showing:
1. Verify Preview URLs in Contentstack Settings:
   - Login: `http://localhost:5173/login?content_type_uid=login&entry_uid={entry_uid}`
   - Get Started: `http://localhost:5173/get-started?content_type_uid=get_started&entry_uid={entry_uid}`
2. Check `.env` has `VITE_CONTENTSTACK_LIVE_PREVIEW=true`
3. Verify preview token is correct
4. Hard refresh the Live Preview pane

## Pages Not Updating After Publishing

1. **Wait 1-2 minutes** (CDN cache expires)
2. **Hard refresh** the page (Ctrl+Shift+R)
3. Check browser console for errors
4. Verify entry is **published** (not just saved)

