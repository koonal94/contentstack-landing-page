# Local Development Setup Guide

If your local website (`http://localhost:5174/`) is not showing content after deploying to GitHub/Launch, follow these steps.

## Problem: Missing `.env` File

Your project requires a `.env` file with Contentstack credentials. Without it, the app cannot fetch content.

## Solution: Create `.env` File

### Step 1: Create `.env` File

In your project root folder (`C:\Users\kunal.chavan\Project_two`), create a file named `.env` (exactly, with the dot at the beginning).

**Windows PowerShell:**
```powershell
cd C:\Users\kunal.chavan\Project_two
New-Item -Path .env -ItemType File
```

**Or manually:**
1. Open your project folder in File Explorer
2. Create a new file named `.env` (make sure it starts with a dot)
3. If Windows asks about the file extension, click "Yes" to confirm

### Step 2: Add Your Contentstack Credentials

Open the `.env` file and add these variables (replace with your actual values):

```env
# Required: Get these from Contentstack
VITE_CONTENTSTACK_API_KEY=your_api_key_here
VITE_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token_here
VITE_CONTENTSTACK_ENVIRONMENT=production

# Optional: For Live Preview
VITE_CONTENTSTACK_PREVIEW_TOKEN=your_preview_token_here
VITE_CONTENTSTACK_LIVE_PREVIEW=true

# Optional: Region (defaults to US)
VITE_CONTENTSTACK_REGION=US

# Optional: Locale (defaults to en-us)
VITE_CONTENTSTACK_LOCALE=en-us

# Optional: Content Type and Entry UID
VITE_CONTENTSTACK_CONTENT_TYPE_UID=homepage
# VITE_CONTENTSTACK_ENTRY_UID=blt52f55d310152b306

# Optional: Use Preview API for draft content
VITE_CONTENTSTACK_USE_PREVIEW=false
```

### Step 3: Get Your Credentials from Contentstack

1. **API Key:**
   - Go to Contentstack → Your Stack → **Settings** → **Stack**
   - Copy the **API Key**

2. **Delivery Token:**
   - Go to **Settings** → **Tokens** → **Delivery Tokens**
   - If you don't have one, create a new Delivery Token
   - Copy the token value

3. **Environment:**
   - Usually `production` or `development`
   - Check your Contentstack environments

4. **Preview Token (for Live Preview):**
   - Go to **Settings** → **Tokens** → **Preview Tokens**
   - Create one if it doesn't exist
   - Copy the token value

### Step 4: Restart Dev Server

After creating the `.env` file:

1. **Stop the current dev server** (Ctrl+C in terminal)
2. **Restart it:**
   ```bash
   npm run dev
   ```
3. **Open** `http://localhost:5174/` (or the port shown)

### Step 5: Verify It Works

- ✅ You should see content from Contentstack
- ✅ If Live Preview is enabled, edit buttons should appear in Contentstack editor
- ✅ Check browser console for any errors

---

## Troubleshooting

### Still Not Working?

1. **Check `.env` file location:**
   - Must be in project root: `C:\Users\kunal.chavan\Project_two\.env`
   - Not in `src/` or any subfolder

2. **Verify file name:**
   - Must be exactly `.env` (with the dot)
   - Not `.env.txt` or `env`

3. **Check environment variables:**
   - All `VITE_` variables must start with `VITE_`
   - No quotes around values (unless the value itself needs quotes)
   - No spaces around `=` sign

4. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors like "Contentstack env vars missing"
   - Check Network tab for API calls to Contentstack

5. **Verify credentials:**
   - API Key and Delivery Token must be correct
   - Environment name must match exactly (case-sensitive)
   - Make sure tokens are active in Contentstack

6. **Restart dev server:**
   - Vite needs to be restarted to read new `.env` variables
   - Close terminal completely and restart

### Common Errors

**Error: "Contentstack env vars missing"**
- ❌ `.env` file doesn't exist or is in wrong location
- ❌ Variables are not prefixed with `VITE_`
- ❌ File name is wrong (`.env.txt` instead of `.env`)

**Error: "Failed to fetch" or Network errors**
- ❌ API Key or Delivery Token is incorrect
- ❌ Environment name doesn't match
- ❌ Check internet connection

**Error: "No entry resolved"**
- ❌ Entry doesn't exist or isn't published
- ❌ Wrong Entry UID
- ❌ Content Type UID doesn't match

---

## Important Notes

### `.env` File Should NOT Be Committed to Git

The `.env` file is already in `.gitignore`, so it won't be committed. This is correct!

**Why?**
- Contains sensitive API keys and tokens
- Should be different for each developer
- Production uses Launch environment variables (not `.env` file)

### Production vs Local

- **Local (`npm run dev`)**: Uses `.env` file
- **Production (Launch)**: Uses environment variables set in Launch dashboard
- These can have different values (e.g., different environments)

---

## Quick Reference

### Required Variables (Minimum)
```env
VITE_CONTENTSTACK_API_KEY=...
VITE_CONTENTSTACK_DELIVERY_TOKEN=...
VITE_CONTENTSTACK_ENVIRONMENT=production
```

### With Live Preview
```env
VITE_CONTENTSTACK_API_KEY=...
VITE_CONTENTSTACK_DELIVERY_TOKEN=...
VITE_CONTENTSTACK_ENVIRONMENT=production
VITE_CONTENTSTACK_PREVIEW_TOKEN=...
VITE_CONTENTSTACK_LIVE_PREVIEW=true
```

### File Location
```
Project_two/
  ├── .env          ← HERE (root folder)
  ├── package.json
  ├── src/
  └── ...
```

---

## After Setting Up `.env`

1. ✅ Restart dev server: `npm run dev`
2. ✅ Open `http://localhost:5174/`
3. ✅ You should see your Contentstack content
4. ✅ Test Live Preview in Contentstack editor

If you still have issues, check the browser console (F12) for specific error messages.

