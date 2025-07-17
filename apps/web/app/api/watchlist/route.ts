import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('API route initialized with:');
console.log('- Supabase URL exists:', !!supabaseUrl);
console.log('- Supabase key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in API route');
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

// GET /api/watchlist - Get user's watchlist
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { data: watchlist, error } = await supabase
      .from('user_watchlist')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Supabase error fetching watchlist:', error);
      return NextResponse.json(
        { error: 'Failed to fetch watchlist data' },
        { status: 500 }
      );
    }
    
    // For each watchlist item, fetch the latest data from cex_derivatives_instruments
    const enrichedWatchlist = await Promise.all(
      watchlist.map(async (item) => {
        const { data: latestData, error: dataError } = await supabase
          .from('cex_derivatives_instruments')
          .select('*')
          .eq('exchange', item.exchange)
          .eq('symbol', item.symbol)
          .order('ts', { ascending: false })
          .limit(1)
          .single();
        
        if (dataError) {
          console.error('Error fetching derivative data:', dataError);
          return item;
        }
        
        return {
          ...item,
          price: latestData.price,
          change24h: 0, // Calculate this from historical data if available
          marketCap: 0, // This might not be available for derivatives
          volume24h: latestData.volume_24h
        };
      })
    );
    
    return NextResponse.json(enrichedWatchlist);
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist data' },
      { status: 500 }
    );
  }
}

// POST /api/watchlist - Add to watchlist
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { exchange, symbol, contract_type, starred = false } = body;
    
    if (!exchange || !symbol || !contract_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const item = {
      user_id: userId,
      exchange,
      symbol,
      contract_type,
      starred,
      added_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('user_watchlist')
      .insert([item])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding to watchlist:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to add to watchlist' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Watchlist create error:', error);
    return NextResponse.json(
      { error: 'Failed to create watchlist item' },
      { status: 500 }
    );
  }
}

// PUT /api/watchlist - Update watchlist item (toggle starred)
export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { id, starred } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('user_watchlist')
      .update({ starred })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating watchlist:', error);
      return NextResponse.json(
        { error: 'Failed to update watchlist item' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Watchlist update error:', error);
    return NextResponse.json(
      { error: 'Failed to update watchlist item' },
      { status: 500 }
    );
  }
}

// DELETE /api/watchlist?id=xxx - Remove from watchlist
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('user_watchlist')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error removing from watchlist:', error);
      return NextResponse.json(
        { error: 'Failed to remove from watchlist' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Watchlist delete error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    );
  }
}
