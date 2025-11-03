# Running Both Local and Launch Simultaneously

This guide explains how to set up your project so both **local development** and **Launch deployment** can fetch and run content independently.

## How It Works

- **Local Development** (`http://localhost:5174/`): Uses `.env` file in your project
- **Launch Production** (`https://contentstack-landing-page-prod.contentstackapps.com/`): Uses environment variables set in Launch dashboard
- Both can use the **same Contentstack credentials** or **different ones** (e.g., different environments)

## Current Setup

Your `.env` file is already configured! ✅

```env
VITE_CONTENTSTACK_API_KEY=bltcdbfef2a573c2c4c
VITE_CONTENTSTACK_DELIVERY_TOKEN=csfba9c4a3d9ccd52ddc73a12f
VITE_CONTENTSTACK_ENVIRONMENT=production
VITE_CONTENTSTACK_REGION=US
VITE_CONTENTSTACK_LIVE_PREVIEW=true
VITE_CONTENTSTACK_PREVIEW_TOKEN=cs3f204c34d6cd4bfe608c5b84
VITE_CONTENTSTACK_USE_PREVIEW=false
```

## Running Local Development

### Step 1: Start Dev Server

```bash
npm run dev
```

The server will start on `http://localhost:5174/` (or next available port).

### Step 2: Verify Content is Loading

1. Open `http://localhost:5174/` in your browser
2. You should see content from Contentstack
3. Check browser console (F12) for any errors

### Step 3: Test Live Preview (Optional)

1. Open an entry in Contentstack editor
2. Click "Live Preview"
3. Set Preview URL to: `http://localhost:5174/`
4. You should see your local site in the preview pane

## Launch Configuration

### Environment Variables in Launch

Make sure Launch has the **same** or **matching** environment variables:

Go to: **Launch → Your Project → Settings → Environment Variables**

```
VITE_CONTENTSTACK_API_KEY=bltcdbfef2a573c2c4c
VITE_CONTENTSTACK_DELIVERY_TOKEN=csfba9c4a3d9ccd52ddc73a12f
VITE_CONTENTSTACK_ENVIRONMENT=production
VITE_CONTENTSTACK_REGION=US
VITE_CONTENTSTACK_LOCALE=en-us
VITE_CONTENTSTACK_CONTENT_TYPE_UID=homepage
VITE_CONTENTSTACK_LIVE_PREVIEW=true
VITE_CONTENTSTACK_PREVIEW_TOKEN=cs3f204c34d6cd4bfe608c5b84
VITE_CONTENTSTACK_USE_PREVIEW=false
```

**Note**: Launch environment variables are used during **build time** and embedded in the JavaScript bundle.

## Using Different Environments

You can use **different environments** for local vs. Launch:

### Scenario 1: Local Development, Launch Production

**Local `.env`:**
```env
VITE_CONTENTSTACK_ENVIRONMENT=development
```

**Launch Environment Variable:**
```
VITE_CONTENTSTACK_ENVIRONMENT=production
```

This lets you:
- ✅ Test changes locally against `development` environment
- ✅ Launch shows published content from `production` environment
- ✅ Both work independently

### Scenario 2: Same Environment (Recommended for Most Cases)

**Both use:**
```env
VITE_CONTENTSTACK_ENVIRONMENT=production
```

This ensures:
- ✅ Local and Launch show the same content
- ✅ Easier testing before deploying
- ✅ Consistent experience

## Troubleshooting

### Local Not Loading Content

1. **Check `.env` file exists** in project root
2. **Verify credentials** are correct:
   - API Key matches Contentstack Settings
   - Delivery Token is active
   - Environment name matches exactly (case-sensitive)
3. **Restart dev server** after changing `.env`:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
4. **Check browser console** (F12) for errors:
   - "Contentstack env vars missing" → `.env` file issue
   - Network errors → API credentials issue

### Launch Not Loading Content

1. **Check Launch environment variables** match `.env` values
2. **Verify deployment** was successful (check Launch logs)
3. **Check published content** in Contentstack:
   - Entry must be published to the environment specified in Launch
4. **Hard refresh** browser (Ctrl+Shift+R)

### Both Working But Showing Different Content

This is normal if:
- ✅ Different environments configured (local=development, Launch=production)
- ✅ One has cached data, other has fresh data
- ✅ Entry published to one environment but not the other

## Best Practices

### 1. Keep Credentials in Sync

If you change credentials in Contentstack:
- ✅ Update `.env` file locally
- ✅ Update Launch environment variables
- ✅ Redeploy Launch (if needed)

### 2. Use Same Environment for Testing

For easier testing:
- ✅ Use `production` environment in both local and Launch
- ✅ Test locally before deploying
- ✅ Both show the same content

### 3. Separate Environments for Safety

For safer development:
- ✅ Local uses `development` environment
- ✅ Launch uses `production` environment
- ✅ Test in development before publishing to production

## Quick Reference

### Start Local Development
```bash
npm run dev
# Opens at http://localhost:5174/
```

### Deploy to Launch
```bash
git add .
git commit -m "Your changes"
git push origin main
# Launch auto-deploys (if enabled)
```

### Check Both Are Working
- **Local**: `http://localhost:5174/`
- **Launch**: `https://contentstack-landing-page-prod.contentstackapps.com/`

### Verify Content
Both should:
- ✅ Show content from Contentstack
- ✅ Load without errors
- ✅ Display your homepage entry

## Testing Workflow

1. **Make changes locally**
   ```bash
   npm run dev
   # Test at http://localhost:5174/
   ```

2. **When ready, push to Launch**
   ```bash
   git push origin main
   # Launch deploys automatically
   ```

3. **Verify both environments**
   - ✅ Local still works
   - ✅ Launch shows updated code
   - ✅ Both fetch from Contentstack

## Content Updates Workflow

When you publish entries in Contentstack:

### Local Development
- ✅ **No redeployment needed**
- ✅ Content updates automatically (fetches on page load)
- ✅ Refresh browser to see changes
- ✅ Wait 1-2 minutes if CDN cached

### Launch Production
- ✅ **No redeployment needed**
- ✅ Content updates automatically (fetches on page load)
- ✅ Hard refresh browser (Ctrl+Shift+R)
- ✅ Wait 2-5 minutes if CDN cached

**Both work the same way for content updates!**

## Code Updates Workflow

When you change React components or code:

### Local Development
- ✅ Code changes reflect immediately (Vite hot reload)
- ✅ No restart needed for most changes
- ✅ Restart server if you change `.env`

### Launch Production
- ✅ Push code to GitHub
- ✅ Launch auto-deploys (or manually redeploy)
- ✅ Wait 2-5 minutes for deployment
- ✅ Site updates with new code

## Summary

✅ **Local Development**: Uses `.env` file, runs on `localhost:5174`
✅ **Launch Production**: Uses Launch environment variables, runs on Launch URL
✅ **Both fetch from Contentstack**: Using the credentials you configure
✅ **Both update automatically**: When you publish content in Contentstack
✅ **Work independently**: Can use same or different environments

Your setup is ready! Both local and Launch should now work together. 🎉

