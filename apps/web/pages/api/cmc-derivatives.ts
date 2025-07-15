import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Define types
interface CMCDerivativesResponse {
  data: any[];
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
  };
}

interface ProcessedDerivative {
  id: number;
  ts: string;
  exchange: string;
  symbol: string;
  contract_type: 'perpetual' | 'futures';
  oi_usd: number;
  funding_rate: number | null;
  volume_24h: number;
  index_price: number;
}

// Helper function to process CMC data
function processCMCData(cmcData: any[]): ProcessedDerivative[] {
  if (!cmcData || !Array.isArray(cmcData)) {
    return [];
  }

  const timestamp = new Date().toISOString();
  let id = 1;

  return cmcData.map((item) => {
    // Extract exchange name
    const exchange = item.exchange?.slug || item.exchange?.name?.toLowerCase() || 'unknown';
    
    // Extract symbol
    const symbol = item.market_pair || item.symbol || 'unknown';
    
    // Determine contract type (may not be accurate from CMC data)
    const contractType = item.category === 'perpetual' ? 'perpetual' : 'futures';
    
    // Extract metrics
    const oiUsd = parseFloat(item.quote?.USD?.open_interest || '0');
    const fundingRate = item.funding_rate ? parseFloat(item.funding_rate) : null;
    const volume24h = parseFloat(item.quote?.USD?.volume_24h || '0');
    const indexPrice = parseFloat(item.quote?.USD?.price || '0');
    
    return {
      id: id++,
      ts: timestamp,
      exchange,
      symbol,
      contract_type: contractType,
      oi_usd: oiUsd,
      funding_rate: fundingRate,
      volume_24h: volume24h,
      index_price: indexPrice
    };
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set cache headers
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('Fetching derivatives data from CoinMarketCap API...');
    
    const apiKey = process.env.COINMARKETCAP_API_KEY;
    if (!apiKey) {
      console.error('COINMARKETCAP_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    // Define exchanges to fetch
    const exchanges = ['binance', 'okx', 'bybit'];
    let allDerivatives: ProcessedDerivative[] = [];
    
    // Fetch data for each exchange
    for (const exchange of exchanges) {
      try {
        console.log(`Fetching derivatives for ${exchange}...`);
        
        // Use the /v1/exchange/market-pairs/latest endpoint
        const response = await axios.get('https://pro-api.coinmarketcap.com/v1/exchange/market-pairs/latest', {
          headers: {
            'X-CMC_PRO_API_KEY': apiKey,
          },
          params: {
            slug: exchange,
            category: 'derivatives', // Get all derivatives
            limit: 100, // Limit to 100 pairs per exchange
          },
        });
        
        if (response.data && response.data.data && response.data.data.market_pairs) {
          const processedData = processCMCData(response.data.data.market_pairs);
          console.log(`Processed ${processedData.length} derivatives for ${exchange}`);
          allDerivatives = [...allDerivatives, ...processedData];
        }
      } catch (exchangeError) {
        console.error(`Error fetching data for ${exchange}:`, exchangeError);
        // Continue with other exchanges if one fails
      }
    }
    
    // Sort by open interest (descending)
    allDerivatives.sort((a, b) => b.oi_usd - a.oi_usd);
    
    // Limit to top 100 if needed
    const top100 = allDerivatives.slice(0, 100);
    
    console.log(`Returning ${top100.length} derivatives`);
    return res.status(200).json(top100);
  } catch (error) {
    console.error('Error fetching derivatives data:', error);
    return res.status(500).json({ error: 'Failed to fetch derivatives data' });
  }
}
