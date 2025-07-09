import logging
from typing import List, Dict, Any, Optional
from ..workers.coinmarketcap_worker import CoinMarketCapWorker

logger = logging.getLogger(__name__)

class CMCService:
    """
    Service for handling CoinMarketCap data operations
    """
    
    def __init__(self, cmc_worker: CoinMarketCapWorker):
        """
        Initialize the CMC service with a CoinMarketCap worker
        
        Args:
            cmc_worker: CoinMarketCapWorker instance
        """
        self.cmc_worker = cmc_worker
    
    async def get_markets(self, limit: int = 20, sector: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get market metrics for cryptocurrencies with real-time data
        
        Args:
            limit: Number of markets to return
            sector: Optional sector filter (e.g., 'cex', 'dex')
            
        Returns:
            List of market metrics
        """
        try:
            # Get market data from CMC worker
            market_data = await self.cmc_worker.get_cached_market_data()
            
            # Get derivatives exchanges data for funding rates
            derivatives_data = await self.cmc_worker.get_cached_derivatives_exchanges()
            
            # Create a mapping of symbol to funding rate
            funding_rates = {}
            for exchange in derivatives_data:
                for pair in exchange.get('market_pairs', []):
                    symbol = pair.get('base_symbol', '')
                    if symbol and 'funding_rate' in pair:
                        # Store the funding rate for this symbol
                        funding_rates[symbol] = pair.get('funding_rate', 0)
            
            # Process market data to include funding rates
            result = []
            for asset in market_data[:limit]:
                symbol = asset.get('symbol', '')
                
                # Create market metrics object
                market_metrics = {
                    'id': asset.get('id', ''),
                    'symbol': symbol,
                    'name': asset.get('name', ''),
                    'price': asset.get('quote', {}).get('USD', {}).get('price', 0),
                    'percent_change_24h': asset.get('quote', {}).get('USD', {}).get('percent_change_24h', 0),
                    'volume_24h': asset.get('quote', {}).get('USD', {}).get('volume_24h', 0),
                    'market_cap': asset.get('quote', {}).get('USD', {}).get('market_cap', 0),
                    'funding_rate': funding_rates.get(symbol, 0),
                    'last_updated': asset.get('last_updated', '')
                }
                
                # Apply sector filter if provided
                if sector:
                    tags = [tag.lower() for tag in asset.get('tags', [])]
                    if sector.lower() in tags:
                        result.append(market_metrics)
                else:
                    result.append(market_metrics)
            
            # If sector filter was applied, we might have fewer results than requested
            return result[:limit]
            
        except Exception as e:
            logger.error(f"Error getting market metrics: {e}")
            raise
    
    async def get_market_by_symbol(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Get market metrics for a specific cryptocurrency with real-time data
        
        Args:
            symbol: Cryptocurrency symbol (e.g., 'BTC')
            
        Returns:
            Market metrics for the specified cryptocurrency, or None if not found
        """
        try:
            # Get all markets and filter by symbol
            markets = await self.get_markets(limit=100)  # Get a larger set to ensure we find the symbol
            
            # Find the market with the matching symbol
            for market in markets:
                if market['symbol'].upper() == symbol.upper():
                    return market
            
            # Symbol not found
            return None
            
        except Exception as e:
            logger.error(f"Error getting market metrics for {symbol}: {e}")
            raise
    
    async def get_trending_markets(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get trending market metrics
        
        Args:
            limit: Number of trending markets to return
            
        Returns:
            List of trending market metrics
        """
        try:
            # Get trending assets from CMC worker
            trending_data = await self.cmc_worker.get_cached_trending_assets()
            
            # Get market data to enrich trending data
            markets = await self.get_markets(limit=100)
            
            # Create a mapping of symbol to market data
            market_map = {market['symbol']: market for market in markets}
            
            # Process trending data to include market metrics
            result = []
            for asset in trending_data[:limit]:
                symbol = asset.get('symbol', '')
                
                # If we have market data for this symbol, use it
                if symbol in market_map:
                    market = market_map[symbol]
                    
                    # Create trending market metrics object
                    trending_metrics = {
                        'id': asset.get('id', ''),
                        'symbol': symbol,
                        'name': asset.get('name', ''),
                        'price': market.get('price', 0),
                        'percent_change_24h': market.get('percent_change_24h', 0),
                        'volume_24h': market.get('volume_24h', 0),
                        'market_cap': market.get('market_cap', 0),
                        'funding_rate': market.get('funding_rate', 0),
                        'score': asset.get('score', 0),
                        'last_updated': market.get('last_updated', '')
                    }
                    
                    result.append(trending_metrics)
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting trending market metrics: {e}")
            raise
