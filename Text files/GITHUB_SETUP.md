# How to Connect Your Project to GitHub

This guide will walk you through creating a GitHub repository and connecting your local project to it.

## Prerequisites

1. **GitHub Account**: If you don't have one, sign up at [github.com](https://github.com/signup)
2. **Git Installed**: Check if Git is installed on your computer:
   ```bash
   git --version
   ```
   If not installed, download from [git-scm.com](https://git-scm.com/downloads)

## Method 1: Using GitHub Web Interface (Recommended for Beginners)

### Step 1: Create a Repository on GitHub

1. **Log in to GitHub**
   - Go to [github.com](https://github.com) and sign in

2. **Create a New Repository**
   - Click the **"+"** icon in the top-right corner
   - Select **"New repository"**

3. **Repository Settings**
   - **Repository name**: `contentstack-landing-page` (or any name you prefer)
   - **Description** (optional): "Modern React landing page with Contentstack CMS"
   - **Visibility**: 
     - ✅ **Public** - Anyone can see your code (free)
     - ✅ **Private** - Only you and invited collaborators can see (requires GitHub Pro for private repos with 3+ collaborators)
   - **⚠️ DO NOT** check "Initialize this repository with a README" (we already have one)
   - **⚠️ DO NOT** add .gitignore or license (we already have these)

4. **Click "Create repository"**

5. **Copy the Repository URL**
   - GitHub will show you a page with setup instructions
   - **Copy the HTTPS URL** (looks like: `https://github.com/yourusername/repo-name.git`)
   - Keep this page open, you'll need it in the next steps

### Step 2: Initialize Git in Your Local Project

Open your terminal/command prompt and navigate to your project folder:

**Windows (PowerShell/CMD):**
```bash
cd C:\Users\kunal.chavan\Project_two
```

**Mac/Linux:**
```bash
cd ~/path/to/Project_two
```

Then initialize Git:

```bash
# Initialize Git repository
git init

# Check if .git folder was created
ls -a .git  # (Mac/Linux)
dir .git    # (Windows)
```

### Step 3: Add Files to Git

```bash
# Add all files to staging area
git add .

# Check what files were added (optional)
git status
```

You should see files like:
- `src/`
- `package.json`
- `README.md`
- `vite.config.js`
- etc.

**⚠️ Important**: The `.env` file should NOT be listed (it's in `.gitignore` for security)

### Step 4: Make Your First Commit

```bash
# Create your first commit
git commit -m "Initial commit: Contentstack landing page project"
```

### Step 5: Connect to GitHub Repository

```bash
# Add GitHub as remote (replace with YOUR repository URL)
git remote add origin https://github.com/yourusername/your-repo-name.git

# Verify the remote was added
git remote -v
```

You should see:
```
origin  https://github.com/yourusername/your-repo-name.git (fetch)
origin  https://github.com/yourusername/your-repo-name.git (push)
```

### Step 6: Push to GitHub

```bash
# Rename branch to 'main' if needed (GitHub uses 'main' by default)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

**If prompted for credentials:**
- **Username**: Your GitHub username
- **Password**: You'll need a **Personal Access Token** (not your GitHub password)
  - See [Step 7](#step-7-create-personal-access-token-if-needed) below

### Step 7: Create Personal Access Token (If Needed)

If Git asks for a password, you need a Personal Access Token:

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Give it a name: "Project Two Deployment"
4. Select scopes: ✅ **repo** (all checkboxes under "repo")
5. Click **"Generate token"**
6. **⚠️ Copy the token immediately** (you won't see it again!)
7. Use this token as your password when pushing

## Method 2: Using GitHub Desktop (Easier GUI Method)

### Step 1: Install GitHub Desktop

1. Download from [desktop.github.com](https://desktop.github.com/)
2. Install and sign in with your GitHub account

### Step 2: Add Local Repository

1. Open GitHub Desktop
2. Click **File** → **Add Local Repository**
3. Click **Choose** and navigate to `C:\Users\kunal.chavan\Project_two`
4. Click **Add Repository**

### Step 3: Create Repository on GitHub

1. In GitHub Desktop, click **Publish repository**
2. Choose:
   - **Name**: `contentstack-landing-page`
   - **Description**: (optional)
   - **Visibility**: Public or Private
3. Click **Publish Repository**

That's it! Your code is now on GitHub.

## Method 3: Using VS Code (If You Use VS Code)

1. **Open your project in VS Code**
2. **Open Source Control panel** (Ctrl+Shift+G)
3. **Click "Initialize Repository"** if not already initialized
4. **Stage all changes** (click the + icon)
5. **Commit** (enter message: "Initial commit")
6. **Click "..." menu** → **Publish to GitHub**
7. **Choose**: Repository name, visibility, and click **Publish**

## Verify Your Repository on GitHub

1. Go to your GitHub profile: `https://github.com/yourusername`
2. You should see your new repository listed
3. Click on it to view your files
4. Your `README.md` should be visible on the repository homepage

## Troubleshooting

### Error: "remote origin already exists"

If you get this error, you already have a remote configured. Fix it:

```bash
# Check current remote
git remote -v

# Remove existing remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/yourusername/your-repo-name.git
```

### Error: "failed to push some refs"

This happens if GitHub repository was initialized with a README. Fix it:

```bash
# Pull and merge GitHub's README with your local files
git pull origin main --allow-unrelated-histories

# Then push again
git push -u origin main
```

### Error: "authentication failed"

- Use a Personal Access Token instead of password
- Make sure your token has `repo` permissions
- See Step 7 above for creating a token

### Error: "not a git repository"

Make sure you're in the project root folder:

```bash
# Check current directory
pwd  # (Mac/Linux)
cd   # (Windows)

# Navigate to project folder
cd C:\Users\kunal.chavan\Project_two

# Initialize Git
git init
```

## Important Files That Should NOT Be Committed

Your `.gitignore` file already excludes these (✅ Good!):
- `.env` - Contains sensitive API keys
- `node_modules/` - Dependencies (can be reinstalled)
- `dist/` - Build output (regenerated on build)
- Log files

**Never commit `.env` files to GitHub!** They contain your API keys and tokens.

## Next Steps After Connecting to GitHub

1. ✅ **Your code is now backed up on GitHub**
2. ✅ **You can deploy to Contentstack Launch** (see `DEPLOYMENT.md`)
3. ✅ **You can collaborate** by inviting others to your repository
4. ✅ **You can use branches** for new features

## Making Future Changes

After making changes to your code:

```bash
# 1. Check what changed
git status

# 2. Add changed files
git add .

# 3. Commit with a message
git commit -m "Description of what you changed"

# 4. Push to GitHub
git push
```

## Quick Reference Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log

# View remote repository
git remote -v
```

## Need Help?

- [GitHub Documentation](https://docs.github.com)
- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

