
#!/bin/bash

# Build the project
npm run build

# Create a .nojekyll file to prevent GitHub Pages from using Jekyll
touch dist/.nojekyll

# Deploy using gh-pages
npx gh-pages -d dist
