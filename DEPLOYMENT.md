# Deployment Guide - GitHub & Vercel

## Step 1: Push to GitHub

### 1.1 Initialize Git Repository (if not already done)

```bash
git init
```

### 1.2 Add All Files

```bash
git add .
```

### 1.3 Create Initial Commit

```bash
git commit -m "Initial commit: Surti Khaman Shop Management System"
```

### 1.4 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the **+** icon in top right corner
3. Select **New repository**
4. Repository name: `surti-khaman` (or your preferred name)
5. Description: "Shop Management System for Surti Khaman"
6. Choose **Public** or **Private** (recommended: Private)
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click **Create repository**

### 1.5 Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/surti-khaman.git
```

**Replace `YOUR_USERNAME` with your GitHub username**

### 1.6 Push to GitHub

```bash
git push -u origin main
```

If prompted for authentication:
- Use your GitHub username
- Use a **Personal Access Token** (not password)
  - To create token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
  - Select scopes: `repo` (full control)
  - Copy the token and use it as password

### 1.7 Verify on GitHub

1. Go to your repository on GitHub
2. Verify all files are uploaded
3. Check that `.env.local` is **NOT** visible (it's in .gitignore)

---

## Step 2: Deploy on Vercel

### 2.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your GitHub account

### 2.2 Import Project

1. In Vercel Dashboard, click **Add New Project**
2. You'll see your GitHub repositories
3. Find and select **surti-khaman** (or your repo name)
4. Click **Import**

### 2.3 Configure Project

Vercel will auto-detect Next.js settings. You should see:
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

**Leave these as default** and proceed.

### 2.4 Add Environment Variables

**IMPORTANT**: Before deploying, add your Supabase credentials:

1. In the **Environment Variables** section, click **Add**
2. Add first variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - Click **Add**
3. Add second variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key
   - Click **Add**

**To get Supabase credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** and **anon/public key**

### 2.5 Deploy

1. Click **Deploy** button
2. Wait for deployment to complete (usually 2-3 minutes)
3. You'll see build logs in real-time

### 2.6 Access Your Application

1. After deployment completes, you'll see:
   - **Success message**
   - **Production URL** (e.g., `surti-khaman.vercel.app`)
2. Click the URL to open your application
3. Test login with PIN: **1813**

---

## Quick Command Reference

### GitHub Commands

```bash
# Initialize (if needed)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit: Surti Khaman Shop Management System"

# Set main branch
git branch -M main

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/surti-khaman.git

# Push to GitHub
git push -u origin main
```

### Future Updates

When you make changes and want to update:

```bash
# Add changed files
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push
```

Vercel will automatically redeploy when you push to GitHub!

---

## Troubleshooting

### GitHub Issues

**Problem**: Authentication failed
- **Solution**: Use Personal Access Token instead of password
- Create token: GitHub → Settings → Developer settings → Personal access tokens

**Problem**: Remote already exists
- **Solution**: 
  ```bash
  git remote remove origin
  git remote add origin https://github.com/YOUR_USERNAME/surti-khaman.git
  ```

**Problem**: Branch name mismatch
- **Solution**: 
  ```bash
  git branch -M main
  ```

### Vercel Issues

**Problem**: Build fails
- **Solution**: 
  1. Check build logs in Vercel dashboard
  2. Verify environment variables are set correctly
  3. Ensure Supabase URL and key are correct
  4. Check that all dependencies are in `package.json`

**Problem**: Environment variables not working
- **Solution**: 
  1. Go to Vercel → Project → Settings → Environment Variables
  2. Verify variables are added
  3. Redeploy after adding variables

**Problem**: Application shows errors
- **Solution**: 
  1. Check browser console for errors
  2. Verify Supabase connection
  3. Check Vercel function logs
  4. Ensure database tables are created in Supabase

---

## Post-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Repository is accessible
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Application accessible via Vercel URL
- [ ] PIN login works (PIN: 1813)
- [ ] All features tested on production
- [ ] Mobile view tested

---

## Custom Domain (Optional)

To use a custom domain:

1. Go to Vercel → Project → Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (usually 24-48 hours)

---

**Your application is now live! 🎉**

Visit your Vercel URL and start using the shop management system.

