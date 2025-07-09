import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/crypto/dashboard-metrics`, {
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
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
