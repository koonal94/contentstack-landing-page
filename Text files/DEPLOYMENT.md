# Contentstack Launch Deployment Guide

This guide will help you deploy your Vite + React website to Contentstack Launch.

## Prerequisites

1. **Contentstack Account**: You need an active Contentstack account with Launch access
2. **Git Repository**: Your project should be pushed to GitHub, GitLab, or Bitbucket
3. **Contentstack Stack**: Your stack should be configured with content types and entries
4. **Tokens**: You'll need your API key, delivery token, and preview token

## Step 1: Prepare Your Repository

### 1.1 Create `.env.example` File

Create a `.env.example` file in your project root with all required environment variables (without actual values):

```env
VITE_CONTENTSTACK_API_KEY=your_api_key_here
VITE_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token_here
VITE_CONTENTSTACK_PREVIEW_TOKEN=your_preview_token_here
VITE_CONTENTSTACK_ENVIRONMENT=production
VITE_CONTENTSTACK_REGION=US
VITE_CONTENTSTACK_LOCALE=en-us
VITE_CONTENTSTACK_CONTENT_TYPE_UID=homepage
VITE_CONTENTSTACK_ENTRY_UID=your_entry_uid_here
VITE_CONTENTSTACK_LIVE_PREVIEW=true
VITE_CONTENTSTACK_USE_PREVIEW=false
```

**Note**: Make sure `.env` is in your `.gitignore` file (never commit actual tokens to GitHub).

### 1.2 Verify Build Command

Your `package.json` should have:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

The build output will be in the `dist` directory.

## Step 2: Access Contentstack Launch

1. Log in to your Contentstack account
2. In the left navigation, click on **Launch**
3. You should see the Launch dashboard

## Step 3: Create a New Project

1. Click the **New Project** button
2. Choose your import method:
   - **GitHub Repository** (Recommended): Connect your GitHub account and select your repository
   - **GitLab/Bitbucket**: Connect your GitLab or Bitbucket account
   - **File Upload**: Upload a ZIP file (less recommended, as you lose Git integration)

## Step 4: Configure Project Settings

### 4.1 Basic Settings

- **Project Name**: Enter a descriptive name (e.g., "Contentstack Landing Page")
- **Framework Preset**: Select **React** or **Generic Static Site**
- **Root Directory**: Leave blank (unless your project is in a subdirectory)

### 4.2 Build Configuration

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: Select Node.js 18 or higher (recommended: 18.x or 20.x)
- **Install Command**: `npm install`

### 4.3 Environment Variables

Click **Environment Variables** and add all the required variables from your `.env.example`:

```
VITE_CONTENTSTACK_API_KEY=your_actual_api_key
VITE_CONTENTSTACK_DELIVERY_TOKEN=your_actual_delivery_token
VITE_CONTENTSTACK_PREVIEW_TOKEN=your_actual_preview_token
VITE_CONTENTSTACK_ENVIRONMENT=production
VITE_CONTENTSTACK_REGION=US
VITE_CONTENTSTACK_LOCALE=en-us
VITE_CONTENTSTACK_CONTENT_TYPE_UID=homepage
VITE_CONTENTSTACK_LIVE_PREVIEW=true
VITE_CONTENTSTACK_USE_PREVIEW=false
```

**Important Security Notes**:
- ✅ These are build-time variables (Vite prefixes them with `VITE_`)
- ✅ They will be embedded in the client-side bundle
- ✅ Never commit actual tokens to Git
- ✅ Use Launch's environment variables for secure storage

### 4.4 Build Settings

- **Build Hook URL**: Optional - for triggering builds from Contentstack webhooks
- **Deploy Hooks**: Optional - for notifications (Slack, email, etc.)

## Step 5: Set Up Environments

Launch allows multiple environments (development, staging, production). Configure each:

### 5.1 Production Environment

1. Go to **Environments** section
2. Click on the default environment (or create a new one named "Production")
3. Configure:
   - **Branch**: `main` or `master` (your production branch)
   - **Auto-deploy**: Enable if you want automatic deployments on push
   - **Custom Domain**: Add your custom domain (if applicable)
   - **Environment Variables**: Add production-specific variables

### 5.2 Development/Staging Environment (Optional)

1. Click **Add Environment**
2. Name it "Development" or "Staging"
3. Configure:
   - **Branch**: `develop` or `staging`
   - **Auto-deploy**: Enable for continuous deployment
   - **Environment Variables**: Use development values (different environment, different tokens if needed)

## Step 6: Configure Contentstack Live Preview

After deployment, you need to configure Live Preview in Contentstack to point to your Launch URL:

1. In Contentstack, go to **Stack Settings → Live Preview**
2. Set **Site URL** to your Launch deployment URL (e.g., `https://your-project.launch.contentstack.com`)
3. Set **Preview URL** to the same URL
4. Add content type paths:
   - Content Type: `homepage`
   - Path: `/`

## Step 7: Deploy Your Project

### 7.1 First Deployment

1. After configuring all settings, click **Deploy Now** or **Save and Deploy**
2. Launch will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Run the build command (`npm run build`)
   - Deploy the `dist` folder to hosting

### 7.2 Monitor Deployment

Watch the deployment logs for:
- ✅ Dependency installation success
- ✅ Build completion
- ✅ Deployment success

Common issues:
- ❌ Build fails: Check Node version and build logs
- ❌ Environment variables missing: Verify all variables are set
- ❌ Module not found: Check `package.json` dependencies

### 7.3 Access Your Deployed Site

Once deployed, Launch provides a URL like:
```
https://your-project-name.launch.contentstack.com
```

## Step 8: Continuous Deployment (Optional)

If you enabled auto-deploy:

1. Push changes to your configured branch
2. Launch automatically detects the push
3. Builds and deploys automatically
4. Your site updates within minutes

## Step 9: Custom Domain (Optional)

1. In your environment settings, click **Custom Domain**
2. Enter your domain (e.g., `www.yourdomain.com`)
3. Launch will provide DNS instructions
4. Update your DNS records as instructed
5. Wait for DNS propagation (usually 24-48 hours)

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Check `package.json` has all dependencies
- Verify Node version is compatible
- Check build logs for specific missing modules

**Error: "Environment variable not defined"**
- Verify all `VITE_*` variables are set in Launch
- Check variable names match exactly (case-sensitive)
- Rebuild after adding variables

### Site Not Loading

**Error: "Blank page" or "404"**
- Verify `dist` is the correct output directory
- Check `index.html` exists in the build output
- Ensure React Router (if used) is configured for SPA routing

### Live Preview Not Working

**Preview token errors:**
- Verify `VITE_CONTENTSTACK_PREVIEW_TOKEN` is set correctly
- Check preview token has "Live Edit" permissions in Contentstack
- Verify Live Preview URLs in Contentstack settings match Launch URL

**CORS errors:**
- Check allowed domains in Contentstack token settings
- Add your Launch domain to allowed domains list

### Content Not Showing

**"CMS: No entry resolved" errors:**
- Verify `VITE_CONTENTSTACK_ENTRY_UID` is set (or remove it to use default entry)
- Check content type UID matches (`VITE_CONTENTSTACK_CONTENT_TYPE_UID`)
- Verify environment name matches (`VITE_CONTENTSTACK_ENVIRONMENT`)
- Check entry is published in that environment

## Quick Deployment Checklist

- [ ] Repository pushed to GitHub/GitLab/Bitbucket
- [ ] `.env.example` created (for reference)
- [ ] Project created in Contentstack Launch
- [ ] Build command set: `npm run build`
- [ ] Output directory set: `dist`
- [ ] All environment variables configured in Launch
- [ ] Node version set (18+)
- [ ] Branch configured for production environment
- [ ] First deployment successful
- [ ] Live Preview URLs configured in Contentstack
- [ ] Custom domain configured (if needed)

## Additional Resources

- [Contentstack Launch Documentation](https://www.contentstack.com/docs/developers/launch)
- [Vite Production Build Guide](https://vitejs.dev/guide/build.html)
- [Contentstack Live Preview Setup](https://www.contentstack.com/docs/developers/set-up-live-preview)

## Support

If you encounter issues:
1. Check deployment logs in Launch dashboard
2. Review browser console for runtime errors
3. Verify Contentstack token permissions
4. Contact Contentstack support if needed

