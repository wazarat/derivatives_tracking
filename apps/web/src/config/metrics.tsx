import React from "react";

// Interface for metric information
export interface MetricInfo {
  name: string;
  description: string;
  unit?: string;
}

// Catalog of metrics with descriptions
export const metricCatalog: Record<string, MetricInfo> = {
  // Common metrics
  symbol: {
    name: "Symbol",
    description: "Trading symbol for the instrument"
  },
  venue: {
    name: "Venue",
    description: "Exchange or platform where the instrument is traded"
  },
  price: {
    name: "Price",
    description: "Current market price of the instrument",
    unit: "USD"
  },
  change24h: {
    name: "24h Change",
    description: "Price change over the last 24 hours",
    unit: "%"
  },
  volume24h: {
    name: "24h Volume",
    description: "Trading volume over the last 24 hours",
    unit: "USD"
  },
  
  // Futures-specific metrics
  basisAbs: {
    name: "Basis",
    description: "Absolute difference between futures and spot price",
    unit: "USD"
  },
  basisApr: {
    name: "Basis APR",
    description: "Annualized return from the basis, calculated as (basis/spot price) * (365/days to expiry)",
    unit: "%"
  },
  termSlope: {
    name: "Term Slope",
    description: "Rate of change in basis across the term structure",
  },
  elr: {
    name: "ELR",
    description: "Excess Leverage Ratio - measures the degree of leverage in the market relative to historical norms",
  },
  
  // Perpetual-specific metrics
  fundingRate: {
    name: "Funding Rate",
    description: "Current funding rate for the perpetual contract",
    unit: "%"
  },
  fundingApr: {
    name: "Funding APR",
    description: "Annualized funding rate",
    unit: "%"
  },
  oiUsd: {
    name: "Open Interest",
    description: "Total value of open positions",
    unit: "USD"
  },
  skew: {
    name: "L/S Skew",
    description: "Ratio of long to short positions, values > 1 indicate more longs than shorts",
  },
  liqUsd: {
    name: "Liquidations",
    description: "Value of positions liquidated in the last 24 hours",
    unit: "USD"
  },
  
  // DEX-specific metrics
  tvl: {
    name: "TVL",
    description: "Total Value Locked in the protocol",
    unit: "USD"
  },
  utilization: {
    name: "Utilization",
    description: "Percentage of TVL being utilized for open positions",
    unit: "%"
  },
  fees24h: {
    name: "24h Fees",
    description: "Trading fees generated in the last 24 hours",
    unit: "USD"
  },
};

/**
 * Get metric information for a specific key
 * @param key The metric key to look up
 * @returns Metric information or undefined if not found
 */
export function getMetricInfo(key: string): MetricInfo | undefined {
  return metricCatalog[key];
}
