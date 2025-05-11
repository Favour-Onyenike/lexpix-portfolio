
# Deployment Instructions for GitHub Pages

This project is configured to be deployed to GitHub Pages. Follow these steps to deploy:

## Method 1: Using the Helper Script (Recommended)

1. Make sure your project is initialized as a git repository and has a remote origin set:
   ```bash
   git init # if not already initialized
   git remote add origin https://github.com/yourusername/your-repo-name.git
   ```

2. Run the deployment helper script:
   ```bash
   node src/deploy.js
   ```

3. The script will:
   - Install the required dependencies
   - Build the project
   - Deploy to GitHub Pages
   - Provide you with the URL of your deployed site

## Method 2: Manual Deployment

1. Install the gh-pages package (if not already installed):
   ```bash
   npm install gh-pages --save-dev
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy to GitHub Pages:
   ```bash
   npx gh-pages -d dist
   ```

4. Go to your GitHub repository settings:
   - Navigate to the "Pages" section
   - Make sure the source is set to the "gh-pages" branch

5. Your site will be available at `https://yourusername.github.io/your-repo-name/`

## Configuration

This project is already configured for GitHub Pages with:
- Base URL set to `./` in vite.config.ts for relative paths
- Proper asset handling for GitHub Pages deployment

## Troubleshooting

If you encounter any issues with the deployment:

1. Make sure you have the correct permissions for the GitHub repository
2. Check if the build process completes successfully
3. Verify that the gh-pages branch was created and pushed to GitHub
4. Check if GitHub Pages is enabled in your repository settings

For more information, refer to:
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
