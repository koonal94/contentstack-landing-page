# Fix: Live Preview Navigating Away from Login/Get-Started Pages

## The Problem

When you click an edit button on the login or get-started page in Live Preview, the entry opens correctly in Contentstack, but the Live Preview iframe navigates back to the homepage instead of staying on the login/get-started page.

## Root Cause

Contentstack's Live Preview SDK navigates the iframe based on the **Preview URL** configured for each content type in Contentstack. If the Preview URL for the `login` or `get_started` content types is set to `/` (homepage) instead of `/login` or `/get-started`, the SDK will navigate there when you click edit.

## Solution: Configure Preview URLs in Contentstack

You need to set the correct Preview URLs in Contentstack for each content type. This is a **Contentstack configuration** issue, not a code issue.

### Step 1: Configure Login Page Preview URL

1. Log in to **Contentstack**
2. Go to your **Stack** → **Content Types** → **Login Page** (or whatever your login content type is called)
3. Click on **"Settings"** or the gear icon
4. Find the **"Live Preview"** section
5. Set the **Preview URL** to:
   ```
   http://localhost:5173/login?content_type_uid=login&entry_uid={entry_uid}
   ```
   For production/Launch, use:
   ```
   https://your-launch-url.contentstackapps.com/login?content_type_uid=login&entry_uid={entry_uid}
   ```
6. Click **"Save"**

### Step 2: Configure Get Started Page Preview URL

1. Go to **Content Types** → **Get Started Page** (or whatever your get-started content type is called)
2. Click on **"Settings"** or the gear icon
3. Find the **"Live Preview"** section
4. Set the **Preview URL** to:
   ```
   http://localhost:5173/get-started?content_type_uid=get_started&entry_uid={entry_uid}
   ```
   For production/Launch, use:
   ```
   https://your-launch-url.contentstackapps.com/get-started?content_type_uid=get_started&entry_uid={entry_uid}
   ```
5. Click **"Save"**

### Step 3: Verify Content Type UIDs

Make sure your content types have these exact UIDs:
- **Login Page**: `login`
- **Get Started Page**: `get_started`

You can check this in:
- Contentstack → Content Types → [Content Type] → Settings → UID

If the UIDs don't match, either:
- Update the UIDs in Contentstack to match (`login` and `get_started`)
- Or update the Preview URLs to use the correct UIDs

### Step 4: Test

1. Open a login entry in Contentstack
2. Click **"Live Preview"**
3. The preview should open on `/login` (not `/`)
4. Click an edit button on any field
5. The preview should **stay on `/login`** instead of navigating to the homepage

Repeat for the get-started page.

## Why Code Solutions Don't Work

The Contentstack Live Preview SDK navigates the iframe by directly setting `window.location.href` or using the parent window's navigation methods. These navigation attempts happen at a very low level and are difficult to intercept reliably without breaking other functionality.

The correct solution is to configure the Preview URLs in Contentstack so the SDK navigates to the correct page in the first place.

## Alternative: If You Can't Change Preview URLs

If you cannot change the Preview URLs in Contentstack (e.g., you don't have admin access), you would need to:

1. Contact your Contentstack administrator to update the Preview URLs
2. Or use a different approach where all pages use the same preview URL and handle routing client-side (not recommended)

## Notes

- The `{entry_uid}` placeholder in the Preview URL is automatically replaced by Contentstack with the actual entry UID
- Make sure to use the correct protocol (`http://` for localhost, `https://` for production)
- The query parameters (`content_type_uid` and `entry_uid`) help your app identify which entry to display


