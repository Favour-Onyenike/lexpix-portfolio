
#!/bin/bash

# Build the project
npm run build

# Deploy using gh-pages
npx gh-pages -d dist
