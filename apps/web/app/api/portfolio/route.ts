import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Portfolio API route initialized with:');
console.log('- Supabase URL exists:', !!supabaseUrl);
console.log('- Supabase key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in Portfolio API route');
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

// GET /api/portfolio - Get user's portfolio
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { data: portfolio, error } = await supabase
      .from('user_portfolio')
      .select('*')
      .eq('user_id', userId)
      .order('trade_created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error fetching portfolio:', error);
      return NextResponse.json(
        { error: 'Failed to fetch portfolio data' },
        { status: 500 }
      );
    }
    
    // For each portfolio item, fetch the latest price data from cex_derivatives_instruments
    const enrichedPortfolio = await Promise.all(
      portfolio.map(async (item) => {
        try {
          const { data: latestData, error: dataError } = await supabase
            .from('cex_derivatives_instruments')
            .select('price, vol24h, ts')
            .eq('exchange', item.exchange)
            .eq('symbol', item.symbol)
            .order('ts', { ascending: false })
            .limit(1)
            .single();
          
          if (dataError) {
            console.error('Error fetching derivative data for portfolio item:', dataError);
            return {
              ...item,
              current_price: null,
              unrealized_pnl: null,
              unrealized_pnl_percentage: null
            };
          }
          
          // Calculate unrealized P&L
          const currentPrice = latestData?.price || 0;
          const entryPrice = parseFloat(item.entry_price);
          const positionSize = parseFloat(item.position_size);
          const leverage = parseFloat(item.leverage) || 1;
          
          let unrealizedPnl = 0;
          if (currentPrice && entryPrice) {
            if (item.position_side === 'long') {
              unrealizedPnl = (currentPrice - entryPrice) * positionSize * leverage;
            } else {
              unrealizedPnl = (entryPrice - currentPrice) * positionSize * leverage;
            }
          }
          
          const unrealizedPnlPercentage = entryPrice ? (unrealizedPnl / (entryPrice * positionSize)) * 100 : 0;
          
          return {
            ...item,
            current_price: currentPrice,
            unrealized_pnl: unrealizedPnl,
            unrealized_pnl_percentage: unrealizedPnlPercentage,
            last_price_update: latestData?.ts || null
          };
        } catch (error) {
          console.error('Error processing portfolio item:', error);
          return {
            ...item,
            current_price: null,
            unrealized_pnl: null,
            unrealized_pnl_percentage: null
          };
        }
      })
    );
    
    return NextResponse.json(enrichedPortfolio);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}

// POST /api/portfolio - Add new trade to portfolio
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
    const { 
      exchange, 
      symbol, 
      contract_type = 'derivatives',
      position_side,
      position_size,
      entry_price,
      stop_loss,
      take_profit,
      leverage = 1.0,
      notes,
      trade_created_at
    } = body;
    
    // Validate required fields
    if (!exchange || !symbol || !position_side || !position_size || !entry_price) {
      return NextResponse.json(
        { error: 'Missing required fields: exchange, symbol, position_side, position_size, entry_price' },
        { status: 400 }
      );
    }
    
    // Validate position_side
    if (!['long', 'short'].includes(position_side)) {
      return NextResponse.json(
        { error: 'position_side must be either "long" or "short"' },
        { status: 400 }
      );
    }
    
    const portfolioItem = {
      user_id: userId,
      exchange,
      symbol,
      contract_type,
      position_side,
      position_size: parseFloat(position_size),
      entry_price: parseFloat(entry_price),
      stop_loss: stop_loss ? parseFloat(stop_loss) : null,
      take_profit: take_profit ? parseFloat(take_profit) : null,
      leverage: parseFloat(leverage),
      notes: notes || null,
      trade_created_at: trade_created_at || new Date().toISOString(),
      status: 'open'
    };
    
    const { data, error } = await supabase
      .from('user_portfolio')
      .insert([portfolioItem])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding to portfolio:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to add to portfolio' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Portfolio create error:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio item' },
      { status: 500 }
    );
  }
}

// PUT /api/portfolio - Update portfolio item
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
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Portfolio item ID is required' },
        { status: 400 }
      );
    }
    
    // Handle closing a position
    if (updateData.status === 'closed' && updateData.exit_price) {
      updateData.closed_at = new Date().toISOString();
      
      // Calculate realized P&L
      const { data: currentItem } = await supabase
        .from('user_portfolio')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (currentItem) {
        const entryPrice = parseFloat(currentItem.entry_price);
        const exitPrice = parseFloat(updateData.exit_price);
        const positionSize = parseFloat(currentItem.position_size);
        const leverage = parseFloat(currentItem.leverage) || 1;
        
        let realizedPnl = 0;
        if (currentItem.position_side === 'long') {
          realizedPnl = (exitPrice - entryPrice) * positionSize * leverage;
        } else {
          realizedPnl = (entryPrice - exitPrice) * positionSize * leverage;
        }
        
        updateData.realized_pnl = realizedPnl;
      }
    }
    
    const { data, error } = await supabase
      .from('user_portfolio')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating portfolio:', error);
      return NextResponse.json(
        { error: 'Failed to update portfolio item' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Portfolio update error:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio item' },
      { status: 500 }
    );
  }
}

// DELETE /api/portfolio?id=xxx - Remove from portfolio
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
        { error: 'Portfolio item ID is required' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('user_portfolio')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error removing from portfolio:', error);
      return NextResponse.json(
        { error: 'Failed to remove from portfolio' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Portfolio delete error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from portfolio' },
      { status: 500 }
    );
  }
}
