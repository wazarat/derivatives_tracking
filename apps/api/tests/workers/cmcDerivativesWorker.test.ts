import { jest } from '@jest/globals';
import { cmcDerivativesWorker } from '../../app/workers/cmcDerivativesWorker';

// Set environment variables for testing
process.env.COINMARKETCAP_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-supabase-url.com';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Mock command line arguments
// This allows us to test different sector scenarios
jest.mock('process', () => ({
  env: process.env,
  argv: ['node', 'cmcDerivativesWorker.ts'] // Default with no sector argument
}));

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        error: null,
        select: jest.fn(() => ({
          data: [{ count: 3 }],
          error: null
        }))
      }))
    }))
  }))
}));

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('CMC Derivatives Worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should fetch market pairs for multiple exchanges and categories', async () => {
    // Mock axios for API key test
    axios.get.mockImplementationOnce(() => 
      Promise.resolve({
        status: 200,
        data: { data: [{ id: 1, name: 'Bitcoin' }] }
      })
    );
    
    // Mock axios for binance perpetual
    axios.get.mockImplementationOnce(() => 
      Promise.resolve({
        status: 200,
        data: {
          data: {
            id: 270,
            name: 'Binance',
            slug: 'binance',
            marketPairs: [
              {
                marketId: 1000,
                marketPair: 'BTC/USDT',
                baseSymbol: 'BTC',
                quoteSymbol: 'USDT',
                openInterestUSD: 1000000,
                fundingRate: 0.0001,
                volumeUsd24h: 5000000,
                price: 50000
              },
              {
                marketId: 1001,
                marketPair: 'ETH/USDT',
                baseSymbol: 'ETH',
                quoteSymbol: 'USDT',
                openInterestUSD: 500000,
                fundingRate: 0.0002,
                volumeUsd24h: 2500000,
                price: 3000
              }
            ],
            marketPairCount: 2
          }
        }
      })
    );
    
    // Mock axios for okx perpetual
    axios.get.mockImplementationOnce(() => 
      Promise.resolve({
        status: 200,
        data: {
          data: {
            id: 311,
            name: 'OKX',
            slug: 'okx',
            marketPairs: [
              {
                marketId: 2000,
                marketPair: 'BTC/USDT',
                baseSymbol: 'BTC',
                quoteSymbol: 'USDT',
                openInterestUSD: 800000,
                fundingRate: 0.0001,
                volumeUsd24h: 4000000,
                price: 50100
              }
            ],
            marketPairCount: 1
          }
        }
      })
    );
    
    // Mock axios for bybit perpetual
    axios.get.mockImplementationOnce(() => 
      Promise.resolve({
        status: 200,
        data: {
          data: {
            id: 521,
            name: 'Bybit',
            slug: 'bybit',
            marketPairs: [
              {
                marketId: 3000,
                marketPair: 'BTC/USDT',
                baseSymbol: 'BTC',
                quoteSymbol: 'USDT',
                openInterestUSD: 700000,
                fundingRate: 0.0001,
                volumeUsd24h: 3500000,
                price: 50200
              }
            ],
            marketPairCount: 1
          }
        }
      })
    );
    
    // Mock axios for binance futures
    axios.get.mockImplementationOnce(() => 
      Promise.resolve({
        status: 200,
        data: {
          data: {
            id: 270,
            name: 'Binance',
            slug: 'binance',
            marketPairs: [
              {
                marketId: 4000,
                marketPair: 'BTC/USDT_230630',
                baseSymbol: 'BTC',
                quoteSymbol: 'USDT',
                openInterestUSD: 600000,
                fundingRate: null,
                volumeUsd24h: 3000000,
                price: 50000
              }
            ],
            marketPairCount: 1
          }
        }
      })
    );
    
    // Mock axios for okx futures - empty response
    axios.get.mockImplementationOnce(() => 
      Promise.resolve({
        status: 200,
        data: {
          data: {
            id: 311,
            name: 'OKX',
            slug: 'okx',
            marketPairs: [],
            marketPairCount: 0
          }
        }
      })
    );
    
    // Mock axios for bybit futures
    axios.get.mockImplementationOnce(() => 
      Promise.resolve({
        status: 200,
        data: {
          data: {
            id: 521,
            name: 'Bybit',
            slug: 'bybit',
            marketPairs: [
              {
                marketId: 5000,
                marketPair: 'BTC/USDT_230630',
                baseSymbol: 'BTC',
                quoteSymbol: 'USDT',
                openInterestUSD: 500000,
                fundingRate: null,
                volumeUsd24h: 2500000,
                price: 50100
              }
            ],
            marketPairCount: 1
          }
        }
      })
    );
    
    // Run the worker
    const rowCount = await cmcDerivativesWorker();
    
    // Verify that axios was called the correct number of times (1 test + 6 API calls)
    expect(axios.get).toHaveBeenCalledTimes(7);
    
    // Verify that the first call was to test the API key
    expect(axios.get.mock.calls[0][0]).toContain('/v1/cryptocurrency/listings/latest');
    
    // Verify that the worker returned the correct number of rows
    expect(rowCount).toBe(5);
    
    // Verify that Supabase insert was called with the correct data
    const supabaseClient = require('@supabase/supabase-js').createClient();
    const fromMethod = supabaseClient.from;
    const insertMethod = fromMethod().insert;
    
    expect(fromMethod).toHaveBeenCalledWith('derivatives_snapshots');
    expect(insertMethod).toHaveBeenCalledTimes(3); // Once for each exchange with data
  });
  
  it('should handle API errors gracefully', async () => {
    // Mock axios for API key test
    axios.get.mockImplementationOnce(() => 
      Promise.resolve({
        status: 200,
        data: { data: [{ id: 1, name: 'Bitcoin' }] }
      })
    );
    
    // Mock axios for binance perpetual with error
    axios.get.mockImplementationOnce(() => 
      Promise.reject({
        isAxiosError: true,
        message: 'Request failed with status code 429',
        response: {
          status: 429,
          data: { status: { error_message: 'Too Many Requests' } }
        }
      })
    );
    
    // Run the worker - it should continue despite the error
    const rowCount = await cmcDerivativesWorker();
    
    // Should have 0 rows since all requests failed
    expect(rowCount).toBe(0);
  });
  
  it('should handle invalid API key', async () => {
    // Mock axios for API key test with error
    axios.get.mockImplementationOnce(() => 
      Promise.reject({
        isAxiosError: true,
        message: 'Request failed with status code 401',
        response: {
          status: 401,
          data: { status: { error_message: 'Invalid API key' } }
        }
      })
    );
    
    // Expect the worker to throw an error for invalid API key
    await expect(cmcDerivativesWorker()).rejects.toThrow('CoinMarketCap API key is invalid or expired');
  });
});
