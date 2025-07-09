import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, getToken } = auth();
    
    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get auth token
    const token = await getToken();
    
    // Get request body
    const body = await req.json();
    
    // Forward request to FastAPI backend
    const response = await fetch(`${process.env.API_URL}/api/v1/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to get response from chatbot' },
        { status: response.status }
      );
    }
    
    // Return response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId, getToken } = auth();
    
    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get auth token
    const token = await getToken();
    
    // Forward request to FastAPI backend
    const response = await fetch(`${process.env.API_URL}/api/v1/chatbot/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to get chat history' },
        { status: response.status }
      );
    }
    
    // Return response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Chatbot history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
