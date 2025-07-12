# Base Node.js image
FROM node:18-alpine

# Set up working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with legacy peer deps to resolve conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application (skip type checking for now)
RUN SKIP_TYPE_CHECK=true npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]