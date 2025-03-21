#!/bin/bash

# This script prepares the application for Vercel deployment
# It ensures that database connections aren't attempted during build time

# Set environment variable to skip DB initialization during build
export NEXT_SKIP_INITIALIZING_DB=true

# Run the build process
echo "🚀 Running Vercel build with DB initialization disabled..."
npm run build