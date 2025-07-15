# CanHav API

This directory contains the backend API services for the CanHav platform.

## Workers

### CoinMarketCap Derivatives Worker

The CoinMarketCap derivatives worker fetches derivatives data (futures and perpetuals combined) from the CoinMarketCap API and stores it in the Supabase database.

#### Setup

1. Make sure you have the required environment variables set:
   ```
   export COINMARKETCAP_API_KEY=your_api_key
   export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   export SUPABASE_SERVICE_ROLE_KEY=your_supabase_role_key
   ```

   Or add them to your `.env` file:
   ```
   COINMARKETCAP_API_KEY=your_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_role_key
   ```

2. Create the required table in Supabase:
   ```sql
   -- Run the migration script
   psql -U postgres -d your_database < migrations/create_cex_derivatives_instruments.sql
   ```

#### Usage

Run the worker with:

```bash
npx ts-node app/workers/cmcDerivativesWorker.ts
```

This will fetch derivatives data for Binance, OKX, and Bybit and store it in the `cex_derivatives_instruments` table.

#### Options

- `--dry-run`: Run the worker without inserting data into Supabase (useful for testing)
- `--debug`: Enable debug mode for more verbose logging
- `--use-id`: Use exchange IDs instead of slugs when querying the API
- `--sector=derivatives`: Specify the sector to fetch (currently only 'derivatives' is supported)

#### Example

```bash
# Dry run with debug output
npx ts-node app/workers/cmcDerivativesWorker.ts --dry-run --debug

# Production run
npx ts-node app/workers/cmcDerivativesWorker.ts
```

#### Cron Schedule

It's recommended to run this worker every 15 minutes to keep the data fresh.

Example crontab entry:
```
*/15 * * * * cd /path/to/app && npx ts-node app/workers/cmcDerivativesWorker.ts >> /var/log/cmc-derivatives.log 2>&1
```

#### Database Schema

The worker inserts data into the `cex_derivatives_instruments` table with the following schema:

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| ts | TIMESTAMP | Timestamp of the data |
| exchange | TEXT | Exchange name (e.g., 'binance') |
| symbol | TEXT | Trading pair symbol (e.g., 'BTC/USDT') |
| contract_type | TEXT | Type of contract ('derivatives') |
| oi_usd | NUMERIC | Open interest in USD |
| funding_rate | NUMERIC | Funding rate (if available) |
| volume_24h | NUMERIC | 24-hour trading volume in USD |
| index_price | NUMERIC | Current price in USD |
| symbol_base | TEXT | Base currency symbol (e.g., 'BTC') |
| symbol_quote | TEXT | Quote currency symbol (e.g., 'USDT') |
| cmc_market_id | INTEGER | CoinMarketCap market ID |

### Other Workers

[Documentation for other workers will be added here]
