
#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Build the project
echo "Building the project..."
npm run build

# Create a .nojekyll file to prevent GitHub Pages from using Jekyll
echo "Creating .nojekyll file..."
touch dist/.nojekyll

# Deploy using gh-pages
echo "Deploying to GitHub Pages..."
npx gh-pages -d dist

echo "Deployment complete! Your site should be available at https://favour-onyenike.github.io/lexpix-portfolio/"
