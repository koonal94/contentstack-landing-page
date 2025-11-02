# Quick Start: Connect to GitHub in 5 Minutes

## Prerequisites Check
```bash
# Check if Git is installed
git --version
```
If not installed: Download from [git-scm.com](https://git-scm.com/downloads)

## Step-by-Step Commands (Copy & Paste)

### 1. Navigate to Your Project
```bash
cd C:\Users\kunal.chavan\Project_two
```

### 2. Initialize Git
```bash
git init
```

### 3. Add All Files
```bash
git add .
```

### 4. Make First Commit
```bash
git commit -m "Initial commit: Contentstack landing page"
```

### 5. Create Repository on GitHub
1. Go to [github.com](https://github.com/new)
2. Repository name: `contentstack-landing-page`
3. Visibility: **Public** or **Private**
4. **⚠️ DO NOT** check "Initialize with README"
5. Click **"Create repository"**

### 6. Connect Local Project to GitHub
**Replace `yourusername` and `repo-name` with YOUR values:**

```bash
# Add GitHub remote (use the URL GitHub shows you)
git remote add origin https://github.com/yourusername/repo-name.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

### 7. Authentication
When asked for credentials:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (see below)

### 8. Create Personal Access Token (If Needed)
1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. Name: "Project Deployment"
4. Check ✅ **repo** (all repo permissions)
5. **Generate token** and **COPY IT** (you won't see it again!)
6. Use this token as your password when pushing

## Done! ✅

Your project is now on GitHub at:
`https://github.com/yourusername/your-repo-name`

## Next Time You Make Changes

```bash
git add .
git commit -m "Your change description"
git push
```

## Need More Help?

See [`GITHUB_SETUP.md`](./GITHUB_SETUP.md) for detailed instructions and troubleshooting.

