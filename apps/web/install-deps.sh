#!/bin/bash

# Navigate to the web app directory
cd /Users/wazarat/CascadeProjects/canhav/apps/web

# Install dependencies with legacy peer deps flag
npm install --legacy-peer-deps

# Install specific Radix UI components that might be missing
npm install --legacy-peer-deps @radix-ui/react-icons@^1.3.0
npm install --legacy-peer-deps @radix-ui/react-dialog@1.0.6
npm install --legacy-peer-deps @tanstack/react-table@^8.10.7

# Install any other potentially missing dependencies
npm install --legacy-peer-deps @radix-ui/react-breadcrumb@1.0.2

echo "Dependencies installation complete!"
