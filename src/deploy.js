
// This is a helper script to deploy to GitHub Pages
// To use it, run:
// node src/deploy.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m"
};

console.log(`${colors.cyan}${colors.bright}===== GitHub Pages Deployment Helper =====\n${colors.reset}`);

try {
  // Check if git is initialized
  try {
    execSync('git status', { stdio: 'pipe' });
    console.log(`${colors.green}✓ Git repository detected${colors.reset}`);
  } catch (error) {
    console.log(`${colors.yellow}! Git repository not found. Initializing...${colors.reset}`);
    execSync('git init', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Git repository initialized${colors.reset}`);
  }
  
  // Install gh-pages if not already installed
  console.log(`${colors.cyan}Installing gh-pages package...${colors.reset}`);
  execSync('npm install gh-pages --save-dev', { stdio: 'inherit' });
  
  // Build the project
  console.log(`${colors.cyan}Building the project...${colors.reset}`);
  execSync('npm run build', { stdio: 'inherit' });
  
  // Create .nojekyll file
  console.log(`${colors.cyan}Creating .nojekyll file...${colors.reset}`);
  const distDir = path.join(process.cwd(), 'dist');
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
  
  // Ensure CNAME file exists
  console.log(`${colors.cyan}Ensuring CNAME file exists...${colors.reset}`);
  fs.writeFileSync(path.join(distDir, 'CNAME'), 'lexarenpixtures.com');
  
  // Get the remote origin URL if it exists
  let remoteUrl = '';
  try {
    remoteUrl = execSync('git config --get remote.origin.url', { stdio: 'pipe' }).toString().trim();
    console.log(`${colors.green}✓ Remote repository found: ${remoteUrl}${colors.reset}`);
  } catch (error) {
    console.log(`${colors.yellow}! No remote repository configured.${colors.reset}`);
    console.log(`${colors.yellow}  Please run: git remote add origin <your-github-repo-url>${colors.reset}`);
    console.log(`${colors.yellow}  Then run this script again.${colors.reset}`);
    process.exit(1);
  }
  
  // Deploy to gh-pages
  console.log(`${colors.cyan}Deploying to GitHub Pages...${colors.reset}`);
  const ghPages = require('gh-pages');
  
  ghPages.publish('dist', {
    branch: 'gh-pages',
    repo: remoteUrl,
    message: 'Auto-deploy to GitHub Pages',
  }, function(err) {
    if (err) {
      console.log(`${colors.red}Error during deployment:${colors.reset}`, err);
      process.exit(1);
    } else {
      console.log(`${colors.green}${colors.bright}✓ Successfully deployed to GitHub Pages!${colors.reset}`);
      
      console.log(`\n${colors.cyan}${colors.bright}Your site is now live at:${colors.reset}`);
      console.log(`${colors.cyan}https://lexarenpixtures.com/${colors.reset}`);
      
      console.log(`\n${colors.cyan}${colors.bright}Next steps:${colors.reset}`);
      console.log(`${colors.cyan}1. Ensure your domain DNS is configured correctly to point to GitHub Pages${colors.reset}`);
      console.log(`${colors.cyan}2. Go to your repository settings on GitHub${colors.reset}`);
      console.log(`${colors.cyan}3. Navigate to Pages section${colors.reset}`);
      console.log(`${colors.cyan}4. Verify the custom domain settings${colors.reset}`);
    }
  });
  
} catch (error) {
  console.log(`${colors.red}Error:${colors.reset}`, error.message);
  process.exit(1);
}
