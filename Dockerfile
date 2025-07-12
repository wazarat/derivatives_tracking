# Base Node.js image
FROM node:18-alpine

# Set up working directory for the monorepo
WORKDIR /app

# Copy root package.json and workspace configs
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies with legacy peer deps to resolve conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the web application
RUN npm run build --workspace=web

# Expose the port
EXPOSE 3000

# Start the web application
CMD ["npm", "run", "start", "--workspace=web"]
