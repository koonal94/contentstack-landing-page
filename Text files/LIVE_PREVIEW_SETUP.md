# Live Preview Setup for Login and Get Started Pages

This guide explains how to configure Live Preview for the Login and Get Started pages in Contentstack.

## The Error You're Seeing

If you see: **"You are currently previewing a different webpage. To go back, open the webpage that corresponds to the current entry."**

This means Contentstack's Live Preview expects the preview URL to match the entry's content type. You need to configure the preview URL in Contentstack.

## Step-by-Step Setup

### 1. Configure Live Preview URL for Login Page

1. Go to **Contentstack** → Your Stack → **Content Types** → **Login Page**
2. Click on **"Settings"** or **"Configure"**
3. Find **"Live Preview"** section
4. Set the **Preview URL** to:
   ```
   http://localhost:5173/login?content_type_uid=login&entry_uid={entry_uid}
   ```
   Or for production/Launch:
   ```
   https://your-launch-url.contentstackapps.com/login?content_type_uid=login&entry_uid={entry_uid}
   ```

5. Save the configuration

### 2. Configure Live Preview URL for Get Started Page

1. Go to **Contentstack** → Your Stack → **Content Types** → **Get Started Page**
2. Click on **"Settings"** or **"Configure"**
3. Find **"Live Preview"** section
4. Set the **Preview URL** to:
   ```
   http://localhost:5173/get-started?content_type_uid=get_started&entry_uid={entry_uid}
   ```
   Or for production/Launch:
   ```
   https://your-launch-url.contentstackapps.com/get-started?content_type_uid=get_started&entry_uid={entry_uid}
   ```

5. Save the configuration

### 3. Verify Content Type UIDs Match

Make sure your content types have these exact UIDs:
- **Login Page**: `login`
- **Get Started Page**: `get_started`

You can check this in:
- Contentstack → Content Types → [Content Type] → Settings → UID

### 4. Create and Publish Entries

1. **Login Page Entry**:
   - Go to **Login Page** content type
   - Create a new entry
   - Fill in the fields
   - **Save** and **Publish**

2. **Get Started Page Entry**:
   - Go to **Get Started Page** content type
   - Create a new entry
   - Fill in the fields
   - **Save** and **Publish**

### 5. Test Live Preview

1. Open a **Login Page** entry in Contentstack
2. Click **"Live Preview"** button
3. You should see your local site (`http://localhost:5173/login`) in the preview pane
4. Edit a field and verify:
   - ✅ Edit buttons appear on all fields
   - ✅ Changes appear immediately (no page refresh)
   - ✅ No error messages

Repeat for Get Started page.

## Troubleshooting

### Issue: "Previewing a different webpage" error persists

**Solution:**
1. Check that the Preview URL uses the correct content type UID (`login` or `get_started`)
2. Verify the URL path matches your route (`/login` or `/get-started`)
3. Make sure `{entry_uid}` placeholder is in the URL (Contentstack replaces this)
4. Restart your dev server after changing Contentstack settings

### Issue: Edit buttons don't appear

**Solution:**
1. Check browser console for errors (F12)
2. Verify you're in an iframe (Live Preview should open in a pane)
3. Check that entry has `entry.$` object with edit tags
4. Verify `VITE_CONTENTSTACK_LIVE_PREVIEW=true` in your `.env` file
5. Check that preview token is correct

### Issue: Changes don't appear in preview

**Solution:**
1. Check network tab - API calls should go to Preview API
2. Verify cache-busting parameters are in API requests
3. Check console for errors about entry fetching
4. Ensure entry is published (not just saved)

### Issue: Wrong content type loads

**Solution:**
1. Verify the URL has correct `content_type_uid` parameter
2. Check that `fetchLogin()` and `fetchGetStarted()` check content type from URL
3. Clear browser cache and sessionStorage

## What the Code Does

The updated code:

1. **Checks Content Type**: Only loads entries if content type matches (`login` or `get_started`)
2. **Injects Edit Tags**: Creates `data-cslp` attributes for all fields (same as homepage)
3. **Handles URL Parameters**: Reads `entry_uid` and `content_type_uid` from URL
4. **Normalizes Entry Structure**: Ensures `entry.fields` exists for edit tags

## Quick Checklist

✅ Content Types created with correct UIDs (`login`, `get_started`)  
✅ Preview URLs configured in Contentstack  
✅ Entries created and published  
✅ `.env` file has `VITE_CONTENTSTACK_LIVE_PREVIEW=true`  
✅ Dev server running on `http://localhost:5173`  
✅ Live Preview opens correct page (no error message)  
✅ Edit buttons appear on fields  
✅ Changes appear immediately in preview  

## Next Steps After Setup

Once Live Preview is working:

1. **Test Publishing**: Edit entry → Publish → Verify changes appear on Launch site
2. **Test All Fields**: Click edit buttons on all fields to ensure they work
3. **Test Navigation**: Verify navigation links work correctly in preview
4. **Configure Launch**: Set up preview URLs for your Launch environment

Your Login and Get Started pages should now have full Live Preview support! 🎉

