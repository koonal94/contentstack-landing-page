# Post-Deployment Workflow Guide

This guide explains how to manage updates to your deployed website on Contentstack Launch.

## Understanding Content vs Code Updates

Your website has **two types of updates**:

### 1. **Content Updates** (From Contentstack CMS)
- ✅ **Automatic** - No redeployment needed!
- Your app fetches content from Contentstack API on every page load
- When you publish changes in Contentstack, the website automatically shows new content
- Visitors see updates immediately after publishing (may need to refresh their browser)

### 2. **Code Updates** (Changes to your React/Vite code)
- ⚠️ **Requires Redeployment** - Must push to Git and redeploy
- Changes to components, styles, functionality, or configuration
- Requires: Git push → Launch redeployment

---

## 📝 Content Updates Workflow

### How It Works

Your app fetches content from Contentstack's **Delivery API** on every page load. This means:

1. **Edit content in Contentstack**
   - Go to Contentstack → Your Stack → Content Types → Homepage
   - Edit any field (hero, features, testimonials, etc.)
   - Click **"Publish"** when ready

2. **Content is automatically live**
   - The website fetches fresh content on each visit
   - No redeployment needed!
   - Visitors may need to refresh to see changes (or it updates automatically)

3. **CDN Cache** (Optional)
   - Contentstack's CDN may cache content for a few minutes
   - Changes usually appear within 1-5 minutes
   - You can clear cache or wait for it to expire naturally

### Example: Updating Hero Text

```
1. Contentstack → Homepage Entry → Edit "Hero Heading"
2. Change text from "Welcome" to "Welcome to Our New Site"
3. Click "Publish"
4. ✅ Done! Website shows new text immediately (or within minutes)
```

**No redeployment needed!** 🎉

---

## 💻 Code Updates Workflow

When you change your React components, styles, or functionality, you need to redeploy:

### Step-by-Step Process

1. **Make Changes Locally**
   ```bash
   # Edit files in your project
   # e.g., src/components/Hero.jsx
   ```

2. **Test Locally**
   ```bash
   npm run dev
   # Test at http://localhost:5173
   ```

3. **Commit and Push to GitHub**
   ```bash
   git add .
   git commit -m "Update hero component styling"
   git push
   ```

4. **Redeploy on Launch**
   - Go to Contentstack Launch → Your Project
   - Click **"Redeploy"** or wait for auto-deploy (if enabled)
   - Or: Launch will auto-deploy if you enabled auto-deploy on Git push

5. **Wait for Deployment** (usually 2-5 minutes)
   - Watch deployment logs
   - Build completes → Site goes live

### Example: Changing Button Color

```
1. Edit src/components/Hero.jsx → Change button color class
2. git add . && git commit -m "Change button color" && git push
3. Launch auto-deploys (or manually click Redeploy)
4. ✅ Done! Website shows new button color
```

---

## 🔄 Setting Up Live Preview for Deployed Site

After deployment, configure Live Preview to work with your Launch URL:

### 1. Get Your Launch URL

Your deployed site URL will be:
```
https://your-project-name.contentstackapps.com
```
or custom domain if configured:
```
https://www.yourdomain.com
```

### 2. Configure in Contentstack

1. Go to **Contentstack** → Your Stack → **Settings** → **Live Preview**
2. Set **Site URL**: `https://your-project-name.contentstackapps.com`
3. Set **Preview URL**: `https://your-project-name.contentstackapps.com`
4. Add Content Type Path:
   - Content Type: `homepage`
   - Path: `/` (root path)

### 3. Test Live Preview

1. Open an entry in Contentstack editor
2. Click **"Live Preview"** button
3. You should see your deployed site in the preview pane
4. Edit fields → Changes appear in real-time (if Live Preview is configured)

---

## 🚀 Auto-Deploy Setup (Recommended)

Enable automatic deployments when you push code to GitHub:

### Setup Auto-Deploy

1. Go to **Launch** → Your Project → **Environments**
2. Click on your environment (e.g., "Production")
3. Enable **"Auto-deploy on push"**
4. Select branch: `main` (or your production branch)
5. **Save**

### Benefits

- ✅ Automatic deployments on every Git push
- ✅ No manual redeploy needed
- ✅ Faster workflow

### Deployment Process

```
1. Make code changes locally
2. git push origin main
3. Launch detects push automatically
4. Starts building
5. Deploys (2-5 minutes)
6. ✅ Site updated!
```

---

## 📋 Quick Reference: What Requires Redeployment?

### ✅ Content Changes (No Redeploy Needed)
- ✅ Publishing/updating entries
- ✅ Creating new entries
- ✅ Changing field values
- ✅ Adding/removing references
- ✅ Changing locales
- ✅ Publishing/unpublishing

### ⚠️ Code Changes (Redeploy Required)
- ⚠️ Changing component code (`.jsx` files)
- ⚠️ Updating styles (CSS/Tailwind)
- ⚠️ Adding/removing dependencies (`package.json`)
- ⚠️ Changing configuration files (`vite.config.js`, etc.)
- ⚠️ Updating environment variables in Launch

### 🔧 Configuration Changes

**Environment Variables** (in Launch):
- Requires: Update in Launch → Redeploy
- Not just publishing content

**Live Preview URLs** (in Contentstack):
- Requires: Update in Contentstack Settings
- No redeploy needed

---

## 🎯 Common Scenarios

### Scenario 1: "I updated hero text but don't see changes"

**Solution:**
1. Check if entry is published in the correct environment
2. Verify environment matches `VITE_CONTENTSTACK_ENVIRONMENT` in Launch
3. Clear browser cache or wait 1-2 minutes (CDN cache)
4. Check if you're viewing the correct environment

### Scenario 2: "I changed button color but site looks same"

**Solution:**
1. Did you push code to GitHub? → Check GitHub for your commit
2. Did Launch redeploy? → Check Launch deployment history
3. Is deployment successful? → Check build logs
4. Wait for deployment to complete (usually 2-5 minutes)

### Scenario 3: "Live Preview not working on deployed site"

**Solution:**
1. Check Launch URL in Contentstack Live Preview settings
2. Verify Live Preview URLs match exactly (no trailing slashes)
3. Check if `VITE_CONTENTSTACK_PREVIEW_TOKEN` is set in Launch
4. Verify preview token has correct permissions

### Scenario 4: "I want to preview draft content"

**Solution:**
1. Set `VITE_CONTENTSTACK_USE_PREVIEW=true` in Launch environment variables
2. Redeploy (this is a code/config change)
3. Now draft content will be visible (using Preview API instead of Delivery API)

---

## 🔍 Checking Deployment Status

### In Contentstack Launch

1. Go to **Launch** → Your Project
2. View **Deployments** tab
3. See status: ✅ Success / ⚠️ Failed / 🔄 Building
4. Click on deployment to see logs

### Deployment States

- **Building**: Still compiling code
- **Deploying**: Uploading to hosting
- **Success**: Live and ready
- **Failed**: Check logs for errors

---

## 📊 Monitoring Updates

### Content Updates Monitoring

Since content updates are automatic, monitor in Contentstack:
- Check **Publishing Queue** for pending publishes
- View **Entry History** to see what changed
- Check **Activity Log** for publishing activity

### Code Updates Monitoring

Monitor in Launch:
- **Deployment History**: See all deployments
- **Build Logs**: Check for errors
- **Deployment Status**: Success/failure

---

## 🛠️ Best Practices

### Content Updates
1. ✅ Always publish to correct environment
2. ✅ Test in staging environment first (if you have one)
3. ✅ Use content scheduling for future publishes
4. ✅ Review before publishing

### Code Updates
1. ✅ Test locally first (`npm run dev`)
2. ✅ Commit with descriptive messages
3. ✅ Push to feature branch → Test → Merge to main
4. ✅ Monitor deployment logs for errors
5. ✅ Keep Launch environment variables updated

### Live Preview
1. ✅ Always configure Live Preview URLs after deployment
2. ✅ Test Live Preview after deployment
3. ✅ Verify edit buttons appear in preview pane
4. ✅ Check that live edits work correctly

---

## ⚡ Quick Commands

### Check Deployment Status
```
Go to: Launch → Your Project → Deployments
```

### View Build Logs
```
Launch → Project → Deployment → Click on deployment → View logs
```

### Manual Redeploy
```
Launch → Project → Click "Redeploy" button
```

### Push Code
```bash
git add .
git commit -m "Your change description"
git push origin main
```

---

## 📞 Troubleshooting

### Content Not Updating
- ✅ Check entry is published
- ✅ Verify correct environment
- ✅ Clear browser cache
- ✅ Wait 2-3 minutes (CDN cache)

### Deployment Failed
- ✅ Check build logs
- ✅ Verify environment variables
- ✅ Check for syntax errors
- ✅ Verify Git repository is connected

### Live Preview Not Working
- ✅ Check Launch URL in Contentstack settings
- ✅ Verify preview token is set in Launch
- ✅ Check browser console for errors
- ✅ Verify Live Preview is enabled in Contentstack

---

## Summary

| Type of Change | Action Required | Time to Live |
|---------------|----------------|--------------|
| **Content Update** (publish entry) | Just publish in Contentstack | Immediate (1-5 min with CDN cache) |
| **Code Change** (component/styling) | Push to Git → Redeploy | 2-5 minutes |
| **Config Change** (env vars) | Update in Launch → Redeploy | 2-5 minutes |
| **Live Preview Setup** | Update URLs in Contentstack | Immediate |

**Remember**: 
- 📝 **Content = No redeploy needed**
- 💻 **Code = Redeploy required**

