import asyncio
import httpx
import json
import os
import sys
import logging
from datetime import datetime
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# API URL
API_URL = os.environ.get("API_URL", "http://localhost:8000")

async def test_coinmarketcap_endpoints():
    """Test the refactored crypto endpoints that use CoinMarketCap API exclusively"""
    
    # Test symbols to use (common cryptocurrencies)
    test_symbols = ["BTC", "ETH", "SOL", "DOGE", "XRP"]
    
    async with httpx.AsyncClient() as client:
        logger.info("Starting tests for CoinMarketCap-based endpoints...")
        
        # Test /metrics/{symbol} endpoint for each test symbol
        for symbol in test_symbols:
            logger.info(f"Testing /metrics/{symbol} endpoint...")
            try:
                response = await client.get(f"{API_URL}/crypto/metrics/{symbol}")
                assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
                
                metrics_data = response.json()
                logger.info(f"Successfully retrieved metrics for {symbol}")
                
                # Validate response structure
                assert "symbol" in metrics_data, "Missing 'symbol' in response"
                assert "name" in metrics_data, "Missing 'name' in response"
                assert "price" in metrics_data, "Missing 'price' in response"
                
                # Log some key metrics
                logger.info(f"Symbol: {metrics_data['symbol']}")
                logger.info(f"Name: {metrics_data['name']}")
                logger.info(f"Price: ${metrics_data.get('price', 'N/A')}")
                logger.info(f"Market Cap: ${metrics_data.get('market_cap', 'N/A')}")
                logger.info(f"24h Change: {metrics_data.get('price_change_percentage_24h', 'N/A')}%")
                
            except Exception as e:
                logger.error(f"Error testing /metrics/{symbol}: {e}")
                raise
                
        logger.info("All /metrics/{symbol} tests passed!")
        
        # Test /history/{symbol} endpoint for each test symbol with different parameters
        for symbol in test_symbols:
            # Test with default parameters
            logger.info(f"Testing /history/{symbol} endpoint with default parameters...")
            try:
                response = await client.get(f"{API_URL}/crypto/history/{symbol}")
                assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
                
                history_data = response.json()
                logger.info(f"Successfully retrieved history for {symbol} with default parameters")
                
                # Validate response structure
                assert "symbol" in history_data, "Missing 'symbol' in response"
                assert "name" in history_data, "Missing 'name' in response"
                assert "price_history" in history_data, "Missing 'price_history' in response"
                assert "volume_history" in history_data, "Missing 'volume_history' in response"
                assert "market_cap_history" in history_data, "Missing 'market_cap_history' in response"
                
                # Log some basic stats
                logger.info(f"Symbol: {history_data['symbol']}")
                logger.info(f"Name: {history_data['name']}")
                logger.info(f"Interval: {history_data['interval']}")
                logger.info(f"Days: {history_data['days']}")
                logger.info(f"Price history points: {len(history_data['price_history'])}")
                logger.info(f"Volume history points: {len(history_data['volume_history'])}")
                logger.info(f"Market cap history points: {len(history_data['market_cap_history'])}")
                
            except Exception as e:
                logger.error(f"Error testing /history/{symbol} with default parameters: {e}")
                raise
                
            # Test with custom parameters (7 days, hourly)
            logger.info(f"Testing /history/{symbol} endpoint with custom parameters (7 days, hourly)...")
            try:
                response = await client.get(f"{API_URL}/crypto/history/{symbol}?days=7&interval=hourly")
                assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
                
                history_data = response.json()
                logger.info(f"Successfully retrieved history for {symbol} with custom parameters")
                
                # Validate response structure
                assert "symbol" in history_data, "Missing 'symbol' in response"
                assert "name" in history_data, "Missing 'name' in response"
                assert "price_history" in history_data, "Missing 'price_history' in response"
                assert "volume_history" in history_data, "Missing 'volume_history' in response"
                assert "market_cap_history" in history_data, "Missing 'market_cap_history' in response"
                
                # Validate custom parameters
                assert history_data["interval"] == "hourly", f"Expected interval 'hourly', got '{history_data['interval']}'"
                assert history_data["days"] == 7, f"Expected days 7, got {history_data['days']}"
                
                # Log some basic stats
                logger.info(f"Symbol: {history_data['symbol']}")
                logger.info(f"Name: {history_data['name']}")
                logger.info(f"Interval: {history_data['interval']}")
                logger.info(f"Days: {history_data['days']}")
                logger.info(f"Price history points: {len(history_data['price_history'])}")
                
            except Exception as e:
                logger.error(f"Error testing /history/{symbol} with custom parameters: {e}")
                raise
                
        logger.info("All /history/{symbol} tests passed!")
        
        # Test error handling with invalid symbol
        logger.info("Testing error handling with invalid symbol...")
        invalid_symbol = "INVALID_SYMBOL_123"
        
        # Test metrics with invalid symbol
        response = await client.get(f"{API_URL}/crypto/metrics/{invalid_symbol}")
        assert response.status_code == 404, f"Expected status code 404, got {response.status_code}"
        logger.info(f"Successfully handled invalid symbol for /metrics/{invalid_symbol}")
        
        # Test history with invalid symbol
        response = await client.get(f"{API_URL}/crypto/history/{invalid_symbol}")
        assert response.status_code == 404, f"Expected status code 404, got {response.status_code}"
        logger.info(f"Successfully handled invalid symbol for /history/{invalid_symbol}")
        
        # Test history with invalid parameters
        logger.info("Testing error handling with invalid parameters...")
        response = await client.get(f"{API_URL}/crypto/history/BTC?days=1000")  # Days too high
        assert response.status_code == 400, f"Expected status code 400, got {response.status_code}"
        logger.info("Successfully handled invalid days parameter")
        
        response = await client.get(f"{API_URL}/crypto/history/BTC?interval=invalid")  # Invalid interval
        assert response.status_code == 400, f"Expected status code 400, got {response.status_code}"
        logger.info("Successfully handled invalid interval parameter")
        
    logger.info("All CoinMarketCap endpoint tests passed!")

if __name__ == "__main__":
    asyncio.run(test_coinmarketcap_endpoints())
