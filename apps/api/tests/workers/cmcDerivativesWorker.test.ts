import { jest } from '@jest/globals';
import { run } from '../../app/workers/cmcDerivativesWorker';

// Set environment variables for testing
process.env.COINMARKETCAP_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-supabase-url.com';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => ({
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          error: null
        }))
      }))
    }))
  };
});

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('CMC Derivatives Worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should fetch perpetual contracts including at least one BTC contract', async () => {
    // Mock the fetch response for perpetuals
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [
            {
              name: 'Binance',
              contracts: [
                {
                  symbol: 'BTCUSDT',
                  open_interest_usd: 1000000,
                  funding_rate: 0.0001,
                  volume_24h: 5000000,
                  index_price: 50000
                },
                {
                  symbol: 'ETHUSDT',
                  open_interest_usd: 500000,
                  funding_rate: 0.0002,
                  volume_24h: 2500000,
                  index_price: 3000
                }
              ]
            }
          ]
        })
      })
    );
    
    // Mock the fetch response for futures
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [
            {
              name: 'Binance',
              contracts: [
                {
                  symbol: 'BTCUSDT_230630',
                  open_interest_usd: 800000,
                  funding_rate: null,
                  volume_24h: 4000000,
                  index_price: 50000
                }
              ]
            }
          ]
        })
      })
    );
    
    // Run the worker
    const rowCount = await run();
    
    // Verify that fetch was called twice (once for perpetuals, once for futures)
    expect(global.fetch).toHaveBeenCalledTimes(2);
    
    // Verify that fetch was called with the correct URLs
    expect(global.fetch).toHaveBeenCalledWith(
      'https://pro-api.coinmarketcap.com/v1/derivatives/exchanges?category=perpetual&limit=1000',
      expect.anything()
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'https://pro-api.coinmarketcap.com/v1/derivatives/exchanges?category=futures&limit=1000',
      expect.anything()
    );
    
    // Verify that the worker returned the correct number of rows
    expect(rowCount).toBe(3);
    
    // Verify that Supabase insert was called with the correct data
    const supabaseClient = require('@supabase/supabase-js').createClient();
    const fromMethod = supabaseClient.from;
    const insertMethod = fromMethod().insert;
    
    expect(fromMethod).toHaveBeenCalledWith('derivatives_snapshots');
    expect(insertMethod).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          exchange: 'Binance',
          symbol: 'BTCUSDT',
          contract_type: 'perpetual'
        })
      ])
    );
  });
  
  it('should handle API errors gracefully', async () => {
    // Mock the fetch response to simulate an API error
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      })
    );
    
    // Expect the worker to throw an error
    await expect(run()).rejects.toThrow('CoinMarketCap API error: 429 Too Many Requests');
  });
});
