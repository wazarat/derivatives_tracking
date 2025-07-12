import asyncio
import logging
import time
import random
from functools import wraps
from typing import Callable, TypeVar, Any, Dict, Optional, Union, cast

# Configure logging
logger = logging.getLogger(__name__)

# Type variables for generic function typing
T = TypeVar('T')
F = TypeVar('F', bound=Callable[..., Any])

class RateLimiter:
    """
    Rate limiter with exponential back-off for API requests.
    
    This class provides decorators to limit the rate of API calls and
    implement exponential back-off for retries on failure.
    """
    
    def __init__(self):
        # Store rate limits for different API endpoints/services
        self.rate_limits: Dict[str, Dict[str, Any]] = {}
        
        # Default configuration
        self.default_config = {
            "calls_per_minute": 60,  # Default: 60 calls per minute
            "max_retries": 5,        # Default: 5 retries
            "base_delay": 1.0,       # Default: 1 second initial delay
            "max_delay": 60.0,       # Default: 60 seconds maximum delay
            "jitter": 0.25,          # Default: 25% random jitter
        }
    
    def configure_limit(
        self, 
        service_name: str, 
        calls_per_minute: int = 60,
        max_retries: int = 5,
        base_delay: float = 1.0,
        max_delay: float = 60.0,
        jitter: float = 0.25
    ) -> None:
        """
        Configure rate limits for a specific service.
        
        Args:
            service_name: Unique identifier for the service/API
            calls_per_minute: Maximum number of calls allowed per minute
            max_retries: Maximum number of retry attempts
            base_delay: Initial delay in seconds for exponential back-off
            max_delay: Maximum delay in seconds
            jitter: Random jitter factor (0.0 to 1.0) to add to delays
        """
        self.rate_limits[service_name] = {
            "calls_per_minute": calls_per_minute,
            "interval": 60.0 / calls_per_minute,  # Time between requests in seconds
            "last_call_time": 0.0,
            "max_retries": max_retries,
            "base_delay": base_delay,
            "max_delay": max_delay,
            "jitter": jitter,
        }
        logger.info(f"Configured rate limit for {service_name}: {calls_per_minute} calls/minute")
    
    def get_config(self, service_name: str) -> Dict[str, Any]:
        """Get rate limit configuration for a service, or create default if not exists"""
        if service_name not in self.rate_limits:
            self.configure_limit(service_name)
        return self.rate_limits[service_name]
    
    async def wait_for_rate_limit(self, service_name: str) -> None:
        """Wait until it's safe to make another request according to rate limits"""
        config = self.get_config(service_name)
        
        # Calculate time since last call
        now = time.time()
        time_since_last_call = now - config["last_call_time"]
        
        # If we need to wait to respect rate limit
        if time_since_last_call < config["interval"]:
            wait_time = config["interval"] - time_since_last_call
            logger.debug(f"Rate limiting {service_name}: waiting {wait_time:.2f}s")
            await asyncio.sleep(wait_time)
        
        # Update last call time
        self.rate_limits[service_name]["last_call_time"] = time.time()
    
    def calculate_retry_delay(self, service_name: str, attempt: int) -> float:
        """Calculate delay for retry attempt using exponential back-off with jitter"""
        config = self.get_config(service_name)
        
        # Calculate exponential back-off
        delay = min(
            config["max_delay"],
            config["base_delay"] * (2 ** attempt)
        )
        
        # Add random jitter
        jitter_amount = delay * config["jitter"]
        delay = delay + random.uniform(-jitter_amount, jitter_amount)
        
        # Ensure delay is positive
        return max(0.1, delay)
    
    def rate_limited(self, service_name: str) -> Callable[[F], F]:
        """
        Decorator to apply rate limiting to a function.
        
        Args:
            service_name: Identifier for the service/API being called
            
        Returns:
            Decorated function with rate limiting applied
        """
        def decorator(func: F) -> F:
            @wraps(func)
            async def wrapper(*args: Any, **kwargs: Any) -> Any:
                await self.wait_for_rate_limit(service_name)
                return await func(*args, **kwargs)
            return cast(F, wrapper)
        return decorator
    
    def with_retry(
        self, 
        service_name: str,
        retry_on_exceptions: tuple = (Exception,),
        retry_on_status_codes: Optional[set] = None
    ) -> Callable[[F], F]:
        """
        Decorator to apply rate limiting and exponential back-off retries.
        
        Args:
            service_name: Identifier for the service/API being called
            retry_on_exceptions: Tuple of exception types that should trigger a retry
            retry_on_status_codes: Set of HTTP status codes that should trigger a retry
            
        Returns:
            Decorated function with rate limiting and retries
        """
        if retry_on_status_codes is None:
            retry_on_status_codes = {429, 500, 502, 503, 504}
            
        def decorator(func: F) -> F:
            @wraps(func)
            async def wrapper(*args: Any, **kwargs: Any) -> Any:
                config = self.get_config(service_name)
                max_retries = config["max_retries"]
                
                for attempt in range(max_retries + 1):
                    try:
                        # Wait for rate limit before making the call
                        await self.wait_for_rate_limit(service_name)
                        
                        # Make the API call
                        response = await func(*args, **kwargs)
                        
                        # Check for status code that requires retry
                        status_code = getattr(response, 'status_code', None)
                        if status_code is not None and status_code in retry_on_status_codes:
                            if attempt < max_retries:
                                delay = self.calculate_retry_delay(service_name, attempt)
                                logger.warning(
                                    f"{service_name} returned status {status_code}, "
                                    f"retrying in {delay:.2f}s (attempt {attempt + 1}/{max_retries})"
                                )
                                await asyncio.sleep(delay)
                                continue
                        
                        # Success or non-retriable status code
                        return response
                        
                    except retry_on_exceptions as e:
                        if attempt < max_retries:
                            delay = self.calculate_retry_delay(service_name, attempt)
                            logger.warning(
                                f"{service_name} request failed with {type(e).__name__}: {str(e)}, "
                                f"retrying in {delay:.2f}s (attempt {attempt + 1}/{max_retries})"
                            )
                            await asyncio.sleep(delay)
                        else:
                            logger.error(
                                f"{service_name} request failed after {max_retries} retries: {str(e)}"
                            )
                            raise
                
                # This should never be reached due to the raise in the except block
                raise RuntimeError(f"Unexpected end of retry loop for {service_name}")
                
            return cast(F, wrapper)
        return decorator

# Create a singleton instance
rate_limiter = RateLimiter()

# Pre-configure common API services
rate_limiter.configure_limit("coinmarketcap", calls_per_minute=30)  # CoinMarketCap Basic tier: 30/min
rate_limiter.configure_limit("dydx", calls_per_minute=100)      # dYdX: 100/min
rate_limiter.configure_limit("hyperliquid", calls_per_minute=60)  # Hyperliquid: estimated
rate_limiter.configure_limit("coinbase", calls_per_minute=30)   # Coinbase: conservative limit
