# Fix: "Preview Service Not Enabled" / "Migration to Preview Service Required"

This error means Contentstack's **Preview Service** needs to be enabled and properly configured. Follow these steps:

## Step 1: Enable Preview Service in Contentstack

1. Log in to **Contentstack**
2. Go to your **Stack** → **Settings** → **Live Preview**
3. Make sure **"Enable Live Preview"** toggle is **ON** ✅
4. If it's off, turn it **ON** and click **Save**

## Step 2: Verify Preview Token

1. Go to **Settings** → **Tokens**
2. Look for a token with type **"Preview Token"** (not Delivery Token)
3. If you don't have one:
   - Click **"Create New Token"**
   - Select **"Preview Token"** (important: not Delivery Token)
   - Set **Allowed Domains**: 
     - `http://localhost:5173` (for local development)
     - Your Launch URL (for production, e.g., `https://your-site.contentstackapps.com`)
   - Set **Allowed Environments**: Your environment (e.g., `production`)
   - Click **"Create"**
   - **Copy the token** (starts with `cs...`)

## Step 3: Update .env File

Make sure your `.env` file has:

```env
VITE_CONTENTSTACK_LIVE_PREVIEW=true
VITE_CONTENTSTACK_PREVIEW_TOKEN=your_preview_token_here
VITE_CONTENTSTACK_API_KEY=your_api_key
VITE_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
VITE_CONTENTSTACK_ENVIRONMENT=production
```

**Important**: 
- Replace `your_preview_token_here` with the Preview Token from Step 2
- Make sure there are **no spaces or quotes** around the token value
- The token should be on one line

## Step 4: Restart Dev Server

After updating `.env`:

1. **Stop** your dev server (Ctrl+C)
2. **Restart** it: `npm run dev`
3. Environment variables are only loaded on startup

## Step 5: Verify Configuration

Open browser console (F12) and check:

1. Look for: `✅ Live Preview initialized` (no errors)
2. If you see warnings about missing preview token, check your `.env` file again

## Step 6: Test Live Preview

1. Open an entry in Contentstack
2. Click **"Live Preview"** button
3. The "Preview Service Not Enabled" error should be gone

## Troubleshooting

### Still seeing "Preview Service Not Enabled"?

1. **Check Contentstack Stack Settings**:
   - Settings → Live Preview → "Enable Live Preview" must be **ON**
   - If it's off, Contentstack won't activate Preview Service

2. **Verify Token Format**:
   - Preview tokens usually start with `cs`
   - Make sure `.env` has the token without quotes: `VITE_CONTENTSTACK_PREVIEW_TOKEN=cs123...`
   - Not: `VITE_CONTENTSTACK_PREVIEW_TOKEN="cs123..."` ❌

3. **Check Token Permissions**:
   - In Contentstack → Settings → Tokens
   - Make sure your Preview Token has:
     - Correct **Allowed Domains** (includes your localhost or Launch URL)
     - Correct **Allowed Environments** (matches your `VITE_CONTENTSTACK_ENVIRONMENT`)

4. **Clear Browser Cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

5. **Verify Environment Variables Loaded**:
   - In browser console, type: `import.meta.env.VITE_CONTENTSTACK_LIVE_PREVIEW`
   - Should return: `"true"` (as a string)
   - Type: `import.meta.env.VITE_CONTENTSTACK_PREVIEW_TOKEN`
   - Should return your token (not `undefined`)

## What Changed in the Code

The code has been updated to follow Contentstack V3 SDK pattern:
- Preview token is **only** in `stackSdk.live_preview.preview_token` (not in `stackDetails`)
- This matches the official V3 SDK documentation
- Preview Service host is correctly configured (`rest-preview.contentstack.com`)

If you still see the error after following all steps, the issue is likely in Contentstack settings - make sure "Enable Live Preview" is turned ON in Stack Settings.

