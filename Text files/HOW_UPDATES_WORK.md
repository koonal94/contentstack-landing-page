# How Content Updates Work: Local vs Launch

This guide explains how both your **local development** and **Launch website** automatically update when you publish entries in Contentstack.

## How It Works

Both local and Launch use the **same code** that fetches content from Contentstack's API on **every page load**. This means:

✅ **No redeployment needed** for content updates  
✅ **Automatic updates** when you publish entries  
✅ **Same behavior** for local and Launch  

## The Process

### 1. You Publish an Entry in Contentstack

1. Go to Contentstack → Your Stack → Homepage Entry
2. Edit any field (e.g., change hero heading)
3. Click **"Publish"**
4. Select your environment (e.g., "production")
5. Click **"Publish"** to confirm

### 2. Contentstack Makes Content Available

- Entry is published to the selected environment
- Content is available via Contentstack's Delivery API
- Usually takes **10-30 seconds** for API to reflect changes

### 3. Website Fetches Fresh Content

Both **local** and **Launch** websites:

1. **Load the page** (user visits or refreshes)
2. **Fetch content** from Contentstack API (on every page load)
3. **Display the new content** immediately

**No redeployment needed!** The code already fetches content dynamically.

## Code That Makes This Work

### App.jsx - Fetches on Load

```javascript
async function load() {
  const fetchedEntry = await fetchHomepage()  // ← Fetches from Contentstack API
  const mapped = mapHomepage(fetchedEntry)
  setCmsData(mapped)
  // ... displays content
}
load()  // ← Runs on every page load
```

### homepage.js - API Call

```javascript
export async function fetchHomepage() {
  const stack = getStack()  // ← Uses credentials from .env (local) or Launch env vars
  
  // Fetches from Contentstack Delivery API
  const entry = await stack
    .ContentType('homepage')
    .Entry(entryUid)
    .fetch()
  
  return entry  // ← Returns fresh content
}
```

**Key Point**: This happens on **every page load**, not just once at build time!

## Timeline Comparison

### Local Development
```
You publish entry
    ↓
Wait 10-30 seconds (API propagation)
    ↓
Refresh browser (F5)
    ↓
✅ New content appears immediately
```

### Launch Website
```
You publish entry
    ↓
Wait 10-30 seconds (API propagation)
    ↓
Wait 1-2 minutes (CDN cache) ← Slightly longer
    ↓
Hard refresh browser (Ctrl+Shift+R)
    ↓
✅ New content appears
```

**Difference**: Launch may take 1-2 minutes longer due to CDN caching, but content updates automatically!

## Why Launch Takes Slightly Longer

### CDN Caching
- **Launch** is behind a CDN (Content Delivery Network)
- CDN caches API responses for faster loading
- Cache expires after **1-2 minutes**
- After cache expires, fresh content is fetched

### What We Did to Help

The code we updated earlier:
1. ✅ **Disables SDK caching**: `stack.setCachePolicy(Contentstack.CachePolicy.IGNORE_CACHE)`
2. ✅ **Adds cache-busting parameters**: `_cb`, `_t`, `_timestamp` to API requests
3. ✅ **Forces fresh data**: Every request tries to bypass CDN cache

This means Launch should see updates within **1-2 minutes** instead of 5-10 minutes!

## Testing Both Update Automatically

### Test 1: Publish and Check Local

1. **Publish a change** in Contentstack (e.g., change hero heading)
2. **Wait 30 seconds**
3. **Refresh** `http://localhost:5174/`
4. ✅ **New content appears**

### Test 2: Publish and Check Launch

1. **Publish the same change** (or a different one)
2. **Wait 1-2 minutes** (CDN cache)
3. **Hard refresh** `https://contentstack-landing-page-prod.contentstackapps.com/` (Ctrl+Shift+R)
4. ✅ **New content appears**

### Test 3: Compare Both

1. **Publish a change** in Contentstack
2. **Wait 2 minutes**
3. **Check both**:
   - Local: Refresh browser
   - Launch: Hard refresh browser
4. ✅ **Both show the same new content**

## Important Points

### ✅ Both Update Automatically
- No code changes needed
- No redeployment needed
- Just publish in Contentstack

### ⚠️ Timing Differences
- **Local**: Updates within **30 seconds**
- **Launch**: Updates within **1-2 minutes** (due to CDN)

### 🔄 Refresh Required
- Users need to **refresh the page** to see new content
- Or wait for natural page reloads
- Content fetches on every page load

## What Triggers Content Fetch

Content is fetched when:
1. ✅ **Initial page load** (user visits site)
2. ✅ **Page refresh** (F5 or Ctrl+R)
3. ✅ **Hard refresh** (Ctrl+Shift+R) - clears cache
4. ✅ **Navigation** (if using React Router, depends on setup)

**Not fetched**:
- ❌ While user is on the page (no auto-refresh)
- ❌ Without user action (page must load/refresh)

## Making Launch Update Faster

### Option 1: Hard Refresh (Recommended)
- Users: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Bypasses browser cache
- Forces fresh API call

### Option 2: Wait for Cache Expiry
- CDN cache expires after 1-2 minutes
- Next page load fetches fresh content
- Automatic, but takes time

### Option 3: Cache-Busting (Already Implemented)
- Code adds timestamp parameters to API requests
- Tries to bypass CDN cache
- Should see updates within 1-2 minutes

## Verifying Updates Work

### Check Browser Console (F12)

Both local and Launch should show:

**Network Tab:**
- ✅ API call to `cdn.contentstack.io`
- ✅ Response contains your latest content
- ✅ Cache-busting parameters in URL (`?_cb=...&_t=...`)

**Console Tab:**
- ✅ `[HOME] Added cache-busting params for production`
- ✅ No errors about missing environment variables

### Compare Content

1. **Publish a test change** (e.g., change hero heading to "Test Update")
2. **Wait 2 minutes**
3. **Check both sites**:
   - Local: Should show "Test Update"
   - Launch: Should show "Test Update"
4. ✅ **Both match** = Updates working!

## Common Questions

### Q: Do I need to redeploy Launch when I publish content?

**A: No!** Content updates happen automatically. Only redeploy when you change code.

### Q: Why doesn't Launch update immediately?

**A: CDN caching**. The cache expires after 1-2 minutes, then fresh content is fetched.

### Q: Can I make Launch update instantly?

**A: Hard refresh** (Ctrl+Shift+R) bypasses cache. Or wait 1-2 minutes for automatic update.

### Q: Will users see new content automatically?

**A: Yes**, when they:
- Visit the site (fresh page load)
- Refresh the page
- Or wait for natural navigation

### Q: What if I change code, not just content?

**A: Code changes require redeployment:**
- Local: Auto-updates (Vite hot reload)
- Launch: Push to Git → Auto-deploys

## Summary

✅ **Both Local and Launch update automatically** when you publish entries  
✅ **Same code, same behavior** - both fetch from Contentstack API  
✅ **No redeployment needed** for content updates  
✅ **Timing difference**: Local (~30 seconds), Launch (1-2 minutes)  
✅ **Cache-busting helps** Launch see updates faster  

**Key Point**: Both work the same way - they fetch content on every page load. Launch just takes slightly longer due to CDN caching, but the cache-busting we added helps minimize this!


