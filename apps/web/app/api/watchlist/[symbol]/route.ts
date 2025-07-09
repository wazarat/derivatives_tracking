import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

// API endpoint for the FastAPI backend
const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function PUT(
  req: NextRequest,
  { params }: { params: { symbol: string } }
) {
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
    const { symbol } = params;
    
    const response = await fetch(`${API_URL}/api/v1/watchlist/${symbol}`, {
      method: 'PUT',
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Watchlist update error:', error);
    return NextResponse.json(
      { error: 'Failed to update watchlist item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { userId, getToken } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = await getToken();
    const { symbol } = params;
    
    const response = await fetch(`${API_URL}/api/v1/watchlist/${symbol}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Watchlist delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete watchlist item' },
      { status: 500 }
    );
  }
}
