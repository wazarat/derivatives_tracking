'use client';

import React, { useState, useEffect } from 'react';
import { fetchMetrics, MarketMetrics } from '@/services/api';
import { formatNumber, formatPercent } from '@/lib/utils';

// Dashboard component for displaying metrics
export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MarketMetrics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to load metrics data
  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await fetchMetrics(20);
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  24h Change
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume (24h)
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Cap
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funding Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && metrics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Loading metrics...</span>
                    </div>
                  </td>
                </tr>
              ) : metrics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No metrics data available
                  </td>
                </tr>
              ) : (
                metrics.map((metric) => (
                  <tr key={metric.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{metric.symbol}</div>
                          <div className="text-sm text-gray-500">{metric.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      ${formatNumber(metric.price)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                      metric.percent_change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercent(metric.percent_change_24h)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      ${formatNumber(metric.volume_24h)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      ${formatNumber(metric.market_cap)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                      metric.funding_rate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercent(metric.funding_rate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Market Cap Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Market Cap</h3>
            <p className="text-3xl font-bold">
              ${formatNumber(metrics.reduce((sum, metric) => sum + metric.market_cap, 0))}
            </p>
          </div>

          {/* 24h Volume Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">24h Trading Volume</h3>
            <p className="text-3xl font-bold">
              ${formatNumber(metrics.reduce((sum, metric) => sum + metric.volume_24h, 0))}
            </p>
          </div>

          {/* Average Funding Rate Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Avg. Funding Rate</h3>
            <p className={`text-3xl font-bold ${
              metrics.reduce((sum, metric) => sum + metric.funding_rate, 0) / Math.max(1, metrics.length) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {formatPercent(metrics.reduce((sum, metric) => sum + metric.funding_rate, 0) / Math.max(1, metrics.length))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
