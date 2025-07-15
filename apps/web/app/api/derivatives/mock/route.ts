import { NextResponse } from 'next/server';

// Mock data for testing
const mockData = [
  {
    id: 1,
    ts: new Date().toISOString(),
    exchange: 'binance',
    symbol: 'BTCUSDT',
    contract_type: 'perpetual',
    oi_usd: 1000000000,
    funding_rate: 0.0001,
    volume_24h: 5000000000,
    index_price: 65000
  },
  {
    id: 2,
    ts: new Date().toISOString(),
    exchange: 'binance',
    symbol: 'ETHUSDT',
    contract_type: 'perpetual',
    oi_usd: 500000000,
    funding_rate: 0.0002,
    volume_24h: 2500000000,
    index_price: 3500
  },
  {
    id: 3,
    ts: new Date().toISOString(),
    exchange: 'okx',
    symbol: 'BTC-USDT-SWAP',
    contract_type: 'perpetual',
    oi_usd: 800000000,
    funding_rate: -0.0001,
    volume_24h: 4000000000,
    index_price: 65100
  },
  {
    id: 4,
    ts: new Date().toISOString(),
    exchange: 'bybit',
    symbol: 'BTCUSDT',
    contract_type: 'futures',
    oi_usd: 600000000,
    funding_rate: null,
    volume_24h: 3000000000,
    index_price: 64900
  }
];

export const dynamic = 'force-dynamic'; // No caching
export const revalidate = 0; // Disable cache completely

export async function GET() {
  console.log('GET request received at /api/derivatives/mock');
  
  try {
    console.log('Returning mock data:', mockData.length, 'records');
    
    return NextResponse.json(
      mockData, 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Surrogate-Control': 'no-store',
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error in mock API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Surrogate-Control': 'no-store',
        }
      }
    );
  }
}
