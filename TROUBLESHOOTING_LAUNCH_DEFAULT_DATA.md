# Troubleshooting: Launch Website Showing Default Data Instead of Published Entries

If your Launch website shows default/fallback data instead of your published Contentstack entries, follow these steps.

## Quick Diagnosis

Open your Launch website and check the browser console (F12 → Console tab). Look for these messages:

### ✅ Good Signs:
- `[HOME] Found entry with is_default=true: blt...` - Entry found!
- `[HOME] Found latest published entry: blt...` - Entry found!

### ❌ Problem Signs:
- `[HOME] Stack is null` - Environment variables missing
- `[HOME] VITE_CONTENTSTACK_ENVIRONMENT is not set!` - Environment variable missing
- `[HOME] No published entries found` - No entries found in that environment
- `422` errors - Entry doesn't exist or wrong environment

---

## Step-by-Step Fix

### Step 1: Verify Environment Variables in Launch

**Critical:** The environment variable must match where you published!

1. Go to **Contentstack Launch** → Your Project → **Settings** → **Environment Variables**
2. Check these variables are set:

```
VITE_CONTENTSTACK_API_KEY=your_api_key
VITE_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
VITE_CONTENTSTACK_ENVIRONMENT=production  ← MUST match where you published!
VITE_CONTENTSTACK_REGION=US
VITE_CONTENTSTACK_LOCALE=en-us
```

3. **Most Important:** `VITE_CONTENTSTACK_ENVIRONMENT` must match:
   - If you published to **"production"** → must be `production`
   - If you published to **"development"** → must be `development`
   - **Case-sensitive!** Must match exactly

4. If you changed any environment variables:
   - **Redeploy your website** (config changes require redeployment)
   - Wait for deployment to complete

---

### Step 2: Verify Entry is Published in Contentstack

1. Go to **Contentstack** → **Entries** → Your entry (Homepage, Login, etc.)
2. Check **"Published to"** section or **"Publishing Queue"**
3. Verify it shows as published to the environment matching `VITE_CONTENTSTACK_ENVIRONMENT`
4. If not published:
   - Click **"Publish"**
   - Select the correct environment
   - Click **"Publish"** to confirm
   - Wait for publish to complete

---

### Step 3: Check Browser Console for Errors

1. Open your Launch website
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for error messages:

#### Error: `[HOME] Stack is null`
**Problem:** Environment variables are missing or incorrect

**Fix:**
1. Go to Launch → Settings → Environment Variables
2. Verify all required variables are set:
   - `VITE_CONTENTSTACK_API_KEY`
   - `VITE_CONTENTSTACK_DELIVERY_TOKEN`
   - `VITE_CONTENTSTACK_ENVIRONMENT`
3. Redeploy after fixing

#### Error: `[HOME] No published entries found`
**Problem:** No entries found in the specified environment

**Fix:**
1. Check `VITE_CONTENTSTACK_ENVIRONMENT` matches where you published
2. Verify entry is actually published (not just saved)
3. Check content type UID is correct (`homepage`, `login`, `get_started`)
4. Try publishing the entry again

#### Error: `422 - The requested object doesn't exist`
**Problem:** Entry UID is invalid or entry is not published

**Fix:**
1. Clear browser storage (see Step 4)
2. Verify entry is published to correct environment
3. The code will automatically fallback to querying published entries

---

### Step 4: Clear Browser Storage

Stored entry UIDs might be pointing to draft/unpublished entries:

1. Open browser console (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** and **Session Storage**
4. Delete these keys:
   - `contentstack_entry_uid`
   - `contentstack_content_type`
   - `contentstack_homepage_last_version`
   - `contentstack_homepage_last_updated`
5. **Hard refresh** the page: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

Or use console commands:
```javascript
// Clear all Contentstack storage
sessionStorage.removeItem('contentstack_entry_uid')
sessionStorage.removeItem('contentstack_content_type')
sessionStorage.removeItem('contentstack_homepage_last_version')
sessionStorage.removeItem('contentstack_homepage_last_updated')
localStorage.removeItem('contentstack_entry_uid')
localStorage.removeItem('contentstack_content_type')
location.reload()
```

---

### Step 5: Verify API Credentials

1. Go to **Contentstack** → **Settings** → **Stack**
2. Check your **API Key** and **Delivery Token**
3. Compare with Launch environment variables:
   - `VITE_CONTENTSTACK_API_KEY` should match your API Key
   - `VITE_CONTENTSTACK_DELIVERY_TOKEN` should match your Delivery Token
4. If they don't match, update Launch environment variables and redeploy

---

### Step 6: Check Content Type UID

Make sure your content type UIDs match:

- **Homepage**: Content type UID should be `homepage`
- **Login**: Content type UID should be `login`
- **Get Started**: Content type UID should be `get_started`

To check in Contentstack:
1. Go to **Content Types**
2. Click on your content type
3. Check **"UID"** field
4. Must match exactly (case-sensitive)

---

### Step 7: Test with Browser Console

Open browser console and check what's happening:

```javascript
// Check environment variables (in console)
console.log('Environment:', import.meta.env.VITE_CONTENTSTACK_ENVIRONMENT)
console.log('Content Type:', import.meta.env.VITE_CONTENTSTACK_CONTENT_TYPE_UID)

// Check stored UIDs
console.log('Stored UID:', sessionStorage.getItem('contentstack_entry_uid'))
console.log('Stored Content Type:', sessionStorage.getItem('contentstack_content_type'))
```

Look for console messages like:
- `[HOME] Fetching homepage entry: { environment: 'production', ... }`
- `[HOME] Not in Live Preview - querying for published entries...`
- `[HOME] Found latest published entry: blt...`

---

## Common Issues & Solutions

### Issue 1: Environment Mismatch

**Symptom:** Console shows `[HOME] No published entries found`

**Problem:** You published to "production" but Launch has `VITE_CONTENTSTACK_ENVIRONMENT=development`

**Solution:**
1. Update Launch environment variable to match
2. Redeploy website
3. Wait for deployment

---

### Issue 2: Entry Not Published

**Symptom:** Default data showing, no console errors

**Problem:** Entry is saved but not published

**Solution:**
1. Go to Contentstack → Your Entry
2. Click **"Publish"**
3. Select environment matching `VITE_CONTENTSTACK_ENVIRONMENT`
4. Wait 2-3 minutes
5. Hard refresh website

---

### Issue 3: Stored Invalid UID

**Symptom:** 422 errors in console

**Problem:** Browser has stored UID of draft/unpublished entry

**Solution:**
1. Clear browser storage (Step 4)
2. Hard refresh page
3. Code will automatically query for published entries

---

### Issue 4: Missing Environment Variables

**Symptom:** `[HOME] Stack is null` error

**Problem:** Environment variables not set in Launch

**Solution:**
1. Launch → Settings → Environment Variables
2. Add all required variables
3. Redeploy website

---

## Verification Checklist

After fixing, verify:

- [ ] Environment variable `VITE_CONTENTSTACK_ENVIRONMENT` matches published environment
- [ ] Entry is published in Contentstack (check Publishing Queue)
- [ ] API credentials are correct in Launch
- [ ] Content type UID matches (`homepage`, `login`, `get_started`)
- [ ] Browser storage cleared (if had invalid UIDs)
- [ ] Website redeployed (if changed environment variables)
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Console shows `[HOME] Found latest published entry: blt...`

---

## Still Not Working?

If you've tried all steps and still see default data:

1. **Check Network Tab:**
   - Open DevTools → Network tab
   - Hard refresh page
   - Look for requests to `cdn.contentstack.io`
   - Check response - does it contain your entry data?

2. **Check API Response:**
   - In Network tab, click on Contentstack API request
   - Check **Response** tab
   - Does it return your entry or empty array?

3. **Verify Entry Structure:**
   - In Contentstack, check your entry has all required fields
   - Make sure fields are not empty
   - Verify entry is not archived

4. **Test with Different Environment:**
   - Try publishing to a different environment
   - Update Launch environment variable to match
   - Redeploy and test

5. **Check Contentstack Stack Status:**
   - Verify your Contentstack stack is active
   - Check if there are any stack-level issues
   - Verify API rate limits haven't been exceeded

---

## Quick Fix Script

Run this in browser console to diagnose:

```javascript
// Clear all storage and reload
sessionStorage.clear()
localStorage.clear()
console.log('Storage cleared. Reloading...')
location.reload()
```

After reload, check console for:
- `[HOME] Fetching homepage entry: { environment: '...', ... }`
- `[HOME] Found latest published entry: blt...`

If you see "Found latest published entry", the data should load. If not, check the environment variable matches where you published.

