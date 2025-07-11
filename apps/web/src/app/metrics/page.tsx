'use client';

import React, { useState, useEffect } from 'react';
import { formatNumber, formatPercent } from '../../../lib/utils';

// Local stub for MarketMetrics interface
interface MarketMetrics {
  total_market_cap: number;
  total_volume_24h: number;
  btc_dominance: number;
  market_cap_change_24h: number;
  volume_change_24h: number;
}

// Local stub for fetchMetrics function
async function fetchMetrics(): Promise<MarketMetrics> {
  // Stub implementation
  return {
    total_market_cap: 2500000000000,
    total_volume_24h: 120000000000,
    btc_dominance: 45.5,
    market_cap_change_24h: 2.3,
    volume_change_24h: -1.5
  };
}

// Dashboard component for displaying metrics
export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MarketMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to load metrics data
  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await fetchMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load metrics data. Please try again later.');
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load metrics on component mount and set up refresh interval
  useEffect(() => {
    loadMetrics();

    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      loadMetrics();
    }, 30000); // 30 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Crypto Metrics Dashboard</h1>
        <div className="flex items-center">
          {lastUpdated && (
            <span className="text-sm text-gray-500 mr-4">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={loadMetrics}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Market Cap Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Market Cap</h3>
            <p className="text-3xl font-bold">
              ${metrics ? formatNumber(metrics.total_market_cap) : 'Loading...'}
            </p>
            <p className={`text-sm ${metrics && metrics.market_cap_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics ? formatPercent(metrics.market_cap_change_24h) : ''} (24h)
            </p>
          </div>

          {/* 24h Volume Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">24h Trading Volume</h3>
            <p className="text-3xl font-bold">
              ${metrics ? formatNumber(metrics.total_volume_24h) : 'Loading...'}
            </p>
            <p className={`text-sm ${metrics && metrics.volume_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics ? formatPercent(metrics.volume_change_24h) : ''} (24h)
            </p>
          </div>

          {/* BTC Dominance Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">BTC Dominance</h3>
            <p className="text-3xl font-bold">
              {metrics ? formatPercent(metrics.btc_dominance) : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
