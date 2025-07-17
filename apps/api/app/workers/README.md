{{ ... }}
# Derivatives Workers

This directory contains workers for fetching derivatives data from various sources and storing it in Supabase.

## Available Workers

- `cmcDerivativesWorker.ts`: Fetches CEX derivatives data from CoinMarketCap
- `hyperliquidDerivativesWorker.ts`: Fetches perpetuals data from Hyperliquid
- `dydxDerivativesWorker.ts`: Fetches perpetuals data from dYdX
- `dexDerivativesWorker.ts`: Combined worker that fetches data from both Hyperliquid and dYdX and stores it in the `dex_derivatives_instruments` table

## Environment Variables

All workers require the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://gxgmcrqcxfgmhvuborpa.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4Z21jcnFjeGZnbWh2dWJvcnBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ3MTEyNCwiZXhwIjoyMDY3MDQ3MTI0fQ.DMX_5Wb9vSkS5-BPd5yrB81tSS5ez3ww_Cdxk0w0vcE
```

The CoinMarketCap worker additionally requires:

```
COINMARKETCAP_API_KEY=ae313ebd-5527-45f3-941d-833c1ef51e9d
```

## Running Workers

You can run each worker individually:

```bash
# Run the DEX derivatives worker
npx ts-node app/workers/dexDerivativesWorker.ts

# Run with debug output
npx ts-node app/workers/dexDerivativesWorker.ts --debug

# Run in dry-run mode (fetches data but doesn't write to Supabase)
npx ts-node app/workers/dexDerivativesWorker.ts --dry-run
```

Or run all workers using the cron job:

```bash
npx ts-node app/workers/cron.ts
```

## Cron Schedule

The workers are scheduled to run every 5 minutes using the `cron.ts` file. This can be deployed as a standalone service or run as a background process.

## Database Tables

The workers write to the following tables:

- `cex_derivatives_instruments`: CEX derivatives data from CoinMarketCap
- `dex_derivatives_instruments`: DEX derivatives data from Hyperliquid and dYdX

## API Routes

The data can be accessed through the following API routes:

- `/api/derivatives/all`: Returns all CEX derivatives data
- `/api/crypto/dex-perps`: Returns all DEX perpetuals data

## Frontend Integration

The data is displayed on the following pages:

- `/research/cex-futures`: CEX futures data
- `/research/cex-perps`: CEX perpetuals data
- `/research/dex-perps`: DEX perpetuals data
{{ ... }}
