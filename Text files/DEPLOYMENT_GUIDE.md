# Deployment Guide: Multi-Page Website

This guide explains how to push your changes to GitHub and deploy to Contentstack Launch after adding the Login and Get Started pages.

## Table of Contents

1. [Push Changes to GitHub](#push-changes-to-github)
2. [Deploy to Contentstack Launch](#deploy-to-contentstack-launch)
3. [Create Content Models in Contentstack](#create-content-models-in-contentstack)
4. [Verify Everything Works](#verify-everything-works)

---

## Push Changes to GitHub

### Step 1: Check Current Status

```bash
# Check which files have changed
git status

# See what changed in detail
git diff
```

### Step 2: Add All Changes

```bash
# Add all modified and new files
git add .

# Or add specific files if you prefer
git add src/
git add content-models/
git add package.json
git add DEPLOYMENT_GUIDE.md
```

### Step 3: Commit Changes

```bash
# Create a commit with a descriptive message
git commit -m "Add multi-page routing: Login, Get Started pages with Live Preview support

- Added React Router for multi-page navigation
- Created Login page with form and Live Preview support
- Created Get Started page with signup form and Live Preview support
- Enhanced homepage with Pricing section
- Updated Navigation to use Router links
- Created content models for login and get-started pages
- All pages support Live Preview and entry publishing"
```

### Step 4: Push to GitHub

```bash
# Push to your main branch (or your branch name)
git push origin main

# If you're on a different branch
git push origin <your-branch-name>
```

**Note**: If this is your first push or you haven't set up the remote, see [GITHUB_SETUP.md](./GITHUB_SETUP.md) for instructions.

### Step 5: Verify Push

1. Go to your GitHub repository
2. Check that all files appear in the latest commit
3. Verify the commit message is correct

---

## Deploy to Contentstack Launch

After pushing to GitHub, Launch will automatically detect the changes and start a new build.

### Step 1: Check Launch Dashboard

1. Go to [Contentstack Launch Dashboard](https://app.contentstack.com/)
2. Navigate to your Launch project
3. You should see a new build in progress

### Step 2: Monitor Build

- The build should complete in 2-5 minutes
- Watch for any build errors in the logs
- If there are errors, check:
  - ✅ `package.json` includes `react-router-dom`
  - ✅ All import paths are correct
  - ✅ No syntax errors in new files

### Step 3: Verify Deployment

Once build completes:

1. **Visit your Launch URL**: `https://your-launch-url.contentstackapps.com/`
2. **Test Routes**:
   - Homepage: `/`
   - Login: `/login`
   - Get Started: `/get-started`

3. **Check Navigation**:
   - Click "Log in" button → Should navigate to `/login`
   - Click "Get Started" button → Should navigate to `/get-started`
   - Navigation links should work

---

## Create Content Models in Contentstack

You need to create the content models for Login and Get Started pages in Contentstack before creating entries.

### Option 1: Import JSON (Recommended)

1. Go to Contentstack → Your Stack → Content Types
2. Click **"More options"** (three dots) → **"Import"**
3. Upload `content-models/login.json`
4. Repeat for `content-models/get-started.json`

### Option 2: Manual Creation

If import doesn't work, create manually:

#### Login Content Type

1. Go to Contentstack → Your Stack → Content Types → **"Create New"**
2. **Display Name**: `Login Page`
3. **UID**: `login`
4. Add these fields:

**Hero Section** (Group):
- Eyebrow Text (Text)
- Heading (Text)
- Subheading (Text)

**Form** (Group):
- Title (Text)
- Subtitle (Text)
- Email Label (Text)
- Password Label (Text)
- Remember Me Text (Text)
- Forgot Password Text (Text)
- Submit Text (Text)
- Or Text (Text)
- Social Login Text (Text)

**Features** (Multiple Group):
- Title (Text)
- Description (Text)
- Icon (Text)

**Footer** (Group):
- Link Groups (Multiple Group):
  - Title (Text)
  - Links (Link, Multiple)

5. Click **"Save"** and **"Publish"**

#### Get Started Content Type

1. Go to Contentstack → Your Stack → Content Types → **"Create New"**
2. **Display Name**: `Get Started Page`
3. **UID**: `get_started`
4. Add these fields:

**Hero Section** (Group):
- Eyebrow Text (Text)
- Heading (Text)
- Subheading (Text)

**Steps** (Multiple Group):
- Number (Number)
- Title (Text)
- Description (Text)
- Icon (Text)

**Form** (Group):
- Title (Text)
- Subtitle (Text)
- Name Label (Text)
- Email Label (Text)
- Company Label (Text)
- Submit Text (Text)
- Terms Text (Text)

**Benefits** (Multiple Group):
- Title (Text)
- Description (Text)
- Icon (Text)

**Footer** (Group):
- Link Groups (Multiple Group):
  - Title (Text)
  - Links (Link, Multiple)

5. Click **"Save"** and **"Publish"**

---

## Create Entries

After creating content types:

### Login Entry

1. Go to Contentstack → Your Stack → **"Login Page"** → **"Create New"**
2. Fill in the fields (or use default values)
3. Click **"Save"** → **"Publish"**

### Get Started Entry

1. Go to Contentstack → Your Stack → **"Get Started Page"** → **"Create New"**
2. Fill in the fields (or use default values)
3. Click **"Save"** → **"Publish"**

**Note**: The pages will work with default values even if entries don't exist yet, but creating entries allows you to manage content through Contentstack.

---

## Verify Everything Works

### 1. Local Development

```bash
# Start dev server
npm run dev

# Test all routes:
# http://localhost:5174/
# http://localhost:5174/login
# http://localhost:5174/get-started
```

### 2. Launch Website

1. Visit your Launch URL
2. Test all routes:
   - `/` (Homepage)
   - `/login` (Login page)
   - `/get-started` (Get Started page)

### 3. Live Preview

1. Open Contentstack editor
2. Open a **Login Page** or **Get Started Page** entry
3. Click **"Live Preview"**
4. Edit fields and verify:
   - ✅ Changes appear immediately in preview
   - ✅ Edit buttons appear on all fields
   - ✅ No page refreshes when typing

### 4. Entry Publishing

1. Edit an entry in Contentstack
2. Publish it
3. Wait 1-2 minutes
4. Hard refresh the Launch website (Ctrl+Shift+R)
5. ✅ Verify changes appear

---

## Troubleshooting

### Issue: Routes don't work on Launch

**Solution**: Check that your Launch build configuration uses `history` mode routing:

1. Launch Dashboard → Your Project → Settings
2. Verify **"Build Command"** is: `npm run build`
3. Verify **"Output Directory"** is: `dist`

### Issue: 404 errors on routes

**Solution**: Configure Launch to handle client-side routing:

1. Launch Dashboard → Settings
2. Add redirect rule (if available) or configure server to serve `index.html` for all routes
3. Or use hash routing: Update `BrowserRouter` to `HashRouter` in `src/main.jsx`

### Issue: Content models import fails

**Solution**: 
- Check JSON syntax is valid
- Manually create content types using the field structure from JSON
- Verify UIDs match exactly: `login` and `get_started`

### Issue: Live Preview doesn't work on new pages

**Solution**:
- Verify content types have correct UIDs (`login`, `get_started`)
- Check that entries exist and are published
- Verify environment variables in Launch match your local `.env`

---

## Summary

✅ **Pushed to GitHub**: Committed and pushed all changes  
✅ **Launch Deployment**: Automatic build triggered  
✅ **Content Models**: Created login and get-started content types  
✅ **Entries Created**: Login and Get Started page entries  
✅ **Live Preview**: Working on all pages  
✅ **Entry Publishing**: Changes reflect on Launch website  

Your multi-page website is now live! 🎉

