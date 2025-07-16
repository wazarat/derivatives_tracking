"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmcDerivativesWorker = cmcDerivativesWorker;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
const path_1 = __importDefault(require("path"));
const rest_worker_1 = require("./rest_worker");
// Load environment variables from .env file
console.log('Current working directory:', process.cwd());
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
// Debug environment variables
console.log('Environment variables loaded:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'defined' : 'undefined');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'defined' : 'undefined');
console.log('COINMARKETCAP_API_KEY:', process.env.COINMARKETCAP_API_KEY ? 'defined' : 'undefined');
// Check for dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
    console.log('\n🔍 Running in DRY RUN mode - will fetch data but NOT insert into Supabase');
}
// Check for debug mode
const isDebugMode = process.argv.includes('--debug');
if (isDebugMode) {
    console.log('\n🐛 Running in DEBUG mode - will show additional API information');
}
// Check required environment variables
const missingVars = [];
if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !isDryRun)
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !isDryRun)
    missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
if (!process.env.COINMARKETCAP_API_KEY)
    missingVars.push('COINMARKETCAP_API_KEY');
if (missingVars.length > 0) {
    console.error('\n❌ ERROR: Missing required environment variables:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('\nPlease set these variables in your .env file or export them in your shell:');
    console.error(`
Example:
  export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  export COINMARKETCAP_API_KEY=your_api_key
  
Or run with:
  NEXT_PUBLIC_SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key COINMARKETCAP_API_KEY=your_key npx ts-node app/workers/cmcDerivativesWorker.ts

For testing without Supabase, you can use --dry-run:
  COINMARKETCAP_API_KEY=your_key npx ts-node app/workers/cmcDerivativesWorker.ts --dry-run --sector=futures
`);
    process.exit(1);
}
// Initialize Supabase client (only if not in dry run mode)
const supabase = !isDryRun ? (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;
// CoinMarketCap API configuration
const CMC_API_BASE = 'https://pro-api.coinmarketcap.com';
const apiKey = process.env.COINMARKETCAP_API_KEY;
const headers = { 'X-CMC_PRO_API_KEY': apiKey };
// Exchange slugs to fetch data for
const EXCHANGE_SLUGS = ['binance', 'okx', 'bybit'];
// Exchange IDs to try if slugs don't work
const EXCHANGE_IDS = {
    'binance': '270', // Example ID, may need to be updated
    'okx': '294', // Example ID, may need to be updated
    'bybit': '521' // Example ID, may need to be updated
};
// Command line arguments
let cmdSectorArg;
for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--dry-run' || arg === '--debug' || arg === '--use-id')
        continue; // Skip these flags
    if (arg.startsWith('--sector=')) {
        cmdSectorArg = arg.split('=')[1];
        if (!['derivatives'].includes(cmdSectorArg)) {
            console.error('Invalid sector argument. Must be "derivatives".');
            process.exit(1);
        }
    }
    else if (['derivatives'].includes(arg)) {
        cmdSectorArg = arg;
    }
    else if (!arg.startsWith('--')) {
        console.error(`Invalid argument: ${arg}. Use either "derivatives", or "--sector=derivatives".`);
        process.exit(1);
    }
}
/**
 * Fetch available exchanges from CoinMarketCap
 */
async function fetchExchangeMap() {
    const endpoint = `/v1/exchange/map`;
    const url = `${CMC_API_BASE}${endpoint}?limit=500`;
    console.log('Fetching exchange map from CoinMarketCap...');
    console.log(`Request URL: ${url}`);
    try {
        const response = await axios_1.default.get(url, { headers });
        if (response.status !== 200) {
            throw new Error(`CoinMarketCap API error: ${response.status} ${response.statusText}`);
        }
        const data = response.data;
        if (!data || !data.data) {
            console.log('No exchange map data found');
            return [];
        }
        console.log(`Successfully fetched ${data.data.length} exchanges`);
        // Find our target exchanges
        const targetExchanges = data.data.filter((exchange) => EXCHANGE_SLUGS.includes(exchange.slug.toLowerCase()));
        console.log('Target exchanges found:');
        targetExchanges.forEach((exchange) => {
            console.log(`  ${exchange.name} (ID: ${exchange.id}, Slug: ${exchange.slug})`);
        });
        return targetExchanges;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error('Error fetching exchange map:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', JSON.stringify(error.response.data, null, 2));
            }
            console.error('Full request URL:', url);
        }
        else {
            console.error('Error fetching exchange map:', error);
        }
        throw error;
    }
}
/**
 * Fetch market pairs data for a specific exchange and category
 */
async function fetchExchangeMarketPairs(exchangeSlug, exchangeId, category = 'derivatives', startIndex = 1, limit = 500) {
    const endpoint = `/v1/exchange/market-pairs/latest`;
    // Try with both slug and ID
    const useId = process.argv.includes('--use-id');
    const url = useId
        ? `${CMC_API_BASE}${endpoint}?id=${exchangeId}&category=${category}&start=${startIndex}&limit=${limit}`
        : `${CMC_API_BASE}${endpoint}?slug=${exchangeSlug}&category=${category}&start=${startIndex}&limit=${limit}`;
    console.log(`Fetching ${category} data for ${exchangeSlug} from CoinMarketCap...`);
    console.log(`Request URL: ${url}`);
    try {
        const response = await axios_1.default.get(url, { headers });
        if (response.status !== 200) {
            throw new Error(`CoinMarketCap API error: ${response.status} ${response.statusText}`);
        }
        const data = response.data;
        if (isDebugMode) {
            console.log('Full API response:');
            console.log(JSON.stringify(data, null, 2));
        }
        if (!data || !data.data || !data.data.market_pairs) {
            console.log(`No market pairs found for ${exchangeSlug} ${category}`);
            return { data: { market_pairs: [] } };
        }
        console.log(`Successfully fetched ${data.data.market_pairs.length} ${category} pairs for ${exchangeSlug}`);
        // Check if there are more results to paginate
        const total = data.data.market_pair_count || 0;
        const currentCount = data.data.market_pairs.length;
        const nextStartIndex = startIndex + currentCount;
        if (nextStartIndex <= total && currentCount === limit) {
            console.log(`Fetching next page of results for ${exchangeSlug} ${category} (${nextStartIndex}/${total})`);
            const nextPageResults = await fetchExchangeMarketPairs(exchangeSlug, exchangeId, category, nextStartIndex, limit);
            // Combine the current page with next page results
            return {
                data: {
                    market_pairs: [...data.data.market_pairs, ...(nextPageResults.data?.market_pairs || [])]
                }
            };
        }
        return data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error(`Error fetching ${category} data for ${exchangeSlug}:`, error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', JSON.stringify(error.response.data, null, 2));
            }
            console.error('Full request URL:', url);
        }
        else {
            console.error(`Error fetching ${category} data for ${exchangeSlug}:`, error);
        }
        throw error;
    }
}
/**
 * Process market pairs data into the format required for the derivatives_snapshots table
 */
function processMarketPairsData(marketPairs, exchangeSlug, category) {
    return marketPairs.map(pair => {
        // Extract base and quote symbols
        const [baseSymbol, quoteSymbol] = (pair.market_pair || '').split('/');
        // For debugging
        if (isDebugMode) {
            console.log(`Processing ${pair.market_pair}: `, {
                exchange: exchangeSlug,
                category,
                oi_usd: pair.quote?.USD?.open_interest_usd || pair.quote?.exchange_reported?.open_interest_usd || 0,
                volume_24h: pair.quote?.USD?.volume_24h || pair.quote?.exchange_reported?.volume_24h_quote || 0,
            });
        }
        return {
            exchange: exchangeSlug,
            symbol: pair.market_pair || 'Unknown',
            contract_type: 'derivatives', // Use a single contract type for all
            oi_usd: pair.quote?.USD?.open_interest_usd || pair.quote?.exchange_reported?.open_interest_usd || 0,
            funding_rate: pair.funding_rate || 0,
            volume_24h: pair.quote?.USD?.volume_24h || pair.quote?.exchange_reported?.volume_24h_quote || 0,
            index_price: pair.quote?.USD?.price || pair.quote?.exchange_reported?.price || 0,
            ts: new Date(),
            symbol_base: baseSymbol,
            symbol_quote: quoteSymbol,
            cmc_market_id: pair.market_id || null
        };
    });
}
/**
 * Main worker function to fetch and store derivatives data
 */
async function cmcDerivativesWorker(sector = 'derivatives') {
    console.log(`Starting CMC derivatives worker for sector: ${sector}`);
    // Check for required environment variables
    if (!isDryRun) {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            console.error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
            process.exit(1);
        }
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
            process.exit(1);
        }
    }
    // Initialize Supabase client if not in dry run mode
    let supabase = null;
    if (!isDryRun) {
        supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    // Fetch exchange map if in debug mode
    if (isDebugMode) {
        await fetchExchangeMap();
    }
    // Define exchanges to fetch data for
    const exchanges = [
        { slug: 'binance', name: 'Binance' },
        { slug: 'okx', name: 'OKX' },
        { slug: 'bybit', name: 'Bybit' }
    ];
    let totalRowsInserted = 0;
    // Process each exchange
    for (const exchange of exchanges) {
        try {
            // Fetch market pairs for the exchange
            const marketPairsData = await fetchExchangeMarketPairs(exchange.slug, EXCHANGE_IDS[exchange.slug], sector);
            if (!marketPairsData || !marketPairsData.data || !marketPairsData.data.market_pairs) {
                console.log(`No ${sector} data found for ${exchange.slug}`);
                continue;
            }
            const marketPairs = marketPairsData.data.market_pairs;
            console.log(`Found ${marketPairs.length} ${sector} pairs for ${exchange.slug}`);
            // Log first 3 market pairs for debugging
            if (marketPairs.length > 0) {
                console.log(`First 3 ${sector} pairs for ${exchange.slug}:`);
                marketPairs.slice(0, 3).forEach((pair) => {
                    console.log(`- ${pair.market_pair} (${pair.category})`);
                });
            }
            // Process market pairs data
            const processedData = processMarketPairsData(marketPairs, exchange.slug, sector);
            // Deduplicate data based on symbol to avoid conflicts
            const uniqueData = {};
            processedData.forEach(item => {
                const key = `${item.exchange}_${item.symbol}`;
                uniqueData[key] = item;
            });
            const deduplicatedData = Object.values(uniqueData);
            if (isDryRun) {
                console.log(`[DRY RUN] Would insert ${deduplicatedData.length} rows for ${exchange.slug} ${sector}`);
                // In dry run mode, log the first 3 records
                if (deduplicatedData.length > 0) {
                    console.log(`First 3 records that would be inserted:`);
                    deduplicatedData.slice(0, 3).forEach((record, index) => {
                        console.log(`  ${index + 1}. ${record.exchange} - ${record.symbol} (OI: $${record.oi_usd?.toLocaleString() || 'N/A'}, Volume 24h: $${record.volume_24h?.toLocaleString() || 'N/A'})`);
                    });
                }
            }
            else if (supabase) {
                // Insert data into Supabase
                const { data, error } = await supabase
                    .from('cex_derivatives_instruments')
                    .upsert(deduplicatedData, {
                    onConflict: 'exchange,symbol,ts'
                })
                    .select();
                if (error) {
                    console.error(`Error inserting ${sector} data for ${exchange.slug}:`, error);
                }
                else {
                    console.log(`Inserted ${data?.length} rows for ${exchange.slug} ${sector}`);
                    totalRowsInserted += data?.length || 0;
                }
            }
        }
        catch (error) {
            console.error(`Error processing ${exchange.slug} ${sector}:`, error);
        }
    }
    console.log(`CMC derivatives worker completed successfully. Total rows inserted: ${totalRowsInserted}`);
    return totalRowsInserted;
}
// Create a retryable version of the worker
const retryableWorker = (0, rest_worker_1.createRetryableWorker)(cmcDerivativesWorker);
// Run the worker if this file is executed directly
if (require.main === module) {
    retryableWorker()
        .then((rowCount) => {
        console.log(`Worker execution complete. Inserted ${rowCount} rows.`);
        process.exit(0);
    })
        .catch(error => {
        console.error('Worker execution failed:', error);
        process.exit(1);
    });
}
