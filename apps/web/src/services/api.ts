import axios from 'axios';

// API base URL from environment variable or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Market metrics interface
export interface MarketMetrics {
  id: string;
  symbol: string;
  name: string;
  price: number;
  percent_change_24h: number;
  volume_24h: number;
  market_cap: number;
  funding_rate: number;
  last_updated: string;
}

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
 * Fetch market metrics for top cryptocurrencies
 * @param limit Number of assets to fetch (default: 100)
 * @returns Promise with market metrics data
 */
export const fetchMetrics = async (limit: number = 100): Promise<MarketMetrics[]> => {
  try {
    const response = await api.get(`/crypto/markets?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};

/**
 * Fetch detailed information for a specific asset
 * @param id Asset ID or symbol
 * @returns Promise with asset details
 */
export const fetchAssetDetails = async (id: string): Promise<AssetDetails> => {
  try {
    const response = await api.get(`/crypto/assets/${id}`);
    return response.data;
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
    const response = await api.get(`/crypto/trending?limit=${limit}`);
    return response.data;
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
    const response = await api.get(`/crypto/history/${id}?days=${days}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching historical data for ${id}:`, error);
    throw error;
  }
};
