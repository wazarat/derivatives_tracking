// Metric information catalog for tooltips and documentation
export interface MetricInfo {
  key: string;
  name: string;
  description: string;
  category: 'basis' | 'funding' | 'liquidity' | 'onchain' | 'general';
}

export const metricCatalog: MetricInfo[] = [
  // General metrics
  {
    key: 'price',
    name: 'Price',
    description: 'Current market price of the instrument in USD.',
    category: 'general',
  },
  {
    key: 'change24h',
    name: '24h Change',
    description: 'Percentage change in price over the last 24 hours.',
    category: 'general',
  },
  {
    key: 'volume24h',
    name: '24h Volume',
    description: 'Trading volume in USD over the last 24 hours.',
    category: 'general',
  },
  
  // Basis metrics (for futures)
  {
    key: 'basisAbs',
    name: 'Basis',
    description: 'Absolute difference between futures price and spot price (Futures - Spot).',
    category: 'basis',
  },
  {
    key: 'basisApr',
    name: 'Basis APR',
    description: 'Annualized percentage return from buying spot and selling futures, calculated as (Basis / Spot Price) * (365 / Days to Expiry) * 100.',
    category: 'basis',
  },
  {
    key: 'termSlope',
    name: 'Term Slope',
    description: 'Measure of the futures curve steepness across different expiries, calculated as the slope of the best-fit line through all available futures prices.',
    category: 'basis',
  },
  {
    key: 'elr',
    name: 'Excess Leverage Ratio (ELR)',
    description: 'Ratio of open interest to market depth, indicating potential price impact of liquidations. Higher values suggest higher liquidation risk.',
    category: 'liquidity',
  },
  
  // Funding metrics (for perpetuals)
  {
    key: 'fundingRate',
    name: 'Funding Rate',
    description: 'Current funding rate paid between long and short positions. Positive means longs pay shorts; negative means shorts pay longs.',
    category: 'funding',
  },
  {
    key: 'fundingApr',
    name: 'Funding APR',
    description: 'Annualized funding rate, calculated as the current funding rate multiplied by the number of funding periods in a year.',
    category: 'funding',
  },
  {
    key: 'oiUsd',
    name: 'Open Interest (USD)',
    description: 'Total value of all open positions in USD, indicating market participation and potential liquidation volume.',
    category: 'liquidity',
  },
  {
    key: 'skew',
    name: 'Long/Short Skew',
    description: 'Ratio of long to short positions. Values above 1 indicate more longs than shorts; below 1 indicates more shorts than longs.',
    category: 'funding',
  },
  {
    key: 'liqUsd',
    name: 'Liquidation Value (USD)',
    description: 'Estimated value of positions that would be liquidated if price moves 5% against the majority position.',
    category: 'liquidity',
  },
  
  // Onchain metrics (for DEX perps)
  {
    key: 'tvl',
    name: 'Total Value Locked (TVL)',
    description: 'Total value of assets locked in the protocol\'s liquidity pools, in USD.',
    category: 'onchain',
  },
  {
    key: 'utilization',
    name: 'Utilization',
    description: 'Percentage of available liquidity being used for open positions, calculated as Open Interest / TVL.',
    category: 'onchain',
  },
  {
    key: 'fees24h',
    name: '24h Fees',
    description: 'Total trading fees generated by the protocol in the last 24 hours, in USD.',
    category: 'onchain',
  },
];

// Helper function to get metric info by key
export function getMetricInfo(key: string): MetricInfo | undefined {
  return metricCatalog.find(metric => metric.key === key);
}

// Get metrics by category
export function getMetricsByCategory(category: MetricInfo['category']): MetricInfo[] {
  return metricCatalog.filter(metric => metric.category === category);
}
