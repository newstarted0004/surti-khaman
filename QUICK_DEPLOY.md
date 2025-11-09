# Quick Deployment Commands

## 🚀 Complete Step-by-Step Commands

### Step 1: Initialize Git and Push to GitHub

Run these commands in your terminal (in the project directory):

```bash
# 1. Initialize Git repository
git init

# 2. Add all files
git add .

# 3. Create initial commit
git commit -m "Initial commit: Surti Khaman Shop Management System"

# 4. Set main branch
git branch -M main

# 5. Add GitHub remote (REPLACE YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/surti-khaman.git

# 6. Push to GitHub
git push -u origin main
```

**Note**: When pushing, you'll be asked for credentials:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)
  - Create token: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Select scope: `repo` (full control)
  - Copy the token and use it as password

---

### Step 2: Deploy on Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click**: "Add New Project"
4. **Select**: Your `surti-khaman` repository
5. **Click**: "Import"

6. **Add Environment Variables** (BEFORE clicking Deploy):
   - Click "Environment Variables"
   - Add: `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL
   - Add: `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
   - Click "Add" for each

7. **Click**: "Deploy"
8. **Wait**: 2-3 minutes for deployment
9. **Access**: Your live URL will be shown

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project directory)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? surti-khaman
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] `.env.local` file exists with your Supabase credentials (for local testing)
- [ ] `.env.local` is in `.gitignore` (it should be automatically)
- [ ] Supabase database is set up (run `supabase-setup.sql`)
- [ ] All dependencies are in `package.json`
- [ ] Code is working locally (`npm run dev`)

---

## 🔄 Future Updates

When you make changes:

```bash
# Add changes
git add .

# Commit
git commit -m "Description of your changes"

# Push to GitHub
git push
```

**Vercel will automatically redeploy** when you push to GitHub!

---

## 🆘 Quick Troubleshooting

### Git Issues

**"fatal: remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/surti-khaman.git
```

**"Authentication failed"**
- Use Personal Access Token, not password
- Create token: https://github.com/settings/tokens

### Vercel Issues

**Build fails**
- Check environment variables are set
- Verify Supabase credentials
- Check build logs in Vercel dashboard

**App not working**
- Verify Supabase connection
- Check browser console for errors
- Ensure database tables are created

---

## ✅ After Deployment

1. Visit your Vercel URL
2. Login with PIN: **1813**
3. Test all features
4. Share the URL with the shop owner

---

**That's it! Your app is live! 🎉**

