# GitHub Pages Deployment Setup

This guide explains how to deploy the public-site to GitHub Pages.

## Prerequisites

1. A GitHub repository
2. GitHub Actions enabled for your repository
3. GitHub Pages enabled in repository settings

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
4. Save the settings

### 2. Configure GitHub Secrets (Optional but Recommended)

If you need to override environment variables for production, set them as GitHub Secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets (if different from defaults):
   - `VITE_API_BASE_URL` - Your production API URL (default: `https://backend-drab-alpha-85.vercel.app`)
   - `VITE_EMAILJS_SERVICE_ID` - Your EmailJS service ID
   - `VITE_EMAILJS_TEMPLATE_ID` - Your EmailJS template ID
   - `VITE_EMAILJS_PUBLIC_KEY` - Your EmailJS public key

### 3. Update Base Path (If Needed)

If your site will be hosted at `https://username.github.io/repo-name/` (not at the root):

1. Update `vite.config.ts`:
   ```typescript
   base: '/repo-name/',
   ```

2. Update `404.html`:
   ```javascript
   var pathSegmentsToKeep = 1; // Keep the repo-name segment
   ```

### 4. Deploy

The deployment happens automatically when you push to the `main` branch, or you can trigger it manually:

1. Go to **Actions** tab in your repository
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

### 5. Access Your Site

After deployment, your site will be available at:
- `https://username.github.io/repo-name/` (if in a subdirectory)
- `https://username.github.io/` (if it's your user/organization page)

## How It Works

1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
   - Triggers on push to `main` branch
   - Builds the React app with production environment variables
   - Deploys the `dist` folder to GitHub Pages

2. **404.html for SPA Routing**:
   - GitHub Pages doesn't support client-side routing by default
   - The `404.html` file redirects all 404s to `index.html` with the original path
   - React Router then handles the routing client-side

3. **Vite Configuration**:
   - Configured with the correct base path for GitHub Pages
   - Automatically copies `404.html` to the dist folder during build

## Troubleshooting

### Routes Not Working

If direct links to routes (e.g., `/gallery`) return 404:
- Ensure `404.html` is in the `dist` folder (it's copied automatically)
- Check that the base path in `vite.config.ts` matches your GitHub Pages URL structure

### Environment Variables Not Working

- Check that GitHub Secrets are set correctly
- Verify the workflow file uses the correct secret names
- Check the Actions logs for any environment variable errors

### Build Fails

- Check Node.js version (workflow uses Node 20)
- Verify all dependencies are in `package.json`
- Check the Actions logs for specific error messages

## Manual Deployment

If you prefer to deploy manually:

```bash
# Build the app
npm run build

# The dist folder can be deployed to GitHub Pages
# You can use gh-pages package or manually upload
```
