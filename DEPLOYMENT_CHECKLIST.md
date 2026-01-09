# GitHub Pages Deployment Checklist

## ✅ Pre-Deployment Setup

- [x] GitHub Actions workflow created (`.github/workflows/deploy.yml`)
- [x] Vite config updated for GitHub Pages base path support
- [x] 404.html created for SPA routing support
- [x] Build configuration verified

## 📋 Before First Deployment

### 1. Repository Settings
- [ ] Enable GitHub Pages in repository Settings → Pages
- [ ] Set source to "GitHub Actions" (not "Deploy from a branch")
- [ ] Verify repository is public (or you have GitHub Pro/Team for private repos)

### 2. GitHub Secrets (Optional)
Set these in **Settings → Secrets and variables → Actions** if you need to override defaults:

- [ ] `VITE_API_BASE_URL` - Production API URL (default: `https://backend-drab-alpha-85.vercel.app`)
- [ ] `VITE_EMAILJS_SERVICE_ID` - Your EmailJS service ID
- [ ] `VITE_EMAILJS_TEMPLATE_ID` - Your EmailJS template ID  
- [ ] `VITE_EMAILJS_PUBLIC_KEY` - Your EmailJS public key

### 3. Base Path Configuration
If your site will be at `https://username.github.io/repo-name/` (not root):

- [ ] Update `vite.config.ts` base path:
  ```typescript
  base: '/repo-name/',
  ```

- [ ] Update `404.html` base path variable:
  ```javascript
  var basePath = '/repo-name';
  ```

### 4. Branch Configuration
- [ ] Verify the workflow triggers on your default branch (currently set to `main`)
- [ ] If your default branch is different, update `.github/workflows/deploy.yml`:
  ```yaml
  branches:
    - your-default-branch
  ```

## 🚀 Deployment

1. **Push to main branch** - Deployment will trigger automatically
   OR
2. **Manual trigger** - Go to Actions tab → "Deploy to GitHub Pages" → "Run workflow"

## ✅ Post-Deployment Verification

- [ ] Site is accessible at the GitHub Pages URL
- [ ] Homepage loads correctly
- [ ] Navigation works (all routes accessible)
- [ ] Direct links to routes work (e.g., `/gallery`, `/book`)
- [ ] API calls work (check browser console for errors)
- [ ] EmailJS form submission works (if configured)

## 🔧 Troubleshooting

### Routes return 404
- Check that `404.html` exists in the `dist` folder
- Verify base path configuration matches your GitHub Pages URL structure
- Check browser console for routing errors

### Environment variables not working
- Verify GitHub Secrets are set correctly
- Check Actions workflow logs for environment variable values
- Ensure secret names match exactly (case-sensitive)

### Build fails
- Check Actions logs for specific errors
- Verify Node.js version (workflow uses Node 20)
- Ensure all dependencies are in `package.json`

## 📝 Files Created/Modified

- ✅ `.github/workflows/deploy.yml` - GitHub Actions deployment workflow
- ✅ `vite.config.ts` - Updated with base path and 404.html copy plugin
- ✅ `404.html` - SPA routing support for GitHub Pages
- ✅ `GITHUB_PAGES_SETUP.md` - Detailed setup documentation
