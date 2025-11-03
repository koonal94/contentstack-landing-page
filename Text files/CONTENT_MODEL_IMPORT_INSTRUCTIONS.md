# Content Model Import Instructions

## Updated Content Models

Both `login.json` and `get-started.json` have been updated with:
1. **Title field** - Added as the first field in the schema (required field for entry title)
2. **Proper JSON structure** - Wrapped in `content_type` object for Contentstack import
3. **Published entry updates** - Configured to fetch and display published entries correctly

## How to Import

### Step 1: Import Login Page Content Type

1. Go to **Contentstack** → Your Stack → **Content Types**
2. Click **"Import"** or **"Create New"** → **"Import from JSON"**
3. Upload `content-models/login.json`
4. Click **"Import"**
5. The content type will be created with:
   - **Title** field (required) - for entry title
   - **Hero Section** - eyebrow, heading, subheading
   - **Form** - title, subtitle, email label, password label, etc.
   - **Features** - array of feature items
   - **Footer** - link groups

### Step 2: Import Get Started Page Content Type

1. Go to **Contentstack** → Your Stack → **Content Types**
2. Click **"Import"** or **"Create New"** → **"Import from JSON"**
3. Upload `content-models/get-started.json`
4. Click **"Import"**
5. The content type will be created with:
   - **Title** field (required) - for entry title
   - **Hero Section** - eyebrow, heading, subheading
   - **Steps** - array of step items
   - **Form** - title, subtitle, name label, email label, etc.
   - **Benefits** - array of benefit items
   - **Footer** - link groups

## Creating Entries

### Login Page Entry

1. Go to **Contentstack** → **Entries** → **Login Page**
2. Click **"Create New Entry"**
3. Fill in the **Title** field (e.g., "Login Page")
4. Fill in all other fields (Hero, Form, Features, Footer)
5. Click **"Save"**
6. Click **"Publish"** to make it live on the website

### Get Started Page Entry

1. Go to **Contentstack** → **Entries** → **Get Started Page**
2. Click **"Create New Entry"**
3. Fill in the **Title** field (e.g., "Get Started Page")
4. Fill in all other fields (Hero, Steps, Form, Benefits, Footer)
5. Click **"Save"**
6. Click **"Publish"** to make it live on the website

## How Published Entries Update the Website

The code has been configured to:

1. **Fetch published entries** using the Delivery API (not Preview API)
2. **Cache-busting enabled** - Added timestamp parameters to API requests to bypass CDN cache
3. **Automatic updates** - When you publish an entry in Contentstack, the website will fetch the latest published version

### How It Works

- The fetch functions (`fetchLogin`, `fetchGetStarted`) use `stack.ContentType().Entry().fetch()`
- This automatically uses the Delivery API which serves published content
- Cache-busting parameters (`_cb`, `_t`, `_timestamp`) ensure fresh content is fetched
- When you publish an entry, the next page load will fetch the updated content

### Testing Published Updates

1. **Create and publish an entry** in Contentstack
2. **Visit the page** on your website (e.g., `http://localhost:5173/login`)
3. The published content should appear immediately
4. If you don't see updates:
   - Hard refresh your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Check browser console for any errors
   - Verify the entry was actually published (not just saved)

## Environment Variables

Make sure your `.env` file has the entry UIDs (optional, for faster loading):

```env
VITE_CONTENTSTACK_LOGIN_ENTRY_UID=your_login_entry_uid
VITE_CONTENTSTACK_GET_STARTED_ENTRY_UID=your_get_started_entry_uid
```

These are optional - if not set, the code will try to find entries from URL parameters or fetch the first published entry.

## Live Preview Configuration

After importing, configure Live Preview URLs:

### Login Page Live Preview URL
```
http://localhost:5173/login?content_type_uid=login&entry_uid={entry_uid}
```

### Get Started Page Live Preview URL
```
http://localhost:5173/get-started?content_type_uid=get_started&entry_uid={entry_uid}
```

## Troubleshooting

### Entry Not Showing After Publishing

1. **Check entry is published** (not just saved)
   - Go to Contentstack → Entries → Your Entry
   - Make sure it shows "Published" status
   - Check the "Publish" button is available (not "Unpublish")

2. **Verify environment matches**
   - Check `.env` file has correct `VITE_CONTENTSTACK_ENVIRONMENT`
   - Must match the environment where entry was published

3. **Clear browser cache**
   - Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
   - Or open in incognito/private window

4. **Check browser console**
   - Open DevTools (F12)
   - Look for any errors in Console tab
   - Check Network tab to see if API requests are successful

### Title Field Not Showing

The title field is added to the content model and will be available in:
- Contentstack entry editor (at the top)
- The mapped data object as `cmsData.title`
- Can be used in your page components if needed

## Notes

- The title field is **required** - you must fill it in when creating entries
- Published entries automatically update the website due to cache-busting
- Live Preview works separately - it uses draft content while Live Preview is open
- Production/launch site uses published content via Delivery API

