// Stub for API service
import axios from 'axios';

export interface MarketMetrics {
  total_market_cap: number;
  total_volume_24h: number;
  btc_dominance: number;
  market_cap_change_24h: number;
  volume_change_24h: number;
}

export async function fetchMetrics(): Promise<MarketMetrics> {
  // Stub implementation
  return {
    total_market_cap: 2500000000000,
    total_volume_24h: 120000000000,
    btc_dominance: 45.5,
    market_cap_change_24h: 2.3,
    volume_change_24h: -1.5
  };
}

// API base URL from environment variable or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Asset details interface
export interface AssetDetails {
  id: string;
  symbol: string;
  name: string;
  price: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  volume_24h: number;
  market_cap: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  funding_rate: number;
  next_funding_time: string | null;
  description: string | null;
  tags: string[];
  last_updated: string;
}

// Trending asset interface
export interface TrendingAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  percent_change_24h: number;
  volume_24h: number;
  market_cap: number;
  score: number;
}

/**
 * Fetch detailed information for a specific asset
 * @param id Asset ID or symbol
 * @returns Promise with asset details
 */
export const fetchAssetDetails = async (id: string): Promise<AssetDetails> => {
  try {
    // Stub implementation
    return {
      id: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      price: 65000,
      percent_change_1h: 0.5,
      percent_change_24h: 2.3,
      percent_change_7d: 5.1,
      volume_24h: 45000000000,
      market_cap: 1200000000000,
      circulating_supply: 19000000,
      total_supply: 21000000,
      max_supply: 21000000,
      funding_rate: 0.01,
      next_funding_time: "2023-12-31T00:00:00Z",
      description: "Bitcoin is a decentralized digital currency.",
      tags: ["pow", "store-of-value", "cryptocurrency"],
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching asset details for ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch trending assets
 * @param limit Number of trending assets to fetch (default: 10)
 * @returns Promise with trending assets data
 */
export const fetchTrendingAssets = async (limit: number = 10): Promise<TrendingAsset[]> => {
  try {
    // Stub implementation
    return [
      {
        id: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        price: 65000,
        percent_change_24h: 2.3,
        volume_24h: 45000000000,
        market_cap: 1200000000000,
        score: 0.95
      },
      {
        id: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        price: 3500,
        percent_change_24h: 1.8,
        volume_24h: 25000000000,
        market_cap: 420000000000,
        score: 0.92
      }
    ];
  } catch (error) {
    console.error('Error fetching trending assets:', error);
    throw error;
  }
};

/**
 * Fetch historical price data for an asset
 * @param id Asset ID or symbol
 * @param days Number of days of data to fetch (default: 7)
 * @returns Promise with historical price data
 */
export const fetchHistoricalData = async (id: string, days: number = 7): Promise<any> => {
  try {
    // Stub implementation
    return {
      prices: Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return [date.getTime(), 60000 + Math.random() * 10000];
      }),
      market_caps: Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return [date.getTime(), 1200000000000 + Math.random() * 50000000000];
      }),
      total_volumes: Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return [date.getTime(), 40000000000 + Math.random() * 10000000000];
      })
    };
  } catch (error) {
    console.error(`Error fetching historical data for ${id}:`, error);
    throw error;
  }
};
