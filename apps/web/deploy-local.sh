#!/bin/bash

# Display header
echo "========================================="
echo "   Canhav Webapp Local Deployment Tool   "
echo "========================================="

# Navigate to the web app directory
cd /Users/wazarat/CascadeProjects/canhav/apps/web

# Check if API is running and start it if needed
if ! pgrep -f "uvicorn" >/dev/null; then
  echo " API not running – starting it in the background..."
  cd /Users/wazarat/CascadeProjects/canhav
  docker compose up -d api postgres
  cd /Users/wazarat/CascadeProjects/canhav/apps/web
fi

# Step 1: Install dependencies
echo "Step 1: Installing dependencies..."
npm install --legacy-peer-deps

# Step 2: Install specific Radix UI components that might be missing
echo "Step 2: Installing specific Radix UI components..."
npm install --legacy-peer-deps @radix-ui/react-icons@^1.3.0
npm install --legacy-peer-deps @radix-ui/react-dialog@^1.0.4
npm install --legacy-peer-deps @radix-ui/primitive@^1.0.0
npm install --legacy-peer-deps @radix-ui/react-select@^1.2.0
npm install --legacy-peer-deps @tanstack/react-table@^8.10.7
npm install --legacy-peer-deps posthog-js openai

# Step 3: Create necessary type directories if they don't exist
echo "Step 3: Ensuring type declaration directories exist..."
mkdir -p src/types

# Step 4: Fix client component issue
echo "Step 4: Adding 'use client' directive to React components..."
for file in src/components/research/*.tsx; do
  if [ -f "$file" ] && ! grep -q "^\"use client\";" "$file"; then
    echo "Adding 'use client' directive to $file"
    sed -i '' '1s/^/"use client";\n/' "$file"
  fi
done

# Step 5: Fix columns.tsx import issue
echo "Step 5: Fixing columns.tsx import issues..."
for file in $(grep -l "@/config/columns.tsx" --include="*.ts" --include="*.tsx" -r .); do
  echo "Updating imports in $file"
  sed -i '' 's|from "@/config/columns.tsx"|from "@/config/columns"|g' "$file"
done

for file in $(grep -l "@/config/columns.ts" --include="*.ts" --include="*.tsx" -r .); do
  echo "Updating imports in $file"
  sed -i '' 's|from "@/config/columns.ts"|from "@/config/columns"|g' "$file"
done

# Step 6: Create .env.local file with Supabase credentials if it doesn't exist
echo "Step 6: Creating .env.local file with placeholder credentials..."
if [ ! -f .env.local ]; then
  echo "Creating .env.local file from example template"
  cp .env.local.example .env.local
  echo "  Edit apps/web/.env.local and add your Supabase keys before running the web build."
fi

# Step 7: Build the application with type checking disabled
echo "Step 7: Building the application with type checking disabled..."
SKIP_TYPE_CHECK=true npm run build

# Step 8: Start the application
echo "Step 8: Starting the application..."
npm run dev --workspace canhav-web

echo "========================================="
echo "   Canhav Webapp is now running locally  "
echo "   Access it at: http://localhost:3000   "
echo "========================================="
