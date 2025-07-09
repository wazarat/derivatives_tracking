import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

// API endpoint for the FastAPI backend
const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const { userId, getToken } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = await getToken();
    
    const response = await fetch(`${API_URL}/api/v1/watchlist`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }, // Revalidate every 30 seconds
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, getToken } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = await getToken();
    const body = await req.json();
    
    const response = await fetch(`${API_URL}/api/v1/watchlist`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Watchlist create error:', error);
    return NextResponse.json(
      { error: 'Failed to create watchlist item' },
      { status: 500 }
    );
  }
}
