# Fix: "Preview Service Not Enabled" Error

This error means Contentstack's Live Preview service isn't properly configured. Here's how to fix it:

## Step 1: Verify Environment Variables

Check your `.env` file has these variables set:

```env
VITE_CONTENTSTACK_LIVE_PREVIEW=true
VITE_CONTENTSTACK_PREVIEW_TOKEN=your_preview_token_here
VITE_CONTENTSTACK_API_KEY=your_api_key
VITE_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
VITE_CONTENTSTACK_ENVIRONMENT=production
```

**Critical**: The preview token must match the one in Contentstack Settings.

## Step 2: Enable Preview Service in Contentstack

1. Go to **Contentstack** → Your Stack → **Settings** → **Live Preview**
2. Make sure **"Enable Live Preview"** is turned **ON**
3. If it's off, turn it on and save

## Step 3: Get/Verify Preview Token

1. Go to **Contentstack** → Your Stack → **Settings** → **Tokens**
2. Click **"Delivery Tokens"** tab
3. Look for a token with type **"Preview"** (not Delivery)
4. If you don't have one:
   - Click **"Create New Token"**
   - Select **"Preview Token"** (not Delivery Token)
   - Set **Allowed Domains**: `http://localhost:5173` (for local) and your Launch URL (for production)
   - Set **Allowed Environments**: your environment (e.g., `production`)
   - Click **"Create"**
   - Copy the token (starts with `cs...`)

## Step 4: Update .env File

1. Open `.env` file in your project root
2. Set `VITE_CONTENTSTACK_PREVIEW_TOKEN` to the token from Step 3
3. Make sure `VITE_CONTENTSTACK_LIVE_PREVIEW=true`
4. Save the file

## Step 5: Configure Preview URLs in Contentstack

For **Homepage** content type:
1. Go to **Content Types** → **Homepage** → **Settings** → **Live Preview**
2. Set **Preview URL** to:
   ```
   http://localhost:5173/?content_type_uid=homepage&entry_uid={entry_uid}
   ```

For **Login Page** content type:
1. Go to **Content Types** → **Login Page** → **Settings** → **Live Preview**
2. Set **Preview URL** to:
   ```
   http://localhost:5173/login?content_type_uid=login&entry_uid={entry_uid}
   ```

For **Get Started Page** content type:
1. Go to **Content Types** → **Get Started Page** → **Settings** → **Live Preview**
2. Set **Preview URL** to:
   ```
   http://localhost:5173/get-started?content_type_uid=get_started&entry_uid={entry_uid}
   ```

## Step 6: Restart Dev Server

After updating `.env`:
1. Stop dev server (Ctrl+C)
2. Run `npm run dev` again
3. Environment variables are only loaded on startup

## Step 7: Test Live Preview

1. Open a content entry in Contentstack
2. Click **"Live Preview"** button
3. The preview pane should load without the error

## Troubleshooting

### Still seeing "Preview Service Not Enabled"?

1. **Check browser console** (F12) for errors:
   - Look for warnings about missing preview token
   - Check if `VITE_CONTENTSTACK_LIVE_PREVIEW=true` is detected

2. **Verify token format**:
   - Preview tokens usually start with `cs`
   - Make sure there are no extra spaces or quotes

3. **Check Contentstack Stack Settings**:
   - Go to **Settings** → **Live Preview**
   - Verify **"Enable Live Preview"** is checked
   - Make sure the service is enabled for your region

4. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

5. **Verify environment variables**:
   - Open browser console
   - Type: `import.meta.env.VITE_CONTENTSTACK_LIVE_PREVIEW`
   - Should return `"true"` (as a string)
   - Type: `import.meta.env.VITE_CONTENTSTACK_PREVIEW_TOKEN`
   - Should return your token (not undefined)

### Token Validation

The code checks if preview token exists. If you see this warning in console:
```
⚠️ Live Preview init skipped: no preview token
```

It means:
- `.env` file doesn't have `VITE_CONTENTSTACK_PREVIEW_TOKEN`
- Or the token value is empty/whitespace
- Fix: Add the token to `.env` and restart dev server

## Common Issues

### Issue: Token works but still shows error
- **Solution**: Clear browser cache and hard refresh
- Verify Preview URLs are set correctly in Contentstack

### Issue: Works locally but not on Launch
- **Solution**: 
  1. Set Preview URLs to your Launch URL (not localhost)
  2. Make sure Launch environment variables include preview token
  3. Add Launch URL to token's Allowed Domains in Contentstack

### Issue: Error appeared after adding Login/Get Started pages
- **Solution**: 
  1. Make sure Preview URLs are configured for ALL content types
  2. Each content type needs its own Preview URL in Contentstack Settings

## Quick Checklist

✅ `.env` has `VITE_CONTENTSTACK_LIVE_PREVIEW=true`  
✅ `.env` has `VITE_CONTENTSTACK_PREVIEW_TOKEN=<your-token>`  
✅ Contentstack → Settings → Live Preview → **Enabled**  
✅ Preview Token exists in Contentstack → Settings → Tokens  
✅ Preview URLs configured for Homepage, Login, Get Started  
✅ Dev server restarted after changing `.env`  
✅ Browser cache cleared  

After completing these steps, the error should be resolved! 🎉

