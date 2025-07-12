#!/bin/bash
# CanHav Platform Test Runner
# This script runs all tests and verifies API integrations

set -e  # Exit on error

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}          CanHav Platform Test Runner                    ${NC}"
echo -e "${BLUE}=========================================================${NC}"
echo -e "${YELLOW}Starting tests at $(date)${NC}\n"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose > /dev/null 2>&1; then
  echo -e "${RED}Error: docker-compose is not installed. Please install it and try again.${NC}"
  exit 1
fi

# Function to run tests
run_tests() {
  echo -e "\n${BLUE}=========================================================${NC}"
  echo -e "${BLUE}                  Starting Services                      ${NC}"
  echo -e "${BLUE}=========================================================${NC}"
  
  # Start services with docker-compose
  echo -e "${YELLOW}Starting Docker services...${NC}"
  docker-compose up -d
  
  # Wait for services to be ready
  echo -e "${YELLOW}Waiting for services to be ready...${NC}"
  sleep 10
  
  # Check if API is up
  echo -e "${YELLOW}Checking if API is up...${NC}"
  if ! curl -s http://localhost:8000/health | grep -q "ok"; then
    echo -e "${RED}Error: API is not responding correctly. Check logs with 'docker-compose logs api'${NC}"
    docker-compose down
    exit 1
  else
    echo -e "${GREEN}API is up and running!${NC}"
  fi
  
  # Install test dependencies
  echo -e "\n${BLUE}=========================================================${NC}"
  echo -e "${BLUE}              Installing Test Dependencies               ${NC}"
  echo -e "${BLUE}=========================================================${NC}"
  
  echo -e "${YELLOW}Installing Python test dependencies...${NC}"
  pip install -q requests colorama pytest
  
  # Run API integration tests
  echo -e "\n${BLUE}=========================================================${NC}"
  echo -e "${BLUE}                API Integration Tests                    ${NC}"
  echo -e "${BLUE}=========================================================${NC}"
  
  echo -e "${YELLOW}Running API integration tests...${NC}"
  python tests/api_integration_test.py
  API_TEST_STATUS=$?
  
  if [ $API_TEST_STATUS -eq 0 ]; then
    echo -e "${GREEN}API integration tests passed!${NC}"
  else
    echo -e "${RED}API integration tests failed!${NC}"
  fi
  
  # Run frontend tests
  echo -e "\n${BLUE}=========================================================${NC}"
  echo -e "${BLUE}                 Frontend E2E Tests                      ${NC}"
  echo -e "${BLUE}=========================================================${NC}"
  
  echo -e "${YELLOW}Installing Cypress dependencies...${NC}"
  cd apps/web
  npm install -q
  
  echo -e "${YELLOW}Running Cypress tests...${NC}"
  npm run cypress:run
  CYPRESS_STATUS=$?
  
  if [ $CYPRESS_STATUS -eq 0 ]; then
    echo -e "${GREEN}Frontend E2E tests passed!${NC}"
  else
    echo -e "${RED}Frontend E2E tests failed!${NC}"
  fi
  
  cd ../..
  
  # Verify third-party integrations
  echo -e "\n${BLUE}=========================================================${NC}"
  echo -e "${BLUE}             Third-Party API Integrations                ${NC}"
  echo -e "${BLUE}=========================================================${NC}"
  
  # Check CoinMarketCap API
  echo -e "${YELLOW}Testing CoinMarketCap API integration...${NC}"
  if curl -s -H "X-CMC_PRO_API_KEY: $COINMARKETCAP_API_KEY" "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=5" | grep -q "data"; then
    echo -e "${GREEN}CoinMarketCap API integration working!${NC}"
  else
    echo -e "${RED}CoinMarketCap API integration failed!${NC}"
    CMC_STATUS=1
  fi
  
  # Check OpenAI API
  echo -e "${YELLOW}Testing OpenAI API integration...${NC}"
  if curl -s -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: application/json" -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"Hello"}]}' "https://api.openai.com/v1/chat/completions" | grep -q "choices"; then
    echo -e "${GREEN}OpenAI API integration working!${NC}"
  else
    echo -e "${RED}OpenAI API integration failed!${NC}"
    OPENAI_STATUS=1
  fi
  
  # Summary
  echo -e "\n${BLUE}=========================================================${NC}"
  echo -e "${BLUE}                     Test Summary                        ${NC}"
  echo -e "${BLUE}=========================================================${NC}"
  
  FAILED=0
  
  echo -e "API Integration Tests: $([ $API_TEST_STATUS -eq 0 ] && echo "${GREEN}PASSED${NC}" || { echo "${RED}FAILED${NC}"; FAILED=1; })"
  echo -e "Frontend E2E Tests: $([ $CYPRESS_STATUS -eq 0 ] && echo "${GREEN}PASSED${NC}" || { echo "${RED}FAILED${NC}"; FAILED=1; })"
  echo -e "CoinMarketCap API: $([ -z "$CMC_STATUS" ] && echo "${GREEN}PASSED${NC}" || { echo "${RED}FAILED${NC}"; FAILED=1; })"
  echo -e "OpenAI API: $([ -z "$OPENAI_STATUS" ] && echo "${GREEN}PASSED${NC}" || { echo "${RED}FAILED${NC}"; FAILED=1; })"
  
  # Stop services
  echo -e "\n${YELLOW}Stopping Docker services...${NC}"
  docker-compose down
  
  echo -e "\n${YELLOW}Tests completed at $(date)${NC}"
  
  if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed! The CanHav platform is ready for production deployment.${NC}"
    exit 0
  else
    echo -e "\n${RED}Some tests failed. Please fix the issues before proceeding with deployment.${NC}"
    exit 1
  fi
}

# Check for environment variables
if [ -z "$COINMARKETCAP_API_KEY" ]; then
  echo -e "${YELLOW}Warning: COINMARKETCAP_API_KEY environment variable not set.${NC}"
  echo -e "${YELLOW}CoinMarketCap API tests will be skipped.${NC}"
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${YELLOW}Warning: OPENAI_API_KEY environment variable not set.${NC}"
  echo -e "${YELLOW}OpenAI API tests will be skipped.${NC}"
fi

# Run the tests
run_tests
