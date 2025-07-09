import asyncio
import httpx
import json
import os
import sys
import logging
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# API URL
API_URL = os.environ.get("API_URL", "http://localhost:8000")

async def test_endpoints():
    """Test the crypto endpoints"""
    
    async with httpx.AsyncClient() as client:
        # Test health endpoint
        logger.info("Testing health endpoint...")
        response = await client.get(f"{API_URL}/health")
        assert response.status_code == 200
        logger.info(f"Health endpoint response: {response.json()}")
        
        # Test markets endpoint
        logger.info("Testing markets endpoint...")
        response = await client.get(f"{API_URL}/crypto/markets")
        assert response.status_code == 200
        market_data = response.json()
        logger.info(f"Markets endpoint response: {json.dumps(market_data, indent=2)}")
        
        # Test assets endpoint
        logger.info("Testing assets endpoint...")
        response = await client.get(f"{API_URL}/crypto/assets?limit=10")
        assert response.status_code == 200
        assets = response.json()
        logger.info(f"Found {len(assets)} assets")
        if assets:
            logger.info(f"First asset: {json.dumps(assets[0], indent=2)}")
        
        # Test asset endpoint with a specific asset
        if assets:
            asset_id = assets[0]["id"]
            logger.info(f"Testing asset endpoint with ID {asset_id}...")
            response = await client.get(f"{API_URL}/crypto/assets/{asset_id}")
            assert response.status_code == 200
            asset = response.json()
            logger.info(f"Asset endpoint response: {json.dumps(asset, indent=2)}")
        
        # Test trending endpoint
        logger.info("Testing trending endpoint...")
        response = await client.get(f"{API_URL}/crypto/trending?limit=5")
        assert response.status_code == 200
        trending = response.json()
        logger.info(f"Found {len(trending)} trending assets")
        if trending:
            logger.info(f"First trending asset: {json.dumps(trending[0], indent=2)}")
        
        # Test refresh endpoint
        logger.info("Testing refresh endpoint...")
        response = await client.get(f"{API_URL}/crypto/refresh")
        assert response.status_code == 200
        refresh_result = response.json()
        logger.info(f"Refresh endpoint response: {json.dumps(refresh_result, indent=2)}")
        
    logger.info("All tests passed!")

if __name__ == "__main__":
    asyncio.run(test_endpoints())
