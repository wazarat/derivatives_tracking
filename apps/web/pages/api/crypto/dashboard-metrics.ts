import type { NextApiRequest, NextApiResponse } from 'next';

interface MarketOverview {
  total_market_cap: number;
  total_volume_24h: number;
  btc_dominance: number;
  eth_dominance: number;
  active_cryptocurrencies: number;
  last_updated: string;
}

interface CryptoMetric {
  id: number;
  name: string;
  symbol: string;
  price: number;
  percent_change_24h: number;
  volume_24h: number;
  market_cap: number;
  last_updated: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock data for now - in production this would fetch from CoinMarketCap or similar
    const mockOverview: MarketOverview = {
      total_market_cap: 2500000000000,
      total_volume_24h: 120000000000,
      btc_dominance: 42.5,
      eth_dominance: 18.2,
      active_cryptocurrencies: 15000,
      last_updated: new Date().toISOString(),
    };

    const mockMetrics: CryptoMetric[] = [
      {
        id: 1,
        name: 'Bitcoin',
        symbol: 'BTC',
        price: 65000,
        percent_change_24h: 2.5,
        volume_24h: 25000000000,
        market_cap: 1200000000000,
        last_updated: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Ethereum',
        symbol: 'ETH',
        price: 3200,
        percent_change_24h: -1.2,
        volume_24h: 15000000000,
        market_cap: 380000000000,
        last_updated: new Date().toISOString(),
      },
      {
        id: 3,
        name: 'Solana',
        symbol: 'SOL',
        price: 180,
        percent_change_24h: 5.8,
        volume_24h: 3000000000,
        market_cap: 85000000000,
        last_updated: new Date().toISOString(),
      },
      {
        id: 4,
        name: 'Binance Coin',
        symbol: 'BNB',
        price: 420,
        percent_change_24h: 1.1,
        volume_24h: 2000000000,
        market_cap: 65000000000,
        last_updated: new Date().toISOString(),
      },
      {
        id: 5,
        name: 'Cardano',
        symbol: 'ADA',
        price: 0.85,
        percent_change_24h: -0.5,
        volume_24h: 800000000,
        market_cap: 30000000000,
        last_updated: new Date().toISOString(),
      },
    ];

    res.status(200).json({
      overview: mockOverview,
      metrics: mockMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[DASHBOARD-METRICS API] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch dashboard metrics'
    });
  }
}
