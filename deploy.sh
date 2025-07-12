#!/bin/bash
set -e

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== CanHav Platform Deployment Script ===${NC}"
echo -e "${YELLOW}This script will deploy the CanHav platform to production.${NC}"
echo

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found.${NC}"
    echo "Please create a .env file with the required environment variables."
    echo "You can use the .env.example files in apps/web and apps/api as templates."
    exit 1
fi

# Load environment variables
echo -e "${GREEN}Loading environment variables...${NC}"
source .env
echo -e "${GREEN}Environment variables loaded.${NC}"
echo

# Check for required tools
echo -e "${GREEN}Checking for required tools...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Error: docker is required but not installed.${NC}" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Error: docker-compose is required but not installed.${NC}" >&2; exit 1; }
echo -e "${GREEN}All required tools are installed.${NC}"
echo

# Create necessary directories
echo -e "${GREEN}Creating necessary directories...${NC}"
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
mkdir -p nginx/logs
echo -e "${GREEN}Directories created.${NC}"
echo

# Build and deploy
echo -e "${GREEN}Building and deploying the CanHav platform...${NC}"
echo -e "${YELLOW}This may take a few minutes...${NC}"

# Pull latest changes if in a git repository
if [ -d ".git" ]; then
    echo -e "${GREEN}Pulling latest changes from git...${NC}"
    git pull
    echo -e "${GREEN}Git pull completed.${NC}"
    echo
fi

# Build and start containers
echo -e "${GREEN}Building and starting containers...${NC}"
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
echo -e "${GREEN}Containers built and started.${NC}"
echo

# Run database migrations if needed
echo -e "${GREEN}Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml exec api alembic upgrade head
echo -e "${GREEN}Database migrations completed.${NC}"
echo

# Check if services are running
echo -e "${GREEN}Checking if services are running...${NC}"
docker-compose -f docker-compose.prod.yml ps
echo

# Check health endpoints
echo -e "${GREEN}Checking health endpoints...${NC}"
echo -e "${YELLOW}API health check:${NC}"
curl -s http://localhost:8000/health || echo -e "${RED}API health check failed.${NC}"
echo
echo -e "${YELLOW}Web health check:${NC}"
curl -s http://localhost:3000/api/health || echo -e "${RED}Web health check failed.${NC}"
echo

echo -e "${GREEN}=== Deployment completed! ===${NC}"
echo -e "${YELLOW}The CanHav platform is now running at:${NC}"
echo -e "${GREEN}Frontend: https://canhav.com${NC}"
echo -e "${GREEN}API: https://canhav.com/api${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Verify that all services are running correctly"
echo "2. Check the logs for any errors: docker-compose -f docker-compose.prod.yml logs"
echo "3. Run through the items in LAUNCH_CHECKLIST.md"
echo
echo -e "${GREEN}Thank you for using the CanHav deployment script!${NC}"
