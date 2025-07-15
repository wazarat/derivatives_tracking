import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function GET() {
  try {
    // Check if API_URL is set to localhost in production
    if (process.env.NODE_ENV === 'production' && API_URL.includes('localhost')) {
      console.warn('Warning: Using localhost API URL in production environment');
      // Return mock data instead of failing
      return NextResponse.json({
        marketTrends: {
          btc: { price: 65000, change24h: 2.5 },
          eth: { price: 3200, change24h: 1.8 }
        },
        sectorPerformance: [],
        recentNews: []
      });
    }

    const response = await fetch(`${API_URL}/crypto/market-overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }, // Revalidate every 30 seconds
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching market overview:', error);
    
    // Return mock data on error in production to prevent client-side crashes
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        marketTrends: {
          btc: { price: 65000, change24h: 2.5 },
          eth: { price: 3200, change24h: 1.8 }
        },
        sectorPerformance: [],
        recentNews: []
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch market overview' },
      { status: 500 }
    );
  }
}
