import asyncio
import json
import logging
import websockets
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime

from ..cache.memory_cache import InMemoryCache

# Configure logging
logger = logging.getLogger(__name__)

class DydxV4Worker:
    """
    Worker for fetching real-time market data from dYdX v4 via WebSocket
    
    dYdX v4 WebSocket API documentation:
    https://docs.dydx.exchange/developers/indexer/websocket
    """
    
    def __init__(self, cache: InMemoryCache):
        """
        Initialize the dYdX v4 worker
        
        Args:
            cache: Cache instance for storing fetched data
        """
        self.cache = cache
        self.ws_url = "wss://indexer.v4-testnet.dydx.exchange/v4/ws"
        self.websocket = None
        self.subscribed_markets = set()
        self.running = False
        self.reconnect_delay = 1  # Initial reconnect delay in seconds
        self.max_reconnect_delay = 60  # Maximum reconnect delay in seconds
        
    async def setup(self):
        """Initialize the worker"""
        logger.info("Setting up dYdX v4 worker")
    
    async def connect(self):
        """Connect to dYdX v4 WebSocket"""
        try:
            logger.info(f"Connecting to dYdX v4 WebSocket: {self.ws_url}")
            self.websocket = await websockets.connect(self.ws_url)
            logger.info("Connected to dYdX v4 WebSocket")
            self.reconnect_delay = 1  # Reset reconnect delay on successful connection
            return True
        except Exception as e:
            logger.error(f"Failed to connect to dYdX v4 WebSocket: {e}")
            return False
    
    async def subscribe_to_markets(self, markets: List[str]):
        """
        Subscribe to market data for specified markets
        
        Args:
            markets: List of market symbols (e.g., ["BTC-USD", "ETH-USD"])
        """
        if not self.websocket:
            logger.error("WebSocket not connected, cannot subscribe to markets")
            return
        
        for market in markets:
            if market in self.subscribed_markets:
                continue
                
            try:
                # Subscribe to orderbook data
                subscribe_msg = {
                    "type": "subscribe",
                    "channel": "v4_orderbook",
                    "id": market
                }
                await self.websocket.send(json.dumps(subscribe_msg))
                
                # Subscribe to trades data
                subscribe_msg = {
                    "type": "subscribe",
                    "channel": "v4_trades",
                    "id": market
                }
                await self.websocket.send(json.dumps(subscribe_msg))
                
                # Subscribe to markets data (includes funding rates)
                subscribe_msg = {
                    "type": "subscribe",
                    "channel": "v4_markets",
                    "id": market
                }
                await self.websocket.send(json.dumps(subscribe_msg))
                
                self.subscribed_markets.add(market)
                logger.info(f"Subscribed to dYdX v4 market: {market}")
            except Exception as e:
                logger.error(f"Failed to subscribe to dYdX v4 market {market}: {e}")
    
    async def process_message(self, message: Dict[str, Any]):
        """
        Process a WebSocket message
        
        Args:
            message: WebSocket message as a dictionary
        """
        try:
            if message.get("type") == "subscribed":
                logger.info(f"Successfully subscribed to {message.get('channel')} for {message.get('id')}")
                return
            
            if message.get("type") == "channel_data":
                channel = message.get("channel")
                market_id = message.get("id")
                
                if not channel or not market_id:
                    return
                
                # Process different channel types
                if channel == "v4_markets":
                    await self._process_markets_data(market_id, message.get("contents", {}))
                elif channel == "v4_orderbook":
                    await self._process_orderbook_data(market_id, message.get("contents", {}))
                elif channel == "v4_trades":
                    await self._process_trades_data(market_id, message.get("contents", {}))
        except Exception as e:
            logger.error(f"Error processing dYdX v4 message: {e}")
    
    async def _process_markets_data(self, market_id: str, data: Dict[str, Any]):
        """
        Process markets data (includes funding rates)
        
        Args:
            market_id: Market ID (e.g., "BTC-USD")
            data: Markets data
        """
        try:
            # Extract relevant data
            market_data = data.get("markets", {}).get(market_id)
            if not market_data:
                return
            
            # Extract and format data
            processed_data = {
                "symbol": market_id,
                "price": float(market_data.get("oraclePrice", 0)),
                "funding_rate": float(market_data.get("nextFundingRate", 0)),
                "open_interest": float(market_data.get("openInterest", 0)),
                "volume_24h": float(market_data.get("volume24H", 0)),
                "trades_24h": int(market_data.get("trades24H", 0)),
                "next_funding_time": market_data.get("nextFundingAt"),
                "source": "dydx_v4",
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Cache the data
            cache_key = f"dydx:market:{market_id}"
            self.cache.set(cache_key, processed_data, ttl=300)  # 5 minutes TTL
            
            # Also update a combined markets cache
            all_markets = self.cache.get("dydx:all_markets") or []
            
            # Update or add this market
            updated = False
            for i, market in enumerate(all_markets):
                if market.get("symbol") == market_id:
                    all_markets[i] = processed_data
                    updated = True
                    break
            
            if not updated:
                all_markets.append(processed_data)
            
            self.cache.set("dydx:all_markets", all_markets, ttl=300)
            
        except Exception as e:
            logger.error(f"Error processing dYdX v4 markets data for {market_id}: {e}")
    
    async def _process_orderbook_data(self, market_id: str, data: Dict[str, Any]):
        """
        Process orderbook data
        
        Args:
            market_id: Market ID (e.g., "BTC-USD")
            data: Orderbook data
        """
        try:
            # Extract relevant data
            orderbook = {
                "symbol": market_id,
                "bids": data.get("bids", []),
                "asks": data.get("asks", []),
                "source": "dydx_v4",
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Cache the data
            cache_key = f"dydx:orderbook:{market_id}"
            self.cache.set(cache_key, orderbook, ttl=60)  # 1 minute TTL
            
        except Exception as e:
            logger.error(f"Error processing dYdX v4 orderbook data for {market_id}: {e}")
    
    async def _process_trades_data(self, market_id: str, data: Dict[str, Any]):
        """
        Process trades data
        
        Args:
            market_id: Market ID (e.g., "BTC-USD")
            data: Trades data
        """
        try:
            trades = data.get("trades", [])
            if not trades:
                return
                
            # Process trades
            processed_trades = []
            for trade in trades:
                processed_trade = {
                    "symbol": market_id,
                    "side": trade.get("side"),
                    "size": float(trade.get("size", 0)),
                    "price": float(trade.get("price", 0)),
                    "created_at": trade.get("createdAt"),
                    "source": "dydx_v4"
                }
                processed_trades.append(processed_trade)
            
            # Cache the data
            cache_key = f"dydx:trades:{market_id}"
            existing_trades = self.cache.get(cache_key) or []
            
            # Combine with existing trades, keeping only the most recent 100
            combined_trades = processed_trades + existing_trades
            combined_trades = combined_trades[:100]
            
            self.cache.set(cache_key, combined_trades, ttl=300)  # 5 minutes TTL
            
        except Exception as e:
            logger.error(f"Error processing dYdX v4 trades data for {market_id}: {e}")
    
    async def listen(self):
        """Listen for WebSocket messages"""
        if not self.websocket:
            logger.error("WebSocket not connected, cannot listen for messages")
            return
        
        try:
            while self.running:
                try:
                    message = await asyncio.wait_for(self.websocket.recv(), timeout=30)
                    await self.process_message(json.loads(message))
                except asyncio.TimeoutError:
                    # Send ping to keep connection alive
                    try:
                        pong = await self.websocket.ping()
                        await asyncio.wait_for(pong, timeout=10)
                        logger.debug("Ping successful")
                    except asyncio.TimeoutError:
                        logger.warning("Ping timeout, reconnecting...")
                        await self.reconnect()
                        break
                except websockets.exceptions.ConnectionClosed:
                    logger.warning("WebSocket connection closed, reconnecting...")
                    await self.reconnect()
                    break
        except Exception as e:
            logger.error(f"Error in WebSocket listener: {e}")
            await self.reconnect()
    
    async def reconnect(self):
        """Reconnect to WebSocket with exponential backoff"""
        try:
            if self.websocket:
                await self.websocket.close()
        except:
            pass
        
        self.websocket = None
        
        while self.running and not self.websocket:
            logger.info(f"Attempting to reconnect in {self.reconnect_delay} seconds...")
            await asyncio.sleep(self.reconnect_delay)
            
            # Exponential backoff with jitter
            self.reconnect_delay = min(self.reconnect_delay * 2, self.max_reconnect_delay)
            
            if await self.connect():
                # Resubscribe to markets
                await self.subscribe_to_markets(list(self.subscribed_markets))
                break
    
    async def start(self, markets: List[str] = None):
        """
        Start the worker
        
        Args:
            markets: List of market symbols to subscribe to (e.g., ["BTC-USD", "ETH-USD"])
        """
        if self.running:
            logger.warning("dYdX v4 worker is already running")
            return
        
        self.running = True
        
        if not await self.connect():
            logger.error("Failed to connect to dYdX v4 WebSocket, worker not started")
            self.running = False
            return
        
        if markets:
            await self.subscribe_to_markets(markets)
        
        # Start listener in background
        asyncio.create_task(self.listen())
        logger.info("dYdX v4 worker started")
    
    async def stop(self):
        """Stop the worker"""
        self.running = False
        
        if self.websocket:
            try:
                await self.websocket.close()
            except:
                pass
            
        self.websocket = None
        self.subscribed_markets.clear()
        logger.info("dYdX v4 worker stopped")
