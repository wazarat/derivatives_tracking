#!/usr/bin/env python3
"""
CanHav API Integration Test Script
This script tests all critical API endpoints to ensure they're functioning correctly.
"""

import os
import sys
import json
import time
import requests
from datetime import datetime
from typing import Dict, List, Any, Optional
from colorama import init, Fore, Style

# Initialize colorama
init()

# Configuration
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8000")
TIMEOUT = 10  # seconds

# Test results tracking
tests_run = 0
tests_passed = 0
tests_failed = 0


def print_header(message: str) -> None:
    """Print a formatted header message."""
    print(f"\n{Fore.CYAN}{'=' * 80}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{message.center(80)}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'=' * 80}{Style.RESET_ALL}\n")


def print_success(message: str) -> None:
    """Print a success message."""
    print(f"{Fore.GREEN}✓ {message}{Style.RESET_ALL}")


def print_failure(message: str) -> None:
    """Print a failure message."""
    print(f"{Fore.RED}✗ {message}{Style.RESET_ALL}")


def print_info(message: str) -> None:
    """Print an info message."""
    print(f"{Fore.YELLOW}ℹ {message}{Style.RESET_ALL}")


def test_endpoint(
    endpoint: str,
    method: str = "GET",
    expected_status: int = 200,
    payload: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None,
    validation_func: Optional[callable] = None,
    description: str = "",
) -> bool:
    """
    Test an API endpoint and validate the response.
    
    Args:
        endpoint: The API endpoint to test (without base URL)
        method: HTTP method to use
        expected_status: Expected HTTP status code
        payload: Request payload for POST/PUT requests
        headers: Request headers
        validation_func: Function to validate response content
        description: Description of the test
        
    Returns:
        bool: True if test passed, False otherwise
    """
    global tests_run, tests_passed, tests_failed
    
    tests_run += 1
    full_url = f"{API_BASE_URL}{endpoint}"
    
    print_info(f"Testing {method} {endpoint} - {description}")
    
    try:
        if method.upper() == "GET":
            response = requests.get(full_url, headers=headers, timeout=TIMEOUT)
        elif method.upper() == "POST":
            response = requests.post(full_url, json=payload, headers=headers, timeout=TIMEOUT)
        elif method.upper() == "PUT":
            response = requests.put(full_url, json=payload, headers=headers, timeout=TIMEOUT)
        elif method.upper() == "DELETE":
            response = requests.delete(full_url, headers=headers, timeout=TIMEOUT)
        else:
            print_failure(f"Unsupported HTTP method: {method}")
            tests_failed += 1
            return False
        
        # Check status code
        if response.status_code != expected_status:
            print_failure(
                f"Expected status {expected_status}, got {response.status_code}. "
                f"Response: {response.text[:100]}..."
            )
            tests_failed += 1
            return False
        
        # Run custom validation if provided
        if validation_func and not validation_func(response):
            print_failure("Response validation failed")
            tests_failed += 1
            return False
        
        print_success(f"Test passed: {description}")
        tests_passed += 1
        return True
    
    except Exception as e:
        print_failure(f"Exception occurred: {str(e)}")
        tests_failed += 1
        return False


def validate_health_response(response: requests.Response) -> bool:
    """Validate health endpoint response."""
    try:
        data = response.json()
        return data.get("status") == "ok"
    except:
        return False


def validate_markets_response(response: requests.Response) -> bool:
    """Validate markets endpoint response."""
    try:
        data = response.json()
        # Check if we have a non-empty list of markets
        return isinstance(data, list) and len(data) > 0
    except:
        return False


def validate_assets_response(response: requests.Response) -> bool:
    """Validate assets endpoint response."""
    try:
        data = response.json()
        # Check if we have a non-empty list of assets
        return isinstance(data, list) and len(data) > 0 and "id" in data[0]
    except:
        return False


def validate_metrics_response(response: requests.Response) -> bool:
    """Validate metrics endpoint response."""
    try:
        data = response.json()
        required_fields = ["price", "market_cap", "volume_24h"]
        return all(field in data for field in required_fields)
    except:
        return False


def validate_history_response(response: requests.Response) -> bool:
    """Validate history endpoint response."""
    try:
        data = response.json()
        # Check if we have prices array with timestamps and values
        return "prices" in data and len(data["prices"]) > 0
    except:
        return False


def validate_sectors_response(response: requests.Response) -> bool:
    """Validate sectors endpoint response."""
    try:
        data = response.json()
        # Check if we have a non-empty list of sectors
        return isinstance(data, list) and len(data) > 0
    except:
        return False


def validate_trending_response(response: requests.Response) -> bool:
    """Validate trending endpoint response."""
    try:
        data = response.json()
        # Check if we have a non-empty list of trending assets
        return isinstance(data, list) and len(data) > 0
    except:
        return False


def run_tests() -> None:
    """Run all API integration tests."""
    print_header("CanHav API Integration Tests")
    print(f"Testing API at: {API_BASE_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Test health endpoint
    test_endpoint(
        endpoint="/health",
        method="GET",
        expected_status=200,
        validation_func=validate_health_response,
        description="API health check"
    )
    
    # Test crypto endpoints
    test_endpoint(
        endpoint="/crypto/markets",
        method="GET",
        expected_status=200,
        validation_func=validate_markets_response,
        description="Crypto markets data"
    )
    
    test_endpoint(
        endpoint="/crypto/assets",
        method="GET",
        expected_status=200,
        validation_func=validate_assets_response,
        description="Crypto assets list"
    )
    
    # Test specific asset metrics (Bitcoin)
    test_endpoint(
        endpoint="/crypto/metrics/BTC",
        method="GET",
        expected_status=200,
        validation_func=validate_metrics_response,
        description="Bitcoin metrics"
    )
    
    # Test price history (Bitcoin)
    test_endpoint(
        endpoint="/crypto/history/BTC",
        method="GET",
        expected_status=200,
        validation_func=validate_history_response,
        description="Bitcoin price history"
    )
    
    # Test sectors
    test_endpoint(
        endpoint="/crypto/sectors",
        method="GET",
        expected_status=200,
        validation_func=validate_sectors_response,
        description="Crypto sectors"
    )
    
    # Test trending
    test_endpoint(
        endpoint="/crypto/trending",
        method="GET",
        expected_status=200,
        validation_func=validate_trending_response,
        description="Trending cryptocurrencies"
    )
    
    # Test error handling with invalid symbol
    test_endpoint(
        endpoint="/crypto/metrics/INVALID_SYMBOL",
        method="GET",
        expected_status=404,
        description="Invalid symbol error handling"
    )
    
    # Print summary
    print_header("Test Summary")
    print(f"Total tests: {tests_run}")
    print(f"{Fore.GREEN}Tests passed: {tests_passed}{Style.RESET_ALL}")
    print(f"{Fore.RED}Tests failed: {tests_failed}{Style.RESET_ALL}")
    
    if tests_failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
