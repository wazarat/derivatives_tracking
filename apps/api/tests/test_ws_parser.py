import unittest
import json
import asyncio
from unittest.mock import MagicMock, patch
import sys
import os

# Add the parent directory to the path so we can import the app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.workers.dydx_worker import DydxV4Worker
from app.cache.memory_cache import InMemoryCache

class TestDydxWebSocketParser(unittest.TestCase):
    """Test the dYdX WebSocket message parser"""

    def setUp(self):
        """Set up test fixtures"""
        self.cache = InMemoryCache()
        self.worker = DydxV4Worker(self.cache)
        
    def test_process_markets_data(self):
        """Test processing markets data"""
        # Sample markets data from dYdX v4 WebSocket
        market_id = "BTC-USD"
        data = {
            "markets": {
                "BTC-USD": {
                    "oraclePrice": "42000.5",
                    "nextFundingRate": "0.0001",
                    "openInterest": "100.5",
                    "volume24H": "1000.5",
                    "trades24H": "500",
                    "nextFundingAt": "2023-01-01T00:00:00Z"
                }
            }
        }
        
        # Process the data
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.worker._process_markets_data(market_id, data))
        loop.close()
        
        # Check that the data was cached correctly
        cached_data = self.cache.get(f"dydx:market:{market_id}")
        self.assertIsNotNone(cached_data)
        self.assertEqual(cached_data["symbol"], market_id)
        self.assertEqual(cached_data["price"], 42000.5)
        self.assertEqual(cached_data["funding_rate"], 0.0001)
        self.assertEqual(cached_data["open_interest"], 100.5)
        self.assertEqual(cached_data["volume_24h"], 1000.5)
        self.assertEqual(cached_data["trades_24h"], 500)
        self.assertEqual(cached_data["next_funding_time"], "2023-01-01T00:00:00Z")
        self.assertEqual(cached_data["source"], "dydx_v4")
        
    def test_process_orderbook_data(self):
        """Test processing orderbook data"""
        # Sample orderbook data from dYdX v4 WebSocket
        market_id = "ETH-USD"
        data = {
            "bids": [
                ["2000.5", "10.5"],
                ["2000.0", "5.2"]
            ],
            "asks": [
                ["2001.0", "8.3"],
                ["2001.5", "12.1"]
            ]
        }
        
        # Process the data
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.worker._process_orderbook_data(market_id, data))
        loop.close()
        
        # Check that the data was cached correctly
        cached_data = self.cache.get(f"dydx:orderbook:{market_id}")
        self.assertIsNotNone(cached_data)
        self.assertEqual(cached_data["symbol"], market_id)
        self.assertEqual(cached_data["bids"], data["bids"])
        self.assertEqual(cached_data["asks"], data["asks"])
        self.assertEqual(cached_data["source"], "dydx_v4")
        
    def test_process_trades_data(self):
        """Test processing trades data"""
        # Sample trades data from dYdX v4 WebSocket
        market_id = "SOL-USD"
        data = {
            "trades": [
                {
                    "side": "BUY",
                    "size": "1.5",
                    "price": "100.5",
                    "createdAt": "2023-01-01T00:00:00Z"
                },
                {
                    "side": "SELL",
                    "size": "2.3",
                    "price": "100.6",
                    "createdAt": "2023-01-01T00:00:01Z"
                }
            ]
        }
        
        # Process the data
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.worker._process_trades_data(market_id, data))
        loop.close()
        
        # Check that the data was cached correctly
        cached_data = self.cache.get(f"dydx:trades:{market_id}")
        self.assertIsNotNone(cached_data)
        self.assertEqual(len(cached_data), 2)
        self.assertEqual(cached_data[0]["symbol"], market_id)
        self.assertEqual(cached_data[0]["side"], "BUY")
        self.assertEqual(cached_data[0]["size"], 1.5)
        self.assertEqual(cached_data[0]["price"], 100.5)
        self.assertEqual(cached_data[0]["created_at"], "2023-01-01T00:00:00Z")
        self.assertEqual(cached_data[0]["source"], "dydx_v4")
        
    @patch('app.workers.dydx_worker.DydxV4Worker._process_markets_data')
    @patch('app.workers.dydx_worker.DydxV4Worker._process_orderbook_data')
    @patch('app.workers.dydx_worker.DydxV4Worker._process_trades_data')
    def test_process_message(self, mock_trades, mock_orderbook, mock_markets):
        """Test processing different message types"""
        # Test subscription confirmation message
        subscribed_msg = {
            "type": "subscribed",
            "channel": "v4_markets",
            "id": "BTC-USD"
        }
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.worker.process_message(subscribed_msg))
        
        # None of the process methods should be called for subscription messages
        mock_markets.assert_not_called()
        mock_orderbook.assert_not_called()
        mock_trades.assert_not_called()
        
        # Test markets channel data
        markets_msg = {
            "type": "channel_data",
            "channel": "v4_markets",
            "id": "BTC-USD",
            "contents": {"markets": {"BTC-USD": {}}}
        }
        
        loop.run_until_complete(self.worker.process_message(markets_msg))
        mock_markets.assert_called_once_with("BTC-USD", {"markets": {"BTC-USD": {}}})
        
        # Test orderbook channel data
        orderbook_msg = {
            "type": "channel_data",
            "channel": "v4_orderbook",
            "id": "ETH-USD",
            "contents": {"bids": [], "asks": []}
        }
        
        loop.run_until_complete(self.worker.process_message(orderbook_msg))
        mock_orderbook.assert_called_once_with("ETH-USD", {"bids": [], "asks": []})
        
        # Test trades channel data
        trades_msg = {
            "type": "channel_data",
            "channel": "v4_trades",
            "id": "SOL-USD",
            "contents": {"trades": []}
        }
        
        loop.run_until_complete(self.worker.process_message(trades_msg))
        mock_trades.assert_called_once_with("SOL-USD", {"trades": []})
        
        loop.close()

if __name__ == '__main__':
    unittest.main()
