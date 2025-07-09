#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== CanHav Local Deployment & Testing Script ===${NC}"

# Check if .env file exists, if not create from sample
if [ ! -f .env ]; then
  echo -e "${YELLOW}No .env file found. Creating from .env.sample...${NC}"
  cp .env.sample .env
  echo -e "${YELLOW}Please edit .env file with your actual credentials before continuing.${NC}"
  echo -e "${YELLOW}Press Enter to continue after editing .env, or Ctrl+C to cancel${NC}"
  read
fi

# Load environment variables
echo -e "${GREEN}Loading environment variables...${NC}"
source .env

# Check Docker is running
echo -e "${GREEN}Checking Docker status...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

# Build and start services
echo -e "${GREEN}Building and starting services with Docker Compose...${NC}"
docker-compose down
docker-compose build
docker-compose up -d

echo -e "${GREEN}Waiting for services to start (30 seconds)...${NC}"
sleep 30

# Test API endpoints
echo -e "${GREEN}Testing API endpoints...${NC}"
echo -e "${YELLOW}Testing /docs endpoint...${NC}"
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs && echo ""

echo -e "${YELLOW}Testing /markets endpoint...${NC}"
curl -s http://localhost:8000/api/v1/markets | jq . || echo "Failed to fetch markets data"

echo -e "${YELLOW}Testing /assets endpoint...${NC}"
curl -s http://localhost:8000/api/v1/assets | jq . || echo "Failed to fetch assets data"

# Test Web UI
echo -e "${GREEN}Web UI is available at:${NC}"
echo -e "${YELLOW}http://localhost:3000${NC}"

# Instructions for manual testing
echo -e "\n${GREEN}=== Manual Testing Instructions ===${NC}"
echo -e "${YELLOW}1. Open http://localhost:3000 in your browser${NC}"
echo -e "${YELLOW}2. Test authentication with Clerk${NC}"
echo -e "${YELLOW}3. Verify the metrics dashboard loads and displays data${NC}"
echo -e "${YELLOW}4. Test watchlist functionality (add, update, delete)${NC}"
echo -e "${YELLOW}5. Verify portfolio pie chart and risk gauge display correctly${NC}"

echo -e "\n${GREEN}=== Logs ===${NC}"
echo -e "${YELLOW}To view API logs:${NC} docker-compose logs -f api"
echo -e "${YELLOW}To view Web logs:${NC} docker-compose logs -f web"

echo -e "\n${GREEN}=== Cleanup ===${NC}"
echo -e "${YELLOW}To stop all services:${NC} docker-compose down"

echo -e "\n${GREEN}Deployment and initial tests complete!${NC}"
